/* ================================================================
   GPA.JS — UNEC GPA Calculator · Premium Module
   ================================================================ */

// ── State ─────────────────────────────────────────────────────
let gpaSubjects = [
  { id: Date.now(), name: '', credit: 3, score: 0 }
];
let gpaMode = 'calculator'; // 'calculator' | 'predictor'

// ── Core Logic ────────────────────────────────────────────────
function isPassed(score) { return Number(score) >= 51; }

function earnedCredit(s) {
  return isPassed(s.score) ? Number(s.credit) : 0;
}

function calculateGPA(list) {
  let num = 0, den = 0;
  list.forEach(s => {
    const credit = Number(s.credit), score = Number(s.score);
    if (!Number.isFinite(credit) || credit <= 0 || !Number.isFinite(score) || score < 0 || score > 100) return;
    // ÜOMG uses earned credits above and all attempted credits below.
    num += score * earnedCredit(s);
    den += credit;
  });
  if (den === 0) return '0.00';
  return (num / den).toFixed(2);
}

function getTotalCredits(list) {
  return list.reduce((a, s) => a + Number(s.credit), 0);
}

function getEarnedCredits(list) {
  return list.reduce((a, s) => a + earnedCredit(s), 0);
}

function getGradeLabel(gpa) {
  const g = parseFloat(gpa);

  if (g === 0) return { text: '—', color: '#64748b', ring: ['#334155', '#475569'] };
  // 91+ üçün parlaq mavi (Cyan/Blue)
  if (g >= 91) return { text: t('gpaGradeA'), color: '#22d3ee', ring: ['#0891b2', '#22d3ee'] };
  // 81-90 üçün tünd yaşıl
  if (g >= 81) return { text: t('gpaGradeB'), color: '#22c55e', ring: ['#15803d', '#22c55e'] };
  // 71-80 üçün açıq yaşıl
  if (g >= 71) return { text: t('gpaGradeC'), color: '#86efac', ring: ['#16a34a', '#86efac'] };
  // 61-70 üçün sarı
  if (g >= 61) return { text: t('gpaGradeD'), color: '#facc15', ring: ['#ca8a04', '#facc15'] };
  // 51-60 üçün narıncı
  if (g >= 51) return { text: t('gpaGradeE'), color: '#fb923c', ring: ['#ea580c', '#fb923c'] };
  // 51-dən aşağı üçün qırmızı
  return { text: t('gpaGradeF'), color: '#f87171', ring: ['#dc2626', '#f87171'] };
}

// ── Count-up animation ────────────────────────────────────────
let gpaCountUpRaf = null;
function animateGPANumber(el, from, to, duration) {
  if (gpaCountUpRaf) cancelAnimationFrame(gpaCountUpRaf);
  const start = performance.now();
  const fromVal = parseFloat(from) || 0;
  const toVal   = parseFloat(to)   || 0;
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
    const current = (fromVal + (toVal - fromVal) * ease).toFixed(2);
    el.textContent = current;
    if (t < 1) gpaCountUpRaf = requestAnimationFrame(step);
    else el.textContent = to;
  }
  gpaCountUpRaf = requestAnimationFrame(step);
}

// ── Ring progress ─────────────────────────────────────────────
function updateRing(gpa, colors) {
  const fill = document.querySelector('.gpa-ring-fill');
  if (!fill) return;
  const pct = Math.min(parseFloat(gpa) / 100, 1);
  const circumference = 400;
  fill.style.strokeDashoffset = circumference - pct * circumference;

  // Update gradient stops dynamically
  if (colors) {
    const stop1 = document.getElementById('gpaGradStop1');
    const stop2 = document.getElementById('gpaGradStop2');
    if (stop1) stop1.setAttribute('stop-color', colors[0]);
    if (stop2) stop2.setAttribute('stop-color', colors[1]);
  }
}

// ── localStorage ──────────────────────────────────────────────
function gpaSave() {
  try {
    window.UNECStudy.setItem('unec_gpa_subjects', JSON.stringify(gpaSubjects));
  } catch(e) {}
}

function gpaLoad() {
  try {
    const s = JSON.parse(window.UNECStudy.getItem('unec_gpa_subjects') || '[]');
    gpaSubjects = Array.isArray(s) && s.length ? s : [{ id: Date.now(), name: '', credit: 3, score: 0 }];
  } catch(e) {}
}

// ── Subject CRUD ──────────────────────────────────────────────
// stepper (+) fokus vermir ki, mobil klaviatura açılmasın; "Yeni fənn əlavə et" düyməsi isə fokuslayır
function addSubject(keepFocus) {
  gpaSubjects.push({ id: Date.now(), name: '', credit: 3, score: 0 });
  gpaSave();
  gpaRender();
  if (keepFocus === true) return;
  setTimeout(() => {
    const inputs = document.querySelectorAll('#gpa-subject-list .gpa-subject-name');
    if (inputs.length) inputs[inputs.length-1].focus();
  }, 60);
}

function removeSubject(id) {
  if (gpaSubjects.length <= 1) return;
  gpaSubjects = gpaSubjects.filter(s => s.id !== id);
  // animate out
  const row = document.getElementById('gpa-row-'+id);
  if (row) {
    row.style.transition = 'opacity 0.2s, transform 0.2s';
    row.style.opacity = '0';
    row.style.transform = 'translateX(10px)';
    setTimeout(() => { gpaSave(); gpaRender(); }, 200);
  } else {
    gpaSave();
    gpaRender();
  }
}

function updateSubject(id, field, value) {
  const s = gpaSubjects.find(s => s.id === id);
  if (!s) return;
  if (!['name', 'credit', 'score'].includes(field)) return;
  s[field] = field === 'name' ? String(value).slice(0, 200) : Math.min(field === 'score' ? 100 : 60, Math.max(field === 'score' ? 0 : 1, Number(value) || 0));
  if (field !== 'name' && value !== '' && Number(value) !== s[field]) {
    document.querySelectorAll(`.gpa-subject-row[data-id="${id}"] .gpa-input-group--${field} input`).forEach(input => { input.value = s[field]; });
  }
  gpaSave();
  gpaRenderSummary();
  gpaRenderPredictor();
  // inline weight update with flash
  const wEl = document.querySelector(`.gpa-subject-row[data-id="${id}"] .gpa-weight-val`);
  if (wEl) {
    wEl.textContent = (Number(s.score) * earnedCredit(s)).toFixed(0);
    flashClass(wEl, 'gpa-weight-flash', 380);
  }
  // score input flash
  if (field === 'score') {
    const scoreInp = document.querySelector(`.gpa-subject-row[data-id="${id}"] .gpa-score-input`);
    flashClass(scoreInp, 'gpa-score-flash', 400);
  }
  // refresh predictor mirror
  if (gpaMode === 'predictor') gpaRenderPredictorList();
  // inline badge + risk update
  if (field === 'score') {
    const badge = document.querySelector(`.gpa-status-badge[data-id="${id}"]`);
    if (badge) {
      const passed = isPassed(s.score);
      badge.textContent = passed ? t('gpaPassed') : t('gpaFailed');
      badge.className = `gpa-status-badge ${passed ? 'passed' : 'failed'}`;
      flashClass(badge, 'gpa-badge-pop', 380);
    }
    // update risk class on row
    const row = document.getElementById('gpa-row-'+id);
    if (row) {
      const risk = getRiskLevel(s);
      row.className = row.className.replace(/gpa-risk-\w+/, '');
      row.classList.add('gpa-risk-'+risk);
      // update risk dot
      const dot = row.querySelector('.gpa-risk-dot');
      if (dot) {
        dot.className = `gpa-risk-dot gpa-risk-dot-${risk}`;
        dot.title = getRiskLabel(risk);
      }
    }
  }
}

// ── Summary render ────────────────────────────────────────────
let _lastGPA = '0.00';
function gpaRenderSummary(recordSnapshot = true) {
  const gpa    = calculateGPA(gpaSubjects);
  const total  = getTotalCredits(gpaSubjects);
  const earned = getEarnedCredits(gpaSubjects);
  const grade  = getGradeLabel(gpa);

  const gpaEl   = document.getElementById('gpa-current');
  const gradeEl = document.getElementById('gpa-grade-label');
  const totalEl  = document.getElementById('gpa-stat-total');
  const earnedEl = document.getElementById('gpa-stat-earned');
  const gpa2El   = document.getElementById('gpa-stat-gpa');

  if (gpaEl && gpa !== _lastGPA) {
    animateGPANumber(gpaEl, _lastGPA, gpa, 400);
    _lastGPA = gpa;
  }
  if (gradeEl) {
    gradeEl.textContent = grade.text;
  }
  if (totalEl)  totalEl.textContent  = total;
  if (earnedEl) earnedEl.textContent = earned;
  if (gpa2El)   gpa2El.textContent   = gpa;

  // ring + dynamic color
  updateRing(gpa, grade.ring);

  // save snapshot for memory
  if (recordSnapshot) gpaSaveSnapshot();
  gpaRenderSmartMessage();
  gpaRenderMemoryCard();


  // count badge
  const countEl = document.getElementById('gpa-count-badge');
  if (countEl) countEl.textContent = t('gpaSubjectCountValue').replace('{n}', gpaSubjects.length);
}

// ── Predictor render ──────────────────────────────────────────
function gpaRenderPredictor() {
  const resultEl = document.getElementById('gpa-target-result');
  if (!resultEl) return;

  const targetVal = parseFloat(document.getElementById('gpa-pred-target')?.value);
  const remCr     = parseFloat(document.getElementById('gpa-pred-credits')?.value);

  if (isNaN(targetVal) || isNaN(remCr) || remCr <= 0) {
    resultEl.innerHTML = '';
    return;
  }

  if (!Number.isFinite(targetVal) || targetVal < 0 || targetVal > 100 || !Number.isFinite(remCr)) {
    resultEl.textContent = t('gpaPredictInvalid'); return;
  }
  const attemptedNow = getTotalCredits(gpaSubjects);
  const weightedNow = gpaSubjects.reduce((a, s) => a + Number(s.score) * earnedCredit(s), 0);
  const required = (targetVal * (attemptedNow + remCr) - weightedNow) / remCr;

  let msg, cls, icon;
  if (required > 100) {
    icon = 'sentiment_dissatisfied'; cls = 'target-impossible';
    msg = t('gpaPredictImpossible');
  } else if (required < 0) {
    icon = 'celebration'; cls = 'target-done';
    msg = t('gpaPredictReached');
  } else {
    const r = Math.ceil(required);
    if (r < 51) {
      icon = 'check_circle'; cls = 'target-easy';
      msg = t('gpaPredictLow');
    } else if (r >= 75) {
      icon = 'target'; cls = 'target-high';
      msg = t('gpaPredictRequired');
    } else {
      icon = 'trending_up'; cls = 'target-mid';
      msg = t('gpaPredictRequired');
    }
  }

  msg = msg.replace('{target}', String(targetVal)).replace('{credits}', String(remCr)).replace('{score}', String(Math.max(51, Math.ceil(required))));
  resultEl.innerHTML = `<div class="gpa-target-msg ${cls}"><span class="target-icon"><span class="material-symbols-outlined">${icon}</span></span><span>${escHtml(msg)}</span></div>`;
}

// ── Mode toggle ───────────────────────────────────────────────
function gpaSetMode(mode) {
  gpaMode = mode;
  const calcBtn = document.getElementById('gpa-mode-calc');
  const predBtn = document.getElementById('gpa-mode-pred');
  const calcView = document.getElementById('gpa-calc-view');
  const predView = document.getElementById('gpa-pred-view');

  if (mode === 'calculator') {
    calcBtn?.classList.add('active');
    predBtn?.classList.remove('active');
    if (calcView) calcView.style.display = '';
    if (predView) predView.style.display = 'none';
  } else {
    predBtn?.classList.add('active');
    calcBtn?.classList.remove('active');
    if (predView) predView.style.display = '';
    if (calcView) calcView.style.display = 'none';
    gpaRenderPredictor();
  }
}

// ── Share ─────────────────────────────────────────────────────
function gpaShare() {
  const gpa   = calculateGPA(gpaSubjects);
  const grade = getGradeLabel(gpa).text;
  const text = t('gpaShareText').replace('{gpa}', gpa).replace('{grade}', grade) + '\n' + window.location.href;
  if (navigator.share) {
    navigator.share({ text });
  } else {
    navigator.clipboard.writeText(text).catch(() => {});
  }
  // toast
  const toast = document.getElementById('gpa-share-toast');
  if (toast) {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  }
}

// ── Subject row HTML ──────────────────────────────────────────
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function subjectRowHtml(s, i) {
  const passed = isPassed(s.score);
  const canRemove = gpaSubjects.length > 1;
  const risk = getRiskLevel(s);
  const riskLabel = getRiskLabel(risk);
  const rm = `<svg class="ic" aria-hidden="true"><use href="#i-x"/></svg>`;
  return `
<div class="gpa-subject-row gpa-risk-${risk}" data-id="${s.id}" id="gpa-row-${s.id}">
  <input class="gpa-subject-name" type="text" maxlength="200" placeholder="${escHtml(t('gpaNamePlaceholder'))}" aria-label="${escHtml(t('gpaNamePlaceholder'))}"
    value="${escHtml(s.name)}" oninput="updateSubject(${s.id},'name',this.value)" />
  <div class="gpa-input-group gpa-input-group--credit">
    <label>${escHtml(t('gpaCreditShort'))}</label>
    <input class="gpa-num-input" type="number" inputmode="numeric" min="1" max="60" step="1" value="${s.credit}"
      aria-label="${escHtml(t('gpaCreditShort'))}" oninput="updateSubject(${s.id},'credit',this.value)" />
  </div>
  <div class="gpa-input-group gpa-input-group--score">
    <label>${escHtml(t('gpaScoreShort'))}</label>
    <input class="gpa-num-input gpa-score-input" type="number" inputmode="numeric" min="0" max="100" step="1" value="${s.score}"
      aria-label="${escHtml(t('gpaScoreShort'))} (0–100)" oninput="updateSubject(${s.id},'score',this.value)" />
  </div>
  <div class="gpa-input-group gpa-input-group--weight">
    <label>${escHtml(t('gpaWeightShort'))}</label>
    <span class="gpa-weight-val">${(Number(s.score)*earnedCredit(s)).toFixed(0)}</span>
  </div>
  <span class="gpa-status-badge ${passed?'passed':'failed'}" data-id="${s.id}">${passed ? t('gpaPassed') : t('gpaFailed')}</span>
  <span class="gpa-risk-dot gpa-risk-dot-${risk}" title="${riskLabel}"></span>
  ${canRemove
    ? `<button class="gpa-remove-btn" type="button" onclick="removeSubject(${s.id})" title="${escHtml(t('gpaRemoveSubject'))}" aria-label="${escHtml(t('gpaRemoveSubject'))}">${rm}<span>${escHtml(t('gpaRemoveShort'))}</span></button>`
    : `<span class="gpa-remove-placeholder"></span>`}
</div>`;
}

// ── Full render ───────────────────────────────────────────────
function gpaRender(recordSnapshot = true) {
  const listEl = document.getElementById('gpa-subject-list');
  if (!listEl) return;

  if (gpaSubjects.length === 0) {
    listEl.innerHTML = `
      <div class="gpa-empty-state">
        <span class="gpa-empty-icon material-symbols-outlined">menu_book</span>
        <div class="gpa-empty-title">${escHtml(t('gpaEmptyTitle'))}</div>
        <div class="gpa-empty-sub">${escHtml(t('gpaEmptyHint'))}</div>
      </div>`;
  } else {
    listEl.innerHTML = gpaSubjects.map((s,i) => subjectRowHtml(s,i)).join('');
  }

  const countEl = document.getElementById('gpa-count-badge');
  if (countEl) countEl.textContent = t('gpaSubjectCountValue').replace('{n}', gpaSubjects.length);

  gpaRenderSummary(recordSnapshot);
  gpaRenderSmartMessage();
  gpaRenderMemoryCard();
  if (gpaMode === 'predictor') gpaRenderPredictorList();
  if (window.UNEC && UNEC.syncGpaStepper) UNEC.syncGpaStepper();
}



// ── Micro-animation helpers ───────────────────────────────────
function flashClass(el, cls, duration=400) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth; // reflow
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), duration);
}

// ── Semester Memory ───────────────────────────────────────────
function gpaGetHistory() {
  try {
    return JSON.parse(window.UNECStudy.getItem('unec_gpa_history') || '[]');
  } catch(e) { return []; }
}

function gpaSaveSnapshot() {
  const gpa = calculateGPA(gpaSubjects);
  if (parseFloat(gpa) === 0) return;
  const history = gpaGetHistory();
  const now = new Date();
  const label = `${now.getDate()}/${now.getMonth()+1}`;
  // Only save if gpa changed from last snapshot
  if (history.length && history[history.length-1].gpa === gpa) return;
  history.push({ gpa, label, ts: Date.now() });
  if (history.length > 20) history.shift();
  try { window.UNECStudy.setItem('unec_gpa_history', JSON.stringify(history)); } catch(e) {}

  // Firebase-ə saxla + streak yenilə
  if (typeof onGpaUpdated === 'function') {
    onGpaUpdated(parseFloat(gpa), history);
  }
}

function gpaRenderMemoryCard() {
  const el = document.getElementById('gpa-memory-card');
  if (!el) return;
  const history = gpaGetHistory();
  const current = parseFloat(calculateGPA(gpaSubjects));

  if (history.length < 1 || current === 0) {
    el.style.display = 'none';
    return;
  }

  el.style.display = '';
  const prev = history.length >= 2 ? parseFloat(history[history.length-2].gpa) : null;
  const first = parseFloat(history[0].gpa);
  const diff = prev !== null ? (current - prev) : null;
  const totalDiff = current - first;

  const diffStr = diff !== null
    ? `<span class="gpa-mem-delta ${diff >= 0 ? 'pos' : 'neg'}">${diff >= 0 ? '+' : ''}${diff.toFixed(2)}</span>`
    : '';

  el.innerHTML = `
    <div class="gpa-mem-row">
      <div class="gpa-mem-cell">
        <span class="gpa-mem-val">${prev !== null ? prev.toFixed(2) : '—'}</span>
        <span class="gpa-mem-lbl">${escHtml(t('gpaPrevious'))}</span>
      </div>
      <div class="gpa-mem-cell gpa-mem-center">
        ${diffStr}
        <span class="gpa-mem-lbl">${escHtml(t('gpaChange'))}</span>
      </div>
      <div class="gpa-mem-cell gpa-mem-right">
        <span class="gpa-mem-val ${totalDiff >= 0 ? 'pos' : 'neg'}">${totalDiff >= 0 ? '+' : ''}${totalDiff.toFixed(2)}</span>
        <span class="gpa-mem-lbl">${escHtml(t('gpaTrend'))}</span>
      </div>
    </div>`;
}

// ── Smart Message Engine ──────────────────────────────────────
const GPA_MESSAGES = [
  { min: 90,  max: 101, text: "Əla gedirsən. Top-15 performans yolundasan.", emoji: "emoji_events", cls: "msg-excellent" },
  { min: 75,  max: 90,  text: "Ardıcıl inkişaf edirsən. Belə davam et.",          emoji: "trending_up", cls: "msg-good"      },
  { min: 60,  max: 75,  text: "Yaxşısan, amma daha güclü fokus lazımdır.",   emoji: "target", cls: "msg-mid"       },
  { min: 51,  max: 60,  text: "Keçid xəttindəsən, çox vaxt itirmə.",            emoji: "bolt", cls: "msg-warn"      },
  { min: 0,   max: 51,  text: "Bərpa rejimidir. Hər kredit sayılır.",            emoji: "fitness_center", cls: "msg-danger"    },
];

function gpaRenderSmartMessage() {
  const el = document.getElementById('gpa-smart-msg');
  if (!el) return;
  const g = parseFloat(calculateGPA(gpaSubjects));
  if (g === 0) { el.innerHTML = ''; return; }
  const msg = GPA_MESSAGES.find(m => g >= m.min && g < m.max) || GPA_MESSAGES[GPA_MESSAGES.length-1];
  el.innerHTML = `<div class="gpa-smart-msg-inner ${msg.cls}">
    <span class="gpa-msg-emoji"><span class="material-symbols-outlined">${msg.emoji}</span></span>
    <span class="gpa-msg-text">${escHtml(t('gpaMessage' + GPA_MESSAGES.indexOf(msg)))}</span>
  </div>`;
}

// ── Risk Heatmap ──────────────────────────────────────────────
function getRiskLevel(s) {
  const score = Number(s.score);
  const credit = Number(s.credit);
  if (score === 0 && credit === 0) return 'neutral';
  if (score >= 75) return 'safe';
  if (score >= 51) return 'warn';
  return 'danger';
}

function getRiskLabel(level) {
  return t({ safe: 'gpaRiskSafe', warn: 'gpaRiskWarn', danger: 'gpaRiskDanger', neutral: 'gpaRiskNew' }[level]);
}

// ── Init ──────────────────────────────────────────────────────
let _gpaInited = false;
function initGPA() {
  if (_gpaInited) { gpaLoad(); gpaRender(false); return; }
  _gpaInited = true;
  gpaLoad();
  gpaRender(false);

  // predictor inputs
  document.getElementById('gpa-pred-target')?.addEventListener('input', gpaRenderPredictor);
  document.getElementById('gpa-pred-credits')?.addEventListener('input', gpaRenderPredictor);
}

// ── Predictor view: mirror subject list (read-only) ───────────
function gpaRenderPredictorList() {
  const el2 = document.getElementById('gpa-subject-list2');
  const count2 = document.getElementById('gpa-count-badge2');
  if (el2) el2.innerHTML = gpaSubjects.map((s,i) => subjectRowHtml(s,i)).join('');
  if (count2) count2.textContent = t('gpaSubjectCountValue').replace('{n}', gpaSubjects.length);
}

window.addEventListener('unec:langchange', () => { if (_gpaInited) { gpaRender(false); gpaRenderPredictor(); } });
window.addEventListener('unec:studychange', event => {
  if (!event.detail.keys.some(key => ['unec_gpa_subjects', 'unec_gpa_history'].includes(key))) return;
  gpaLoad(); if (_gpaInited) { gpaRender(false); gpaRenderPredictor(); }
});
