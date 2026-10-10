// ============================================================
// UI.JS
// İçindəkilər:
// - Naviqasiya (goTo, getCurrentView)
// - Render — Kurslar (renderCourses, openSubjects, switchTab)
// - Render — Fənlər (renderSubjects)
// - İxtisas filtri (setMajor, renderMajorFilter, subjectMatchesMajor, fənn şifri)
// - Render — PDF Səhifəsi (openPDFs)
// - Render — Əlavələr (renderExtras)
// - Render — Seçilmişlər (renderFavorites, removeFavAndRefresh)
// - Sevimlilər (getFavorites, toggleFavorite, removeFavAndRefresh)
// - Axtarış (initSearch, clearSearch, filterSubjects)
// - Qlobal Event Delegation — PDF düymələri
// - Xəta Bildiriş Modal (openReportModal, closeReportModal, sendReport)
// - Məlumat Paneli (toggleInfoPanel, closeInfoPanel)
// - Easter Egg
// - Təşəkkürlər Modali
// - Klaviatura — ESC
// - (Sidebar → app-core.js: drawer)
// - About / Privacy / Terms Modal
// - (Naviqasiya / router → app-core.js)
// - Başlanğıc (computeStats, applyTranslations, renderCourses, initSearch)
// ============================================================
// NOT (v2): marşrutlama, drawer, sheet və toast app-core.js-ə; material siyahısı/detalı
// app-materials.js-ə; ana səhifə/daha çox app-screens.js-ə köçürülüb. Bu fayl köhnə
// kurs → fənn → PDF iyerarxiyasının məntiqini, ixtisas filtrini, xəta bildirişini və
// modalları saxlayır.

let currentCourse   = null;
let currentSubject  = null;

// Kurslar bölməsinin daxili görünüşləri (#view-*)
const COURSE_VIEWS = ['materials', 'material', 'home', 'subjects', 'pdfs'];

// ── getCurrentView ───────────────────────────────────────────
function getCurrentView() {
  const v = COURSE_VIEWS.find(n => {
    const el = document.getElementById('view-' + n);
    return el && !el.classList.contains('hidden');
  });
  return v || 'materials';
}

// ── goTo — Kurslar daxilində görünüşü göstərir (marşrutu router idarə edir) ──
function goTo(view) {
  COURSE_VIEWS.forEach(v => {
    const el = document.getElementById('view-' + v);
    if (el) el.classList.toggle('hidden', v !== view);
  });
  clearSearch();
  if (view === 'home') renderCourses();
  if (view !== 'pdfs') {
    // köhnə fənnin kartlarını (və onlara bağlı reytinq dinləyicilərini) saxlama
    const items = document.getElementById('pdf-items');
    if (items) items.innerHTML = '';
    if (typeof unsubscribeSubjectChat === 'function') unsubscribeSubjectChat();
    if (typeof unsubscribePdfRatings  === 'function') unsubscribePdfRatings();
  }
  if (view !== 'material') {
    const md = document.getElementById('view-material');
    if (md) md.innerHTML = '';
  }
}

// ── Fayl açma / yükləmə ─────────────────────────────────────
// Açma: istifadəçi jestinin içində, sinxron window.open (gecikmə pop-up blokuna səbəb olurdu).
function openFileUrl(url) {
  let w = null;
  try { w = window.open(url, '_blank'); } catch (e) { w = null; }
  if (w) { try { w.opener = null; } catch (e) {} return true; }
  const a = document.createElement('a');
  a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
  document.body.appendChild(a); a.click(); a.remove();
  return false;
}

// Yükləmə: fayl başqa domendədir (R2), ona görə <a download> işləmir. Əvvəl blob kimi çəkirik;
// CORS / şəbəkə səbəbilə alınmasa, fayl yeni pəncərədə açılır (istifadəçi oradan saxlaya bilər).
async function downloadFileUrl(url, file) {
  showPdfLoading(true);
  const name = String(file || url).split('/').pop() || 'material.pdf';
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const blob = await res.blob();
    const obj  = URL.createObjectURL(blob.type ? blob : new Blob([blob], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = obj; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(obj), 10000);
    hidePdfLoading();
    if (window.UNEC) UNEC.toast(t('downloadStarted'));
  } catch (e) {
    console.warn('[download] birbaşa yükləmə alınmadı, fayl açılır:', e);
    hidePdfLoading();
    openFileUrl(url);
    if (window.UNEC) UNEC.toast(t('downloadFallback'), 'error');
  }
}

// ── Qlobal Event Delegation — PDF düymələri ──────────────────
function handlePdfClick(e) {
  const btn = e.target.closest('[data-action="open"], [data-action="download"]');
  if (!btn || !btn.dataset.url) return;

  const url      = btn.dataset.url;
  const file     = btn.dataset.file;
  const action   = btn.dataset.action;
  const category = btn.dataset.category || 'PDF';

  if (action === 'open') {
    if (typeof gtag === 'function') gtag('event', 'pdf_click', { event_category: category, event_label: file });
    if (typeof onPdfOpened === 'function') { try { onPdfOpened(category, file); } catch (err) {} }
    openFileUrl(url);
  } else {
    if (typeof gtag === 'function') gtag('event', 'pdf_download', { event_category: category, event_label: file });
    downloadFileUrl(url, file);
  }
}
document.addEventListener('click', handlePdfClick);

// ── Axtarış ──────────────────────────────────────────────────
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  if (!searchInput) return;
  searchInput.placeholder = translations[lang].searchPlaceholder;
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    searchClear.classList.toggle('visible', query.length > 0);
    filterSubjects(query);
  });
}

function clearSearch() {
  const searchInput       = document.getElementById('searchInput');
  const searchClear       = document.getElementById('searchClear');
  const searchResultsInfo = document.getElementById('searchResultsInfo');
  if (searchInput) {
    searchInput.value = '';
    if (searchClear)       searchClear.classList.remove('visible');
    if (searchResultsInfo) searchResultsInfo.textContent = '';
    filterSubjects('');
  }
}

function filterSubjects(query) {
  const grid = document.getElementById('subjects-grid');
  if (!grid) return;
  const cards           = grid.querySelectorAll('.subject-card');
  const semesterHeaders = grid.querySelectorAll('.semester-header');
  const searchResultsInfo = document.getElementById('searchResultsInfo');
  let visibleCount = 0;

  cards.forEach(card => {
    const subjectName = card.querySelector('h4').textContent.toLowerCase();
    const subjectCode = (card.dataset.code || '').toLowerCase();
    const matches = !query || subjectName.includes(query) || (subjectCode && subjectCode.includes(query));
    card.style.display = matches ? 'flex' : 'none';
    if (matches) visibleCount++;
  });

  semesterHeaders.forEach(header => {
    header.style.display = query ? 'none' : '';
  });

  if (searchResultsInfo) {
    searchResultsInfo.textContent = query ? `${visibleCount} nəticə tapıldı` : '';
  }
}

// ── Render — Kurslar (Fənlər üzrə: kurs kartları) ───────────
const IC_SVG = name => `<svg class="ic" aria-hidden="true"><use href="#i-${name}"/></svg>`;

function renderCourses() {
  const t    = translations[lang];
  const grid = document.getElementById('courses-grid');
  if (!grid) return;
  grid.innerHTML = '';
  Object.entries(data).forEach(([courseName, courseData]) => {
    const subCount = Object.keys(courseData.subjects).length;
    const pdfCount = Object.values(courseData.subjects).reduce((a, subj) => a + subj.pdfs.length, 0);
    const a = document.createElement('a');
    a.className = 'course-card animate-in';
    a.href = '#/courses/subjects/' + encodeURIComponent(courseName);
    a.innerHTML = `
      <span class="course-icon">${IC_SVG('graduation-cap')}</span>
      <h3>${courseName}</h3>
      <div class="sub-count">${subCount} ${t.subjects} · ${pdfCount} ${t.pdfs}</div>
    `;
    grid.appendChild(a);
  });
}

// Köhnə kod adı: kursa keç (router vasitəsilə)
function openSubjects(courseName) {
  if (window.UNEC) UNEC.go('/courses/subjects/' + encodeURIComponent(courseName));
}

// Router çağırır: kursun fənlər siyahısını göstər
function showSubjects(courseName) {
  currentCourse = courseName;
  const bc = document.getElementById('bc-course');
  if (bc) bc.textContent = courseName;
  goTo('subjects');
  switchTab('subjects');
  renderSubjects(courseName);
}

function switchTab(tab) {
  ['subjects', 'extras', 'favorites'].forEach(t => {
    const btn = document.getElementById(`tab-${t}-btn`);
    btn.classList.toggle('active', t === tab);
    btn.setAttribute('aria-selected', String(t === tab));
    document.getElementById(`tab-${t}-content`).classList.toggle('hidden', t !== tab);
  });
  clearSearch();
  const bar = document.getElementById('searchBarContainer');
  if (bar) bar.classList.toggle('hidden', tab !== 'subjects');
  if (tab === 'favorites') renderFavorites();
  if (tab === 'extras')    renderExtras();
}

// ── Render — Əlavələr ────────────────────────────────────────
function renderExtras() {
  const tx   = translations[lang];
  const list = document.getElementById('extras-list');
  const items = UNEC.extraEntries(currentCourse);
  if (items.length === 0) {
    list.innerHTML = `<div class="empty-favs">${tx.noExtras}</div>`;
    return;
  }
  list.innerHTML = items.map(UNEC.richCardHTML).join('');
  UNEC.fetchRatings(items);
}

// ── Render — Seçilmişlər (cari kurs üzrə) ────────────────────
function renderFavorites() {
  const tx   = translations[lang];
  const list = document.getElementById('favorites-list');
  const items = currentCourse ? UNEC.favoriteEntries(currentCourse) : [];
  if (items.length === 0) {
    list.innerHTML = `<div class="empty-favs">${tx.noFavorites}</div>`;
    return;
  }
  list.innerHTML = items.map(UNEC.richCardHTML).join('');
  if (typeof renderAllPdfRatings === 'function') renderAllPdfRatings();
}

function removeFavAndRefresh(filePath) {
  toggleFavorite(filePath);
  renderFavorites();
}

// ── İxtisas filtri ───────────────────────────────────────────
// Kurs + ixtisas seçiləndə yalnız həmin ixtisasın həmin kursdakı (2 semestr) fənləri göstərilir.
// Mənbə: scripts/curriculum.js — CURRICULUM_DATA (code / codes) və CURRICULUM_CODES.
// 1) pdfs.js-də fənnə  code: "00591"  yazılıbsa → şifr ixtisasın həmin kurs şifrlərindədirsə göstərilir.
// 2) Ad ilə də yoxlanılır (eyni fənnin şifri ixtisaslara görə fərqli ola bilər, məs. Xarici dil;
//    şifr yazılmamış fənlər də beləcə tapılır).
// 3) Əl ilə təyin üçün pdfs.js-də (kursdan asılı olmayaraq):  majors: ["ecology", "statistics"]
// 4) Tudifak fənləri heç bir ixtisasda və "Hamısı"-da görünmür — yalnız "Tudifak" çipində.
const MAJOR_LS_KEY = 'subjects_major_filter';

// ── Tudifak bölməsi ──────────────────────────────────────────
// Bu fənlər ayrıca "Tudifak" çipində görünür; heç bir ixtisasda və "Hamısı"-da çıxmır.
// Siyahı pdfs.js-dəki fənn adlarıdır. Yeni fənn əlavə etmək üçün ya bura yazın,
// ya da pdfs.js-də həmin fənnə  tudifak: true  əlavə edin.
const TUDIFAK_KEY   = 'tudifak';
const TUDIFAK_LABEL = 'Tudifak';
const TUDIFAK_SUBJECTS = [
  'Liner cebir ve matematiksel analiz',
  'Azerbaycanın tarihi',
  'Bilgi işlem teknolojileri',
  'Yönetim ve organizasyon',
  'Olasılık teorisi ve matematiksel istatistik'
];

const MAJOR_I18N_KEYS = {
  economics: 'currSpecEconomics', finance: 'currSpecFinance', accounting: 'currSpecAccounting',
  management: 'currSpecManagement', marketing: 'currSpecMarketing', design: 'currSpecDesign',
  foodEngineering: 'currSpecFoodEng', internationalRelations: 'currSpecIntlRelations',
  internationalTradeLogistics: 'currSpecIntlTrade', ecology: 'currSpecEcology',
  statistics: 'currSpecStatistics', publicAdministration: 'currSpecPublicAdmin',
  businessManagement: 'currSpecBusinessMgmt'
};

// Eyni fənnin fərqli yazılışları (pdfs.js adı → curriculum.js adı)
// Qeyd: Türkcə adlı fənlər (Tudifak) buraya bağlanmır — onlar ayrıca bölmədədir.
const SUBJECT_ALIASES = {
  'Azərbaycan tarixi': 'Azərbaycanın tarixi'
};

function normSubjectName(raw) {
  let s = String(raw || '').trim();
  // "Seçmə fənn - 1 (Qiymət siyasəti)" → "Qiymət siyasəti"
  const sel = s.match(/^seçmə fənn\s*(?:-\s*\d+)?\s*\((.+)\)\s*$/i);
  if (sel) s = sel[1];
  s = s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
       .replace(/ı/g, 'i').replace(/ə/g, 'e')
       .replace(/kompyuter/g, 'komputer')
       .replace(/\s*-\s*/g, '-').replace(/\s+/g, ' ').trim();
  // Xarici dil: A1/A2/B1/B1+ (pdfs.js)  ↔  -1/-2/-3/-4 (curriculum.js)
  s = s.replace(/^xarici dilde isguzar ve akademik kommunikasiya\s*-?\s*(a1|a2|b1\+|b1|[1-4])$/,
    (_, l) => 'xarici dil ' + ({ a1: 1, a2: 2, b1: 3, 'b1+': 4 }[l] || l));
  // Boşluqsuz müqayisə ("idarəedilməsi" ≈ "idarə edilməsi")
  return s.replace(/\s+/g, '');
}

let _aliasNorm = null;
function canonSubjectName(raw) {
  if (!_aliasNorm) {
    _aliasNorm = {};
    Object.entries(SUBJECT_ALIASES).forEach(([a, b]) => { _aliasNorm[normSubjectName(a)] = normSubjectName(b); });
  }
  const n = normSubjectName(raw);
  return _aliasNorm[n] || n;
}

const _majorIndexCache = {};

// İxtisasın kurs üzrə şifr və fənn adı indeksi: { codes: {1..4: Set}, names: {1..4: Set} }
function getMajorIndex(majorKey) {
  if (_majorIndexCache[majorKey]) return _majorIndexCache[majorKey];
  const mk  = () => ({ 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set() });
  const idx = { codes: mk(), names: mk() };
  const courseOf = sem => Math.min(4, Math.max(1, Math.ceil(sem / 2)));
  const addCode  = (sem, c) => { if (c) idx.codes[courseOf(sem)].add(String(c).trim()); };
  const addName  = (sem, n) => { if (n) idx.names[courseOf(sem)].add(canonSubjectName(n)); };

  const major = (typeof CURRICULUM_DATA !== 'undefined') ? CURRICULUM_DATA[majorKey] : null;
  if (major) {
    for (let sem = 1; sem <= 8; sem++) {
      (major['semester' + sem] || []).forEach(e => {
        addName(sem, e.name);
        addCode(sem, e.code);
        (e.codes || []).forEach(c => addCode(sem, c));
      });
    }
  }
  const src = (typeof CURRICULUM_CODES !== 'undefined') ? CURRICULUM_CODES[majorKey] : null;
  if (src) {
    ['general', 'major', 'practice'].forEach(k => (src[k] || []).forEach(x => {
      addName(x.semester, x.name); addCode(x.semester, x.code);
    }));
    ['generalElectives', 'majorElectives'].forEach(k => (src[k] || []).forEach(g =>
      (g.subjects || []).forEach(x => { addName(g.semester, x.name); addCode(g.semester, x.code); })));
  }
  return (_majorIndexCache[majorKey] = idx);
}

// Fənnin şifri: fənn səviyyəsində code, yoxdursa PDF-lərdən birincisi
function getSubjectCode(subj) {
  if (subj && subj.code) return String(subj.code).trim();
  const p = subj && Array.isArray(subj.pdfs) ? subj.pdfs.find(x => x.code) : null;
  return p ? String(p.code).trim() : '';
}

// "1-ci kurs" → 1,  "3-cü kurs" → 3  (tanınmasa null → bütün kurslar)
function courseNumber(courseName) {
  const n = parseInt(courseName, 10);
  return (n >= 1 && n <= 4) ? n : null;
}

let _tudifakSet = null;
function isTudifakSubject(subjectName, subj) {
  if (subj && subj.tudifak === true) return true;
  if (!_tudifakSet) _tudifakSet = new Set(TUDIFAK_SUBJECTS.map(normSubjectName));
  return _tudifakSet.has(normSubjectName(subjectName));
}

function isValidMajorKey(key) {
  return key === 'all' || key === TUDIFAK_KEY ||
    (typeof CURRICULUM_DATA !== 'undefined' && !!CURRICULUM_DATA[key]);
}

function subjectMatchesMajor(subjectName, subj, majorKey, courseNo) {
  const tudifak = isTudifakSubject(subjectName, subj);
  if (majorKey === TUDIFAK_KEY) return tudifak;   // Tudifak çipi: yalnız Tudifak fənləri
  if (tudifak) return false;                      // Hamısı + ixtisaslar: Tudifak fənləri çıxmır
  if (!majorKey || majorKey === 'all') return true;
  if (Array.isArray(subj.majors) && subj.majors.includes(majorKey)) return true;
  const idx     = getMajorIndex(majorKey);
  const courses = courseNo ? [courseNo] : [1, 2, 3, 4];
  const code    = getSubjectCode(subj);
  const name    = canonSubjectName(subjectName);
  return courses.some(c => (code && idx.codes[c].has(code)) || idx.names[c].has(name));
}

function codeBadgeHTML(code) {
  return code ? `<span class="code-badge" title="Fənn şifri">${code}</span>` : '';
}

function getSelectedMajor() {
  let key = 'all';
  try { key = localStorage.getItem(MAJOR_LS_KEY) || 'all'; } catch (e) {}
  if (!isValidMajorKey(key)) key = 'all';
  return key;
}

function setMajor(key) {
  if (!isValidMajorKey(key)) key = 'all';
  try { localStorage.setItem(MAJOR_LS_KEY, key); } catch (e) {}
  if (typeof gtag === 'function') gtag('event', 'major_filter', { event_category: 'Filter', event_label: key });
  renderSubjects(currentCourse);
  const si = document.getElementById('searchInput');
  if (si && si.value.trim()) filterSubjects(si.value.trim().toLowerCase());
}

function renderMajorFilter() {
  if (typeof CURRICULUM_DATA === 'undefined') return;
  const t    = translations[lang];
  const grid = document.getElementById('subjects-grid');
  if (!grid) return;

  let box = document.getElementById('major-filter');
  if (!box) {
    box = document.createElement('div');
    box.id = 'major-filter';
    box.className = 'major-filter';
    box.addEventListener('click', (e) => {
      const chip = e.target.closest('.major-chip');
      if (chip) setMajor(chip.dataset.major);
    });
    grid.parentNode.insertBefore(box, grid);
  }

  const selected = getSelectedMajor();
  const chip = (key, icon, label) => `
    <button type="button" class="major-chip${key === selected ? ' active' : ''}" data-major="${key}" aria-pressed="${key === selected}">
      <span>${label}</span>
    </button>`;

  box.innerHTML = `
    <div class="major-filter-label">${t.majorFilterLabel}</div>
    <div class="major-chips" role="group" aria-label="${t.majorFilterLabel}">
      ${chip('all', 'apps', t.majorAll)}
      ${Object.entries(CURRICULUM_DATA).map(([key, m]) =>
        chip(key, m.icon, t[MAJOR_I18N_KEYS[key]] || m.name)).join('')}
      ${chip(TUDIFAK_KEY, 'translate', TUDIFAK_LABEL)}
    </div>`;

  // Seçilmiş çip görünməyibsə üfüqi sürüşdür (səhifəni sürüşdürmədən)
  const chips  = box.querySelector('.major-chips');
  const active = box.querySelector('.major-chip.active');
  if (chips && active && chips.scrollWidth > chips.clientWidth) {
    chips.scrollLeft = active.offsetLeft - (chips.clientWidth - active.offsetWidth) / 2;
  }
}

// ── Render — Fənlər (Semester qrupları ilə) ──────────────────
const SUBJECT_ICONS = ['book-open', 'calculator', 'chart', 'layers', 'graduation-cap', 'target', 'file-text',
  'globe', 'sparkles', 'users', 'clipboard-check', 'calendar-days', 'lightbulb', 'zap', 'palette', 'settings'];

function renderSubjects(courseName) {
  const t    = translations[lang];
  const grid = document.getElementById('subjects-grid');
  grid.innerHTML = '';
  renderMajorFilter();

  const majorKey   = getSelectedMajor();
  const allEntries = Object.entries(data[courseName].subjects)
    .filter(([name, subj]) => subjectMatchesMajor(name, subj, majorKey, courseNumber(courseName)));

  if (allEntries.length === 0) {
    grid.innerHTML = `<div class="empty-favs" style="grid-column:1/-1;">${t.noMajorSubjects}</div>`;
    return;
  }

  const sem1 = allEntries.filter(([, subj]) => subj.semester === 1);
  const sem2 = allEntries.filter(([, subj]) => subj.semester === 2);

  let iconIndex = 0;

  function renderGroup(entries, labelText) {
    if (entries.length === 0) return;
    const header = document.createElement('div');
    header.className = 'semester-header';
    header.textContent = labelText;
    grid.appendChild(header);

    entries.forEach(([subjectName, subj]) => {
      const a = document.createElement('a');
      a.className = 'subject-card animate-in';
      a.href = '#/courses/subjects/' + encodeURIComponent(courseName) + '/' + encodeURIComponent(subjectName);
      const subjCode = getSubjectCode(subj);
      a.dataset.code = subjCode;
      const safeName = String(subjectName).replace(/&/g, '&amp;').replace(/</g, '&lt;');
      a.innerHTML = `
        <div class="subject-icon">${IC_SVG(SUBJECT_ICONS[iconIndex % SUBJECT_ICONS.length])}</div>
        <div class="subject-info">
          <h4>${safeName}</h4>
          <div class="pdf-count">
            ${codeBadgeHTML(subjCode)}
            ${getTypeBadgeHTML(subj.type)}
            <span class="pdf-badge">PDF ${subj.pdfs.length}</span>
          </div>
        </div>
        ${IC_SVG('chevron-right')}
      `;
      grid.appendChild(a);
      iconIndex++;
    });
  }

  renderGroup(sem1, t.semesterFall);
  renderGroup(sem2, t.semesterSpring);
}

// ── PDF Səhifəsi ─────────────────────────────────────────────
// Köhnə kod adı: fənnə keç (router vasitəsilə)
function openPDFs(subjectName) {
  if (window.UNEC) UNEC.go('/courses/subjects/' + encodeURIComponent(currentCourse) + '/' + encodeURIComponent(subjectName));
}

// Router çağırır
function showPdfs(courseName, subjectName) {
  currentCourse  = courseName;
  currentSubject = subjectName;
  const subj  = data[courseName].subjects[subjectName];
  const type  = subj.type;
  const notes = EXAM_NOTES[type] || [];

  goTo('pdfs');

  document.getElementById('bc-subject').textContent = subjectName;

  const entries = UNEC.entriesForSubject(courseName, subjectName);
  document.getElementById('subject-hero').innerHTML = UNEC.subjectHeroHTML(courseName, subjectName, subj, entries);

  const existing = document.getElementById('subject-info-panel');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.id        = 'subject-info-panel';
  panel.className = 'info-panel hidden';
  panel.innerHTML = `
    <div class="info-panel-inner info-panel-${type}">
      <div class="info-panel-header">
        <span class="info-panel-title">${type === 'test' ? '<span class="material-symbols-outlined msi">desktop_windows</span> Elektron-test haqqında' : '<span class="material-symbols-outlined msi">edit</span> Elektron-yazılı haqqında'}</span>
        <button class="info-panel-close" onclick="closeInfoPanel()" aria-label="Bağla">✕</button>
      </div>
      <ul class="info-panel-list">
        ${notes.map(n => `<li>${n}</li>`).join('')}
      </ul>
    </div>
  `;
  document.querySelector('.pdf-section-header').appendChild(panel);

  const list = document.getElementById('pdf-items');
  list.innerHTML = entries.map(UNEC.richCardHTML).join('');

  const reportBtn = document.createElement('button');
  reportBtn.type = 'button';
  reportBtn.className = 'report-error-btn';
  reportBtn.innerHTML = `${IC_SVG('flag')}<span>${t('mdReport')}</span>`;
  reportBtn.onclick = () => openReportModal(subjectName, courseName);
  list.appendChild(reportBtn);

  UNEC.afterSubjectRender(entries);
  if (typeof renderSubjectChat === 'function') renderSubjectChat(courseName, subjectName, subj.pdfs);
}

// ── Sevimlilər ────────────────────────────────────────────────
// Saxlanma formatı dəyişməyib: localStorage "favorites" = ["pdf/<fayl>", "pdf-extra/<fayl>"]
function getFavorites() {
  try {
    const v = JSON.parse(localStorage.getItem('favorites'));
    return Array.isArray(v) ? v : [];
  } catch (e) { return []; }
}

function toggleFavorite(filePath) {
  let favs = getFavorites();
  const on = !favs.includes(filePath);
  favs = on ? favs.concat(filePath) : favs.filter(f => f !== filePath);
  try { localStorage.setItem('favorites', JSON.stringify(favs)); } catch (e) {}
  document.querySelectorAll('[data-fav]').forEach(b => {
    if (b.dataset.fav !== filePath) return;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', String(on));
    const label = t(on ? 'appFavRemove' : 'appFavAdd');
    b.setAttribute('aria-label', label);
    b.title = label;
  });
  if (window.UNEC) UNEC.toast(t(on ? 'favAdded' : 'favRemoved'));
  window.dispatchEvent(new CustomEvent('unec:favchange'));
  return on;
}

document.addEventListener('click', function (e) {
  const b = e.target.closest('[data-fav]');
  if (!b) return;
  e.preventDefault();
  toggleFavorite(b.dataset.fav);
});

// ── Xəta Bildiriş Modal ───────────────────────────────────────
let reportSubjectName = '';
let reportCourseName  = '';

function openReportModal(subjectName, courseName) {
  reportSubjectName = subjectName;
  reportCourseName  = courseName;

  const overlay  = document.getElementById('reportOverlay');
  const ctx      = document.getElementById('report-context');
  const form     = document.getElementById('report-form');
  const success  = document.getElementById('report-success');
  const textarea = document.getElementById('report-message');
  const select   = document.getElementById('report-type');

  if (ctx)      ctx.textContent      = `${courseName} · ${subjectName}`;
  if (form)     form.classList.remove('hidden');
  if (success)  success.classList.add('hidden');
  if (textarea) textarea.value       = '';
  if (select)   select.selectedIndex = 0;

  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeReportModal() {
  document.getElementById('reportOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}

function closeReportIfOutside(e) {
  if (e.target === document.getElementById('reportOverlay')) closeReportModal();
}

async function sendReport() {
  const type    = document.getElementById('report-type').value;
  const message = document.getElementById('report-message').value.trim();
  const sendBtn = document.getElementById('report-send-btn');

  if (!message) {
    document.getElementById('report-message').focus();
    return;
  }

  sendBtn.disabled    = true;
  sendBtn.textContent = 'Göndərilir...';

  try {
    const response = await fetch('https://formspree.io/f/xkoyapnj', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "Kurs":      reportCourseName,
        "Fənn":      reportSubjectName,
        "Xəta növü": type,
        "Məzmun":    message
      })
    });

    if (response.ok) {
      document.getElementById('report-form').classList.add('hidden');
      document.getElementById('report-success').classList.remove('hidden');
      setTimeout(closeReportModal, 2800);
    } else {
      throw new Error('Formspree error');
    }
  } catch (err) {
    const body = encodeURIComponent(
      `Kurs: ${reportCourseName}\nFənn: ${reportSubjectName}\nXəta növü: ${type}\n\n${message}`
    );
    window.open(`mailto:unecimtahanmateriallari@gmail.com?subject=UNEC%20X%C9%99ta%20Bildiri%C5%9Fi&body=${body}`, '_blank');
    closeReportModal();
  } finally {
    sendBtn.disabled  = false;
    sendBtn.innerHTML = '<span class="material-symbols-outlined msi">arrow_outward</span> Göndər';
  }
}

// ── Məlumat Paneli ────────────────────────────────────────────
function toggleInfoPanel() {
  const panel = document.getElementById('subject-info-panel');
  if (panel) panel.classList.toggle('hidden');
}

function closeInfoPanel() {
  const panel = document.getElementById('subject-info-panel');
  if (panel) panel.classList.add('hidden');
}

document.addEventListener('click', function(e) {
  const panel = document.getElementById('subject-info-panel');
  if (panel && !panel.classList.contains('hidden') &&
      !panel.contains(e.target) &&
      !e.target.closest('.info-btn, [data-info-toggle]')) {
    panel.classList.add('hidden');
  }
});

// ── Easter Egg ────────────────────────────────────────────────
let easterClickCount = 0;
let easterTimer = null;

function easterEggClick() {
  easterClickCount++;
  clearTimeout(easterTimer);
  easterTimer = setTimeout(() => { easterClickCount = 0; }, 2000);
  if (easterClickCount >= 3) {
    easterClickCount = 0;
    clearTimeout(easterTimer);
    openEaster();
  }
}

function openEaster() {
  document.getElementById('easterOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeEaster() {
  document.getElementById('easterOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}

function closeEasterIfOutside(e) {
  if (e.target === document.getElementById('easterOverlay')) closeEaster();
}

// ── Təşəkkürlər Modali ────────────────────────────────────────
function openThanks() {
  renderThanks();
  document.getElementById('thanksOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeThanks() {
  document.getElementById('thanksOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}

function closeThanksIfOutside(e) {
  if (e.target === document.getElementById('thanksOverlay')) closeThanks();
}

// ── Klaviatura — ESC ──────────────────────────────────────────
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeThanks();
    closeEaster();
    closeReportModal();
    closeSidebar();
    closeAboutModal();
    closePrivacyModal();
    closeTermsModal();
  }
});

// ── About ──────────────────────────────────────────────────────
function openAboutModal() {
  closeSidebar();
  document.getElementById('aboutOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeAboutModal() {
  document.getElementById('aboutOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}

// ── Privacy ────────────────────────────────────────────────────
function openPrivacyModal() {
  closeSidebar();
  document.getElementById('privacyOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closePrivacyModal() {
  document.getElementById('privacyOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}

// ── Terms ──────────────────────────────────────────────────────
function openTermsModal() {
  closeSidebar();
  document.getElementById('termsOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeTermsModal() {
  document.getElementById('termsOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}

// ── Başlanğıc ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  try { computeStats(); }      catch(e) { console.warn('computeStats:', e); }
  try { applyTranslations(); } catch(e) { console.warn('applyTranslations:', e); }
  try { renderCourses(); }     catch(e) { console.warn('renderCourses:', e); }
  try { initSearch(); }        catch(e) { console.warn('initSearch:', e); }
});
