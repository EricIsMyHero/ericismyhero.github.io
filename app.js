// DATA — hər fənn üçün istədiyiniz qədər PDF əlavə edə bilərsiniz
// Format: "Fənn adı": [ {name: "Fayl adı", file: "fayl.pdf"}, ... ]
// ============================================================
const data = {
  "1-ci kurs": {
    icon: "📘",
    subjects: {
      "Xətti cəbr və riyazi analiz": [
        { name: "Xətti Cəbr və Riyazi Analiz Q26", file: "xcraQ26.pdf" }
      ],
      "İKT - Baza kompüter bilikləri": [
        { name: "İKT - Baza Kompüter Bilikləri Q26", file: "iktQ26.pdf" }
      ],
      "Azərbaycanın tarixi": [
        { name: "Azərbaycanın Tarixi Q26", file: "aztarixiQ26.pdf" }
      ],
      "Karyera planlaması": [
        { name: "Karyera Planlaması Q26", file: "karyeraQ26.pdf" }
      ],
      "Azərbaycan dilində işgüzar və akademik kommunikasiya": [
        { name: "ADİAK Q26", file: "adiakQ26.pdf" },
        { name: "ADİAK Y25", file: "adiakY25.pdf" },
        { name: "ADİAK Y23", file: "adiakY23.pdf" }
      ],
      "Ehtimal nəzəriyyəsi və riyazi statistika": [
        { name: "Ehtimal Nəzəriyyəsi və Riyazi Statistika Y25", file: "enrsY25.pdf" },
        { name: "Ehtimal Nəzəriyyəsi və Riyazi Statistika Y23", file: "enrsY23.pdf" }
      ],
      "Yumşaq bacarıqlar (Soft skills)": [
        { name: "Soft Skills Y25", file: "softskillsY25.pdf" }
      ],
      "İqtisadiyyata giriş": [
        { name: "İqtisadiyyata Giriş - 1", file: "iqtisadiyyat1.pdf" }
      ],
      "Liner cebir ve matematiksel analiz": [
        { name: "Liner Cebir ve Matematiksel Analiz Q26", file: "lcmaQ26.pdf" },
        { name: "Liner Cebir ve Matematiksel Analiz Q23", file: "lcmaQ23.pdf" }
      ],
      "Azerbaycanın tarihi": [
        { name: "Azerbaycanın Tarihi Q26", file: "aztarihiQ26.pdf" },
        { name: "Azerbaycanın Tarihi Q25", file: "aztarihiQ25.pdf" }
      ],
      "Bilgi işlem teknolojileri": [
        { name: "Bilgi İşlem Teknolojileri - 1", file: "bit1.pdf" }
      ],
      "Yönetim ve organizasyon": [
        { name: "Yönetim ve Organizasyon Q25", file: "yonetimorganizasyonQ25.pdf" }
      ]
    }
  },
  "2-ci kurs": {
    icon: "📗",
    subjects: {
      "Mikroiqtisadiyyat": [
        { name: "Mikroiqtisadiyyat - 1", file: "mikroiqt1.pdf" },
        { name: "Mikroiqtisadiyyat - 2", file: "mikroiqt2.pdf" },
        { name: "Mikroiqtisadiyyat - 3", file: "mikroiqt3.pdf" },
        { name: "Mikroiqtisadiyyat - 1 - Məsələlər", file: "mikroiqtmesele1.pdf" },
        { name: "Mikroiqtisadiyyat - 2 - Məsələlər", file: "mikroiqtmesele2.pdf" }
      ],
      "Qiymət siyasəti": [
        { name: "Qiymət Siyasəti", file: "qiymet1.pdf" }
      ],
      "Əməyin iqtisadiyyatı": [
        { name: "Əməyin İqtisadiyyatı - 1", file: "emek1.pdf" },
        { name: "Əməyin İqtisadiyyatı - 1 - Kollekvium", file: "emekkollek1.pdf" }
      ],
      "Ətraf mühitin iqtisadiyyatı": [
        { name: "Ətraf Mühitin İqtisadiyyatı - 1", file: "emi1.pdf" },
        { name: "Ətraf Mühitin İqtisadiyyatı - 2", file: "emi2.pdf" },
        { name: "Ətraf Mühitin İqtisadiyyatı - 1 - Kollekvium", file: "emikollek1.pdf" },
        { name: "Ətraf Mühitin İqtisadiyyatı - 2 - Kollekvium", file: "emikollek2.pdf" }
      ],
      "Azərbaycan iqtisadiyyatı": [
        { name: "Azərbaycan İqtisadiyyatı - 1", file: "aziqt1.pdf" },
        { name: "Azərbaycan İqtisadiyyatı - 2", file: "aziqt2.pdf" },
        { name: "Azərbaycan İqtisadiyyatı - 3", file: "aziqt3.pdf" }
      ],
      "Makroiqtisadiyyat": [
        { name: "Makroiqtisadiyyat - 1", file: "makroiqt1.pdf" },
        { name: "Makroiqtisadiyyat - 1 - Məsələlər", file: "makroiqtmesele1.pdf" }
      ],
      "Maliyyə uçotu": [
        { name: "Maliyyə Uçotu Q26", file: "maliyyeQ26.pdf" }
      ],
      "İqtisadi fikir tarixi": [
        { name: "İqtisadi Fikir Tarixi", file: "iqtfkrtrx.pdf" }
      ]
    }
  },
  "3-cü kurs": {
    icon: "📙",
    subjects: {
      "Maliyyə": [
        { name: "Finance — Əsas material", file: "Finance.pdf" }
      ]
    }
  },
  "4-cü kurs": {
    icon: "📕",
    subjects: {
      "Menecment": [
        { name: "Management material", file: "Manage.pdf" }
      ]
    }
  }
};

const EXTRAS_BASE = "/unecimtahanmateriallari/pdf-extra/";

const extrasData = {
  "1-ci kurs": [
    { name: "Nümunə Material", file: "numune1.pdf", desc: "Əlavə qeydlər" }
  ],
  "2-ci kurs": [
    { name: "Nümunə Material", file: "numune2.pdf", desc: "Əlavə qeydlər" }
  ],
  "3-cü kurs": [
    { name: "Nümunə Material", file: "numune3.pdf", desc: "Əlavə qeydlər" }
  ],
  "4-cü kurs": [
    { name: "Nümunə Material", file: "numune4.pdf", desc: "Əlavə qeydlər" }
  ]
};
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
    searchPlaceholder: "PDF axtar...",
    searchResults: "Axtarış Nəticələri",
    noResults: "Heç bir nəticə tapılmadı",
    back1: "Kurslara qayıt",
    back2: "Fənlərə qayıt",
    bcHome: "Ana səhifə",
    subjects: "fənn",
    pdfs: "material",
    openPdf: "Aç",
    statCourses: "Kurs",
    statSubjects: "Fənn",
    statPdfs: "PDF",
    noFavorites: "Hələ seçilən PDF yoxdur. ★ basaraq əlavə edin.",
    noExtras: "Bu kurs üçün hələ əlavə material yoxdur.",
    footer: "Bu sayt rəsmi deyil. Yalnız tələbələrin imtahan zamanı materialları daha rahat və əlçatan tapması üçün hazırlanıb."
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
    searchPlaceholder: "Search PDFs...",
    searchResults: "Search Results",
    noResults: "No results found",
    back1: "Back to Courses",
    back2: "Back to Subjects",
    bcHome: "Home",
    subjects: "subjects",
    pdfs: "files",
    openPdf: "Open",
    statCourses: "Courses",
    statSubjects: "Subjects",
    statPdfs: "PDFs",
    noFavorites: "No favorites yet. Tap ★ to add one.",
    noExtras: "No extra materials for this course yet.",
    footer: "This site is unofficial. Created to help students find exam materials more easily."
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
  document.querySelectorAll('.theme-opt').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function toggleThemePanel() {
  document.getElementById('theme-panel').classList.toggle('hidden');
}

document.addEventListener('click', function (e) {
  const panel = document.getElementById('theme-panel');
  if (!panel.classList.contains('hidden') &&
      !panel.contains(e.target) &&
      !e.target.closest('.theme-toggle-btn')) {
    panel.classList.add('hidden');
  }
});

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
  // Update search placeholder
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.placeholder = translations[lang].searchPlaceholder;
  }
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
  
  // Update search-related translations
  const searchLabel = document.getElementById('label-search-results');
  if (searchLabel) searchLabel.textContent = t.searchResults;

  // Aktiv dil düyməsini işarələ
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
    subs.forEach(pdfs => totalPdfs += pdfs.length);
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
  
  // Clear search when navigating
  clearSearch();
  
  if (view === 'home') renderCourses();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// AXTARIŞ FUNKSİYASI
// ============================================================

// Get all PDFs from all courses for global search
function getAllPDFs() {
  const allPdfs = [];
  
  Object.entries(data).forEach(([courseName, courseData]) => {
    Object.entries(courseData.subjects).forEach(([subjectName, pdfs]) => {
      pdfs.forEach(pdf => {
        allPdfs.push({
          name: pdf.name,
          file: pdf.file,
          subject: subjectName,
          course: courseName,
          path: 'pdf/' + pdf.file,
          isExtra: false
        });
      });
    });
    
    // Add extras
    (extrasData[courseName] || []).forEach(pdf => {
      allPdfs.push({
        name: pdf.name,
        file: pdf.file,
        subject: pdf.desc || 'Əlavə material',
        course: courseName,
        path: 'pdf-extra/' + pdf.file,
        isExtra: true
      });
    });
  });
  
  return allPdfs;
}

// Search functionality
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  const searchResultsInfo = document.getElementById('searchResultsInfo');
  
  if (!searchInput) return;
  
  // Update placeholder based on language
  searchInput.placeholder = translations[lang].searchPlaceholder;
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    
    // Show/hide clear button
    if (query.length > 0) {
      searchClear.classList.add('visible');
    } else {
      searchClear.classList.remove('visible');
    }
    
    performSearch(query);
  });
  
  // Handle scroll effect for search bar
  const searchContainer = document.getElementById('searchBarContainer');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      searchContainer.classList.add('scrolled');
    } else {
      searchContainer.classList.remove('scrolled');
    }
  });
}

function clearSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  
  if (searchInput) {
    searchInput.value = '';
    searchClear.classList.remove('visible');
    performSearch('');
  }
}

function performSearch(query) {
  const view = getCurrentView();
  const searchResultsSection = document.getElementById('global-search-results');
  const coursesGrid = document.getElementById('courses-grid');
  const labelCourses = document.getElementById('label-courses');
  const searchResultsInfo = document.getElementById('searchResultsInfo');
  
  if (!query) {
    // Clear search - show normal view
    if (searchResultsSection) searchResultsSection.classList.add('hidden');
    if (coursesGrid) coursesGrid.classList.remove('hidden');
    if (labelCourses) labelCourses.classList.remove('hidden');
    if (searchResultsInfo) searchResultsInfo.textContent = '';
    
    // Re-render current view
    if (view === 'home') renderCourses();
    else if (view === 'subjects') renderSubjects(currentCourse);
    else if (view === 'pdfs') openPDFs(currentSubject);
    
    return;
  }
  
  // Only show global search on home view
  if (view !== 'home') {
    // Filter current view
    filterCurrentView(query);
    return;
  }
  
  // Global search on home
  const allPdfs = getAllPDFs();
  const results = allPdfs.filter(pdf => 
    pdf.name.toLowerCase().includes(query) ||
    pdf.subject.toLowerCase().includes(query) ||
    pdf.course.toLowerCase().includes(query)
  );
  
  // Show results section, hide courses
  if (searchResultsSection) searchResultsSection.classList.remove('hidden');
  if (coursesGrid) coursesGrid.classList.add('hidden');
  if (labelCourses) labelCourses.classList.add('hidden');
  
  // Update results info
  if (searchResultsInfo) {
    const t = translations[lang];
    searchResultsInfo.textContent = `${results.length} ${results.length === 1 ? 'nəticə' : 'nəticə'} tapıldı`;
  }
  
  // Render results
  renderSearchResults(results, query);
}

function renderSearchResults(results, query) {
  const container = document.getElementById('search-results-list');
  const t = translations[lang];
  
  if (!container) return;
  
  container.innerHTML = '';
  
  if (results.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <div>${t.noResults}</div>
      </div>
    `;
    return;
  }
  
  results.forEach((pdf, index) => {
    const isFav = getFavorites().includes(pdf.path);
    const div = document.createElement('div');
    div.className = 'pdf-item animate-in';
    div.style.animationDelay = `${index * 50}ms`;
    
    // Highlight matching text
    const highlightedName = highlightText(pdf.name, query);
    
    div.innerHTML = `
      <div class="pdf-file-icon" ${pdf.isExtra ? 'style="background:linear-gradient(135deg,#f59e0b,#d97706);"' : ''}>
        <span>PDF</span>
      </div>
      <div class="pdf-info">
        <div class="pdf-name">${highlightedName}</div>
        <div class="pdf-meta">${pdf.course} › ${pdf.subject}</div>
      </div>
      <div class="pdf-actions">
        <button class="fav-btn ${isFav ? 'active' : ''}" 
          onclick="toggleFavorite('${pdf.path}', this)" 
          title="Seçilmişlərə əlavə et">
          ${isFav ? '★' : '☆'}
        </button>
        <a class="pdf-open-btn" href="${BASE}${pdf.path}" target="_blank">
          ↗ ${t.openPdf}
        </a>
      </div>
    `;
    container.appendChild(div);
  });
}

function highlightText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<span class="search-highlight">$1</span>');
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function filterCurrentView(query) {
  const view = getCurrentView();
  
  if (view === 'subjects') {
    // Filter subjects in current course
    const grid = document.getElementById('subjects-grid');
    const cards = grid.querySelectorAll('.subject-card');
    
    cards.forEach(card => {
      const subjectName = card.querySelector('h4').textContent.toLowerCase();
      if (subjectName.includes(query)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  } else if (view === 'pdfs') {
    // Filter PDFs in current subject
    const list = document.getElementById('pdf-items');
    const items = list.querySelectorAll('.pdf-item');
    
    items.forEach(item => {
      const pdfName = item.querySelector('.pdf-name').textContent.toLowerCase();
      if (pdfName.includes(query)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }
}

// ============================================================
// RENDER
// ============================================================
function renderCourses() {
  const t = translations[lang];
  const grid = document.getElementById('courses-grid');
  grid.innerHTML = '';
  Object.entries(data).forEach(([courseName, courseData]) => {
    const subCount = Object.keys(courseData.subjects).length;
    const pdfCount = Object.values(courseData.subjects).reduce((a, b) => a + b.length, 0);
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
  switchTab('subjects'); // hər dəfə fənlər tabından başla
  goTo('subjects');
  renderSubjects(courseName);
}

function switchTab(tab) {
  ['subjects', 'extras', 'favorites'].forEach(t => {
    document.getElementById(`tab-${t}-btn`).classList.toggle('active', t === tab);
    document.getElementById(`tab-${t}-content`).classList.toggle('hidden', t !== tab);
  });
  if (tab === 'favorites') renderFavorites();
  if (tab === 'extras')    renderExtras();
}

function renderExtras() {
  const t = translations[lang];
  const list = document.getElementById('extras-list');
  list.innerHTML = '';
  const items = (extrasData[currentCourse] || []);

  if (items.length === 0) {
    list.innerHTML = `<div class="empty-favs">${t.noExtras}</div>`;
    return;
  }

  items.forEach(pdf => {
    const isFav = getFavorites().includes('pdf-extra/' + pdf.file);
    const div = document.createElement('div');
    div.className = 'pdf-item animate-in';
    div.innerHTML = `
      <div class="pdf-file-icon" style="background:linear-gradient(135deg,#f59e0b,#d97706);">
        <span>PDF</span>
      </div>
      <div class="pdf-info">
        <div class="pdf-name">${pdf.name}</div>
        <div class="pdf-meta">${pdf.desc || pdf.file}</div>
      </div>
      <div class="pdf-actions">
        <button class="fav-btn ${isFav ? 'active' : ''}"
          onclick="toggleFavorite('pdf-extra/${pdf.file}', this)"
          title="Sevimlilərə əlavə et">
          ${isFav ? '★' : '☆'}
        </button>
        <a class="pdf-open-btn" href="${EXTRAS_BASE}${pdf.file}" target="_blank">
          ↗ ${t.openPdf}
        </a>
      </div>
    `;
    list.appendChild(div);
  });
}

function renderFavorites() {
  const t = translations[lang];
  const favs = getFavorites();
  const list = document.getElementById('favorites-list');
  list.innerHTML = '';

  // Cari kursun bütün PDF-lərini (pdf/ + pdf-extra/) yığ
  const allPdfs = [];

  if (currentCourse) {
    // Fənn PDF-ləri
    Object.entries(data[currentCourse].subjects).forEach(([subjectName, pdfs]) => {
      pdfs.forEach(pdf => {
        const path = 'pdf/' + pdf.file;
        if (favs.includes(path)) {
          allPdfs.push({ name: pdf.name, meta: subjectName, path, color: '' });
        }
      });
    });
    // Əlavə materiallar
    (extrasData[currentCourse] || []).forEach(pdf => {
      const path = 'pdf-extra/' + pdf.file;
      if (favs.includes(path)) {
        allPdfs.push({ name: pdf.name, meta: pdf.desc || '📦 Əlavə material', path, color: 'background:linear-gradient(135deg,#f59e0b,#d97706)' });
      }
    });
  }

  if (allPdfs.length === 0) {
    list.innerHTML = `<div class="empty-favs">${t.noFavorites}</div>`;
    return;
  }

  allPdfs.forEach(item => {
    const div = document.createElement('div');
    div.className = 'pdf-item animate-in';
    div.innerHTML = `
      <div class="pdf-file-icon" ${item.color ? `style="${item.color}"` : ''}>
        <span>PDF</span>
      </div>
      <div class="pdf-info">
        <div class="pdf-name">${item.name}</div>
        <div class="pdf-meta">${item.meta}</div>
      </div>
      <div class="pdf-actions">
        <button class="fav-btn active" onclick="removeFavAndRefresh('${item.path}')" title="Sil">★</button>
        <a class="pdf-open-btn" href="${BASE}${item.path}" target="_blank">
          ↗ ${t.openPdf}
        </a>
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

function renderSubjects(courseName) {
  const grid = document.getElementById('subjects-grid');
  grid.innerHTML = '';
  const icons = ['📊','📐','🗓','💡','📝','📈','🔬','⚙️','🎯','📌','🏛','💰','📉','🌿','🔗','📋','🧮','🏆'];
  Object.entries(data[courseName].subjects).forEach(([subjectName, pdfs], i) => {
    const div = document.createElement('div');
    div.className = 'subject-card animate-in';
    div.innerHTML = `
      <div class="subject-icon">${icons[i % icons.length]}</div>
      <div class="subject-info">
        <h4>${subjectName}</h4>
        <div class="pdf-count"><span class="pdf-badge">PDF ${pdfs.length}</span></div>
      </div>
    `;
    div.onclick = () => openPDFs(subjectName);
    grid.appendChild(div);
  });
}

function openPDFs(subjectName) {
  currentSubject = subjectName;
  const t = translations[lang];
  const pdfs = data[currentCourse].subjects[subjectName];

  document.getElementById('bc-subject').textContent        = subjectName;
  document.getElementById('pdf-subject-title').textContent = subjectName;

  const list = document.getElementById('pdf-items');
  list.innerHTML = '';

  pdfs.forEach(pdf => {
    const isFav = getFavorites().includes('pdf/' + pdf.file);
    const div = document.createElement('div');
    div.className = 'pdf-item animate-in';
    div.innerHTML = `
      <div class="pdf-file-icon">
        <span>PDF</span>
      </div>
      <div class="pdf-info">
        <div class="pdf-name">${pdf.name}</div>
        <div class="pdf-meta">${pdf.file}</div>
      </div>
      <div class="pdf-actions">
        <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite('pdf/${pdf.file}', this)" title="Seçilmişlərə əlavə et">
          ${isFav ? '★' : '☆'}
        </button>
        <a class="pdf-open-btn" href="/unecimtahanmateriallari/pdf/${pdf.file}" target="_blank">
          ↗ ${t.openPdf}
        </a>
      </div>
    `;
    list.appendChild(div);
  });

  goTo('pdfs');
}

// ============================================================
// SEVİMLİLƏR + CACHE (universal — pdf/ və pdf-extra/ dəstəklənir)
// filePath → "pdf/iktQ26.pdf" və ya "pdf-extra/cheat.pdf"
// ============================================================
const BASE = "/unecimtahanmateriallari/";

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
  } catch (e) {
    console.warn("Cache xətası:", e);
  }
}

async function removeFromCache(filePath) {
  if (!("caches" in window)) return;
  try {
    const cache = await caches.open("pdf-cache");
    await cache.delete(BASE + filePath);
  } catch (e) {
    console.warn("Cache silmə xətası:", e);
  }
}

// ============================================================
// BAŞLAT
// ============================================================
// Saxlanılmış temanı yüklə
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
initSearch(); // Initialize search functionality
