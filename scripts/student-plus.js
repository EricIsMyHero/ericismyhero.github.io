(function () {
  'use strict';

  const U = window.UNEC;
  const { $, $$, esc, ic, tr, LS, normAz } = U;
  const root = $('#studentOffersRoot');
  const offers = window.UNEC_STUDENT_OFFERS;
  const favoritesKey = 'unec_student_offer_favorites';
  const savedIds = LS.getJSON(favoritesKey, []);
  const saved = new Set(Array.isArray(savedIds) ? savedIds : []);
  const state = { query: '', kind: '', category: '', order: 'catalog', saved: false };
  const categoryLabels = {
    education: ['Təhsil və kurslar', 'Education and courses'],
    software: ['Proqramlar', 'Software'],
    cloud: ['Bulud xidmətləri', 'Cloud services'],
    services: ['Tərcümə və xidmətlər', 'Translation and services'],
    food: ['Yemək', 'Food'],
    fashion: ['Geyim və aksesuar', 'Fashion and accessories'],
    health: ['Optika', 'Optical'],
    beauty: ['Gözəllik', 'Beauty'],
    internet: ['İnternet', 'Internet'],
  };
  const labels = {
    search: ['Brend, xidmət və ya təklif axtar', 'Search brands, services or offers'],
    all: ['Hamısı', 'All'],
    card: ['Tələbə+ kartı', 'Tələbə+ card'],
    online: ['Onlayn tələbə proqramı', 'Online student programme'],
    onlineShort: ['Onlayn', 'Online'],
    category: ['Kateqoriya', 'Category'],
    categories: ['Bütün kateqoriyalar', 'All categories'],
    filter: ['Təklif filtrləri', 'Offer filters'],
    sort: ['Sıralama', 'Sort by'],
    catalog: ['Kataloq sırası', 'Catalogue order'],
    highest: ['Ən yüksək faiz', 'Highest discount'],
    alphabetical: ['Brend adına görə', 'By brand name'],
    saved: ['Saxlanılanlar', 'Saved'],
    save: ['Təklifi saxla', 'Save offer'],
    remove: ['Saxlanılanlardan çıxar', 'Remove from saved'],
    show: ['Şərtlərə bax', 'View details'],
    back: ['Təkliflərə qayıt', 'Back to offers'],
    verify: ['Cari şərtləri yoxlayın', 'Check current terms'],
    verified: ['Rəsmi mənbə yoxlanıb', 'Official source checked'],
    verificationSource: ['Yoxlanmış mənbəyə bax', 'View checked source'],
    example: ['Şəkildəki təklif', 'Screenshot example'],
    special: ['Xüsusi təklif', 'Special offer'],
    count: ['{n} təklif', '{n} offers'],
    empty: ['Bu seçimə uyğun təklif tapılmadı.', 'No offers match these filters.'],
    notFound: ['Təklif tapılmadı', 'Offer not found'],
    reset: ['Filtrləri sıfırla', 'Reset filters'],
    guide: ['Endirimdən necə istifadə etməli?', 'How to use the offers'],
    source: ['Mənbə', 'Source'],
    programmeLinks: ['Tətbiq və kart məlumatı', 'App and card information'],
    localSource: ['Təqdim edilmiş ekran görüntüsü', 'Supplied screenshot'],
    localNotice: ['Şəkildə göstərilən təklifdir. Aktivlik, son tarix və iştirak edən məntəqələr ayrıca təsdiqlənməlidir.', 'This offer appears in the screenshot. Confirm availability, expiry and participating locations separately.'],
    onlineNotice: ['Tələbə statusunu provayder ayrıca yoxlayır. Uyğunluq, plan və qiymət şərtlərinə rəsmi səhifədə baxın.', 'The provider verifies student status separately. Check eligibility, plan details and prices on its official site.'],
    official: ['Rəsmi səhifəni aç', 'Open official site'],
    steps: ['İstifadə qaydası', 'How to use it'],
    localSteps: [
      'Tələbə+ tətbiqində təklifi tapın. Filialı, uyğun məhsulu, son tarixi və endirimin ödəniş üsulundan asılı olub-olmadığını birbaşa tərəfdaşdan yoxlayın.',
      'Find the offer in the Tələbə+ app. Confirm the branch, eligible purchase, expiry and any payment-method rules directly with the partner.',
    ],
    onlineSteps: [
      'Provayderin rəsmi səhifəsində tələbə üçün müraciət bölməsini açın. Təhsil e-poçtu və ya qəbul edilən tələbə sənədi ilə təsdiqləmə qaydasını izləyin.',
      'Open the student application on the provider’s official site. Follow its verification process using your institutional email or accepted proof of enrolment.',
    ],
    offerCheck: ['Almazdan əvvəl', 'Before claiming'],
    calc: ['Qənaəti hesabla', 'Estimate savings'],
    price: ['İlkin qiymət (AZN)', 'Original price (AZN)'],
    estimate: ['Faiz bütün məbləğə tətbiq olunarsa, təxmini nəticə.', 'Estimate if the discount applies to the full amount.'],
    savings: ['Qənaət', 'Savings'],
    final: ['Təxmini ödəniş', 'Estimated total'],
    summary: ['Yerli kart təklifləri və onlayn tələbə proqramları fərqli təsdiqləmə qaydalarına malikdir.', 'Local card offers and online student programmes have different verification requirements.'],
    partnerConditions: ['Filial, məhsul və kampaniya şərtləri', 'Branches, products and promotion rules'],
    partnerText: ['Alışdan əvvəl endirimin düzgün filiala, məhsula və ya tarifə aid olduğunu yoxlayın. Minimum məbləğ, maksimum endirim, taksit və digər kampaniyalarla birlikdə istifadə qaydalarını tərəfdaşdan soruşun.', 'Confirm that the discount applies to the branch, product or plan you want. Ask about minimum spend, discount caps, instalments and combining offers.'],
    cardSafety: ['Kart və hesab məlumatlarının qorunması', 'Protecting card and account information'],
    safetyText: ['Yalnız rəsmi tətbiq, tərəfdaşın kassası və ya provayderin rəsmi səhifəsi vasitəsilə təsdiqdən keçin. PIN, CVV və birdəfəlik təsdiq kodunu paylaşmayın.', 'Verify only through the official app, the partner’s checkout or the provider’s official site. Keep your PIN, CVV and one-time codes private.'],
  };
  const languageIndex = () => document.documentElement.lang === 'en' ? 1 : 0;
  const label = key => labels[key][languageIndex()];
  const categoryName = key => categoryLabels[key][languageIndex()];
  const copy = offer => languageIndex() ? offer.en : offer.az;
  const path = '/student-plus';
  const programmeSources = [
    ['https://share.google/3jGtbK3eTlQPIb0ER', ['TalabaPlus tətbiqi', 'TalabaPlus app']],
    ['https://share.google/wE5AD5lT9IwwDdBGl', ['Birbank-da kart məlumatı', 'Birbank card information']],
  ];

  function shortcut(href, text) {
    return `<a class="icon-btn icon-btn--filled function-back" href="#${href}" aria-label="${esc(text)}">${ic('arrow-left')}</a>`;
  }

  function hero(title, description, href, backLabel) {
    return `<header class="function-hero">
      ${shortcut(href, backLabel)}
      <span class="function-hero-icon">${ic('wallet')}</span>
      <div class="function-hero-copy"><h1 id="studentOffersHeading" tabindex="-1">${esc(title)}</h1><p>${esc(description)}</p></div>
    </header>`;
  }

  function benefit(offer) {
    if (offer.percent != null) return `${offer.percent}%`;
    return label(offer.kind === 'card' ? 'special' : 'onlineShort');
  }

  function saveButton(offer) {
    const active = saved.has(offer.id);
    const action = label(active ? 'remove' : 'save');
    return `<button class="icon-btn offer-save" type="button" data-offer-save="${offer.id}" aria-pressed="${active}"
      aria-label="${esc(`${action} · ${offer.name}`)}" title="${esc(action)}">${ic('heart')}</button>`;
  }

  function card(offer) {
    const [summary] = copy(offer);
    const sourceStatus = offer.kind === 'card' ? 'example' : (offer.verification ? 'verified' : 'verify');
    return `<article class="offer-card" data-category="${offer.category}">
      <div class="offer-card-top">
        <span class="offer-mark" aria-hidden="true">${esc(offer.initials)}</span>
        <span class="offer-amount">${esc(benefit(offer))}</span>
        ${saveButton(offer)}
      </div>
      <div class="offer-meta">${esc(categoryName(offer.category))} · ${esc(label(sourceStatus))}</div>
      <h2>${esc(offer.name)}</h2>
      <p>${esc(summary)}</p>
      <a class="offer-details-link" href="#${path}/${offer.id}">${esc(label('show'))}${ic('chevron-right')}</a>
    </article>`;
  }

  function visibleOffers() {
    const terms = normAz(state.query).split(' ').filter(Boolean);
    const result = offers.filter(offer => {
      const words = normAz([offer.name, categoryName(offer.category), label(offer.kind), ...copy(offer)].join(' '));
      return (!state.kind || offer.kind === state.kind) &&
        (!state.category || offer.category === state.category) &&
        (!state.saved || saved.has(offer.id)) &&
        terms.every(term => words.includes(term));
    });
    if (state.order === 'highest') result.sort((a, b) => (b.percent ?? -1) - (a.percent ?? -1));
    if (state.order === 'name') result.sort((a, b) => a.name.localeCompare(b.name, languageIndex() ? 'en' : 'az'));
    return result;
  }

  function renderResults() {
    const result = visibleOffers();
    $('#offerCount', root).textContent = label('count').replace('{n}', result.length);
    $('#offerResults', root).innerHTML = result.length ? result.map(card).join('') :
      `<div class="offer-empty"><p>${esc(label('empty'))}</p><button type="button" class="btn btn--secondary" data-offer-reset>${esc(label('reset'))}</button></div>`;
  }

  function programmeLinks() {
    return `<nav class="offer-programme-links" aria-label="${esc(label('programmeLinks'))}">
      ${programmeSources.map(([url, names]) => `<a class="btn btn--secondary" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(names[languageIndex()])}${ic('external-link')}</a>`).join('')}
    </nav>`;
  }

  function guide(showProgrammeLinks = false) {
    return `<section class="offer-guide" aria-labelledby="offerGuideTitle">
      <h2 id="offerGuideTitle">${esc(label('guide'))}</h2>
      ${showProgrammeLinks ? programmeLinks() : ''}
      ${[['card', 'localSteps'], ['online', 'onlineSteps'], ['partnerConditions', 'partnerText'], ['cardSafety', 'safetyText']]
        .map(([title, body]) => `<details class="function-panel"><summary>${esc(label(title))}</summary><p>${esc(label(body))}</p></details>`).join('')}
    </section>`;
  }

  function list() {
    const option = (value, text, selected) =>
      `<option value="${value}"${value === selected ? ' selected' : ''}>${esc(text)}</option>`;
    root.innerHTML = `
      ${hero(tr('navStudentPlus'), tr('studentPlusIntro'), '/functions', tr('appBackToFunctions'))}
      <section class="function-panel offer-controls" aria-label="${esc(label('filter'))}">
        <div class="field-search" role="search">
          ${ic('search')}<label class="sr-only" for="offerSearch">${esc(label('search'))}</label>
          <input id="offerSearch" type="search" placeholder="${esc(label('search'))}" maxlength="120" autocomplete="off" value="${esc(state.query)}">
        </div>
        <div class="offer-tabs" role="group" aria-label="${esc(label('filter'))}">
          ${['', 'card', 'online'].map(kind => `<button type="button" class="chip" data-offer-kind="${kind}" aria-pressed="${kind === state.kind}" aria-label="${esc(label(kind || 'all'))}">${esc(label(kind === 'online' ? 'onlineShort' : kind || 'all'))}</button>`).join('')}
        </div>
        <div class="offer-options">
          <label><span>${esc(label('category'))}</span><select id="offerCategory">
            ${option('', label('categories'), state.category)}
            ${Object.keys(categoryLabels).map(key => option(key, categoryName(key), state.category)).join('')}
          </select></label>
          <label><span>${esc(label('sort'))}</span><select id="offerSort">
            ${[['catalog','catalog'],['highest','highest'],['name','alphabetical']].map(([value,key]) => option(value,label(key),state.order)).join('')}
          </select></label>
        </div>
      </section>
      <p class="offer-disclaimer">${esc(label('summary'))}</p>
      <div class="offer-listbar">
        <p class="offer-count" id="offerCount" role="status"></p>
        <button class="chip offer-saved-filter" type="button" data-offer-saved aria-pressed="${state.saved}">${ic('heart')}${esc(label('saved'))}</button>
      </div>
      <div id="offerResults" class="offer-grid"></div>
      ${guide(true)}`;
    $('#offerSearch', root).addEventListener('input', event => {
      state.query = event.target.value;
      renderResults();
    });
    $('#offerCategory', root).addEventListener('change', event => {
      state.category = event.target.value;
      renderResults();
    });
    $('#offerSort', root).addEventListener('change', event => {
      state.order = event.target.value;
      renderResults();
    });
    renderResults();
  }

  function showSavings(field, percent) {
    const out = $('#offerEstimate', root);
    const entered = field.value.trim();
    if (!/^\d{1,9}(?:[.,]\d{0,2})?$/.test(entered)) {
      out.textContent = '';
      return;
    }
    const amount = Math.round(Number(entered.replace(',', '.')) * 100);
    const savedCents = Math.round(amount * percent / 100);
    const money = new Intl.NumberFormat(languageIndex() ? 'en' : 'az', { style: 'currency', currency: 'AZN' });
    out.textContent = `${label('savings')} ${money.format(savedCents / 100)} · ${label('final')} ${money.format((amount - savedCents) / 100)}`;
  }

  function verificationDetails(verification) {
    if (!verification) return '';
    const { checkedAt, url } = verification;
    const date = new Intl.DateTimeFormat(languageIndex() ? 'en-GB' : 'az-AZ', {
      dateStyle: 'long', timeZone: 'UTC',
    }).format(new Date(checkedAt));
    return `<p class="offer-meta">${esc(label('verified'))} · <time datetime="${esc(checkedAt)}">${esc(date)}</time><br>
      <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label('verificationSource'))}${ic('external-link')}</a>
    </p>`;
  }

  function detail(offer) {
    if (!offer) {
      root.innerHTML = hero(label('notFound'), '', path, label('back'));
      return;
    }
    const [summary, conditions] = copy(offer);
    const local = offer.kind === 'card';
    root.innerHTML = `
      ${hero(offer.name, summary, path, label('back'))}
      <div class="offer-detail-grid">
        <section class="function-panel offer-description">
          <div class="offer-detail-heading"><span class="offer-amount">${esc(benefit(offer))}</span>${saveButton(offer)}</div>
          <p class="offer-meta">${esc(label(offer.kind))} · ${esc(categoryName(offer.category))}</p>
          <p class="offer-verification">${esc(label(local ? 'localNotice' : 'onlineNotice'))}</p>
          <h2>${esc(label('steps'))}</h2><p>${esc(label(local ? 'localSteps' : 'onlineSteps'))}</p>
          <h2>${esc(label('offerCheck'))}</h2><p>${esc(conditions)}</p>
          <p class="offer-meta">${esc(label('source'))} ·
            ${local ? esc(label('localSource')) : `<a href="${esc(offer.url)}" target="_blank" rel="noopener noreferrer">${esc(label('official'))}${ic('external-link')}</a>`}
          </p>
          ${verificationDetails(offer.verification)}
          ${local ? programmeLinks() : ''}
        </section>
        ${offer.percent == null ? '' : `<section class="function-panel offer-calculator">
          <h2>${esc(label('calc'))}</h2><p>${esc(label('estimate'))}</p>
          <label for="offerPrice">${esc(label('price'))}</label>
          <input id="offerPrice" type="text" inputmode="decimal" placeholder="100" maxlength="13">
          <output id="offerEstimate" for="offerPrice" role="status"></output>
        </section>`}
      </div>
      ${guide()}`;
    $('#offerPrice', root)?.addEventListener('input', event => showSavings(event.target, offer.percent));
  }

  function render(route) {
    if (route.view === 'offer') detail(offers.find(offer => offer.id === route.id));
    else list();
    $('#studentOffersHeading', root)?.focus({ preventScroll: true });
  }

  root.addEventListener('click', event => {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.hasAttribute('data-offer-kind')) {
      state.kind = target.dataset.offerKind;
      $$('[data-offer-kind]', root).forEach(button => button.setAttribute('aria-pressed', String(target === button)));
      renderResults();
    } else if (target.hasAttribute('data-offer-saved')) {
      state.saved = !state.saved;
      target.setAttribute('aria-pressed', String(state.saved));
      renderResults();
    } else if (target.hasAttribute('data-offer-reset')) {
      Object.assign(state, { query: '', kind: '', category: '', order: 'catalog', saved: false });
      list();
      $('#offerSearch', root).focus();
    } else if (target.dataset.offerSave) {
      const offer = offers.find(item => item.id === target.dataset.offerSave);
      if (!offer) return;
      if (saved.has(offer.id)) saved.delete(offer.id);
      else saved.add(offer.id);
      LS.setJSON(favoritesKey, [...saved]);
      if (state.saved && U.route.view !== 'offer') {
        renderResults();
        $('[data-offer-saved]', root).focus();
      } else {
        target.outerHTML = saveButton(offer);
        $(`[data-offer-save="${offer.id}"]`, root).focus({ preventScroll: true });
      }
    }
  });
  window.addEventListener('unec:langchange', () => {
    if (U.route?.tab === 'student-plus') render(U.route);
  });
  U.renderStudentOffers = render;
})();
