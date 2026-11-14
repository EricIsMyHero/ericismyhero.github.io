// PDF text extraction and catalogue-driven test loading. No hand-maintained PDF list.
window.QUESTION_BANK = {};

const PDF_PARSE_CONFIG = {
  // Tək sütun/iki sütun ayrım həddi (pageWidth-in bu faizi)
  columnGapRatio: 0.25,

  // Y-tolerance: glyph hündürlüyünün bu faizi qədər fərq eyni sətir sayılır
  yToleranceRatio: 0.6,

  // Söz boşluğu: charWidth-in bu faizindən böyük gap = boşluq
  wordGapRatio: 0.3,
};

// ── Simvol regex-ləri ──────────────────────────────────────────
const LONE_SYMBOL   = /^[•∙·●◦‣▪◾■✓✔√☑\u2022\u221A\u25CF\u25AA\u25A0\u25C6]\s*$/;

// ============================================================
// 1. PDF-dən sətir çıxarma (yeni v4.0 motoru)
// ============================================================

/**
 * Sütun ayrımını aşkarlayır.
 * Geri qaytarır: splitX (mərkəz X koordinatı) və ya null.
 */
function _detectColumns(tagged, pageWidth) {
  if (!pageWidth || tagged.length < 6) return null;
  const xs = tagged.map(t => t.x).sort((a, b) => a - b);
  let maxGap = 0, splitX = -1;
  for (let i = 1; i < xs.length; i++) {
    const gap = xs[i] - xs[i - 1];
    if (gap > maxGap) { maxGap = gap; splitX = (xs[i - 1] + xs[i]) / 2; }
  }
  return maxGap > pageWidth * PDF_PARSE_CONFIG.columnGapRatio ? splitX : null;
}

/**
 * Tək simvoldan ibarət sətirləri növbəti sətirə birləşdirir.
 * "• " ayrı sətirdə gəldikdə sual yanlış bölünməsin deyə.
 */
function _mergeOrphanSymbols(lines) {
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    if (LONE_SYMBOL.test(lines[i]) && i + 1 < lines.length) {
      result.push(lines[i].trim() + ' ' + lines[i + 1].trim());
      i++;
    } else {
      result.push(lines[i]);
    }
  }
  return result;
}

/**
 * Bir PDF səhifəsinin items massivindən sətirləri qayıdır.
 * Sütun aşkarlanırsa: sol → sağ sıra.
 *
 * @param {Array}  items
 * @param {number} pageWidth
 * @returns {string[]}
 */
function _rebuildPageLines(items, pageWidth) {
  const valid  = items.filter(it => it.str && it.str.trim());
  if (!valid.length) return [];

  const tagged = valid.map(it => ({
    str:   it.str,
    x:     it.transform[4],
    y:     it.transform[5],
    w:     it.width || 0,
    h:     it.height || Math.abs(it.transform[3]) || 10,
  }));

  const splitX = _detectColumns(tagged, pageWidth);

  let lineObjs;
  if (splitX !== null) {
    // Sütun aşkarlandı: hər sütundan ayrı sətir çıxar, sonra birləşdir
    const leftItems  = tagged.filter(t => t.x < splitX);
    const rightItems = tagged.filter(t => t.x >= splitX);
    lineObjs = [
      ..._itemsToLinesFromTagged(leftItems),
      ..._itemsToLinesFromTagged(rightItems),
    ];
  } else {
    lineObjs = _itemsToLinesFromTagged(tagged);
  }

  return lineObjs.map(l => l.text);
}

/**
 * Artıq tagged (x,y,w,h,str) formatında olan massivdən sətir obyektləri qayıdır.
 * _itemsToLines()-in daxili məntiqi ilə eynidir, amma tam items yerinə tagged alır.
 */
function _itemsToLinesFromTagged(tagged) {
  if (!tagged.length) return [];
  const cfg = PDF_PARSE_CONFIG;

  const sorted = [...tagged].sort((a, b) => (b.y - a.y) || (a.x - b.x));

  const lineGroups = [];
  let group = [];
  let lineY = null;
  let tol   = 0;

  const flush = () => {
    if (!group.length) return;
    group.sort((a, b) => a.x - b.x);
    let text = '';
    let prev = null;
    for (const e of group) {
      if (prev) {
        const gap   = e.x - (prev.x + prev.w);
        const charW = prev.w / Math.max(prev.str.length, 1);
        const needSp = gap > Math.max(charW * cfg.wordGapRatio, 0.5);
        if (needSp && !/\s$/.test(text) && !/^\s/.test(e.str)) text += ' ';
      }
      text += e.str;
      prev = e;
    }
    text = text.replace(/[ \t]+/g, ' ').trim();
    if (text) lineGroups.push({ text, x: group[0].x, y: group[0].y });
    group = [];
  };

  for (const e of sorted) {
    if (lineY === null) {
      lineY = e.y;
      tol   = Math.max((e.h || 10) * cfg.yToleranceRatio, 3);
    } else if (Math.abs(e.y - lineY) > tol) {
      flush();
      lineY = e.y;
      tol   = Math.max((e.h || 10) * cfg.yToleranceRatio, 3);
    }
    group.push(e);
  }
  flush();

  return lineGroups;
}

// Shared with the AI material context. Keep page boundaries for question provenance.
async function extractPdfText(input, { markImages = false } = {}) {
  if (typeof pdfjsLib === 'undefined') throw new Error('pdf_library_unavailable');
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const task = pdfjsLib.getDocument(input);
  const timer = setTimeout(() => task.destroy(), 120000);
  try { return await _pdfToText(await task.promise, markImages); }
  finally { clearTimeout(timer); await task.destroy(); }
}
async function extractPdfTextFromBuffer(buffer, onProgress) {
  return extractPdfText({ data: buffer }, { markImages: true }).then(text => { if (onProgress) onProgress(1); return text; });
}
async function _pdfToText(pdf, markImages) {
  const pages = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    try {
      const content = await page.getTextContent();
      // Bare page numbers at the bottom are layout, not option continuations.
      const width = page.getViewport({ scale: 1 }).width;
      const items = content.items.filter(it => !(it.transform?.[5] < 35 && Math.abs(it.transform[4] - width / 2) < 35 && it.str.trim() === String(n)));
      // Mark image-only formulas/diagrams instead of silently importing incomplete questions.
      // These markers travel with the text to the parser; they are never shown in a quiz.
      if (markImages) items.push(...await _pdfImageMarkers(page));
      pages.push(_mergeOrphanSymbols(_rebuildPageLines(items, width)).join('\n'));
    } finally { page.cleanup(); }
    if (n % 5 === 0) await new Promise(resolve => setTimeout(resolve, 0));
  }
  return pages.join('\n\f\n');
}
async function _pdfImageMarkers(page) {
  const list = await page.getOperatorList(), ops = pdfjsLib.OPS;
  const images = [], stack = [];
  let matrix = [1, 0, 0, 1, 0, 0];
  const multiply = (a, b) => [a[0]*b[0]+a[2]*b[1], a[1]*b[0]+a[3]*b[1], a[0]*b[2]+a[2]*b[3], a[1]*b[2]+a[3]*b[3], a[0]*b[4]+a[2]*b[5]+a[4], a[1]*b[4]+a[3]*b[5]+a[5]];
  function add(m) {
    const height = Math.max(Math.abs(m[1]) + Math.abs(m[3]), 1);
    images.push({ str: UNECTestBank.IMAGE, width: 1, height: 8, transform: [1,0,0,8,m[4], Math.max(m[5], m[5]+m[3]) - Math.min(6,height/2)] });
  }
  for (let i = 0; i < list.fnArray.length; i++) {
    const op = list.fnArray[i], args = list.argsArray[i];
    if (op === ops.save || op === ops.paintFormXObjectBegin) {
      stack.push([...matrix]);
      if (op === ops.paintFormXObjectBegin && args[0]) matrix = multiply(matrix, args[0]);
    }
    else if (op === ops.restore || op === ops.paintFormXObjectEnd) matrix = stack.pop() || [1,0,0,1,0,0];
    else if (op === ops.transform) matrix = multiply(matrix, args);
    else if ([ops.paintImageXObject, ops.paintInlineImageXObject, ops.paintJpegXObject, ops.paintImageMaskXObject].includes(op)) add(matrix);
    else if (op === ops.paintInlineImageXObjectGroup) {
      for (const item of args[1]) add(multiply(matrix, item.transform));
    }
    else if (op === ops.paintImageXObjectRepeat) {
      const [, sx, sy, positions] = args;
      for (let j = 0; j < positions.length; j += 2) add(multiply(matrix, [sx,0,0,sy,positions[j],positions[j+1]]));
    }
  }
  return images;
}
function parseQuestionsFromText(text) { return UNECTestBank.parse(text).questions; }
class PDFParser {
  async parse(buffer, onProgress) {
    return parseQuestionsFromText(await extractPdfTextFromBuffer(buffer, onProgress)).map(q => ({
      number: q.number, text: q.question,
      options: Object.fromEntries(q.options.map((opt, i) => ['ABCDEFGHIJ'[i], opt])),
      correct: 'ABCDEFGHIJ'[q.answer]
    }));
  }
}

(function () {
  'use strict';
  const MAX_AGE = 7 * 86400000;
  const memory = new Map(), pending = new Map(), subjects = new Map();
  const queue = [];
  let active = 0;
  function limited(work) {
    return new Promise((resolve, reject) => { queue.push({ work, resolve, reject }); drain(); });
  }
  function drain() {
    while (active < 2 && queue.length) {
      const job = queue.pop(); active++;
      Promise.resolve().then(job.work).then(job.resolve, job.reject).finally(() => { active--; drain(); });
    }
  }
  let dbPromise;
  function database() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(resolve => {
      if (!window.indexedDB) { resolve(null); return; }
      let request;
      try { request = indexedDB.open('unec-test-pdfs', 1); } catch (_) { resolve(null); return; }
      const timer = setTimeout(() => resolve(null), 2000);
      request.onupgradeneeded = () => request.result.createObjectStore('questions');
      request.onsuccess = () => { clearTimeout(timer); resolve(request.result); };
      request.onerror = request.onblocked = () => { clearTimeout(timer); resolve(null); };
    });
    return dbPromise;
  }
  async function stored(key, value) {
    const db = await database(); if (!db) return null;
    return new Promise(resolve => {
      try {
        const tx = db.transaction('questions', value ? 'readwrite' : 'readonly');
        const store = tx.objectStore('questions');
        const request = value ? store.put(value, key) : store.get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
        tx.onabort = () => resolve(null);
      } catch (_) { resolve(null); }
    });
  }
  const cacheKey = source => UNECTestBank.VERSION + '|' + source.url + '|' + source.addedAt;
  async function file(source, refresh) {
    const key = cacheKey(source);
    if (pending.has(key)) return pending.get(key);
    const promise = (async () => {
      if (!refresh) {
        const hit = memory.get(key) || await stored(key);
        if (hit && Date.now() - hit.time < MAX_AGE && Array.isArray(hit.questions) && hit.questions.every(q => q.question && Array.isArray(q.options) && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length)) { memory.set(key, hit); return { ...hit, source, cached: true }; }
      }
      return limited(async () => { try {
        const result = UNECTestBank.parse(await extractPdfText(source.url, { markImages: true }));
        const entry = { ...result, time: Date.now() };
        memory.set(key, entry); await stored(key, entry);
        return { ...entry, source, cached: false };
      } catch (error) {
        console.warn('[tests] PDF could not be read:', source.file, error.message);
        return { source, questions: [], error: true, stats: { rejected: 0 } };
      } });
    })();
    pending.set(key, promise);
    try { return await promise; } finally { pending.delete(key); }
  }
  function init() {
    window.TEST_CATALOG = UNECTestBank.catalog(typeof data === 'undefined' ? {} : data, typeof BASE === 'undefined' ? '' : BASE);
    for (const name of Object.keys(TEST_CATALOG)) if (!QUESTION_BANK[name]) QUESTION_BANK[name] = [];
    renderTestSubjects();
  }
  async function load(name, { sourceUrl, refresh = false, onProgress = () => {} } = {}) {
    const cachedPrivate=subjects.get(name);
    if(cachedPrivate?.private)return cachedPrivate.result;
    const sources = window.TEST_CATALOG?.[name] || [];
    const source = sourceUrl ? sources.find(s => s.url === sourceUrl) : sources[0];
    if (!source) throw new Error('invalid_test_source');
    const previous = subjects.get(name);
    if (previous?.sourceUrl === source.url && previous.pending) return previous.pending;
    if (!refresh && previous?.sourceUrl === source.url && previous.result && !previous.result.failed && Date.now() - previous.time < MAX_AGE) {
      QUESTION_BANK[name] = previous.result.questions;
      return previous.result;
    }
    QUESTION_BANK[name] = [];
    const work = (async () => {
      const files = [await file(source, refresh)];
      onProgress(1, 1);
      const result = { ...UNECTestBank.merge(files), files,
        failed: files.filter(f => f.error).length,
        rejected: files.reduce((sum, f) => sum + (f.stats?.rejected || 0), 0) };
      // A slow response from a previously selected PDF must not replace the current pool.
      if (subjects.get(name)?.pending === work) {
        QUESTION_BANK[name] = result.questions;
        subjects.set(name, { sourceUrl: source.url, result, time: Date.now() });
      }
      return result;
    })();
    subjects.set(name, { sourceUrl: source.url, pending: work });
    try { return await work; } finally { if (subjects.get(name)?.pending === work) subjects.delete(name); }
  }
  function installPrivate(source,questions){
    init();const name=(typeof lang!=='undefined'&&lang==='en'?'My PDF: ':'Şəxsi PDF: ')+source.file;
    const origin={...source,url:source.id,subject:name};
    const result={questions,files:[{source:origin,questions}],failed:0,rejected:0,conflicts:0};
    TEST_CATALOG[name]=[origin];QUESTION_BANK[name]=questions;subjects.set(name,{private:true,sourceUrl:source.id,result,time:Date.now()});return name;
  }
  function clearPrivate(){for(const[name,row]of subjects)if(row.private){subjects.delete(name);delete QUESTION_BANK[name];if(window.TEST_CATALOG)delete TEST_CATALOG[name];}renderTestSubjects();}
  window.UNECTests = { init, load, installPrivate, clearPrivate, status: name => subjects.get(name), sources: name => window.TEST_CATALOG?.[name] || [] };
})();

// Compatibility for the console; the production catalogue comes only from pdfs.js.
async function autoLoadAllSubjects() { UNECTests.init(); }
window.testParse = async url => UNECTestBank.parse(await extractPdfText(url, { markImages: true }));
