// Pure catalogue, question parsing and merge rules, shared by the browser and tests.
(function (root) {
  'use strict';
  const VERSION = '20261113-2';
  const IMAGE = '[UNEC_PDF_IMAGE]';
  const clean = s => String(s || '').normalize('NFC').replace(/\u00ad/g, '').replace(/\s+/g, ' ').trim();
  const CHECK = /^[✓✔√☑]/u;
  const BULLET = /^[•∙·●◦‣▪◾■◆✓✔√☑\uf0b7\uf0fc]\s*/u;
  const HEADER = /(?:Yekun\s+imtahan\s+testinin\s+sualları|^\s*(?:Səhifə|Page)\s+\d+(?:\s*\/\s*\d+)?\s*$)/iu;

  function catalog(data, base) {
    const subjects = new Map();
    for (const [course, entry] of Object.entries(data || {})) {
      for (const [subject, value] of Object.entries(entry.subjects || {})) {
        if (value.type !== 'test') continue;
        for (const pdf of value.pdfs || []) {
          if (!pdf.file || !/\.pdf$/i.test(pdf.file) || /[\\/]/.test(pdf.file)) continue;
          if (!subjects.has(subject)) subjects.set(subject, new Map());
          const files = subjects.get(subject), url = base + 'pdf/' + encodeURIComponent(pdf.file);
          if (!files.has(url)) files.set(url, { course, subject, file: pdf.file, name: pdf.name || pdf.file, url, addedAt: pdf.addedAt || '' });
        }
      }
    }
    return Object.fromEntries([...subjects].map(([name, files]) => [name, [...files.values()].sort((a, b) => (Date.parse(b.addedAt) || 0) - (Date.parse(a.addedAt) || 0))]));
  }

  function option(line) {
    let correct = CHECK.test(line) || /^\uf0fc/u.test(line), text = line;
    const bullet = BULLET.exec(text);
    if (bullet) text = text.slice(bullet[0].length);
    const label = /^([A-Ha-h])[).:]\s*/.exec(text);
    if (label) text = text.slice(label[0].length);
    if (!bullet && !label) return null;
    if (/[✓✔☑]\s*$/u.test(text)) { correct = true; text = text.replace(/[✓✔☑]\s*$/u, ''); }
    return { text: clean(text), correct, label: label ? label[1].toUpperCase() : null };
  }

  function parse(text) {
    const questions = [], stats = { detected: 0, rejected: 0, unmarked: 0, ambiguous: 0, malformed: 0 };
    let current = null, page = 1;
    function flush() {
      if (!current) return;
      stats.detected++;
      const question = clean(current.text.join(' ')), options = current.options.map(o => clean(o.text));
      const marked = current.options.map((o, i) => o.correct ? i : -1).filter(i => i >= 0);
      if (current.explicit) {
        const index = current.options.findIndex(o => o.label === current.explicit);
        if (index >= 0 && !marked.includes(index)) marked.push(index);
        if (index < 0) marked.push(-1);
      }
      let reason = '';
      const labels = current.options.map(o => o.label).filter(Boolean);
      if (question.length < 3 || !/[\p{L}\p{N}]/u.test(question) || current.text.concat(options).some(t => t.includes(IMAGE)) || options.length < 2 || options.length > 10 || options.some(o => !o) || new Set(options).size !== options.length || (labels.length && (labels.length !== options.length || labels.some((l, i) => l !== 'ABCDEFGH'[i])))) reason = 'malformed';
      else if (!marked.length) reason = 'unmarked';
      else if (marked.length !== 1 || marked[0] < 0) reason = 'ambiguous';
      if (reason) { stats.rejected++; stats[reason]++; }
      else questions.push({ question, options, answer: marked[0], number: current.number, page: current.page });
      current = null;
    }
    for (const raw of String(text || '').replace(/\r\n?/g, '\n').replace(/\f/g, '\n\f\n').split('\n')) {
      if (raw === '\f') { page++; continue; }
      const line = clean(raw);
      if (!line || HEADER.test(line)) continue;
      const number = /^(\d{1,4})[.)](?:\s+(.+))?$/.exec(line);
      if (number && (!current || (current.options.length > 0 && current.options.at(-1).text))) {
        flush(); current = { number: Number(number[1]), page, text: number[2] ? [number[2]] : [], options: [], explicit: null }; continue;
      }
      if (!current) continue;
      const explicit = /^(?:(?:Düzgün\s+)?cavab|Correct\s+answer|Answer)\s*[:：]\s*([A-H])\s*[.)]?$/iu.exec(line);
      if (explicit) { if (current.explicit && current.explicit !== explicit[1].toUpperCase()) current.options.push({ text: '', correct: false }); current.explicit = explicit[1].toUpperCase(); continue; }
      const opt = option(line);
      if (opt) {
        const previous = current.options.at(-1);
        // A marker on its own belongs to the following text, including a labelled option.
        if (previous && !previous.text && opt.text) {
          previous.text = opt.text; previous.correct ||= opt.correct; previous.label = opt.label;
        } else current.options.push(opt);
      } else if (current.options.length) current.options.at(-1).text += ' ' + line;
      else current.text.push(line);
    }
    flush();
    return { questions, stats };
  }

  function merge(files) {
    const unique = new Map(), conflicts = new Set();
    let duplicates = 0;
    for (const { source, questions } of files) for (const q of questions || []) {
      const key = JSON.stringify([clean(q.question), q.options.map(clean).sort()]);
      const answer = clean(q.options[q.answer]);
      const origin = { ...source, page: q.page, number: q.number };
      if (unique.has(key)) {
        const previous = unique.get(key);
        if (clean(previous.options[previous.answer]) !== answer) conflicts.add(key);
        else { duplicates++; previous.sources.push(origin); }
      } else unique.set(key, { ...q, sources: [origin] });
    }
    return { questions: [...unique].filter(([key]) => !conflicts.has(key)).map(([, q]) => q), duplicates, conflicts: conflicts.size };
  }
  const api = { VERSION, IMAGE, catalog, parse, merge };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.UNECTestBank = api;
})(typeof window === 'undefined' ? globalThis : window);
