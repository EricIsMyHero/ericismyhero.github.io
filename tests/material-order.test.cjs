const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function fixture(change = () => {}) {
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
  change(data, extrasData);
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

test('one subject combines every historical course, while the global list deduplicates shared PDFs', () => {
  const { U } = fixture((data, extras) => {
    data.Later = { subjects: { Subject: { type: 'test', semester: 2, pdfs: [
      { name: 'Old duplicate', file: 'old.pdf', addedAt: '2026-04-10T10:00:00Z' },
      { name: 'Another year', file: 'later.pdf', addedAt: '2026-11-01T10:00:00Z' }
    ] }, Alias: { type: 'test', code: '00122', pdfs: [{ name: 'Shared', file: 'new.pdf', addedAt: '2026-06-20T16:00:00Z' }] } } };
    extras.Later = [{ name: 'Newest extra', file: 'new-extra.pdf', addedAt: '2026-10-20T10:00:00Z' }];
  });
  assert.equal(Object.keys(U.getSubjectCatalog()).filter(name => name === 'Subject').length, 1);
  assert.equal(U.entriesForSubject('Course','Subject').filter(m => m.file === 'old.pdf').length, 1);
  assert.equal(U.entriesForSubject('Later','Subject')[0].file, 'later.pdf');
  assert.equal(U.getIndex().filter(m => m.file === 'new.pdf').length, 1);
  assert.equal(U.getIndex().find(m => m.file === 'new.pdf').aliases.length, 2);
  assert.equal(U.extraEntries().length, 2);
  assert.equal(U.favoriteEntries().filter(m => m.file === 'new-extra.pdf').length, 1);
});
test('course-free links preserve the original rating identity and old deep-link resolution', () => {
  const { U } = fixture();
  const entry = U.resolveEntry({ subject: 'Subject', file: 'new.pdf' });
  assert.equal(entry.course, 'Course');
  assert.equal(U.matHref(entry), '#/material/Subject/new.pdf');
  assert.equal(U.subjectHref('Subject'), '#/subject/Subject');
  assert.equal(U.resolveEntry({ course: 'Course', subject: 'Subject', file: 'new.pdf' }).course, 'Course');
  const extra = U.resolveEntry({ extra: true, file: 'new-extra.pdf' });
  assert.equal(extra.course, 'Course');
  assert.equal(U.matHref(extra), '#/extra/new-extra.pdf');
});

test('major membership is independent of the historical course used to store a PDF', () => {
  const c = vm.createContext({ window: {}, document: { addEventListener() {} }, CURRICULUM_DATA: {
    finance: { semester2: [{ name: 'Shared subject', code: '12345' }] },
    economics: { semester5: [{ name: 'Shared subject', code: '12345' }] }
  } });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../scripts/ui.js'), 'utf8'), c);
  const subject = { code: '12345', type: 'test', semester: 1, pdfs: [] };
  assert.equal(c.subjectMatchesMajor('Shared subject', subject, 'finance', null), true);
  assert.equal(c.subjectMatchesMajor('Shared subject', subject, 'economics', null), true);
  assert.equal(c.subjectMatchesMajor('Shared subject', subject, 'finance', 3), false);
});

test('every production PDF and extra survives consolidation and every legacy detail keeps its original identity', () => {
  const raw = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../pdfs.js'), 'utf8')+';this.source={data,extrasData}',raw);
  const { U } = fixture((data, extras) => {
    for (const key of Object.keys(data)) delete data[key];
    for (const key of Object.keys(extras)) delete extras[key];
    Object.assign(data, raw.source.data);Object.assign(extras, raw.source.extrasData);
  });
  const expected = new Set();
  for (const [course, year] of Object.entries(raw.source.data)) for (const [subject, entry] of Object.entries(year.subjects)) for (const pdf of entry.pdfs) {
    expected.add('pdf/'+pdf.file);
    const resolved=U.resolveEntry({course,subject,file:pdf.file});
    assert.equal(resolved.course,course);assert.equal(resolved.subject,subject);assert.equal(resolved.addedAt,pdf.addedAt);
  }
  for (const [course, list] of Object.entries(raw.source.extrasData)) for (const pdf of list) {
    expected.add('pdf-extra/'+pdf.file);
    assert.equal(U.resolveEntry({extra:true,course,file:pdf.file}).course,course);
  }
  const actual=U.getIndex().map(m=>m.favKey);
  assert.equal(actual.length,expected.size);
  assert.deepEqual(new Set(actual),expected);
});
