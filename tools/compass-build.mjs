import fs from 'node:fs';
import path from 'node:path';

const categories = {
  admissions: 'Qəbul və qeydiyyat', 'first-year': 'Universitetə ilk addım', documents: 'Sənədlər və müraciətlər',
  finance: 'Pul və təhsil xərcləri', work: 'Təhsil və iş', campus: 'Kampus həyatı', exchange: 'Xaricdə təhsil',
  rights: 'Tələbə hüquqları', military: 'Hərbi xidmətdən möhlət'
};
const officialDomains = ['unec.edu.az', 'dim.gov.az', 'edu.gov.az', 'portal.edu.az', 'eatda.edu.az', 'ttkf.edu.az', 'e-ttkf.edu.az',
  'e-qanun.az', 'cbar.az', 'demx.gov.az', 'sosial.gov.az', 'erasmusplus.org.az'];
const pair = value => value && ['az', 'en'].every(lang => typeof value[lang] === 'string' && value[lang].trim());
export function validateCompass(articles) {
  if (!Array.isArray(articles) || !articles.length) throw new Error('Compass articles are missing.');
  const seen = new Set();
  for (const a of articles) {
    const fail = message => { throw new Error(`Compass ${a.id || '(no id)'}: ${message}`); };
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(a.id) || seen.has(a.id)) fail('invalid or duplicate id');
    seen.add(a.id);
    if (!Object.hasOwn(categories, a.category)) fail('unknown category');
    if (!Array.isArray(a.audience) || !a.audience.length || a.audience.some(value => !['student', 'applicant'].includes(value))) fail('invalid audience');
    if (!pair(a.title) || !pair(a.summary)) fail('both languages are required');
    if (!/^[a-z0-9-]+$/.test(a.icon) || !Number.isInteger(a.readMinutes) || a.readMinutes < 1) fail('invalid metadata');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(a.updatedAt) || !Number.isFinite(Date.parse(a.updatedAt)) || new Date(a.updatedAt).toISOString().slice(0, 10) !== a.updatedAt) fail('invalid update date');
    if (!Array.isArray(a.sections) || a.sections.length < 2 || a.sections.some(s => !pair(s.heading) || !Array.isArray(s.paragraphs) || !s.paragraphs.length || s.paragraphs.some(p => !pair(p)) || (s.bullets && (!Array.isArray(s.bullets) || s.bullets.some(p => !pair(p)))))) fail('incomplete bilingual sections');
    if (!Array.isArray(a.steps) || a.steps.length < 3 || a.steps.some(s => !pair(s))) fail('action steps are required');
    if (!Array.isArray(a.sources) || !a.sources.length) fail('official sources are required');
    for (const source of a.sources) {
      if (!pair(source.title)) fail('source title needs both languages');
      let url; try { url = new URL(source.url); } catch (_) { fail('invalid source URL'); }
      if (url.protocol !== 'https:' || url.username || url.password || !officialDomains.some(domain => url.hostname === domain || url.hostname.endsWith('.' + domain))) fail('source must use an approved official HTTPS domain');
    }
  }
  return articles;
}
export function loadCompass(root) {
  return validateCompass(['data/compass-applicants.json', 'data/compass-students.json'].flatMap(file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))));
}

export function compassOutputs(root) {
  const articles = loadCompass(root), outputs = new Map(), origin = 'https://unecstudentshub.com';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function page(title, summary, url, body, schema) {
    return `<!doctype html>
<html lang="az"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | Tələbə Kompası</title><meta name="description" content="${esc(summary)}"><link rel="canonical" href="${origin}${url}"><meta property="og:type" content="${schema ? 'article' : 'website'}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(summary)}"><meta property="og:url" content="${origin}${url}"><meta property="og:image" content="${origin}/images/og-image.png"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/images/favicon.svg"><link rel="stylesheet" href="/styles/material-pages.css"><link rel="stylesheet" href="/styles/compass-public.css">${schema ? `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>` : ''}</head>
<body><header><a href="/">UNEC Students Hub</a><a href="/compass/">Tələbə Kompası</a></header><main>${body}</main><footer>Müstəqil tələbə platforması. Qaydaları və tarixləri müraciətdən əvvəl rəsmi mənbədən yoxla. <a href="mailto:unecstudentshub@gmail.com">Əlaqə</a></footer></body></html>
`;
  }
  for (const a of articles) {
    const href = '/compass/' + a.id + '/';
    const related = articles.filter(other => other.id !== a.id && other.category === a.category).slice(0, 3);
    const sections = a.sections.map(s => `<section><h2>${esc(s.heading.az)}</h2>${s.paragraphs.map(p => `<p>${esc(p.az)}</p>`).join('')}${s.bullets?.length ? '<ul>' + s.bullets.map(p => `<li>${esc(p.az)}</li>`).join('') + '</ul>' : ''}</section>`).join('');
    outputs.set('compass/' + a.id + '/index.html', page(a.title.az, a.summary.az, href,
      `<nav aria-label="Səhifə yolu"><a href="/compass/">Tələbə Kompası</a> / ${esc(categories[a.category])}</nav><h1>${esc(a.title.az)}</h1><p class="compass-public-lead">${esc(a.summary.az)}</p><p class="compass-public-meta">${a.readMinutes} dəqiqəlik oxu · Yenilənib: <time datetime="${a.updatedAt}">${a.updatedAt}</time></p><div class="actions"><a class="primary" href="/#/compass/${a.id}">Saytda oxu / Read in app</a></div>${sections}<section class="compass-public-steps"><h2>Növbəti addımlar</h2><ol>${a.steps.map(s => `<li>${esc(s.az)}</li>`).join('')}</ol></section><section><h2>Rəsmi mənbələr</h2><ul>${a.sources.map(source => `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title.az)}</a></li>`).join('')}</ul><p>Tarix və şərtlər dəyişə bilər. Müraciətdən əvvəl rəsmi elanı və sənəd siyahısını yoxla.</p></section>${related.length ? '<section><h2>Əlaqəli məqalələr</h2><ul>' + related.map(other => `<li><a href="/compass/${other.id}/">${esc(other.title.az)}</a></li>`).join('') + '</ul></section>' : ''}`,
      { '@context': 'https://schema.org', '@type': 'Article', headline: a.title.az, description: a.summary.az, dateModified: a.updatedAt,
        inLanguage: 'az', url: origin + href, isAccessibleForFree: true, author: { '@type': 'Organization', name: 'UNEC Students Hub' },
        publisher: { '@type': 'Organization', name: 'UNEC Students Hub' }, mainEntityOfPage: origin + href }));
  }
  outputs.set('compass/index.html', page('Tələbə Kompası', 'Tələbələr və abituriyentlər üçün praktik məqalələr və rəsmi mənbələr.', '/compass/',
    '<h1>Tələbə Kompası</h1><p>Tələbələr və abituriyentlər üçün praktik məlumatlar. <a href="/#/compass">Axtarış, filtrlər və saxlanılan məqalələr üçün saytda aç.</a></p>' + Object.entries(categories).map(([id, label]) => '<section><h2>' + esc(label) + '</h2><ul class="catalog">' + articles.filter(a => a.category === id).map(a => `<li><a href="/compass/${a.id}/">${esc(a.title.az)}</a><small>${esc(a.summary.az)}</small></li>`).join('') + '</ul></section>').join('')));
  outputs.set('data/compass-catalog.js', '// Generated by tools/build-site.mjs from the bilingual Compass source files.\nwindow.UNEC_COMPASS_DATA = ' + JSON.stringify(articles, null, 2).replace(/</g, '\\u003c') + ';\n');
  return { articles, outputs };
}
