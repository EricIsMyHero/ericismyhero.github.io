// ============================================================
// PDF-LOADER.JS  —  v4.0  (Merged + Enhanced)
// ============================================================
// v4.0 yenilikləri:
//   • Yeni _itemsToLines() motoru: y-tolerance 60% glyph height
//     əsaslı, daha dəqiq söz boşluq məntiqi (gap > charW*0.3)
//   • CONFIG bloku: bütün regex-lər bir yerdə, asanca uyğunlaşdırılır
//   • ArrayBuffer + URL hər ikisi dəstəklənir (extractPdfText/parse)
//   • curOpt tracking: çox sətirli variant mətni düzgün toplanır
//   • _detectColumns() → ikili sütun dəstəyi qalır
//   • _mergeOrphanSymbols() → tək simvol sətirləri qalır
//   • Format A + Format C parser qalır (Azərbaycan PDF-ləri üçün)
//   • PDFParser sinifi (ArrayBuffer, progress callback) — quiz UI üçün
//   • QUESTION_BANK + autoLoadAllSubjects() qalır — platform üçün
//   • PdfLoadingUI overlay qalır
//   • debugPdf() + testParse() debug alətləri qalır
// ============================================================

// ── Qlobal QUESTION_BANK ──────────────────────────────────────
if (typeof QUESTION_BANK === 'undefined') {
  window.QUESTION_BANK = {};
}

// ── pdf.js worker ─────────────────────────────────────────────
(function setPdfWorker() {
  if (typeof pdfjsLib !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }
})();

// ============================================================
// CONFIG — regex-lər bu blokda, PDF formatı dəyişərsə buradan düzəlt
// ============================================================
const PDF_PARSE_CONFIG = {
  // Sual başlangıcı: "1.", "2.", "35." — ondalık ədəd deyil
  questionStart: /^\s*(\d{1,4})\.(?=\s|$)/u,

  // Variant sətiri: bullet və ya check işarəsi ilə başlayır
  optionBullet: /^\s*([•∙·●◦‣▪◾■✓✔√☑\u2022\u221A\u25CF\u25AA\u25A0\u25C6])\s*/u,

  // Düzgün cavab işarələri
  correctGlyph: /[✓✔√☑\u221A\u2713\u2714\u2611]/u,

  // Tək sütun/iki sütun ayrım həddi (pageWidth-in bu faizi)
  columnGapRatio: 0.25,

  // Y-tolerance: glyph hündürlüyünün bu faizi qədər fərq eyni sətir sayılır
  yToleranceRatio: 0.6,

  // Söz boşluğu: charWidth-in bu faizindən böyük gap = boşluq
  wordGapRatio: 0.3,
};

// ── Terminoloji marker-lər (dinamik uzunluq limiti üçün) ──────
const TERMINOLOGIC_MARKERS = [
  /nədir[\s?:]/i,
  /nə deməkdir/i,
  /nədən ibarətdir/i,
  /hansıdır/i,
  /neçədir/i,
  /kimdir/i,
  /\?/,
];

function _isTerminologicQuestion(text) {
  return TERMINOLOGIC_MARKERS.some(rx => rx.test(text));
}

function _getMinLength(text) {
  return _isTerminologicQuestion(text) ? 5 : 20;
}

// ── Simvol regex-ləri ──────────────────────────────────────────
const CORRECT_CHARS = /^[✓✔√☑\u221A\u2713\u2714\u2611\u2612]/;
const SYMBOL_OPTION = /^[•∙·●◦‣▪◾■✓✔√☑\u2022\u221A\u2713\u2714\u2611\u2612\u25CF\u25AA\u25A0\u25C6]\s*/;
const LONE_SYMBOL   = /^[•∙·●◦‣▪◾■✓✔√☑\u2022\u221A\u25CF\u25AA\u25A0\u25C6]\s*$/;
const QNUM          = /^\d+\.\s+\S/;

// ============================================================
// 1. PDF-dən sətir çıxarma (yeni v4.0 motoru)
// ============================================================

/**
 * pdf.js items → vizual sətirləri qurur.
 * Y-tolerance hər elementin glyph hündürlüyünə əsaslanır (daha dəqiq).
 * Söz boşluğu charWidth * wordGapRatio əsasında müəyyənləşir.
 *
 * @param {Array} items  — page.getTextContent().items
 * @returns {Array<{text:string, x:number, y:number}>}
 */
function _itemsToLines(items) {
  const cfg = PDF_PARSE_CONFIG;

  // 1. Normalize: boş stringləri at, koordinat+ölçü əlavə et
  const entries = [];
  for (const it of items) {
    if (!it.str || !it.str.trim()) continue;
    entries.push({
      x: it.transform[4],
      y: it.transform[5],
      w: it.width  || 0,
      h: it.height || Math.abs(it.transform[3]) || 10,
      str: it.str,
    });
  }
  if (!entries.length) return [];

  // 2. Sırala: yuxarıdan aşağı (PDF y yuxarı böyüyür), soldan sağa
  entries.sort((a, b) => (b.y - a.y) || (a.x - b.x));

  // 3. Qrupla: y fərqi glyph hündürlüyünün 60%-dən az isə eyni sətir
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
        const gap    = e.x - (prev.x + prev.w);
        const charW  = prev.w / Math.max(prev.str.length, 1);
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

  for (const e of entries) {
    if (lineY === null) {
      lineY = e.y;
      tol   = Math.max(e.h * cfg.yToleranceRatio, 3);
    } else if (Math.abs(e.y - lineY) > tol) {
      flush();
      lineY = e.y;
      tol   = Math.max(e.h * cfg.yToleranceRatio, 3);
    }
    group.push(e);
  }
  flush();

  return lineGroups;
}

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

// ============================================================
// 2. URL-dən tam mətn çıxar  (platform üçün: QUESTION_BANK)
// ============================================================
async function extractPdfText(url) {
  if (typeof pdfjsLib === 'undefined') {
    throw new Error('[pdf-loader] pdfjsLib tapılmadı. HTML-ə pdf.js CDN əlavə edin.');
  }
  let pdf;
  try {
    pdf = await pdfjsLib.getDocument(url).promise;
  } catch (err) {
    throw new Error(`[pdf-loader] PDF yüklənmədi (${url}): ${err.message}`);
  }
  return _pdfToText(pdf);
}

/**
 * ArrayBuffer-dən tam mətn çıxar (quiz UI üçün: fayl yükləmə).
 * @param {ArrayBuffer} buffer
 * @param {(ratio:number)=>void} [onProgress]  0..1
 */
async function extractPdfTextFromBuffer(buffer, onProgress) {
  if (typeof pdfjsLib === 'undefined') {
    throw new Error('[pdf-loader] pdfjsLib tapılmadı.');
  }
  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  } catch (e) {
    throw new Error('Bu fayl açılmadı. Xərab və ya PDF olmaya bilər.');
  }
  return _pdfToText(pdf, onProgress);
}

/** Ortaq PDF→mətn çıxarma məntiqi. */
async function _pdfToText(pdf, onProgress) {
  const total = pdf.numPages;
  let fullText = '';

  for (let p = 1; p <= total; p++) {
    try {
      const page     = await pdf.getPage(p);
      const content  = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1 });
      const rawLines   = _rebuildPageLines(content.items, viewport.width);
      const cleanLines = _mergeOrphanSymbols(rawLines);
      fullText += cleanLines.join('\n') + '\n';
      page.cleanup();
    } catch (pageErr) {
      console.warn(`[pdf-loader] Səhifə ${p} oxunmadı:`, pageErr.message);
    }

    if (onProgress) onProgress(p / total);
    // Event loop-a nəfəs ver (progress bar yenilənsin)
    if (p % 5 === 0) await new Promise(r => setTimeout(r, 0));
  }

  pdf.destroy();
  return fullText;
}

// ============================================================
// 3. Mətnden sualları parse et
// ============================================================

/**
 * Normallaşdırılmış mətnden sual massivi çıxarır.
 * Format A: simvol variantlı düz mətn sualları
 * Format C: variant içindəki nömrəli siyahılar (1. 2. 3.)
 * Hər iki format eyni blok bölmə mərhələsindən keçir.
 *
 * Geri qaytarır: [{question, options:[], answer:number}]
 */
function parseQuestionsFromText(text) {
  const questions = [];

  const normalised = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n');

  const allLines = normalised.split('\n');

  // ── Blok bölmə ──────────────────────────────────────────────
  // Yeni sual: QNUM formatında VƏ artıq ≥2 variant görülmüş
  // Bu şərt Format C siyahı elementlərini (1. 2. 3.) yanlış bölmür
  const questionBlocks  = [];
  let currentBlock      = [];
  let variantCount      = 0;
  let foundFirstQuestion = false;

  for (const line of allLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const isQNum    = QNUM.test(trimmed);
    const isVariant = SYMBOL_OPTION.test(trimmed);

    if (!foundFirstQuestion) {
      if (isQNum) { foundFirstQuestion = true; currentBlock = [trimmed]; variantCount = 0; }
      continue;
    }

    if (isVariant) variantCount++;

    if (isQNum && variantCount >= 2) {
      if (currentBlock.length) questionBlocks.push(currentBlock.join('\n'));
      currentBlock = [trimmed];
      variantCount = 0;
    } else {
      currentBlock.push(trimmed);
    }
  }
  if (currentBlock.length) questionBlocks.push(currentBlock.join('\n'));

  // ── Hər bloku parse et ──────────────────────────────────────
  questionBlocks
    .map(b => b.trim())
    .filter(Boolean)
    .forEach((block, blockIdx) => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        console.warn(`[pdf-loader] Blok ${blockIdx + 1} çox qısadır, keçilir:`, block.slice(0, 60));
        return;
      }

      const hasSymbol  = lines.some(l => SYMBOL_OPTION.test(l));
      const hasNumList = lines.some(l => /^[1-9]\.\s+\S/.test(l));

      if (!hasSymbol) {
        console.warn(`[pdf-loader] Blok ${blockIdx + 1}-də variant tapılmadı, keçilir.`);
        return;
      }

      if (hasSymbol && hasNumList) {
        _parseFormatC(lines, blockIdx, questions);
      } else {
        _parseFormatA(lines, blockIdx, questions);
      }
    });

  return questions;
}

// ── Format A Parser ───────────────────────────────────────────
// Standart simvol variantlı suallar (•/✓ ilə işarələnmiş)
function _parseFormatA(lines, blockIdx, questions) {
  let questionLines  = [];
  let optionStartIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    if (/^[✓✔√☑\u221A]\s*$/.test(lines[i])) { optionStartIdx = i; break; }
    if (SYMBOL_OPTION.test(lines[i]))          { optionStartIdx = i; break; }
    questionLines.push(lines[i]);
  }

  if (optionStartIdx === -1 || questionLines.length === 0) {
    console.warn(`[pdf-loader] FormatA Blok ${blockIdx + 1}: variant tapılmadı, keçilir.`);
    return;
  }

  const questionText = questionLines.join(' ').replace(/^\d+\.\s*/, '').trim();
  if (!questionText) return;

  const { options, correctAnswer } = _extractOptions(lines, optionStartIdx);

  if (options.length < 2) {
    console.warn(`[pdf-loader] FormatA "${questionText.slice(0, 40)}…" — variant sayı azdır.`);
    return;
  }
  if (correctAnswer === -1) {
    console.warn(`[pdf-loader] FormatA "${questionText.slice(0, 40)}…" — düzgün cavab tapılmadı.`);
  }

  questions.push({ question: questionText, options, answer: correctAnswer });
}

// ── Format C Parser ───────────────────────────────────────────
// Variant içindəki nömrəli siyahılar (1. 2. 3.) olan suallar
function _parseFormatC(lines, blockIdx, questions) {
  let symStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (SYMBOL_OPTION.test(lines[i]) || /^[✓✔√☑\u221A]\s*$/.test(lines[i])) {
      symStart = i; break;
    }
  }
  if (symStart === -1) {
    console.warn(`[pdf-loader] FormatC Blok ${blockIdx + 1}: simvol variant tapılmadı.`);
    return;
  }

  const questionText = lines.slice(0, symStart)
    .join(' ')
    .replace(/^\d+\.\s*/, '')
    .trim();

  if (!questionText) return;

  const { options, correctAnswer } = _extractOptions(lines, symStart);

  if (options.length < 2) {
    console.warn(`[pdf-loader] FormatC "${questionText.slice(0, 40)}…" — variant sayı azdır.`);
    return;
  }
  if (correctAnswer === -1) {
    console.warn(`[pdf-loader] FormatC "${questionText.slice(0, 40)}…" — düzgün cavab tapılmadı.`);
  }

  questions.push({ question: questionText, options, answer: correctAnswer });
}

/**
 * Ortaq variant çıxarma məntiqi — Format A və C tərəfindən istifadə edilir.
 * Çox sətirli variant mətni dəstəklənir (curOpt tracking).
 *
 * @param {string[]} lines
 * @param {number}   startIdx  — ilk variant sətirinin indeksi
 * @returns {{ options: string[], correctAnswer: number }}
 */
function _extractOptions(lines, startIdx) {
  const options       = [];
  let   correctAnswer = -1;
  let   nextIsCorrect = false;
  let   curOpt        = -1;  // çox sətirli variant üçün aktiv indeks

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];

    // Tək sətirlik düzgün cavab işarəsi (növbəti sətir həmin cavabdır)
    if (/^[✓✔√☑\u221A]\s*$/.test(line)) {
      nextIsCorrect = true;
      continue;
    }

    const isCorrect = nextIsCorrect || CORRECT_CHARS.test(line);
    const isOption  = SYMBOL_OPTION.test(line);
    nextIsCorrect   = false;

    // Nömrəli siyahı sətiri — Format C mətni, variant deyil → dayandır
    if (/^\d+\.\s+\S/.test(line) && !SYMBOL_OPTION.test(line)) break;

    if (!isOption) {
      // Simvolsuz sətir: aktiv varianta davam mətn kimi əlavə et
      if (curOpt >= 0) {
        options[curOpt] += ' ' + line;
      } else if (isCorrect) {
        // Bəzən simvoldan ayrı sətirdə sual gəlir
        options.push(line.trim());
        correctAnswer = options.length - 1;
        curOpt = options.length - 1;
      }
      continue;
    }

    // Simvollu sətir: yeni variant
    const clean = line
      .replace(/^[•∙·●◦‣▪◾■✓✔√☑\u2022\u221A\u25CF\u25AA\u25A0\u25C6]\s*/, '')
      .trim();
    if (!clean) continue;

    options.push(clean);
    curOpt = options.length - 1;
    if (isCorrect) correctAnswer = curOpt;
  }

  return { options, correctAnswer };
}

// ============================================================
// 4. PDFParser sinifi — ArrayBuffer əsaslı, quiz UI üçün
// ============================================================

/**
 * Quiz UI tərəfindən istifadə edilən sinif.
 * parse() → [{question, options:{A,B,...}, correct:'A'|null}]
 *
 * Bu format QUESTION_BANK-dan fərqlidir (options massiv deyil obyekt).
 * Quiz UI bunu birbaşa render edir.
 */
class PDFParser {
  /**
   * @param {ArrayBuffer} buffer
   * @param {(ratio:number)=>void} [onProgress]
   * @returns {Promise<Array>}
   */
  async parse(buffer, onProgress) {
    const text = await extractPdfTextFromBuffer(buffer, onProgress);
    const raw  = parseQuestionsFromText(text);

    // Massiv formatını {A,B,C...} / correct formatına çevir
    return raw.map(q => this._toLetterFormat(q)).filter(q => q !== null);
  }

  /**
   * {question, options:[], answer:N} → {text, options:{A:..}, correct:'A'|null}
   */
  _toLetterFormat(q) {
    if (!q.options || q.options.length < 2) return null;
    const letters = 'ABCDEFGHIJ';
    const opts    = {};
    let correct   = null;

    q.options.forEach((text, i) => {
      const letter = letters[i] || ('Z' + i);
      opts[letter] = text;
      if (i === q.answer) correct = letter;
    });

    return {
      number:  q.number  || null,
      text:    q.question,
      options: opts,
      correct,
    };
  }
}

// ============================================================
// 5. Bir PDF yüklə və QUESTION_BANK-a yaz  (platform üçün)
// ============================================================
async function loadQuestionsFromPDF(url, subjectName) {
  console.info(`[pdf-loader] "${subjectName}" yüklənir: ${url}`);

  let text;
  try {
    text = await extractPdfText(url);
  } catch (err) {
    console.error(`[pdf-loader] "${subjectName}" üçün PDF oxunmadı:`, err.message);
    QUESTION_BANK[subjectName] = [];
    return;
  }

  const parsed = parseQuestionsFromText(text);

  // ── Dinamik filter ────────────────────────────────────────
  const valid = parsed.filter(q => {
    const t = q.question.trim();

    if (q.answer === -1) {
      console.warn(`[pdf-loader] Düzgün cavabsız sual atlandı: "${t.slice(0, 40)}…"`);
      return false;
    }

    const minLen = _getMinLength(t);
    if (t.length < minLen) {
      console.warn(`[pdf-loader] Çox qısa sual atlandı (${t.length}<${minLen}): "${t}"`);
      return false;
    }

    return true;
  });

  QUESTION_BANK[subjectName] = valid;

  const filteredOut = parsed.length - valid.length;
  console.info(
    `[pdf-loader] "${subjectName}" tamamlandı: ` +
    `${valid.length} sual` +
    (filteredOut ? ` | ${filteredOut} qırıq` : '')
  );
}

// ============================================================
// 6. subjects.json-dan bütün fənləri avtomatik yüklə
// ============================================================
const PdfLoadingUI = {
  _el: null, _fill: null, _title: null, _interval: null, _progress: 0,

  show(message) {
    this._el    = this._el    || document.getElementById('pdfLoadingOverlay');
    this._fill  = this._fill  || document.getElementById('pdfProgressFill');
    this._title = this._title || document.getElementById('pdfLoadingTitle');
    if (!this._el) return;
    if (this._title) this._title.textContent = message || 'Suallar Yüklənir...';
    if (this._fill)  this._fill.style.width  = '0%';
    this._el.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    this._progress = 0;
    clearInterval(this._interval);
    this._interval = setInterval(() => {
      if (this._progress < 85) {
        this._progress = Math.min(this._progress + 5, 85);
        if (this._fill) this._fill.style.width = this._progress + '%';
      }
    }, 200);
  },

  update(message, pct) {
    if (this._title) this._title.textContent = message;
    if (this._fill && pct !== undefined) {
      clearInterval(this._interval);
      this._fill.style.width = Math.min(pct, 95) + '%';
    }
  },

  hide() {
    clearInterval(this._interval);
    if (this._fill) this._fill.style.width = '100%';
    setTimeout(() => {
      if (this._el)   this._el.classList.add('hidden');
      if (this._fill) this._fill.style.width = '5%';
      document.body.style.overflow = '';
    }, 400);
  }
};

async function autoLoadAllSubjects(subjectsUrl) {
  subjectsUrl = subjectsUrl || './data/subjects.json';
  PdfLoadingUI.show('Fənlər Yüklənir...');

  let subjects;
  try {
    const res = await fetch(subjectsUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    subjects = await res.json();
  } catch (err) {
    console.error('[pdf-loader] subjects.json oxunmadı:', err.message);
    PdfLoadingUI.hide();
    if (typeof renderTestSubjects === 'function') renderTestSubjects();
    return;
  }

  const entries = Object.entries(subjects);
  if (!entries.length) {
    console.warn('[pdf-loader] subjects.json boşdur.');
    PdfLoadingUI.hide();
    if (typeof renderTestSubjects === 'function') renderTestSubjects();
    return;
  }

  for (let i = 0; i < entries.length; i++) {
    const [name, pdfUrl] = entries[i];
    const pct = Math.round(((i + 1) / entries.length) * 90);
    PdfLoadingUI.update(`"${name}" yüklənir… (${i + 1}/${entries.length})`, pct);
    await loadQuestionsFromPDF(pdfUrl, name);
  }

  PdfLoadingUI.hide();

  const totalQ = Object.values(QUESTION_BANK)
    .reduce((sum, arr) => sum + arr.length, 0);

  console.info(
    `[pdf-loader] Bütün fənlər yükləndi. ` +
    `Cəmi: ${Object.keys(QUESTION_BANK).length} fənn, ${totalQ} sual.`
  );

  if (typeof renderTestSubjects === 'function') {
    renderTestSubjects();
  } else {
    console.warn('[pdf-loader] renderTestSubjects() tapılmadı.');
  }
}

// ============================================================
// 7. Avtomatik başlat
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  window.initTestSystem = function () {
    if (testState && testState.initialized) return;
    if (typeof testState !== 'undefined') testState.initialized = true;
    autoLoadAllSubjects();
  };
  if (typeof testState !== 'undefined' && testState.initialized) {
    autoLoadAllSubjects();
  }
});

// ============================================================
// 8. Debug alətləri
// ============================================================

/** Konsol: səhifənin ham sətirləri. İstifadə: debugPdf('./pdf/maliyyeQ26.pdf') */
window.debugPdf = async function (url, pageNum = 1) {
  if (typeof pdfjsLib === 'undefined') { console.error('[debugPdf] pdfjsLib yoxdur'); return; }
  const pdf      = await pdfjsLib.getDocument(url).promise;
  const page     = await pdf.getPage(pageNum);
  const content  = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1 });
  console.group(`[debugPdf] ${url} — Səhifə ${pageNum}  (${viewport.width.toFixed(0)}×${viewport.height.toFixed(0)})`);
  const rawLines   = _rebuildPageLines(content.items, viewport.width);
  const cleanLines = _mergeOrphanSymbols(rawLines);
  console.log('Lines after rebuild:', cleanLines.length);
  cleanLines.forEach((l, i) => console.log(`  ${String(i + 1).padStart(3, ' ')}: ${l}`));
  console.groupEnd();
  return cleanLines;
};

/** Konsol: URL-dəki sualları parse et. İstifadə: testParse('./pdf/maliyyeQ26.pdf') */
window.testParse = async function (url) {
  const text      = await extractPdfText(url);
  const questions = parseQuestionsFromText(text);
  console.group(`[testParse] ${url} — ${questions.length} sual`);
  questions.forEach((q, i) => {
    const status = q.answer === -1 ? '❌' : '✅';
    console.log(`${status} ${i + 1}. ${q.question.slice(0, 60)} | cavab: ${q.answer}`);
  });
  console.groupEnd();
  return questions;
};

/** Konsol: ArrayBuffer-dan parse et (fayl seçimi sonrası). İstifadə: testParseFile(file) */
window.testParseFile = async function (file) {
  const buffer    = await file.arrayBuffer();
  const parser    = new PDFParser();
  const questions = await parser.parse(buffer, r => console.log(`Progress: ${(r * 100).toFixed(0)}%`));
  console.group(`[testParseFile] ${file.name} — ${questions.length} sual`);
  questions.forEach((q, i) => {
    console.log(`${q.correct ? '✅' : '❌'} ${i + 1}. ${q.text.slice(0, 60)} | cavab: ${q.correct}`);
  });
  console.groupEnd();
  return questions;
};
