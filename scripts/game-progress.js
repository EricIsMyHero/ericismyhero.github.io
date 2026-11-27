(function () {
  'use strict';

  const semester = window.UNECSemesterProfile;
  const wardrobe = window.UNECStudentWardrobe;
  const words = {
    az: {
      guide: 'Necə oynanılır', progress: 'Arena rekordları', game: 'Oyun', mode: 'Kateqoriya',
      score: 'xal', points: 'Semestr Xalı', yourScore: 'Nəticən', completed: 'Qələbə', rank: 'Sıra',
      local: 'Bu brauzerdə hər hesabın ən yaxşı nəticəsi göstərilir. Ad e-poçtun @ işarəsindən əvvəlki hissəsidir.',
      login: 'Xal qazanmaq və rekord yazmaq üçün hesabına daxil ol.', dashboard: 'Tələbə paneli',
      empty: 'Bu kateqoriyada hesabla yazılmış rekord yoxdur.', share: 'Nəticəni paylaş', copied: 'Nəticə kopyalandı.',
      fallback: 'Paylaşmaq üçün mətni kopyala.', me: 'Sənin rekordun', leader: 'Kateqoriya lideri',
      easy: 'Asan', medium: 'Orta', normal: 'Normal', hard: 'Çətin', standard: 'Standart',
      campaign: '15 həftə', endless: 'Sonsuz', continuation: 'Kampaniyadan sonra',
      rule: ({minimum, interval, victory, limit}) =>
        `İlk Semestr Xalı ${minimum} oyun xalında gəlir. Hər əlavə ${interval} xal və qələbə müvafiq olaraq +1 və +${victory} verir. Bir nəticədən ən çox ${limit} Semestr Xalı qazanılır.`
    },
    en: {
      guide: 'How to Play', progress: 'Arena records', game: 'Game', mode: 'Category',
      score: 'points', points: 'Semester Points', yourScore: 'Your result', completed: 'Victory', rank: 'Place',
      local: 'This browser shows each account’s best result under the name before @ in its email address.',
      login: 'Sign in to earn points and set account records.', dashboard: 'Student dashboard',
      empty: 'No account records in this category yet.', share: 'Share result', copied: 'Result copied.',
      fallback: 'Copy this text to share your result.', me: 'Your record', leader: 'Category leader',
      easy: 'Easy', medium: 'Medium', normal: 'Normal', hard: 'Hard', standard: 'Standard',
      campaign: '15 weeks', endless: 'Endless', continuation: 'After campaign',
      rule: ({minimum, interval, victory, limit}) =>
        `Earn the first Semester Point at ${minimum} game points. Every extra ${interval} game points adds 1, and winning adds ${victory}. Each result earns up to ${limit}.`
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
  const oldSkins = [
    { id: 'fresh', at: 10, color: '#65dfc4', accent: '#236f7b' },
    { id: 'honors', at: 30, color: '#ffd17c', accent: '#a4562a' },
    { id: 'grad', at: 75, color: '#d8adff', accent: '#6d47ad' }
  ];
  const baseSkin = { id: 'campus', color: null };
  const mounts = new WeakMap();
  const number = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
  const keyOf = value => typeof value === 'string' ? value.trim().toLocaleLowerCase('az') || 'tələbə' : 'tələbə';
  const escape = semester.escape;
  const isMode = (game, mode) => Object.hasOwn(modes, game) && modes[game].includes(mode);
  const entries = () => semester.gameRecords().filter(row => isMode(row.game, row.mode));

  function activeSkin() {
    const account = semester.account();
    if (account) {
      const { palette } = semester.lookOf(account.uid);
      if (palette !== 'default') {
        const swatch = wardrobe.palettes[palette];
        return { id: palette, color: swatch.light, accent: swatch.mid };
      }
    }
    // Keep the former skin choice available for existing runs saved under a browser nickname.
    try {
      const prior = JSON.parse(localStorage.getItem('unec_games_profile_v1'));
      const key = keyOf(prior?.player);
      const picked = oldSkins.find(skin => skin.id === prior?.skins?.[key]);
      if (picked) {
        const points = entries().filter(row => !row.uid && row.economy !== 2 && keyOf(row.player) === key)
          .reduce((sum, row) => sum + Math.ceil(number(row.score) / 20), 0);
        if (points >= picked.at) return picked;
      }
    } catch { /* Default skin is still available. */ }
    return baseSkin;
  }
  function start(game, mode) {
    if (!isMode(game, mode)) return null;
    const id = globalThis.crypto?.randomUUID?.() ??
      Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
    const account = semester.account();
    return { id, game, mode, uid: account?.uid ?? null, mail: account?.mail ?? '', skin: activeSkin(), result: null };
  }
  function refreshPanels() {
    document.querySelectorAll('[data-game-meta]').forEach(node => mounts.get(node)?.refresh());
  }
  function finish(run, score, won) {
    if (!run || run.result) return run?.result ?? null;
    const result = { game: run.game, mode: run.mode, uid: run.uid, mail: run.mail, score: number(score),
      won: !!won, economy: 2, at: Date.now(), award: run.uid ? semester.scoreReward(run.game, run.mode, score, won) : 0 };
    run.result = result;
    if (run.uid) semester.saveGameRecord(run.id, result);
    return result;
  }
  function compare(a, b) {
    return number(b.score) - number(a.score) || Number(b.won === true) - Number(a.won === true) ||
      number(a.at) - number(b.at);
  }
  function board(rows, game, mode) {
    const best = new Map();
    for (const row of rows) {
      if (row.game !== game || row.mode !== mode) continue;
      const player = semester.recordName(row.uid, row.mail);
      if (!player) continue;
      const previous = best.get(row.uid);
      if (!previous || compare(row, previous) < 0) best.set(row.uid, { ...row, player });
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
    const panelStart = options.fullRecords ? '<section class="arena-record-panel">' :
      `<details data-panel ${options.openRecords ? 'open' : ''}><summary>${l.progress}</summary>`;
    const panelEnd = options.fullRecords ? '</section>' : '</details>';
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
      ${panelStart}
        <div class="game-meta-content">
          <div class="arena-record-intro">
            <p>${l.local}</p>
            <a href="/#/dashboard" data-record-dashboard>${l.dashboard}</a>
          </div>
          <div class="game-meta-fields">
            ${fixedGame ? '' : `<label>${l.game}<select data-game>${Object.entries(titles).map(([id, title]) =>
              `<option value="${id}">${escape(title[locale])}</option>`).join('')}</select></label>`}
            <label>${l.mode}<select data-mode></select></label>
          </div>
          <div class="arena-record-metrics">
            <div><small>${l.points}</small><strong data-points></strong></div>
            <div><small>${l.me}</small><strong data-mine></strong></div>
            <div><small>${l.leader}</small><strong data-lead></strong></div>
          </div>
          <ol data-board class="game-meta-board" aria-label="${l.rank}"></ol>
          <p data-empty hidden>${l.empty}</p>
          <button type="button" class="arena-share-best" data-share="best" hidden>${l.share}</button>
          <p data-score-rule></p>
        </div>
      ${panelEnd}
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
      const rows = entries(), runs = semester.records(), account = semester.account();
      const records = board(rows, game, mode);
      best = records[0] ?? null;
      const myRecord = account ? rows.filter(row => row.uid === account.uid && row.game === game && row.mode === mode)
        .sort(compare)[0] : null;
      el('[data-record-dashboard]').textContent = account ? l.dashboard : l.login;
      el('[data-points]').textContent = account ? String(semester.stats(account.uid, runs, rows).points) : '—';
      el('[data-mine]').textContent = myRecord ? number(myRecord.score) + ' ' + l.score : '—';
      el('[data-lead]').textContent = best ? number(best.score) + ' ' + l.score : '—';
      boardList.innerHTML = records.map((row, index) => {
        const look = semester.lookOf(row.uid, semester.stats(row.uid, runs, rows));
        const title = semester.title(look, language);
        const medal = index < 3 ? index + 1 : 0;
        return `<li><div class="arena-record" data-medal="${medal}">
          <span class="arena-pos">${index + 1}</span><span class="arena-record-avatar">${semester.avatar(look)}</span>
          <span class="arena-player">${semester.nameplate(row.player, look)}${title ? `<span class="semester-title">${escape(title)}</span>` : ''}${row.won ? `<small>${l.completed}</small>` : ''}</span>
          <strong>${number(row.score)} <small>${l.score}</small></strong>
        </div></li>`;
      }).join('');
      el('[data-empty]').hidden = !!best;
      el('[data-share="best"]').hidden = !best;
      const rule = semester.ruleFor(game, mode);
      el('[data-score-rule]').textContent = rule ? l.rule(rule) : '';
      el('.game-meta-result').hidden = !result;
      if (result) el('[data-result-text]').textContent =
        l.yourScore + ' · ' + result.score + ' ' + l.score + ' · +' + result.award + ' ' + l.points;
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
    host.onchange = event => {
      const node = event.target;
      if (node.matches('[data-game]')) {
        game = node.value; mode = modes[game][0]; updateModes(); refresh();
      } else if (node.matches('[data-mode]')) {
        mode = node.value; refresh();
      }
    };
    host.onclick = event => {
      const target = event.target.closest('button[data-share]');
      if (target) void share(target.dataset.share === 'result' ? result : best);
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

  window.addEventListener('unec:semesterchange', refreshPanels);
  window.addEventListener('unec:authchange', refreshPanels);
  window.UNECGameProgress = { activeSkin, start, finish, mount };
})();
