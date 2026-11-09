// Deterministic public material pages, sitemap and offline asset list. No dependencies.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { compassOutputs } from './compass-build.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const check = process.argv.includes('--check'), origin = 'https://unecstudentshub.com';
const sandbox = {}; vm.createContext(sandbox);
vm.runInContext(read('pdfs.js') + '\nthis.catalog = {data, extrasData, BASE, EXTRAS_BASE, PDF_TYPES};', sandbox);
const { data, extrasData, BASE, EXTRAS_BASE, PDF_TYPES } = sandbox.catalog;
const entries = new Map(), outputs = new Map();
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
for (const [course, d] of Object.entries(data)) for (const [subject, s] of Object.entries(d.subjects)) for (const p of s.pdfs) {
  entries.set('pdf/' + p.file, entries.get('pdf/' + p.file) || { ...p, course, subject, code: p.code || s.code, kind: 'pdf', url: BASE + 'pdf/' + p.file });
}
for (const [course, list] of Object.entries(extrasData)) for (const p of list) entries.set('pdf-extra/' + p.file, { ...p, course, kind: 'extra', subject: 'Əlavə material', url: EXTRAS_BASE + p.file });
const slug = m => (m.kind === 'extra' ? 'extra-' : '') + m.file.replace(/\.pdf$/i, '');
const href = m => '/materials/' + encodeURIComponent(slug(m)) + '/';
const app = m => m.kind === 'extra' ? `/#/x/${encodeURIComponent(m.course)}/${encodeURIComponent(m.file)}` : `/#/m/${encodeURIComponent(m.course)}/${encodeURIComponent(m.subject)}/${encodeURIComponent(m.file)}`;
function page(title, description, canonical, body, schema) {
  return `<!doctype html>
<html lang="az"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} | UNEC Students Hub</title><meta name="description" content="${esc(description)}">
<link rel="canonical" href="${origin}${canonical}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${origin}${canonical}"><meta property="og:image" content="${origin}/images/og-image.png"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/images/favicon.svg"><link rel="stylesheet" href="/styles/material-pages.css">
${schema ? `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>` : ''}</head>
<body><header><a href="/">UNEC Students Hub</a><a href="/materials/">Materiallar</a></header><main>${body}</main><footer>Müstəqil tələbə platforması. Universitetin rəsmi saytı deyil. <a href="mailto:unecstudentshub@gmail.com">Əlaqə</a></footer></body></html>
`;
}
const ordered = [...entries.values()].sort((a, b) => Date.parse(b.addedAt) - Date.parse(a.addedAt));
const paths = new Set();
for (const m of ordered) {
  const dest = 'materials/' + slug(m) + '/index.html';
  if (paths.has(dest) || /[\\/]/.test(slug(m))) throw new Error('Invalid or duplicate material slug: ' + m.file);
  paths.add(dest);
  if (!Number.isFinite(Date.parse(m.addedAt))) throw new Error('Missing material timestamp: ' + m.file);
  const type = PDF_TYPES[m.pdfType]?.label || 'PDF';
  const description = `${m.subject} — ${m.course}. ${type}: ${m.name}. Materiala bax, PDF faylını aç və ya endir.`;
  const related = ordered.filter(p => p !== m && p.course === m.course && p.subject === m.subject).slice(0, 3);
  outputs.set(dest, page(m.name, description, href(m), `<nav aria-label="Səhifə yolu"><a href="/materials/">Materiallar</a> / ${esc(m.subject)}</nav><h1>${esc(m.name)}</h1><p>${esc(description)}</p><dl><dt>Kurs</dt><dd>${esc(m.course)}</dd><dt>Fənn</dt><dd>${esc(m.subject)}</dd><dt>Fayl</dt><dd>${esc(m.file)}</dd><dt>Növ</dt><dd>${esc(type)}</dd>${m.code ? `<dt>Fənn şifri</dt><dd>${esc(m.code)}</dd>` : ''}<dt>Əlavə olunub</dt><dd><time datetime="${esc(m.addedAt)}">${esc(m.addedAt.slice(0, 10))}</time></dd></dl><div class="actions"><a class="primary" href="${esc(app(m))}">Saytda materiala bax</a><a href="${esc(m.url)}" target="_blank" rel="noopener">PDF-i aç / endir</a></div>${related.length ? '<h2>Həmin fənnin materialları</h2><ul>' + related.map(p => `<li><a href="${href(p)}">${esc(p.name)}</a></li>`).join('') + '</ul>' : ''}`, {
    '@context': 'https://schema.org', '@type': 'LearningResource', name: m.name, description, url: origin + href(m), inLanguage: 'az', learningResourceType: type,
    encoding: { '@type': 'MediaObject', contentUrl: m.url, encodingFormat: 'application/pdf' }, publisher: { '@type': 'Organization', name: 'UNEC Students Hub' }
  }));
}
outputs.set('materials/index.html', page('Dərs materialları', 'UNEC tələbələri üçün fənlər üzrə PDF dərs və imtahan materialları.', '/materials/', '<h1>Dərs materialları</h1><p>Ən yeni materiallar əvvəl göstərilir. Fənn üzrə axtarış və filtrlər üçün <a href="/#/courses/all">material kataloqunu aç</a>.</p><ul class="catalog">' + ordered.map(m => `<li><a href="${href(m)}">${esc(m.name)}</a><small>${esc(m.course)} · ${esc(m.subject)}</small></li>`).join('') + '</ul>'));
const compass = compassOutputs(root);
for (const [file, content] of compass.outputs) outputs.set(file, content);
outputs.set('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ['/', '/materials/', ...ordered.map(href), '/compass/', ...compass.articles.map(a => '/compass/' + a.id + '/')].map(p => `  <url><loc>${esc(origin + p)}</loc></url>`).join('\n') + '\n</urlset>\n');
const html = read('index.html'), assets = new Set(['/', '/index.html', '/manifest.json']);
for (const match of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"#]+)"/g)) {
  const url = match[1]; if (/^(?:https?:|\/\/)/.test(url)) continue;
  if (!outputs.has(url.split('?')[0].replace(/^\//, '')) && !fs.existsSync(path.join(root, url.split('?')[0]))) throw new Error('Missing local asset: ' + url);
  assets.add('/' + url.replace(/^\//, ''));
}
for (const file of fs.readdirSync(path.join(root, 'images'))) if (/\.(png|svg|webp|ico)$/.test(file)) assets.add('/images/' + file);
const sorted = [...assets].sort(), hash = crypto.createHash('sha256');
for (const url of sorted) {
  const file = url === '/' ? 'index.html' : url.slice(1).split('?')[0];
  hash.update(url); hash.update(outputs.has(file) ? outputs.get(file) : fs.readFileSync(path.join(root, file)));
}
hash.update(read('sw.js'));
outputs.set('offline-assets.js', '// Generated by tools/build-site.mjs. Public assets only.\nself.UNEC_OFFLINE = ' + JSON.stringify({ version: hash.digest('hex').slice(0, 16), assets: sorted }, null, 2) + ';\n');
let stale = false;
for (const [file, content] of outputs) {
  if (fs.existsSync(path.join(root, file)) && read(file) === content) continue;
  if (check) { console.error('Out of date: ' + file); stale = true; }
  else { fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true }); fs.writeFileSync(path.join(root, file), content); }
}
const currentDirs = fs.existsSync(path.join(root, 'materials')) ? fs.readdirSync(path.join(root, 'materials'), { withFileTypes: true }).filter(d => d.isDirectory()) : [];
for (const dir of currentDirs) if (!paths.has('materials/' + dir.name + '/index.html')) {
  if (check) { console.error('Obsolete material page: ' + dir.name); stale = true; }
  else fs.rmSync(path.join(root, 'materials', dir.name), { recursive: true });
}
const compassDirs = fs.existsSync(path.join(root, 'compass')) ? fs.readdirSync(path.join(root, 'compass'), { withFileTypes: true }).filter(d => d.isDirectory()) : [];
for (const dir of compassDirs) if (!compass.outputs.has('compass/' + dir.name + '/index.html')) {
  if (check) { console.error('Obsolete Compass page: ' + dir.name); stale = true; }
  else fs.rmSync(path.join(root, 'compass', dir.name), { recursive: true });
}
if (stale) process.exitCode = 1;
else console.log(`${check ? 'Verified' : 'Generated'} ${ordered.length} material pages, ${compass.articles.length} Compass articles, sitemap and ${sorted.length} offline assets.`);
