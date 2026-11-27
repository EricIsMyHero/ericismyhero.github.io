(function () {
  'use strict';

  const wardrobe = window.UNECStudentWardrobe;
  const sessionKey = 'unec_semester_session_v1';
  const runPrefix = 'unec_semester_run_v1:';
  const scorePrefix = 'unec_games_run_v1:';
  const lookPrefix = 'unec_semester_look_v1:';
  const handlePrefix = 'unec_semester_handle_v1:';
  const rewards = { boss: 2, semester: 6 };
  const legacyRewards = { boss: 25, semester: 75 };
  const scoreRules = {
    'ring-escape': {
      easy: { minimum: 450, interval: 250, victory: 2, limit: 8 },
      medium: { minimum: 700, interval: 350, victory: 3, limit: 9 },
      hard: { minimum: 1000, interval: 450, victory: 4, limit: 12 }
    },
    'tower-descent': { standard: { minimum: 400, interval: 180, victory: 3, limit: 8 } },
    'semester-defense': { all: { minimum: 1600, interval: 700, victory: 4, limit: 10 } }
  };
  const memory = new Map();
  let sessionFallback;
  const integer = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
  const nameOf = value => typeof value === 'string' ? value.trim().slice(0, 64) : '';
  const escape = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const handle = email => {
    const index = typeof email === 'string' ? email.indexOf('@') : -1;
    return index > 0 ? nameOf(email.slice(0, index)) : '';
  };
  const validHandle = name => {
    const text = nameOf(name);
    return text && !text.includes('@') ? text : '';
  };
  function parse(raw) {
    try { return JSON.parse(raw); } catch { return null; }
  }
  function read(key) {
    if (memory.has(key)) return memory.get(key);
    try { return parse(localStorage.getItem(key)); } catch { return null; }
  }
  function write(key, value, notify = true) {
    try { localStorage.setItem(key, JSON.stringify(value)); memory.delete(key); }
    catch { memory.set(key, value); }
    if (notify) window.dispatchEvent(new CustomEvent('unec:semesterchange'));
  }
  function list(prefix) {
    const found = new Map();
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) found.set(key, read(key));
      }
    } catch { /* In-memory records remain usable. */ }
    for (const [key, data] of memory) if (key.startsWith(prefix)) found.set(key, data);
    return [...found.values()].filter(row => row && typeof row === 'object' && !Array.isArray(row));
  }
  const records = () => list(runPrefix);
  const gameRecords = () => list(scorePrefix);
  const saveGameRecord = (id, result) => write(scorePrefix + id, result);
  function account() {
    let data = sessionFallback;
    if (data === undefined) {
      try { data = parse(sessionStorage.getItem(sessionKey)); } catch { return null; }
    }
    return typeof data?.uid === 'string' && data.uid ? {
      uid: data.uid, name: nameOf(data.name), mail: validHandle(data.mail)
    } : null;
  }
  function setAccount(user, name) {
    const mail = handle(user?.email) || (user?.providerData ?? []).map(provider => handle(provider.email)).find(Boolean) || '';
    const data = user?.uid ? { uid: user.uid, name: nameOf(name), mail } : null;
    try {
      if (data) sessionStorage.setItem(sessionKey, JSON.stringify(data));
      else sessionStorage.removeItem(sessionKey);
      sessionFallback = undefined;
    } catch { sessionFallback = data; }
    if (data?.mail) write(handlePrefix + data.uid, data.mail, false);
  }
  function recordName(uid, paperName) {
    return uid ? validHandle(read(handlePrefix + uid)) || validHandle(paperName) : '';
  }
  function startRun() {
    const active = account();
    const id = globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
    return { id, uid: active?.uid ?? null, mail: active?.mail ?? '', economy: 2, reached: 0,
      cleared: 0, bosses: [], semester: false, scholar: false, fourFronts: false, at: Date.now() };
  }
  const persist = run => { if (run.uid) write(runPrefix + run.id, run); };
  function reached(run, wave) {
    if (!run || integer(wave) <= run.reached) return;
    run.reached = wave;
    persist(run);
  }
  function clearWave(run, wave, count, portals) {
    if (!run) return 0;
    const cleared = Math.max(run.cleared, integer(wave));
    const fourFronts = run.fourFronts || integer(portals) >= 4;
    const milestone = !run.semester && integer(count) >= 15;
    if (cleared !== run.cleared || fourFronts !== run.fourFronts || milestone) {
      run.cleared = cleared;
      run.fourFronts = fourFronts;
      if (milestone) run.semester = true;
      persist(run);
    }
    return milestone && run.uid ? rewards.semester : 0;
  }
  function bossDefeated(run, bossId) {
    if (!run || !integer(bossId) || run.bosses.includes(bossId)) return 0;
    run.bosses.push(bossId);
    persist(run);
    return run.uid ? rewards.boss : 0;
  }
  function maxScholarship(run) {
    if (!run || run.scholar) return;
    run.scholar = true;
    persist(run);
  }
  function bossCount(run) {
    return Array.isArray(run.bosses) ? new Set(run.bosses.filter(integer)).size : 0;
  }
  function balance(run) {
    const values = run?.economy === 2 ? rewards : legacyRewards;
    return run?.uid ? bossCount(run) * values.boss + (run.semester === true ? values.semester : 0) : 0;
  }
  function ruleFor(game, mode) {
    if (!Object.hasOwn(scoreRules, game)) return null;
    const byMode = scoreRules[game];
    return Object.hasOwn(byMode, mode) ? byMode[mode] : byMode.all ?? null;
  }
  function scoreReward(game, mode, rawScore, won) {
    const rule = ruleFor(game, mode), score = integer(rawScore);
    if (!rule || score < rule.minimum) return 0;
    return Math.min(rule.limit, 1 + Math.floor((score - rule.minimum) / rule.interval) + (won ? rule.victory : 0));
  }
  function stats(uid, rows = records(), scores = gameRecords()) {
    const byGame = { 'ring-escape': 0, 'tower-descent': 0, 'semester-defense': 0 };
    const data = { points: 0, legacy: 0, bosses: 0, scholar: false, fourFronts: false, triad: false, byGame };
    if (!uid) return data;
    const credited = new Set();
    for (const run of rows) {
      if (run.uid !== uid) continue;
      const points = balance(run);
      byGame['semester-defense'] += points;
      if (run.economy !== 2) data.legacy += points;
      data.bosses += bossCount(run);
      data.scholar ||= run.scholar === true;
      data.fourFronts ||= run.fourFronts === true;
    }
    for (const row of scores) {
      if (row.uid !== uid || row.economy !== 2 || !Object.hasOwn(byGame, row.game)) continue;
      const points = scoreReward(row.game, row.mode, row.score, row.won === true);
      byGame[row.game] += points;
      if (points) credited.add(row.game);
    }
    data.points = Object.values(byGame).reduce((sum, amount) => sum + amount, 0);
    data.triad = credited.size === Object.keys(byGame).length;
    return data;
  }
  function unlocked(definition, data) {
    return definition.requirement ? !!data[definition.requirement] :
      data.points >= definition.points || (definition.legacy != null && data.legacy >= definition.legacy);
  }
  function normalizeLook(value, data) {
    const look = { ...wardrobe.defaults, avatar: value?.avatar === true };
    for (const [category, variants] of Object.entries(wardrobe.collection)) {
      const selected = value?.[category];
      if (Object.hasOwn(variants, selected) && unlocked(variants[selected], data)) look[category] = selected;
    }
    return look;
  }
  function lookOf(uid, data = stats(uid)) {
    return normalizeLook(uid ? read(lookPrefix + uid) : null, data);
  }
  function saveLook(uid, value) {
    if (!uid) return null;
    const look = normalizeLook(value, stats(uid));
    write(lookPrefix + uid, look);
    return look;
  }
  function compare(a, b) {
    return integer(b.reached) - integer(a.reached) ||
      integer(b.cleared) - integer(a.cleared) || integer(a.at) - integer(b.at);
  }
  function leaderboard(rows = records()) {
    const best = new Map();
    for (const run of rows) {
      const player = recordName(run.uid, run.mail);
      if (!integer(run.reached) || !player) continue;
      const previous = best.get(run.uid);
      if (!previous || compare(run, previous) < 0) best.set(run.uid, { ...run, player });
    }
    return [...best.values()].sort(compare).slice(0, 10);
  }
  function nameplate(name, look) {
    const palette = wardrobe.palettes[look.palette] ?? wardrobe.palettes.default;
    return `<span class="semester-nameplate" data-palette="${escape(look.palette)}" data-effect="${escape(look.effect)}"
      style="--semester-color:${palette.light};--semester-deep:${palette.base};--semester-mid:${palette.mid}">${escape(name)}</span>`;
  }
  function title(look, language) {
    return look.title === 'none' ? '' : wardrobe.collection.title[look.title]?.[language] ?? '';
  }

  window.addEventListener('storage', event => {
    if (!event.key || [runPrefix, scorePrefix, lookPrefix, handlePrefix].some(prefix => event.key.startsWith(prefix))) {
      window.dispatchEvent(new CustomEvent('unec:semesterchange'));
    }
  });
  window.UNECSemesterProfile = {
    account, setAccount, rewards, startRun, reached, clearWave, bossDefeated, maxScholarship, balance, recordName,
    records, gameRecords, saveGameRecord, scoreReward, ruleFor, stats, collection: wardrobe.collection,
    unlocked, lookOf, saveLook, leaderboard, avatar: wardrobe.avatar, nameplate, title, escape
  };
})();
