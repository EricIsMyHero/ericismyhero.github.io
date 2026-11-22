const loadCareerTab = (() => {
  const typeLabels = { internship: 'Təcrübə', volunteer: 'Könüllülük', training: 'Təlim' };
  const categoryLabels = { bank: 'Bank', finance: 'Maliyyə', audit: 'Audit', it: 'İT', other: 'Digər' };
  const defaultLimits = { title: 300, company: 500, description: 8000, schedule: 300, location: 500, applyUrl: 2048 };
  const telegramLabels = {
    idle: 'Telegram-da paylaşılmayıb',
    sending: 'Telegram göndərişi yoxlanılır',
    sent: 'Telegram-da paylaşılıb',
    failed: 'Telegram göndərişi alınmadı',
    unknown: 'Telegram göndərişi təsdiqlənmədi',
    unconfigured: 'Telegram botu quraşdırılmayıb',
  };
  const errors = {
    career_invalid: 'Daxil etdiyin məlumatların uzunluğunu və formatını yoxla. Müraciət linki qeyd olunubsa, HTTPS ilə başlamalıdır.',
    career_conflict: 'Elan bu arada dəyişib. Siyahını yenilə.',
    career_missing: 'Elan tapılmadı.',
    career_inactive: 'Bağlanmış və ya vaxtı bitmiş elan paylaşıla bilməz.',
    career_sending: 'Telegram göndərişi gözləmədədir. Bir dəqiqə sonra kanalı yoxla.',
  };
  const channel = 'https://t.me/unecstudentshubcareer';
  const root = document.getElementById('career-content');
  let generation = 0;

  const optionList = labels => '<option value="">Seçilməyib</option>' + Object.entries(labels)
    .map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
  const label = (row, today) => {
    if (row.status === 'draft') return 'Qaralama';
    if (row.status === 'closed') return 'Bağlanıb';
    return row.deadline && row.deadline < today ? 'Vaxtı bitib' : 'Saytda aktivdir';
  };

  function listItem(row, today) {
    const active = row.status !== 'closed' && (!row.deadline || row.deadline >= today);
    const blocked = ['sending', 'unknown'].includes(row.telegramStatus);
    const message = Number.isSafeInteger(row.telegramMessageId)
      ? `<a href="${channel}/${row.telegramMessageId}" target="_blank" rel="noopener noreferrer">Telegram postunu aç</a>`
      : '';
    const details = [row.title && row.company, typeLabels[row.type], categoryLabels[row.category]].filter(Boolean).join(' · ');
    return `<article class="push-preview" id="career-row-${esc(row.id)}" data-id="${esc(row.id)}" tabindex="-1">
      <b>${esc(row.title || row.company || 'Karyera elanı')}</b>
      ${details ? `<span>${esc(details)}</span>` : ''}
      ${row.deadline ? `<span>Son müraciət · ${esc(row.deadline)}</span>` : ''}
      <span>${label(row, today)} · ${esc(telegramLabels[row.telegramStatus])}</span>
      ${message}
      <div class="push-actions">
        <button class="push-btn secondary" type="button" data-action="edit">Redaktə et</button>
        ${active && !blocked && row.telegramStatus !== 'sent' ? `
          <button class="push-btn" type="button" data-action="publish">${row.status === 'draft' ? 'Təsdiqlə və paylaş' : 'Telegram-a göndər'}</button>` : ''}
        ${blocked ? '<button class="push-btn secondary" type="button" data-action="reconcile">Paylaşımı yoxla</button>' : ''}
        ${row.status !== 'closed' ? '<button class="push-btn secondary" type="button" data-action="close">Elanı bağla</button>' : ''}
      </div>
    </article>`;
  }

  function show(data, notice) {
    const { career: rows, today, limits = defaultLimits } = data;
    const max = field => esc(limits[field] ?? defaultLimits[field]);
    root.innerHTML = `
      <form class="push-form">
        <h2 class="push-form-head">Yeni elan</h2>
        <p class="muted">Bütün məlumat sahələri istəyə bağlıdır. Qaralamanı saxla, sonra paylaşmaq üçün «Təsdiqlə və paylaş» düyməsini seç.</p>
        <label for="career-title">Proqramın adı</label>
        <input id="career-title" name="title" maxlength="${max('title')}">
        <label for="career-company">Şirkət və ya təşkilat <span>${max('company')} simvol</span></label>
        <input id="career-company" name="company" maxlength="${max('company')}">
        <label for="career-type">Proqram növü</label>
        <select id="career-type" name="type">${optionList(typeLabels)}</select>
        <label for="career-category">Sahə</label>
        <select id="career-category" name="category">${optionList(categoryLabels)}</select>
        <label for="career-description">Elanın təsviri</label>
        <textarea id="career-description" name="description" rows="6" maxlength="${max('description')}"></textarea>
        <label for="career-schedule">Tədbirin tarix və saatı</label>
        <input id="career-schedule" name="schedule" maxlength="${max('schedule')}" placeholder="21–22 noyabr 2026, 09:00–16:00">
        <label for="career-location">Məkan</label>
        <input id="career-location" name="location" maxlength="${max('location')}">
        <label for="career-deadline">Son müraciət tarixi (Bakı vaxtı)</label>
        <input id="career-deadline" name="deadline" type="date">
        <label for="career-apply-url">Rəsmi müraciət linki</label>
        <input id="career-apply-url" name="applyUrl" type="url" maxlength="${max('applyUrl')}">
        <div class="push-actions">
          <button class="push-btn" type="submit">Qaralamanı saxla</button>
          <button class="push-btn secondary" type="reset" hidden>Redaktəni bitir</button>
        </div>
      </form>
      <p class="push-result" role="status">${esc(notice)}</p>
      <section class="push-form" aria-label="Karyera elanları">
        <h2 class="push-form-head">Elanlar</h2>
        <div>${rows.length ? rows.map(row => listItem(row, today)).join('') : 'Hələ elan yoxdur.'}</div>
      </section>`;
    const form = root.querySelector('form');
    const status = root.querySelector('[role="status"]');
    const submit = form.querySelector('[type="submit"]');
    const reset = form.querySelector('[type="reset"]');
    let draftId;
    let editing;
    let busy = false;

    async function mutate(action, payload, message) {
      if (busy) return;
      busy = true;
      root.querySelectorAll('button').forEach(button => (button.disabled = true));
      status.textContent = 'Gözlə…';
      status.classList.remove('err');
      const navSession = session;
      const view = generation;
      try {
        const { row } = await apiFetch('career', null, { action, ...payload });
        if (navSession !== session || view !== generation) return;
        const feedback = action === 'publish'
          ? `Elan saytdadır. ${telegramLabels[row.telegramStatus]}.` : message;
        await load(feedback, action === "save" ? row.id : null);
      } catch (err) {
        if (navSession !== session || view !== generation) return;
        status.textContent = errors[err.message] || err.message;
        status.classList.add('err');
      } finally {
        busy = false;
        if (navSession === session && view === generation) {
          root.querySelectorAll('button').forEach(button => (button.disabled = false));
        }
      }
    }

    form.onsubmit = event => {
      event.preventDefault();
      draftId ||= crypto.randomUUID();
      const input = Object.fromEntries(new FormData(form));
      void mutate('save', { ...input, id: editing?.id || draftId, revision: editing?.revision }, 'Elan saxlanıldı.');
    };
    form.onreset = () => {
      editing = null;
      draftId = undefined;
      form.querySelector('h2').textContent = 'Yeni elan';
      submit.textContent = 'Qaralamanı saxla';
      reset.hidden = true;
    };
    root.querySelector('section').onclick = event => {
      const button = event.target.closest('button[data-action]');
      if (!button || busy) return;
      const row = rows.find(item => item.id === button.closest('[data-id]').dataset.id);
      const payload = { id: row.id, revision: row.revision };
      switch (button.dataset.action) {
        case 'edit':
          editing = row;
          for (const name of ['title', 'company', 'type', 'category', 'description', 'schedule', 'location', 'deadline', 'applyUrl']) {
            form.elements.namedItem(name).value = row[name] ?? '';
          }
          form.querySelector('h2').textContent = 'Elanı redaktə et';
          submit.textContent = 'Dəyişiklikləri saxla';
          reset.hidden = false;
          if (row.telegramStatus === 'sent') {
            status.textContent = 'Saytdakı dəyişiklikdən sonra Telegram postunu kanalda ayrıca yenilə.';
          }
          form.elements.namedItem('title').focus();
          break;
        case 'publish':
          void mutate('publish', payload);
          break;
        case 'close':
          if (confirm('Elan aktiv siyahıdan çıxarılsın? Paylaşılmış Telegram postunu kanalda ayrıca yeniləyə bilərsən.'))
            void mutate('close', payload, 'Elan bağlandı.');
          break;
        case 'reconcile': {
          const value = prompt('Karyera kanalını yoxla. Postun linkini daxil et. Paylaşımın olmadığını təsdiqləmisənsə, 0 yaz.');
          if (value === null) break;
          const match = value.trim().match(/^https:\/\/t\.me\/unecstudentshubcareer\/(\d+)$/);
          if (match || value.trim() === '0') {
            void mutate('reconcile', { ...payload, messageId: match ? Number(match[1]) : null }, 'Paylaşım statusu yeniləndi.');
          } else {
            status.textContent = 'Karyera kanalındakı postun tam linkini və ya 0 daxil et.';
          }
          break;
        }
      }
    };
  }

  async function load(notice = '', savedId = null) {
    const view = ++generation;
    const navSession = session;
    document.getElementById('data-notice').hidden = true;
    document.getElementById('sync-status').textContent = 'Yüklənir…';
    root.textContent = 'Elanlar yüklənir…';
    try {
      const data = await apiFetch('career');
      if (view !== generation || navSession !== session) return;
      if (currentTab === 'career') dataStatus(data);
      show(data, notice);
      if (savedId && currentTab === 'career') {
        const item = document.getElementById('career-row-' + savedId);
        (item?.querySelector('[data-action="publish"]') || item)?.focus();
      }
    } catch (err) {
      if (view !== generation || navSession !== session) return;
      if (currentTab === 'career') document.getElementById('sync-status').textContent = '';
      root.textContent = err.data?.error === 'invalid_section'
        ? 'Karyera bölməsi bu backend versiyasında yoxdur. Vercel-də son deploy-u yoxla.'
        : errors[err.message] || err.message;
    }
  }
  return load;
})();
