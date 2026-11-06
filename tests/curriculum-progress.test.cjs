const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const P = require('../scripts/curriculum-progress.js');

test('profile years accept saved AZ values and reject missing or invalid courses', () => {
  for (const [value, expected] of [['1-ci kurs', 1], ['2-ci kurs', 2], ['3-cü kurs', 3], ['4-cü kurs', 4], ['3', 3], [2, 2], ['Year 4', 4]]) {
    assert.equal(P.profileYear(value), expected);
  }
  for (const value of [null, undefined, '', '2026', '5-ci kurs', '3abc', 0, 5, 1.5, {}, []]) assert.equal(P.profileYear(value), 0);
});

test('only semesters before the current profile year are inferred complete', () => {
  for (let year = 1; year <= 4; year++) {
    const result = Array.from({ length: 8 }, (_, index) => P.isComplete('subject', index + 1, year, new Set(), {}));
    assert.deepEqual(result, Array((year - 1) * 2).fill(true).concat(Array(10 - year * 2).fill(false)));
  }
  assert.equal(P.isComplete('subject', 1, 0, new Set(), {}), false);
});

test('explicit edits override inferred completion and preserve legacy manual progress', () => {
  const saved = new Set(['economics|7|00411']);
  assert.equal(P.isComplete('economics|7|00411', 7, 3, saved, {}), true);
  assert.equal(P.isComplete('economics|7|00411', 7, 3, saved, { 'economics|7|00411': false }), false);
  assert.equal(P.isComplete('economics|1|00005', 1, 3, saved, { 'economics|1|00005': false }), false);
  assert.equal(P.isComplete('economics|5|00031', 5, 1, saved, { 'economics|5|00031': true }), true);
  assert.equal(P.isComplete('finance|7|00411', 7, 3, saved, {}), false);
});

test('credit totals follow profile changes without persisting automatic flags or changing source data', () => {
  const context = { window: { addEventListener() {} } }; vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../scripts/curriculum.js'), 'utf8') + '\nthis.plan = CURRICULUM_DATA.economics;', context);
  const before = JSON.stringify(context.plan), saved = new Set(), edits = {};
  assert.deepEqual(P.totals(context.plan, 'economics', 2, saved, edits), { completed: 60, total: 240 });
  assert.deepEqual(P.totals(context.plan, 'economics', 3, saved, edits), { completed: 120, total: 240 });
  assert.deepEqual(P.totals(context.plan, 'economics', 4, saved, edits), { completed: 180, total: 240 });
  edits['economics|1|00005'] = false; edits['economics|5|00031'] = true;
  assert.equal(P.totals(context.plan, 'economics', 3, saved, edits).completed, 122);
  assert.equal(P.totals(context.plan, 'economics', 4, saved, edits).completed, 175);
  assert.equal(P.totals(context.plan, 'economics', 1, saved, edits).completed, 7);
  assert.equal(saved.size, 0); assert.equal(Object.keys(edits).length, 2);
  assert.equal(JSON.stringify(context.plan), before);
});
