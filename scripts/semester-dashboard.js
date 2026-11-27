(function () {
  'use strict';

  const semester = window.UNECSemesterProfile;
  const get = id => document.getElementById(id);
  const dialog = get('semester-wardrobe');
  const form = get('semester-look-form');
  const categories = {
    head: ['Baş geyimi', 'Headwear'], outfit: ['Geyim', 'Outfit'], accessory: ['Əl aksesuarı', 'Accessory'],
    palette: ['Ad rəngi', 'Name color'], effect: ['Ad effekti', 'Name effect'], title: ['Titul', 'Title']
  };
  const words = {
    az: {
      wardrobe: 'Tələbə qarderobu', balance: 'Semestr Xalı', local: 'Balans və görünüş bu brauzerdə hesabına bağlı saxlanılır.',
      boss: 'KƏSR-i məğlub et', scholar: 'Əlaçı təqaüdünə yüksəl', four: 'Dörd aktiv girişli bir dalğanı tamamla',
      avatar: 'Profil şəklimin yerində modulyar avatarı göstər', save: 'Yadda saxla', close: 'Bağla',
      board: 'Semestr müdafiəsi · Liderlər lövhəsi', reached: 'dalğa', cleared: 'tamamlanan', empty: 'Hələ dalğa rekordu yoxdur.',
      boardLocal: 'Bu brauzerdə qeydə alınan ən yüksək dalğalar.', play: 'Oyuna keç'
    },
    en: {
      wardrobe: 'Student Wardrobe', balance: 'Semester Points', local: 'Your balance and look are linked to your account in this browser.',
      boss: 'Defeat a Retake boss', scholar: 'Reach the Honors scholarship tier', four: 'Clear a wave with four active portals',
      avatar: 'Show the modular avatar in place of my profile photo', save: 'Save', close: 'Close',
      board: 'Semester Defense · Leaderboard', reached: 'wave', cleared: 'cleared', empty: 'No wave records yet.',
      boardLocal: 'The highest waves recorded in this browser.', play: 'Play game'
    }
  };
  const language = () => typeof lang !== 'undefined' && lang === 'en' ? 'en' : 'az';
  const userNow = () => typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const nameNow = user => accountDisplayName(user, getProfile());
  let editing = null;

  function badge(text) {
    return text ? `<span class="semester-title">${semester.escape(text)}</span>` : '';
  }
  function identity(name, look, locale) {
    return semester.nameplate(name, look) + badge(semester.title(look, locale));
  }

  function renderBoard(rows, locale) {
    const board = get('semester-leaderboard');
    const l = words[locale], active = userNow();
    const ranked = semester.leaderboard(rows);
    board.innerHTML = `<div class="semester-board-head"><div>
      <h2 id="semester-board-title">${l.board}</h2><p>${l.boardLocal}</p></div>
      <a class="btn btn--secondary" href="games/semester-defense/">${l.play}</a></div>` +
      (ranked.length ? `<ol class="semester-board-list">${ranked.map(run => {
        const look = semester.lookOf(run.uid, semester.stats(run.uid, rows));
        const name = active && run.uid === active.uid ? nameNow(active) : run.name.slice(0, 64);
        const reached = Number.isSafeInteger(run.reached) ? run.reached : 0;
        const cleared = Number.isSafeInteger(run.cleared) ? run.cleared : 0;
        return `<li><div class="semester-board-entry">
          <div class="semester-board-avatar">${semester.avatar(look)}</div>
          <div class="semester-board-name">${identity(name, look, locale)}</div>
          <div class="semester-board-score"><strong>${reached} ${l.reached}</strong><small>${cleared} ${l.cleared}</small></div>
        </div></li>`;
      }).join('')}</ol>` : `<p class="semester-board-empty">${l.empty}</p>`);
  }
  function render(user = userNow(), name = user ? nameNow(user) : '') {
    const locale = language(), l = words[locale], rows = semester.records();
    renderBoard(rows, locale);
    if (!user) return;
    const data = semester.stats(user.uid, rows), look = semester.lookOf(user.uid, data);
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
    get('dash-semester-balance').textContent = data.points + ' ' + l.balance;
    get('open-semester-wardrobe').textContent = l.wardrobe;
  }

  function draft() {
    const values = new FormData(form);
    return Object.assign(Object.fromEntries(Object.keys(categories).map(key => [key, values.get(key)])),
      { avatar: values.get('avatar') === 'on' });
  }
  function renderPreview() {
    if (!editing) return;
    const look = draft();
    get('semester-preview').innerHTML = `<div class="semester-preview-avatar">${semester.avatar(look)}</div>
      <div class="semester-preview-id">${identity(editing.name, look, editing.locale)}</div>`;
  }
  function openWardrobe() {
    const user = userNow();
    if (!user) return;
    const locale = language(), l = words[locale], index = locale === 'az' ? 0 : 1;
    const data = semester.stats(user.uid), look = semester.lookOf(user.uid, data);
    editing = { uid: user.uid, name: nameNow(user), locale };
    get('semester-wardrobe-title').textContent = l.wardrobe;
    get('semester-wardrobe-close').textContent = l.close;
    get('semester-wardrobe-local').textContent = data.points + ' ' + l.balance + ' · ' + l.local;
    get('semester-avatar-label').textContent = l.avatar;
    get('semester-look-save').textContent = l.save;
    form.elements.avatar.checked = look.avatar;
    const conditions = { bosses: l.boss, scholar: l.scholar, fourFronts: l.four };
    get('semester-fields').innerHTML = Object.entries(categories).map(([category, labels]) => `
      <label><span>${labels[index]}</span><select name="${category}">
      ${Object.entries(semester.collection[category]).map(([id, item]) => {
        const allowed = semester.unlocked(item, data);
        const hint = item.requirement ? conditions[item.requirement] : item.points + ' ' + l.balance;
        return `<option value="${id}" ${look[category] === id ? 'selected' : ''} ${allowed ? '' : 'disabled'}>${item[locale]}${allowed ? '' : ' · ' + hint}</option>`;
      }).join('')}
      </select></label>`).join('');
    renderPreview();
    dialog.showModal();
  }
  get('open-semester-wardrobe').addEventListener('click', openWardrobe);
  get('semester-wardrobe-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { editing = null; });
  form.addEventListener('change', event => {
    if (['head', 'outfit', 'accessory'].includes(event.target.name)) form.elements.avatar.checked = true;
    renderPreview();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (editing && userNow()?.uid === editing.uid) semester.saveLook(editing.uid, draft());
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
