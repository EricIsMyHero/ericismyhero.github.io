#!/usr/bin/env python3
"""Import UNEC Forma 1 tables without guessing ambiguous rows or replacing good data on failure."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import tempfile
from urllib.parse import urlsplit, unquote, quote

ROOT = Path(__file__).resolve().parents[1]
CODE = r'\d{5}(?:_\d+)?'
SECTION_NAMES = {
    'Ümumi fənlər': 'general',
    'Seçmə fənlər (ümumi fənlər üzrə)': 'generalElectives',
    'İxtisas fənləri': 'major',
    'Seçmə fənlər (ixtisas fənləri üzrə)': 'majorElectives',
    'TƏCRÜBƏ': 'practice',
}


def clean(value):
    value = re.sub(r'(?<=\w)-\n(?=\w)', '', value or '')
    return re.sub(r'\s+', ' ', value).strip()


def semester(value):
    match = re.fullmatch(r'([PY])\s*[-–—−]\s*([1-4])', clean(value))
    if not match:
        raise ValueError(f'Unknown semester: {value!r}')
    return (int(match[2]) - 1) * 2 + (1 if match[1] == 'P' else 2)


def parse_tables(pages):
    rows, section, stated_total = [], None, None
    ordinals = {}
    for page_number, tables in enumerate(pages, 1):
        for table in tables:
            for raw in table:
                cells = [value for value in raw if value is not None]
                text = clean(' '.join(cells))
                if 'Cəmi' in cells:
                    index = cells.index('Cəmi')
                    if index + 1 < len(cells) and cells[index + 1].isdigit():
                        stated_total = int(cells[index + 1])
                heading = next((name for name in SECTION_NAMES if name in cells), None)
                if heading:
                    section = SECTION_NAMES[heading]
                    continue
                # Some merged serial-number cells introduce extra empty columns.
                if len(cells) > 14:
                    code_index = next((i for i, value in enumerate(cells) if re.fullmatch(CODE, clean(value))), None)
                    if code_index and all(not value for value in cells[1:code_index]):
                        name_index = code_index + 1
                        while name_index < len(cells) and not cells[name_index]:
                            name_index += 1
                        cells = [cells[0], cells[code_index]] + cells[name_index:]
                if len(cells) != 14:
                    continue
                cells[1] = re.sub(r'(?m)^\s*\d+\.\s*(?=\d{5})', '', cells[1])
                if not cells[0] and cells[2] and not any(cells[3:]) and rows:
                    # A subject name can continue at the top of the next page.
                    rows[-1]['name'] += ' ' + clean(cells[2])
                    rows[-1]['codes'] += [code for code in re.findall(CODE, cells[1]) if code not in rows[-1]['codes']]
                    continue
                if not re.fullmatch(CODE + r'\*?(?:\s+' + CODE + r'\*?)*', clean(cells[1])):
                    continue
                if not section:
                    raise ValueError(f'Unidentified table section on page {page_number}')
                row_section = 'practice' if re.match(r'^(?:Təcrübə|Buraxılış işi)$', clean(cells[2])) else section
                warnings = []
                raw_codes = re.findall(CODE, cells[1])
                codes = list(dict.fromkeys(raw_codes))
                if len(codes) != len(raw_codes):
                    warnings.append('repeated-code-in-source')
                elective = row_section.endswith('Electives')
                if not elective and len(codes) != 1:
                    raise ValueError('Duplicate or ambiguous subject codes')
                if row_section == 'practice' and cells[4] == cells[5]:
                    cells[6] = cells[6] or '0'
                    cells[13] = cells[13] or '0'
                numbers = [int(cells[index]) for index in (3, 4, 5, 6, 13)]
                credit, total_hours, independent, hours, weekly = numbers
                if not (1 <= credit <= 30 and total_hours == credit * 30
                        and 0 <= hours <= 180 and hours % 15 == 0 and 0 <= weekly <= 12):
                    raise ValueError(f'Inconsistent hours or credits for {codes}')
                if independent + hours != total_hours or weekly * 15 != hours:
                    warnings.append('inconsistent-hours-in-source')
                ordinal = int(cells[0]) if cells[0].isdigit() else ordinals.get(row_section, 0) + 1
                ordinals[row_section] = ordinal
                rows.append({
                    'section': row_section, 'ordinal': ordinal, 'codes': codes,
                    'name': clean(cells[2]), 'credit': credit, 'hours': hours,
                    'weekly': weekly, 'semester': semester(cells[12]),
                    'prereq': re.findall(CODE, cells[10]), 'page': page_number,
                    **({'warnings': warnings} if warnings else {}),
                })
    if stated_total != 240 or sum(row['credit'] for row in rows) != stated_total:
        raise ValueError('The extracted plan does not match the stated 240-credit total')
    if {row['section'] for row in rows} != set(SECTION_NAMES.values()):
        raise ValueError('One or more curriculum sections are missing')
    for number in range(1, 9):
        if sum(row['credit'] for row in rows if row['semester'] == number) != 30:
            raise ValueError(f'Semester {number} does not add up to 30 credits; review this PDF before importing')
    identities = [(row['section'], tuple(row['codes'])) for row in rows]
    if len(identities) != len(set(identities)):
        raise ValueError('Repeated table rows')
    return rows


def page_tables(page):
    """Read full merged subject cells even when inner borders split their first line."""
    tables = []
    for table in page.find_tables():
        normalized, covered = [], -1
        for raw, geometry in zip(table.extract(), table.rows):
            values = [(value, box) for value, box in zip(raw, geometry.cells) if value is not None]
            if not values:
                continue
            top = min(box[1] for value, box in values)
            if top < covered - 1:
                continue
            code_index = next((i for i,(value,box) in enumerate(values) if re.fullmatch(CODE+r'\*?(?:\s+'+CODE+r'\*?)*', clean(re.sub(r'(?m)^\s*\d+\.\s*(?=\d{5})','',value)))), None)
            credit_index = next((i for i in range((code_index or 0)+1,len(values)-1) if values[i][0].isdigit() and values[i+1][0].isdigit() and 1<=int(values[i][0])<=30 and int(values[i+1][0])==int(values[i][0])*30), None)
            if code_index is not None and credit_index is not None and len(values)-credit_index==11:
                code, box = values[code_index]
                name_box=(box[2],box[1],values[credit_index][1][0],box[3])
                crop=page.crop(name_box)
                name=crop.extract_text() or ''
                codes=re.findall(CODE,re.sub(r'(?m)^\s*\d+\.\s*(?=\d{5})','',code))
                if len(codes)>1 and not re.match(r'^\s*1\s*\.',name):
                    lines=crop.extract_text_lines();groups=[]
                    for line in lines:
                        if not groups or line['top']-groups[-1][-1]['top']>1.6*(line['bottom']-line['top']):groups.append([])
                        groups[-1].append(line)
                    if len(groups)==len(set(codes)):
                        name='\n'.join(str(i+1)+'.'+clean(' '.join(line['text'] for line in group)) for i,group in enumerate(groups))
                normalized.append([values[0][0],code,name]+[value for value,box in values[credit_index:]])
                covered=box[3]
            else:
                normalized.append(raw)
        tables.append(normalized)
    return tables


def extract(path, filename, source_url=None):
    import pdfplumber  # Optional import tool dependency, not a website runtime dependency.
    content = path.read_bytes()
    if not content.startswith(b'%PDF-') or len(content) > 10 * 1024 * 1024:
        raise ValueError('Expected a PDF no larger than 10 MiB')
    with pdfplumber.open(path) as pdf:
        if not 1 <= len(pdf.pages) <= 20:
            raise ValueError('Unexpected curriculum page count')
        title = pdf.pages[0].extract_text() or ''
        code = re.search(r'\b(600\d{4})\s*[-–]', title)
        if not code or not filename.startswith(code[1] + '-'):
            raise ValueError('The filename and PDF specialty code do not match')
        rows = parse_tables([page_tables(page) for page in pdf.pages])
    return {
        'specialtyCode': code[1], 'file': filename, 'url': source_url,
        'sha256': hashlib.sha256(content).hexdigest(), 'rows': rows,
    }


def major_codes():
    script = "const fs=require('fs'),vm=require('vm'),c={window:{addEventListener(){}}};vm.createContext(c);vm.runInContext(fs.readFileSync('scripts/curriculum.js','utf8')+';this.codes=CURRICULUM_CODES',c);console.log(JSON.stringify(Object.fromEntries(Object.entries(c.codes).map(([k,v])=>[v.specialtyCode,k]))));"
    codes = json.loads(subprocess.check_output(['node', '-e', script], cwd=ROOT, text=True))
    definitions = json.loads((ROOT / 'data/curriculum-sources.json').read_text()).get('majorDefinitions', {})
    codes.update({value['code']: key for key, value in definitions.items()})
    return codes


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--file', action='append', default=[], type=Path, help='Local original PDF (repeatable)')
    parser.add_argument('--url', action='append', default=[], help='Public HTTPS source PDF URL (repeatable)')
    parser.add_argument('--all', action='store_true', help='Fetch every PDF in data/curriculum-sources.json')
    parser.add_argument('--output', type=Path, default=ROOT / 'data/curriculum-pdf.json')
    args = parser.parse_args()
    expected = {}
    if args.all:
        manifest = json.loads((ROOT / 'data/curriculum-sources.json').read_text())
        if manifest.get('version') != 1:
            raise ValueError('Unsupported source manifest version')
        for key, filename in manifest['files'].items():
            if '/' in filename or '\\' in filename:
                raise ValueError('Invalid source filename')
            url = manifest['baseUrl'].rstrip('/') + '/' + quote(filename)
            expected[url] = key
            args.url.append(url)
    if not args.file and not args.url:
        parser.error('Provide --file, --url or --all')
    codes, pending = major_codes(), {}
    with tempfile.TemporaryDirectory() as temp:
        inputs = [(path, path.name, None) for path in args.file]
        for index, url in enumerate(args.url):
            parts = urlsplit(url)
            if parts.scheme != 'https' or parts.username or parts.password or not parts.hostname:
                raise ValueError('Sources must be public HTTPS URLs without credentials')
            filename = unquote(parts.path.rsplit('/', 1)[-1])
            path = Path(temp) / f'{index}.pdf'
            subprocess.run(['curl', '--fail', '--silent', '--show-error', '--max-time', '45',
                            '--max-filesize', str(10 * 1024 * 1024), '--proto', '=https', '-o', str(path), url], check=True)
            inputs.append((path, filename, url))
        for path, filename, url in inputs:
            plan = extract(path, filename, url)
            key = codes.get(plan['specialtyCode'])
            if not key or key in pending or (url in expected and expected[url] != key):
                raise ValueError('Unknown or duplicate specialty')
            pending[key] = plan
            definition = json.loads((ROOT / 'data/curriculum-sources.json').read_text()).get('majorDefinitions', {}).get(key)
            if definition:
                plan.update({field: definition[field] for field in ('name', 'icon')})
            print(f'{key}: {len(plan["rows"])} curriculum rows, 8 semesters, 240 credits verified')
    output = json.loads(args.output.read_text()) if args.output.exists() else {'version': 1, 'plans': {}}
    if output.get('version') != 1:
        raise ValueError('Unsupported import file version')
    output['plans'].update(pending)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    temporary = args.output.with_suffix('.tmp')
    temporary.write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(args.output)
    print(f'Saved {args.output.name}. Run node tools/build-site.mjs before publishing.')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, ImportError, subprocess.CalledProcessError) as error:
        raise SystemExit(f'Import stopped; previous data was preserved: {error}') from error
