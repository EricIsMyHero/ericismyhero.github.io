// Turn verified Forma 1 imports into the existing curriculum view and material filters.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CurriculumSource = factory();
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';
  const sections = ['general', 'generalElectives', 'major', 'majorElectives', 'practice'];
  const clean = text => String(text || '').replace(/\s+/g, ' ').trim();
  function prepare(original, originalCodes, source) {
    if (!original || !originalCodes || source.specialtyCode !== originalCodes.specialtyCode ||
        !/^[a-f0-9]{64}$/.test(source.sha256) || !Array.isArray(source.rows) || !source.rows.length) throw new Error('Invalid curriculum source');
    const plan = { name: original.name, icon: original.icon, source: { file: source.file, url: source.url, sha256: source.sha256,
      warnings: source.rows.some(row => row.warnings?.length) } };
    const codes = { name: originalCodes.name, specialtyCode: originalCodes.specialtyCode };
    for (const section of sections) codes[section] = [];
    for (let semester = 1; semester <= 8; semester++) plan['semester' + semester] = [];
    const oldSubjects = Array.from({ length: 8 }, (_, index) => original['semester' + (index + 1)] || []).flat();
    const identities = new Set();
    for (const row of source.rows) {
      const elective = row.section.endsWith('Electives');
      const id = row.section + ':' + row.ordinal;
      if (!sections.includes(row.section) || identities.has(id) || !Number.isInteger(row.ordinal) || row.ordinal < 1 ||
          !Number.isInteger(row.semester) || row.semester < 1 || row.semester > 8 ||
          !Number.isInteger(row.credit) || row.credit < 1 || row.credit > 30 ||
          !Number.isInteger(row.hours) || row.hours < 0 || row.hours > 180 ||
          row.hours % 15 !== 0 || !Number.isInteger(row.weekly) || row.weekly < 0 || row.weekly > 12 ||
          !clean(row.name) || !Array.isArray(row.codes) || !row.codes.length ||
          row.codes.some(code => !/^\d{5}(?:_\d+)?$/.test(code)) || new Set(row.codes).size !== row.codes.length ||
          (!elective && row.codes.length !== 1)) throw new Error('Invalid curriculum row');
      identities.add(id);
      const old = oldSubjects.find(subject => elective ? subject.codes?.[0] === row.codes[0] : subject.code === row.codes[0]);
      const subject = {
        // Keep an elective group's existing display identity and completion keys.
        name: elective ? (old?.name || `Seçmə fənn - ${row.ordinal}`) : clean(row.name),
        credit: row.credit, hours: row.hours, weekly: row.weekly,
        // This is a calculated 25% limit in two-hour sessions, not a PDF column.
        absenceLimit: Math.floor(row.hours / 8),
      };
      if (elective) subject.codes = [...row.codes];
      else subject.code = row.codes[0];
      plan['semester' + row.semester].push(subject);
      if (elective) {
        const prior = originalCodes[row.section]?.find(group => group.subjects?.[0]?.code === row.codes[0]);
        const numbered = row.name.split(/(?:^|\s)\d+\s*\.\s*/).filter(Boolean).map(clean);
        // Unnumbered specialization alternatives are kept from the reviewed code list.
        const options = row.codes.map((code, index) => {
          const name = numbered.length === row.codes.length ? numbered[index] : prior?.subjects?.find(option => option.code === code)?.name;
          if (!name) throw new Error('An elective alternative needs review: ' + code);
          return { code, name: name.replace(/\*+$/, '') };
        });
        codes[row.section].push({ title: prior?.title || `Seçmə fənn – ${row.ordinal}`, credit: row.credit, semester: row.semester, subjects: options });
      } else {
        codes[row.section].push({ code: subject.code, name: subject.name, credit: row.credit, semester: row.semester,
          ...(row.prereq?.length ? { prereq: [...row.prereq] } : {}) });
      }
    }
    if (sections.some(section => !codes[section].length) ||
        Array.from({ length: 8 }, (_, i) => plan['semester' + (i + 1)].reduce((sum, row) => sum + row.credit, 0)).some(total => total !== 30)) throw new Error('Incomplete curriculum');
    return { plan, codes };
  }
  function apply(plans, codeLists, imports) {
    if (!imports || imports.version !== 1) return [];
    // Prepare every plan before mutating either shared catalogue.
    const prepared = Object.entries(imports.plans || {}).map(([key, source]) => [key, prepare(plans[key], codeLists[key], source)]);
    for (const [key, result] of prepared) {
      plans[key] = result.plan;
      codeLists[key] = result.codes;
    }
    return prepared.map(([key]) => key);
  }
  return Object.freeze({ prepare, apply });
});
