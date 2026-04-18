// ============================================================
// İMTAHAN TİPİNƏ GÖRƏ OTOMATİK QEYDLƏR
// type: "test"   → Elektron-test fənni
// type: "yazili" → Elektron-yazılı fənni
// Hər fənnə data obyektinin içində "type" yazın, qalanını sistem edir.
// ============================================================
const EXAM_NOTES = {
  test: [
    "🖥️ Bu fənn <strong>Elektron-Test</strong> formatındadır.",
    "🔀 Sualların sırası fərqli ola bilər. Cavabları sıraya görə deyil, mənaya görə öyrənin.",
    "⚠️ Materiallardakı cavablar köhnə ola bilər, müəllimin dediyi mövzularla müqayisə edin.",
    "💡 Bütün variantları nəzərdən keçirin, tələ suallarına diqqət edin."
  ],
  yazili: [
    "✍️ Bu fənn <strong>Elektron-Yazılı</strong> formatındadır.",
    "📝 Cavablarınızı tam, əsaslandırılmış və ən önəmlisi fərqli şəkildə yazmağa diqqət göstərin.",
    "⚠️ Materiallardakı suallar köhnə ola bilər, sillabusunuzla mütləq uyğunlaşdırın.",
    "💡 Əlavə mənbələrdən də istifadə etməyi tövsiyə edirik."
  ]
};

// ============================================================
// DATA
// Hər fənnə mütləq "type" yazın: "test" və ya "yazili"
// subjects altında: { type: "test", pdfs: [...] }
// ============================================================
const data = {
  "1-ci kurs": {
    icon: "📘",
    subjects: {
      "Xətti cəbr və riyazi analiz": {
        type: "test",
        pdfs: [
          { name: "Xətti Cəbr və Riyazi Analiz Q26", file: "xcraQ26.pdf" }
        ]
      },
      "İKT - Baza kompüter bilikləri": {
        type: "test",
        pdfs: [
          { name: "İKT - Baza Kompüter Bilikləri Q26", file: "iktQ26.pdf" }
        ]
      },
      "Azərbaycanın tarixi": {
        type: "test",
        pdfs: [
          { name: "Azərbaycanın Tarixi Q26", file: "aztarixiQ26.pdf" }
        ]
      },
      "Karyera planlaması": {
        type: "test",
        pdfs: [
          { name: "Karyera Planlaması Q26", file: "karyeraQ26.pdf" }
        ]
      },
      "Xarici dildə işgüzar və akademik kommunikasiya A1": {
        type: "test",
        pdfs: [
          { name: "White Death A1", file: "whitedeathA1.pdf" }
        ]
      },
      "Ehtimal nəzəriyyəsi və riyazi statistika": {
        type: "yazili",
        pdfs: [
          { name: "Ehtimal Nəzəriyyəsi və Riyazi Statistika Y25", file: "enrsY25.pdf" },
          { name: "Ehtimal Nəzəriyyəsi və Riyazi Statistika Y23", file: "enrsY23.pdf" }
        ]
      },
      "Xarici dildə işgüzar və akademik kommunikasiya A2": {
        type: "test",
        pdfs: [
          { name: "Robinson Crusoe A2", file: "robinsoncrusoeA2.pdf" }
        ]
      },
      "Azərbaycan dilində işgüzar və akademik kommunikasiya": {
        type: "test",
        pdfs: [
          { name: "ADİAK Q26", file: "adiakQ26.pdf" },
          { name: "ADİAK Y25", file: "adiakY25.pdf" },
          { name: "ADİAK Y23", file: "adiakY23.pdf" }
        ]
      },
      "Yumşaq bacarıqlar (Soft skills)": {
        type: "test",
        pdfs: [
          { name: "Soft Skills Y25", file: "softskillsY25.pdf" }
        ]
      },
      "İqtisadiyyata giriş": {
        type: "yazili",
        pdfs: [
          { name: "İqtisadiyyata Giriş - 1", file: "iqtisadiyyat1.pdf" }
        ]
      },
      "Liner cebir ve matematiksel analiz": {
        type: "test",
        pdfs: [
          { name: "Liner Cebir ve Matematiksel Analiz Q26", file: "lcmaQ26.pdf" },
          { name: "Liner Cebir ve Matematiksel Analiz Q23", file: "lcmaQ23.pdf" }
        ]
      },
      "Azerbaycanın tarihi": {
        type: "test",
        pdfs: [
          { name: "Azerbaycanın Tarihi Q26", file: "aztarihiQ26.pdf" },
          { name: "Azerbaycanın Tarihi Q25", file: "aztarihiQ25.pdf" }
        ]
      },
      "Bilgi işlem teknolojileri": {
        type: "test",
        pdfs: [
          { name: "Bilgi İşlem Teknolojileri - 1", file: "bit1.pdf" }
        ]
      },
      "Yönetim ve organizasyon": {
        type: "test",
        pdfs: [
          { name: "Yönetim ve Organizasyon Q25", file: "yonetimorganizasyonQ25.pdf" }
        ]
      }
    }
  },
  "2-ci kurs": {
    icon: "📗",
    subjects: {
      "Mikroiqtisadiyyat": {
        type: "yazili",
        pdfs: [
          { name: "Mikroiqtisadiyyat - 1", file: "mikroiqt1.pdf" },
          { name: "Mikroiqtisadiyyat - 2", file: "mikroiqt2.pdf" },
          { name: "Mikroiqtisadiyyat - 3", file: "mikroiqt3.pdf" },
          { name: "Mikroiqtisadiyyat - 1 - Məsələlər", file: "mikroiqtmesele1.pdf" },
          { name: "Mikroiqtisadiyyat - 2 - Məsələlər", file: "mikroiqtmesele2.pdf" }
        ]
      },
      "Qiymət siyasəti": {
        type: "yazili",
        pdfs: [
          { name: "Qiymət Siyasəti", file: "qiymet1.pdf" }
        ]
      },
      "Əməyin iqtisadiyyatı": {
        type: "yazili",
        pdfs: [
          { name: "Əməyin İqtisadiyyatı - 1", file: "emek1.pdf" },
          { name: "Əməyin İqtisadiyyatı - 1 - Kollekvium", file: "emekkollek1.pdf" }
        ]
      },
      "Ətraf mühitin iqtisadiyyatı": {
        type: "yazili",
        pdfs: [
          { name: "Ətraf Mühitin İqtisadiyyatı - 1", file: "emi1.pdf" },
          { name: "Ətraf Mühitin İqtisadiyyatı - 2", file: "emi2.pdf" },
          { name: "Ətraf Mühitin İqtisadiyyatı - 1 - Kollekvium", file: "emikollek1.pdf" },
          { name: "Ətraf Mühitin İqtisadiyyatı - 2 - Kollekvium", file: "emikollek2.pdf" }
        ]
      },
      "Azərbaycan iqtisadiyyatı": {
        type: "yazili",
        pdfs: [
          { name: "Azərbaycan İqtisadiyyatı - 1", file: "aziqt1.pdf" },
          { name: "Azərbaycan İqtisadiyyatı - 2", file: "aziqt2.pdf" },
          { name: "Azərbaycan İqtisadiyyatı - 3", file: "aziqt3.pdf" }
        ]
      },
      "Makroiqtisadiyyat": {
        type: "yazili",
        pdfs: [
          { name: "Makroiqtisadiyyat - 1", file: "makroiqt1.pdf" },
          { name: "Makroiqtisadiyyat - 1 - Məsələlər", file: "makroiqtmesele1.pdf" }
        ]
      },
      "Maliyyə uçotu": {
        type: "test",
        pdfs: [
          { name: "Maliyyə Uçotu Q26", file: "maliyyeQ26.pdf" }
        ]
      },
      "İqtisadi fikir tarixi": {
        type: "yazili",
        pdfs: [
          { name: "İqtisadi Fikir Tarixi - 1", file: "iqtfkrtrx1.pdf" },
          { name: "İqtisadi Fikir Tarixi - 2", file: "iqtfkrtrx2.pdf" },
          { name: "İqtisadi Fikir Tarixi - 3", file: "iqtfkrtrx3.pdf" }
        ]
      }
    }
  },
  "3-cü kurs": {
    icon: "📙",
    subjects: {
      "Maliyyə": {
        type: "yazili",
        pdfs: [
          { name: "Finance — Əsas material", file: "Finance.pdf" }
        ]
      }
    }
  },
  "4-cü kurs": {
    icon: "📕",
    subjects: {
      "Menecment": {
        type: "test",
        pdfs: [
          { name: "Management material", file: "Manage.pdf" }
        ]
      }
    }
  }
};

const EXTRAS_BASE = "/unecimtahanmateriallari/pdf-extra/";

const extrasData = {
  "1-ci kurs": [
    { name: "Ehtimal nəzəriyyəsi və riyazi statistika - Kollekvium", file: "enrskollektaplarla1.pdf", desc: "Bir çox testin yanında həlli yolu var" }
  ],
  "2-ci kurs": [
    { name: "Robinson Crusoe - Azərbaycan", file: "robinsonazeA2.pdf", desc: "Robinson Crusoe Azərbaycan dilindəki versiyası" }
  ],
  "3-cü kurs": [
    { name: "Nümunə Material", file: "numune3.pdf", desc: "Əlavə qeydlər" }
  ],
  "4-cü kurs": [
    { name: "Nümunə Material", file: "numune4.pdf", desc: "Əlavə qeydlər" }
  ]
};

// ============================================================
// TƏŞƏKKÜRLƏr DATA
// role: 'code' — kod töhfəçisi, 'pdf' — PDF töhfəçisi
// ============================================================
const thanksData = [
  { name: "Nərimanov Elnur",  initial: "E", role: "code" },
  { name: "Şükürova Güləyar", initial: "G", role: "pdf"  },
  { name: "Hacıyev Tofiq",    initial: "T", role: "pdf"  },
  { name: "İslamlı Həsən",    initial: "H", role: "pdf"  }
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
// FƏNN TİPİ BADGEI
// ============================================================
function getTypeBadgeHTML(type) {
  if (type === 'test')   return `<span class="exam-type-badge exam-type-test">🖥️ Test</span>`;
  if (type === 'yazili') return `<span class="exam-type-badge exam-type-yazili">✍️ Yazılı</span>`;
  return '';
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
    statCourses: "Kurs",
    statSubjects: "Fənn",
    statPdfs: "PDF",
    noFavorites: "Hələ seçilən PDF yoxdur. ★ basaraq əlavə edin.",
    noExtras: "Bu kurs üçün hələ əlavə material yoxdur.",
    footer: "Bu sayt rəsmi deyildir. Yalnız tələbələrin imtahan zamanı materialları daha rahat və əlçatan tapması üçün hazırlanıb."
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
  const searchResultsInfo = document.getElementById('searchResultsInfo');
  let visibleCount = 0;
  cards.forEach(card => {
    const subjectName = card.querySelector('h4').textContent.toLowerCase();
    const matches = !query || subjectName.includes(query);
    card.style.display = matches ? 'flex' : 'none';
    if (matches) visibleCount++;
  });
  if (searchResultsInfo) {
    searchResultsInfo.textContent = query ? `${visibleCount} nəticə tapıldı` : '';
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
  const allPdfs = [];
  if (currentCourse) {
    Object.entries(data[currentCourse].subjects).forEach(([subjectName, subj]) => {
      subj.pdfs.forEach(pdf => {
        const path = 'pdf/' + pdf.file;
        if (favs.includes(path)) allPdfs.push({ name: pdf.name, meta: subjectName, path, color: '' });
      });
    });
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
      <div class="pdf-file-icon" ${item.color ? `style="${item.color}"` : ''}><span>PDF</span></div>
      <div class="pdf-info">
        <div class="pdf-name">${item.name}</div>
        <div class="pdf-meta">${item.meta}</div>
      </div>
      <div class="pdf-actions">
        <button class="fav-btn active" onclick="removeFavAndRefresh('${item.path}')" title="Sil">★</button>
        <a class="pdf-open-btn" href="${BASE}${item.path}" target="_blank">↗ ${t.openPdf}</a>
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
  Object.entries(data[courseName].subjects).forEach(([subjectName, subj], i) => {
    const div = document.createElement('div');
    div.className = 'subject-card animate-in';
    div.innerHTML = `
      <div class="subject-icon">${icons[i % icons.length]}</div>
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
  });
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
// INFO PANEL — imtahan tipinə görə avtomatik notlar
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
    <span>${subjectName}</span>
    ${getTypeBadgeHTML(type)}
    <button class="info-btn" onclick="toggleInfoPanel()" title="Bu fənn haqqında">?</button>
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

  pdfs.forEach(pdf => {
    const isFav = getFavorites().includes('pdf/' + pdf.file);
    const div = document.createElement('div');
    div.className = 'pdf-item animate-in';
    div.innerHTML = `
      <div class="pdf-file-icon"><span>PDF</span></div>
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

  // Xəta Göndər düyməsi — PDF-lərin ən altında
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
// XƏTA BİLDİRİŞ SİSTEMİ
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

  if (ctx)      ctx.textContent    = `${courseName} · ${subjectName}`;
  if (form)     form.classList.remove('hidden');
  if (success)  success.classList.add('hidden');
  if (textarea) textarea.value     = '';
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
    const response = await fetch('/api/send-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course:  reportCourseName,
        subject: reportSubjectName,
        type:    type,
        message: message
      })
    });

    if (response.ok) {
      document.getElementById('report-form').classList.add('hidden');
      document.getElementById('report-success').classList.remove('hidden');
      setTimeout(closeReportModal, 2800);
    } else {
      throw new Error('Server error');
    }
  } catch (err) {
    // Fallback: mailto linki aç
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
// KLAVIATURA — ESC ilə bütün modalları bağla
// ============================================================
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeThanks();
    closeEaster();
    closeReportModal();
  }
});

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
