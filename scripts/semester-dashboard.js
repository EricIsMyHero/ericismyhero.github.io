(function () {
  'use strict';

  const semester = window.UNECSemesterProfile;
  const wardrobe = window.UNECStudentWardrobe;
  const arena = window.UNECArenaRecords;
  const get = id => document.getElementById(id);
  const dialog = get('semester-wardrobe');
  const form = get('semester-look-form');
  const tabs = get('semester-wardrobe-tabs');
  const fields = get('semester-fields');
  const categories = {
    head: ['Baş geyimi', 'Headwear'], outfit: ['Geyim', 'Outfit'], accessory: ['Aksesuar', 'Accessory'],
    mood: ['Üz ifadəsi', 'Expression'], backdrop: ['Fon və aura', 'Backdrop & aura'],
    pet: ['Maskot', 'Companion'], border: ['Çərçivə', 'Frame'], pose: ['Qələbə pozası', 'Victory pose'],
    palette: ['Ad rəngi', 'Name color'], effect: ['Ad effekti', 'Name effect'], title: ['Titul', 'Title']
  };
  const parts = ['head', 'outfit', 'accessory', 'mood', 'backdrop', 'pet', 'border', 'pose'];
  const games = [
    ['ring-escape', 'target', 'Halqadan çıxış', 'Ring Escape'],
    ['tower-descent', 'layers', 'Qüllə enişi', 'Tower Descent'],
    ['semester-defense', 'landmark', 'Semestr müdafiəsi', 'Semester Defense']
  ];
  const words = {
    az: {
      wardrobe: 'Tələbə qarderobu', balance: 'Semestr Xalı',
      local: 'Bu brauzerdə hesabına bağlı saxlanılır.',
      earned: 'Ümumi qazanılan', spent: 'Xərclənən', availablePoints: 'Xərclənə bilən',
      buy: price => 'Al · ' + price + ' xal', missing: points => points + ' xal çatmır.',
      bought: 'Əşya inventara əlavə edildi. Taxmaq üçün görünüşü yadda saxla.',
      purchaseError: 'Dəyişikliyi yadda saxlamaq olmadı. Yenidən cəhd et.', preview: 'Önizləmə',
      bosses: 'KƏSR-i məğlub et', scholar: 'Əlaçı təqaüdünə yüksəl', fourFronts: 'Dörd aktiv girişli dalğanı tamamla',
      triad: 'Hər üç oyundan xal qazan', available: 'Açıqdır', selected: 'Seçilib',
      avatar: 'Profil şəklimin yerində bu avatarı göstər', save: 'Yadda saxla', close: 'Bağla',
      shuffle: 'Görünüşü qarışdır', records: 'Arena rekordları', sample: 'Tələbə',
      board: 'Semestr müdafiəsi liderləri', reached: 'dalğa', cleared: 'tamamlanıb', empty: 'Hələ dalğa rekordu yoxdur.',
      boardGlobal: 'Bütün oyunçular arasında ən yüksək dalğalar.', loading: 'Qlobal rekordlar yüklənir…',
      unavailable: 'Qlobal rekordları yükləmək olmadı.', retry: 'Yenilə',
      play: 'Kampusu müdafiə et', wallet: 'Arena irəliləyişi', how: 'Xallar necə qazanılır?',
      walletNote: 'Hər oyunun xal həddini keçdikdə qazancın bu balansa əlavə olunur.',
      rules: (boss, semester) => `Semestr müdafiəsində hər məğlub KƏSR +${boss}, ilk 15 dalğanı tamamlamaq isə +${semester} Semestr Xalı verir.`
    },
    en: {
      wardrobe: 'Student Wardrobe', balance: 'Semester Points',
      local: 'Linked to your account in this browser.',
      earned: 'Lifetime earned', spent: 'Spent', availablePoints: 'Available to spend',
      buy: price => 'Buy · ' + price + ' points', missing: points => points + ' more points needed.',
      bought: 'Item added to your inventory. Save your look to equip it.',
      purchaseError: 'Could not save the change. Try again.', preview: 'Preview',
      bosses: 'Defeat a Retake boss', scholar: 'Reach the Honors scholarship tier', fourFronts: 'Clear a wave with four active portals',
      triad: 'Earn points in all three games', available: 'Unlocked', selected: 'Selected',
      avatar: 'Show this avatar in place of my profile photo', save: 'Save', close: 'Close',
      shuffle: 'Shuffle look', records: 'Arena records', sample: 'Student',
      board: 'Semester Defense leaders', reached: 'wave', cleared: 'cleared', empty: 'No wave records yet.',
      boardGlobal: 'The highest waves reached by all players.', loading: 'Loading global records…',
      unavailable: 'Global records could not be loaded.', retry: 'Refresh',
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

  function renderBoard(locale) {
    const board = get('semester-leaderboard'), l = words[locale];
    const activeTab = window.UNEC?.route?.tab ?? document.body.dataset.route;
    const { rows: ranked, known, failed } = arena.board(arena.waves, activeTab === 'dashboard');
    const status = failed ? l.unavailable : known ? l.empty : l.loading;
    board.innerHTML = `<div class="semester-board-head">
      <span class="semester-board-icon">${icon('trophy')}</span>
      <div><h2 id="semester-board-title">${l.board}</h2><p>${l.boardGlobal}</p></div>
      <a class="btn btn--secondary" href="games/semester-defense/">${l.play}</a>
      </div>` + (ranked.length ? `<ol class="semester-board-list">${ranked.map((run, rank) => {
        const look = arena.lookOf(run);
        return `<li class="semester-board-entry">
          <span class="arena-pos" data-medal="${rank < 3 ? rank + 1 : 0}">${rank + 1}</span>
          <div class="semester-board-avatar">${semester.avatar(look)}</div>
          <div class="semester-board-name">${identity(run.player, look, locale)}</div>
          <div class="semester-board-score"><strong>${Number.isSafeInteger(run.reached) ? run.reached : 0} ${l.reached}</strong><small>${Number.isSafeInteger(run.cleared) ? run.cleared : 0} ${l.cleared}</small></div>
        </li>`;
      }).join('')}</ol>` : '') + ((!ranked.length || failed) ?
      `<p class="semester-board-empty" role="status">${status}</p>` : '') + (failed ?
      `<button class="btn btn--secondary" type="button" data-arena-retry>${l.retry}</button>` : '');
  }

  function renderWallet(data, locale) {
    const l = words[locale], wallet = get('semester-wallet');
    const detailsOpen = wallet.querySelector('details')?.open;
    const view = locale === 'az' ? 2 : 3;
    wallet.innerHTML = `<div class="semester-wallet-heading">
      <div><h2 id="semester-wallet-title">${l.wallet}</h2><p>${l.walletNote}</p></div>
      <div class="semester-wallet-total">${icon('sparkles')}<strong id="dash-semester-balance">${data.available}</strong><span>${l.availablePoints}</span></div>
    </div>
    <p class="semester-wallet-totals">${l.earned} <strong>${data.points}</strong> · ${l.spent} <strong>${data.spent}</strong> ${l.balance}</p>
    <ul class="semester-wallet-games">${games.map(game => `<li>
      ${icon(game[1])}<span>${game[view]}</span><strong>+${data.byGame[game[0]]}</strong>
    </li>`).join('')}</ul>
    <details ${detailsOpen ? 'open' : ''}><summary>${l.how}</summary><p>${l.rules(semester.rewards.boss, semester.rewards.semester)} <a href="#/games/records">${l.records}</a></p></details>`;
  }

  function render(user = userNow(), name = user ? nameNow(user) : '') {
    const locale = language(), l = words[locale], rows = semester.records(), scores = semester.gameRecords();
    renderBoard(locale);
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
      delete avatar.dataset.semesterPhotoFrame;
    } else {
      if (Object.hasOwn(avatar.dataset, 'semesterAvatar')) {
        delete avatar.dataset.semesterAvatar;
        renderAccountAvatar(avatar, name, user, getProfile());
      }
      const current = avatar.querySelector('.semester-photo-frame');
      if (avatar.dataset.semesterPhotoFrame !== look.border || !current) {
        current?.remove();
        const frame = wardrobe.photoFrame(look.border);
        if (frame) avatar.insertAdjacentHTML('beforeend', frame);
      }
      if (look.border !== 'none') avatar.dataset.semesterPhotoFrame = look.border;
      else delete avatar.dataset.semesterPhotoFrame;
    }
    get('dash-pname').innerHTML = semester.nameplate(name, look);
    get('dash-semester-title').innerHTML = badge(semester.title(look, locale));
    get('open-semester-wardrobe').querySelector('span').textContent = l.wardrobe;
    renderWallet(data, locale);
  }

  function renderPreview() {
    const { look, trial, section, name, locale } = editing, l = words[locale];
    const displayed = trial ? { ...look, [section]: trial } : look;
    get('semester-preview').innerHTML = `<div class="semester-preview-avatar">${semester.avatar(displayed)}</div>
      <div class="semester-preview-id">${identity(name, displayed, locale)}
        ${trial ? '<small>' + l.preview + '</small>' : ''}
        <button class="btn btn--secondary" type="button" data-shuffle-look>${l.shuffle}</button>
      </div>`;
  }
  function renderCatalog(focus) {
    const { section, locale, look, data, trial } = editing, l = words[locale];
    const scroll = focus === 'item' || focus === 'update' ? fields.scrollTop : 0;
    if (!focus) tabs.innerHTML = Object.entries(categories).map(([key, labels]) => `
      <button type="button" data-section="${key}" aria-pressed="${section === key}">${labels[locale === 'az' ? 0 : 1]}</button>
    `).join('');
    if (focus === 'tab') {
      for (const button of tabs.children) button.setAttribute('aria-pressed', String(button.dataset.section === section));
    }
    fields.innerHTML = Object.entries(semester.collection[section]).map(([id, item]) => {
      const selected = (trial ?? look[section]) === id;
      const allowed = semester.unlocked(section, id, data);
      const hint = allowed ? (selected ? l.selected : l.available) : item.requirement ? l[item.requirement] : item.price + ' ' + l.balance;
      const sample = { ...look, [section]: id };
      const art = parts.includes(section) ? semester.avatar(sample) :
        section === 'title' ? (badge(semester.title(sample, locale)) || '—') :
        semester.nameplate(l.sample, section === 'palette' ? { ...sample, effect: 'none' } : sample);
      return `<button class="semester-option" type="button" data-item="${id}" aria-pressed="${selected}" data-owned="${allowed}">
        <span class="semester-option-art" aria-hidden="true">${art}</span>
        <strong>${item[locale]}</strong><small>${allowed ? '' : icon('lock')} ${hint}</small>
      </button>`;
    }).join('');
    fields.scrollTop = scroll;
    if (focus === 'item') fields.querySelector('[aria-pressed="true"]')?.focus({ preventScroll: true });
    const candidate = trial && semester.collection[section][trial];
    const missing = candidate ? Math.max(0, candidate.price - data.available) : 0;
    get('semester-purchase').hidden = !candidate?.price || semester.unlocked(section, trial, data);
    if (candidate?.price) {
      const buy = get('semester-buy-item');
      buy.textContent = l.buy(candidate.price);
      buy.disabled = !!(missing || editing.pending);
      get('semester-purchase-description').textContent = missing ? l.missing(missing) : candidate[locale];
    }
    get('semester-wardrobe-local').textContent = `${l.availablePoints} ${data.available} · ${l.earned} ${data.points} · ${l.spent} ${data.spent}. ${l.local}`;
  }
  function openWardrobe() {
    const user = userNow();
    if (!user) return;
    const locale = language(), l = words[locale];
    const data = semester.stats(user.uid), look = semester.lookOf(user.uid, data);
    editing = { uid: user.uid, name: nameNow(user), locale, data, look, trial: null, pending: false, section: 'head' };
    get('semester-wardrobe-title').textContent = l.wardrobe;
    get('semester-wardrobe-close').textContent = l.close;
    get('semester-purchase-status').textContent = '';
    get('semester-avatar-label').textContent = l.avatar;
    get('semester-look-save').textContent = l.save;
    get('semester-look-save').disabled = false;
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
    if (!tab || editing.pending || tab.dataset.section === editing.section) return;
    editing.section = tab.dataset.section;
    editing.trial = null;
    get('semester-purchase-status').textContent = '';
    renderCatalog('tab');
    renderPreview();
  });
  function equip(id) {
    editing.look[editing.section] = id;
    editing.trial = null;
    if (parts.includes(editing.section) && editing.section !== 'border') form.elements.avatar.checked = true;
  }
  fields.addEventListener('click', event => {
    const button = event.target.closest('[data-item]');
    if (!button || editing.pending) return;
    const id = button.dataset.item;
    get('semester-purchase-status').textContent = '';
    if (semester.unlocked(editing.section, id, editing.data)) equip(id);
    else editing.trial = id;
    renderCatalog('item');
    renderPreview();
  });
  get('semester-buy-item').addEventListener('click', async () => {
    const draft = editing, { uid, section, trial, locale } = draft;
    draft.pending = true;
    get('semester-buy-item').disabled = true;
    get('semester-look-save').disabled = true;
    let result;
    try { result = await semester.purchase(uid, section, trial); }
    catch { result = { status: 'storage' }; }
    if (editing !== draft) return;
    const l = words[locale];
    draft.pending = false;
    get('semester-look-save').disabled = false;
    draft.data = semester.stats(uid);
    if (result.status === 'bought' || result.status === 'owned') {
      equip(trial);
      get('semester-purchase-status').textContent = result.status === 'bought' ? l.bought : '';
    } else if (result.status === 'funds') {
      get('semester-purchase-status').textContent = l.missing(semester.collection[section][trial].price - draft.data.available);
    } else {
      get('semester-purchase-status').textContent = l.purchaseError;
    }
    renderCatalog('item');
    renderPreview();
  });
  get('semester-preview').addEventListener('click', event => {
    if (!event.target.closest('[data-shuffle-look]') || editing.pending) return;
    editing.trial = null;
    get('semester-purchase-status').textContent = '';
    for (const section of [...parts, 'palette', 'effect']) {
      const available = Object.keys(semester.collection[section]).filter(key =>
        semester.unlocked(section, key, editing.data));
      editing.look[section] = available[Math.floor(Math.random() * available.length)];
    }
    form.elements.avatar.checked = true;
    renderCatalog('update');
    renderPreview();
    get('semester-preview').querySelector('[data-shuffle-look]').focus({ preventScroll: true });
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const draft = editing;
    if (!draft || draft.pending || userNow()?.uid !== draft.uid) return;
    draft.pending = true;
    get('semester-look-save').disabled = true;
    let result;
    try {
      result = await semester.saveLook(draft.uid, { ...draft.look, avatar: form.elements.avatar.checked });
    } catch { result = { status: 'storage' }; }
    if (editing !== draft) return;
    draft.pending = false;
    get('semester-look-save').disabled = false;
    if (result.status === 'saved') dialog.close();
    else get('semester-purchase-status').textContent = words[draft.locale].purchaseError;
  });
  window.addEventListener('unec:semesterchange', () => {
    if (document.body.dataset.route === 'dashboard') render();
    if (editing && dialog.open && !editing.pending) {
      editing.data = semester.stats(editing.uid);
      renderCatalog('update');
    }
  });
  get('semester-leaderboard').addEventListener('click', event => {
    if (event.target.closest('[data-arena-retry]')) arena.refresh();
  });
  window.addEventListener('unec:arenachange', () => {
    if (document.body.dataset.route === 'dashboard') renderBoard(language());
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
