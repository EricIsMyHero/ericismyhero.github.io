// Account-scoped study records with offline edits and three-way cloud merging.
(function () {
  'use strict';
  const KEYS = ['favorites', 'unec_compass_saved', 'unec_gpa_subjects', 'unec_gpa_history', 'exam_countdowns'];
  const PREFIX = 'unec_study_v1:';
  const endpoint = 'https://ericismyhero-github-io.vercel.app/api/push';
  const clone = value => JSON.parse(JSON.stringify(value));
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const empty = () => Object.fromEntries(KEYS.map(key => [key, []]));
  const storageKey = scope => PREFIX + encodeURIComponent(scope);
  let user = null, scope = 'guest', generation = 0, active = null, timer = null, retry = 1000, paused = false, status = 'guest';
  function read(scope) {
    try {
      const record = JSON.parse(localStorage.getItem(storageKey(scope)) || 'null');
      if (record?.version === 1 && record.values && record.bases && Array.isArray(record.dirty)) {
        return { version: 1, values: Object.fromEntries(KEYS.map(key => [key, Array.isArray(record.values[key]) ? record.values[key] : []])),
          bases: Object.fromEntries(KEYS.map(key => [key, Array.isArray(record.bases[key]) ? record.bases[key] : []])), dirty: record.dirty.filter(key => KEYS.includes(key)) };
      }
    } catch (_) {}
    return { version: 1, values: empty(), bases: empty(), dirty: [] };
  }
  let state = read(scope);
  function persist(record = state, owner = scope) {
    try { localStorage.setItem(storageKey(owner), JSON.stringify(record)); return true; } catch (_) { return false; }
  }
  // Migrate the previous browser-only records once. They are claimed by the
  // first signed-in account, then removed from guest storage and old keys.
  try {
    if (!localStorage.getItem(PREFIX + 'migrated')) {
      for (const key of KEYS) {
        let value;
        try { value = JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) { continue; }
        if (!Array.isArray(value) || !value.length) continue;
        if (key === 'unec_gpa_history') value = value.filter(row => row && Number.isFinite(Number(row.gpa)) && Number(row.gpa) >= 0 && Number(row.gpa) <= 100).slice(-20);
        if (key === 'unec_gpa_subjects') value = value.filter(row => row && Number.isSafeInteger(row.id)).map(row => ({ id: row.id, name: String(row.name || '').slice(0, 200), credit: Math.min(60, Math.max(1, Number(row.credit) || 1)), score: Math.min(100, Math.max(0, Number(row.score) || 0)) }));
        state.values[key] = value;
        if (!state.dirty.includes(key)) state.dirty.push(key);
      }
      if (persist()) {
        localStorage.setItem(PREFIX + 'migrated', '1');
        KEYS.forEach(key => localStorage.removeItem(key));
      }
    }
  } catch (_) {}

  function setStatus(value) {
    status = value;
    window.dispatchEvent(new CustomEvent('unec:studystatus', { detail: { status } }));
  }
  function changed(keys, source) {
    if (!keys.length) return;
    window.dispatchEvent(new CustomEvent('unec:studychange', { detail: { keys, source } }));
    if (keys.includes('favorites')) window.dispatchEvent(new CustomEvent('unec:favchange'));
  }
  function merge(key, latest, base, value) {
    if (key === 'favorites' || key === 'unec_compass_saved') {
      const removed = new Set(base.filter(v => !value.includes(v)));
      return [...new Set([...latest.filter(v => !removed.has(v)), ...value.filter(v => !base.includes(v))])];
    }
    if (key === 'unec_gpa_history') return [...new Map([...latest, ...value].map(row => [row.ts, row])).values()].sort((a, b) => a.ts - b.ts).slice(-20);
    const before = new Map(base.map(row => [row.id, row]));
    const after = new Map(value.map(row => [row.id, row]));
    const result = new Map(latest.filter(row => !before.has(row.id) || after.has(row.id)).map(row => [row.id, { ...row }]));
    for (const row of value) {
      const old = before.get(row.id);
      if (!old) result.set(row.id, { ...row });
      else if (result.has(row.id)) for (const field of Object.keys(row)) if (!same(old[field], row[field])) result.get(row.id)[field] = row[field];
    }
    return [...result.values()];
  }
  function schedule(delay = 700) {
    clearTimeout(timer);
    if (user && !paused) timer = setTimeout(sync, delay);
  }
  async function sync() {
    if (!user || paused || active) return;
    if (navigator.onLine === false) { setStatus('pending'); return; }
    const owner = user, version = generation, controller = new AbortController();
    active = controller;
    const sent = clone(state.values), bases = clone(state.bases), sentDirty = [...state.dirty];
    setStatus('syncing');
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const idToken = await owner.getIdToken();
      if (version !== generation || paused) return;
      const body = { action: sentDirty.length ? 'study-save' : 'study-load', idToken };
      if (sentDirty.length) body.changes = sentDirty.map(key => ({ key, base: bases[key], value: sent[key] }));
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: controller.signal, cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'study_unavailable');
      if (version !== generation || paused) return;
      if (!data.values || !KEYS.every(key => Array.isArray(data.values[key]))) throw new Error('invalid_study_response');
      const updated = [];
      for (const key of KEYS) {
        const remote = data.values[key], before = state.values[key];
        if (state.dirty.includes(key) && (!sentDirty.includes(key) || !same(before, sent[key]))) {
          // Edits made while a request was in flight remain pending.
          state.values[key] = merge(key, remote, sentDirty.includes(key) ? sent[key] : state.bases[key], before);
        } else {
          state.values[key] = remote;
          state.dirty = state.dirty.filter(value => value !== key);
        }
        state.bases[key] = clone(remote);
        if (!same(before, state.values[key])) updated.push(key);
      }
      persist(); retry = 1000;
      setStatus(state.dirty.length ? 'pending' : 'saved');
      changed(updated, 'remote');
      if (state.dirty.length) schedule();
    } catch (error) {
      if (version !== generation || paused) return;
      setStatus(navigator.onLine === false ? 'pending' : 'error');
      // The local journal is kept intact until the server acknowledges it.
      schedule(retry = Math.min(retry * 2, 30000));
    } finally {
      clearTimeout(timeout);
      if (active === controller) active = null;
    }
  }
  function setUser(next) {
    const nextScope = next?.uid || 'guest';
    user = next;
    if (nextScope === scope) { if (user) schedule(0); return; }
    const previous = state, wasGuest = scope === 'guest';
    persist(); generation++; active?.abort(); active = null; clearTimeout(timer);
    scope = nextScope; state = read(scope); paused = false; retry = 1000;
    if (next && wasGuest && previous.dirty.length) {
      for (const key of previous.dirty) {
        state.values[key] = merge(key, state.values[key], [], previous.values[key]);
        if (!state.dirty.includes(key)) state.dirty.push(key);
      }
      if (persist()) persist({ version: 1, values: empty(), bases: empty(), dirty: [] }, 'guest');
    }
    setStatus(next ? 'pending' : 'guest'); changed(KEYS, 'account'); schedule(0);
  }
  window.UNECStudy = {
    keys: [...KEYS],
    getItem(key) { if (!KEYS.includes(key)) throw new Error('Unknown study key'); return JSON.stringify(state.values[key]); },
    setItem(key, raw) {
      if (!KEYS.includes(key)) throw new Error('Unknown study key');
      const value = JSON.parse(raw); if (!Array.isArray(value)) throw new Error('Invalid study value');
      if (same(value, state.values[key])) return;
      state.values[key] = value;
      if (!state.dirty.includes(key)) state.dirty.push(key);
      persist(); setStatus(user ? 'pending' : 'guest'); schedule();
    },
    setUser, sync,
    getStatus: () => status,
    pause() { paused = true; generation++; active?.abort(); active = null; clearTimeout(timer); },
    resume() { paused = false; schedule(0); },
    clearUser(uid) {
      try { localStorage.removeItem(storageKey(uid)); } catch (_) {}
      if (scope === uid) { state = { version: 1, values: empty(), bases: empty(), dirty: [] }; changed(KEYS, 'account'); }
    }
  };
  window.addEventListener('online', () => schedule(0));
  window.addEventListener('focus', () => schedule(0));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) schedule(0); });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey(scope)) return;
    const other = read(scope), updated = [];
    for (const key of KEYS) {
      const pending = state.dirty.includes(key);
      const value = pending ? merge(key, other.values[key], state.bases[key], state.values[key]) : other.values[key];
      if (!same(state.values[key], value)) updated.push(key);
      state.values[key] = value; state.bases[key] = other.bases[key];
      state.dirty = state.dirty.filter(item => item !== key);
      if (other.dirty.includes(key) || (pending && !same(value, other.bases[key]))) state.dirty.push(key);
    }
    persist();
    changed(updated, 'tab'); schedule();
  });
  setInterval(() => { if (!document.hidden) schedule(0); }, 30000);
})();
