(function () {
  'use strict';

  const semester = window.UNECSemesterProfile;
  const wardrobe = window.UNECStudentWardrobe;
  const api = 'https://ericismyhero-github-io.vercel.app/api/';
  const stampPrefix = 'unec_arena_uploaded_v1:';
  const waves = 'semester-waves';
  const daily = 'semester-defense--daily';
  const dailyClock = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Baku', year: 'numeric', month: '2-digit', day: '2-digit' });
  const dailyDay = () => dailyClock.format(new Date());
  const states = new Map();
  const key = (game, mode) => game + '--' + mode;
  const notify = () => window.dispatchEvent(new CustomEvent('unec:arenachange'));
  let user = null;
  let syncTimer;
  let syncing = false;
  let syncFailed = false;
  let requestedAgain = false;
  let sent = {};
  let dailyWatch;

  async function request(payload) {
    const response = await fetch(api + 'ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) throw new Error('Arena request failed');
    return response.json();
  }

  function lookOf(row) {
    const look = { ...wardrobe.defaults };
    for (const [section, options] of Object.entries(wardrobe.collection)) {
      if (Object.hasOwn(options, row?.look?.[section])) look[section] = row.look[section];
    }
    return look;
  }

  async function getBoard(board, state, owner) {
    try {
      const idToken = await owner?.getIdToken().catch(() => null);
      const data = await request({ action: 'arena-list', board, idToken });
      if (!Array.isArray(data.rows)) throw new Error('Invalid arena response');
      state.rows = data.rows;
      state.mine = data.mine;
      if (data.day) state.day = data.day;
      state.known = true;
    } catch {
      state.failed = true;
    } finally {
      state.loading = false;
      state.expires = Date.now() + (state.failed ? 8000 : 30000);
      if (states.get(board) === state) notify();
    }
  }
  function board(boardKey, refresh = true) {
    let state = states.get(boardKey);
    const day = boardKey === daily ? dailyDay() : null;
    if (!state || state.localDay !== day) {
      state = { rows: [], mine: null, day, localDay: day, known: false, loading: false, failed: false, expires: 0 };
      states.set(boardKey, state);
    }
    if (day && refresh && !dailyWatch) {
      dailyWatch = setInterval(() => {
        const current = states.get(daily);
        if (current?.localDay === dailyDay()) return;
        clearInterval(dailyWatch);
        dailyWatch = null;
        if (current) { states.delete(daily); notify(); }
      }, 30000);
    }
    if (refresh && !state.loading && Date.now() >= state.expires) {
      state.loading = true;
      state.failed = false;
      void getBoard(boardKey, state, user);
    }
    return state;
  }

  function localBest(uid) {
    const best = new Map();
    const today = dailyDay();
    for (const row of semester.gameRecords()) {
      if (row.uid !== uid || row.economy !== 2 || !Number.isSafeInteger(row.score) || row.score < 0) continue;
      const boardKey = key(row.game, row.mode);
      if (boardKey === daily && row.day !== today) continue;
      const prior = best.get(boardKey);
      if (!prior || row.score > prior.score || (row.score === prior.score && row.won && !prior.won)) {
        best.set(boardKey, { board: boardKey, score: row.score, won: row.won === true,
          ...(boardKey === daily ? { day: row.day } : {}) });
      }
    }
    for (const row of semester.records()) {
      if (row.uid !== uid || !Number.isSafeInteger(row.reached) || row.reached < 1) continue;
      const reached = row.reached;
      const cleared = Number.isSafeInteger(row.cleared) && row.cleared >= 0 ? Math.min(row.cleared, reached) : 0;
      const prior = best.get(waves);
      if (!prior || reached > prior.reached || (reached === prior.reached && cleared > prior.cleared)) {
        best.set(waves, { board: waves, reached, cleared });
      }
    }
    return [...best.values()];
  }
  function scheduleSync() {
    if (!user) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => void sync(), 350);
  }
  async function sync() {
    if (!user) return;
    if (syncing) {
      requestedAgain = true;
      return;
    }
    const owner = user, look = semester.lookOf(owner.uid), wasFailed = syncFailed;
    const mail = semester.account()?.mail;
    const fingerprints = Object.create(null);
    const pending = localBest(owner.uid).filter(row => {
      const value = JSON.stringify([row, look, mail]);
      fingerprints[row.board] = value;
      return value !== sent[row.board];
    });
    if (!pending.length) {
      syncFailed = false;
      if (wasFailed) notify();
      return;
    }
    if (!navigator.onLine) {
      syncFailed = true;
      if (!wasFailed) notify();
      return;
    }
    syncing = true;
    let changed = false;
    try {
      const idToken = await owner.getIdToken();
      if (user !== owner) return;
      const result = await request({ action: 'arena-submit', results: pending, look, idToken });
      if (user !== owner) return;
      if (!Array.isArray(result.accepted)) throw new Error('Invalid arena response');
      for (const id of result.accepted) {
        if (!Object.hasOwn(fingerprints, id)) continue;
        sent[id] = fingerprints[id];
        states.delete(id);
        changed = true;
      }
      try { localStorage.setItem(stampPrefix + owner.uid, JSON.stringify(sent)); } catch { /* Use memory during this session. */ }
      syncFailed = result.accepted.length < pending.length;
    } catch {
      if (user === owner) syncFailed = true;
    } finally {
      syncing = false;
      if (user === owner && (changed || wasFailed !== syncFailed)) notify();
      if (requestedAgain) {
        requestedAgain = false;
        scheduleSync();
      }
    }
  }

  function setUser(next) {
    const same = user?.uid === next?.uid;
    user = next;
    if (!same) {
      states.clear();
      syncFailed = false;
      sent = {};
      if (user) {
        try { sent = JSON.parse(localStorage.getItem(stampPrefix + user.uid)) || {}; } catch { /* No previous uploads. */ }
      }
      notify();
    }
    scheduleSync();
  }
  function refresh() {
    for (const state of states.values()) state.expires = 0;
    scheduleSync();
    notify();
  }
  function loadFirebaseScript(name) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-' + name + '-compat.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
  }
  async function connectStandalone() {
    try {
      const [response] = await Promise.all([
        fetch(api + 'firebase-config', { signal: AbortSignal.timeout(10000) }),
        loadFirebaseScript('app').then(() => loadFirebaseScript('auth'))
      ]);
      if (!response.ok) return;
      const config = await response.json();
      if (config.maintenance) return;
      firebase.initializeApp(config).auth().onAuthStateChanged(active => {
        semester.setAccount(active, active?.displayName || semester.account()?.name);
        setUser(active);
        window.dispatchEvent(new CustomEvent('unec:authchange'));
      });
    } catch { /* Locally saved results will sync on the next authenticated visit. */ }
  }

  window.addEventListener('unec:semesterchange', scheduleSync);
  window.addEventListener('online', refresh);
  window.addEventListener('offline', scheduleSync);
  window.addEventListener('focus', refresh);
  window.UNECArenaRecords = { key, waves, daily, dailyDay, board, lookOf, setUser, refresh, syncFailed: () => syncFailed, connectStandalone };
})();
