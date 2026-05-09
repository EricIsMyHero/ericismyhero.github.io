/* ================================================================
   GPA.JS — UNEC GPA Calculator Module
   Modullu quruluş: hər funksiya müstəqildir, genişlənə bilər.
   ================================================================ */

// ── State ─────────────────────────────────────────────────────
let subjects = [
  { id: Date.now(), name: '', credit: 3, score: 0 }
];

let targetGPA = '';

// ── Core Logic ────────────────────────────────────────────────
function isPassed(score) {
  return Number(score) >= 51;
}

function earnedCredit(subject) {
  return isPassed(subject.score) ? Number(subject.credit) : 0;
}

function calculateGPA(subjectList) {
  let numerator = 0;
  let denominator = 0;
  subjectList.forEach(s => {
    const b = Number(s.score);
    const k = Number(s.credit);
    numerator   += b * k;
    denominator += earnedCredit(s);
  });
  if (denominator === 0) return '0.00';
  return (numerator / denominator).toFixed(2);
}

function getTotalCredits(subjectList) {
  return subjectList.reduce((acc, s) => acc + Number(s.credit), 0);
}

function getEarnedCredits(subjectList) {
  return subjectList.reduce((acc, s) => acc + earnedCredit(s), 0);
}

// ── Target GPA Predictor ──────────────────────────────────────
function calcTargetRequired(subjectList, target, remainingCredits) {
  const totalCredits    = getTotalCredits(subjectList);
  const earnedNow       = getEarnedCredits(subjectList);
  const weightedNow     = subjectList.reduce((acc, s) => acc + Number(s.score) * Number(s.credit), 0);

  // GPA = ∑(b·k) / ∑k*
  // target * (earnedNow + remainingCredits) = weightedNow + required * remainingCredits
  const targetVal = Number(target);
  const rc        = Number(remainingCredits);
  if (rc <= 0 || isNaN(targetVal) || isNaN(rc)) return null;

  const required = (targetVal * (earnedNow + rc) - weightedNow) / rc;
  return required;
}

// ── localStorage ──────────────────────────────────────────────
function saveToStorage() {
  try {
    localStorage.setItem('unec_gpa_subjects', JSON.stringify(subjects));
    localStorage.setItem('unec_gpa_target', targetGPA);
  } catch (e) {}
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem('unec_gpa_subjects');
    if (saved) subjects = JSON.parse(saved);
    const savedTarget = localStorage.getItem('unec_gpa_target');
    if (savedTarget) targetGPA = savedTarget;
  } catch (e) {}
}

// ── Subject CRUD ──────────────────────────────────────────────
function addSubject() {
  subjects.push({ id: Date.now(), name: '', credit: 3, score: 0 });
  saveToStorage();
  render();
  // Focus last name input
  setTimeout(() => {
    const inputs = document.querySelectorAll('.gpa-subject-name');
    if (inputs.length) inputs[inputs.length - 1].focus();
  }, 50);
}

function removeSubject(id) {
  if (subjects.length <= 1) return;
  subjects = subjects.filter(s => s.id !== id);
  saveToStorage();
  render();
}

function updateSubject(id, field, value) {
  const s = subjects.find(s => s.id === id);
  if (!s) return;
  s[field] = value;
  saveToStorage();
  renderSummary();
  renderTargetResult();
  // Update weight display
  const weightEl = document.querySelector(`.gpa-subject-row[data-id="${id}"] .gpa-weight-val`);
  if (weightEl) weightEl.textContent = (Number(s.score) * Number(s.credit)).toFixed(0);
  // Update status badge inline
  const badge = document.querySelector(`.gpa-status-badge[data-id="${id}"]`);
  if (badge && (field === 'score')) {
    const passed = isPassed(s.score);
    badge.textContent = passed ? 'Passed' : 'Failed';
    badge.className = `gpa-status-badge ${passed ? 'passed' : 'failed'}`;
    badge.setAttribute('data-id', id);
  }
}

// ── Render: Summary Cards ─────────────────────────────────────
function renderSummary() {
  const gpa     = calculateGPA(subjects);
  const total   = getTotalCredits(subjects);
  const earned  = getEarnedCredits(subjects);

  // Animated GPA number
  const gpaEl = document.getElementById('gpa-current');
  if (gpaEl) {
    gpaEl.textContent = gpa;
    gpaEl.classList.add('gpa-pop');
    setTimeout(() => gpaEl.classList.remove('gpa-pop'), 380);
  }

  const totalEl  = document.getElementById('gpa-total-credits');
  const earnedEl = document.getElementById('gpa-earned-credits');
  const gpa2El   = document.getElementById('gpa-result-val');

  if (totalEl)  totalEl.textContent  = total;
  if (earnedEl) earnedEl.textContent = earned;
  if (gpa2El)   gpa2El.textContent   = gpa;

  // GPA color
  if (gpaEl) {
    const g = parseFloat(gpa);
    gpaEl.style.color = g >= 75 ? '#4ade80' : g >= 51 ? '#facc15' : '#f87171';
  }
}

// ── Render: Target Result ─────────────────────────────────────
function renderTargetResult() {
  const resultEl = document.getElementById('gpa-target-result');
  if (!resultEl) return;

  const target   = document.getElementById('gpa-target-input')?.value;
  const remCr    = document.getElementById('gpa-remaining-credits')?.value;

  if (!target || !remCr || isNaN(Number(target)) || isNaN(Number(remCr))) {
    resultEl.innerHTML = '';
    return;
  }

  const required = calcTargetRequired(subjects, target, remCr);
  if (required === null) { resultEl.innerHTML = ''; return; }

  let msg, cls;
  if (required > 100) {
    msg = `Bu hədəfə çatmaq artıq mümkün deyil. Mövcud nəticəniz çox aşağıdır.`;
    cls = 'target-impossible';
  } else if (required < 0) {
    msg = `Siz artıq bu hədəfə çatmısınız! Qalan kreditlər üçün heç nə etmədən belə keçərsiniz.`;
    cls = 'target-done';
  } else {
    const r = Math.ceil(required);
    const status = r < 51 ? '(keçid balından aşağı — keçmə ehtiyacı yoxdur)' : '';
    msg = `Hədəf GPA <strong>${target}</strong>-ə çatmaq üçün qalan <strong>${remCr}</strong> kreditdən orta <strong>${r}</strong> ${status} toplamalısınız.`;
    cls = r >= 51 ? (r >= 75 ? 'target-high' : 'target-mid') : 'target-easy';
  }

  resultEl.innerHTML = `<div class="gpa-target-msg ${cls}"><span class="target-icon">🎯</span> ${msg}</div>`;
}

// ── Render: Subject Row ───────────────────────────────────────
function renderSubjectRow(s, idx) {
  const passed = isPassed(s.score);
  return `
  <div class="gpa-subject-row" data-id="${s.id}" id="gpa-row-${s.id}">
    <div class="gpa-row-top">
      <span class="gpa-row-num">${idx + 1}</span>
      <input
        class="gpa-subject-name"
        type="text"
        placeholder="Fənn adı..."
        value="${escapeHtml(s.name)}"
        oninput="updateSubject(${s.id},'name',this.value)"
      />
      <span class="gpa-status-badge ${passed ? 'passed' : 'failed'}" data-id="${s.id}">
        ${passed ? 'Passed' : 'Failed'}
      </span>
      ${subjects.length > 1 ? `
        <button class="gpa-remove-btn" onclick="removeSubject(${s.id})" title="Sil">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      ` : '<span class="gpa-remove-placeholder"></span>'}
    </div>
    <div class="gpa-row-bottom">
      <div class="gpa-input-group">
        <label>Kredit</label>
        <input
          class="gpa-num-input"
          type="number" min="1" max="10" step="1"
          value="${s.credit}"
          oninput="updateSubject(${s.id},'credit',this.value)"
        />
      </div>
      <div class="gpa-input-group">
        <label>Bal (0–100)</label>
        <input
          class="gpa-num-input gpa-score-input"
          type="number" min="0" max="100" step="1"
          value="${s.score}"
          oninput="updateSubject(${s.id},'score',this.value);updateSubject(${s.id},'score',this.value)"
        />
      </div>
      <div class="gpa-row-weight">
        <label>Çəki</label>
        <span class="gpa-weight-val">${(Number(s.score) * Number(s.credit)).toFixed(0)}</span>
      </div>
    </div>
  </div>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Full Render ───────────────────────────────────────────────
function render() {
  const listEl = document.getElementById('gpa-subject-list');
  if (!listEl) return;
  listEl.innerHTML = subjects.map((s, i) => renderSubjectRow(s, i)).join('');
  renderSummary();
  renderTargetResult();
}

// ── Init ──────────────────────────────────────────────────────
function initGPA() {
  loadFromStorage();
  render();

  // Target input listeners
  const targetInput = document.getElementById('gpa-target-input');
  const remInput    = document.getElementById('gpa-remaining-credits');
  if (targetInput) {
    targetInput.value = targetGPA;
    targetInput.addEventListener('input', () => {
      targetGPA = targetInput.value;
      saveToStorage();
      renderTargetResult();
    });
  }
  if (remInput) {
    remInput.addEventListener('input', renderTargetResult);
  }
}
