// ============================================================
// FEATURES.JS
// İçindəkilər:
// - PDF Yükləmə Overlay (showPdfLoading, hidePdfLoading)
// - AI Widget (toggleAI, sendMessage, addBotMsg, addUserMsg, typing)
// - AI Sorğu Funksiyası (askAI, buildContext)
// - Test Sistemi (initTestSystem, selectSubject, startTest,
//                 renderQuizQuestion, selectAnswer, finishTest,
//                 renderReview, resetTest, timer)
// - PWA / Service Worker
// - Support Toast
// ============================================================

// ── PDF Yükləmə Overlay ───────────────────────────────────────
let pdfProgressInterval = null;

function showPdfLoading(isDownload) {
  const overlay = document.getElementById('pdfLoadingOverlay');
  const title   = document.getElementById('pdfLoadingTitle');
  const fill    = document.getElementById('pdfProgressFill');

  title.textContent = isDownload ? 'PDF Endirilir...' : 'PDF Açılır...';
  fill.style.width  = '0%';
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  let progress = 0;
  clearInterval(pdfProgressInterval);
  pdfProgressInterval = setInterval(() => {
    if (progress < 90) {
      progress += 30;
      fill.style.width = Math.min(progress, 90) + '%';
    }
  }, 100);

  setTimeout(hidePdfLoading, 4000);
}

function hidePdfLoading() {
  const overlay = document.getElementById('pdfLoadingOverlay');
  const fill    = document.getElementById('pdfProgressFill');

  clearInterval(pdfProgressInterval);
  fill.style.width = '100%';

  setTimeout(() => {
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
    fill.style.width = '5%';
  }, 300);
}

// ── AI Widget ─────────────────────────────────────────────────
const BACKEND_URL   = "https://ericismyhero-github-io.vercel.app";
const AI_FREE_DAILY = 5;
const AI_FREE_CHARS = 250;
const AI_PREM_DAILY = 12;
const AI_PREM_CHARS = 400;
let aiOpen = false;

const PREMIUM_PLANS_INFO = [
  { key: '7d',       name: '7 gün',   price: '2.49₼' },
  { key: '15d',      name: '15 gün',  price: '4.99₼' },
  { key: '32d',      name: '32 gün',  price: '9.99₼' },
  { key: 'lifetime', name: 'Ömürlük', price: '19.99₼' },
];

function toggleAI() {
  aiOpen = !aiOpen;
  const chat = document.getElementById('ai-chat');
  if (aiOpen) {
    chat.classList.add('ai-open');
    refreshAiAuthState();
    if (!document.getElementById('ai-messages').children.length) {
      addBotMsg(t('aiGreeting'));
    }
  } else {
    chat.classList.remove('ai-open');
  }
}

function _aiTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function _aiIsPremiumActive(d) {
  if (!d) return false;
  if (d.premiumLifetime) return true;
  if (d.premiumExpiresAt && new Date(d.premiumExpiresAt) > new Date()) return true;
  return false;
}

async function _aiGetUsage() {
  const free = { count: 0, remaining: AI_FREE_DAILY, dailyLimit: AI_FREE_DAILY, charLimit: AI_FREE_CHARS, isPremium: false };
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const db   = typeof getDb === 'function' ? getDb() : null;
  if (!user || !db) return free;
  try {
    const ref  = db.collection('users').doc(user.uid).collection('progress').doc('main');
    const snap = await ref.get();
    const d    = snap.data() || {};

    const isPremium  = _aiIsPremiumActive(d);
    const dailyLimit = isPremium ? AI_PREM_DAILY : AI_FREE_DAILY;
    const charLimit  = isPremium ? AI_PREM_CHARS : AI_FREE_CHARS;
    const count = (d.aiAskDate === _aiTodayStr()) ? (d.aiAskCount || 0) : 0;

    return { count, remaining: Math.max(0, dailyLimit - count), dailyLimit, charLimit, isPremium, premiumPlan: d.premiumPlan };
  } catch (e) {
    console.warn('[AI] limit oxunmadı:', e);
    return free;
  }
}

async function _aiIncrementUsage() {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const db   = typeof getDb === 'function' ? getDb() : null;
  if (!user || !db) return;
  try {
    const ref   = db.collection('users').doc(user.uid).collection('progress').doc('main');
    const today = _aiTodayStr();
    const snap  = await ref.get();
    const d     = snap.data() || {};
    if (d.aiAskDate === today) {
      await ref.update({ aiAskCount: firebase.firestore.FieldValue.increment(1) });
    } else {
      await ref.update({ aiAskDate: today, aiAskCount: 1 });
    }
  } catch (e) {
    console.warn('[AI] limit yazılmadı:', e);
  }
}

// ── Giriş / limit vəziyyətinə görə input sahəsi ─────────────
async function refreshAiAuthState() {
  const area = document.getElementById('ai-input-area');
  if (!area) return;

  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) {
    area.innerHTML = `
      <button class="chat-login-btn" onclick="openAuthModal('login')">
        ${t('aiLoginToWrite')}
      </button>
    `;
    return;
  }

  const { remaining, dailyLimit, charLimit, isPremium } = await _aiGetUsage();

  area.innerHTML = `
    <div id="ai-input-meta">
      <span id="ai-char-count">0/${charLimit}</span>
      <span id="ai-daily-count">${isPremium ? '<span class="material-symbols-outlined msi msi--tight">workspace_premium</span>' : ''}${t('aiDailyRemaining')} ${remaining}/${dailyLimit}</span>
    </div>
    <div id="ai-input-row">
      <input type="text" id="ai-input" placeholder="${t('aiInputPlaceholder')}" autocomplete="off" maxlength="${charLimit}" />
      <button id="ai-send-btn" onclick="sendMessage()">${t('btnSend')}</button>
    </div>
  `;

  const input   = document.getElementById('ai-input');
  const sendBtn = document.getElementById('ai-send-btn');

  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });
  input.addEventListener('input', () => {
    document.getElementById('ai-char-count').textContent = `${input.value.length}/${charLimit}`;
  });

  if (remaining <= 0) {
    input.disabled     = true;
    input.placeholder  = t('aiLimitReachedPlaceholder');
    sendBtn.disabled    = true;
  } else {
    input.focus();
  }
}

// ── Premium modalı ───────────────────────────────────────────
function openPremiumModal() {
  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) {
    if (typeof openAuthModal === 'function') openAuthModal('login');
    return;
  }
  document.getElementById('premium-plans').innerHTML = PREMIUM_PLANS_INFO.map(p => `
    <button class="premium-plan-btn" onclick="choosePremiumPlan('${p.key}')">
      <span class="premium-plan-btn-name">${p.name}</span>
      <span class="premium-plan-btn-price">${p.price}</span>
    </button>
  `).join('');
  const msg = document.getElementById('premium-redeem-msg');
  msg.textContent = '';
  document.getElementById('premium-code-input').value = '';
  document.getElementById('premiumOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closePremiumModal() {
  document.getElementById('premiumOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}

function choosePremiumPlan(key) {
  const plan = PREMIUM_PLANS_INFO.find(p => p.key === key);
  if (!plan) return;
  closePremiumModal();
  openQRModal('birbank', `Seçdiyin plan: ${plan.name} (${plan.price}) — bu məbləği göndər, kodu al və "Yüksəlt" bölməsində aktivləşdir.`);
}

async function redeemPremiumCode() {
  const input = document.getElementById('premium-code-input');
  const msg   = document.getElementById('premium-redeem-msg');
  const code  = input.value.trim();
  if (!code) return;

  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) { if (typeof openAuthModal === 'function') openAuthModal('login'); return; }

  msg.style.color  = 'var(--muted)';
  msg.textContent  = 'Yoxlanılır...';

  try {
    const res = await fetch(`${BACKEND_URL}/api/redeem-code`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ code, uid: user.uid })
    });
    const d = await res.json();
    if (!res.ok) {
      msg.style.color = 'var(--red)';
      msg.textContent = d.error || 'Kod düzgün deyil.';
      return;
    }
    msg.style.color = 'var(--green)';
    msg.textContent = 'Uğurlu! Premium aktivləşdi.';
    input.value = '';
    setTimeout(() => { closePremiumModal(); refreshAiAuthState(); }, 1200);
  } catch (e) {
    msg.style.color = 'var(--red)';
    msg.textContent = 'Bağlantı xətası.';
  }
}

function addBotMsg(text) {
  const wrap = document.getElementById('ai-messages');
  const div  = document.createElement('div');
  div.className   = 'ai-msg bot';
  div.textContent = text;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
}

function addUserMsg(text) {
  const wrap = document.getElementById('ai-messages');
  const div  = document.createElement('div');
  div.className   = 'ai-msg user';
  div.textContent = text;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
}

function showTyping() {
  const wrap = document.getElementById('ai-messages');
  const el   = document.createElement('div');
  el.className = 'ai-msg bot typing';
  el.id        = 'ai-typing';
  el.innerHTML = '<span></span><span></span><span></span>';
  wrap.appendChild(el);
  wrap.scrollTop = wrap.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('ai-typing');
  if (el) el.remove();
}

const _aiPdfTextCache = {};
const AI_PDF_CHAR_CAP     = 6000;  // fənn üzrə mətn limiti
const AI_MAX_PDFS_PER_ASK = 2;     // sorğu başına oxunan PDF sayı

async function _aiExtractPdfCached(file) {
  if (_aiPdfTextCache[file] !== undefined) return _aiPdfTextCache[file];
  try {
    const url  = `${BASE}pdf/${file}`;
    const text = await extractPdfText(url);
    const trimmed = (text || '').slice(0, AI_PDF_CHAR_CAP);
    _aiPdfTextCache[file] = trimmed;
    return trimmed;
  } catch (e) {
    console.warn('[AI] PDF oxunmadı:', file, e.message);
    _aiPdfTextCache[file] = '';
    return '';
  }
}

async function buildContext(question) {
  if (typeof data === 'undefined') return '';
  const q       = question.toLowerCase();
  const matched = [];
  for (const [course, courseObj] of Object.entries(data)) {
    for (const [subject, subObj] of Object.entries(courseObj.subjects || {})) {
      const words = subject.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      if (words.filter(w => q.includes(w)).length > 0) {
        matched.push({ course, subject, subObj });
      }
    }
  }

  if (!matched.length) {
    const all = [];
    for (const [course, courseObj] of Object.entries(data))
      for (const subj of Object.keys(courseObj.subjects || {}))
        all.push(`${course}: ${subj}`);
    return `Saytda mövcud fənlər (heç biri sualla üst-üstə düşmədi):\n${all.join('\n')}`;
  }

  // Uyğun fənnlərin PDF-lərindən əsl mətni çıxar (RAG)
  const pdfsToRead = [];
  for (const m of matched) {
    for (const pdf of (m.subObj.pdfs || [])) {
      pdfsToRead.push({ ...m, pdf });
      if (pdfsToRead.length >= AI_MAX_PDFS_PER_ASK) break;
    }
    if (pdfsToRead.length >= AI_MAX_PDFS_PER_ASK) break;
  }

  const sections = [];
  for (const m of matched) {
    sections.push(`Kurs: ${m.course} | Fənn: ${m.subject} | Növ: ${m.subObj.type} | Semestr: ${m.subObj.semester} | Materiallar: ${(m.subObj.pdfs || []).map(p => p.name).join(', ')}`);
  }

  if (typeof extractPdfText === 'function' && typeof BASE !== 'undefined') {
    for (const { subject, pdf } of pdfsToRead) {
      const text = await _aiExtractPdfCached(pdf.file);
      if (text) sections.push(`\n--- "${pdf.name}" (${subject}) sənədinin mətni ---\n${text}`);
    }
  }

  return sections.join('\n');
}

async function sendMessage() {
  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) {
    if (typeof openAuthModal === 'function') openAuthModal('login');
    return;
  }

  const input = document.getElementById('ai-input');
  if (!input) return;

  const usage = await _aiGetUsage();
  const text  = input.value.trim().slice(0, usage.charLimit);
  if (!text) return;

  if (usage.remaining <= 0) {
    addBotMsg(t('aiLimitReached').replace(/{n}/g, usage.dailyLimit));
    refreshAiAuthState();
    return;
  }

  input.value    = '';
  input.disabled = true;
  addUserMsg(text);
  showTyping();

  try {
    await _aiIncrementUsage();
    const res = await fetch(`${BACKEND_URL}/api/ask`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ question: text, context: await buildContext(text), lang: (typeof lang !== 'undefined' ? lang : 'az') })
    });
    removeTyping();
    if (!res.ok) { addBotMsg(t('aiServerError') + ' (' + res.status + ').'); }
    else { const d = await res.json(); addBotMsg(d.reply || t('aiNoReply')); }
  } catch (e) {
    removeTyping();
    addBotMsg(t('aiConnError'));
  } finally {
    refreshAiAuthState();
  }
}

let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById("installBanner").classList.add("visible");
});

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => { deferredPrompt = null; dismissBanner(); });
  }
}

function dismissBanner() {
  document.getElementById("installBanner").classList.remove("visible");
}

window.addEventListener("appinstalled", dismissBanner);

// ── Support Toast ─────────────────────────────────────────────
(function () {
  const SHOW_DELAY   = 8000;
  const INTERVAL     = 30000;
  const VISIBLE_TIME = 5000;
  let toastTimer;

  function showToast() {
    const toast = document.getElementById('supportToast');
    if (!toast) return;
    toast.classList.remove('st-visible');
    void toast.offsetWidth;
    toast.classList.add('st-visible');
    toastTimer = setTimeout(() => toast.classList.remove('st-visible'), VISIBLE_TIME);
  }

  function dismissToast() {
    const toast = document.getElementById('supportToast');
    if (toast) toast.classList.remove('st-visible');
    clearTimeout(toastTimer);
  }

  setTimeout(showToast, SHOW_DELAY);
  setInterval(showToast, INTERVAL);
  window.dismissToast = dismissToast;
})();

// ================================================================
// TEST SİSTEMİ
// ----------------------------------------------------------------
// Məntiq (sualların seçilməsi, qarışdırma, taymer, qiymətləndirmə, Firebase-ə yazma) əvvəlki kimidir.
// Yenilik: təqdimat (kartlar, inline yükləmə vəziyyəti, nəticə halqası, baxışda filtr) və AZ/EN dəstəyi.
// ================================================================

// ── Kiçik köməkçilər ──────────────────────────────────────────
function _tEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function _tIc(name, cls) {
  return `<svg class="ic${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}
function _tTr(key, vars) {
  let s = t(key);
  if (vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
  return s;
}

// Fənn adına görə ikon (Testlər və Dashboard üçün ortaq)
function subjectIconName(subject) {
  const s = (window.UNEC && UNEC.normAz) ? UNEC.normAz(subject) : String(subject || '').toLowerCase();
  const rules = [
    [/riyaz|matemat|cebir|analiz/,                         'calculator'],
    [/statisti|istatistik|olasilik|ehtimal/,               'chart'],
    [/iqtisad/,                                            'trending-up'],
    [/karyera|career/,                                     'target'],
    [/muhasib|ucot/,                                       'receipt'],
    [/menecment|yonetim|organizasyon|idare/,               'briefcase'],
    [/market/,                                             'megaphone'],
    [/huquq/,                                              'scale'],
    [/tarix|tarih/,                                        'landmark'],
    [/ingilis|\bdil|kommunikasiya/,                        'globe'],
    [/informatika|proqram|komputer|\bikt\b|bilgi islem|texnologi/, 'laptop'],
    [/maliyye|bank|kredit/,                                'wallet'],
    [/audit/,                                              'search'],
    [/sosial|sosiol|psixolog/,                             'users'],
    [/felsef|bacariq|soft skills/,                         'sparkles'],
    [/mudafie/,                                            'shield-check']
  ];
  for (const [re, icon] of rules) if (re.test(s)) return icon;
  return 'book-open';
}

// ── Test State ────────────────────────────────────────────────
let testState = {
  initialized:     false,
  loading:         false,
  loadFailed:      false,
  selectedSubject: null,
  selectedCount:   10,
  currentQuiz:     [],
  userAnswers:     [],
  currentIndex:    0,
  timerInterval:   null,
  timeLeft:        0,
  endAt:           0,
  result:          null
};

const TEST_COUNTS = [10, 20, 30, 50];

// ── Init ──────────────────────────────────────────────────────
function initTestSystem() {
  if (testState.initialized) return;
  testState.initialized = true;
  renderTestSubjects();
}

// "Yenidən cəhd et" — fənn siyahısı yüklənməyibsə
function retryTests() {
  testState.initialized = false;
  testState.loadFailed = false;
  if (typeof window.initTestSystem === 'function') window.initTestSystem();
}

function renderTestSubjects() {
  const grid = document.getElementById('testSubjectGrid');
  if (!grid) return;

  // sualı olan fənlər əvvəl, yüklənə bilməyənlər (0 sual) sonda
  const names   = Object.keys(QUESTION_BANK).sort((a, b) => (QUESTION_BANK[a].length === 0) - (QUESTION_BANK[b].length === 0));
  const empty   = document.getElementById('testEmptyState');
  const section = document.getElementById('testSubjectSection');
  const total   = document.getElementById('testSubjectTotal');
  grid.innerHTML = '';

  const usable = names.filter(n => QUESTION_BANK[n].length > 0).length;
  if (total) total.textContent = names.length ? _tTr('testSubjectsReady', { n: usable }) : '';

  if (!names.length) {
    if (testState.loading) {
      // fənlər gələnə qədər sönük yer tutucular
      for (let i = 0; i < 6; i++) {
        const sk = document.createElement('div');
        sk.className = 'test-subject-skel skeleton';
        sk.setAttribute('aria-hidden', 'true');
        grid.appendChild(sk);
      }
    }
    if (empty) empty.hidden = testState.loading;
    if (section) section.hidden = !testState.loading;
    return;
  }
  if (empty) empty.hidden = true;
  if (section) section.hidden = false;

  names.forEach(subject => {
    const count = QUESTION_BANK[subject].length;
    const btn   = document.createElement('button');
    btn.type = 'button';
    btn.className = 'test-subject-btn';
    btn.setAttribute('data-subject', subject);
    btn.title = subject;
    const isActive = testState.selectedSubject === subject && count > 0;
    if (isActive) btn.classList.add('active');
    btn.setAttribute('aria-pressed', String(isActive));
    btn.innerHTML = `
      <span class="tsb-icon">${_tIc(subjectIconName(subject))}</span>
      <span class="tsb-name">${_tEsc(subject)}</span>
      <span class="tsb-count">${count ? _tTr('testQuestionsCount', { n: count }) : _tEsc(t('testNoQuestions'))}</span>
      <span class="tsb-check" aria-hidden="true">${_tIc('check')}</span>`;
    if (count) {
      btn.onclick = () => selectSubject(subject, btn);
    } else {
      btn.disabled = true;
      btn.classList.add('is-empty');
    }
    grid.appendChild(btn);
  });
}

// Seçilmiş fənnin məlumat sətri, sual sayı düymələri və vaxt qeydi
function _renderTestConfig() {
  const subject = testState.selectedSubject;
  if (!subject || !QUESTION_BANK[subject]) return;
  const total = QUESTION_BANK[subject].length;

  const info = document.getElementById('testSelectedInfo');
  if (info) {
    info.innerHTML = `<span class="tsi-icon">${_tIc(subjectIconName(subject))}</span>` +
      `<span class="tsi-text"><span class="tsi-label">${_tEsc(t('testSelected'))}</span><strong>${_tEsc(subject)}</strong>` +
      `<span class="tsi-count">${_tEsc(_tTr('testAvailable', { n: total }))}</span></span>`;
  }

  let anyEnabled = false;
  document.querySelectorAll('.test-count-btn').forEach(b => {
    const n = parseInt(b.dataset.count, 10);
    const off = n > total;
    b.disabled = off;
    b.classList.toggle('disabled', off);
    if (off) { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); }
    else anyEnabled = true;
  });

  if (anyEnabled) {
    // seçilmiş say uyğun deyilsə — ən böyük mövcud sayı götür deyil, ilk mövcudu
    let active = document.querySelector('.test-count-btn.active:not(.disabled)');
    if (!active) {
      active = document.querySelector('.test-count-btn:not(.disabled)');
      if (active) active.classList.add('active');
    }
    if (active) {
      testState.selectedCount = parseInt(active.dataset.count, 10);
      active.setAttribute('aria-pressed', 'true');
    }
  } else {
    // 10-dan az sual var: hamısı ilə test
    testState.selectedCount = total;
  }
  _renderTestHint();
}

function _renderTestHint() {
  const hint = document.getElementById('testTimeHint');
  const subject = testState.selectedSubject;
  if (!hint || !subject) return;
  const n = Math.min(testState.selectedCount, QUESTION_BANK[subject].length);
  hint.textContent = _tTr('testTimeHint', { n, min: n });
}

function selectSubject(subject, btn) {
  if (!QUESTION_BANK[subject] || !QUESTION_BANK[subject].length) return;
  document.querySelectorAll('.test-subject-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-pressed', 'false');
  });
  if (btn) { btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true'); }
  testState.selectedSubject = subject;

  const config = document.getElementById('testConfigSection');
  _renderTestConfig();

  config.style.display = '';
  config.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function selectCount(btn) {
  document.querySelectorAll('.test-count-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-pressed', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-pressed', 'true');
  testState.selectedCount = parseInt(btn.dataset.count, 10);
  _renderTestHint();
}

// ── Testi Başlat ──────────────────────────────────────────────
function startTest() {
  const subject = testState.selectedSubject;
  if (!subject) return;

  const pool  = QUESTION_BANK[subject];
  const count = Math.min(testState.selectedCount, pool.length);
  if (!count) return;

  // Sualları qarışdır və dilim
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);

  // Variantları hər sual üçün bir dəfə qarışdır, cavab indeksini yenilə
  testState.currentQuiz = shuffled.map(q => {
    const optionsWithIndex = q.options.map((opt, i) => ({ opt, i }));
    optionsWithIndex.sort(() => Math.random() - 0.5);
    return {
      question: q.question,
      options:  optionsWithIndex.map(o => o.opt),
      answer:   optionsWithIndex.findIndex(o => o.i === q.answer)
    };
  });

  testState.userAnswers  = new Array(count).fill(null);
  testState.currentIndex = 0;
  testState.timeLeft     = count * 60; // 1 dəq per sual
  testState.result       = null;

  document.getElementById('test-landing').style.display = 'none';
  document.getElementById('test-result').style.display  = 'none';
  document.getElementById('test-quiz').style.display    = '';
  document.body.classList.add('in-quiz');

  document.getElementById('qTotalNum').textContent = count;
  renderQuizQuestion();
  startTimer();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

// Testdən çıxış (nəticə yazılmır)
function exitTest() {
  if (!confirm(t('testExitConfirm'))) return;
  resetTest();
}

// ── Timer ──────────────────────────────────────────────────────
// Qalan vaxt bitmə anından hesablanır: tab arxa fonda olanda da düzgün işləyir.
function startTimer() {
  clearInterval(testState.timerInterval);
  testState.endAt = Date.now() + testState.timeLeft * 1000;
  updateTimerDisplay();
  testState.timerInterval = setInterval(() => {
    testState.timeLeft = Math.max(0, Math.ceil((testState.endAt - Date.now()) / 1000));
    updateTimerDisplay();
    if (testState.timeLeft <= 0) {
      clearInterval(testState.timerInterval);
      finishTest();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m       = Math.floor(testState.timeLeft / 60);
  const s       = testState.timeLeft % 60;
  const display = document.getElementById('timerDisplay');
  if (display) {
    display.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    const timerEl = document.getElementById('testTimer');
    if (testState.timeLeft <= 60) timerEl.classList.add('timer-urgent');
    else                          timerEl.classList.remove('timer-urgent');
  }
}

// ── Sualı Göstər ──────────────────────────────────────────────
function renderQuizQuestion() {
  const idx   = testState.currentIndex;
  const q     = testState.currentQuiz[idx];
  const total = testState.currentQuiz.length;
  if (!q) return;

  document.getElementById('qCurrentNum').textContent = idx + 1;

  const pct = ((idx + 1) / total) * 100;
  document.getElementById('testProgressFill').style.width = pct + '%';
  const bar = document.getElementById('testProgressBar');
  if (bar) { bar.setAttribute('aria-valuenow', String(idx + 1)); bar.setAttribute('aria-valuemax', String(total)); }

  document.getElementById('testQNumber').textContent = `${t('testQuestionWord')} ${idx + 1}`;
  document.getElementById('testQText').textContent   = q.question;

  const optContainer = document.getElementById('testOptions');
  optContainer.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D', 'E'];

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'test-option-btn';
    const chosen = testState.userAnswers[idx] === i;
    if (chosen) btn.classList.add('selected');
    btn.setAttribute('aria-pressed', String(chosen));
    const letter = document.createElement('span');
    letter.className = 'tob-letter';
    letter.textContent = letters[i] || String(i + 1);
    const text = document.createElement('span');
    text.className = 'tob-text';
    text.textContent = opt;
    btn.append(letter, text);
    btn.onclick = () => selectAnswer(i);
    optContainer.appendChild(btn);
  });

  const prevBtn   = document.getElementById('testPrevBtn');
  const nextBtn   = document.getElementById('testNextBtn');
  const finishBtn = document.getElementById('testFinishBtn');

  prevBtn.style.display   = idx === 0           ? 'none' : '';
  nextBtn.style.display   = idx === total - 1   ? 'none' : '';
  finishBtn.style.display = idx === total - 1   ? ''     : 'none';

  updateAnsweredInfo();
}

function selectAnswer(optIndex) {
  testState.userAnswers[testState.currentIndex] = optIndex;
  document.querySelectorAll('.test-option-btn').forEach((btn, i) => {
    btn.classList.toggle('selected', i === optIndex);
    btn.setAttribute('aria-pressed', String(i === optIndex));
  });
  updateAnsweredInfo();

  // Son sual deyilsə 400ms sonra irəli keç
  if (testState.currentIndex < testState.currentQuiz.length - 1) {
    setTimeout(() => quizNav(1), 380);
  }
}

function updateAnsweredInfo() {
  const answered = testState.userAnswers.filter(a => a !== null).length;
  const total    = testState.currentQuiz.length;
  const el       = document.getElementById('testAnsweredInfo');
  if (el) el.textContent = _tTr('testAnswered', { a: answered, n: total });
}

function quizNav(dir) {
  const newIdx = testState.currentIndex + dir;
  if (newIdx < 0 || newIdx >= testState.currentQuiz.length) return;
  testState.currentIndex = newIdx;

  const card = document.getElementById('testQuestionCard');
  card.classList.add('quiz-slide-out');
  setTimeout(() => {
    renderQuizQuestion();
    card.classList.remove('quiz-slide-out');
    card.classList.add('quiz-slide-in');
    setTimeout(() => card.classList.remove('quiz-slide-in'), 300);
  }, 150);
}

function confirmFinishTest() {
  const unanswered = testState.userAnswers.filter(a => a === null).length;
  if (unanswered > 0 && !confirm(_tTr('testUnansweredConfirm', { n: unanswered }))) return;
  finishTest();
}

// ── Testi Bitir ───────────────────────────────────────────────
function finishTest() {
  clearInterval(testState.timerInterval);
  document.body.classList.remove('in-quiz');

  let correct = 0;
  testState.currentQuiz.forEach((q, i) => {
    if (testState.userAnswers[i] === q.answer) correct++;
  });
  const total   = testState.currentQuiz.length;
  const pct     = Math.round((correct / total) * 100);
  const skipped = testState.userAnswers.filter(a => a === null).length;
  const wrong   = total - correct - skipped;
  testState.result = { correct, wrong, skipped, total, pct };

  document.getElementById('test-quiz').style.display   = 'none';
  document.getElementById('test-result').style.display = '';

  _paintResult();
  renderReview();
  setReviewFilter('all');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Firebase — quiz nəticəsini saxla
  if (typeof onQuizFinished === 'function') {
    const _subj = testState.selectedSubject || t('testUnknownSubject');
    onQuizFinished(_subj, correct, total, wrong);
  }
}

// Nəticə kartını (mətn, ikon, halqa) çək — dil dəyişəndə də çağırılır
function _paintResult() {
  const r = testState.result;
  if (!r) return;
  const { correct, wrong, skipped, total, pct } = r;

  let icon, titleKey, tone;
  if (pct >= 90)      { icon = 'trophy';     titleKey = 'testResExcellent'; tone = 'good'; }
  else if (pct >= 75) { icon = 'sparkles';   titleKey = 'testResGood';      tone = 'good'; }
  else if (pct >= 50) { icon = 'thumbs-up';  titleKey = 'testResAverage';   tone = 'mid'; }
  else                { icon = 'book-open';  titleKey = 'testResPractice';  tone = 'bad'; }

  const card = document.querySelector('#test-result .test-result-card');
  if (card) card.setAttribute('data-tone', tone);

  document.getElementById('resultEmoji').innerHTML = _tIc(icon);
  document.getElementById('resultTitle').textContent   = t(titleKey);
  document.getElementById('resultScore').textContent   = `${correct} / ${total}`;
  document.getElementById('resultPercent').textContent = `${pct}%`;
  document.getElementById('resultStats').innerHTML =
    `<span class="rs-correct"><b>${correct}</b>${_tEsc(t('testStatCorrect'))}</span>` +
    `<span class="rs-wrong"><b>${wrong}</b>${_tEsc(t('testStatWrong'))}</span>` +
    `<span class="rs-skip"><b>${skipped}</b>${_tEsc(t('testStatSkipped'))}</span>`;

  const ring = document.getElementById('resultRingFill');
  if (ring) {
    const C = 2 * Math.PI * 52;
    ring.style.strokeDasharray = C.toFixed(2);
    ring.style.strokeDashoffset = C.toFixed(2);
    setTimeout(() => { ring.style.strokeDashoffset = (C * (1 - pct / 100)).toFixed(2); }, 80);
  }
}

// ── İcmalı Göstər ─────────────────────────────────────────────
function renderReview() {
  const list    = document.getElementById('testReviewList');
  list.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D', 'E'];
  const counts  = { all: 0, wrong: 0, skip: 0 };

  testState.currentQuiz.forEach((q, i) => {
    const ua        = testState.userAnswers[i];
    const isCorrect = ua === q.answer;
    const isSkipped = ua === null;
    counts.all++;
    if (isSkipped) counts.skip++; else if (!isCorrect) counts.wrong++;

    const card = document.createElement('div');
    card.className = `review-item ${isCorrect ? 'ri-correct' : isSkipped ? 'ri-skip' : 'ri-wrong'}`;

    let optHtml = '';
    q.options.forEach((opt, j) => {
      let cls = 'ro-opt';
      if (j === q.answer)              cls += ' ro-correct';
      else if (j === ua && !isCorrect) cls += ' ro-wrong';
      // rəng tək başına məna daşımasın: ikon + ekran oxuyucu üçün mətn
      let mark = '';
      if (j === q.answer)              mark = `<span class="ro-mark">${_tIc('check')}<span class="sr-only">${_tEsc(t('testRevCorrect'))}</span></span>`;
      else if (j === ua && !isCorrect) mark = `<span class="ro-mark">${_tIc('x')}<span class="sr-only">${_tEsc(t('testRevWrong'))}</span></span>`;
      optHtml += `<div class="${cls}"><span class="ro-letter">${letters[j] || j + 1}</span><span class="ro-text">${_tEsc(opt)}</span>${mark}</div>`;
    });

    const badge = isCorrect ? _tIc('check') + _tEsc(t('testRevCorrect'))
                : isSkipped ? _tIc('minus') + _tEsc(t('testRevSkipped'))
                :             _tIc('x') + _tEsc(t('testRevWrong'));
    card.innerHTML = `
      <div class="ri-header">
        <span class="ri-num">${i + 1}</span>
        <span class="ri-badge">${badge}</span>
      </div>
      <div class="ri-question">${_tEsc(q.question)}</div>
      <div class="ri-options">${optHtml}</div>`;
    list.appendChild(card);
  });

  ['all', 'wrong', 'skip'].forEach(k => {
    const el = document.getElementById('rfc-' + k);
    if (el) el.textContent = counts[k];
  });
}

// Baxışda filtr: hamısı / yalnız yanlışlar / keçilmişlər
function setReviewFilter(f) {
  const list = document.getElementById('testReviewList');
  if (list) list.setAttribute('data-filter', f);
  document.querySelectorAll('#testReviewFilters [data-rf]').forEach(b => {
    const on = b.dataset.rf === f;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-pressed', String(on));
  });
}

function scrollToReview() {
  const el = document.getElementById('testReviewSection');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Reset ──────────────────────────────────────────────────────
function resetTest() {
  clearInterval(testState.timerInterval);
  document.body.classList.remove('in-quiz');
  testState.currentQuiz  = [];
  testState.userAnswers  = [];
  testState.currentIndex = 0;
  testState.result       = null;

  document.getElementById('test-quiz').style.display    = 'none';
  document.getElementById('test-result').style.display  = 'none';
  document.getElementById('test-landing').style.display = '';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Dil dəyişəndə dinamik mətnləri yenilə
window.addEventListener('unec:langchange', () => {
  if (!document.getElementById('testSubjectGrid')) return;
  renderTestSubjects();
  if (testState.selectedSubject) _renderTestConfig();
  if (document.getElementById('test-quiz').style.display === '' && testState.currentQuiz.length) {
    document.getElementById('testQNumber').textContent = `${t('testQuestionWord')} ${testState.currentIndex + 1}`;
    updateAnsweredInfo();
  }
  if (document.getElementById('test-result').style.display === '' && testState.result) {
    _paintResult();
    renderReview();
  }
});

// ── QR Ödəniş Modali ──────────────────────────────────────────
function openQRModal(type, customNote) {
  const overlay = document.getElementById('qrPayOverlay');
  const img     = document.getElementById('qrModalImg');
  const title   = document.getElementById('qrModalTitle');
  const icon    = document.getElementById('qrModalIcon');
  const note    = document.getElementById('qrModalNote');

  if (type === 'birbank') {
    img.src   = 'images/birbankqr.png';
    img.alt   = 'Birbank QR';
    title.textContent = 'Birbank QR';
    icon.textContent  = 'account_balance';
    note.textContent  = customNote || 'Birbank tətbiqini açın → QR Skan → kodu oxudun';
  } else {
    img.src   = 'images/m10qr.png';
    img.alt   = 'm10 QR';
    title.textContent = 'm10 QR';
    icon.textContent  = 'account_balance_wallet';
    note.textContent  = customNote || 'm10 tətbiqini açın → Köçürmə → QR Skan edin';
  }

  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeQRModal() {
  const overlay = document.getElementById('qrPayOverlay');
  overlay.classList.add('hidden');
  document.body.style.overflow = '';
}

// Esc düyməsi ilə bağla
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeQRModal();
});
