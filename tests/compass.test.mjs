import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { loadCompass, validateCompass, compassOutputs } from '../tools/compass-build.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const articles = loadCompass(root);

test('Compass publishes bilingual student and applicant guidance with official sources and concrete next steps', () => {
  assert.equal(new Set(articles.map(a => a.category)).size, 9);
  assert.ok(articles.some(a => a.audience.includes('applicant')));
  assert.ok(articles.some(a => a.audience.includes('student')));
  assert.ok(articles.every(a => a.steps.length >= 3 && a.sources.length));
  for (const a of articles) {
    const invalid = structuredClone(a); invalid.sections[0].paragraphs[0].en = '';
    assert.throws(() => validateCompass([invalid]), /bilingual sections/);
  }
});

test('Compass validation rejects unsafe, misleading or incomplete publication data', () => {
  for (const url of ['javascript:alert(1)', 'http://unec.edu.az/', 'https://unec.edu.az.evil.example/', 'https://user:password@unec.edu.az/']) {
    const invalid = structuredClone(articles[0]); invalid.sources[0].url = url;
    assert.throws(() => validateCompass([invalid]), /HTTPS domain/);
  }
  assert.throws(() => validateCompass([articles[0], articles[0]]), /duplicate id/);
  const invalid = structuredClone(articles[0]); invalid.updatedAt = '2026-02-30';
  assert.throws(() => validateCompass([invalid]), /update date/);
});

function fixture(records = articles) {
  const store = new Map(), rootElement = { innerHTML: '', querySelector: () => null };
  const U = { esc: s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    ic: name => `<svg data-icon="${name}"></svg>`, normAz: s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ə/g, 'e').replace(/ı/g, 'i').replace(/\s+/g, ' ').trim() };
  const context = { window: { UNEC: U, UNEC_COMPASS_DATA: records, addEventListener() {} },
    document: { addEventListener() {}, getElementById: () => rootElement }, lang: 'az', URL, URLSearchParams,
    requestAnimationFrame: callback => callback(), localStorage: { getItem: key => store.get(key) || null } };
  vm.createContext(context); vm.runInContext(fs.readFileSync(new URL('../scripts/compass.js', import.meta.url), 'utf8'), context);
  return { U, rootElement };
}

test('Compass search supports AZ spelling, English and multi-word queries across article content', () => {
  const { U } = fixture();
  assert.ok(U.searchCompass('herbi mohlet').some(a => a.id === 'tehsil-ve-herbi-mohlet'));
  assert.ok(U.searchCompass('military deferment').some(a => a.id === 'tehsil-ve-herbi-mohlet'));
  assert.ok(U.searchCompass('transkript').some(a => a.id === 'arayis-transkript-ve-muraciet'));
  assert.equal(U.searchCompass('zzzz-no-topic').length, 0);
  assert.equal(U.searchCompass('   ').length, articles.length);
});

test('Article rendering escapes content and ignores non-HTTPS source links', () => {
  const unsafe = structuredClone(articles[0]);
  unsafe.title.az = '<img src=x onerror=alert(1)>';
  unsafe.sections[0].paragraphs[0].az = '<script>alert(1)</script>';
  unsafe.sources = [{ title: { az: 'Unsafe', en: 'Unsafe' }, url: 'javascript:alert(1)' }];
  const { U, rootElement } = fixture([unsafe]); U.renderCompass({ tab: 'compass', view: 'article', id: unsafe.id, query: {} });
  assert.ok(rootElement.innerHTML.includes('&lt;img'));
  assert.ok(rootElement.innerHTML.includes('&lt;script&gt;'));
  assert.ok(!rootElement.innerHTML.includes('<script>'));
  assert.ok(!rootElement.innerHTML.includes('href="javascript:'));
  U.renderCompass({ tab: 'compass', view: 'article', id: 'missing', query: {} });
  assert.ok(rootElement.innerHTML.includes('Məqalə tapılmadı'));
});

test('Public Compass articles contain full readable content, canonical metadata and matching app entry links', () => {
  const { outputs } = compassOutputs(root);
  for (const a of articles) {
    const html = outputs.get('compass/' + a.id + '/index.html');
    assert.ok(html.includes('https://unecstudentshub.com/compass/' + a.id + '/'));
    assert.ok(html.includes('href="/#/compass/' + a.id + '"'));
    assert.ok(html.includes('"@type":"Article"'));
    assert.ok(html.includes('Növbəti addımlar'));
    assert.ok(html.includes(a.sources[0].url.replace(/&/g, '&amp;')));
  }
  const context = { window: {} }; vm.createContext(context);
  vm.runInContext(outputs.get('data/compass-catalog.js'), context);
  assert.deepEqual(Array.from(context.window.UNEC_COMPASS_DATA, a => a.id), articles.map(a => a.id));
});
