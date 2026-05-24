/* =============================================================
   CURRICULUM.JS  –  İxtisas Planı Modulu
   UNEC tələbəsi üçün semestr fənn cədvəli + localStorage
   ============================================================= */

const CURRICULUM_DATA = {
  economics: {
    name: 'İqtisadiyyat',
    icon: '📈',
    semester1: [
      { name: 'Azərbaycanın tarixi', credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xətti cəbr və riyazi analiz',      credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İKT - baza komputer bilikləri',       credit: 8, hours: 60, absenceLimit: 7, weekly: 3 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1',      credit: 4, hours: 60, absenceLimit: 7,  weekly: 4 },
      { name: 'Karyera planlaması',             credit: 5, hours: 30, absenceLimit: 3,  weekly: 2 },
    ],
    semester2: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 3, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Ehtimal nəzəriyyəsi və riyazi statistika',     credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İqtisadiyyata giriş', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2',     credit: 3, hours: 75, absenceLimit: 9,  weekly: 5 },
      { name: 'Yumşaq bacarıqlar (Soft skills)',          credit: 9, hours: 30, absenceLimit: 3,  weekly: 2 },
    ],
    semester3: [
      { name: 'Ətraf mühitin iqtisadiyyatı', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Əməyin iqtisadiyyatı',     credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Mikroiqtisadiyyat', credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3',     credit: 4, hours: 90, absenceLimit: 11,  weekly: 6 },
      { name: 'Qiymət siyasəti',          credit: 6, hours: 60, absenceLimit: 7,  weekly: 4 },
    ],
     semester4: [
      { name: 'Azərbaycan iqtisadiyyatı', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İqtisadi fikir tarixi',     credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Makroiqtisadiyyat', credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4',     credit: 4, hours: 75, absenceLimit: 9,  weekly: 5 },
      { name: 'Maliyyə uçotu',          credit: 6, hours: 60, absenceLimit: 7,  weekly: 4 },
    ]
  },
  finance: {
    name: 'Maliyyə',
    icon: '💰',
    semester1: [
      { name: 'Maliyyə əsasları',  credit: 6, hours: 60, absenceLimit: 15, weekly: 4 },
      { name: 'Mikroiqtisadiyyat', credit: 5, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Riyaziyyat I',      credit: 5, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Azərbaycan dili',   credit: 3, hours: 30, absenceLimit: 9,  weekly: 2 },
      { name: 'Xarici dil I',      credit: 3, hours: 30, absenceLimit: 9,  weekly: 2 },
      { name: 'İnformatika',       credit: 4, hours: 45, absenceLimit: 13, weekly: 3 },
    ],
    semester2: [
      { name: 'Korporativ maliyyə', credit: 6, hours: 60, absenceLimit: 15, weekly: 4 },
      { name: 'Makroiqtisadiyyat',  credit: 5, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Riyaziyyat II',      credit: 4, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Mühasibat uçotu',    credit: 5, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Xarici dil II',      credit: 3, hours: 30, absenceLimit: 9,  weekly: 2 },
      { name: 'Statistika',         credit: 3, hours: 30, absenceLimit: 9,  weekly: 2 },
    ]
  },
  accounting: {
    name: 'Mühasibat',
    icon: '📊',
    semester1: [
      { name: 'Mühasibat uçotunun əsasları', credit: 6, hours: 60, absenceLimit: 15, weekly: 4 },
      { name: 'İqtisad nəzəriyyəsi',         credit: 5, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Riyaziyyat I',                credit: 5, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'İnformatika',                 credit: 4, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Azərbaycan dili',             credit: 3, hours: 30, absenceLimit: 9,  weekly: 2 },
      { name: 'Xarici dil I',                credit: 3, hours: 30, absenceLimit: 9,  weekly: 2 },
    ],
    semester2: [
      { name: 'Maliyyə uçotu',          credit: 6, hours: 60, absenceLimit: 15, weekly: 4 },
      { name: 'Vergilər və vergitutma', credit: 5, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Statistika',             credit: 4, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Makroiqtisadiyyat',      credit: 4, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Xarici dil II',          credit: 3, hours: 30, absenceLimit: 9,  weekly: 2 },
      { name: 'Fəlsəfə',               credit: 3, hours: 30, absenceLimit: 9,  weekly: 2 },
    ]
  },
  management: {
    name: 'Menecment',
    icon: '🏢',
    semester1: [
      { name: 'İdarəetmə əsasları',  credit: 6, hours: 60, absenceLimit: 15, weekly: 4 },
      { name: 'Mikroiqtisadiyyat',   credit: 5, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Hüquq əsasları',      credit: 4, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Riyaziyyat I',        credit: 4, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Azərbaycan dili',     credit: 3, hours: 30, absenceLimit: 9,  weekly: 2 },
      { name: 'Xarici dil I',        credit: 3, hours: 30, absenceLimit: 9,  weekly: 2 },
    ],
    semester2: [
      { name: 'Strateji menecment',  credit: 6, hours: 60, absenceLimit: 15, weekly: 4 },
      { name: 'Makroiqtisadiyyat',   credit: 5, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Marketinq əsasları',  credit: 4, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Mühasibat uçotu',     credit: 4, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Xarici dil II',       credit: 3, hours: 30, absenceLimit: 9,  weekly: 2 },
      { name: 'Statistika',          credit: 3, hours: 30, absenceLimit: 9,  weekly: 2 },
    ]
  },
  marketing: {
    name: 'Marketinq',
    icon: '📣',
    semester1: [
      { name: 'Marketinq əsasları',   credit: 6, hours: 60, absenceLimit: 15, weekly: 4 },
      { name: 'Mikroiqtisadiyyat',    credit: 5, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'İnformatika',          credit: 4, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Riyaziyyat I',         credit: 4, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Azərbaycan dili',      credit: 3, hours: 30, absenceLimit: 9,  weekly: 2 },
      { name: 'Xarici dil I',         credit: 3, hours: 30, absenceLimit: 9,  weekly: 2 },
    ],
    semester2: [
      { name: 'Rəqəmsal marketinq',   credit: 6, hours: 60, absenceLimit: 15, weekly: 4 },
      { name: 'İstehlakçı davranışı', credit: 5, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Makroiqtisadiyyat',    credit: 4, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Statistika',           credit: 4, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Xarici dil II',        credit: 3, hours: 30, absenceLimit: 9,  weekly: 2 },
      { name: 'PR əsasları',          credit: 3, hours: 30, absenceLimit: 9,  weekly: 2 },
    ]
  },
  banking: {
    name: 'Bank işi',
    icon: '🏦',
    semester1: [
      { name: 'Bank işinin əsasları',  credit: 6, hours: 60, absenceLimit: 15, weekly: 4 },
      { name: 'Mikroiqtisadiyyat',     credit: 5, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Maliyyə riyaziyyatı',   credit: 5, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'İnformatika',           credit: 3, hours: 30, absenceLimit: 9,  weekly: 2 },
      { name: 'Azərbaycan dili',       credit: 3, hours: 30, absenceLimit: 9,  weekly: 2 },
      { name: 'Xarici dil I',          credit: 3, hours: 30, absenceLimit: 9,  weekly: 2 },
    ],
    semester2: [
      { name: 'Kredit əməliyyatları',  credit: 6, hours: 60, absenceLimit: 15, weekly: 4 },
      { name: 'Makroiqtisadiyyat',     credit: 5, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Pul və bank nəzəriyyəsi', credit: 5, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Mühasibat uçotu',       credit: 4, hours: 45, absenceLimit: 13, weekly: 3 },
      { name: 'Xarici dil II',         credit: 3, hours: 30, absenceLimit: 9,  weekly: 2 },
      { name: 'Statistika',            credit: 2, hours: 30, absenceLimit: 9,  weekly: 2 },
    ]
  }
};

// ── localStorage ─────────────────────────────────────────────
const CURR_LS_KEY = 'unec_selected_specialty';

function getSavedSpecialty() {
  try { return localStorage.getItem(CURR_LS_KEY) || null; } catch { return null; }
}
function saveSpecialty(spec) {
  try { localStorage.setItem(CURR_LS_KEY, spec); } catch {}
}
function clearSavedSpecialty() {
  try { localStorage.removeItem(CURR_LS_KEY); } catch {}
}

// ── Render ───────────────────────────────────────────────────
function selectSpecialty(spec) {
  const data = CURRICULUM_DATA[spec];
  if (!data) return;
  saveSpecialty(spec);

  // Buttons highlight
  document.querySelectorAll('.curr-specialty-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.spec === spec);
  });

  // Badge
  document.getElementById('currSpecBadge').innerHTML =
    `${data.icon} <strong>${data.name}</strong>`;

  // Fill tables
  renderSemesterTable('s1', data.semester1);
  renderSemesterTable('s2', data.semester2);

  // Show/hide
  document.getElementById('currEmptyState').style.display = 'none';
  document.getElementById('currPlanPanel').style.display = '';

  // Animate in
  document.getElementById('currPlanPanel').classList.remove('curr-panel-in');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.getElementById('currPlanPanel').classList.add('curr-panel-in');
    });
  });
}

function renderSemesterTable(semKey, subjects) {
  const tbody = document.getElementById(`curr-tbody-${semKey}`);
  const statsEl = document.getElementById(`curr-s${semKey.replace('s','')}-stats`);
  if (!tbody) return;

  const totalCredits = subjects.reduce((a, s) => a + s.credit, 0);
  const totalHours   = subjects.reduce((a, s) => a + s.hours, 0);
  const totalWeekly  = subjects.reduce((a, s) => a + s.weekly, 0);

  if (statsEl) {
    statsEl.innerHTML =
      `<span class="curr-stat-pill">${totalCredits} kredit</span>` +
      `<span class="curr-stat-pill">${totalHours} saat</span>` +
      `<span class="curr-stat-pill">${totalWeekly} h/həftə</span>`;
  }

  tbody.innerHTML = subjects.map((s, i) => `
    <tr style="animation-delay:${i * 40}ms" class="curr-row-in">
      <td class="curr-td-name">${s.name}</td>
      <td><span class="curr-badge curr-badge--credit">${s.credit}</span></td>
      <td><span class="curr-badge curr-badge--hours">${s.hours}</span></td>
      <td><span class="curr-badge curr-badge--absence ${s.absenceLimit <= 9 ? 'warn' : ''}">${s.absenceLimit}</span></td>
      <td><span class="curr-badge curr-badge--weekly">${s.weekly}</span></td>
    </tr>
  `).join('');
}

function clearSpecialty() {
  clearSavedSpecialty();
  document.querySelectorAll('.curr-specialty-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('currPlanPanel').style.display = 'none';
  document.getElementById('currEmptyState').style.display = '';
}

// ── İlk açılışda localStorage'dan yüklə ─────────────────────
function initCurriculum() {
  const saved = getSavedSpecialty();
  if (saved && CURRICULUM_DATA[saved]) {
    selectSpecialty(saved);
  }
}

// Tab keçidlərini dinlə
document.addEventListener('DOMContentLoaded', function() {
  // switchBottomTab patch: curriculum tab açılanda init et
  const orig = window.switchBottomTab;
  if (typeof orig === 'function') {
    window.switchBottomTab = function(tab) {
      orig(tab);
      if (tab === 'curriculum') initCurriculum();
    };
  }
});
