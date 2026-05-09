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
    num += Number(s.score) * Number(s.credit);
    den += earnedCredit(s);
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
  if (g === 0)   return { text: '—',            color: '#64748b', ring: ['#334155','#475569'] };
  if (g >= 90)   return { text: 'Excellent',    color: '#4ade80', ring: ['#22c55e','#4ade80'] };
  if (g >= 75)   return { text: 'Good',         color: '#86efac', ring: ['#16a34a','#4ade80'] };
  if (g >= 60)   return { text: 'Satisfactory', color: '#facc15', ring: ['#ca8a04','#fbbf24'] };
  if (g >= 51)   return { text: 'Passed',       color: '#fb923c', ring: ['#ea580c','#fb923c'] };
  return           { text: 'Failed',            color: '#f87171', ring: ['#dc2626','#f87171'] };
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
    localStorage.setItem('unec_gpa_subjects', JSON.stringify(gpaSubjects));
  } catch(e) {}
}

function gpaLoad() {
  try {
    const s = localStorage.getItem('unec_gpa_subjects');
    if (s) gpaSubjects = JSON.parse(s);
  } catch(e) {}
}

// ── Subject CRUD ──────────────────────────────────────────────
function addSubject() {
  gpaSubjects.push({ id: Date.now(), name: '', credit: 3, score: 0 });
  gpaSave();
  gpaRender();
  setTimeout(() => {
    const inputs = document.querySelectorAll('.gpa-subject-name');
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
  s[field] = value;
  gpaSave();
  gpaRenderSummary();
  gpaRenderPredictor();
  // inline weight update
  const wEl = document.querySelector(`.gpa-subject-row[data-id="${id}"] .gpa-weight-val`);
  if (wEl) wEl.textContent = (Number(s.score) * Number(s.credit)).toFixed(0);
  // refresh predictor mirror
  if (gpaMode === 'predictor') gpaRenderPredictorList();
  // inline badge update
  if (field === 'score') {
    const badge = document.querySelector(`.gpa-status-badge[data-id="${id}"]`);
    if (badge) {
      const passed = isPassed(s.score);
      badge.textContent = passed ? 'Passed' : 'Failed';
      badge.className = `gpa-status-badge ${passed ? 'passed' : 'failed'}`;
    }
  }
}

// ── Summary render ────────────────────────────────────────────
let _lastGPA = '0.00';
function gpaRenderSummary() {
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
    gradeEl.style.color = grade.color;
  }
  if (totalEl)  totalEl.textContent  = total;
  if (earnedEl) earnedEl.textContent = earned;
  if (gpa2El)   gpa2El.textContent   = gpa;

  // ring + dynamic color
  updateRing(gpa, grade.ring);

  // GPA number color
  if (gpaEl) {
    gpaEl.style.color = grade.color;
    gpaEl.style.textShadow = `0 0 32px ${grade.ring[1]}55`;
  }

  // count badge
  const countEl = document.getElementById('gpa-count-badge');
  if (countEl) countEl.textContent = gpaSubjects.length + ' fənn';
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

  const earnedNow    = getEarnedCredits(gpaSubjects);
  const weightedNow  = gpaSubjects.reduce((a, s) => a + Number(s.score) * Number(s.credit), 0);
  const required     = (targetVal * (earnedNow + remCr) - weightedNow) / remCr;

  let msg, cls, icon;
  if (required > 100) {
    icon = '😔'; cls = 'target-impossible';
    msg = `Bu hədəfə çatmaq <strong>mümkün deyil</strong>. Mövcud nəticəniz çox aşağıdır.`;
  } else if (required < 0) {
    icon = '🎉'; cls = 'target-done';
    msg = `Siz artıq bu hədəfə <strong>çatmısınız!</strong> Qalan fənlər nəticənizi dəyişməyəcək.`;
  } else {
    const r = Math.ceil(required);
    if (r < 51) {
      icon = '✅'; cls = 'target-easy';
      msg = `Hədəf GPA <strong>${targetVal}</strong> üçün qalan <strong>${remCr}</strong> kreditdən orta <strong>${r}</strong> bal lazımdır — keçid balından aşağı olduğuna görə, faktiki olaraq istənilən nəticə keçər.`;
    } else if (r >= 75) {
      icon = '🎯'; cls = 'target-high';
      msg = `Hədəf GPA <strong>${targetVal}</strong> üçün qalan <strong>${remCr}</strong> kreditdən orta <strong>${r}</strong> bal toplamalısınız.`;
    } else {
      icon = '📈'; cls = 'target-mid';
      msg = `Hədəf GPA <strong>${targetVal}</strong> üçün qalan <strong>${remCr}</strong> kreditdən orta <strong>${r}</strong> bal toplamalısınız.`;
    }
  }

  resultEl.innerHTML = `<div class="gpa-target-msg ${cls}"><span class="target-icon">${icon}</span><span>${msg}</span></div>`;
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
  const text  = `UNEC GPA-m: ${gpa} (${grade}) 🎓\nhesabla: ${window.location.href}`;
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
  return `
<div class="gpa-subject-row" data-id="${s.id}" id="gpa-row-${s.id}">
  <div class="gpa-row-top">
    <span class="gpa-row-num">${i+1}</span>
    <input class="gpa-subject-name" type="text" placeholder="Fənn adı..."
      value="${escHtml(s.name)}" oninput="updateSubject(${s.id},'name',this.value)" />
    <span class="gpa-status-badge ${passed?'passed':'failed'}" data-id="${s.id}">${passed?'Passed':'Failed'}</span>
    ${canRemove
      ? `<button class="gpa-remove-btn" onclick="removeSubject(${s.id})" title="Sil">
           <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
         </button>`
      : `<span class="gpa-remove-placeholder"></span>`}
  </div>
  <div class="gpa-row-bottom">
    <div class="gpa-input-group">
      <label>Kredit</label>
      <input class="gpa-num-input" type="number" min="1" max="10" step="1" value="${s.credit}"
        oninput="updateSubject(${s.id},'credit',this.value)" />
    </div>
    <div class="gpa-input-group">
      <label>Bal (0–100)</label>
      <input class="gpa-num-input gpa-score-input" type="number" min="0" max="100" step="1" value="${s.score}"
        oninput="updateSubject(${s.id},'score',this.value)" />
    </div>
    <div class="gpa-row-weight">
      <label>Çəki</label>
      <span class="gpa-weight-val">${(Number(s.score)*Number(s.credit)).toFixed(0)}</span>
    </div>
  </div>
</div>`;
}

// ── Full render ───────────────────────────────────────────────
function gpaRender() {
  const listEl = document.getElementById('gpa-subject-list');
  if (!listEl) return;

  if (gpaSubjects.length === 0) {
    listEl.innerHTML = `
      <div class="gpa-empty-state">
        <span class="gpa-empty-icon">📚</span>
        <div class="gpa-empty-title">İlk fənnini əlavə et</div>
        <div class="gpa-empty-sub">Aşağıdakı düyməyə bas, fənn adı, kredit və balını daxil et</div>
      </div>`;
  } else {
    listEl.innerHTML = gpaSubjects.map((s,i) => subjectRowHtml(s,i)).join('');
  }

  const countEl = document.getElementById('gpa-count-badge');
  if (countEl) countEl.textContent = gpaSubjects.length + ' fənn';

  gpaRenderSummary();
  if (gpaMode === 'predictor') gpaRenderPredictorList();
}

// ── Init ──────────────────────────────────────────────────────
let _gpaInited = false;
function initGPA() {
  if (_gpaInited) { gpaRender(); return; }
  _gpaInited = true;
  gpaLoad();
  gpaRender();

  // predictor inputs
  document.getElementById('gpa-pred-target')?.addEventListener('input', gpaRenderPredictor);
  document.getElementById('gpa-pred-credits')?.addEventListener('input', gpaRenderPredictor);
}

// ── Predictor view: mirror subject list (read-only) ───────────
function gpaRenderPredictorList() {
  const el2 = document.getElementById('gpa-subject-list2');
  const count2 = document.getElementById('gpa-count-badge2');
  if (el2) el2.innerHTML = gpaSubjects.map((s,i) => subjectRowHtml(s,i)).join('');
  if (count2) count2.textContent = gpaSubjects.length + ' fənn';
}
