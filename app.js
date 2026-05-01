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
      progress += 30; // sürətli artım
      fill.style.width = Math.min(progress, 90) + '%';
    }
  }, 100); // ← 400 → 100ms interval

  setTimeout(hidePdfLoading, 4000); // fallback
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
// PDF SƏHİFƏSİ — pdf-top-row wrapper ilə
// ============================================================
function openPDFs(subjectName) {
  currentSubject = subjectName;
  const t = translations[lang];
  const subj = data[currentCourse].subjects[subjectName];
  const pdfs  = subj.pdfs;
  const type  = subj.type;
  const notes = EXAM_NOTES[type] || [];

  document.getElementById('bc-subject').textContent = subjectName;

  // ── Başlıq: ad + "?" eyni sətirdə, badge altında ayrı ──
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

  // Info panel
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

  // PDF siyahısı
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

  // Xəta Göndər düyməsi
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

const res = await fetch("https://ai-server.up.railway.app/api/ask", {
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
const reply = data.reply;
// ============================================================
// BAŞLAT
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
