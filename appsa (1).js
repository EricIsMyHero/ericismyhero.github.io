// ============================================================
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
        { name: "Qiymət Siyasəti", file: "qiymet.pdf" }
      ],
      "Əməyin iqtisadiyyatı": [
        { name: "Əməyin İqtisadiyyatı", file: "emek.pdf" }
      ],
      "Ətraf mühitin iqtisadiyyatı": [
        { name: "Ətraf Mühitin İqtisadiyyatı - 1", file: "emi1.pdf" },
        { name: "Ətraf Mühitin İqtisadiyyatı - 2", file: "emi2.pdf" },
        { name: "Ətraf Mühitin İqtisadiyyatı - 1 - Kollekvium", file: "emikollek1.pdf" },
        { name: "Ətraf Mühitin İqtisadiyyatı - 2 - Kollekvium", file: "emikollek2.pdf" }
      ],
      "Azərbaycan iqtisadiyyatı": [
        { name: "Azərbaycan İqtisadiyyatı", file: "aziqt.pdf" }
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

// ============================================================
const translations = {
  az: {
    badge: "İmtahan Materialları",
    heroTitle: 'UNEC <span>İmtahan</span><br>Materialları',
    heroDesc: "Bütün kurslar üzrə imtahan materiallarına tez çatın. Fənni seçin, PDF-i açın.",
    coursesLabel: "Kurslar",
    subjectsLabel: "Fənlər",
    pdfsLabel: "PDF Materiallar",
    back1: "Kurslara qayıt",
    back2: "Fənlərə qayıt",
    bcHome: "Ana səhifə",
    subjects: "fənn",
    pdfs: "material",
    openPdf: "Aç",
    statCourses: "Kurs",
    statSubjects: "Fənn",
    statPdfs: "PDF",
    footer: "Bu sayt rəsmi deyil. Yalnız tələbələrin imtahan zamanı materialları daha rahat tapması üçün hazırlanıb."
  },
  en: {
    badge: "Exam Materials",
    heroTitle: 'UNEC <span>Exam</span><br>Materials',
    heroDesc: "Quick access to exam materials for all courses. Select a subject, open the PDF.",
    coursesLabel: "Courses",
    subjectsLabel: "Subjects",
    pdfsLabel: "PDF Materials",
    back1: "Back to Courses",
    back2: "Back to Subjects",
    bcHome: "Home",
    subjects: "subjects",
    pdfs: "files",
    openPdf: "Open",
    statCourses: "Courses",
    statSubjects: "Subjects",
    statPdfs: "PDFs",
    footer: "This site is unofficial. Created to help students find exam materials more easily."
  }
};

let lang = 'az';
let currentCourse = null;
let currentSubject = null;

function setLang(l) {
  lang = l;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.lang-btn:${l === 'az' ? 'first' : 'last'}-child`).classList.add('active');
  applyTranslations();
  const view = getCurrentView();
  if (view === 'subjects') renderSubjects(currentCourse);
  else if (view === 'home') renderCourses();
}

function getCurrentView() {
  if (!document.getElementById('view-home').classList.contains('hidden')) return 'home';
  if (!document.getElementById('view-subjects').classList.contains('hidden')) return 'subjects';
  return 'pdfs';
}

function applyTranslations() {
  const t = translations[lang];
  document.getElementById('hero-badge').textContent = t.badge;
  document.getElementById('hero-title').innerHTML = t.heroTitle;
  document.getElementById('hero-desc').textContent = t.heroDesc;
  document.getElementById('label-courses').textContent = t.coursesLabel;
  document.getElementById('label-subjects').textContent = t.subjectsLabel;
  document.getElementById('label-pdfs').textContent = t.pdfsLabel;
  document.getElementById('back1-text').textContent = t.back1;
  document.getElementById('back2-text').textContent = t.back2;
  document.getElementById('bc-home').textContent = t.bcHome;
  document.getElementById('bc-home2').textContent = t.bcHome;
  document.getElementById('stat-courses-label').textContent = t.statCourses;
  document.getElementById('stat-subjects-label').textContent = t.statSubjects;
  document.getElementById('stat-pdfs-label').textContent = t.statPdfs;
  document.getElementById('footer-text').textContent = t.footer;
}

function computeStats() {
  let totalSubjects = 0, totalPdfs = 0;
  Object.values(data).forEach(course => {
    const subs = Object.values(course.subjects);
    totalSubjects += subs.length;
    subs.forEach(pdfs => totalPdfs += pdfs.length);
  });
  document.getElementById('stat-courses').textContent = Object.keys(data).length;
  document.getElementById('stat-subjects').textContent = totalSubjects;
  document.getElementById('stat-pdfs').textContent = totalPdfs;
}

function goTo(view) {
  ['home', 'subjects', 'pdfs'].forEach(v => {
    document.getElementById('view-' + v).classList.add('hidden');
  });
  document.getElementById('view-' + view).classList.remove('hidden');
  if (view === 'home') renderCourses();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

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
  document.getElementById('bc-course').textContent = courseName;
  document.getElementById('bc-course2').textContent = courseName;
  goTo('subjects');
  renderSubjects(courseName);
}

function renderSubjects(courseName) {
  const t = translations[lang];
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

  document.getElementById('bc-subject').textContent = subjectName;
  document.getElementById('pdf-subject-title').textContent = subjectName;

  const list = document.getElementById('pdf-items');
  list.innerHTML = '';

  pdfs.forEach((pdf) => {
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
      <a class="pdf-open-btn" href="pdf/${pdf.file}" target="_blank">
        ↗ ${t.openPdf}
      </a>
    `;
    list.appendChild(div);
  });

  goTo('pdfs');
}

// Init
computeStats();
applyTranslations();
renderCourses();
