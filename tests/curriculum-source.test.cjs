const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Source = require('../scripts/curriculum-source.js');
const Progress = require('../scripts/curriculum-progress.js');
const imports = JSON.parse(fs.readFileSync('data/curriculum-pdf.json'));
const manifest = JSON.parse(fs.readFileSync('data/curriculum-sources.json'));
const load = () => {
  const c = { window: { addEventListener() {} } }; vm.createContext(c);
  vm.runInContext(fs.readFileSync('scripts/curriculum.js', 'utf8') + '\nthis.plans = CURRICULUM_DATA;this.codes = CURRICULUM_CODES;', c);
  return c;
};
test('every supported major has a matching Cloudflare source PDF', () => {
  const c = load();
  assert.deepEqual(Object.keys(manifest.files).sort(), Object.keys(c.plans).sort());
  assert.deepEqual(Object.keys(imports.plans).sort(), Object.keys(c.plans).sort());
  for (const [key, file] of Object.entries(manifest.files)) {
    assert.equal(imports.plans[key].file, file);
    assert.equal(imports.plans[key].url, manifest.baseUrl + encodeURIComponent(file));
    assert.equal(imports.plans[key].specialtyCode, c.codes[key].specialtyCode);
  }
});
test('PDF imports supply 240-credit plans and matching material-filter code lists', () => {
  const c = load();
  Source.apply(c.plans, c.codes, imports);
  for (const [key, source] of Object.entries(imports.plans)) {
    assert.equal(c.plans[key].source.sha256, source.sha256);
    assert.equal(c.codes[key].specialtyCode, source.specialtyCode);
    for (let semester = 1; semester <= 8; semester++) {
      assert.equal(c.plans[key]['semester' + semester].reduce((sum, row) => sum + row.credit, 0), 30);
    }
    for (const row of source.rows) {
      const entry = c.plans[key]['semester' + row.semester].find(s => row.section.endsWith('Electives') ? s.codes?.[0] === row.codes[0] : s.code === row.codes[0]);
      assert.equal(entry.credit, row.credit);
      assert.equal(entry.hours, row.hours);
      assert.equal(entry.absenceLimit, Math.floor(row.hours / 8));
    }
  }
  assert.equal(c.codes.marketing.practice.find(row => row.name.startsWith('Karyera')).code, '00223');
  assert.equal(c.codes.management.practice.find(row => row.name.startsWith('Karyera')).code, '01223');
});
test('existing elective completion identities survive import and unrelated plans remain intact', () => {
  const c = load(), unrelated = c.plans.design;
  const before = c.plans.management;
  Source.apply(c.plans, c.codes, { version: 1, plans: { management: imports.plans.management } });
  assert.equal(c.plans.design, unrelated);
  for (let n = 1; n <= 8; n++) for (const old of before['semester' + n]) {
    const updated = c.plans.management['semester' + n].find(row => old.code ? row.code === old.code : row.codes?.[0] === old.codes[0]);
    assert(updated);
    assert.equal(Progress.key('management', n, updated), Progress.key('management', n, old));
  }
});
test('an incomplete batch never partially replaces bundled plans or code lists', () => {
  const c = load(), before = JSON.stringify([c.plans, c.codes]);
  const broken = structuredClone(imports); broken.plans.marketing.rows.pop();
  assert.throws(() => Source.apply(c.plans, c.codes, broken));
  assert.equal(JSON.stringify([c.plans, c.codes]), before);
});
