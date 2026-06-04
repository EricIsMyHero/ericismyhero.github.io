// ============================================================
// PDF-LOADER.JS  —  v3.0  (Production)
// ============================================================
// Düzəlişlər (v3.0):
//   • MIN_QUESTION_LENGTH dinamik edildi: "nədir?", "nədir :"
//     kimi terminoloji suallar artıq atlanmır
//   • Blok bölmə yenidən yazıldı: seenSymbol yerinə
//     variantCount sayacı istifadə edilir (≥2 variant görüldükdən
//     sonra növbəti QNUM sual başlangıcı sayılır)
//   • Qısa suallar üçün ikili filter: həm uzunluq HƏM cavab
//     olmalıdır; amma sual işarəsi / terminoloji markerlər
//     varsa limit aşağı düşür
//   • Sual mətni toplama düzəldildi: ":" ilə bitən qısa
//     mətni rəqəmli siyahıyla birlikdə saxlayır (Format C)
//   • _isQuestionLine() köməkçisi əlavə edildi: sual mətni
//     deyil variant sətiri olan "1. X" formatını aşkarlayır
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
// 1. PDF-dən tam mətn çıxar  (koordinat əsaslı)
// ============================================================

function _detectColumns(tagged, pageWidth) {
  if (!pageWidth || tagged.length < 6) return null;
  const xs = tagged.map(t => t.x).sort((a, b) => a - b);
  let maxGap = 0, splitX = -1;
  for (let i = 1; i < xs.length; i++) {
    const gap = xs[i] - xs[i - 1];
    if (gap > maxGap) { maxGap = gap; splitX = (xs[i - 1] + xs[i]) / 2; }
  }
  return maxGap > pageWidth * 0.25 ? splitX : null;
}

function _buildLinesFromItems(items) {
  if (!items.length) return [];
  const Y_TOLERANCE = 5;
  const lineGroups  = [];
  const sorted = [...items].sort((a, b) => {
    const dy = b.y - a.y;
    if (Math.abs(dy) > 4) return dy;
    return a.x - b.x;
  });
  for (const item of sorted) {
    const existing = lineGroups.find(g => Math.abs(g.y - item.y) <= Y_TOLERANCE);
    if (existing) existing.parts.push(item);
    else lineGroups.push({ y: item.y, parts: [item] });
  }
  lineGroups.sort((a, b) => b.y - a.y);
  return lineGroups.map(group => {
    group.parts.sort((a, b) => a.x - b.x);
    let result = '';
    for (let i = 0; i < group.parts.length; i++) {
      const cur  = group.parts[i];
      const prev = group.parts[i - 1];
      if (i === 0) { result += cur.str; continue; }
      const gap      = cur.x - (prev.x + prev.width);
      const avgCharW = prev.width / (prev.str.length || 1);
      const needsSp  = gap > avgCharW * 0.3;
      result += (needsSp && !result.endsWith(' ') ? ' ' : '') + cur.str;
    }
    return result.trim();
  }).filter(Boolean);
}

function _rebuildPageLines(items, pageWidth) {
  const valid  = items.filter(item => item.str && item.str.trim() !== '');
  if (!valid.length) return [];
  const tagged = valid.map(item => ({
    str  : item.str,
    x    : item.transform[4],
    y    : item.transform[5],
    width: item.width || 0,
  }));
  const splitX = _detectColumns(tagged, pageWidth);
  if (splitX !== null) {
    return [
      ..._buildLinesFromItems(tagged.filter(t => t.x < splitX)),
      ..._buildLinesFromItems(tagged.filter(t => t.x >= splitX)),
    ];
  }
  return _buildLinesFromItems(tagged);
}

function _mergeOrphanSymbols(lines) {
  const LONE_SYMBOL = /^[\u2022\u221A\u25CF\u25AA\u25A0\u25C6•√●▪■◆✓✔]\s*$/;
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
  let fullText = '';
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    try {
      const page     = await pdf.getPage(pageNum);
      const content  = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1 });
      const rawLines   = _rebuildPageLines(content.items, viewport.width);
      const cleanLines = _mergeOrphanSymbols(rawLines);
      fullText += cleanLines.join('\n') + '\n';
    } catch (pageErr) {
      console.warn(`[pdf-loader] Səhifə ${pageNum} oxunmadı:`, pageErr.message);
    }
  }
  return fullText;
}

// ============================================================
// 2. Mətnden sualları parse et
// ============================================================

const CORRECT_CHARS = /^[\u221A\u2713\u2714\u2611\u2612√✓✔☑]/;
const SYMBOL_OPTION = /^[\u2022\u221A\u2713\u2714\u2611\u2612\u25CF\u25AA\u25A0\u25C6•√✓✔☑●▪■◆]\s*/;

// ── Sual uzunluq yoxlaması ────────────────────────────────────
// Terminoloji suallar ("X nədir?", "X nədir :", "X dedikdə nə başa düşülür?")
// qısadırlar amma etibarlıdırlar. Onlar üçün limit aşağı düşür.
const TERMINOLOGIC_MARKERS = [
  /nədir[\s?:]/i,
  /nə deməkdir/i,
  /nədən ibarətdir/i,
  /hansıdır/i,
  /neçədir/i,
  /kimdir/i,
  /\?/,            // Sual işarəsi olan hər şey
];

function _isTerminologicQuestion(text) {
  return TERMINOLOGIC_MARKERS.some(rx => rx.test(text));
}

function _getMinLength(text) {
  // Terminoloji suallar üçün minimum 5 hərf,
  // adi suallar üçün minimum 20 hərf
  return _isTerminologicQuestion(text) ? 5 : 20;
}

// ── Blok bölmə köməkçisi ──────────────────────────────────────
// Bir sətrin "sual nömrəsi" olub-olmadığını yoxla.
// ŞƏRT: ≥2 variant artıq görülmüş OLMALIDIR —
// yəni bu, Format C siyahı elementi deyil, yeni sualdır.
const QNUM = /^\d+\.\s+\S/;

function parseQuestionsFromText(text) {
  const questions = [];

  const normalised = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g,   '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n');

  const allLines = normalised.split('\n');
  const questionBlocks = [];
  let currentBlock  = [];
  // seenSymbol → variantCount: daha dəqiq sayaclıq
  let variantCount  = 0;
  let foundFirstQuestion = false;

  for (const line of allLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const isQNum    = QNUM.test(trimmed);
    const isVariant = SYMBOL_OPTION.test(trimmed);

    if (!foundFirstQuestion) {
      if (isQNum) {
        foundFirstQuestion = true;
        currentBlock  = [trimmed];
        variantCount  = 0;
      }
      continue;
    }

    if (isVariant) {
      variantCount++;
    }

    // Yeni sual başlanğıcı: QNUM + artıq ≥2 variant görülüb
    // Bu şərt Format C siyahı elementlərini (1. 2. 3.) sual kimi bölünməsinin qarşısını alır
    if (isQNum && variantCount >= 2) {
      if (currentBlock.length) questionBlocks.push(currentBlock.join('\n'));
      currentBlock = [trimmed];
      variantCount = 0;
    } else {
      currentBlock.push(trimmed);
    }
  }
  if (currentBlock.length) questionBlocks.push(currentBlock.join('\n'));

  questionBlocks
    .map(b => b.trim())
    .filter(Boolean)
    .forEach((block, blockIdx) => {
      const lines = block
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

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
function _parseFormatA(lines, blockIdx, questions) {
  let questionLines  = [];
  let optionStartIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    if (/^[\u221A√✓✔]\s*$/.test(lines[i])) { optionStartIdx = i; break; }
    if (SYMBOL_OPTION.test(lines[i]))        { optionStartIdx = i; break; }
    questionLines.push(lines[i]);
  }

  if (optionStartIdx === -1 || questionLines.length === 0) {
    console.warn(`[pdf-loader] FormatA Blok ${blockIdx + 1}: variant tapılmadı, keçilir.`);
    return;
  }

  const questionText = questionLines.join(' ').replace(/^\d+\.\s*/, '').trim();
  if (!questionText) return;

  const options       = [];
  let   correctAnswer = -1;
  let   nextIsCorrect = false;

  for (let i = optionStartIdx; i < lines.length; i++) {
    const line = lines[i];

    if (/^[\u221A√✓✔]\s*$/.test(line)) {
      nextIsCorrect = true;
      continue;
    }

    const isCorrect = nextIsCorrect || CORRECT_CHARS.test(line);
    const isOption  = SYMBOL_OPTION.test(line);
    nextIsCorrect   = false;

    if (/^\d+\.\s+\S/.test(line) && !SYMBOL_OPTION.test(line)) break;

    if (!isOption) {
      if (isCorrect) {
        options.push(line.trim());
        correctAnswer = options.length - 1;
      } else if (options.length > 0) {
        options[options.length - 1] += ' ' + line;
      }
      continue;
    }

    const clean = line.replace(/^[\u2022\u221A\u25CF\u25AA\u25A0\u25C6•√●▪■◆✓✔]\s*/, '').trim();
    if (!clean) continue;

    options.push(clean);
    if (isCorrect) correctAnswer = options.length - 1;
  }

  if (options.length < 2) {
    console.warn(`[pdf-loader] FormatA "${questionText.slice(0, 40)}…" — variant sayı azdır, keçilir.`);
    return;
  }
  if (correctAnswer === -1) {
    console.warn(`[pdf-loader] "${questionText.slice(0, 40)}…" — düzgün cavab tapılmadı. answer=-1.`);
  }

  questions.push({ question: questionText, options, answer: correctAnswer });
}

// ── Format C Parser ───────────────────────────────────────────
function _parseFormatC(lines, blockIdx, questions) {
  let symStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (SYMBOL_OPTION.test(lines[i]) || /^[\u221A√✓✔]\s*$/.test(lines[i])) {
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

  const options       = [];
  let   correctAnswer = -1;
  let   nextIsCorrect = false;

  for (let i = symStart; i < lines.length; i++) {
    const line = lines[i];

    if (/^[\u221A√✓✔]\s*$/.test(line)) {
      nextIsCorrect = true;
      continue;
    }

    const isCorrect = nextIsCorrect || CORRECT_CHARS.test(line);
    const isOption  = SYMBOL_OPTION.test(line);
    nextIsCorrect   = false;

    if (/^\d+\.\s+\S/.test(line) && !SYMBOL_OPTION.test(line)) break;

    if (!isOption) {
      if (isCorrect) {
        options.push(line.trim());
        correctAnswer = options.length - 1;
      } else if (options.length > 0) {
        options[options.length - 1] += ' ' + line;
      }
      continue;
    }

    const clean = line.replace(/^[\u2022\u221A\u25CF\u25AA\u25A0\u25C6•√●▪■◆✓✔]\s*/, '').trim();
    if (!clean) continue;

    options.push(clean);
    if (isCorrect) correctAnswer = options.length - 1;
  }

  if (options.length < 2) {
    console.warn(`[pdf-loader] FormatC "${questionText.slice(0, 40)}…" — variant sayı azdır, keçilir.`);
    return;
  }
  if (correctAnswer === -1) {
    console.warn(`[pdf-loader] FormatC "${questionText.slice(0, 40)}…" — düzgün cavab tapılmadı. answer=-1.`);
  }

  questions.push({ question: questionText, options, answer: correctAnswer });
}

// ============================================================
// 3. Bir PDF yüklə və QUESTION_BANK-a yaz
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
  // Terminoloji suallar ("SWİFT nədir?" kimi) qısa olsa belə keçirlər.
  // Cavabsız suallar həmişə atlanır.
  const valid = parsed.filter(q => {
    const t = q.question.trim();

    // Cavabsız sual — həmişə at
    if (q.answer === -1) {
      console.warn(`[pdf-loader] Düzgün cavabsız sual atlandı: "${t.slice(0, 40)}…"`);
      return false;
    }

    // Dinamik uzunluq limiti
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
// 4. subjects.json-dan bütün fənləri avtomatik yüklə
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
// 5. Avtomatik başlat
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
// 6. Debug yardımçısı
// ============================================================
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

// ── İnteraktiv test funksiyası (konsolda istifadə üçün) ──────
// İstifadə: window.testParse('./pdf/maliyyeQ26.pdf')
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
