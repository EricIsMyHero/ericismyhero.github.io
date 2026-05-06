// ============================================================
// İMTAHAN TİPİNƏ GÖRƏ OTOMATİK QEYDLƏR
// ============================================================
const EXAM_NOTES = {
  test: [
    "🖥️ Bu fənn <strong>Elektron-Test</strong> formatındadır.",
    "🔀 Sualların sırası fərqli ola bilər. Cavabları sıraya görə deyil, mənaya görə öyrənin.",
    "⚠️ Materiallardakı cavablar köhnə ola bilər, müəllimin dediyi mövzularla müqayisə edin.",
    "💡 Bütün variantları nəzərdən keçirin, bəzən test tipli fənnlər yazılıya çevrilə bilər."
  ],
  yazili: [
    "✍️ Bu fənn <strong>Elektron-Yazılı</strong> formatındadır.",
    "📝 Cavablarınızı tam, əsaslandırılmış və ən önəmlisi fərqli şəkildə yazmağa diqqət göstərin.",
    "⚠️ Materiallardakı suallar köhnə ola bilər, sillabusunuzla mütləq uyğunlaşdırın.",
    "💡 Əlavə mənbələrdən də istifadə etməyi tövsiyə edirik, bəzən yazılı tipli fənnlər testə çevrilə bilər."
  ]
};

// ============================================================
// PDF YÜKLƏMƏ OVERLAY
// ============================================================
let pdfProgressInterval = null;

function showPdfLoading(isDownload) {
  const overlay = document.getElementById('pdfLoadingOverlay');
  const title   = document.getElementById('pdfLoadingTitle');
  const fill    = document.getElementById('pdfProgressFill');

  title.textContent = isDownload ? 'PDF Endirilir...' : 'PDF Açılır...';
  fill.style.width  = '0%';
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  let progress = 0;
  clearInterval(pdfProgressInterval);
  pdfProgressInterval = setInterval(() => {
    if (progress < 90) {
      progress += 30;
      fill.style.width = Math.min(progress, 90) + '%';
    }
  }, 100);

  setTimeout(hidePdfLoading, 4000);
}

function hidePdfLoading() {
  const overlay = document.getElementById('pdfLoadingOverlay');
  const fill    = document.getElementById('pdfProgressFill');

  clearInterval(pdfProgressInterval);
  fill.style.width = '100%';

  setTimeout(() => {
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
    fill.style.width = '5%';
  }, 300);
}

// ============================================================
// TƏŞƏKKÜRLƏR DATA
// ============================================================
const thanksData = [
  { name: "Nərimanov Elnur",  initial: "E", role: "code" },
  { name: "Şükürova Güləyar", initial: "G", role: "pdf"  },
  { name: "Hacıyev Tofiq",    initial: "T", role: "pdf"  },
  { name: "İslamlı Həsən",    initial: "H", role: "pdf"  },
  { name: "Həsənli Əsmər",    initial: "Ə", role: "pdf"  },
];

function renderThanks() {
  const ul = document.getElementById('thanks-list');
  if (!ul) return;
  ul.innerHTML = '';
  const groups = [
    { key: 'code', label: '💻 Kod töhfəçiləri' },
    { key: 'pdf',  label: '📄 PDF töhfəçiləri' }
  ];
  groups.forEach(group => {
    const people = thanksData.filter(p => p.role === group.key);
    if (people.length === 0) return;
    const header = document.createElement('li');
    header.className = 'thanks-section-label';
    header.textContent = group.label;
    ul.appendChild(header);
    people.forEach(p => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="thanks-avatar">${p.initial}</span>
        <div class="thanks-person"><span class="thanks-name">${p.name}</span></div>
        <span class="thanks-heart">♥</span>
      `;
      ul.appendChild(li);
    });
  });
}

// ============================================================
// FƏNN TİPİ BADGEİ
// ============================================================
function getTypeBadgeHTML(type) {
  if (type === 'test')   return `<span class="exam-type-badge exam-type-test">🖥️ Test</span>`;
  if (type === 'yazili') return `<span class="exam-type-badge exam-type-yazili">✍️ Yazılı</span>`;
  return '';
}

// ============================================================
// PDF TİPİ BADGEİ
// ============================================================
function getPdfTypeBadgeHTML(pdfType) {
  if (!pdfType || !PDF_TYPES[pdfType]) return '';
  const t = PDF_TYPES[pdfType];
  return `<span class="pdf-type-badge" style="color:${t.color};background:${t.bg};border-color:${t.border}">${t.label}</span>`;
}

// ============================================================
// TƏRCÜMƏ
// ============================================================
const translations = {
  az: {
    badge: "İmtahan Materialları",
    heroTitle: 'UNEC <span>İmtahan</span><br>Materialları',
    heroDesc: "Bütün kurslar üzrə imtahan materiallarına tez çatın. Fənni seçərək, PDF-i açın.",
    coursesLabel: "Kurslar",
    subjectsLabel: "Fənlər",
    extrasLabel: "Əlavələr",
    favoritesLabel: "Seçilmişlər",
    pdfsLabel: "PDF Materiallar",
    searchPlaceholder: "Fənn axtar...",
    back1: "Kurslara qayıt",
    back2: "Fənlərə qayıt",
    bcHome: "Ana səhifə",
    subjects: "fənn",
    pdfs: "material",
    openPdf: "Aç",
    downloadPdf: "Endir",
    statCourses: "Kurs",
    statSubjects: "Fənn",
    statPdfs: "PDF",
    noFavorites: "Hələ seçilən PDF yoxdur. ★ basaraq əlavə edin.",
    noExtras: "Bu kurs üçün hələ əlavə material yoxdur.",
    footer: "Bu sayt rəsmi deyildir. Yalnız tələbələrin imtahan zamanı materialları daha rahat və əlçatan tapması üçün hazırlanıb.",
    semesterFall: "🍂 Payız Semestri",
    semesterSpring: "🌸 Yaz Semestri"
  },
  en: {
    badge: "Exam Materials",
    heroTitle: 'UNEC <span>Exam</span><br>Materials',
    heroDesc: "Quick access to exam materials for all courses. Select a subject, open the PDF.",
    coursesLabel: "Courses",
    subjectsLabel: "Subjects",
    extrasLabel: "Extras",
    favoritesLabel: "Favorites",
    pdfsLabel: "PDF Materials",
    searchPlaceholder: "Search subjects...",
    back1: "Back to Courses",
    back2: "Back to Subjects",
    bcHome: "Home",
    subjects: "subjects",
    pdfs: "files",
    openPdf: "Open",
    downloadPdf: "Download",
    statCourses: "Courses",
    statSubjects: "Subjects",
    statPdfs: "PDFs",
    noFavorites: "No favorites yet. Tap ★ to add one.",
    noExtras: "No extra materials for this course yet.",
    footer: "This site is unofficial. Created to help students find exam materials more easily.",
    semesterFall: "🍂 Fall Semester",
    semesterSpring: "🌸 Spring Semester"
  }
};

// ============================================================
// TEMA SİSTEMİ
// ============================================================
const themes = {
  ocean:    { '--bg':'#070d1a','--surface':'#0d1a2e','--surface2':'#122240','--accent':'#3b82f6','--accent2':'#06b6d4','--accent3':'#8b5cf6','--text':'#e2e8f0','--muted':'#64748b','--border':'rgba(59,130,246,0.15)','--glow':'rgba(59,130,246,0.08)' },
  forest:   { '--bg':'#071a0d','--surface':'#0d2e1a','--surface2':'#124022','--accent':'#22c55e','--accent2':'#4ade80','--accent3':'#86efac','--text':'#e2e8f0','--muted':'#6b7280','--border':'rgba(34,197,94,0.15)','--glow':'rgba(34,197,94,0.08)' },
  sunset:   { '--bg':'#1a0a07','--surface':'#2e150d','--surface2':'#402012','--accent':'#f97316','--accent2':'#ec4899','--accent3':'#fbbf24','--text':'#f1e8e0','--muted':'#78716c','--border':'rgba(249,115,22,0.15)','--glow':'rgba(249,115,22,0.08)' },
  midnight: { '--bg':'#0a0a0a','--surface':'#141414','--surface2':'#1f1f1f','--accent':'#ffffff','--accent2':'#a3a3a3','--accent3':'#737373','--text':'#e5e5e5','--muted':'#525252','--border':'rgba(255,255,255,0.1)','--glow':'rgba(255,255,255,0.04)' },
  candy:    { '--bg':'#fafafa','--surface':'#ffffff','--surface2':'#f3f4f6','--accent':'#a855f7','--accent2':'#ec4899','--accent3':'#8b5cf6','--text':'#1e1b4b','--muted':'#6b7280','--border':'rgba(168,85,247,0.15)','--glow':'rgba(168,85,247,0.06)' },
  arctic:   { '--bg':'#f0f9ff','--surface':'#ffffff','--surface2':'#e0f2fe','--accent':'#0284c7','--accent2':'#0ea5e9','--accent3':'#38bdf8','--text':'#0c1a2e','--muted':'#64748b','--border':'rgba(2,132,199,0.15)','--glow':'rgba(2,132,199,0.06)' },
};

function applyTheme(name, btn) {
  const vars = themes[name];
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  localStorage.setItem('theme', name);
  document.querySelectorAll('.theme-opt, .sidebar-theme-opt').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// ============================================================
// DİL
// ============================================================
let lang = localStorage.getItem('lang') || 'az';
let currentCourse = null;
let currentSubject = null;

function setLang(l) {
  lang = l;
  localStorage.setItem('lang', l);
  applyTranslations();
  const view = getCurrentView();
  if (view === 'subjects') renderSubjects(currentCourse);
  else if (view === 'home') renderCourses();
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.placeholder = translations[lang].searchPlaceholder;
}

function getCurrentView() {
  if (!document.getElementById('view-home').classList.contains('hidden')) return 'home';
  if (!document.getElementById('view-subjects').classList.contains('hidden')) return 'subjects';
  return 'pdfs';
}

function applyTranslations() {
  const t = translations[lang];
  document.getElementById('hero-badge').textContent          = t.badge;
  document.getElementById('hero-title').innerHTML            = t.heroTitle;
  document.getElementById('hero-desc').textContent           = t.heroDesc;
  document.getElementById('label-courses').textContent       = t.coursesLabel;
  document.getElementById('label-subjects').textContent      = t.subjectsLabel;
  document.getElementById('label-extras').textContent        = t.extrasLabel;
  document.getElementById('label-favorites').textContent     = t.favoritesLabel;
  document.getElementById('label-pdfs').textContent          = t.pdfsLabel;
  document.getElementById('back1-text').textContent          = t.back1;
  document.getElementById('back2-text').textContent          = t.back2;
  document.getElementById('bc-home').textContent             = t.bcHome;
  document.getElementById('bc-home2').textContent            = t.bcHome;
  document.getElementById('stat-courses-label').textContent  = t.statCourses;
  document.getElementById('stat-subjects-label').textContent = t.statSubjects;
  document.getElementById('stat-pdfs-label').textContent     = t.statPdfs;
  document.getElementById('footer-text').textContent         = t.footer;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.lang-btn')[lang === 'az' ? 0 : 1].classList.add('active');
}

// ============================================================
// STATİSTİKA
// ============================================================
function computeStats() {
  let totalSubjects = 0, totalPdfs = 0;
  Object.values(data).forEach(course => {
    const subs = Object.values(course.subjects);
    totalSubjects += subs.length;
    subs.forEach(subj => totalPdfs += subj.pdfs.length);
  });
  document.getElementById('stat-courses').textContent  = Object.keys(data).length;
  document.getElementById('stat-subjects').textContent = totalSubjects;
  document.getElementById('stat-pdfs').textContent     = totalPdfs;
}

// ============================================================
// NAVİGASİYA
// ============================================================
function goTo(view) {
  ['home', 'subjects', 'pdfs'].forEach(v => {
    document.getElementById('view-' + v).classList.add('hidden');
  });
  document.getElementById('view-' + view).classList.remove('hidden');
  clearSearch();
  if (view === 'home') renderCourses();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// QLOBAL EVENT DELEGATION — PDF düymələri üçün
// ============================================================
function handlePdfClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const url      = btn.dataset.url;
  const file     = btn.dataset.file;
  const action   = btn.dataset.action;
  const category = btn.dataset.category || 'PDF';

  if (action === 'open') {
    showPdfLoading(false);
    gtag('event', 'pdf_click', { event_category: category, event_label: file });
    setTimeout(() => {
      window.open(url, '_blank');
      hidePdfLoading();
    }, 400);

  } else if (action === 'download') {
    showPdfLoading(true);
    gtag('event', 'pdf_download', { event_category: category, event_label: file });
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = url;
      a.download = '';
      a.click();
      hidePdfLoading();
    }, 400);
  }
}

document.getElementById('pdf-items').addEventListener('click', handlePdfClick);
document.getElementById('extras-list').addEventListener('click', handlePdfClick);
document.getElementById('favorites-list').addEventListener('click', handlePdfClick);

// ============================================================
// AXTARIŞ
// ============================================================
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
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  const searchResultsInfo = document.getElementById('searchResultsInfo');
  if (searchInput) {
    searchInput.value = '';
    if (searchClear) searchClear.classList.remove('visible');
    if (searchResultsInfo) searchResultsInfo.textContent = '';
    filterSubjects('');
  }
}

function filterSubjects(query) {
  const grid = document.getElementById('subjects-grid');
  if (!grid) return;
  const cards = grid.querySelectorAll('.subject-card');
  const semesterHeaders = grid.querySelectorAll('.semester-header');
  const searchResultsInfo = document.getElementById('searchResultsInfo');
  let visibleCount = 0;

  cards.forEach(card => {
    const subjectName = card.querySelector('h4').textContent.toLowerCase();
    const matches = !query || subjectName.includes(query);
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

// ============================================================
// RENDER — KURSLAR
// ============================================================
function renderCourses() {
  const t = translations[lang];
  const grid = document.getElementById('courses-grid');
  grid.innerHTML = '';
  Object.entries(data).forEach(([courseName, courseData]) => {
    const subCount = Object.keys(courseData.subjects).length;
    const pdfCount = Object.values(courseData.subjects).reduce((a, subj) => a + subj.pdfs.length, 0);
    const div = document.createElement('div');
    div.className = 'course-card animate-in';
    div.innerHTML = `
      <span class="course-icon">${courseData.icon}</span>
      <h3>${courseName}</h3>
      <div class="sub-count">${subCount} ${t.subjects} · ${pdfCount} ${t.pdfs}</div>
      <div class="tag">${courseName}</div>
    `;
    div.onclick = () => openSubjects(courseName);
    grid.appendChild(div);
  });
}

function openSubjects(courseName) {
  currentCourse = courseName;
  document.getElementById('bc-course').textContent  = courseName;
  document.getElementById('bc-course2').textContent = courseName;
  switchTab('subjects');
  goTo('subjects');
  renderSubjects(courseName);
}

function switchTab(tab) {
  ['subjects', 'extras', 'favorites'].forEach(t => {
    document.getElementById(`tab-${t}-btn`).classList.toggle('active', t === tab);
    document.getElementById(`tab-${t}-content`).classList.toggle('hidden', t !== tab);
  });
  clearSearch();
  if (tab === 'favorites') renderFavorites();
  if (tab === 'extras')    renderExtras();
}

// ============================================================
// RENDER — ƏLAVƏLƏR
// ============================================================
function renderExtras() {
  const t = translations[lang];
  const list = document.getElementById('extras-list');
  list.innerHTML = '';
  const items = (extrasData[currentCourse] || []);
  if (items.length === 0) {
    list.innerHTML = `<div class="empty-favs">${t.noExtras}</div>`;
    return;
  }
  items.forEach((pdf, index) => {
    const isFav = getFavorites().includes('pdf-extra/' + pdf.file);
    const typeBadge = getPdfTypeBadgeHTML(pdf.pdfType);
    const div = document.createElement('div');
    div.className = 'pdf-item animate-in';
    div.innerHTML = `
      <div class="pdf-top-row">
        <div class="pdf-file-icon" style="background:linear-gradient(135deg,#f59e0b,#d97706);">
          <span>PDF</span>
        </div>
        <div class="pdf-info">
          <div class="pdf-name"><span class="pdf-number">${index + 1}.</span> ${pdf.name}</div>
          <div class="pdf-meta">Fayl adı: ${pdf.desc || pdf.file} ${typeBadge}</div>
        </div>
      </div>
      <div class="pdf-actions">
        <button class="fav-btn ${isFav ? 'active' : ''}"
          onclick="toggleFavorite('pdf-extra/${pdf.file}', this)"
          title="Sevimlilərə əlavə et">
          ${isFav ? '★' : '☆'}
        </button>
        <button class="pdf-open-btn" data-url="${EXTRAS_BASE}${pdf.file}" data-file="${pdf.file}" data-action="open" data-category="PDF-Extra">
          ↗ ${t.openPdf}
        </button>
        <button class="pdf-download-btn" data-url="${EXTRAS_BASE}${pdf.file}" data-file="${pdf.file}" data-action="download" data-category="PDF-Extra">
          ↓ ${t.downloadPdf}
        </button>
      </div>
    `;
    list.appendChild(div);
  });
}

// ============================================================
// RENDER — SEÇİLMİŞLƏR
// ============================================================
function renderFavorites() {
  const t = translations[lang];
  const favs = getFavorites();
  const list = document.getElementById('favorites-list');
  list.innerHTML = '';
  const allPdfs = [];
  if (currentCourse) {
    Object.entries(data[currentCourse].subjects).forEach(([subjectName, subj]) => {
      subj.pdfs.forEach(pdf => {
        const path = 'pdf/' + pdf.file;
        if (favs.includes(path)) allPdfs.push({ name: pdf.name, meta: subjectName, path, color: '', pdfType: pdf.pdfType });
      });
    });
    (extrasData[currentCourse] || []).forEach(pdf => {
      const path = 'pdf-extra/' + pdf.file;
      if (favs.includes(path)) {
        allPdfs.push({ name: pdf.name, meta: pdf.desc || '📦 Əlavə material', path, color: 'background:linear-gradient(135deg,#f59e0b,#d97706)', pdfType: pdf.pdfType });
      }
    });
  }
  if (allPdfs.length === 0) {
    list.innerHTML = `<div class="empty-favs">${t.noFavorites}</div>`;
    return;
  }
  allPdfs.forEach((item, index) => {
    const typeBadge = getPdfTypeBadgeHTML(item.pdfType);
    const div = document.createElement('div');
    div.className = 'pdf-item animate-in';
    div.innerHTML = `
      <div class="pdf-top-row">
        <div class="pdf-file-icon" ${item.color ? `style="${item.color}"` : ''}><span>PDF</span></div>
        <div class="pdf-info">
          <div class="pdf-name"><span class="pdf-number">${index + 1}.</span> ${item.name}</div>
          <div class="pdf-meta">Fayl adı: ${item.meta} ${typeBadge}</div>
        </div>
      </div>
      <div class="pdf-actions">
        <button class="fav-btn active" onclick="removeFavAndRefresh('${item.path}')" title="Sil">★</button>
        <button class="pdf-open-btn" data-url="${BASE}${item.path}" data-file="${item.path}" data-action="open" data-category="PDF-Favorite">
          ↗ ${t.openPdf}
        </button>
        <button class="pdf-download-btn" data-url="${BASE}${item.path}" data-file="${item.path}" data-action="download" data-category="PDF-Favorite">
          ↓ ${t.downloadPdf}
        </button>
      </div>
    `;
    list.appendChild(div);
  });
}

function removeFavAndRefresh(filePath) {
  let favs = getFavorites().filter(f => f !== filePath);
  localStorage.setItem("favorites", JSON.stringify(favs));
  removeFromCache(filePath);
  renderFavorites();
}

// ============================================================
// RENDER — FƏNNLƏR (Semester qrupları ilə)
// ============================================================
function renderSubjects(courseName) {
  const t = translations[lang];
  const grid = document.getElementById('subjects-grid');
  grid.innerHTML = '';
  const icons = ['📊','📐','🗓','💡','📝','📈','🔬','⚙️','🎯','📌','🏛','💰','📉','🌿','🔗','📋','🧮','🏆'];

  const allEntries = Object.entries(data[courseName].subjects);
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
      const div = document.createElement('div');
      div.className = 'subject-card animate-in';
      div.innerHTML = `
        <div class="subject-icon">${icons[iconIndex % icons.length]}</div>
        <div class="subject-info">
          <h4>${subjectName}</h4>
          <div class="pdf-count">
            ${getTypeBadgeHTML(subj.type)}
            <span class="pdf-badge">PDF ${subj.pdfs.length}</span>
          </div>
        </div>
      `;
      div.onclick = () => openPDFs(subjectName);
      grid.appendChild(div);
      iconIndex++;
    });
  }

  renderGroup(sem1, t.semesterFall);
  renderGroup(sem2, t.semesterSpring);
}

// ============================================================
// PDF SƏHİFƏSİ
// ============================================================
function openPDFs(subjectName) {
  currentSubject = subjectName;
  const t = translations[lang];
  const subj = data[currentCourse].subjects[subjectName];
  const pdfs  = subj.pdfs;
  const type  = subj.type;
  const notes = EXAM_NOTES[type] || [];

  document.getElementById('bc-subject').textContent = subjectName;

  const titleEl = document.getElementById('pdf-subject-title');
  titleEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
      <span>${subjectName}</span>
      <button class="info-btn" onclick="toggleInfoPanel()" title="Bu fənn haqqında">?</button>
    </div>
    <div style="margin-top:6px;">
      ${getTypeBadgeHTML(type)}
    </div>
  `;

  const existing = document.getElementById('subject-info-panel');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.id = 'subject-info-panel';
  panel.className = 'info-panel hidden';
  panel.innerHTML = `
    <div class="info-panel-inner info-panel-${type}">
      <div class="info-panel-header">
        <span class="info-panel-title">${type === 'test' ? '🖥️ Elektron-test haqqında' : '✍️ Elektron-yazılı haqqında'}</span>
        <button class="info-panel-close" onclick="closeInfoPanel()">✕</button>
      </div>
      <ul class="info-panel-list">
        ${notes.map(n => `<li>${n}</li>`).join('')}
      </ul>
    </div>
  `;
  document.querySelector('.pdf-section-header').appendChild(panel);

  const list = document.getElementById('pdf-items');
  list.innerHTML = '';

  pdfs.forEach((pdf, index) => {
    const isFav = getFavorites().includes('pdf/' + pdf.file);
    const typeBadge = getPdfTypeBadgeHTML(pdf.pdfType);
    const div = document.createElement('div');
    div.className = 'pdf-item animate-in';
    div.innerHTML = `
      <div class="pdf-top-row">
        <div class="pdf-file-icon"><span>PDF</span></div>
        <div class="pdf-info">
          <div class="pdf-name"><span class="pdf-number">${index + 1}.</span> ${pdf.name}</div>
          <div class="pdf-meta">Fayl adı: ${pdf.file} ${typeBadge}</div>
        </div>
      </div>
      <div class="pdf-actions">
        <button class="fav-btn ${isFav ? 'active' : ''}"
          onclick="toggleFavorite('pdf/${pdf.file}', this)"
          title="Seçilmişlərə əlavə et">
          ${isFav ? '★' : '☆'}
        </button>
        <button class="pdf-open-btn" data-url="/pdf/${pdf.file}" data-file="${pdf.file}" data-action="open">
          ↗ ${t.openPdf}
        </button>
        <button class="pdf-download-btn" data-url="/pdf/${pdf.file}" data-file="${pdf.file}" data-action="download">
          ↓ ${t.downloadPdf}
        </button>
      </div>
    `;
    list.appendChild(div);
  });

  const reportBtn = document.createElement('button');
  reportBtn.className = 'report-error-btn';
  reportBtn.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="8" cy="8" r="7"/>
      <line x1="8" y1="5" x2="8" y2="8.5"/>
      <circle cx="8" cy="11.5" r="0.6" fill="currentColor" stroke="none"/>
    </svg>
    Xəta Göndər
  `;
  reportBtn.onclick = () => openReportModal(subjectName, currentCourse);
  list.appendChild(reportBtn);

  goTo('pdfs');
}

// ============================================================
// AI SORĞU FUNKSİYASI
// ============================================================
async function askAI(userText) {
  const res = await fetch("https://ericismyhero-github-o8p936xnx-ericismyheros-projects.vercel.app/ai-vercel/api/ask.js", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      question: userText,
      context: findBestMatch(userText)
    })
  });

  const data = await res.json();
  return data.reply;
}

// ============================================================
// SEVİMLİLƏR + CACHE
// ============================================================
function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

async function toggleFavorite(filePath, btn) {
  let favs = getFavorites();
  if (favs.includes(filePath)) {
    favs = favs.filter(f => f !== filePath);
    removeFromCache(filePath);
    if (btn) { btn.textContent = '☆'; btn.classList.remove('active'); }
  } else {
    favs.push(filePath);
    cacheOnePDF(filePath);
    if (btn) { btn.textContent = '★'; btn.classList.add('active'); }
  }
  localStorage.setItem("favorites", JSON.stringify(favs));
}

async function cacheOnePDF(filePath) {
  if (!("caches" in window)) return;
  try {
    const cache = await caches.open("pdf-cache");
    await cache.add(BASE + filePath);
  } catch (e) { console.warn("Cache xətası:", e); }
}

async function removeFromCache(filePath) {
  if (!("caches" in window)) return;
  try {
    const cache = await caches.open("pdf-cache");
    await cache.delete(BASE + filePath);
  } catch (e) { console.warn("Cache silmə xətası:", e); }
}

// ============================================================
// XƏTA BİLDİRİŞ
// ============================================================
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
    const response = await fetch('https://formspree.io/f/xjgjrkyz', {
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
    window.open(`mailto:ericismyhero2467@gmail.com?subject=UNEC%20X%C9%99ta%20Bildiri%C5%9Fi&body=${body}`, '_blank');
    closeReportModal();
  } finally {
    sendBtn.disabled  = false;
    sendBtn.innerHTML = '↗ Göndər';
  }
}

// ============================================================
// MƏLUMAT PANELİ
// ============================================================
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
      !e.target.closest('.info-btn')) {
    panel.classList.add('hidden');
  }
});

// ============================================================
// EASTER EGG — logoya 3 dəfə bas
// ============================================================
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

// ============================================================
// TƏŞƏKKÜRLƏr MODALI
// ============================================================
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

// ============================================================
// KLAVIATURA — ESC
// ============================================================
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

// ============================================================
// SİDEBAR
// ============================================================
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const btn     = document.getElementById('hamburgerBtn');
  if (sidebar.classList.contains('is-open')) {
    closeSidebar();
  } else {
    sidebar.classList.add('is-open');
    overlay.classList.add('active');
    btn.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('is-open');
  document.getElementById('sidebarOverlay').classList.remove('active');
  document.getElementById('hamburgerBtn').classList.remove('is-open');
  document.body.style.overflow = '';
}

// ─── About ────────────────────────────────────────────────────
function openAboutModal() {
  closeSidebar();
  document.getElementById('aboutOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeAboutModal() {
  document.getElementById('aboutOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}

// ─── Privacy ──────────────────────────────────────────────────
function openPrivacyModal() {
  closeSidebar();
  document.getElementById('privacyOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closePrivacyModal() {
  document.getElementById('privacyOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}

// ─── Terms ────────────────────────────────────────────────────
function openTermsModal() {
  closeSidebar();
  document.getElementById('termsOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeTermsModal() {
  document.getElementById('termsOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}

// ============================================================
// BAŞLAT (Initialization)
// ============================================================
(function loadSavedTheme() {
  const saved = localStorage.getItem('theme');
  if (saved && themes[saved]) {
    const btn = document.querySelector(`[data-theme="${saved}"]`);
    applyTheme(saved, btn);
  }
})();

computeStats();
applyTranslations();
renderCourses();
initSearch();

// ============================================================
// YENİ: GLASS BOTTOM NAVBAR — TAB SİSTEMİ
// ============================================================
const TAB_MAP = {
  home:    { main: 'main-home',    btn: 'btn-home'    },
  tests:   { main: 'main-tests',   btn: 'btn-tests'   },
  courses: { main: 'main-courses', btn: 'btn-courses' },
  support: { main: 'main-support', btn: 'btn-support' },
};

let currentBottomTab = 'home';

function switchBottomTab(tab) {
  if (currentBottomTab === tab) return;

  const prev = TAB_MAP[currentBottomTab];
  const prevEl = document.getElementById(prev.main);
  if (prevEl) {
    prevEl.classList.remove('active-tab');
    setTimeout(() => { prevEl.style.display = 'none'; }, 280);
  }
  const prevBtn = document.getElementById(prev.btn);
  if (prevBtn) prevBtn.classList.remove('active');

  currentBottomTab = tab;
  const next = TAB_MAP[tab];
  const nextEl = document.getElementById(next.main);
  if (nextEl) {
    nextEl.style.display = '';
    requestAnimationFrame(() => requestAnimationFrame(() => nextEl.classList.add('active-tab')));
  }
  const nextBtn = document.getElementById(next.btn);
  if (nextBtn) nextBtn.classList.add('active');

  if (tab === 'courses') {
    renderCourses();
    goTo('home');
  }
  if (tab === 'tests') {
    initTestSystem();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Başlanğıc vəziyyəti
(function initBottomNav() {
  const homeEl = document.getElementById('main-home');
  if (homeEl) { homeEl.style.display = ''; homeEl.classList.add('active-tab'); }
  ['main-courses', 'main-support', 'main-tests'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const homeBtn = document.getElementById('btn-home');
  if (homeBtn) homeBtn.classList.add('active');
})();

// ============================================================
// TEMA GENİŞLƏNMƏ
// ============================================================
function toggleExtraThemes() {
  const extras = document.querySelectorAll('.theme-extra');
  const icon   = document.getElementById('themeExpandIcon');
  const label  = document.getElementById('themeExpandLabel');
  const isOpen = extras[0] && extras[0].classList.contains('theme-extra-visible');
  extras.forEach(el => el.classList.toggle('theme-extra-visible', !isOpen));
  if (icon)  icon.classList.toggle('rotated', !isOpen);
  if (label) label.textContent = isOpen ? 'Daha çox tema' : 'Daha az tema';
}

(function () {
  const saved = localStorage.getItem('theme') || 'ocean';
  if (['midnight', 'candy', 'arctic'].includes(saved)) {
    document.querySelectorAll('.theme-extra').forEach(el => el.classList.add('theme-extra-visible'));
    const icon  = document.getElementById('themeExpandIcon');
    const label = document.getElementById('themeExpandLabel');
    if (icon)  icon.classList.add('rotated');
    if (label) label.textContent = 'Daha az tema';
  }
})();

// ============================================================
// SUPPORT TOAST
// ============================================================
(function () {
  const SHOW_DELAY   = 8000;
  const INTERVAL     = 30000;
  const VISIBLE_TIME = 5000;
  let toastTimer;

  function showToast() {
    const toast = document.getElementById('supportToast');
    if (!toast) return;
    toast.classList.remove('st-visible');
    void toast.offsetWidth;
    toast.classList.add('st-visible');
    toastTimer = setTimeout(() => toast.classList.remove('st-visible'), VISIBLE_TIME);
  }

  function dismissToast() {
    const toast = document.getElementById('supportToast');
    if (toast) toast.classList.remove('st-visible');
    clearTimeout(toastTimer);
  }

  setTimeout(showToast, SHOW_DELAY);
  setInterval(showToast, INTERVAL);
  window.dismissToast = dismissToast;
})();

// ============================================================
// AI WIDGET
// ============================================================
const BACKEND_URL = "https://ericismyhero-github-io.vercel.app";
let aiOpen = false;

function toggleAI() {
  aiOpen = !aiOpen;
  const chat = document.getElementById('ai-chat');
  if (aiOpen) {
    chat.classList.add('ai-open');
    document.getElementById('ai-input').focus();
    if (!document.getElementById('ai-messages').children.length) {
      addBotMsg('Salam! 👋 UNEC materialları haqqında sualını ver — cavablayayım.');
    }
  } else {
    chat.classList.remove('ai-open');
  }
}

function addBotMsg(text) {
  const wrap = document.getElementById('ai-messages');
  const div = document.createElement('div');
  div.className = 'ai-msg bot';
  div.textContent = text;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
}

function addUserMsg(text) {
  const wrap = document.getElementById('ai-messages');
  const div = document.createElement('div');
  div.className = 'ai-msg user';
  div.textContent = text;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
}

function showTyping() {
  const wrap = document.getElementById('ai-messages');
  const el = document.createElement('div');
  el.className = 'ai-msg bot typing';
  el.id = 'ai-typing';
  el.innerHTML = '<span></span><span></span><span></span>';
  wrap.appendChild(el);
  wrap.scrollTop = wrap.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('ai-typing');
  if (el) el.remove();
}

function buildContext(question) {
  if (typeof data === 'undefined') return '';
  const q = question.toLowerCase();
  const matched = [];
  for (const [course, courseObj] of Object.entries(data)) {
    for (const [subject, subObj] of Object.entries(courseObj.subjects || {})) {
      const words = subject.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      if (words.filter(w => q.includes(w)).length > 0) {
        const pdfNames = (subObj.pdfs || []).map(p => p.name).join(', ');
        matched.push(`Kurs: ${course} | Fənn: ${subject} | Növ: ${subObj.type} | Semestr: ${subObj.semester} | Materiallar: ${pdfNames}`);
      }
    }
  }
  if (!matched.length) {
    const all = [];
    for (const [course, courseObj] of Object.entries(data))
      for (const subj of Object.keys(courseObj.subjects || {}))
        all.push(`${course}: ${subj}`);
    return `Saytda mövcud fənlər:\n${all.join('\n')}`;
  }
  return matched.join('\n');
}

async function sendMessage() {
  const input = document.getElementById('ai-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  input.disabled = true;
  addUserMsg(text);
  showTyping();

  try {
    const res = await fetch(`${BACKEND_URL}/api/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: text, context: buildContext(text) })
    });
    removeTyping();
    if (!res.ok) { addBotMsg('Server xəta verdi (' + res.status + ').'); }
    else { const d = await res.json(); addBotMsg(d.reply || 'Cavab alınmadı.'); }
  } catch (e) {
    removeTyping();
    addBotMsg('Bağlantı xətası.');
  } finally {
    input.disabled = false;
    input.focus();
  }
}

document.getElementById('ai-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});

// ============================================================
// PWA / SERVICE WORKER
// ============================================================
if ("serviceWorker" in navigator) { navigator.serviceWorker.register("sw.js"); }

let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById("installBanner").classList.add("visible");
});

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => { deferredPrompt = null; dismissBanner(); });
  }
}

function dismissBanner() { document.getElementById("installBanner").classList.remove("visible"); }
window.addEventListener("appinstalled", dismissBanner);

// ============================================================
// TEST SİSTEMİ
// ============================================================


// ── TEST STATE ───────────────────────────────────────────────
let testState = {
  initialized: false,
  selectedSubject: null,
  selectedCount: 10,
  currentQuiz: [],
  userAnswers: [],
  currentIndex: 0,
  timerInterval: null,
  timeLeft: 0
};

// ── INIT ─────────────────────────────────────────────────────
function initTestSystem() {
  if (testState.initialized) return;
  testState.initialized = true;
  renderTestSubjects();
}

function renderTestSubjects() {
  const grid = document.getElementById('testSubjectGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const icons = { "Mühasibat Uçotu": "📊", "İqtisadiyyat": "📈", "Marketinq": "🎯", "Menеcment": "🏛" };
  Object.keys(QUESTION_BANK).forEach(subject => {
    const count = QUESTION_BANK[subject].length;
    const btn = document.createElement('button');
    btn.className = 'test-subject-btn';
    btn.setAttribute('data-subject', subject);
    btn.innerHTML = `
      <span class="tsb-icon">${icons[subject] || '📚'}</span>
      <span class="tsb-name">${subject}</span>
      <span class="tsb-count">${count} sual</span>
    `;
    btn.onclick = () => selectSubject(subject, btn);
    grid.appendChild(btn);
  });
}

function selectSubject(subject, btn) {
  document.querySelectorAll('.test-subject-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  testState.selectedSubject = subject;

  const config = document.getElementById('testConfigSection');
  const info   = document.getElementById('testSelectedInfo');
  const total  = QUESTION_BANK[subject].length;

  info.innerHTML = `<span class="tsi-label">Seçildi:</span> <strong>${subject}</strong> · <span class="tsi-count">${total} sual mövcuddur</span>`;

  // Disable count buttons if not enough questions
  document.querySelectorAll('.test-count-btn').forEach(b => {
    const n = parseInt(b.dataset.count);
    b.disabled = n > total;
    if (n > total) b.classList.add('disabled');
    else b.classList.remove('disabled');
  });

  // Auto select valid count
  const activeBtn = document.querySelector('.test-count-btn.active:not(.disabled)');
  if (!activeBtn) {
    const first = document.querySelector('.test-count-btn:not(.disabled)');
    if (first) { first.classList.add('active'); testState.selectedCount = parseInt(first.dataset.count); }
  }

  config.style.display = '';
  config.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function selectCount(btn) {
  document.querySelectorAll('.test-count-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  testState.selectedCount = parseInt(btn.dataset.count);
}

// ── START TEST ───────────────────────────────────────────────
function startTest() {
  const subject = testState.selectedSubject;
  const count   = testState.selectedCount;
  if (!subject) return;

  const pool = QUESTION_BANK[subject];
  if (pool.length < count) {
    alert(`Yalnız ${pool.length} sual mövcuddur. Sual sayını azaldın.`);
    return;
  }

  // Shuffle questions and slice
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);

  // Shuffle options once per question, update answer index accordingly
  testState.currentQuiz = shuffled.map(q => {
    const optionsWithIndex = q.options.map((opt, i) => ({ opt, i }));
    optionsWithIndex.sort(() => Math.random() - 0.5);
    return {
      question: q.question,
      options: optionsWithIndex.map(o => o.opt),
      answer: optionsWithIndex.findIndex(o => o.i === q.answer)
    };
  });
  testState.userAnswers   = new Array(count).fill(null);
  testState.currentIndex  = 0;

  // Timer: 1 dəq per question
  testState.timeLeft = count * 60;

  document.getElementById('test-landing').style.display = 'none';
  document.getElementById('test-result').style.display  = 'none';
  document.getElementById('test-quiz').style.display    = '';

  document.getElementById('qTotalNum').textContent = count;
  renderQuizQuestion();
  startTimer();
}

// ── TIMER ────────────────────────────────────────────────────
function startTimer() {
  clearInterval(testState.timerInterval);
  updateTimerDisplay();
  testState.timerInterval = setInterval(() => {
    testState.timeLeft--;
    updateTimerDisplay();
    if (testState.timeLeft <= 0) {
      clearInterval(testState.timerInterval);
      finishTest();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(testState.timeLeft / 60);
  const s = testState.timeLeft % 60;
  const display = document.getElementById('timerDisplay');
  if (display) {
    display.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    const timerEl = document.getElementById('testTimer');
    if (testState.timeLeft <= 60) timerEl.classList.add('timer-urgent');
    else timerEl.classList.remove('timer-urgent');
  }
}

// ── RENDER QUESTION ──────────────────────────────────────────
function renderQuizQuestion() {
  const idx = testState.currentIndex;
  const q   = testState.currentQuiz[idx];
  const total = testState.currentQuiz.length;

  document.getElementById('qCurrentNum').textContent = idx + 1;

  // Progress bar
  const pct = ((idx + 1) / total) * 100;
  document.getElementById('testProgressFill').style.width = pct + '%';

  document.getElementById('testQNumber').textContent = `Sual ${idx + 1}`;
  document.getElementById('testQText').textContent = q.question;

  const optContainer = document.getElementById('testOptions');
  optContainer.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D', 'E'];

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'test-option-btn';
    if (testState.userAnswers[idx] === i) btn.classList.add('selected');
    btn.innerHTML = `<span class="tob-letter">${letters[i]}</span><span class="tob-text">${opt}</span>`;
    btn.onclick = () => selectAnswer(i);
    optContainer.appendChild(btn);
  });

  // Nav buttons
  const prevBtn   = document.getElementById('testPrevBtn');
  const nextBtn   = document.getElementById('testNextBtn');
  const finishBtn = document.getElementById('testFinishBtn');

  prevBtn.style.display   = idx === 0 ? 'none' : '';
  nextBtn.style.display   = idx === total - 1 ? 'none' : '';
  finishBtn.style.display = idx === total - 1 ? '' : 'none';

  updateAnsweredInfo();
}

function selectAnswer(optIndex) {
  testState.userAnswers[testState.currentIndex] = optIndex;
  document.querySelectorAll('.test-option-btn').forEach((btn, i) => {
    btn.classList.toggle('selected', i === optIndex);
  });
  updateAnsweredInfo();

  // Auto advance after 400ms if not last question
  if (testState.currentIndex < testState.currentQuiz.length - 1) {
    setTimeout(() => quizNav(1), 380);
  }
}

function updateAnsweredInfo() {
  const answered = testState.userAnswers.filter(a => a !== null).length;
  const total = testState.currentQuiz.length;
  const el = document.getElementById('testAnsweredInfo');
  if (el) el.textContent = `${answered} / ${total} sual cavablandı`;
}

function quizNav(dir) {
  const newIdx = testState.currentIndex + dir;
  if (newIdx < 0 || newIdx >= testState.currentQuiz.length) return;
  testState.currentIndex = newIdx;

  const card = document.getElementById('testQuestionCard');
  card.classList.add('quiz-slide-out');
  setTimeout(() => {
    renderQuizQuestion();
    card.classList.remove('quiz-slide-out');
    card.classList.add('quiz-slide-in');
    setTimeout(() => card.classList.remove('quiz-slide-in'), 300);
  }, 150);
}

function confirmFinishTest() {
  const unanswered = testState.userAnswers.filter(a => a === null).length;
  if (unanswered > 0 && !confirm(`${unanswered} sual cavabsız qalıb. Yenə də bitirmək istəyirsiniz?`)) return;
  finishTest();
}

// ── FINISH ───────────────────────────────────────────────────
function finishTest() {
  clearInterval(testState.timerInterval);

  let correct = 0;
  testState.currentQuiz.forEach((q, i) => {
    if (testState.userAnswers[i] === q.answer) correct++;
  });
  const total   = testState.currentQuiz.length;
  const pct     = Math.round((correct / total) * 100);
  const wrong   = total - correct - testState.userAnswers.filter(a => a === null).length;
  const skipped = testState.userAnswers.filter(a => a === null).length;

  document.getElementById('test-quiz').style.display   = 'none';
  document.getElementById('test-result').style.display = '';

  // Emoji & title
  let emoji, title;
  if (pct >= 90)      { emoji = '🏆'; title = 'Əla nəticə!'; }
  else if (pct >= 75) { emoji = '🎉'; title = 'Yaxşı nəticə!'; }
  else if (pct >= 50) { emoji = '👍'; title = 'Orta nəticə'; }
  else                { emoji = '📚'; title = 'Daha çox məşq lazımdır'; }

  document.getElementById('resultEmoji').textContent   = emoji;
  document.getElementById('resultTitle').textContent   = title;
  document.getElementById('resultScore').textContent   = `${correct} / ${total}`;
  document.getElementById('resultPercent').textContent = `${pct}%`;
  document.getElementById('resultStats').innerHTML =
    `<span class="rs-correct">✓ ${correct} düzgün</span>` +
    `<span class="rs-wrong">✗ ${wrong} yanlış</span>` +
    (skipped ? `<span class="rs-skip">– ${skipped} keçildi</span>` : '');

  // Animate bar
  setTimeout(() => {
    const bar = document.getElementById('resultBarFill');
    if (bar) {
      bar.style.width = pct + '%';
      bar.style.background = pct >= 75 ? 'var(--accent2)' : pct >= 50 ? 'var(--accent)' : '#ef4444';
    }
  }, 100);

  // Review
  renderReview();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderReview() {
  const list = document.getElementById('testReviewList');
  list.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D', 'E'];

  testState.currentQuiz.forEach((q, i) => {
    const ua = testState.userAnswers[i];
    const isCorrect = ua === q.answer;
    const isSkipped = ua === null;

    const card = document.createElement('div');
    card.className = `review-item ${isCorrect ? 'ri-correct' : isSkipped ? 'ri-skip' : 'ri-wrong'}`;

    let optHtml = '';
    q.options.forEach((opt, j) => {
      let cls = 'ro-opt';
      if (j === q.answer) cls += ' ro-correct';
      else if (j === ua && !isCorrect) cls += ' ro-wrong';
      optHtml += `<div class="${cls}"><span class="ro-letter">${letters[j]}</span>${opt}</div>`;
    });

    card.innerHTML = `
      <div class="ri-header">
        <span class="ri-num">${i + 1}</span>
        <span class="ri-badge">${isCorrect ? '✓ Düzgün' : isSkipped ? '— Keçildi' : '✗ Yanlış'}</span>
      </div>
      <div class="ri-question">${q.question}</div>
      <div class="ri-options">${optHtml}</div>
    `;
    list.appendChild(card);
  });
}

// ── RESET ────────────────────────────────────────────────────
function resetTest() {
  clearInterval(testState.timerInterval);
  testState.currentQuiz  = [];
  testState.userAnswers  = [];
  testState.currentIndex = 0;

  document.getElementById('test-quiz').style.display   = 'none';
  document.getElementById('test-result').style.display = 'none';
  document.getElementById('test-landing').style.display = '';

  // Reset progress bar fill
  const fill = document.getElementById('resultBarFill');
  if (fill) fill.style.width = '0%';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
