(function () {
  'use strict';

  const semester = window.UNECSemesterProfile;
  const wardrobe = window.UNECStudentWardrobe;
  const get = id => document.getElementById(id);
  const dialog = get('semester-wardrobe');
  const form = get('semester-look-form');
  const tabs = get('semester-wardrobe-tabs');
  const fields = get('semester-fields');
  const categories = {
    head: ['Baş geyimi', 'Headwear'], outfit: ['Geyim', 'Outfit'], accessory: ['Aksesuar', 'Accessory'],
    palette: ['Ad rəngi', 'Name color'], effect: ['Ad effekti', 'Name effect'], title: ['Titul', 'Title']
  };
  const parts = ['head', 'outfit', 'accessory'];
  const games = [
    ['ring-escape', 'target', 'Halqadan çıxış', 'Ring Escape'],
    ['tower-descent', 'layers', 'Qüllə enişi', 'Tower Descent'],
    ['semester-defense', 'landmark', 'Semestr müdafiəsi', 'Semester Defense']
  ];
  const words = {
    az: {
      wardrobe: 'Tələbə qarderobu', balance: 'Semestr Xalı',
      local: 'Bu brauzerdə hesabına bağlı saxlanılır.',
      variety: '1 000 avatar kombinasiyası · 16 ad rəngi · 16 ad effekti',
      bosses: 'KƏSR-i məğlub et', scholar: 'Əlaçı təqaüdünə yüksəl', fourFronts: 'Dörd aktiv girişli dalğanı tamamla',
      triad: 'Hər üç oyundan xal qazan', available: 'Açıqdır', selected: 'Seçilib',
      avatar: 'Profil şəklimin yerində bu avatarı göstər', save: 'Yadda saxla', close: 'Bağla',
      shuffle: 'Görünüşü qarışdır', records: 'Arena rekordları', sample: 'Tələbə',
      board: 'Semestr müdafiəsi liderləri', reached: 'dalğa', cleared: 'tamamlanıb', empty: 'Hələ dalğa rekordu yoxdur.',
      boardLocal: 'Bu brauzerdə qeydə alınan ən yüksək dalğalar. Oyunçu adı e-poçtun @ işarəsindən əvvəlki hissəsidir.',
      play: 'Kampusu müdafiə et', wallet: 'Arena irəliləyişi', how: 'Xallar necə qazanılır?',
      walletNote: 'Hər oyunun xal həddini keçdikdə qazancın bu balansa əlavə olunur.',
      rules: (boss, semester) => `Semestr müdafiəsində hər məğlub KƏSR +${boss}, ilk 15 dalğanı tamamlamaq isə +${semester} Semestr Xalı verir.`
    },
    en: {
      wardrobe: 'Student Wardrobe', balance: 'Semester Points',
      local: 'Linked to your account in this browser.',
      variety: '1,000 avatar combinations · 16 name colors · 16 name effects',
      bosses: 'Defeat a Retake boss', scholar: 'Reach the Honors scholarship tier', fourFronts: 'Clear a wave with four active portals',
      triad: 'Earn points in all three games', available: 'Unlocked', selected: 'Selected',
      avatar: 'Show this avatar in place of my profile photo', save: 'Save', close: 'Close',
      shuffle: 'Shuffle look', records: 'Arena records', sample: 'Student',
      board: 'Semester Defense leaders', reached: 'wave', cleared: 'cleared', empty: 'No wave records yet.',
      boardLocal: 'The highest waves recorded in this browser, under the name before @ in each account’s email address.',
      play: 'Defend the campus', wallet: 'Arena progress', how: 'How do I earn points?',
      walletNote: 'Points earned by reaching each game’s score threshold are added to this balance.',
      rules: (boss, semester) => `In Semester Defense, each Retake boss grants +${boss} and clearing the first 15 waves grants +${semester} Semester Points.`
    }
  };
  const language = () => typeof lang !== 'undefined' && lang === 'en' ? 'en' : 'az';
  const userNow = () => typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const nameNow = user => accountDisplayName(user, getProfile());
  const icon = id => `<svg class="ic" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  let editing = null;

  function badge(text) {
    return text ? `<span class="semester-title">${semester.escape(text)}</span>` : '';
  }
  function identity(name, look, locale) {
    return semester.nameplate(name, look) + badge(semester.title(look, locale));
  }

  function renderBoard(rows, scores, locale) {
    const board = get('semester-leaderboard'), l = words[locale];
    const ranked = semester.leaderboard(rows);
    board.innerHTML = `<div class="semester-board-head">
      <span class="semester-board-icon">${icon('trophy')}</span>
      <div><h2 id="semester-board-title">${l.board}</h2><p>${l.boardLocal}</p></div>
      <a class="btn btn--secondary" href="games/semester-defense/">${l.play}</a>
      </div>` + (ranked.length ? `<ol class="semester-board-list">${ranked.map((run, rank) => {
        const look = semester.lookOf(run.uid, semester.stats(run.uid, rows, scores));
        return `<li class="semester-board-entry">
          <span class="arena-pos" data-medal="${rank < 3 ? rank + 1 : 0}">${rank + 1}</span>
          <div class="semester-board-avatar">${semester.avatar(look)}</div>
          <div class="semester-board-name">${identity(run.player, look, locale)}</div>
          <div class="semester-board-score"><strong>${run.reached} ${l.reached}</strong><small>${Number.isSafeInteger(run.cleared) ? run.cleared : 0} ${l.cleared}</small></div>
        </li>`;
      }).join('')}</ol>` : `<p class="semester-board-empty">${l.empty}</p>`);
  }

  function renderWallet(data, locale) {
    const l = words[locale], wallet = get('semester-wallet');
    const detailsOpen = wallet.querySelector('details')?.open;
    const view = locale === 'az' ? 2 : 3;
    wallet.innerHTML = `<div class="semester-wallet-heading">
      <div><h2 id="semester-wallet-title">${l.wallet}</h2><p>${l.walletNote}</p></div>
      <div class="semester-wallet-total">${icon('sparkles')}<strong id="dash-semester-balance">${data.points}</strong><span>${l.balance}</span></div>
    </div>
    <ul class="semester-wallet-games">${games.map(game => `<li>
      ${icon(game[1])}<span>${game[view]}</span><strong>+${data.byGame[game[0]]}</strong>
    </li>`).join('')}</ul>
    <details ${detailsOpen ? 'open' : ''}><summary>${l.how}</summary><p>${l.rules(semester.rewards.boss, semester.rewards.semester)} <a href="#/games/records">${l.records}</a></p></details>`;
  }

  function render(user = userNow(), name = user ? nameNow(user) : '') {
    const locale = language(), l = words[locale], rows = semester.records(), scores = semester.gameRecords();
    renderBoard(rows, scores, locale);
    get('dash-arena-link').textContent = l.records;
    if (!user) {
      get('semester-wallet').replaceChildren();
      return;
    }
    const data = semester.stats(user.uid, rows, scores), look = semester.lookOf(user.uid, data);
    const avatar = get('dash-avatar');
    if (look.avatar) {
      avatar.innerHTML = semester.avatar(look);
      avatar.dataset.semesterAvatar = '';
    } else if (Object.hasOwn(avatar.dataset, 'semesterAvatar')) {
      delete avatar.dataset.semesterAvatar;
      renderAccountAvatar(avatar, name, user, getProfile());
    }
    get('dash-pname').innerHTML = semester.nameplate(name, look);
    get('dash-semester-title').innerHTML = badge(semester.title(look, locale));
    get('open-semester-wardrobe').querySelector('span').textContent = l.wardrobe;
    renderWallet(data, locale);
  }

  function renderPreview() {
    const { look, name, locale } = editing, l = words[locale];
    get('semester-preview').innerHTML = `<div class="semester-preview-avatar">${semester.avatar(look)}</div>
      <div class="semester-preview-id">${identity(name, look, locale)}
        <button class="btn btn--secondary" type="button" data-shuffle-look>${l.shuffle}</button>
      </div>`;
  }
  function renderCatalog(focus) {
    const { section, locale, look, data } = editing, l = words[locale];
    const scroll = focus === 'item' ? fields.scrollTop : 0;
    if (!focus) tabs.innerHTML = Object.entries(categories).map(([key, labels]) => `
      <button type="button" data-section="${key}" aria-pressed="${section === key}">${labels[locale === 'az' ? 0 : 1]}</button>
    `).join('');
    if (focus === 'tab') {
      for (const button of tabs.children) button.setAttribute('aria-pressed', String(button.dataset.section === section));
    }
    fields.innerHTML = Object.entries(semester.collection[section]).map(([id, item]) => {
      const selected = look[section] === id;
      const allowed = semester.unlocked(item, data);
      const hint = selected ? l.selected : allowed ? l.available : item.requirement ? l[item.requirement] : item.points + ' ' + l.balance;
      const sample = { ...look, [section]: id };
      const art = parts.includes(section) ? semester.avatar(sample) :
        section === 'title' ? (badge(semester.title(sample, locale)) || '—') :
        semester.nameplate(l.sample, section === 'palette' ? { ...sample, effect: 'none' } : sample);
      return `<button class="semester-option" type="button" data-item="${id}" aria-pressed="${selected}" ${allowed ? '' : 'disabled'}>
        <span class="semester-option-art" aria-hidden="true">${art}</span>
        <strong>${item[locale]}</strong><small>${allowed ? '' : icon('lock')} ${hint}</small>
      </button>`;
    }).join('');
    fields.scrollTop = scroll;
    if (focus === 'item') fields.querySelector('[aria-pressed="true"]')?.focus({ preventScroll: true });
  }
  function openWardrobe() {
    const user = userNow();
    if (!user) return;
    const locale = language(), l = words[locale];
    const data = semester.stats(user.uid), look = semester.lookOf(user.uid, data);
    editing = { uid: user.uid, name: nameNow(user), locale, data, look, section: 'head' };
    get('semester-wardrobe-title').textContent = l.wardrobe;
    get('semester-wardrobe-close').textContent = l.close;
    get('semester-wardrobe-local').textContent = `${l.variety}. ${data.points} ${l.balance}. ${l.local}`;
    get('semester-avatar-label').textContent = l.avatar;
    get('semester-look-save').textContent = l.save;
    form.elements.avatar.checked = look.avatar;
    renderCatalog();
    renderPreview();
    dialog.showModal();
  }
  get('open-semester-wardrobe').addEventListener('click', openWardrobe);
  get('semester-wardrobe-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { editing = null; });
  tabs.addEventListener('click', event => {
    const tab = event.target.closest('[data-section]');
    if (!tab || tab.dataset.section === editing.section) return;
    editing.section = tab.dataset.section;
    renderCatalog('tab');
  });
  fields.addEventListener('click', event => {
    const button = event.target.closest('[data-item]');
    if (!button || button.disabled) return;
    editing.look[editing.section] = button.dataset.item;
    if (parts.includes(editing.section)) form.elements.avatar.checked = true;
    renderCatalog('item');
    renderPreview();
  });
  get('semester-preview').addEventListener('click', event => {
    if (!event.target.closest('[data-shuffle-look]')) return;
    for (const section of [...parts, 'palette', 'effect']) {
      const available = Object.keys(semester.collection[section]).filter(key =>
        semester.unlocked(semester.collection[section][key], editing.data));
      editing.look[section] = available[Math.floor(Math.random() * available.length)];
    }
    form.elements.avatar.checked = true;
    renderCatalog();
    renderPreview();
    get('semester-preview').querySelector('[data-shuffle-look]').focus({ preventScroll: true });
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (editing && userNow()?.uid === editing.uid) {
      semester.saveLook(editing.uid, { ...editing.look, avatar: form.elements.avatar.checked });
    }
    dialog.close();
  });
  window.addEventListener('unec:semesterchange', () => {
    if (document.body.dataset.route === 'dashboard') render();
  });
  window.addEventListener('unec:routechange', event => {
    if (event.detail.tab === 'dashboard') render();
    else if (dialog.open) dialog.close();
  });
  window.addEventListener('unec:authchange', () => {
    if (dialog.open && userNow()?.uid !== editing?.uid) dialog.close();
    if (document.body.dataset.route === 'dashboard') render();
  });
  window.addEventListener('unec:langchange', () => {
    if (document.body.dataset.route === 'dashboard') render();
  });
  window.UNECSemesterDashboard = { render };
})();
