(function () {
  'use strict';

  const profileKey = 'unec_games_profile_v1';
  const recordPrefix = 'unec_games_run_v1:';
  const words = {
    az: {
      guide: 'Necə oynanılır', progress: 'Rekordlar və görünüşlər', game: 'Oyun', mode: 'Kateqoriya',
      student: 'Tələbə', player: 'Oyunçu adı', score: 'Xal', points: 'kampus xalı', yourScore: 'Nəticən',
      local: 'Rekordlar, xallar və görünüşlər bu brauzerdə oyunçu adına görə saxlanılır.',
      empty: 'Bu kateqoriyada hələ nəticə yoxdur.', share: 'Nəticəni paylaş', copied: 'Nəticə kopyalandı.',
      fallback: 'Paylaşmaq üçün mətni kopyala.', achievements: 'Nailiyyətlər', skins: 'Tələbə görünüşləri',
      nextRun: 'Seçdiyin görünüş növbəti oyunda tətbiq olunur.', chosen: 'Seçilib', unlocked: 'Açıqdır',
      first: 'İlk nəticə', all: 'Üç oyunda nəticə', champion: 'Üç oyunda qələbə',
      easy: 'Asan', medium: 'Orta', normal: 'Normal', hard: 'Çətin', standard: 'Standart',
      campaign: '15 həftə', endless: 'Sonsuz', continuation: 'Kampaniyadan sonra',
      earned: 'Hər 20 oyun xalı 1 kampus xalı verir. Müsbət nəticələr yuxarı yuvarlaqlaşdırılır.'
    },
    en: {
      guide: 'How to Play', progress: 'Records & skins', game: 'Game', mode: 'Category',
      student: 'Student', player: 'Player name', score: 'Score', points: 'campus points', yourScore: 'Your result',
      local: 'Records, points and skins are saved in this browser under your player name.',
      empty: 'No results in this category yet.', share: 'Share result', copied: 'Result copied.',
      fallback: 'Copy this text to share your result.', achievements: 'Achievements', skins: 'Student skins',
      nextRun: 'Your selected skin applies to the next run.', chosen: 'Selected', unlocked: 'Unlocked',
      first: 'First result', all: 'Result in all three games', champion: 'Won all three games',
      easy: 'Easy', medium: 'Medium', normal: 'Normal', hard: 'Hard', standard: 'Standard',
      campaign: '15 weeks', endless: 'Endless', continuation: 'After campaign',
      earned: 'Every 20 game points earn 1 campus point. Positive results are rounded up.'
    }
  };
  const titles = {
    'ring-escape': ['Halqadan çıxış', 'Ring Escape'],
    'tower-descent': ['Qüllə enişi', 'Tower Descent'],
    'semester-defense': ['UNEC · Semestr müdafiəsi', 'UNEC Semester Defense']
  };
  const guides = {
    'ring-escape': [
      ['Arenaya toxun və ya ← → düymələri ilə halqanın boşluğunu topa tərəf çevir.',
        '15 saniyə ilə başla. Hər halqa +3 saniyə və +10 xal verir. Üç mərhələni bitirmək +100 xaldır.'],
      ['Tap the arena or use ← → to line up the gap with the ball.',
        'Start with 15 seconds. Each ring adds 3 seconds and 10 points. Clear all three stages for 100 bonus points.']
    ],
    'tower-descent': [
      ['Sürüşdür və ya ← → ilə qülləni döndər. Sarı hissəni qırmaq üçün arenanı, «Qır» düyməsini və ya Space düyməsini basılı saxla.',
        'Qırmızı və mavi hissələr təhlükəlidir. Bənövşəyi orb 4 saniyə ərzində istənilən hissəni qırmağa imkan verir.',
        'Sikkə 10, keçilən platforma 20, qülləni tam bitirmək isə əlavə 100 xal verir.'],
      ['Drag or use ← → to rotate. Hold the arena, Smash or Space to break a yellow section.',
        'Red and blue sections are dangerous. A purple orb lets you smash any section for 4 seconds.',
        'A coin gives 10 points, a cleared platform gives 20, and reaching the bottom adds 100.']
    ],
    'semester-defense': [
      ['Müdafiəçini seç, yol kənarındakı xanada yerləşdir və qülləyə toxunaraq onu yüksəlt. Üçüncü səviyyədə ixtisas seç.',
        'Hər dalğadan sonra xəritəni genişləndir. Şparqalka Yağışı sahəyə, Apellyasiya bütün imtahanlara, Enerji İçkisi seçilən müdafiəçiyə təsir edir.',
        'Tamamlanan həftə 100, məğlub edilən imtahan 3 və kampaniya qələbəsi əlavə 200 xal verir.'],
      ['Choose a defender and place it beside a path. Select a defender to upgrade it and choose a specialization at level 3.',
        'Expand the map after waves. Cheat Sheet Strike targets an area, Appeal freezes exams, and Energy Drink boosts one defender.',
        'A completed week gives 100 points, each defeated exam gives 3, and a campaign win adds 200.']
    ]
  };
  const modes = {
    'ring-escape': ['easy', 'medium', 'hard'],
    'tower-descent': ['standard'],
    'semester-defense': ['campaign', 'endless', 'continuation']
      .flatMap(mode => ['easy', 'normal', 'hard'].map(difficulty => mode + '-' + difficulty))
  };
  const links = {
    'ring-escape': '/#/games/ring-escape',
    'tower-descent': '/#/games/tower-descent',
    'semester-defense': '/games/semester-defense/'
  };
  const skins = [
    { id: 'campus', at: 0, title: ['Kampus', 'Campus'], color: null, accent: '#abbaad' },
    { id: 'fresh', at: 10, title: ['Birinci kurs', 'First Year'], color: '#65dfc4', accent: '#236f7b' },
    { id: 'honors', at: 30, title: ['Zərbəçi', 'Honors'], color: '#ffd17c', accent: '#a4562a' },
    { id: 'grad', at: 75, title: ['Məzun', 'Graduate'], color: '#d8adff', accent: '#6d47ad' }
  ];
  const memory = new Map();
  const mounts = new WeakMap();
  let fallbackProfile;
  const number = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
  const nameOf = value => typeof value === 'string' ? value.trim().slice(0, 24) : '';
  const playerKey = value => nameOf(value).toLocaleLowerCase('az') || 'tələbə';
  const escape = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const isMode = (game, mode) => Object.hasOwn(modes, game) && modes[game].includes(mode);
  const campusPoints = score => Math.ceil(score / 20);

  function parse(raw) {
    try { return JSON.parse(raw); } catch { return null; }
  }
  function profile() {
    try { return fallbackProfile ?? parse(localStorage.getItem(profileKey)) ?? {}; }
    catch { return fallbackProfile ?? {}; }
  }
  function saveProfile(changes) {
    const data = { ...profile(), ...changes };
    try { localStorage.setItem(profileKey, JSON.stringify(data)); fallbackProfile = undefined; }
    catch { fallbackProfile = data; }
  }
  function entries() {
    const results = new Map(memory);
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith(recordPrefix)) continue;
        const result = parse(localStorage.getItem(key));
        if (result && isMode(result.game, result.mode)) results.set(key.slice(recordPrefix.length), result);
      }
    } catch { /* Session records remain available if storage is disabled. */ }
    return [...results.values()].filter(row => isMode(row.game, row.mode));
  }
  function personal(rows) {
    const key = playerKey(profile().player);
    return rows.filter(row => playerKey(row.player) === key);
  }
  const pointsFor = rows => rows.reduce((sum, row) => sum + campusPoints(number(row.score)), 0);
  function activeSkin(points = pointsFor(personal(entries()))) {
    const data = profile(), picked = data.skins?.[playerKey(data.player)];
    return skins.find(skin => skin.id === picked && skin.at <= points) ?? skins[0];
  }
  function start(game, mode) {
    if (!isMode(game, mode)) return null;
    const id = globalThis.crypto?.randomUUID?.() ??
      Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
    return { id, game, mode, player: nameOf(profile().player), skin: activeSkin(), result: null };
  }
  function refreshPanels() {
    document.querySelectorAll('[data-game-meta]').forEach(node => mounts.get(node)?.refresh());
  }
  function finish(run, score, won) {
    if (!run || run.result) return run?.result ?? null;
    const result = { game: run.game, mode: run.mode, player: run.player, score: number(score), won: !!won, at: Date.now() };
    run.result = result;
    try { localStorage.setItem(recordPrefix + run.id, JSON.stringify(result)); }
    catch { memory.set(run.id, result); }
    refreshPanels();
    return result;
  }
  function compare(a, b) {
    return number(b.score) - number(a.score) || number(a.at) - number(b.at);
  }
  function board(rows, game, mode, fallback) {
    const best = new Map();
    for (const row of rows) {
      if (row.game !== game || row.mode !== mode) continue;
      const player = nameOf(row.player) || fallback;
      const key = playerKey(row.player);
      const previous = best.get(key);
      if (!previous || compare(row, previous) < 0) best.set(key, { ...row, player });
    }
    return [...best.values()].sort(compare).slice(0, 10);
  }
  function category(mode, l) {
    return mode.split('-').map(part => l[part]).join(' · ');
  }

  function mount(host, options = {}) {
    if (!host) return null;
    const language = options.language === 'en' ? 'en' : 'az', locale = language === 'en' ? 1 : 0;
    const l = words[language], fixedGame = options.game;
    let game = fixedGame ?? 'ring-escape';
    let mode = isMode(game, options.mode) ? options.mode : modes[game][0];
    let result = options.result ?? null;
    let best = null;
    host.classList.add('game-meta');
    host.dataset.gameMeta = '';
    host.innerHTML = (fixedGame ? `
      <details data-panel ${options.openGuide ? 'open' : ''}>
        <summary>${l.guide}</summary>
        <ul>${guides[game][locale].map(text => `<li>${escape(text)}</li>`).join('')}</ul>
      </details>` : '') + `
      <div class="game-meta-result" hidden>
        <strong data-result-text></strong>
        <button type="button" data-share="result">${l.share}</button>
      </div>
      <details data-panel ${options.openRecords ? 'open' : ''}>
        <summary>${l.progress}</summary>
        <div class="game-meta-content">
          <p>${l.local}</p>
          <div class="game-meta-fields">
            <label>${l.player}<input data-player maxlength="24" autocomplete="off" placeholder="${l.student}"></label>
            ${fixedGame ? '' : `<label>${l.game}<select data-game>${Object.entries(titles).map(([id, title]) =>
              `<option value="${id}">${escape(title[locale])}</option>`).join('')}</select></label>`}
            <label>${l.mode}<select data-mode></select></label>
          </div>
          <ol data-board class="game-meta-board"></ol>
          <p data-empty hidden>${l.empty}</p>
          <button type="button" data-share="best" hidden>${l.share}</button>
          <p class="game-meta-points"><strong data-points></strong><br><span>${l.earned}</span></p>
          <div role="group" aria-label="${l.achievements}" class="game-achievements" data-achievements></div>
          <div role="group" aria-label="${l.skins}" class="game-skins" data-skins></div>
          <p>${l.nextRun}</p>
        </div>
      </details>
      <p data-share-status role="status" hidden></p>
      <textarea data-share-text readonly aria-label="${l.share}" hidden></textarea>`;
    const el = selector => host.querySelector(selector);
    const boardList = el('[data-board]'), modeInput = el('[data-mode]');
    if (modes[game].length === 1) modeInput.closest('label').hidden = !!fixedGame;

    function updateModes() {
      modeInput.innerHTML = modes[game].map(key =>
        `<option value="${key}">${escape(category(key, l))}</option>`).join('');
      modeInput.value = mode;
    }
    function refresh() {
      const rows = entries(), mine = personal(rows), points = pointsFor(mine);
      const selected = activeSkin(points);
      const records = board(rows, game, mode, l.student);
      best = records[0] ?? null;
      const input = el('[data-player]');
      if (document.activeElement !== input) input.value = nameOf(profile().player);
      boardList.innerHTML = records.map(row =>
        `<li><div><span>${escape(row.player)}</span><strong>${number(row.score)} ${l.score.toLowerCase()}</strong></div></li>`).join('');
      el('[data-empty]').hidden = !!best;
      el('[data-share="best"]').hidden = !best;
      el('[data-points]').textContent = points + ' ' + l.points;
      const earned = [mine.some(row => number(row.score) > 0),
        Object.keys(titles).every(id => mine.some(row => row.game === id && number(row.score) > 0)),
        Object.keys(titles).every(id => mine.some(row => row.game === id && row.won === true))];
      el('[data-achievements]').innerHTML = ['first', 'all', 'champion'].map((id, index) =>
        `<span data-earned="${earned[index]}">${earned[index] ? '✓ ' : ''}${l[id]}</span>`).join('');
      el('[data-skins]').innerHTML = skins.map(skin => `
        <button type="button" data-skin="${skin.id}" aria-pressed="${skin === selected}" ${skin.at > points ? 'disabled' : ''}>
          <span class="game-skin-swatch" style="--skin-color:${skin.color ?? skin.accent}" aria-hidden="true"></span>
          <strong>${skin.title[locale]}</strong>
          <small>${skin === selected ? l.chosen : skin.at > points ? skin.at + ' ' + l.points : l.unlocked}</small>
        </button>`).join('');
      el('.game-meta-result').hidden = !result;
      if (result) el('[data-result-text]').textContent =
        l.yourScore + ' · ' + result.score + ' ' + l.score.toLowerCase() + ' · +' + campusPoints(result.score) + ' ' + l.points;
    }
    async function share(row) {
      if (!row) return;
      const title = titles[row.game][locale], url = new URL(links[row.game], location.origin).href;
      const text = title + ' · ' + category(row.mode, l) + ' · ' + row.score + ' ' + l.score.toLowerCase();
      const status = el('[data-share-status]'), field = el('[data-share-text]');
      field.hidden = true; status.hidden = true;
      if (navigator.share) {
        try { await navigator.share({ title, text, url }); return; }
        catch (err) { if (err.name === 'AbortError') return; }
      }
      try {
        await navigator.clipboard.writeText(text + '\n' + url);
        status.textContent = l.copied;
      } catch {
        status.textContent = l.fallback;
        field.value = text + '\n' + url; field.hidden = false; field.select();
      }
      status.hidden = false;
    }
    host.oninput = event => {
      if (!event.target.matches('[data-player]')) return;
      saveProfile({ player: nameOf(event.target.value) });
      refreshPanels();
    };
    host.onchange = event => {
      const node = event.target;
      if (node.matches('[data-player]')) {
        node.value = nameOf(node.value);
      } else if (node.matches('[data-game]')) {
        game = node.value; mode = modes[game][0]; updateModes(); refresh();
      } else if (node.matches('[data-mode]')) {
        mode = node.value; refresh();
      }
    };
    host.onclick = event => {
      const target = event.target.closest('button');
      if (!target || target.disabled) return;
      if (target.dataset.share) void share(target.dataset.share === 'result' ? result : best);
      if (target.dataset.skin) {
        const id = target.dataset.skin;
        const data = profile();
        saveProfile({ skins: { ...data.skins, [playerKey(data.player)]: id } });
        refreshPanels();
        el('[data-skin="' + id + '"]').focus();
      }
    };
    host.querySelectorAll('details').forEach(panel => {
      panel.ontoggle = () => { if (panel.open) options.onOpen?.(); };
    });
    const view = {
      refresh,
      showResult(entry) { result = entry; refresh(); },
      setMode(next) {
        if (isMode(game, next)) { mode = next; updateModes(); refresh(); }
      }
    };
    mounts.set(host, view);
    updateModes();
    refresh();
    return view;
  }

  window.addEventListener('storage', event => {
    if (!event.key || event.key === profileKey || event.key.startsWith(recordPrefix)) refreshPanels();
  });
  window.UNECGameProgress = { activeSkin, start, finish, mount, campusPoints };
})();
