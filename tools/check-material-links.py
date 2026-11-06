#!/usr/bin/env python3
"""Check real catalog URLs without downloading PDFs. Retry transient CDN failures."""
import concurrent.futures
import json
from pathlib import Path
import subprocess
import time
import urllib.error
import urllib.request
import urllib.parse

ROOT = Path(__file__).resolve().parents[1]
script = "const fs=require('node:fs'),vm=require('node:vm'),c={};vm.createContext(c);vm.runInContext(fs.readFileSync('pdfs.js','utf8')+';this.c={data,extrasData,BASE,EXTRAS_BASE}',c);let urls=new Set();for(const d of Object.values(c.c.data))for(const s of Object.values(d.subjects))for(const p of s.pdfs)urls.add(c.c.BASE+'pdf/'+p.file);for(const a of Object.values(c.c.extrasData))for(const p of a)urls.add(c.c.EXTRAS_BASE+p.file);console.log(JSON.stringify([...urls]));"
HEADERS = {'User-Agent': 'Mozilla/5.0 (compatible; UNEC-Material-Checker/1.0)', 'Origin': 'https://unecstudentshub.com'}


def check(url):
    parts = urllib.parse.urlsplit(url)
    url = urllib.parse.urlunsplit(parts._replace(path=urllib.parse.quote(parts.path, safe='/%')))
    status = 'network error'
    for attempt in range(3):
        for method in ('HEAD', 'GET'):
            try:
                headers = {**HEADERS, **({'Range': 'bytes=0-0'} if method == 'GET' else {})}
                req = urllib.request.Request(url, method=method, headers=headers)
                with urllib.request.urlopen(req, timeout=25) as response:
                    status = response.status
                    if status in (200, 206):
                        content_type = response.headers.get('Content-Type', '').lower()
                        return (url, None if 'text/html' not in content_type else 'HTML instead of PDF')
            except urllib.error.HTTPError as e:
                status = e.code
            except (OSError, urllib.error.URLError, TimeoutError) as e:
                status = type(e).__name__
        if attempt < 2:
            time.sleep(attempt + 1)
    return url, status


if __name__ == '__main__':
    urls = json.loads(subprocess.check_output(['node', '-e', script], cwd=ROOT, text=True))
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        results = list(pool.map(check, urls))
    failures = [(url, error) for url, error in results if error]
    for url, error in failures:
        print(f'{error}: {url}')
    print(f'{len(urls) - len(failures)}/{len(urls)} catalog files available.')
    raise SystemExit(bool(failures))
