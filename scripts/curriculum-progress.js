// Completion is a view of the profile year plus explicit, device-local edits.
// Inferring past years never writes completion flags into the user's saved data.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CurriculumProgress = factory();
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';
  function profileYear(value) {
    if (typeof value === 'number') return Number.isInteger(value) && value >= 1 && value <= 4 ? value : 0;
    if (typeof value !== 'string') return 0;
    const match = /^(?:Year\s+)?([1-4])(?:-(?:ci|cü|cu)\s+kurs)?$/i.exec(value.trim());
    return match ? Number(match[1]) : 0;
  }
  const key = (spec, semester, subject) => `${spec}|${semester}|${subject.code || subject.name}`;
  function isComplete(id, semester, year, saved, edits) {
    if (Object.hasOwn(edits, id) && typeof edits[id] === 'boolean') return edits[id];
    return saved.has(id) || (year >= 1 && semester >= 1 && semester <= (year - 1) * 2);
  }
  function totals(plan, spec, year, saved, edits) {
    let total = 0, completed = 0;
    for (let semester = 1; semester <= 8; semester++) for (const subject of plan['semester' + semester] || []) {
      const credit = Number(subject.credit) || 0;
      total += credit;
      if (isComplete(key(spec, semester, subject), semester, year, saved, edits)) completed += credit;
    }
    return { total, completed };
  }
  return Object.freeze({ profileYear, key, isComplete, totals });
});
