const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function fixture() {
  const data = {
    Course: { subjects: {
      Subject: { type: 'test', semester: 1, pdfs: [
        { name: 'Old', file: 'old.pdf', addedAt: '2026-04-10T10:00:00Z' },
        { name: 'New', file: 'new.pdf', addedAt: '2026-06-20T16:00:00Z' },
        { name: 'Same moment', file: 'tie.pdf', addedAt: '2026-06-20T20:00:00+04:00' },
        { name: 'Unknown', file: 'unknown.pdf' },
        { name: 'Invalid date', file: 'invalid.pdf', addedAt: 'invalid' }
      ] },
      Other: { type: 'test', semester: 1, pdfs: [
        { name: 'Middle', file: 'middle.pdf', addedAt: '2026-05-01T10:00:00Z' }
      ] }
    } }
  };
  const extrasData = { Course: [
    { name: 'Old extra', file: 'old-extra.pdf', addedAt: '2026-04-01T10:00:00Z' },
    { name: 'Newest extra', file: 'new-extra.pdf', addedAt: '2026-10-20T10:00:00Z' }
  ] };
  const original = JSON.stringify({ data, extrasData });
  const favorites = ['pdf/old.pdf', 'pdf/new.pdf', 'pdf-extra/new-extra.pdf', 'pdf-extra/old-extra.pdf'];
  const context = {
    data, extrasData, BASE: '/', EXTRAS_BASE: '/extra/', PDF_TYPES: {},
    getSubjectCode: () => '', getFavorites: () => favorites,
    window: { UNEC: { $: () => null, $$: () => [], esc: String, ic: () => '',
      enc: encodeURIComponent, tr: s => s, normAz: s => String(s).toLowerCase() },
      addEventListener() {} }
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../scripts/app-materials.js'), 'utf8'), context);
  return { U: context.window.UNEC, data, extrasData, original };
}
const files = entries => Array.from(entries, m => m.file);

test('global material order uses addition timestamps, including extras and timezone offsets', () => {
  const { U } = fixture();
  assert.deepEqual(files(U.getIndex()), [
    'new-extra.pdf', 'new.pdf', 'tie.pdf', 'middle.pdf', 'old.pdf', 'old-extra.pdf', 'unknown.pdf', 'invalid.pdf'
  ]);
});

test('subjects, extras and mixed favorites all use newest-first order without changing source data', () => {
  const { U, data, extrasData, original } = fixture();
  assert.deepEqual(files(U.entriesForSubject('Course', 'Subject')), ['new.pdf', 'tie.pdf', 'old.pdf', 'unknown.pdf', 'invalid.pdf']);
  assert.deepEqual(files(U.extraEntries('Course')), ['new-extra.pdf', 'old-extra.pdf']);
  assert.deepEqual(files(U.favoriteEntries('Course')), ['new-extra.pdf', 'new.pdf', 'old.pdf', 'old-extra.pdf']);
  assert.equal(JSON.stringify({ data, extrasData }), original);
});

test('material details retain the verified date; missing dates are never replaced with today', () => {
  const { U } = fixture();
  const known = U.resolveEntry({ course: 'Course', subject: 'Subject', file: 'new.pdf' });
  assert.equal(known.addedAt, '2026-06-20T16:00:00Z');
  const unknown = U.resolveEntry({ course: 'Course', subject: 'Subject', file: 'unknown.pdf' });
  assert.equal(unknown.addedAt, null);
  const extra = U.resolveEntry({ extra: true, course: 'Course', file: 'new-extra.pdf' });
  assert.equal(extra.addedAt, '2026-10-20T10:00:00Z');
});
