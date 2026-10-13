// ============================================================
// TIMER.JS — Pomodoro + İmtahan Geri Sayımı
// ============================================================

(function () {
  'use strict';

  // ── Pomodoro state ────────────────────────────────────────
  const MODES = {
    focus:      { key: 'timerFocus',      duration: 25 * 60, break: false },
    short:      { key: 'timerShortBreak', duration: 5 * 60,  break: true },
    long:       { key: 'timerLongBreak',  duration: 15 * 60, break: true },
  };
  const ico = n => `<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;

  let pState = {
    mode: 'focus',
    remaining: MODES.focus.duration,
    running: false,
    endAt: 0,
    sessionsToday: 0,
    totalToday: 0,
    intervalId: null,
  };

  const CIRCUMFERENCE = 2 * Math.PI * 90; // r=90

  // ── Init ─────────────────────────────────────────────────
  function initTimer() {
    loadPomodoroStats();
    renderPomodoro();
    renderExams();
    checkNotifPermission();
  }

  // ── Pomodoro render ───────────────────────────────────────
  function renderPomodoro() {
    const el = document.getElementById('pomodoro-time');
    if (!el) return;
    el.textContent = fmtTime(pState.remaining);

    // progress ring
    const total = MODES[pState.mode].duration;
    const pct = pState.remaining / total;
    const offset = CIRCUMFERENCE * (1 - pct);
    const ring = document.getElementById('pomodoro-ring');
    if (ring) {
      ring.style.strokeDashoffset = offset;
      ring.classList.toggle('break-mode', MODES[pState.mode].break);
    }

    // label
    const lbl = document.getElementById('pomodoro-mode-label');
    if (lbl) lbl.textContent = t(MODES[pState.mode].key);

    // play/pause icon
    const btn = document.getElementById('pomodoro-play-btn');
    if (btn) {
      btn.innerHTML = ico(pState.running ? 'pause' : 'play');
      btn.setAttribute('aria-label', t(pState.running ? 'timerPause' : 'timerStart'));
      btn.classList.toggle('is-running', pState.running);
    }
    const wrap = document.querySelector('.pomodoro-card');
    if (wrap) wrap.classList.toggle('is-break', MODES[pState.mode].break);

    // dots
    for (let i = 0; i < 4; i++) {
      const dot = document.getElementById('pdot-' + i);
      if (dot) dot.classList.toggle('done', i < pState.sessionsToday % 4);
    }

    // stats
    const done = document.getElementById('pstat-done');
    const mins = document.getElementById('pstat-mins');
    if (done) done.textContent = pState.sessionsToday;
    if (mins) mins.textContent = pState.totalToday;

    // mode buttons
    Object.keys(MODES).forEach(m => {
      const b = document.getElementById('pmode-' + m);
      if (b) { b.classList.toggle('active', m === pState.mode); b.setAttribute('aria-pressed', String(m === pState.mode)); }
    });
  }

  function fmtTime(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return m + ':' + s;
  }

  // ── Pomodoro controls ─────────────────────────────────────
  // Qalan vaxt bitmə anından hesablanır — tab arxa fonda yavaşlasa da taymer düzgün qalır.
  function pomodoroTick() {
    pState.remaining = Math.max(0, Math.ceil((pState.endAt - Date.now()) / 1000));
    if (pState.remaining <= 0) pomodoroSessionEnd();
    renderPomodoro();
  }

  window.pomodoroToggle = function () {
    if (pState.running) {
      clearInterval(pState.intervalId);
      pState.running = false;
    } else {
      pState.running = true;
      pState.endAt = Date.now() + pState.remaining * 1000;
      pState.intervalId = setInterval(pomodoroTick, 250);
    }
    renderPomodoro();
  };

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && pState.running) pomodoroTick();
  });

  window.pomodoroReset = function () {
    clearInterval(pState.intervalId);
    pState.running = false;
    pState.remaining = MODES[pState.mode].duration;
    renderPomodoro();
  };

  window.pomodoroSkip = function () {
    clearInterval(pState.intervalId);
    pState.running = false;
    pomodoroSessionEnd();
  };

  window.pomodoroSetMode = function (mode) {
    clearInterval(pState.intervalId);
    pState.running = false;
    pState.mode = mode;
    pState.remaining = MODES[mode].duration;
    renderPomodoro();
  };

  function pomodoroSessionEnd() {
    clearInterval(pState.intervalId);
    pState.running = false;

    const wasFocus = !MODES[pState.mode].break;
    if (wasFocus) {
      pState.sessionsToday++;
      pState.totalToday += 25;
      savePomodoroStats();
      notifyUser(t('timerNotifFocusDone'), t('timerNotifFocusBody'));
      if (typeof badgeOnPomodoro === 'function') badgeOnPomodoro();
      // switch to short break, long every 4
      pState.mode = pState.sessionsToday % 4 === 0 ? 'long' : 'short';
    } else {
      notifyUser(t('timerNotifBreakDone'), t('timerNotifBreakBody'));
      pState.mode = 'focus';
    }
    pState.remaining = MODES[pState.mode].duration;
    renderPomodoro();
  }

  // ── Persistence ───────────────────────────────────────────
  function getTodayKey() {
    return 'pomo_' + new Date().toISOString().slice(0, 10);
  }

  function savePomodoroStats() {
    const data = { sessions: pState.sessionsToday, mins: pState.totalToday };
    try { localStorage.setItem(getTodayKey(), JSON.stringify(data)); } catch (_) {}
  }

  function loadPomodoroStats() {
    try {
      const raw = localStorage.getItem(getTodayKey());
      if (raw) {
        const d = JSON.parse(raw);
        pState.sessionsToday = d.sessions || 0;
        pState.totalToday    = d.mins     || 0;
      }
    } catch (_) {}
  }

  // ── Notifications ─────────────────────────────────────────
  function notifyUser(title, body) {
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/images/icon-192.png' });
      }
    } catch (_) { /* bəzi mobil brauzerlər konstruktoru dəstəkləmir */ }
  }

  function checkNotifPermission() {
    const banner = document.getElementById('timer-notif-banner');
    if (!banner) return;
    if (!('Notification' in window) || Notification.permission === 'granted') {
      banner.classList.add('hidden');
    } else {
      banner.classList.remove('hidden');
    }
  }

  window.requestTimerNotif = function () {
    if (typeof Notification === 'undefined') return;
    Promise.resolve(Notification.requestPermission()).then(() => checkNotifPermission());
  };

  // ── Exam Countdown ────────────────────────────────────────
  const EXAMS_KEY = 'exam_countdowns';

  function loadExams() {
    try {
      const raw = localStorage.getItem(EXAMS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) { return []; }
  }

  function saveExams(list) {
    try { localStorage.setItem(EXAMS_KEY, JSON.stringify(list)); } catch (_) {}
  }

  window.showExamForm = function () {
    document.getElementById('exam-form').classList.remove('hidden');
    document.getElementById('exam-name-input').focus();
  };

  window.hideExamForm = function () {
    document.getElementById('exam-form').classList.add('hidden');
    document.getElementById('exam-name-input').value = '';
    document.getElementById('exam-date-input').value = '';
  };

  window.addExam = function () {
    const nameEl = document.getElementById('exam-name-input');
    const dateEl = document.getElementById('exam-date-input');
    const name = nameEl.value.trim();
    const date = dateEl.value;
    if (!name || !date) return;

    const list = loadExams();
    list.push({ id: Date.now(), name, date });
    saveExams(list);
    hideExamForm();
    renderExams();
  };

  window.deleteExam = function (id) {
    const list = loadExams().filter(e => e.id !== id);
    saveExams(list);
    renderExams();
  };

  function daysUntil(dateStr) {
    const now  = new Date(); now.setHours(0,0,0,0);
    const exam = new Date(dateStr + 'T00:00:00');
    return Math.round((exam - now) / 86400000);
  }

  function examClass(days) {
    if (days < 0)  return 'exam-past';
    if (days <= 3) return 'exam-urgent';
    if (days <= 7) return 'exam-soon';
    return 'exam-ok';
  }

  function examBadge(days) {
    if (days < 0)   return ['exam-badge-past',   t('examPast').replace('{n}', Math.abs(days))];
    if (days === 0) return ['exam-badge-urgent', t('examToday')];
    const txt = t('examDaysLeft').replace('{n}', days);
    if (days <= 3)  return ['exam-badge-urgent', txt];
    if (days <= 7)  return ['exam-badge-soon',   txt];
    return ['exam-badge-ok', txt];
  }

  function renderExams() {
    const container = document.getElementById('exam-list');
    if (!container) return;
    const list = loadExams();

    if (list.length === 0) {
      container.innerHTML = `<p class="exam-empty">${ico('calendar-days')}<span>${t('examEmptyText')}</span></p>`;
      return;
    }

    // sort by date
    list.sort((a, b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = list.map(exam => {
      const days = daysUntil(exam.date);
      const cls  = examClass(days);
      const [bdgCls, bdgTxt] = examBadge(days);
      const daysDisplay = days < 0 ? Math.abs(days) : days;
      const dateFormatted = new Date(exam.date + 'T00:00:00')
        .toLocaleDateString(lang === 'en' ? 'en-GB' : 'az-AZ', { day: 'numeric', month: 'long', year: 'numeric' });

      return `
        <div class="exam-card ${cls}">
          <div class="exam-countdown">
            <span class="exam-days">${daysDisplay}</span>
            <span class="exam-days-lbl">${t('examDayUnit')}</span>
          </div>
          <div class="exam-info">
            <div class="exam-name">${escHtml(exam.name)}</div>
            <div class="exam-date-str">${dateFormatted}</div>
          </div>
          <span class="exam-badge ${bdgCls}">${bdgTxt}</span>
          <button class="exam-delete-btn" type="button" onclick="deleteExam(${exam.id})" title="${escHtml(t('examDelete'))}" aria-label="${escHtml(t('examDelete'))}: ${escHtml(exam.name)}">${ico('trash')}</button>
        </div>`;
    }).join('');
  }

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // Dil dəyişəndə etiketləri yenilə
  window.addEventListener('unec:langchange', () => { renderPomodoro(); renderExams(); });

  // ── Export ────────────────────────────────────────────────
  window.initTimer = initTimer;

})();
