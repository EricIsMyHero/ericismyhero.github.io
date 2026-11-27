(function () {
  'use strict';

  const sessionKey = 'unec_semester_session_v1';
  const runPrefix = 'unec_semester_run_v1:';
  const lookPrefix = 'unec_semester_look_v1:';
  const rewards = { boss: 25, semester: 75 };
  const memory = new Map();
  let sessionFallback;
  const integer = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
  const nameOf = value => typeof value === 'string' ? value.trim().slice(0, 64) : '';
  const escape = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  const item = (az, en, points) => ({ az, en, points });
  const collection = {
    head: {
      none: item('Baş geyimsiz', 'No headwear', 0),
      glasses: item('Əlaçı eynəyi', 'Honors glasses', 0),
      headset: item('Proqramçı qulaqlığı', 'Programmer headset', 25),
      hood: item('Gecə Oxuyan kapüşonu', 'Night Owl hood', 50),
      cap: item('Məzun papağı', 'Graduation cap', 75)
    },
    outfit: {
      classic: item('UNEC klassik kostyumu', 'UNEC classic suit', 0),
      sweater: item('Kofeman sviteri', 'Coffee student sweater', 25),
      cyber: item('Kiber-tələbə gödəkçəsi', 'Cyber student jacket', 75),
      armor: item('Kəsr Ovçusu zirehi', 'Retake Hunter armor', 150)
    },
    accessory: {
      none: item('Aksesuarsız', 'No accessory', 0),
      coffee: item('İsti qəhvə fincanı', 'Hot coffee cup', 0),
      pencil: item('Qızıl qələm', 'Golden pen', 25),
      laptop: item('Noutbuk', 'Laptop', 50),
      scroll: item('Apellyasiya Ərizəsi', 'Appeal scroll', 100)
    },
    palette: {
      default: item('Standart rəng', 'Default color', 0),
      green: item('Zərbəçi Yaşılı', 'Honors Green', 25),
      gold: item('Əlaçı Qızılı', 'Scholar Gold', 50),
      purple: item('Dekan Bənövşəyisi', 'Dean Purple', 75),
      neon: item('Kiber Neon', 'Cyber Neon', 100)
    },
    effect: {
      none: item('Effektsiz', 'No effect', 0),
      shimmer: item('İşıq dalğası', 'Shimmer', 50),
      stars: item('Ulduz parıltısı', 'Starlight', 100),
      flame: item('Sessiya Canavarı', 'Exam Season Flame', 125)
    },
    title: {
      none: item('Titulsuz', 'No title', 0),
      slayer: { az: 'Kəsr Qatili', en: 'Retake Slayer', requirement: 'bosses' },
      patron: { az: 'Təqaüd Maqnatı', en: 'Scholarship Tycoon', requirement: 'scholar' },
      fronts: { az: '4 Cəbhə Qəhrəmanı', en: 'Four Fronts Hero', requirement: 'fourFronts' }
    }
  };
  const defaults = { head: 'none', outfit: 'classic', accessory: 'none', palette: 'default',
    effect: 'none', title: 'none', avatar: false };
  const palettes = {
    default: ['#34566b', '#8ccae9'], green: ['#236953', '#95e1b9'], gold: ['#885b25', '#fbe08d'],
    purple: ['#61437c', '#e2b4fa'], neon: ['#254e72', '#69e5f3']
  };

  function parse(raw) {
    try { return JSON.parse(raw); } catch { return null; }
  }
  function read(key) {
    if (memory.has(key)) return memory.get(key);
    try { return parse(localStorage.getItem(key)); } catch { return null; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); memory.delete(key); }
    catch { memory.set(key, value); }
    window.dispatchEvent(new CustomEvent('unec:semesterchange'));
  }
  function account() {
    let data = sessionFallback;
    if (data === undefined) {
      try { data = parse(sessionStorage.getItem(sessionKey)); } catch { return null; }
    }
    return typeof data?.uid === 'string' && data.uid ? { uid: data.uid, name: nameOf(data.name) } : null;
  }
  function setAccount(user, name) {
    const data = user?.uid ? { uid: user.uid, name: nameOf(name) } : null;
    try {
      if (data) sessionStorage.setItem(sessionKey, JSON.stringify(data));
      else sessionStorage.removeItem(sessionKey);
      sessionFallback = undefined;
    } catch { sessionFallback = data; }
  }
  function startRun(guest) {
    const active = account();
    const id = globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
    return { id, uid: active?.uid ?? null, name: active?.name || nameOf(guest) || 'Tələbə', reached: 0,
      cleared: 0, bosses: [], semester: false, scholar: false, fourFronts: false, at: Date.now() };
  }
  function persist(run) {
    write(runPrefix + run.id, run);
  }
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
  function records() {
    const found = new Map();
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(runPrefix)) found.set(key, read(key));
      }
    } catch { /* In-memory records remain usable. */ }
    for (const [key, data] of memory) if (key.startsWith(runPrefix)) found.set(key, data);
    return [...found.values()].filter(row => row && typeof row.name === 'string');
  }
  function balance(run) {
    return run?.uid ? (run.bosses.length * rewards.boss + (run.semester ? rewards.semester : 0)) : 0;
  }
  function stats(uid, rows = records()) {
    const data = { points: 0, bosses: 0, scholar: false, fourFronts: false };
    if (!uid) return data;
    for (const run of rows) {
      if (run.uid !== uid) continue;
      const bosses = Array.isArray(run.bosses) ? new Set(run.bosses.filter(integer)).size : 0;
      data.bosses += bosses;
      data.points += bosses * rewards.boss + (run.semester === true ? rewards.semester : 0);
      data.scholar ||= run.scholar === true;
      data.fourFronts ||= run.fourFronts === true;
    }
    return data;
  }
  function unlocked(definition, data) {
    return definition.requirement ? !!data[definition.requirement] : data.points >= definition.points;
  }
  function normalizeLook(value, data) {
    const look = { ...defaults, avatar: value?.avatar === true };
    for (const [category, variants] of Object.entries(collection)) {
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
      if (!integer(run.reached)) continue;
      const key = run.uid ? 'uid:' + run.uid : 'guest:' + run.name.toLocaleLowerCase('az');
      const previous = best.get(key);
      if (!previous || compare(run, previous) < 0) best.set(key, run);
    }
    return [...best.values()].sort(compare).slice(0, 10);
  }

  const clothes = {
    classic: '<path fill="#23334a" d="M16 51h40v16H16z"/><path fill="#d9edf2" d="M31 51h10l-5 12z"/><path fill="#60c3bd" d="m36 53 3 7-3 5-3-5z"/>',
    sweater: '<path fill="#ad6350" d="M15 51h42v16H15z"/><path stroke="#fbc99d" stroke-width="2" d="M20 56h32M20 61h32"/><path fill="#6f4140" d="M32 52h8v5h-8z"/>',
    cyber: '<path fill="#252646" d="M15 51h42v16H15z"/><path stroke="#79eee8" stroke-width="2" d="m22 64 8-10m20 10-8-10M36 53v14"/>',
    armor: '<path fill="#565473" d="M12 52h48v15H12z"/><path fill="#89859f" d="M12 52h12v7H12zm36 0h12v7H48zM27 54h18v11H27z"/><path fill="#ff766d" d="M34 57h4v5h-4z"/>'
  };
  const hats = {
    none: '',
    glasses: '<path d="M22 29h12v8H22zm16 0h12v8H38zm-4 3h4" fill="#b5edf1" fill-opacity=".6" stroke="#2c2d49" stroke-width="2"/>',
    headset: '<path d="M20 30v-8l5-6h23l5 6v8m0 8v5H42" fill="none" stroke="#776ed3" stroke-width="3"/><path fill="#b5a9ff" d="M17 27h7v12h-7zm31 0h7v12h-7z"/>',
    hood: '<path fill="#817497" d="M16 29V20l11-9h18l11 9v22l-7 5h-5l5-10V24l-7-7H29l-6 7v13l5 10h-5l-7-5z"/><path fill="#d8b1d3" d="M23 45h2v11h-2zm24 0h2v11h-2z"/>',
    cap: '<path fill="#283456" d="m12 17 24-8 24 8-24 8zM24 21l12 4 12-4v7l-12 4-12-4z"/><path d="M56 18v12" stroke="#ffcb70" stroke-width="2"/><path fill="#ffcb70" d="M54 28h4v5h-4z"/>'
  };
  const accessories = {
    none: '',
    coffee: '<path fill="#f1e1ca" d="M52 49h11l-2 11h-7z"/><path d="M63 51h3v5h-4M55 47l2-3m2 3 2-3" fill="none" stroke="#f3d8b3" stroke-width="2"/><path fill="#815249" d="M53 50h9v2h-9z"/>',
    pencil: '<path fill="#ffcf6f" d="m48 61 13-16 3 3-13 16-6 2z"/><path fill="#54394b" d="m45 66 5-2-3-2z"/>',
    laptop: '<path fill="#97b5cd" d="M44 47h21v13H44zM41 61h26v4H41z"/><path fill="#275773" d="M46 49h17v9H46z"/><path fill="#9eefe0" d="m50 51-3 2 3 2 1-1-2-1 2-1zm9 0-1 1 2 1-2 1 1 1 3-2z"/>',
    scroll: '<path fill="#f7e4a6" d="M50 44h14v18H50zM48 43h17v3H48zm0 16h18v4H48z"/><path stroke="#9b6349" d="M53 49h7m-7 3h7m-7 3h4"/><path fill="#b95560" d="M59 54h4v5h-4z"/>'
  };
  function avatar(look) {
    const [bg, trim] = palettes[look.palette] ?? palettes.default;
    return `<svg class="semester-avatar-svg" viewBox="0 0 72 72" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <rect width="72" height="72" rx="14" fill="${bg}"/>
      <path fill="none" stroke="${trim}" stroke-opacity=".35" d="M8 13h12m-6-6v12m42 18h10m-5-5v10M6 59h8"/>
      <path fill="#384559" d="M19 23l6-7h22l6 7v18l-7 9H26l-7-9z"/>
      <path fill="#e9b58e" d="M23 24l5-5h16l5 5v16l-6 7H29l-6-7zM31 45h10v8H31z"/>
      <path fill="#3d394e" d="M20 24l6-8h21l5 9-7-3-8 4-9-2-5 4zM27 31h4v4h-4zm14 0h4v4h-4z"/>
      <path stroke="#a7605e" stroke-width="2" d="M33 40h6"/>
      ${clothes[look.outfit] ?? clothes.classic}${hats[look.head] ?? ''}${accessories[look.accessory] ?? ''}
    </svg>`;
  }
  function nameplate(name, look) {
    const [, color] = palettes[look.palette] ?? palettes.default;
    return `<span class="semester-nameplate" data-palette="${escape(look.palette)}" data-effect="${escape(look.effect)}" style="--semester-color:${color}"><span>${escape(name)}</span></span>`;
  }
  function title(look, language) {
    return look.title === 'none' ? '' : collection.title[look.title]?.[language] ?? '';
  }

  window.addEventListener('storage', event => {
    if (!event.key || event.key.startsWith(runPrefix) || event.key.startsWith(lookPrefix)) {
      window.dispatchEvent(new CustomEvent('unec:semesterchange'));
    }
  });
  window.UNECSemesterProfile = {
    account, setAccount, rewards, startRun, reached, clearWave, bossDefeated, maxScholarship, balance,
    records, stats, collection, unlocked, lookOf, saveLook, leaderboard, avatar, nameplate, title, escape
  };
})();
