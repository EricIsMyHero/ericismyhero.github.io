(function () {
  'use strict';

  const item = (az, en, points, legacy) => ({ az, en, points, legacy,
    price: points ? Math.min(500, Math.max(50, Math.round(points * 3 / 5) * 5)) : 0 });
  const paletteRows = [
    ['default', 'Kampus Göyü', 'Campus Blue', 0, '#17364c', '#326aa1', '#a9d8ff', 0],
    ['green', 'Zərbəçi Yaşılı', 'Honors Green', 22, '#153d32', '#28866c', '#94efb3', 25],
    ['gold', 'Əlaçı Qızılı', 'Scholar Gold', 42, '#4c301c', '#ad6c25', '#ffdc8b', 50],
    ['purple', 'Dekan Bənövşəyisi', 'Dean Purple', 65, '#35244a', '#7c51ae', '#dbb7ff', 75],
    ['neon', 'Kiber Neon', 'Cyber Neon', 100, '#163447', '#227dab', '#6cf3ec', 100],
    ['poppy', 'Xarı Bülbül', 'Crimson Petal', 28, '#4a2532', '#a64666', '#ffa3bb'],
    ['sand', 'İçərişəhər Daşı', 'Old City Sand', 34, '#493627', '#946749', '#ffd3a5'],
    ['wave', 'Xəzər Dalğası', 'Caspian Wave', 46, '#163c4b', '#298a98', '#9df4e8'],
    ['mint', 'Nanə Səhəri', 'Mint Morning', 55, '#294532', '#568843', '#cff5a0'],
    ['plum', 'Mürəkkəb', 'Ink Violet', 72, '#3a2847', '#955993', '#f5b7e4'],
    ['ice', 'Qış İmtahanı', 'Winter Exam', 81, '#2b3b62', '#5579b9', '#d4e7ff'],
    ['ember', 'Alov Qırmızısı', 'Ember Red', 94, '#512b29', '#b45138', '#ffb08a'],
    ['pearl', 'Mirvari', 'Pearl', 108, '#34445b', '#768aa0', '#edf5ff'],
    ['orchid', 'Gecə Orkidesi', 'Night Orchid', 124, '#3c2d56', '#7165b7', '#edc3ff'],
    ['solar', 'Günəş Şəfəqi', 'Solar Dawn', 145, '#53341d', '#b27b37', '#ffef9e'],
    ['baku', 'Bakı Axşamı', 'Baku Dusk', 170, '#233059', '#6553a4', '#ffc2dd']
  ];
  const palettes = Object.fromEntries(paletteRows.map(([id,,,, base, mid, light]) => [id, { base, mid, light }]));
  const collection = {
    character: { boy: item('Oğlan', 'Boy', 0), girl: item('Qız', 'Girl', 0) },
    head: {
      none: item('Açıq saç', 'Bare head', 0, 0),
      glasses: item('Əlaçı eynəyi', 'Honors shades', 0, 0),
      headset: item('Proqramçı qulaqlığı', 'Programmer headset', 18, 25),
      hood: item('Gecə Oxuyan kapüşonu', 'Night Owl hood', 36, 50),
      cap: item('Məzun papağı', 'Graduation cap', 60, 75),
      beanie: item('Xəzər bereti', 'Caspian beanie', 24),
      ribbons: item('Atlas lentlər', 'Satin ribbons', 32),
      visor: item('Neon vizor', 'Neon visor', 82),
      explorer: item('Kampus səyyahı', 'Campus explorer', 48),
      crown: item('Zəfər tacı', 'Victory crown', 150)
    },
    outfit: {
      classic: item('UNEC klassik kostyumu', 'UNEC classic suit', 0, 0),
      sweater: item('Kofeman sviteri', 'Coffee sweater', 18, 25),
      cyber: item('Kiber-tələbə gödəkçəsi', 'Cyber student jacket', 70, 75),
      armor: item('Kəsr Ovçusu zirehi', 'Retake Hunter armor', 132, 150),
      varsity: item('Kampus gödəkçəsi', 'Campus varsity jacket', 25),
      lab: item('Laboratoriya xalatı', 'Lab coat', 40),
      rain: item('Xəzər yağmurluğu', 'Caspian raincoat', 51),
      runner: item('Arena forması', 'Arena uniform', 62),
      atlas: item('Atlas plaşı', 'Satin cloak', 92),
      midnight: item('Gecə paradı', 'Midnight parade', 120)
    },
    accessory: {
      none: item('Aksesuarsız', 'No accessory', 0, 0),
      coffee: item('İsti qəhvə fincanı', 'Coffee cup', 0, 0),
      pencil: item('Qızıl qələm', 'Golden pen', 18, 25),
      laptop: item('Noutbuk', 'Laptop', 36, 50),
      scroll: item('Apellyasiya Ərizəsi', 'Appeal scroll', 78, 100),
      book: item('Maliyyə dəftəri', 'Finance notebook', 23),
      coin: item('ARENA sikkəsi', 'Arena coin', 32),
      camera: item('Fotoaparat', 'Camera', 54),
      orb: item('Xəzər kürəsi', 'Caspian orb', 68),
      trophy: item('Semestr kuboku', 'Semester trophy', 138)
    },
    palette: Object.fromEntries(paletteRows.map(([id, az, en, points, , , , legacy]) => [id, item(az, en, points, legacy)])),
    effect: {
      none: item('Effektsiz', 'No effect', 0, 0),
      shimmer: item('İşıq dalğası', 'Shimmer', 40, 50),
      stars: item('Ulduz parıltısı', 'Starlight', 78, 100),
      flame: item('Sessiya Canavarı', 'Exam Season Flame', 110, 125),
      aurora: item('Qütb işığı', 'Aurora', 42),
      orbit: item('Orbit', 'Orbit', 49),
      eclipse: item('Tutulma', 'Eclipse', 59),
      frost: item('Şaxta', 'Frost rim', 64),
      pulse: item('Nəbz', 'Pulse', 70),
      lightning: item('Şimşək izi', 'Lightning trace', 80),
      ink: item('Mürəkkəb axını', 'Ink flow', 87),
      ribbon: item('İpək lent', 'Silk ribbon', 94),
      petals: item('Ləçək', 'Petals', 101),
      skyline: item('Bakı silueti', 'Baku skyline', 118),
      ripple: item('Su halqası', 'Water ripple', 128),
      circuit: item('Mikrosxem', 'Circuit', 142),
      comet: item('Kometa', 'Comet', 175)
    },
    title: {
      none: item('Titulsuz', 'No title', 0, 0),
      slayer: { az: 'Kəsr Qatili', en: 'Retake Slayer', requirement: 'bosses' },
      patron: { az: 'Təqaüd Maqnatı', en: 'Scholarship Tycoon', requirement: 'scholar' },
      fronts: { az: '4 Cəbhə Qəhrəmanı', en: 'Four Fronts Hero', requirement: 'fourFronts' },
      triad: { az: 'Üç Arenanın Ustası', en: 'Three Arenas Master', requirement: 'triad' },
      veteran: item('Kampus Veteranı', 'Campus Veteran', 125)
    }
  };
  const defaults = { character: 'boy', head: 'none', outfit: 'classic', accessory: 'none', palette: 'default',
    effect: 'none', title: 'none', mood: 'none', backdrop: 'none', pet: 'none', border: 'none', pose: 'none', avatar: false };
  const stroke = '#152039';
  const hats = {
    none: '',
    glasses: '<path d="M28 56h28l-3 15H32zm38 0h28l-4 15H68zM54 60h14" fill="#222b46" stroke="#132031" stroke-width="3" stroke-linejoin="round"/><path d="m35 61 9 0-8 5m40-5h9l-8 5" fill="#a8e7ef"/>',
    headset: '<path d="M26 64V48q0-22 36-22t37 22v16" fill="none" stroke="#6654b4" stroke-width="6"/><rect x="20" y="55" width="13" height="23" rx="5" fill="#b5a4fa"/><rect x="91" y="55" width="13" height="23" rx="5" fill="#b5a4fa"/><path d="M98 76q0 11-18 10" fill="none" stroke="#7868be" stroke-width="3"/><circle cx="80" cy="86" r="4" fill="#b5a4fa"/>',
    hood: '<path d="M17 68V50q0-26 31-35h24q32 9 32 35v18q-1 18-21 22l10-17V49L76 34H46L29 49v24l10 17Q18 86 17 68z" fill="#6a4e85"/><path d="M32 84v24m60-24v22" stroke="#e9b0d0" stroke-width="4" stroke-linecap="round"/>',
    cap: '<path d="m19 38 42-20 48 19-45 19z" fill="#2b375b"/><path d="M34 45v12q28 13 56-1V43L63 53z" fill="#3e4f7b"/><path d="M99 40v20" stroke="#ffcd79" stroke-width="3"/><path d="M96 59h6v8h-6z" fill="#ffcd79"/>',
    beanie: '<path d="M24 48q2-30 37-32 36 3 40 33l-8 7H31z" fill="#4d887e"/><circle cx="62" cy="16" r="10" fill="#a8ded0"/><path d="M31 49q26-9 63 1v9q-32-9-63 0z" fill="#79b6a4"/>',
    ribbons: '<path d="m32 39-17-9v17l16-2 13 10-1-17zm56-5 14-10 4 17-16 1-11 12-2-17z" fill="#e982a3"/><circle cx="32" cy="42" r="5" fill="#ffc0d4"/><circle cx="89" cy="38" r="5" fill="#ffc0d4"/>',
    visor: '<path d="M25 53q34-8 75 0l-7 20q-28 9-58-1z" fill="#27728a" stroke="#203452" stroke-width="3"/><path d="M36 60h48l-13 6H40z" fill="#83fff4"/>',
    explorer: '<ellipse cx="62" cy="48" rx="48" ry="10" fill="#bf8a56"/><path d="M36 48 41 25h38l10 23z" fill="#e4b778"/><path d="M39 41h47l3 7H36z" fill="#7c5c55"/>',
    crown: '<path d="m29 43-8-23 22 9 17-19 17 17 23-9-8 27z" fill="#e6a94d"/><path d="M30 43h62v8H30z" fill="#ffc773"/><circle cx="61" cy="32" r="5" fill="#75d7c6"/>'
  };
  const outfits = {
    classic: ['#294566', '#d8ecf2', '<path d="m56 91 9 1 8 33-10 7-10-8z" fill="#56b6aa"/><path d="m44 91 18 22 18-22" fill="none" stroke="#deeefa" stroke-width="5"/>'],
    sweater: ['#bd6d66', '#f2ae8c', '<path d="M40 103h45m-43 8h42m-42 8h40" stroke="#ffdcb7" stroke-width="3"/><path d="M52 91h19v7H52z" fill="#894954"/>'],
    cyber: ['#333658', '#64e0e3', '<path d="M62 92v36m-21-22h13m18 0h13m-45 11 10-7m25 0 10 7" fill="none" stroke="#79ece2" stroke-width="3"/>'],
    armor: ['#645775', '#a69ab6', '<path d="M37 98h50l-7 18-17 8-18-8z" fill="#77738f"/><path d="m62 102 10 7-10 9-10-9z" fill="#fc836e"/>'],
    varsity: ['#365b84', '#efd7a5', '<path d="M61 91v37m-21-8h45" stroke="#e2b978" stroke-width="3"/><path d="M48 101h7v9h-7z" fill="#f1d4a6"/>'],
    lab: ['#d9e5e9', '#7d99b4', '<path d="M49 91l13 18 12-18m-11 18v19m10-18h9v6h-9z" fill="none" stroke="#53798f" stroke-width="2"/>'],
    rain: ['#e7ac5a', '#987048', '<path d="M60 92v36m-17-20h13m17 0h13" stroke="#f9deb0" stroke-width="3"/><circle cx="65" cy="105" r="2" fill="#81533b"/>'],
    runner: ['#366c5d', '#f0c666', '<path d="m41 117 41-19v11l-40 18z" fill="#8fd5a7"/><path d="M54 97h17v13H54z" fill="#dce9c5"/>'],
    atlas: ['#784e87', '#e1a4b4', '<path d="M48 93q8 10 15 12 11-2 15-12l13 32-31 6-24-8z" fill="#9568a0"/><circle cx="63" cy="101" r="4" fill="#f4cdb1"/>'],
    midnight: ['#27385f', '#93a3e6', '<path d="M45 107h34m-34 8h34m-17-18v28" stroke="#cfb681" stroke-width="2"/><circle cx="76" cy="100" r="4" fill="#f9d09b"/>']
  };
  const accessories = {
    none: '',
    coffee: '<path d="M93 100h18l-3 16H96z" fill="#f5e3ce"/><path d="M110 103q9-1 6 6h-7m-9-12q-2-3 2-6" fill="none" stroke="#f4d3ad" stroke-width="3"/><path d="M94 103h16v3H94z" fill="#9b5757"/>',
    pencil: '<path d="m89 119 20-24 4 3-20 24-6 2z" fill="#ffd077"/><path d="m87 124 5-2-3-2z" fill="#523f55"/>',
    laptop: '<path d="M84 100h31l-4 17H81z" fill="#99b5dc"/><path d="M87 102h23l-3 11H84z" fill="#344471"/><path d="M77 118h36v4H77z" fill="#d4dcee"/><path d="m92 105-3 2 3 2m10-4 3 2-3 2" fill="none" stroke="#9debd9" stroke-width="2"/>',
    scroll: '<path d="M93 94h19v24H93zm-3-2h25v5H90zm0 24h25v5H90z" fill="#f4dba1"/><path d="M97 101h10m-10 4h10m-9 4h6" stroke="#b48360" stroke-width="2"/><circle cx="107" cy="111" r="4" fill="#c5646d"/>',
    book: '<path d="M89 97h24v23H89z" fill="#4c697b"/><path d="M93 98v20m4-14h12m-12 4h8" stroke="#d4e6dc" stroke-width="2"/>',
    coin: '<circle cx="103" cy="109" r="11" fill="#eab654" stroke="#f8df96" stroke-width="3"/><path d="M98 113v-9l5 4 5-4v9" fill="none" stroke="#ac6729" stroke-width="2"/>',
    camera: '<path d="M89 101h7l2-4h10l2 4h7v17H89z" fill="#58516a"/><circle cx="103" cy="109" r="6" fill="#afced9" stroke="#383c57" stroke-width="2"/>',
    orb: '<circle cx="103" cy="106" r="11" fill="#846fcb" stroke="#d5bef4" stroke-width="2"/><path d="m103 98 2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#f9e8ff"/>',
    trophy: '<path d="M95 96h16v8q0 7-8 8-8-1-8-8zm6 16h4v5h6v4H95v-4h6z" fill="#f4bc61"/><path d="M95 99h-5q0 7 8 8m13-8h5q0 7-8 8" fill="none" stroke="#ecb667" stroke-width="2"/>'
  };

  const layers = { head: hats, outfit: outfits, accessory: accessories, mood: {}, backdrop: {}, pet: {}, border: {}, pose: {} };
  const neutral = {
    mood: ['Təbii ifadə', 'Natural expression'], backdrop: ['Sadə fon', 'Plain backdrop'],
    pet: ['Maskotsuz', 'No companion'], border: ['Çərçivəsiz', 'No frame'], pose: ['Adi duruş', 'Default pose']
  };
  for (const [section, labels] of Object.entries(neutral)) {
    collection[section] = { none: item(...labels, 0) };
  }
  for (const [section, entries] of Object.entries(window.UNECWardrobeCollection)) {
    for (const [id, az, en, price, art] of entries) {
      collection[section][id] = { az, en, price };
      layers[section][id] = art;
    }
  }
  const defaultFace = `<ellipse cx="47" cy="63" rx="7" ry="8.5" fill="#fff6e6"/><ellipse cx="78" cy="63" rx="7" ry="8.5" fill="#fff6e6"/>
      <ellipse cx="49" cy="64" rx="4" ry="6" fill="#2e304c"/><ellipse cx="76" cy="64" rx="4" ry="6" fill="#2e304c"/>
      <circle cx="49" cy="62" r="1.5" fill="#fff"/><circle cx="77" cy="62" r="1.5" fill="#fff"/>
      <path d="M57 76q6 5 12 0" fill="none" stroke="#995d67" stroke-width="2.5" stroke-linecap="round"/>`;
  function photoFrame(id) {
    const art = layers.border[id];
    return art ? `<svg class="semester-photo-frame" viewBox="0 0 128 144" preserveAspectRatio="none" aria-hidden="true">${art}</svg>` : '';
  }

  function avatar(look, large = false) {
    const girl = look.character === 'girl';
    const palette = palettes[look.palette] ?? palettes.default;
    const [base, trim, decoration] = outfits[look.outfit] ?? outfits.classic;
    return `<svg class="semester-avatar-svg" viewBox="0 0 128 144" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="122" height="136" rx="${large ? 28 : 25}" fill="${palette.base}"/>
      <circle cx="64" cy="66" r="49" fill="${palette.mid}" fill-opacity=".43"/>
      <path d="M17 36h12m-6-6v12m78 8h12m-6-6v12M22 103h9m-4-4v8" stroke="${palette.light}" stroke-width="2" stroke-linecap="round" opacity=".63"/>
      ${layers.backdrop[look.backdrop] ?? ''}
      <ellipse cx="64" cy="132" rx="39" ry="6" fill="#151d2a" opacity=".5"/>
      <path d="M47 119h13v11h-2q-10 7-19 2l1-6zm22 0h13l7 8-1 5q-9 4-18-2h-1z" fill="#29314d" stroke="${stroke}" stroke-width="3"/>
      <path d="M46 88q-13 1-15 17l-3 9q3 7 11 4l6-15h37l7 17q7 2 11-5l-7-17q-4-9-13-11z" fill="${trim}" stroke="${stroke}" stroke-width="3"/>
      <path d="M43 94q4-10 19-10t21 10l2 28q-16 10-44 0z" fill="${base}" stroke="${stroke}" stroke-width="3"/>
      ${decoration}
      ${girl ? '<path d="M27 43q-15 26-9 57 8 10 26 4l5-25h29l5 25q18 7 28-3 4-32-10-58z" fill="#543852" stroke="' + stroke + '" stroke-width="3"/>' : ''}
      <path d="M58 82h13v13q-7 5-13 0z" fill="#dba580"/>
      <circle cx="25" cy="64" r="10" fill="#edba91" stroke="${stroke}" stroke-width="3"/>
      <circle cx="99" cy="64" r="10" fill="#edba91" stroke="${stroke}" stroke-width="3"/>
      <path d="M26 59c0-22 13-35 36-35 23 0 37 13 37 35 0 19-13 33-36 35-21-1-37-15-37-35z" fill="#f5cd9f" stroke="${stroke}" stroke-width="3"/>
      ${girl
        ? '<path d="M23 61c-1-25 15-42 39-42 26 0 41 18 40 42l-9-2c-5-2-10-11-13-20-11 9-24 13-43 13l-6 10z" fill="#543852" stroke="' + stroke + '" stroke-width="3"/><path d="M42 43q17-1 30-13" fill="none" stroke="#a5647a" stroke-width="2.5" stroke-linecap="round"/>'
        : '<path d="M24 58c-1-22 13-37 38-37 24 0 40 16 39 37l-8-5-4-12-12 6-6-7-10 8-16-4-6 12z" fill="#423958" stroke="' + stroke + '" stroke-width="3"/>'}
      ${layers.mood[look.mood] || defaultFace}
      <ellipse cx="36" cy="74" rx="5" ry="2.6" fill="#e7998f"/><ellipse cx="88" cy="74" rx="5" ry="2.6" fill="#e7998f"/>
      ${hats[look.head] ?? ''}${accessories[look.accessory] ?? ''}
      ${layers.pose[look.pose] ?? ''}${layers.pet[look.pet] ?? ''}${layers.border[look.border] ?? ''}
    </svg>`;
  }
  const combinations = ['character', ...Object.keys(layers)].reduce((count, group) => count * Object.keys(collection[group]).length, 1);
  window.UNECStudentWardrobe = { collection, defaults, palettes, avatar, photoFrame, combinations };
})();
