'use strict';

function parseCareerText(text) {
  const fields = {};
  const warnings = new Set();
  const lines = text.normalize('NFC').trim().split(/\r?\n/);
  const clean = line => line.replace(/^[\p{Extended_Pictographic}\uFE0F\s*]+|[\s*]+$/gu, '');
  const labels = [
    ['deadline', /^(?:son (?:(?:müraciət|qeydiyyat)(?: tarixi)?|tarix)|(?:müraciət|qeydiyyat) üçün son tarix|application deadline|deadline)\s*:/iu],
    ['applyUrl', /^(?:(?:qeydiyyat|müraciət)(?: üçün)? (?:linki|keçidi)|(?:qeydiyyat|müraciət) üçün|application (?:link|url)|apply here)\s*:/iu],
    ['schedule', /^(?:tarix(?: və saat)?|proqramın (?:tarixi|müddəti)|tədbirin tarixi|schedule)\s*:/iu],
    ['location', /^(?:məkan|ünvan|yer|location|venue)\s*:/iu],
    ['company', /^(?:təşkilat(?:çı)?|şirkət|qurum|company|organiser|organizer)\s*:/iu],
    ['title', /^(?:başlıq|proqramın adı|title)\s*:/iu],
  ];
  const monthNames = 'yanvar fevral mart aprel may iyun iyul avqust sentyabr oktyabr noyabr dekabr'.split(' ');
  const toIso = (year, month, day) => {
    const date = [year, month, day].map((part, index) => String(part).padStart(index ? 2 : 4, '0')).join('-');
    const time = new Date(date);
    return Number.isFinite(+time) && time.toISOString().slice(0, 10) === date ? date : '';
  };
  const parseDate = value => {
    const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})(?!\d)/);
    if (iso) return toIso(iso[1], iso[2], iso[3]);
    const numeric = value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?!\d)/);
    if (numeric) return toIso(numeric[3], numeric[2], numeric[1]);
    const named = value.toLocaleLowerCase('az').match(/^(\d{1,2})\s+([\p{L}]+)\s+(\d{4})(?!\d)/u);
    const month = named && monthNames.indexOf(named[2]) + 1;
    return month ? toIso(named[3], month, named[1]) : '';
  };
  const links = value => [...new Set((value.match(/https:\/\/[^\s<>"'“”]+/giu) || [])
    .map(url => url.replace(/[.,;!?*)\]}»]+$/u, ''))
    .filter(url => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:' && !parsed.username && !parsed.password;
      } catch { return false; }
    }))];

  const details = [];
  let hasApplicationLabel = false;
  for (let index = 0; index < lines.length; index++) {
    const line = clean(lines[index]);
    const label = labels.find(([, pattern]) => pattern.test(line));
    if (!label) {
      details.push(lines[index]);
      continue;
    }
    const [field, pattern] = label;
    let value = clean(line.replace(pattern, ''));
    const onNextLine = field === 'applyUrl' && !value && /^https:\/\//i.test(clean(lines[index + 1] || ''));
    if (onNextLine) value = clean(lines[index + 1]);
    if (field === 'deadline') {
      value = parseDate(value);
      if (!value) warnings.add('Son müraciət tarixini formaya əl ilə daxil et.');
    } else if (field === 'applyUrl') {
      hasApplicationLabel = true;
      const urls = links(value);
      value = urls.length === 1 ? urls[0] : '';
      if (!value) warnings.add('Müraciət linkini yoxla və uyğun HTTPS linkini seç.');
    }
    if (value && (!fields[field] || fields[field] === value)) {
      fields[field] = value;
      if (onNextLine) index++;
    } else {
      if (fields[field] && value) warnings.add('Təkrarlanan məlumatı yoxla.');
      details.push(lines[index]);
    }
  }

  const heading = clean(details[0] || '');
  if (!fields.title && heading && heading.length <= 300 && !/^(?:https?:|#)|\.$/iu.test(heading)) {
    fields.title = heading;
    details.shift();
  }
  if (fields.title) {
    const company = fields.title.match(/^([^“«"]{1,100}?)\s+(?=[“«"])/u)?.[1].trim();
    if (!fields.company && company) fields.company = company;
    if (company && company === fields.company) fields.title = fields.title.slice(company.length).trim();
    fields.title = fields.title.replace(/\s+(?:qeydiyyat|müraciət)(?:lar)?\s+başla(?:dı|yıb)!?$/iu, '')
      .replace(/(proqramı)n[aeə]$/iu, '$1');
  }
  fields.description = details.join('\n').trim();
  if (!hasApplicationLabel) {
    const urls = links(fields.description);
    if (urls.length === 1) fields.applyUrl = urls[0];
    if (urls.length > 1) warnings.add('Mətndə bir neçə link var. Müraciət üçün nəzərdə tutulan linki seç.');
  }

  const dateRange = /\d{1,2}(?:\s+[\p{L}]+)?\s*[-–—]\s*\d{1,2}\s+[\p{L}]+\s+\d{4}(?:-cü|-ci|-cu|-cı)?(?:\s+il)?/u;
  if (!fields.schedule) {
    const programme = details.find(line => dateRange.test(line) && /proqram|təcrübə|tədbir|layihə/iu.test(line)
      && !/müraciət|qeydiyyat|son tarix/iu.test(line));
    if (programme) fields.schedule = programme.match(dateRange)[0];
  }

  const classify = patterns => {
    const match = value => Object.entries(patterns).filter(([, pattern]) => pattern.test(value));
    const headingMatches = match(fields.title || '');
    const matches = headingMatches.length ? headingMatches : match(fields.description);
    return matches.length === 1 ? matches[0][0] : '';
  };
  fields.type = classify({ internship: /təcrübə proqram|istehsalat təcrübə|\binternship\b/iu,
    volunteer: /könüllülük|könüllülər|\bvolunteer\b/iu, training: /təlim proqram|^təlim\s|\btraining\b/iu });
  fields.category = classify({ bank: /(?:^|\s)bank(?:\s|[ıi.,]|$)/iu, finance: /maliyyə|\bfinance\b/iu,
    audit: /audit|mühasibat/iu, it: /(?:^|[^\p{L}])(?:İT|IT)(?=$|[^\p{L}])|texnologiya|proqramlaşdırma|\bsoftware\b/u });
  return { fields, warnings: [...warnings] };
}
