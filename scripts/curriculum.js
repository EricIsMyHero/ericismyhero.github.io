/* =============================================================
   CURRICULUM.JS  –  İxtisas Planı Modulu
   UNEC tələbəsi üçün 8 semestr fənn cədvəli + localStorage

   Fənn sətirlərində şifr (rəsmi tədris planına görə):
     code:  '00591'                 → adi fənn
     codes: ['00532', '00726', ...] → seçmə fənn qrupu (bu şifrlərdən biri seçilir)
   Şifri olan ixtisaslar: İqtisadiyyat, Maliyyə, Mühasibat, Menecment, Marketinq,
   Ekologiya, Statistika, Dizayn, Qida mühəndisliyi, Beynəlxalq münasibətlər,
   Beynəlxalq ticarət və logistika, Turizm işinin təşkili, Sosial iş.
   ============================================================= */

const CURRICULUM_DATA = {

  /* ─── İQTİSADİYYAT ──────────────────────────────────────── */
  economics: {
    name: 'İqtisadiyyat', icon: 'trending_up',
    semester1: [
      { name: 'Azərbaycanın tarixi',                                    credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00005' },
      { name: 'Xətti cəbr və riyazi analiz',                            credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00056' },
      { name: 'İKT - baza komputer bilikləri',                          credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00016' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1',       credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '01222' },
      { name: 'Karyera planlaması',                                     credit: 5, hours: 30, absenceLimit: 3, weekly: 2, code: '01223' },
    ],
    semester2: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya',   credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00004' },
      { name: 'Ehtimal nəzəriyyəsi və riyazi statistika',               credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00071' },
      { name: 'İqtisadiyyata giriş',                                    credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00021' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2',       credit: 3, hours: 75, absenceLimit: 9, weekly: 5, code: '00122' },
      { name: 'Yumşaq bacarıqlar (Soft skills)',                        credit: 9, hours: 30, absenceLimit: 3, weekly: 2, code: '01224' },
    ],
    semester3: [
      { name: 'Ətraf mühitin iqtisadiyyatı',                           credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00332' },
      { name: 'Əməyin iqtisadiyyatı',                                  credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00307' },
      { name: 'Mikroiqtisadiyyat',                                     credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00591' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3',      credit: 4, hours: 90, absenceLimit: 11, weekly: 6, code: '00760' },
      { name: 'Seçmə fənn - 1 (Qiymət siyasəti)',                      credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00532', '00726', '00173', '00710', '00938', '00943', '00378', '00385', '00501'] },
    ],
    semester4: [
      { name: 'Azərbaycan iqtisadiyyatı',                               credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00157' },
      { name: 'İqtisadi fikir tarixi',                                  credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00438' },
      { name: 'Makroiqtisadiyyat',                                      credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00523' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4',       credit: 4, hours: 75, absenceLimit: 9, weekly: 5, code: '00934' },
      { name: 'Seçmə fənn - 1 (Maliyyə uçotu)',                         credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00531', '00525', '00936', '00749', '00618'] },
    ],
    semester5: [
      { name: 'Menecment',                                        credit: 7, hours: 60, absenceLimit: 7, weekly: 4, code: '00031' },
      { name: 'Statistika',                                       credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00837' },
      { name: 'Beynəlxalq iqtisadiyyat',                          credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00171' },
      { name: 'Rəqəmsal iqtisadiyyat (Sahə iqtisadiyyatı)',       credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00736' },
      { name: 'Mülki müdafiə',                                    credit: 3, hours: 45, absenceLimit: 5, weekly: 3, code: '00034' },
    ],
    semester6: [
      { name: 'Ekonometrika',                           credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00282' },
      { name: 'Sosial sahələrin iqtisadiyyatı',         credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00821' },
      { name: 'Seçmə fənn - 1',                         credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00341', '00830', '00149', '00574', '00316', '00632'] },
      { name: 'Seçmə fənn - 2',                         credit: 7, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00160', '00788', '00529', '00222', '00130', '00681', '00617'] },
      { name: 'Seçmə fənn - 3',                         credit: 4, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00859', '00169', '00413', '00182', '01141'] },
    ],
    semester7: [
      { name: 'İnkişaf iqtisadiyyatı',               credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00411' },
      { name: 'Sərt bacarıqlar (Hard skills)',       credit: 10, hours: 30, absenceLimit: 3, weekly: 2, code: '01225' },
      { name: 'Seçmə fənn - 1',                      credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00402', '00404', '00758', '00671'] },
      { name: 'Seçmə fənn - 2',                      credit: 7, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00682', '00175', '00610', '00414', '01221'] },
      { name: 'Seçmə fənn - 3',                      credit: 6, hours: 60,  absenceLimit: 7, weekly: 4, codes: ['00888', '00635', '00437', '00724', '00412'] },
    ],
    semester8: [
      { name: 'İstehsalat təcrübəsi / layihə',         credit: 6, hours: 0, absenceLimit: 0, weekly: 0, code: '00454' },
      { name: 'Seçmə fənn - 1',                        credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00736', '00779', '00332', '00157', '00821', '00428', '00148', '00221', '01226'] },
      { name: 'Seçmə fənn - 2',                        credit: 8, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00436', '00418', '00345'] },
      { name: 'Seçmə fənn - 3',                        credit: 4, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00439', '00172', '00521', '00410'] },
      { name: 'Seçmə fənn - 4',                        credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00200', '00517', '00880', '00823', '00501'] },
    ],
  },

  /* ─── MALİYYƏ ──────────────────────────────────────── */
  finance: {
    name: 'Maliyyə', icon: 'payments',
    semester1: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00004' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1',    credit: 4, hours: 90, absenceLimit: 11, weekly: 6, code: '00058' },
      { name: 'İqtisadiyyata giriş',                                  credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00021' },
      { name: 'Xətti cəbr və riyazi analiz',                          credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00056' },
      { name: 'İKT - baza kompyüter bilikləri',                       credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00016' },
    ],
    semester2: [
      { name: 'Azərbaycanın tarixi',                                  credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00005' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2',     credit: 3, hours: 75, absenceLimit: 9, weekly: 5, code: '00122' },
      { name: 'Ehtimal nəzəriyyəsi və riyazi statistika',             credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00071' },
      { name: 'Karyera planlaması',                                   credit: 5, hours: 45, absenceLimit: 5, weekly: 3, code: '00023' },
      { name: 'Yumşaq bacarıqlar (Soft skills)',                      credit: 9, hours: 45, absenceLimit: 5, weekly: 3, code: '00118' },
    ],
    semester3: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3',     credit: 4, hours: 90, absenceLimit: 11, weekly: 6, code: '00760' },
      { name: 'Mikroiqtisadiyyat',                                    credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00591' },
      { name: 'Korporativ maliyyə',                                   credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00503' },
      { name: 'Maliyyə bazarları',                                    credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00524' },
      { name: 'Seçmə fənn - 1 (Biznesin əsasları)',                   credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00200', '00517', '00880', '00823', '00501'] },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4',     credit: 4, hours: 75, absenceLimit: 9, weekly: 5, code: '00934' },
      { name: 'Makroiqtisadiyyat',                                    credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00523' },
      { name: 'Maliyyə uçotu',                                        credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00531' },
      { name: 'Maliyyə risklərinin idarə edilməsi',                   credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00528' },
      { name: 'Seçmə fənn - 1 (Marketinq)',                           credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00532', '00726', '00173', '00710', '00938', '00943', '00378', '00385'] },
    ],
    semester5: [
      { name: 'Dövlət maliyyəsi',                                     credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00246' },
      { name: 'Seçmə fənn - 1 (Maliyyə uçotu)',                       credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00531', '00525', '00936', '00749', '00618'] },
      { name: 'Seçmə fənn - 2 (Rəqəmsal iqtisadiyyat)',               credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00736', '00779', '00332', '00157', '00821', '00428', '00148', '00221', '00501'] },
      { name: 'Seçmə fənn - 3 (İqtisadi dinamikanın əsasları)',       credit: 8, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00436', '00418', '00345'] },
      { name: 'Seçmə fənn - 4 (Sabit gəlirli qiymətli kağızlar)',     credit: 4, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00755', '00611', '00759', '00207'] },
    ],
    semester6: [
      { name: 'Statistika',                                           credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00837' },
      { name: 'Menecment',                                            credit: 7, hours: 60, absenceLimit: 7, weekly: 4, code: '00031' },
      { name: 'İnvestisiyanın idarə edilməsi',                        credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00432' },
      { name: 'Seçmə fənn (İnformasiya texnologiyaları)',             credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00402', '00404', '00758', '00671'] },
      { name: 'Seçmə fənn - 1 (Maliyyə təhlili)',                     credit: 4, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00530', '00795', '00249'] },
    ],
    semester7: [
      { name: 'Ekonometrika',                                         credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00282' },
      { name: 'Vergitutma',                                           credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00917' },
      { name: 'Mülki müdafiə',                                        credit: 3, hours: 45, absenceLimit: 5, weekly: 3, code: '00034' },
      { name: 'Seçmə fənn - 1 (Bank işi)',                            credit: 7, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00160', '00788', '00529', '00222', '00130', '00681', '00617'] },
      { name: 'Seçmə fənn - 2 (Alternativ investisiyalar)',           credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00139', '00672', '00527', '00180'] },
    ],
    semester8: [
      { name: 'Maliyyə menecmenti',                                   credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00526' },
      { name: 'Sərt bacarıqlar (Hard skills)',                        credit: 10, hours: 45, absenceLimit: 5, weekly: 3, code: '00787' },
      { name: 'İstehsalat təcrübəsi / layihə',                        credit: 6, hours: 0, absenceLimit: 0, weekly: 0, code: '00454' },
      { name: 'Seçmə fənn (Fəlsəfə)',                                 credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00341', '00830', '00149', '00574', '00316', '00632'] },
      { name: 'Seçmə fənn - 1 (Proseslərin idarə edilməsi)',          credit: 7, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00682', '00175', '00610', '00414'] },
    ],
  },

  /* ─── MÜHASİBAT ──────────────────────────────────────── */
  accounting: {
    name: 'Mühasibat', icon: 'receipt_long',
    semester1: [
      { name: 'Azərbaycanın tarixi', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00005' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '01222' },
      { name: 'Xətti cəbr və riyazi analiz', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00056' },
      { name: 'İKT - baza kompyüter bilikləri', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00016' },
      { name: 'Karyera planlaması', credit: 5, hours: 30, absenceLimit: 3, weekly: 2, code: '01223' },
    ],
    semester2: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00004' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, hours: 75, absenceLimit: 9, weekly: 5, code: '00122' },
      { name: 'İqtisadiyyata giriş', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00021' },
      { name: 'Ehtimal nəzəriyyəsi və riyazi statistika', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00071' },
      { name: 'Yumşaq bacarıqlar (Soft skills)', credit: 9, hours: 30, absenceLimit: 3, weekly: 2, code: '01224' },
    ],
    semester3: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, hours: 90, absenceLimit: 11, weekly: 6, code: '00760' },
      { name: 'Mikroiqtisadiyyat', credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00591' },
      { name: 'Maliyyə uçotu', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00531' },
      { name: 'Biznes hüququ', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00195' },
      { name: 'Seçmə fənn - 4 (Marketinq)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00532', '00726', '00173', '00710', '00938', '00943', '00378', '00385'] },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, hours: 75, absenceLimit: 9, weekly: 5, code: '00934' },
      { name: 'Makroiqtisadiyyat', credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00523' },
      { name: 'Maliyyə hesabatlılığı', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00525' },
      { name: 'Vergitutma', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00917' },
      { name: 'Seçmə fənn - 5 (Biznesin əsasları)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00200', '00517', '00880', '00823', '00501'] },
    ],
    semester5: [
      { name: 'Seçmə fənn (Fəlsəfə)', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00341', '00830', '00149', '00574', '00316', '00632'] },
      { name: 'Statistika', credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00837' },
      { name: 'Menecment', credit: 7, hours: 60, absenceLimit: 7, weekly: 4, code: '00031' },
      { name: 'İdarəetmə uçotu', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00382' },
      { name: 'Audit', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00152' },
    ],
    semester6: [
      { name: 'Seçmə fənn (İnformasiya texnologiyaları)', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00402', '00404', '00758', '00671'] },
      { name: 'Ekonometrika', credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00282' },
      { name: 'Fəaliyyətin effektiv idarə edilməsi', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00340' },
      { name: 'Seçmə fənn - 2 (Bank işi)', credit: 7, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00160', '00788', '00529', '00222', '00130', '00681', '00617'] },
      { name: 'Seçmə fənn - 8 (Vergi auditi)', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00915', '00916', '00202'] },
    ],
    semester7: [
      { name: 'Maliyyə menecmenti', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00526' },
      { name: 'Mülki müdafiə', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, code: '00034' },
      { name: 'Sərt bacarıqlar (Hard skills)', credit: 10, hours: 30, absenceLimit: 3, weekly: 2, code: '01225' },
      { name: 'Seçmə fənn - 6 (Proseslərin idarə edilməsi)', credit: 7, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00682', '00175', '00610', '00414', '01221'] },
      { name: 'Seçmə fənn - 10 (Daxili audit)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00223', '00132', '00903'] },
    ],
    semester8: [
      { name: 'İstehsalat təcrübəsi / layihə', credit: 6, hours: 0, absenceLimit: 0, weekly: 0, code: '00454' },
      { name: 'Seçmə fənn - 1 (Maliyyə uçotu)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00531', '00525', '00936', '00749', '00618'] },
      { name: 'Seçmə fənn - 3 (Rəqəmsal iqtisadiyyat)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00736', '00779', '00332', '00157', '00821', '00428', '00148', '00221', '00501', '01226'] },
      { name: 'Seçmə fənn - 7 (İqtisadi dinamikanın əsasları)', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00436', '00418', '00345'] },
      { name: 'Seçmə fənn - 9 (Beynəlxalq audit)', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00167', '00133', '00840'] },
    ],
  },

  /* ─── MENECMENT ──────────────────────────────────────── */
  management: {
    name: 'Menecment', icon: 'explore',
    semester1: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00004' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '01222' },
      { name: 'İqtisadiyyata giriş', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00021' },
      { name: 'Xətti cəbr və riyazi analiz', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00056' },
      { name: 'İKT - baza kompyüter bilikləri', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00016' },
    ],
    semester2: [
      { name: 'Azərbaycanın tarixi', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00005' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, hours: 75, absenceLimit: 9, weekly: 5, code: '00122' },
      { name: 'Ehtimal nəzəriyyəsi və riyazi statistika', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00071' },
      { name: 'Karyera planlaması', credit: 5, hours: 30, absenceLimit: 3, weekly: 2, code: '01223' },
      { name: 'Yumşaq bacarıqlar (Soft skills)', credit: 9, hours: 30, absenceLimit: 3, weekly: 2, code: '01224' },
    ],
    semester3: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, hours: 90, absenceLimit: 11, weekly: 6, code: '00760' },
      { name: 'Mikroiqtisadiyyat', credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00591' },
      { name: 'Biznesin əsasları', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00200' },
      { name: 'Seçmə fənn - 1 (Maliyyə uçotu)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00531', '00525', '00936', '00749', '00618'] },
      { name: 'Seçmə fənn - 9 (Təşkilati davranış)', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00882', '00195', '00302', '00693'] },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, hours: 75, absenceLimit: 9, weekly: 5, code: '00934' },
      { name: 'Menecment', credit: 7, hours: 60, absenceLimit: 7, weekly: 4, code: '00031' },
      { name: 'Əməliyyatların idarə edilməsi', credit: 4, hours: 30, absenceLimit: 3, weekly: 2, code: '00305' },
      { name: 'Layihələrin idarə edilməsi', credit: 6, hours: 45, absenceLimit: 5, weekly: 3, code: '00515' },
      { name: 'Mülki müdafiə', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, code: '00034' },
      { name: 'Seçmə fənn - 4 (Marketinq)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00532', '00726', '00173', '00710', '00938', '00943', '00378', '00385', '00501'] },
    ],
    semester5: [
      { name: 'Makroiqtisadiyyat', credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00523' },
      { name: 'Statistika', credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00837' },
      { name: 'Korporativ idarəetmə', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00502' },
      { name: 'İnsan resurslarının idarə edilməsi', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00425' },
    ],
    semester6: [
      { name: 'Ekonometrika', credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00282' },
      { name: 'Seçmə fənn (İnformasiya texnologiyaları)', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00402', '00404', '00758', '00671'] },
      { name: 'Seçmə fənn - 2 (Bank işi)', credit: 7, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00160', '00788', '00529', '00222', '00130', '00681', '00617'] },
      { name: 'Seçmə fənn - 8 (İdarəetmə iqtisadiyyatı)', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00379', '00937', '00424', '00657', '00184'] },
      { name: 'Seçmə fənn - 10 (İdarəetmənin sosiologiyası və psixologiyası)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00384', '00448', '00730', '00902'] },
    ],
    semester7: [
      { name: 'Seçmə fənn (Fəlsəfə)', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00341', '00830', '00149', '00574', '00316', '00632'] },
      { name: 'Strateji menecment', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00844' },
      { name: 'Keyfiyyətin idarə edilməsi', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00466' },
      { name: 'Sərt bacarıqlar (Hard skills)', credit: 10, hours: 30, absenceLimit: 3, weekly: 2, code: '01225' },
      { name: 'Seçmə fənn - 6 (Proseslərin idarə edilməsi)', credit: 7, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00682', '00175', '00610', '00414', '01221'] },
    ],
    semester8: [
      { name: 'İnnovasiya menecmenti', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00416' },
      { name: 'İstehsalat təcrübəsi / layihə', credit: 6, hours: 0, absenceLimit: 0, weekly: 0, code: '00454' },
      { name: 'Seçmə fənn - 3 (Rəqəmsal iqtisadiyyat)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00736', '00779', '00332', '00157', '00821', '00428', '00148', '00221', '01226'] },
      { name: 'Seçmə fənn - 5 (Biznesin əsasları)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00200', '00517', '00880', '00823', '00501'] },
      { name: 'Seçmə fənn - 7 (İqtisadi dinamikanın əsasları)', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00436', '00418', '00345'] },
    ],
  },

  /* ─── MARKETİNQ ──────────────────────────────────────── */
  marketing: {
    name: 'Marketinq', icon: 'bar_chart',
    semester1: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00004' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '01222' },
      { name: 'İqtisadiyyata giriş', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00021' },
      { name: 'Xətti cəbr və riyazi analiz', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00056' },
      { name: 'İKT - baza komputer bilikləri', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00016' },
    ],
    semester2: [
      { name: 'Azərbaycanın tarixi', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00005' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, hours: 75, absenceLimit: 9, weekly: 5, code: '00122' },
      { name: 'Ehtimal nəzəriyyəsi və riyazi statistika', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00071' },
      { name: 'Karyera planlaması', credit: 5, hours: 30, absenceLimit: 3, weekly: 2, code: '00223' },
      { name: 'Yumşaq bacarıqlar (Soft skills)', credit: 9, hours: 30, absenceLimit: 3, weekly: 2, code: '00224' },
    ],
    semester3: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, hours: 90, absenceLimit: 11, weekly: 6, code: '00760' },
      { name: 'Mikroiqtisadiyyat', credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00591' },
      { name: 'Marketinq', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00532' },
      { name: 'Marketinq tətqiqatları', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00535' },
      { name: 'Seçmə fənn - 1 (Maliyyə uçotu)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00531', '00525', '00936', '00749', '00618'] },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, hours: 75, absenceLimit: 9, weekly: 5, code: '00934' },
      { name: 'Makroiqtisadiyyat', credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00523' },
      { name: 'İstehlakçı davranışları', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00449' },
      { name: 'Pərakəndə ticarət marketinqi', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00662' },
      { name: 'Seçmə fənn - 5 (Biznesin əsasları)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00200', '00517', '00880', '00823', '00501'] },
    ],
    semester5: [
      { name: 'Rəqəmsal marketinq', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00741' },
      { name: 'Seçmə fənn - 3 (Rəqəmsal iqtisadiyyat)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00736', '00779', '00332', '00157', '00821', '00428', '00148', '00221', '01226'] },
      { name: 'Seçmə fənn - 4 (Marketinq)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00532', '00726', '00173', '00710', '00938', '00943', '00378', '00385', '00501'] },
      { name: 'Seçmə fənn - 7 (İqtisadi dinamikanın əsasları)', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00436', '00418', '00345'] },
      { name: 'Seçmə fənn - 9 (Sosial media marketinq)', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00817', '00206', '00204'] },
    ],
    semester6: [
      { name: 'Statistika', credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00837' },
      { name: 'Menecment', credit: 7, hours: 60, absenceLimit: 7, weekly: 4, code: '00031' },
      { name: 'Strateji marketinq', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00843' },
      { name: 'Seçmə fənn (İnformasiya texnologiyaları)', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00402', '00404', '00758', '00671'] },
      { name: 'Seçmə fənn - 10 (Strateji brend menecmenti)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00841', '00533', '00637'] },
    ],
    semester7: [
      { name: 'Ekonometrika', credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00282' },
      { name: 'Reklam işi', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00726' },
      { name: 'Satışın idarə edilməsi', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00761' },
      { name: 'Seçmə fənn (Fəlsəfə)', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00341', '00830', '00149', '00574', '00316', '00632'] },
      { name: 'Seçmə fənn - 2 (Bank işi)', credit: 7, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00160', '00788', '00529', '00222', '00130', '00681', '00617'] },
    ],
    semester8: [
      { name: 'Mülki müdafiə', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, code: '00034' },
      { name: 'Seçmə fənn - 6 (Proseslərin idarə edilməsi)', credit: 7, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00682', '00175', '00610', '00414', '01221'] },
      { name: 'Seçmə fənn - 8 (Tədbirlər marketinqi və sponsorluq)', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00864', '00174', '00534'] },
      { name: 'Sərt bacarıqlar (Hard skills)', credit: 10, hours: 30, absenceLimit: 3, weekly: 2, code: '00225' },
      { name: 'İstehsalat təcrübəsi / layihə', credit: 6, hours: 0, absenceLimit: 0, weekly: 0, code: '00454' },
    ],
  },

  /* ─── DİZAYN ──────────────────────────────────────── */
  design: {
    name: 'Dizayn', icon: 'palette',
    semester1: [
      { name: 'Azərbaycanın tarixi',            credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00005' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00122' },
      { name: 'Rəsm-1',                          credit: 6, hours: 45, absenceLimit: 5, weekly: 3, code: '00039' },
      { name: 'Rəngkarlıq-1',                    credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00038' },
      { name: 'Dizaynın əsasları-1',             credit: 5, hours: 45, absenceLimit: 5, weekly: 3, code: '00008' },
      { name: 'Dizayn tarixi',                   credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00007' },
    ],
    semester2: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00004' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, hours: 60, absenceLimit: 7, weekly: 4, code: '00073' },
      { name: 'Rəsm-2',                          credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00103' },
      { name: 'Rəngkarlıq-2',                    credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00102' },
      { name: 'Dizaynın əsasları-2',             credit: 5, hours: 45, absenceLimit: 5, weekly: 3, code: '00079' },
      { name: 'Seçmə fənn (Qrafik dizayn)',      credit: 8, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00100', '00101', '00075'] },
    ],
    semester3: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00932' },
      { name: 'Rəsm-3',                          credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00745' },
      { name: 'Rəngkarlıq-3',                    credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00728' },
      { name: 'Perspektiva',                     credit: 6, hours: 45, absenceLimit: 5, weekly: 3, code: '00663' },
      { name: 'Erqonomika',                      credit: 5, hours: 45, absenceLimit: 5, weekly: 3, code: '00312' },
      { name: 'Seçmə fənn (Konstruktivləşmənin əsasları)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00500', '00356', '00161'] },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '01079' },
      { name: 'Rəsm-4',                          credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00746' },
      { name: 'Rəngkarlıq-4',                    credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00729' },
      { name: 'Seçmə fənn (İnformasiya texnologiyaları)', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00402', '00404', '00758', '00671'] },
      { name: 'Seçmə fənn (Layihə qrafikası)',   credit: 7, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00514', '00573', '00516'] },
      { name: 'Seçmə fənn (Heykəltəraşlıq)',     credit: 8, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00372', '00477', '00666'] },
    ],
    semester5: [
      { name: 'Seçmə fənn - 1 (Qrafik dizayn proqramları)', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00716', '00237', '00568'] },
      { name: 'Seçmə fənn - 2 (Geyimin modelləşdirilməsi)', credit: 5, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00358', '00354', '00505'] },
      { name: 'Seçmə fənn - 3 (Koloristika)',    credit: 5, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00471', '00239', '00240'] },
      { name: 'Seçmə fənn - 4 (Bədii qrafika)',  credit: 5, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00162', '00150', '00774'] },
      { name: 'Seçmə fənn - 5 (Məhsulların bədii tərtibatı (Sənaye dizaynı))', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00569', '00123', '00631'] },
      { name: 'Seçmə fənn - 6 (Geyimin layihələndirilməsi (Geyim dizaynı))', credit: 5, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00357', '00431', '00727'] },
    ],
    semester6: [
      { name: 'Seçmə fənn - 1 (Moda və kostyum tarixi)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00603', '00506', '00609'] },
      { name: 'Seçmə fənn - 2 (Moda və stil)',   credit: 6, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00604', '00339', '00602'] },
      { name: 'Seçmə fənn - 3 (Dekorativ tətbiqi sənət)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00226', '00786', '00654'] },
      { name: 'Seçmə fənn - 4 (Kostyumun kompozisiyası)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00507', '00238', '00156'] },
      { name: 'Seçmə fənn - 5 (Material, texnika və texnologiya)', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00548', '00872', '00873'] },
      { name: 'Mülki müdafiə',                   credit: 3, hours: 45, absenceLimit: 5, weekly: 3, code: '00034' },
    ],
    semester7: [
      { name: 'Seçmə fənn - 1 (Fəlsəfə)',        credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00341', '00830', '00980_1', '00574', '00317', '00941'] },
      { name: 'Multikulturalizmə giriş',         credit: 3, hours: 45, absenceLimit: 5, weekly: 3, code: '00632' },
      { name: 'Seçmə fənn - 2 (Parçaların bədii tərtibatı)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00660', '00355', '00612'] },
      { name: 'Seçmə fənn - 3 (Tətbiqi mexanika)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00890', '00205', '00359'] },
      { name: 'Seçmə fənn - 4 (Portfolio (Sənaye dizaynı))',      credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00673', '00601', '00236'] },
      { name: 'Seçmə fənn - 5 (Maketləşdirmə (Sənaye dizaynı))',  credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00520', '00353', '00630'] },
    ],
    semester8: [
      { name: 'İstehsalat təcrübəsi',            credit: 21, hours: 0, absenceLimit: 0, weekly: 0, code: '00861' },
      { name: 'Buraxılış işi',                   credit: 9, hours: 0, absenceLimit: 0, weekly: 0, code: '00210' },
    ],
  },

   /* ─── QİDA MÜHƏNDİSLİYİ ──────────────────────────────────────── */
  foodEngineering: {
    name: 'Qida mühəndisliyi', icon: 'restaurant',
    semester1: [
      { name: 'Azərbaycan tarixi',                          credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00005' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '01222' },
      { name: 'Xətti cəbr və analitik həndəsə',             credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00055' },
      { name: 'Ümumi kimya',                                credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00051' },
      { name: 'Analitik kimya',                             credit: 5, hours: 45, absenceLimit: 5, weekly: 3, code: '00003' },
      { name: 'Fizikanın əsasları',                         credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00014' },
    ],
    semester2: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, hours: 60, absenceLimit: 7, weekly: 4, code: '00073' },
      { name: 'Riyazi analiz',                              credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00040' },
      { name: 'Üzvi kimya',                                 credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00115' },
      { name: 'Tətbiqi Fizika',                             credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00113' },
      { name: 'İxtisasa giriş',                             credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00066' },
      { name: 'Seçmə fənn - 1 (Biologiya)',                 credit: 5, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00076', '00099', '00098'] },
    ],
    semester3: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00004' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00932' },
      { name: 'Tətbiqi riyaziyyat',                         credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00891' },
      { name: 'Qida kimyası',                               credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00697' },
      { name: 'Qida mühəndisliyində qidalanma və sağlamlıq', credit: 7, hours: 60, absenceLimit: 7, weekly: 4, code: '00707' },
      { name: 'Seçmə fənn - 2 (Ümumi mikrobiologiya)',      credit: 7, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00909', '00369', '00898', '00952'] },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00933' },
      { name: 'Qida məhsullarının biokimyası',              credit: 7, hours: 60, absenceLimit: 7, weekly: 4, code: '00699' },
      { name: 'Qida mikrobiologiyası',                      credit: 7, hours: 60, absenceLimit: 7, weekly: 4, code: '00705' },
      { name: 'Qida məhsullarının keyfiyyətinə texniki-kimyəvi nəzarət', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00700' },
      { name: 'Seçmə fənn - 1 (Qida mühəndisliyi dizaynı və iqtisadiyyatı)', credit: 5, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00706', '00838', '00444'] },
      { name: 'Seçmə fənn (Fəlsəfə)',                       credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00341', '00830', '00149', '00574', '00317', '00632'] },
    ],
    semester5: [
      { name: 'Seçmə fənn (İnformasiya texnologiyaları)',   credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00402', '00404', '00758', '00671'] },
      { name: 'Kompüter əsaslı mühəndis qrafikası',         credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00482' },
      { name: 'Qida məhsullarının soyudulma texnologiyası', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00703' },
      { name: 'Mülki müdafiə',                              credit: 3, hours: 45, absenceLimit: 5, weekly: 3, code: '00034' },
      { name: 'Seçmə fənn - 3 (İstilik və kütlə transferi)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00458', '00510', '00721'] },
      { name: 'Seçmə fənn - 4 (Bölmə əməliyyatları laboratoriyası)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00203', '00134', '00698'] },
    ],
    semester6: [
      { name: 'Qida məhsullarının təhlükəsizliyi',          credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00704' },
      { name: 'Qida biotexnologiyası',                      credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00696' },
      { name: 'Qida sənayesi müəssisələrində texnoloji layihələndirmə', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00708' },
      { name: 'Seçmə fənn - 2 (Ədədi analiz)',              credit: 4, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00252', '00564', '00877'] },
      { name: 'Seçmə fənn - 5 (Yağ texnologiyası)',         credit: 5, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00940', '00953', '00701', '00954'] },
      { name: 'Seçmə fənn - 6 (Taxıl texnologiyası)',       credit: 5, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00854', '00691', '00191'] },
    ],
    semester7: [
      { name: 'Sağlamlıq və əməyin mühafizəsi',             credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00756' },
      { name: 'Keyfiyyəti idarəetmə sistemləri',            credit: 5, hours: 45, absenceLimit: 5, weekly: 3, code: '00464' },
      { name: 'Qida sənayesində texnoloji əməliyyatlar',    credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00709' },
      { name: 'Seçmə fənn - 7 (Meyvə və tərəvəz texnologiyası)', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00586', '00607', '00215', '00344'] },
      { name: 'Seçmə fənn - 8 (Ət texnologiyası)',          credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00318', '00348', '00702'] },
      { name: 'Seçmə fənn - 9 (Süd texnologiyası)',         credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00847', '00661', '00228'] },
    ],
    semester8: [
      { name: 'İstehsalat təcrübəsi',                       credit: 21, hours: 0, absenceLimit: 0, weekly: 0, code: '00861' },
      { name: 'Buraxılış işi',                              credit: 9, hours: 0, absenceLimit: 0, weekly: 0, code: '00210' },
    ],
  },

   /* ─── BEYNƏLXALQ MÜNASİBƏTLƏR ──────────────────────────────────────── */
  internationalRelations: {
    name: 'Beynəlxalq münasibətlər', icon: 'public',
    semester1: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00004' },
      { name: 'Azərbaycanın tarixi',                          credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00005' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '01222' },
      { name: 'Beynəlxalq münasibətlər tarixi-1',             credit: 6, hours: 45, absenceLimit: 5, weekly: 3, code: '01082' },
      { name: 'Siyasi fikir tarixi',                          credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '01086' },
      { name: 'Mülki müdafiə',                                credit: 3, hours: 45, absenceLimit: 5, weekly: 3, code: '00034' },
      { name: 'İqtisadiyyatın əsasları',                      credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '01099' },
    ],
    semester2: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, hours: 60, absenceLimit: 7, weekly: 4, code: '00073' },
      { name: 'Siyasi coğrafiya',                             credit: 3, hours: 45, absenceLimit: 5, weekly: 3, code: '01081' },
      { name: 'Beynəlxalq münasibətlər tarixi-2',             credit: 6, hours: 45, absenceLimit: 5, weekly: 3, code: '01083' },
      { name: 'Türk xalqlarının müasir tarixi',               credit: 3, hours: 45, absenceLimit: 5, weekly: 3, code: '01085' },
      { name: 'Beynəlxalq münasibətlər nəzəriyyəsi',          credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '01090' },
      { name: 'Beynəlxalq iqtisadi münasibətlər',             credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '01103' },
      { name: 'Müasir informasiya-kommunikasiya texnologiyaları', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, code: '01104' },
    ],
    semester3: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '01035' },
      { name: 'Beynəlxalq münasibətlər tarixi-3',             credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '01084' },
      { name: 'Siyasi təhlil və tənqidi təfəkkür',            credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '01096' },
      { name: 'Beynəlxalq hüquq',                             credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '01098' },
      { name: 'Seçmə fənn - 1 (Müasir Siyasi ideologiyalar)', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, codes: ['01107', '01108', '01109'] },
      { name: 'Seçmə fənn - 5 (Transmilli korporasiyalar)',   credit: 8, hours: 60, absenceLimit: 7, weekly: 4, codes: ['01118', '01119', '01120', '01121'] },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '01042' },
      { name: 'Müasir diplomatiya',                           credit: 5, hours: 45, absenceLimit: 5, weekly: 3, code: '01091' },
      { name: 'Azərbaycan Respublikasının Milli təhlükəsizliyinin əsasları', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, code: '01106' },
      { name: 'Seçmə fənn (Fəlsəfə)',                         credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00341', '00149', '00574', '00316', '00632'] },
      { name: 'Seçmə fənn (İnformasiya texnologiyaları (İxtisas üzrə))', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00402', '00404', '00758', '00671', '00830'] },
      { name: 'Seçmə fənn - 3 (İqtisadi diplomatiya)',        credit: 6, hours: 45, absenceLimit: 5, weekly: 3, codes: ['01114', '01140'] },
      { name: 'Seçmə fənn - 7 (Dünya Siyasəti)',              credit: 6, hours: 45, absenceLimit: 5, weekly: 3, codes: ['01125', '01126'] },
    ],
    semester5: [
      { name: 'Siyasət nəzəriyyəsi',                          credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '01087' },
      { name: 'Beynəlxalq təhlükəsizlik',                     credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '01092' },
      { name: 'İnteqrasiya prosesləri və beynəlxalq təşkilatlar', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '01093' },
      { name: 'Azərbaycan Respublikasının xarici siyasəti',  credit: 5, hours: 45, absenceLimit: 5, weekly: 3, code: '01095' },
      { name: 'İxtisas yönümlü xarici dil 1',                 credit: 5, hours: 75, absenceLimit: 9, weekly: 5, code: '01100' },
      { name: 'Seçmə fənn - 4 (Diplomatik protokol və etiket)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['01115', '01116', '01117'] },
    ],
    semester6: [
      { name: 'Müqayisəli siyasi sistemlər',                  credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '01088' },
      { name: 'İxtisas yönümlü xarici dil 2',                 credit: 8, hours: 90, absenceLimit: 11, weekly: 6, code: '01101' },
      { name: 'Seçmə fənn - 2 (Geosiyasət)',                  credit: 5, hours: 45, absenceLimit: 5, weekly: 3, codes: ['01110', '01111', '01112', '01113'] },
      { name: 'Seçmə fənn - 9 (Təbii sərvətlərin iqtisadiyyatı)', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, codes: ['01131', '00169', '00413', '00182', '01132'] },
      { name: 'Seçmə fənn - 10 (Diplomatik yazışma)',         credit: 5, hours: 45, absenceLimit: 5, weekly: 3, codes: ['01133', '01134', '01135', '01136'] },
      { name: 'Seçmə fənn - 11 (Avropanın xarici siyasəti)',  credit: 4, hours: 45, absenceLimit: 5, weekly: 3, codes: ['01137', '01138', '01139'] },
    ],
    semester7: [
      { name: 'Xarici siyasətin təhlili',                     credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '01089' },
      { name: 'Müasir münaqişələr və sülh prosesi',           credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '01094' },
      { name: 'Strateji idarəetmə',                           credit: 3, hours: 45, absenceLimit: 5, weekly: 3, code: '01105' },
      { name: 'İxtisas yönümlü xarici dil 3',                 credit: 7, hours: 90, absenceLimit: 11, weekly: 6, code: '01102' },
      { name: 'Seçmə fənn - 6 (Dövlət qulluğu)',              credit: 8, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00247', '01122', '01123', '01124'] },
      { name: 'Seçmə fənn - 8 (Enerji diplomatiyası)',        credit: 4, hours: 45, absenceLimit: 5, weekly: 3, codes: ['01127', '01128', '01129', '01130'] },
    ],
    semester8: [
      { name: 'İstehsalat təcrübəsi',                         credit: 30, hours: 0, absenceLimit: 0, weekly: 0, code: '00862' },
    ],
  },

/* ─── BEYNƏLXALQ TİCARƏT VƏ LOGİSTİKA ──────────────────────────────────────── */
  internationalTradeLogistics: {
    name: 'Beynəlxalq ticarət və logistika', icon: 'directions_boat',
    semester1: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00004' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '01222' },
      { name: 'İqtisadiyyata giriş',                           credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00021' },
      { name: 'Xətti cəbr və riyazi analiz',                   credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00056' },
      { name: 'İKT - baza komputer bilikləri',                 credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00016' },
    ],
    semester2: [
      { name: 'Azərbaycanın tarixi',                           credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00005' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, hours: 75, absenceLimit: 9, weekly: 5, code: '00122' },
      { name: 'Ehtimal nəzəriyyəsi və riyazi statistika',      credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00071' },
      { name: 'Karyera planlaması',                            credit: 5, hours: 30, absenceLimit: 3, weekly: 2, code: '01223' },
      { name: 'Yumşaq bacarıqlar (Soft skills)',                credit: 9, hours: 30, absenceLimit: 3, weekly: 2, code: '01224' },
    ],
    semester3: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, hours: 90, absenceLimit: 11, weekly: 6, code: '00760' },
      { name: 'Mikroiqtisadiyyat',                              credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00591' },
      { name: 'Logistikanın əsasları',                          credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00519' },
      { name: 'Beynəlxalq ticarət hüququ',                      credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00179' },
      { name: 'Seçmə fənn - 1 (Maliyyə uçotu)',                 credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00531', '00525', '00936', '00749', '00618'] },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, hours: 75, absenceLimit: 9, weekly: 5, code: '00934' },
      { name: 'Makroiqtisadiyyat',                               credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00523' },
      { name: 'Biznesin əsasları',                               credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00200' },
      { name: 'Təchizat zəncirinin idarəedilməsi',               credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00860' },
      { name: 'Seçmə fənn - 4 (Marketinq)',                      credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00532', '00726', '00173', '00710', '00938', '00943', '00378', '00385', '00501'] },
    ],
    semester5: [
      { name: 'Beynəlxalq iqtisadiyyat',                         credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00171' },
      { name: 'Beynəlxalq nəqliyyat əməliyyatları',              credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00177' },
      { name: 'Seçmə fənn - 3 (Rəqəmsal iqtisadiyyat (Sahə iqtisadiyyatı))', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00736', '00779', '00332', '00157', '00821', '00428', '00148', '00221', '01226'] },
      { name: 'Seçmə fənn - 5 (Biznesin əsasları)',              credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00200', '00517', '00880', '00823', '00501'] },
      { name: 'Seçmə fənn - 7 (İqtisadi dinamikanın əsasları)',  credit: 8, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00436', '00418', '00345'] },
    ],
    semester6: [
      { name: 'Statistika',                                      credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00837' },
      { name: 'Menecment',                                       credit: 7, hours: 60, absenceLimit: 7, weekly: 4, code: '00031' },
      { name: 'Beynəlxalq ticarət',                              credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00181' },
      { name: 'Beynəlxalq biznes',                               credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00168' },
      { name: 'Seçmə fənn (İnformasiya texnologiyaları)',        credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00402', '00404', '00758', '00671'] },
    ],
    semester7: [
      { name: 'Seçmə fənn (Fəlsəfə)',                            credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00341', '00830', '00149', '00574', '00316', '00632'] },
      { name: 'Ekonometrika',                                    credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00282' },
      { name: 'Seçmə fənn - 2 (Bank işi)',                       credit: 7, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00160', '00788', '00529', '00222', '00130', '00681', '00617'] },
      { name: 'Seçmə fənn - 8 (İdxal/İxrac əməliyyatları)',      credit: 4, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00386', '00713', '00935', '00169', '01211_1', '01212_2'] },
      { name: 'Seçmə fənn - 9 (Ehtiyatların idarə edilməsi)',    credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00255', '00176', '00711', '01215', '01213'] },
    ],
    semester8: [
      { name: 'Mülki müdafiə',                                   credit: 3, hours: 45, absenceLimit: 5, weekly: 3, code: '00034' },
      { name: 'Seçmə fənn - 6 (Proseslərin idarə edilməsi)',     credit: 7, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00682', '00175', '00610', '00414', '01221'] },
      { name: 'Seçmə fənn - 10 (Anbar təsərrüfatı)',             credit: 4, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00145', '00178', '00567', '01214'] },
      { name: 'Sərt bacarıqlar (Hard skills)',                   credit: 10, hours: 30, absenceLimit: 3, weekly: 2, code: '01225' },
      { name: 'İstehsalat təcrübəsi / layihə',                   credit: 6, hours: 0, absenceLimit: 0, weekly: 0, code: '00454' },
    ],
  },

  /* ─── EKOLOGİYA ──────────────────────────────────────── */
  ecology: {
    name: 'Ekologiya', icon: 'eco',
    semester1: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '01222' },
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00004' },
      { name: 'Kimya', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00026' },
      { name: 'Biologiya', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00006' },
      { name: 'Ali riyaziyyat', credit: 7, hours: 60, absenceLimit: 7, weekly: 4, code: '00001' },
      { name: 'Mülki müdafiə', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, code: '00034' },
    ],
    semester2: [
      { name: 'Azərbaycanın tarixi', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00005' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, hours: 60, absenceLimit: 7, weekly: 4, code: '00073' },
      { name: 'Biosfer və onun mühafizəsi', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00078' },
      { name: 'Fizika', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00083' },
      { name: 'Yer elmlərinin əsasları', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00117' },
      { name: 'Biomüxtəlifliyin qorunması', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00077' },
    ],
    semester3: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '01035' },
      { name: 'Coğrafi ekologiya', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00216' },
      { name: 'Heyvan ekologiyası', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00373' },
      { name: 'Torpaqşünaslıq', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00900' },
      { name: 'Ekoloji kartoqrafiya və coğrafi informasiya sistemləri', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00268' },
      { name: 'Seçmə fənn - 3 (Azərbaycanın coğrafiyası)', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00060', '00061', '00062', '00063', '01218'] },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '01042' },
      { name: 'Ümumi ekologiya', credit: 5, hours: 45, absenceLimit: 5, weekly: 3, code: '00908' },
      { name: 'Ekoloji tədqiqat metodları', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00275' },
      { name: 'Təbii resursların dayanıqlı idarə edilməsi', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00857' },
      { name: 'Seçmə fənn - 2 (Azərbaycanın ekoloji vəziyyəti və problemləri)', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00159', '00281', '00642', '00636'] },
      { name: 'Seçmə fənn - 9 (Təbiətdən istifadənin iqtisadi və ekoloji əsasları)', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00855', '00722', '00947', '00866', '01219'] },
    ],
    semester5: [
      { name: 'Seçmə fənn (Fəlsəfə)', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00341', '00830', '00149', '00574', '00317', '00632'] },
      { name: 'Landşaftşünaslıq və landşaftın ekologiyası', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00513' },
      { name: 'Hava və suyun keyfiyyəti, çirklənməsi və mühafizəsi', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00368' },
      { name: 'Seçmə fənn - 4 (Nəqliyyatın ekoloji problemləri)', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00643', '00472', '00333', '00325', '00185'] },
      { name: 'Seçmə fənn - 5 (Ekoloji fəaliyyətin idarə olunması)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00267', '00335', '00806', '00329', '00272', '00278'] },
      { name: 'Seçmə fənn - 10 (İqtisadiyyat və ekologiya)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00443', '00251', '00712', '00720', '00326'] },
    ],
    semester6: [
      { name: 'Seçmə fənn (Ekologiyada informasiya texnologiyalarının tətbiqi)', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00263', '00405', '00758', '00671'] },
      { name: 'İnsan ekologiyası və dayanıqlı inkişaf', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00421' },
      { name: 'Ekologiya hüququ', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00258' },
      { name: 'Sənaye ekologiyası', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00775' },
      { name: 'Ekoloji kimya', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00269' },
      { name: 'Seçmə fənn - 1 (Urboekologiya)', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00910', '00276', '00137', '00220'] },
    ],
    semester7: [
      { name: 'Meşəçilik', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00578' },
      { name: 'Ekoloji monitorinq', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00270' },
      { name: 'Seçmə fənn - 6 (Ətraf mühitin çirklənməsi)', credit: 7, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00328', '00264', '00232', '00946', '00190'] },
      { name: 'Seçmə fənn - 7 (Ekoloji ekspertiza və layihələndirmənin əsasları)', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00266', '00401', '00337', '01217'] },
      { name: 'Seçmə fənn - 8 (Ekologiya və həyat fəaliyyətinin təhlükəsizliyi)', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00261', '00905', '00279', '00640', '00374', '00310'] },
    ],
    semester8: [
      { name: 'İstehsalat təcrübəsi', credit: 21, hours: 0, absenceLimit: 0, weekly: 0, code: '00861' },
      { name: 'Buraxılış işi', credit: 9, hours: 0, absenceLimit: 0, weekly: 0, code: '00210' },
    ],
  },

  /* ─── STATİSTİKA ──────────────────────────────────────── */
  statistics: {
    name: 'Statistika', icon: 'calculate',
    semester1: [
      { name: 'Azərbaycanın tarixi', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00005' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '01222' },
      { name: 'Xətti cəbr və riyazi analiz', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00056' },
      { name: 'İKT - baza kompyüter bilikləri', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00016' },
      { name: 'Karyera planlaması', credit: 5, hours: 30, absenceLimit: 3, weekly: 2, code: '01223' },
    ],
    semester2: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00004' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, hours: 75, absenceLimit: 9, weekly: 5, code: '00122' },
      { name: 'İqtisadiyyata giriş', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00021' },
      { name: 'Ehtimal nəzəriyyəsi və riyazi statistika', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, code: '00071' },
      { name: 'Yumşaq bacarıqlar (Soft skills)', credit: 9, hours: 30, absenceLimit: 3, weekly: 2, code: '01224' },
    ],
    semester3: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, hours: 90, absenceLimit: 11, weekly: 6, code: '00760' },
      { name: 'Statistika', credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00837' },
      { name: 'Tətbiqi statistika', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00893' },
      { name: 'İqtisadiyyatda əməliyyatların tədqiqi', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00445' },
      { name: 'Seçmə fənn - 4 (Marketinq)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00532', '00726', '00173', '00710', '00938', '00943', '00378', '00385', '00501'] },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, hours: 75, absenceLimit: 9, weekly: 5, code: '00934' },
      { name: 'Ekonometrika', credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00282' },
      { name: 'Statistik modelləşdirməyə giriş', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00833' },
      { name: 'Statistik proqram paketləri', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00834' },
      { name: 'Seçmə fənn - 1 (Maliyyə uçotu)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00531', '00525', '00936', '00749', '00618'] },
    ],
    semester5: [
      { name: 'Seçmə fənn (İnformasiya texnologiyaları)', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00402', '00404', '00758', '00671'] },
      { name: 'Mikroiqtisadiyyat', credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00591' },
      { name: 'Menecment', credit: 7, hours: 60, absenceLimit: 7, weekly: 4, code: '00031' },
      { name: 'Çoxölçülü statistik təhlil', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00217' },
      { name: 'Seçmə fənn - 8 (Qeyri-parametrik metodlar)', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00694', '00593', '00440', '00446'] },
    ],
    semester6: [
      { name: 'Seçmə fənn (Fəlsəfə)', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00341', '00830', '00149', '00574', '00316', '00632'] },
      { name: 'Makroiqtisadiyyat', credit: 10, hours: 60, absenceLimit: 7, weekly: 4, code: '00523' },
      { name: 'Məlumatlar elmi', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00572' },
      { name: 'Seçmə müayinələrin layihələndirilməsi və təhlili', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00771' },
      { name: 'Seçmə fənn - 2 (Bank işi)', credit: 7, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00160', '00788', '00529', '00222', '00130', '00681', '00617'] },
    ],
    semester7: [
      { name: 'Zaman sıralarının təhlili', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00883' },
      { name: 'Seçmə fənn - 3 (Rəqəmsal iqtisadiyyat)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00736', '00779', '00332', '00157', '00821', '00428', '00148', '00221', '01226'] },
      { name: 'Seçmə fənn - 5 (Biznesin əsasları)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00200', '00517', '00880', '00823', '00501'] },
      { name: 'Seçmə fənn - 7 (İqtisadi dinamikanın əsasları)', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00436', '00418', '00345'] },
      { name: 'Seçmə fənn - 10 (Tətbiqi ekonometrika)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00888', '00832', '00254', '00747', '00684'] },
    ],
    semester8: [
      { name: 'Mülki müdafiə', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, code: '00034' },
      { name: 'Sərt bacarıqlar (Hard skills)', credit: 10, hours: 30, absenceLimit: 3, weekly: 2, code: '01225' },
      { name: 'İstehsalat təcrübəsi / layihə', credit: 6, hours: 0, absenceLimit: 0, weekly: 0, code: '00454' },
      { name: 'Seçmə fənn - 6 (Proseslərin idarə edilməsi)', credit: 7, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00682', '00175', '00610', '00414', '01221'] },
      { name: 'Seçmə fənn - 9 (Aktuar hesablamalar)', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00131', '00197', '00371', '00719'] },
    ],
  },

/* ─── DÖVLƏT VƏ BƏLƏDİYYƏ İDARƏETMƏSİ ──────────────────────────────────────── */
  publicAdministration: {
    name: 'Dövlət və bələdiyyə idarəetməsi', icon: 'account_balance',
    semester1: [
      { name: 'Azərbaycanın tarixi',                    credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xətti cəbr və riyazi analiz',            credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İnformasiya kommunikasiya texnologiyaları', credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Menecment',                              credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester2: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, hours: 75, absenceLimit: 9, weekly: 5 },
      { name: 'Ehtimal nəzəriyyəsi və riyazi statistika', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Siyasi elmin əsasları',                 credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Mülki müdafiə',                          credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Karyera planlaması',                     credit: 5, hours: 30, absenceLimit: 3, weekly: 2 },
      { name: 'Yumşaq bacarıqlar (Soft skills)',        credit: 9, hours: 30, absenceLimit: 3, weekly: 2 },
    ],
    semester3: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, hours: 90, absenceLimit: 11, weekly: 6 },
      { name: 'Mikroiqtisadiyyat',                      credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Statistika',                             credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1 (Maliyyə uçotu)',         credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, hours: 90, absenceLimit: 11, weekly: 6 },
      { name: 'Dövlət idarəçiliyi nəzəriyyəsi',         credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Makroiqtisadiyyat',                      credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Bələdiyyə idarəçiliyi',                  credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester5: [
      { name: 'Dövlət qulluğu',                         credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Regional idarəetmə',                     credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Davamlı və inklüziv inkişafın idarə edilməsi', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İnsan resurslarının idarə olunması',     credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 3 (Rəqəmsal iqtisadiyyat)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester6: [
      { name: 'Seçmə fənn (Fəlsəfə)',                   credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn (İnformasiya texnologiyaları)', credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'İnsan inkişafının əsasları',             credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Dövlət idarəçiliyində etika',            credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 4 (Marketinq)',             credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 7 (İqtisadi dinamikanın əsasları)', credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester7: [
      { name: 'Strateji idarəetmə',                     credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2 (Bank işi)',              credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 5 (Biznesin əsasları)',     credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 6 (Proseslərin idarə edilməsi)', credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 9 (Müasir siyasi nəzəriyyələr)', credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester8: [
      { name: 'Milli təhlükəsizlik',                    credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Sərt bacarıqlar (Hard skills)',          credit: 10, hours: 30, absenceLimit: 3, weekly: 2 },
      { name: 'İstehsalat təcrübəsi / layihə',          credit: 6, hours: 0, absenceLimit: 0, weekly: 0 },
      { name: 'Seçmə fənn - 8 (Sosiologiya)',           credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 10 (Müqayisəli siyasi sistemler)', credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
  },

/* ─── BİZNESİN İDARƏ EDİLMƏSİ ──────────────────────────────────────── */
  businessManagement: {
    name: 'Biznesin idarə edilməsi', icon: 'work',
    semester1: [
      { name: 'Azərbaycanın tarixi',                    credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xətti cəbr və riyazi analiz',            credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İKT - baza komputer bilikləri',          credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Karyera planlaması',                     credit: 5, hours: 30, absenceLimit: 3, weekly: 2 },
    ],
    semester2: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, hours: 75, absenceLimit: 9, weekly: 5 },
      { name: 'İqtisadiyyata giriş',                    credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Ehtimal nəzəriyyəsi və riyazi statistika', credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Yumşaq bacarıqlar (Soft skills)',        credit: 9, hours: 30, absenceLimit: 3, weekly: 2 },
    ],
    semester3: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, hours: 90, absenceLimit: 11, weekly: 6 },
      { name: 'Mikroiqtisadiyyat',                      credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Biznesin əsasları',                      credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Təşkilatı davranış',                     credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 5 (Liderlik)',              credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, hours: 90, absenceLimit: 11, weekly: 6 },
      { name: 'Makroiqtisadiyyat',                      credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Marketinq',                              credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 4 (Reklam işi)',            credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 10 (Biznes etikası)',       credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester5: [
      { name: 'Statistika',                             credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Menecment',                              credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İnsan resurslarının idarə edilməsi',     credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Maliyyə uçotu',                          credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Mülki müdafiə',                          credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester6: [
      { name: 'Seçmə fənn (İnformasiya texnologiyaları)', credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Ekonometrika',                           credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Beynəlxalq biznes',                      credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2 (Bank işi)',              credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 8 (İdarəetmə iqtisadiyyatı)', credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester7: [
      { name: 'Seçmə fənn (Fəlsəfə)',                   credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Əməliyyatların idarə edilməsi',          credit: 4, hours: 30, absenceLimit: 3, weekly: 2 },
      { name: 'Sərt bacarıqlar (Hard skills)',          credit: 10, hours: 30, absenceLimit: 3, weekly: 2 },
      { name: 'Seçmə fənn - 6 (Proseslərin idarə edilməsi)', credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 9 (Biznes analitikası)',    credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester8: [
      { name: 'Biznes strategiyası',                    credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İstehsalat təcrübəsi / layihə',          credit: 6, hours: 0, absenceLimit: 0, weekly: 0 },
      { name: 'Seçmə fənn - 1 (Risk və nəzarət)',       credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 3 (Rəqəmsal iqtisadiyyat)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 7 (İqtisadi dinamikanın əsasları)', credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
  },

/* ─── TURİZM İŞİNİN TƏŞKİLİ ──────────────────────────────────────── */
  tourism: {
    name: 'Turizm işinin təşkili', icon: 'luggage',
    semester1: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00004' },
      { name: 'Azərbaycanın tarixi', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00005' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 90, absenceLimit: 11, weekly: 6, code: '01222' },
      { name: 'Turizmə giriş', credit: 5, hours: 45, absenceLimit: 5, weekly: 2, code: '00059_1' },
      { name: 'Biznes riyaziyyatı', credit: 6, hours: 45, absenceLimit: 5, weekly: 2, code: '00069_1' },
      { name: 'Mülki müdafiə və ilkin tibbi yardım', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00068' },
    ],
    semester2: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, hours: 75, absenceLimit: 9, weekly: 5, code: '00073' },
      { name: 'Seçmə fənn (İnformasiya texnologiyaları)', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00402', '00405', '00758', '00671'] },
      { name: 'Biznes statistikası', credit: 5, hours: 45, absenceLimit: 5, weekly: 2, code: '00342' },
      { name: 'Menecmentin əsasları', credit: 5, hours: 45, absenceLimit: 5, weekly: 2, code: '00394' },
      { name: 'Mikroiqtisadiyyat', credit: 5, hours: 45, absenceLimit: 5, weekly: 3, code: '00927' },
      { name: 'Turizm məhsulunun hazırlanması', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00956' },
      { name: 'Sosial tədqiqata giriş', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00400' },
    ],
    semester3: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '01035' },
      { name: 'Seçmə fənn (Fəlsəfə)', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00341', '00830', '00149', '00574', '00317', '00632'] },
      { name: 'Turizmin coğrafiyası', credit: 5, hours: 45, absenceLimit: 5, weekly: 3, code: '00314' },
      { name: 'Makroiqtisadiyyat', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00489' },
      { name: 'Turizm hüququ', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00419' },
      { name: 'Seçmə fənn - 1 (Dünya turizm bazarı)', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00434', '00583', '00633', '00754'] },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '01042' },
      { name: 'Marketinqin əsasları', credit: 5, hours: 45, absenceLimit: 5, weekly: 3, code: '00364' },
      { name: 'Mühasibat uçotu', credit: 5, hours: 45, absenceLimit: 5, weekly: 3, code: '00763' },
      { name: 'Turizm siyasəti və planlaşdırılması', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00769' },
      { name: 'Qonaqpərvərlik sahəsinin idarə edilməsi', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00715' },
      { name: 'Seçmə fənn - 2 (Mədəniyyətlərarası səriştələr)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00800', '00851', '00875', '00901'] },
    ],
    semester5: [
      { name: 'Turizmdə nəqliyyat', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00948' },
      { name: 'Dayanıqlı turizm', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00955' },
      { name: 'Keyfiyyət əsaslı tədqiqat metodları', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00957' },
      { name: 'Seçmə fənn - 3 (Turizm iqtisadiyyatı)', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00958', '00959', '00960', '00961', '00962'] },
      { name: 'Seçmə fənn - 4 (Turizmdə strateji idarəetmə)', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00963', '00964', '00965', '00966', '00967'] },
    ],
    semester6: [
      { name: 'İdarəetmə uçotu və korporativ qərarların verilməsi', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00968' },
      { name: 'İnsan resurslarının idarə edilməsi', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00969' },
      { name: 'Destinasiyaların idarə edilməsi', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00970' },
      { name: 'Bronlaşdırma sistemləri', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00971' },
      { name: 'Turist davranışı və psixologiyası', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00972' },
      { name: 'Seçmə fənn - 5 (Müalicəvi və sağlamlıq turizminin təşkili)', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00973', '00974', '00975', '00976', '00977'] },
    ],
    semester7: [
      { name: 'Turizmdə vasitəçilər', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00978' },
      { name: 'Kəmiyyət əsaslı tədqiqat metodları', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00979' },
      { name: 'Seçmə fənn - 6 (Macəra və idman turizmi)', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00129', '00399', '00735', '00791'] },
      { name: 'Seçmə fənn - 7 (Konqres, tədbirlər və konfransların təşkili)', credit: 8, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00256', '00141', '00777', '00106'] },
      { name: 'Seçmə fənn - 8 (Turizmdə proqnozlaşdırma və planlaşdırma)', credit: 6, hours: 60, absenceLimit: 7, weekly: 3, codes: ['00822', '00869', '00315', '00575'] },
    ],
    semester8: [
      { name: 'İstehsalat təcrübəsi', credit: 21, hours: 0, absenceLimit: 0, weekly: 0, code: '00861' },
      { name: 'Buraxılış işi', credit: 9, hours: 0, absenceLimit: 0, weekly: 0, code: '00210' },
    ],
  },

/* ─── SOSİAL İŞ ──────────────────────────────────────── */
  socialWork: {
    name: 'Sosial iş', icon: 'volunteer_activism',
    semester1: [
      { name: 'Azərbaycanın tarixi', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00005' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '01222' },
      { name: 'Sosiologiya', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00045' },
      { name: 'İnformatika', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00020' },
      { name: 'Sosial işə giriş', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00043' },
      { name: 'Sosial işin nəzəriyyəsi və təcrübəsi-1', credit: 7, hours: 60, absenceLimit: 7, weekly: 4, code: '00044' },
    ],
    semester2: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00004' },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, hours: 60, absenceLimit: 7, weekly: 4, code: '00073' },
      { name: 'Sosial işdə riyazi metodlar', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00111' },
      { name: 'Psixologiya', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00097' },
      { name: 'Sosial iş təcrübəsində etik prinsiplər', credit: 6, hours: 45, absenceLimit: 5, weekly: 3, code: '00109' },
      { name: 'Sosial işin nəzəriyyəsi və təcrübəsi-2', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00112' },
      { name: 'Sosial işdə idarəetmə', credit: 5, hours: 45, absenceLimit: 5, weekly: 3, code: '00110' },
    ],
    semester3: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '00932' },
      { name: 'Sosial statistika', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00826' },
      { name: 'Sosial proqramlar və xidmətlər', credit: 5, hours: 45, absenceLimit: 5, weekly: 3, code: '00819' },
      { name: 'Qloballaşma və beynəlxalq sosial iş', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00714' },
      { name: 'Sosial psixologiya', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00820' },
      { name: 'Seçmə fənn - 1 (Sosial işin təşkili mexanizmləri)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00816', '00828', '00664'] },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, hours: 60, absenceLimit: 7, weekly: 4, code: '01042' },
      { name: 'Fərdlər, qruplar və ailələrlə sosial iş', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00343' },
      { name: 'Azərbaycanda sosial yardım sistemi', credit: 6, hours: 45, absenceLimit: 5, weekly: 3, code: '00158' },
      { name: 'Sosial pedaqogika', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00818' },
      { name: 'Mülki müdafiə', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, code: '00034' },
      { name: 'Seçmə fənn - 2 (Ailə və sosial iş)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00126', '00881', '00772'] },
    ],
    semester5: [
      { name: 'Seçmə fənn (İqtisadiyyat)', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00441', '00149', '00422'] },
      { name: 'Neyrobiologiya', credit: 4, hours: 45, absenceLimit: 5, weekly: 3, code: '00644' },
      { name: 'Sosial siyasət', credit: 5, hours: 60, absenceLimit: 7, weekly: 4, code: '00824' },
      { name: 'Defektologiya', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00225' },
      { name: 'Seçmə fənn - 3 (Miqrantlarla sosial iş)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00595', '00349', '00125', '00748'] },
      { name: 'Seçmə fənn - 4 (Sosial işdə məşğulluq və kadr potensialı)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00809', '00227', '00856'] },
    ],
    semester6: [
      { name: 'Seçmə fənn (Müasir təbiətşünaslıq konsepsiyası)', credit: 3, hours: 45, absenceLimit: 5, weekly: 3, codes: ['00614', '00608', '00350', '00632', '00341', '00671', '00574'] },
      { name: 'Sosial işdə tədqiqat metodları', credit: 9, hours: 60, absenceLimit: 7, weekly: 4, code: '00811' },
      { name: 'Psixi sağlamlıq', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00683' },
      { name: 'Seçmə fənn - 5 (Sosial iqtisadiyyat)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00807', '00784', '00823'] },
      { name: 'Seçmə fənn - 6 (Sosial işin qiymətləndirilməsi)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00815', '00829', '00827'] },
    ],
    semester7: [
      { name: 'Keys menecment', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, code: '00467' },
      { name: 'Seçmə fənn - 7 (Sosial işin iqtisadiyyatı və idarə edilməsi)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00814', '00810', '00725'] },
      { name: 'Seçmə fənn - 8 (Sosial işin investisiya və maliyyə problemləri)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00813', '00299', '00950', '00420'] },
      { name: 'Seçmə fənn - 9 (Sosial iş fəaliyyətində innovasiyalar)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00808', '00911', '00717'] },
      { name: 'Seçmə fənn - 10 (Sosial işin inteqrasiya modeli)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4, codes: ['00812', '00686', '00127'] },
    ],
    semester8: [
      { name: 'İstehsalat təcrübəsi', credit: 30, hours: 0, absenceLimit: 0, weekly: 0, code: '00862' },
    ],
  },
};

/* =============================================================
   FƏNN ŞİFRLƏRİ  –  Rəsmi tədris planı (Forma №1) üzrə
   Hər fənnin öz şifri var. pdfs.js-də fənnə  code: "00591"  yazılanda
   Kurslar bölməsində ixtisas filtri bu şifrlərə (və fənn adlarına) görə işləyir.
   Qeyd: eyni fənnin şifri ixtisaslara görə fərqli ola bilər (məs. Xarici dil).

   semester: 1–8  (P–1 → 1, Y–1 → 2, P–2 → 3, Y–2 → 4, P–3 → 5, Y–3 → 6, P–4 → 7, Y–4 → 8)
   prereq  : öncə keçilməli fənnin şifri
   Seçmə fənn qrupları: istənilən bir fənn seçilir; qrupdakı hər fənnin öz şifri var.
   ============================================================= */
const CURRICULUM_CODES = {

  /* ─── 6004004 – İQTİSADİYYAT (bakalavriat, 4 il / 8 semestr) ── */
  economics: {
    name: 'İqtisadiyyat',
    specialtyCode: '6004004',

    // Ümumi fənlər
    general: [
      { code: '00004', name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, semester: 2 },
      { code: '00005', name: 'Azərbaycanın tarixi',                                   credit: 5, semester: 1 },
      { code: '01222', name: 'Xarici dildə işgüzar və akademik kommunikasiya-1',      credit: 4, semester: 1 },
      { code: '00122', name: 'Xarici dildə işgüzar və akademik kommunikasiya-2',      credit: 3, semester: 2, prereq: ['01222'] },
      { code: '00760', name: 'Xarici dildə işgüzar və akademik kommunikasiya-3',      credit: 4, semester: 3, prereq: ['00122'] },
      { code: '00934', name: 'Xarici dildə işgüzar və akademik kommunikasiya-4',      credit: 4, semester: 4, prereq: ['00760'] },
    ],

    // Seçmə fənlər (ümumi fənlər üzrə)
    generalElectives: [
      { title: 'Seçmə fənn (ümumi) – 1', credit: 3, semester: 6, subjects: [
        { code: '00341', name: 'Fəlsəfə' },
        { code: '00830', name: 'Sosiologiya' },
        { code: '00149', name: 'AR Konstitusiyası və hüququn əsasları' },
        { code: '00574', name: 'Məntiq' },
        { code: '00316', name: 'Etika' },
        { code: '00632', name: 'Multikulturalizmə giriş' },
      ]},
      { title: 'Seçmə fənn (ümumi) – 2', credit: 3, semester: 7, subjects: [
        { code: '00402', name: 'İnformasiya texnologiyaları' },
        { code: '00404', name: 'İnformasiyanın idarə edilməsi' },
        { code: '00758', name: 'Sahibkarlığın əsasları və biznesə giriş' },
        { code: '00671', name: 'Politologiya' },
      ]},
    ],

    // İxtisas fənləri
    major: [
      { code: '00021', name: 'İqtisadiyyata giriş',                        credit: 6,  semester: 2 },
      { code: '00591', name: 'Mikroiqtisadiyyat',                          credit: 10, semester: 3 },
      { code: '00523', name: 'Makroiqtisadiyyat',                          credit: 10, semester: 4 },
      { code: '00056', name: 'Xətti cəbr və riyazi analiz',                credit: 8,  semester: 1 },
      { code: '00071', name: 'Ehtimal nəzəriyyəsi və riyazi statistika',   credit: 8,  semester: 2 },
      { code: '00016', name: 'İKT - baza komputer bilikləri',              credit: 8,  semester: 1 },
      { code: '00837', name: 'Statistika',                                 credit: 10, semester: 5 },
      { code: '00282', name: 'Ekonometrika',                               credit: 10, semester: 6 },
      { code: '00031', name: 'Menecment',                                  credit: 7,  semester: 5 },
      { code: '00821', name: 'Sosial sahələrin iqtisadiyyatı',             credit: 6,  semester: 6 },
      { code: '00171', name: 'Beynəlxalq iqtisadiyyat',                    credit: 4,  semester: 5 },
      { code: '00411', name: 'İnkişaf iqtisadiyyatı',                      credit: 4,  semester: 7 },
      { code: '00157', name: 'Azərbaycan iqtisadiyyatı',                   credit: 6,  semester: 4 },
      { code: '00736', name: 'Rəqəmsal iqtisadiyyat (Sahə iqtisadiyyatı)', credit: 6,  semester: 5 },
      { code: '00332', name: 'Ətraf mühitin iqtisadiyyatı',                credit: 6,  semester: 3 },
      { code: '00438', name: 'İqtisadi fikir tarixi',                      credit: 4,  semester: 4 },
      { code: '00307', name: 'Əməyin iqtisadiyyatı',                       credit: 4,  semester: 3 },
      { code: '00034', name: 'Mülki müdafiə',                              credit: 3,  semester: 5 },
    ],

    // Seçmə fənlər (ixtisas fənləri üzrə)
    majorElectives: [
      { title: 'Seçmə fənn (ixtisas) – 1', credit: 6, semester: 4, subjects: [
        { code: '00531', name: 'Maliyyə uçotu' },
        { code: '00525', name: 'Maliyyə hesabatlılığı' },
        { code: '00936', name: 'Xərclərin idarə edilməsi' },
        { code: '00749', name: 'Risk və nəzarət' },
        { code: '00618', name: 'Mühasibatda proqram təminatı' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 2', credit: 7, semester: 6, subjects: [
        { code: '00160', name: 'Bank işi' },
        { code: '00788', name: 'Sığorta' },
        { code: '00529', name: 'Maliyyə riyaziyyatı' },
        { code: '00222', name: 'Davranış maliyyəsi' },
        { code: '00130', name: 'Aktivlərin qiymətləndirilməsi və idarə edilməsi' },
        { code: '00681', name: 'Maliyyə mühəndisliyi' },
        { code: '00617', name: 'Könüllülük fəaliyyəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 3', credit: 6, semester: 8, subjects: [
        { code: '00736', name: 'Rəqəmsal iqtisadiyyat (Sahə iqtisadiyyatı)' },
        { code: '00779', name: 'Sənaye iqtisadiyyatı' },
        { code: '00332', name: 'Ətraf mühitin iqtisadiyyatı' },
        { code: '00157', name: 'Azərbaycan iqtisadiyyatı' },
        { code: '00821', name: 'Sosial sahələrin iqtisadiyyatı' },
        { code: '00428', name: 'İnstitutsional iqtisadiyyat' },
        { code: '00148', name: 'Aqrar iqtisadiyyat' },
        { code: '00221', name: 'Davranış iqtisadiyyatı' },
        { code: '01226', name: 'Yaşıl iqtisadiyyatın əsasları' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 4', credit: 6, semester: 3, subjects: [
        { code: '00532', name: 'Marketinq' },
        { code: '00726', name: 'Reklam işi' },
        { code: '00173', name: 'Beynəlxalq marketinq' },
        { code: '00710', name: 'Qiymət siyasəti' },
        { code: '00938', name: 'Xidmətlərin marketinqi' },
        { code: '00943', name: 'Yeni məhsulların inkişaf etdirilməsi' },
        { code: '00378', name: 'İctimaiyyətlə əlaqələr' },
        { code: '00385', name: 'İdman marketinqi' },
        { code: '00501', name: 'Könüllülük fəaliyyəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 5', credit: 6, semester: 8, subjects: [
        { code: '00200', name: 'Biznesin əsasları' },
        { code: '00517', name: 'Liderlik' },
        { code: '00880', name: 'Təşkilat nəzəriyyəsi' },
        { code: '00823', name: 'Sosial sahibkarlıq' },
        { code: '00501', name: 'Könüllülük fəaliyyəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 6', credit: 7, semester: 7, subjects: [
        { code: '00682', name: 'Proseslərin idarə edilməsi' },
        { code: '00175', name: 'Beynəlxalq menecment' },
        { code: '00610', name: 'Müasir idarəetmə metodları' },
        { code: '00414', name: 'İnkişafın idarə edilməsi' },
        { code: '01221', name: 'Dayanaqlı inkişaf' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 7', credit: 8, semester: 8, subjects: [
        { code: '00436', name: 'İqtisadi dinamikanın əsasları' },
        { code: '00418', name: 'İnnovasiya iqtisadiyyatı' },
        { code: '00345', name: 'Firmalar, bazarlar və rəqabət' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 8', credit: 4, semester: 8, subjects: [
        { code: '00439', name: 'İqtisadi siyasət' },
        { code: '00172', name: 'Beynəlxalq makroiqtisadiyyat' },
        { code: '00521', name: 'Makroiqtisadi göstəricilərin qiymətləndirilməsi və inkişafın diaqnostikası' },
        { code: '00410', name: 'İnkişaf etməkdə olan ölkələrin makroiqtisadiyyatı' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 9', credit: 4, semester: 6, subjects: [
        { code: '00859', name: 'Təbii sərvətlərin iqtisadiyyatı' },
        { code: '00169', name: 'Beynəlxalq biznes iqtisadiyyatı' },
        { code: '00413', name: 'İnkişafda institutların rolu' },
        { code: '00182', name: 'Bilik iqtisadiyyatı' },
        { code: '01141', name: 'Avropa İttifaqında Effektiv Layihə İdarəetməsi: Ən Yaxşı Təcrübələr və Nümunə Tədqiqatlar (EUPMO)' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 10', credit: 6, semester: 7, subjects: [
        { code: '00888', name: 'Tətbiqi ekonometrika' },
        { code: '00635', name: 'Müqayisəli iqtisadi sistemlər' },
        { code: '00437', name: 'İqtisadi diplomatiya' },
        { code: '00724', name: 'Regional iqtisadiyyat' },
        { code: '00412', name: 'İnkişaf mikroiqtisadiyyatı' },
      ]},
    ],

    // Təcrübə
    practice: [
      { code: '01223', name: 'Karyera planlaması',               credit: 5,  semester: 1 },
      { code: '01224', name: 'Yumşaq bacarıqlar (Soft skills)',  credit: 9,  semester: 2 },
      { code: '01225', name: 'Sərt bacarıqlar (Hard skills)',    credit: 10, semester: 7 },
      { code: '00454', name: 'İstehsalat təcrübəsi / layihə',    credit: 6,  semester: 8 },
    ],
  },

  /* ─── 6006023 – QİDA MÜHƏNDİSLİYİ (bakalavriat, 4 il / 8 semestr) ── */
  foodEngineering: {
    name: 'Qida mühəndisliyi',
    specialtyCode: '6006023',
    // Qeyd: planda “Süd texnologiyası / Pendirin texnologiyası / Dəniz məhsullarının emalı texnologiyası”
    // qrupunda 00228 şifri iki dəfə yazılıb (4 şifr, 3 fənn). Burada 00847, 00661, 00228 götürülüb.

    // Ümumi fənlər
    general: [
      { code: '00004', name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, semester: 3 },
      { code: '00005', name: 'Azərbaycan tarixi',                                    credit: 5, semester: 1 },
      { code: '01222', name: 'Xarici dildə işgüzar və akademik kommunikasiya-1',     credit: 4, semester: 1 },
      { code: '00073', name: 'Xarici dildə işgüzar və akademik kommunikasiya-2',     credit: 3, semester: 2, prereq: ['01222'] },
      { code: '00932', name: 'Xarici dildə işgüzar və akademik kommunikasiya-3',     credit: 4, semester: 3, prereq: ['00073'] },
      { code: '00933', name: 'Xarici dildə işgüzar və akademik kommunikasiya-4',     credit: 4, semester: 4, prereq: ['00932'] },
    ],

    // Seçmə fənlər (ümumi fənlər üzrə)
    generalElectives: [
      { title: 'Seçmə fənn (ümumi) – 1', credit: 3, semester: 4, subjects: [
        { code: '00341', name: 'Fəlsəfə' },
        { code: '00830', name: 'Sosiologiya' },
        { code: '00149', name: 'AR Konstitusiyası və hüququn əsasları' },
        { code: '00574', name: 'Məntiq' },
        { code: '00317', name: 'Etika və estetika' },
        { code: '00632', name: 'Multikulturalizmə giriş' },
      ]},
      { title: 'Seçmə fənn (ümumi) – 2', credit: 3, semester: 5, subjects: [
        { code: '00402', name: 'İnformasiya texnologiyaları' },
        { code: '00404', name: 'İnformasiyanın idarə edilməsi' },
        { code: '00758', name: 'Sahibkarlığın əsasları və biznesə giriş' },
        { code: '00671', name: 'Politologiya' },
      ]},
    ],

    // İxtisas fənləri
    major: [
      { code: '00055', name: 'Xətti cəbr və analitik həndəsə',                          credit: 4, semester: 1 },
      { code: '00040', name: 'Riyazi analiz',                                           credit: 8, semester: 2 },
      { code: '00891', name: 'Tətbiqi riyaziyyat',                                      credit: 4, semester: 3 },
      { code: '00051', name: 'Ümumi kimya',                                             credit: 6, semester: 1 },
      { code: '00003', name: 'Analitik kimya',                                          credit: 5, semester: 1 },
      { code: '00115', name: 'Üzvi kimya',                                              credit: 5, semester: 2 },
      { code: '00697', name: 'Qida kimyası',                                            credit: 4, semester: 3 },
      { code: '00014', name: 'Fizikanın əsasları',                                      credit: 6, semester: 1 },
      { code: '00113', name: 'Tətbiqi Fizika',                                          credit: 5, semester: 2 },
      { code: '00066', name: 'İxtisasa giriş',                                          credit: 4, semester: 2 },
      { code: '00482', name: 'Kompüter əsaslı mühəndis qrafikası',                      credit: 4, semester: 5 },
      { code: '00703', name: 'Qida məhsullarının soyudulma texnologiyası',              credit: 8, semester: 5 },
      { code: '00704', name: 'Qida məhsullarının təhlükəsizliyi',                       credit: 6, semester: 6 },
      { code: '00699', name: 'Qida məhsullarının biokimyası',                           credit: 7, semester: 4 },
      { code: '00756', name: 'Sağlamlıq və əməyin mühafizəsi',                          credit: 4, semester: 7 },
      { code: '00464', name: 'Keyfiyyəti idarəetmə sistemləri',                         credit: 5, semester: 7 },
      { code: '00705', name: 'Qida mikrobiologiyası',                                   credit: 7, semester: 4 },
      { code: '00709', name: 'Qida sənayesində texnoloji əməliyyatlar',                 credit: 4, semester: 7 },
      { code: '00700', name: 'Qida məhsullarının keyfiyyətinə texniki-kimyəvi nəzarət', credit: 4, semester: 4 },
      { code: '00707', name: 'Qida mühəndisliyində qidalanma və sağlamlıq',             credit: 7, semester: 3 },
      { code: '00696', name: 'Qida biotexnologiyası',                                   credit: 4, semester: 6 },
      { code: '00708', name: 'Qida sənayesi müəssisələrində texnoloji layihələndirmə',  credit: 6, semester: 6 },
      { code: '00034', name: 'Mülki müdafiə',                                           credit: 3, semester: 5 },
    ],

    // Seçmə fənlər (ixtisas fənləri üzrə)
    majorElectives: [
      { title: 'Seçmə fənn (ixtisas) – 1', credit: 5, semester: 2, subjects: [
        { code: '00076', name: 'Biologiya' },
        { code: '00099', name: 'Qida toksikologiyası və çirkləndiricilər' },
        { code: '00098', name: 'Qida müəssisələrində HACCP standartları' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 2', credit: 7, semester: 3, subjects: [
        { code: '00909', name: 'Ümumi mikrobiologiya' },
        { code: '00369', name: 'Hazır qida istehsalı texnologiyası' },
        { code: '00898', name: 'Tibbi və funksional qidalar kimyası' },
        { code: '00952', name: 'Fiziki kimya' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 3', credit: 4, semester: 6, subjects: [
        { code: '00252', name: 'Ədədi analiz' },
        { code: '00564', name: 'Maye mexanikası' },
        { code: '00877', name: 'Termodinamika' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 4', credit: 6, semester: 5, subjects: [
        { code: '00458', name: 'İstilik və kütlə transferi' },
        { code: '00510', name: 'Kütləvə enerji balansları' },
        { code: '00721', name: 'Reaksiya kinetikası' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 5', credit: 6, semester: 5, subjects: [
        { code: '00203', name: 'Bölmə əməliyyatları laboratoriyası' },
        { code: '00134', name: 'Alkoqollu və alkoqolsuz içkilərin texnologiyası' },
        { code: '00698', name: 'Qida konsentratlarının texnologiyası' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 6', credit: 5, semester: 4, subjects: [
        { code: '00706', name: 'Qida mühəndisliyi dizaynı və iqtisadiyyatı' },
        { code: '00838', name: 'Statistika' },
        { code: '00444', name: 'İqtisadiyyat' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 7', credit: 5, semester: 6, subjects: [
        { code: '00940', name: 'Yağ texnologiyası' },
        { code: '00953', name: 'Qida əlavələri' },
        { code: '00701', name: 'Qida məhsullarının qablaşdırılması' },
        { code: '00954', name: 'Təhlil nəticələrinin qiymətləndirilməsi' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 8', credit: 5, semester: 6, subjects: [
        { code: '00854', name: 'Taxıl texnologiyası' },
        { code: '00691', name: 'Qənnadı məmulatların texnologiyası' },
        { code: '00191', name: 'Bitkiçilik məhsullarının texnologiyası' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 9', credit: 5, semester: 7, subjects: [
        { code: '00586', name: 'Meyvə və tərəvəz texnologiyası' },
        { code: '00607', name: 'Müalicəvi dərman bitkilərinin istehsal texnologiyası' },
        { code: '00215', name: 'Qida məhsullarının qurutma texnologiyası' },
        { code: '00344', name: 'Ferment və fermentasiya texnologiyası' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 10', credit: 6, semester: 7, subjects: [
        { code: '00318', name: 'Ət texnologiyası' },
        { code: '00348', name: 'Funksional qida məhsullarının texnologiyası' },
        { code: '00702', name: 'Qida məhsullarının saxlanması texnologiyası' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 11', credit: 6, semester: 7, subjects: [
        { code: '00847', name: 'Süd texnologiyası' },
        { code: '00661', name: 'Pendirin texnologiyası' },
        { code: '00228', name: 'Dəniz məhsullarının emalı texnologiyası' },
      ]},
    ],

    // Təcrübə və buraxılış işi
    practice: [
      { code: '00861', name: 'Təcrübə',       credit: 21, semester: 8 },
      { code: '00210', name: 'Buraxılış işi', credit: 9, semester: 8 },
    ],
  },

  /* ─── 6003005 – DİZAYN (sahələr üzrə, bakalavriat, 4 il / 8 semestr) ── */
  design: {
    name: 'Dizayn',
    specialtyCode: '6003005',
    // İstiqamətlər: 1) Sənaye dizaynı  2) Qrafik dizayn  3) Mühit dizaynı  4) Geyim dizaynı
    // (‘istiqamət üzrə’ seçmələrdə hər istiqamət üçün ayrı fənn var, fənnin sonunda mötərizədə yazılıb)

    // Ümumi fənlər
    general: [
      { code: '00004', name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, semester: 2 },
      { code: '00005', name: 'Azərbaycanın tarixi',                                  credit: 5, semester: 1 },
      { code: '00122', name: 'Xarici dildə işgüzar və akademik kommunikasiya-1',     credit: 4, semester: 1 },
      { code: '00073', name: 'Xarici dildə işgüzar və akademik kommunikasiya-2',     credit: 3, semester: 2, prereq: ['00122'] },
      { code: '00932', name: 'Xarici dildə işgüzar və akademik kommunikasiya-3',     credit: 4, semester: 3, prereq: ['00073'] },
      { code: '01079', name: 'Xarici dildə işgüzar və akademik kommunikasiya-4',     credit: 4, semester: 4, prereq: ['00932'] },
    ],

    // Seçmə fənlər (ümumi fənlər üzrə)
    generalElectives: [
      { title: 'Seçmə fənn (ümumi) – 1', credit: 3, semester: 7, subjects: [
        { code: '00341', name: 'Fəlsəfə' },
        { code: '00830', name: 'Sosiologiya' },
        { code: '00980_1', name: 'Hüququn əsasları' },
        { code: '00574', name: 'Məntiq' },
        { code: '00317', name: 'Etika və estetika' },
        { code: '00941', name: 'Yaradıcılıq psixologiyası' },
      ]},
      { title: 'Seçmə fənn (ümumi) – 2', credit: 3, semester: 4, subjects: [
        { code: '00402', name: 'İnformasiya texnologiyaları' },
        { code: '00404', name: 'İnformasiyanın idarə edilməsi' },
        { code: '00758', name: 'Sahibkarlığın əsasları və biznesə giriş' },
        { code: '00671', name: 'Politologiya' },
      ]},
    ],

    // İxtisas fənləri
    major: [
      { code: '00039', name: 'Rəsm-1',                  credit: 6, semester: 1 },
      { code: '00103', name: 'Rəsm-2',                  credit: 5, semester: 2, prereq: ['00039'] },
      { code: '00745', name: 'Rəsm-3',                  credit: 5, semester: 3, prereq: ['00103'] },
      { code: '00746', name: 'Rəsm-4',                  credit: 4, semester: 4, prereq: ['00745'] },
      { code: '00038', name: 'Rəngkarlıq-1',            credit: 5, semester: 1 },
      { code: '00102', name: 'Rəngkarlıq-2',            credit: 5, semester: 2, prereq: ['00038'] },
      { code: '00728', name: 'Rəngkarlıq-3',            credit: 4, semester: 3, prereq: ['00102'] },
      { code: '00729', name: 'Rəngkarlıq-4',            credit: 4, semester: 4, prereq: ['00728'] },
      { code: '00663', name: 'Perspektiva',             credit: 6, semester: 3 },
      { code: '00008', name: 'Dizaynın əsasları-1',     credit: 5, semester: 1 },
      { code: '00079', name: 'Dizaynın əsasları-2',     credit: 5, semester: 2, prereq: ['00008'] },
      { code: '00312', name: 'Erqonomika',              credit: 5, semester: 3 },
      { code: '00007', name: 'Dizayn tarixi',           credit: 5, semester: 1 },
      { code: '00632', name: 'Multikulturalizmə giriş', credit: 3, semester: 7 },
      { code: '00034', name: 'Mülki müdafiə',           credit: 3, semester: 6 },
    ],

    // Seçmə fənlər (ixtisas fənləri üzrə)
    majorElectives: [
      { title: 'Seçmə fənn (ixtisas) – 1', credit: 5, semester: 5, subjects: [
        { code: '00716', name: 'Qrafik dizayn proqramları' },
        { code: '00237', name: 'Dizayn məhsullarının bədii layihələndirməsi' },
        { code: '00568', name: 'Məhsul dizaynı' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 2', credit: 6, semester: 6, subjects: [
        { code: '00603', name: 'Moda və kostyum tarixi' },
        { code: '00506', name: 'Kostyumda estetik mədəniyyət' },
        { code: '00609', name: 'Müasir geyim sənəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 3', credit: 8, semester: 2, subjects: [
        { code: '00100', name: 'Qrafik dizayn' },
        { code: '00101', name: 'Reklamda firma stili' },
        { code: '00075', name: 'Aydentika və brend-dizayn' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 4', credit: 6, semester: 7, subjects: [
        { code: '00660', name: 'Parçaların bədii tərtibatı' },
        { code: '00355', name: 'Geyim və aksessuarların dizaynı' },
        { code: '00612', name: 'Müasir incəsənət' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 5', credit: 6, semester: 6, subjects: [
        { code: '00604', name: 'Moda və stil' },
        { code: '00339', name: 'Fashion illyustrasiya' },
        { code: '00602', name: 'Moda tendensiyaları' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 6', credit: 6, semester: 6, subjects: [
        { code: '00226', name: 'Dekorativ tətbiqi sənət' },
        { code: '00786', name: 'Şərq xalqlarının dekorativ tətbiqi sənəti' },
        { code: '00654', name: 'Ornament tarixi' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 7', credit: 6, semester: 6, subjects: [
        { code: '00507', name: 'Kostyumun kompozisiyası' },
        { code: '00238', name: 'Dizayn və texniki estetika' },
        { code: '00156', name: 'Azərbaycan incəsənət tarixi' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 8', credit: 5, semester: 5, subjects: [
        { code: '00358', name: 'Geyimin modelləşdirilməsi' },
        { code: '00354', name: 'Geyim formalarının və dizayn-layihələndirmənin əsasları' },
        { code: '00505', name: 'Kostyum dizaynında ornament' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 9', credit: 5, semester: 5, subjects: [
        { code: '00471', name: 'Koloristika' },
        { code: '00239', name: 'Dizaynda rəng qammaları' },
        { code: '00240', name: 'Dizaynda staylinq' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 10', credit: 6, semester: 3, subjects: [
        { code: '00500', name: 'Konstruktivləşmənin əsasları' },
        { code: '00356', name: 'Geyimin konstruksiyası' },
        { code: '00161', name: 'Bədii konstruksiyalaşdırma' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 11', credit: 7, semester: 4, subjects: [
        { code: '00514', name: 'Layihə qrafikası' },
        { code: '00573', name: 'Məmulatların bədii layihələndirilməsi' },
        { code: '00516', name: 'Layihələndirmənin əsasları' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 12', credit: 3, semester: 6, subjects: [
        { code: '00548', name: 'Material, texnika və texnologiya' },
        { code: '00872', name: 'Tekstil məmulatların bədii tərtibatı' },
        { code: '00873', name: 'Tekstildə ornament kompozisiyaları' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 13', credit: 8, semester: 4, subjects: [
        { code: '00372', name: 'Heykəltəraşlıq' },
        { code: '00477', name: 'Komposiziya' },
        { code: '00666', name: 'Plastik anatomiya' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 14', credit: 6, semester: 7, subjects: [
        { code: '00890', name: 'Tətbiqi mexanika' },
        { code: '00205', name: 'Brend və reklam' },
        { code: '00359', name: 'Gön-dəri məmulatlarının bədii layihələndirilməsi' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 15', credit: 5, semester: 5, subjects: [
        { code: '00162', name: 'Bədii qrafika' },
        { code: '00150', name: 'Art-dizayn obyektlərinin layihələndirilməsi' },
        { code: '00774', name: 'Sənaye dizaynı' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 16 (istiqamət üzrə)', credit: 5, semester: 5, subjects: [
        { code: '00569', name: 'Məhsulların bədii tərtibatı (Sənaye dizaynı)' },
        { code: '00123', name: '«SketchUp», «Blender» (Qrafik dizayn)' },
        { code: '00631', name: 'Mühit və interyer dizaynı (Mühit dizaynı)' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 17 (istiqamət üzrə)', credit: 5, semester: 5, subjects: [
        { code: '00357', name: 'Geyimin layihələndirilməsi (Geyim dizaynı)' },
        { code: '00431', name: 'İnteryer və tekstil dizaynı (Mühit dizaynı)' },
        { code: '00727', name: 'Reklam və dizayn (Qrafik dizayn)' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 18 (istiqamət üzrə)', credit: 6, semester: 7, subjects: [
        { code: '00673', name: 'Portfolio (Sənaye dizaynı)' },
        { code: '00601', name: 'Moda portfoliosu (Geyim dizaynı)' },
        { code: '00236', name: 'Dizayn layihələrinin portfoliosu (Qrafik dizayn)' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 19 (istiqamət üzrə)', credit: 6, semester: 7, subjects: [
        { code: '00520', name: 'Maketləşdirmə (Sənaye dizaynı)' },
        { code: '00353', name: 'Geyim dizaynında maketləşdirmə (Geyim dizaynı)' },
        { code: '00630', name: 'Mühit dizaynında maketləşdirmə (Mühit dizaynı)' },
      ]},
    ],

    // Təcrübə və buraxılış işi
    practice: [
      { code: '00861', name: 'Təcrübə',       credit: 21, semester: 8 },
      { code: '00210', name: 'Buraxılış işi', credit: 9, semester: 8 },
    ],
  },

  /* ─── 6004001 – BEYNƏLXALQ TİCARƏT VƏ LOGİSTİKA (bakalavriat, 4 il / 8 semestr) ── */
  internationalTradeLogistics: {
    name: 'Beynəlxalq ticarət və logistika',
    specialtyCode: '6004001',
    // İstiqamətlər: 1) Beynəlxalq ticarət  2) Beynəlxalq yükdaşımalar  3) Beynəlxalq biznes
    // (8–10-cu ‘istiqamət üzrə’ seçmə qruplarında hər istiqamət üçün ayrı fənn var)

    // Ümumi fənlər
    general: [
      { code: '00004', name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, semester: 1 },
      { code: '00005', name: 'Azərbaycanın tarixi',                                  credit: 5, semester: 2 },
      { code: '01222', name: 'Xarici dildə işgüzar və akademik kommunikasiya-1',     credit: 4, semester: 1 },
      { code: '00122', name: 'Xarici dildə işgüzar və akademik kommunikasiya-2',     credit: 3, semester: 2, prereq: ['01222'] },
      { code: '00760', name: 'Xarici dildə işgüzar və akademik kommunikasiya-3',     credit: 4, semester: 3, prereq: ['00122'] },
      { code: '00934', name: 'Xarici dildə işgüzar və akademik kommunikasiya-4',     credit: 4, semester: 4, prereq: ['00760'] },
    ],

    // Seçmə fənlər (ümumi fənlər üzrə)
    generalElectives: [
      { title: 'Seçmə fənn (ümumi) – 1', credit: 3, semester: 7, subjects: [
        { code: '00341', name: 'Fəlsəfə' },
        { code: '00830', name: 'Sosiologiya' },
        { code: '00149', name: 'AR Konstitusiyası və hüququn əsasları' },
        { code: '00574', name: 'Məntiq' },
        { code: '00316', name: 'Etika' },
        { code: '00632', name: 'Multikulturalizmə giriş' },
      ]},
      { title: 'Seçmə fənn (ümumi) – 2', credit: 3, semester: 6, subjects: [
        { code: '00402', name: 'İnformasiya texnologiyaları' },
        { code: '00404', name: 'İnformasiyanın idarə edilməsi' },
        { code: '00758', name: 'Sahibkarlığın əsasları və biznesə giriş' },
        { code: '00671', name: 'Politologiya' },
      ]},
    ],

    // İxtisas fənləri
    major: [
      { code: '00021', name: 'İqtisadiyyata giriş',                      credit: 6, semester: 1 },
      { code: '00591', name: 'Mikroiqtisadiyyat',                        credit: 10, semester: 3 },
      { code: '00523', name: 'Makroiqtisadiyyat',                        credit: 10, semester: 4 },
      { code: '00056', name: 'Xətti cəbr və riyazi analiz',              credit: 8, semester: 1 },
      { code: '00071', name: 'Ehtimal nəzəriyyəsi və riyazi statistika', credit: 8, semester: 2 },
      { code: '00016', name: 'İKT - baza komputer bilikləri',            credit: 8, semester: 1 },
      { code: '00837', name: 'Statistika',                               credit: 10, semester: 6 },
      { code: '00282', name: 'Ekonometrika',                             credit: 10, semester: 7 },
      { code: '00031', name: 'Menecment',                                credit: 7, semester: 6 },
      { code: '00200', name: 'Biznesin əsasları',                        credit: 6, semester: 4 },
      { code: '00519', name: 'Logistikanın əsasları',                    credit: 6, semester: 3 },
      { code: '00171', name: 'Beynəlxalq iqtisadiyyat',                  credit: 4, semester: 5 },
      { code: '00181', name: 'Beynəlxalq ticarət',                       credit: 4, semester: 6 },
      { code: '00177', name: 'Beynəlxalq nəqliyyat əməliyyatları',       credit: 6, semester: 5 },
      { code: '00860', name: 'Təchizat zəncirinin idarə edilməsi',       credit: 4, semester: 4 },
      { code: '00179', name: 'Beynəlxalq ticarət hüququ',                credit: 4, semester: 3 },
      { code: '00168', name: 'Beynəlxalq biznes',                        credit: 6, semester: 6 },
      { code: '00034', name: 'Mülki müdafiə',                            credit: 3, semester: 8 },
    ],

    // Seçmə fənlər (ixtisas fənləri üzrə)
    majorElectives: [
      { title: 'Seçmə fənn (ixtisas) – 1', credit: 6, semester: 3, subjects: [
        { code: '00531', name: 'Maliyyə uçotu' },
        { code: '00525', name: 'Maliyyə hesabatlılığı' },
        { code: '00936', name: 'Xərclərin idarə edilməsi' },
        { code: '00749', name: 'Risk və nəzarət' },
        { code: '00618', name: 'Mühasibatda proqram təminatı' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 2', credit: 7, semester: 7, subjects: [
        { code: '00160', name: 'Bank işi' },
        { code: '00788', name: 'Sığorta' },
        { code: '00529', name: 'Maliyyə riyaziyyatı' },
        { code: '00222', name: 'Davranış maliyyəsi' },
        { code: '00130', name: 'Aktivlərin qiymətləndirilməsi və idarə edilməsi' },
        { code: '00681', name: 'Maliyyə mühəndisliyi' },
        { code: '00617', name: 'Könüllülük fəaliyyəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 3', credit: 6, semester: 5, subjects: [
        { code: '00736', name: 'Rəqəmsal iqtisadiyyat (Sahə iqtisadiyyatı)' },
        { code: '00779', name: 'Sənaye iqtisadiyyatı' },
        { code: '00332', name: 'Ətraf mühitin iqtisadiyyatı' },
        { code: '00157', name: 'Azərbaycan iqtisadiyyatı' },
        { code: '00821', name: 'Sosial sahələrin iqtisadiyyatı' },
        { code: '00428', name: 'İnstitutsional iqtisadiyyat' },
        { code: '00148', name: 'Aqrar iqtisadiyyat' },
        { code: '00221', name: 'Davranış iqtisadiyyatı' },
        { code: '01226', name: 'Yaşıl iqtisadiyyatın əsasları' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 4', credit: 6, semester: 4, subjects: [
        { code: '00532', name: 'Marketinq' },
        { code: '00726', name: 'Reklam işi' },
        { code: '00173', name: 'Beynəlxalq marketinq' },
        { code: '00710', name: 'Qiymət siyasəti' },
        { code: '00938', name: 'Xidmətlərin marketinqi' },
        { code: '00943', name: 'Yeni məhsulların inkişaf etdirilməsi' },
        { code: '00378', name: 'İctimaiyyətlə əlaqələr' },
        { code: '00385', name: 'İdman marketinqi' },
        { code: '00501', name: 'Könüllülük fəaliyyəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 5', credit: 6, semester: 5, subjects: [
        { code: '00200', name: 'Biznesin əsasları' },
        { code: '00517', name: 'Liderlik' },
        { code: '00880', name: 'Təşkilat nəzəriyyəsi' },
        { code: '00823', name: 'Sosial sahibkarlıq' },
        { code: '00501', name: 'Könüllülük fəaliyyəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 6', credit: 7, semester: 8, subjects: [
        { code: '00682', name: 'Proseslərin idarə edilməsi' },
        { code: '00175', name: 'Beynəlxalq menecment' },
        { code: '00610', name: 'Müasir idarəetmə metodları' },
        { code: '00414', name: 'İnkişafın idarə edilməsi' },
        { code: '01221', name: 'Dayanaqlı inkişaf' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 7', credit: 8, semester: 5, subjects: [
        { code: '00436', name: 'İqtisadi dinamikanın əsasları' },
        { code: '00418', name: 'İnnovasiya iqtisadiyyatı' },
        { code: '00345', name: 'Firmalar, bazarlar və rəqabət' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 8 (istiqamət üzrə)', credit: 4, semester: 7, subjects: [
        { code: '00386', name: 'İdxal/İxrac əməliyyatları' },
        { code: '00713', name: 'Qlobal logistika və təchizat sistemi' },
        { code: '00935', name: 'Xarici ölkələrin iqtisadiyyatı' },
        { code: '00169', name: 'Beynəlxalq biznes iqtisadiyyatı' },
        { code: '01211_1', name: 'Dayanıqlı dəyər zəncirləri' },
        { code: '01212_2', name: 'Logistikada tələbin planlanmasına giriş' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 9 (istiqamət üzrə)', credit: 6, semester: 7, subjects: [
        { code: '00255', name: 'Ehtiyatların idarə edilməsi' },
        { code: '00176', name: 'Beynəlxalq multimodal daşımalar' },
        { code: '00711', name: 'Qlobal biznes strategiyası' },
        { code: '01215', name: 'Satınalmanın idarə edilməsi' },
        { code: '01213', name: 'Əməliyyatların idarə edilməsinə giriş' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 10 (istiqamət üzrə)', credit: 4, semester: 8, subjects: [
        { code: '00145', name: 'Anbar təsərrüfatı' },
        { code: '00178', name: 'Beynəlxalq risk menecmenti' },
        { code: '00567', name: 'Mədəniyyətlərarası idarəetmə və beynəlxalq danışıqlar' },
        { code: '01214', name: 'Təchizat Zənciri Şəbəkə Dizaynı' },
      ]},
    ],

    // Təcrübə və buraxılış işi
    practice: [
      { code: '01223', name: 'Karyera planlaması',              credit: 5, semester: 2 },
      { code: '01224', name: 'Yumşaq bacarıqlar (Soft skills)', credit: 9, semester: 2 },
      { code: '01225', name: 'Sərt bacarıqlar (Hard skills)',   credit: 10, semester: 8 },
      { code: '00454', name: 'İstehsalat təcrübəsi / layihə',   credit: 6, semester: 8 },
    ],
  },

  /* ─── 6002001 – BEYNƏLXALQ MÜNASİBƏTLƏR (bakalavriat, 4 il / 8 semestr) ── */
  internationalRelations: {
    name: 'Beynəlxalq münasibətlər',
    specialtyCode: '6002001',
    // Diqqət: bu planın PDF-i 2023-cü il tarixlidir (köhnə şablon, “Elm və Təhsil Nazirliyi”).
    // 01104 fənninin adı PDF-də tam görünmür (“…texnologiyaları və informasiya…”), qısa ad saxlanıb.

    // Ümumi fənlər
    general: [
      { code: '00004', name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, semester: 1 },
      { code: '00005', name: 'Azərbaycanın tarixi',                                  credit: 5, semester: 1 },
      { code: '01222', name: 'Xarici dildə işgüzar və akademik kommunikasiya-1',     credit: 4, semester: 1 },
      { code: '00073', name: 'Xarici dildə işgüzar və akademik kommunikasiya-2',     credit: 3, semester: 2, prereq: ['01222'] },
      { code: '01035', name: 'Xarici dildə işgüzar və akademik kommunikasiya-3',     credit: 4, semester: 3, prereq: ['00073'] },
      { code: '01042', name: 'Xarici dildə işgüzar və akademik kommunikasiya-4',     credit: 4, semester: 4, prereq: ['01035'] },
    ],

    // Seçmə fənlər (ümumi fənlər üzrə)
    generalElectives: [
      { title: 'Seçmə fənn (ümumi) – 1', credit: 3, semester: 4, subjects: [
        { code: '00341', name: 'Fəlsəfə' },
        { code: '00149', name: 'AR Konstitusiyası və hüququn əsasları' },
        { code: '00574', name: 'Məntiq' },
        { code: '00316', name: 'Etika' },
        { code: '00632', name: 'Multikulturalizmə giriş' },
      ]},
      { title: 'Seçmə fənn (ümumi) – 2', credit: 3, semester: 4, subjects: [
        { code: '00402', name: 'İnformasiya texnologiyaları (İxtisas üzrə)' },
        { code: '00404', name: 'İnformasiyanın idarə edilməsi' },
        { code: '00758', name: 'Sahibkarlığın əsasları və biznesə giriş' },
        { code: '00671', name: 'Politologiya' },
        { code: '00830', name: 'Sosiologiya' },
      ]},
    ],

    // İxtisas fənləri
    major: [
      { code: '01081', name: 'Siyasi coğrafiya',                                            credit: 3, semester: 2 },
      { code: '01082', name: 'Beynəlxalq münasibətlər tarixi-1',                            credit: 6, semester: 1 },
      { code: '01083', name: 'Beynəlxalq münasibətlər tarixi-2',                            credit: 6, semester: 2, prereq: ['01082'] },
      { code: '01084', name: 'Beynəlxalq münasibətlər tarixi-3',                            credit: 4, semester: 3, prereq: ['01083'] },
      { code: '01085', name: 'Türk xalqlarının müasir tarixi',                              credit: 3, semester: 2 },
      { code: '01086', name: 'Siyasi fikir tarixi',                                         credit: 4, semester: 1 },
      { code: '01087', name: 'Siyasət nəzəriyyəsi',                                         credit: 4, semester: 5 },
      { code: '01088', name: 'Müqayisəli siyasi sistemlər',                                 credit: 4, semester: 6 },
      { code: '01089', name: 'Xarici siyasətin təhlili',                                    credit: 4, semester: 7 },
      { code: '01090', name: 'Beynəlxalq münasibətlər nəzəriyyəsi',                         credit: 8, semester: 2 },
      { code: '01091', name: 'Müasir diplomatiya',                                          credit: 5, semester: 4 },
      { code: '01092', name: 'Beynəlxalq təhlükəsizlik',                                    credit: 6, semester: 5 },
      { code: '01093', name: 'İnteqrasiya prosesləri və beynəlxalq təşkilatlar',            credit: 4, semester: 5 },
      { code: '01094', name: 'Müasir münaqişələr və sülh prosesi',                          credit: 4, semester: 7 },
      { code: '01095', name: 'Azərbaycan Respublikasının xarici siyasəti',                  credit: 5, semester: 5 },
      { code: '01096', name: 'Siyasi təhlil və tənqidi təfəkkür',                           credit: 4, semester: 3 },
      { code: '00034', name: 'Mülki müdafiə',                                               credit: 3, semester: 1 },
      { code: '01098', name: 'Beynəlxalq hüquq',                                            credit: 6, semester: 3 },
      { code: '01099', name: 'İqtisadiyyatın əsasları',                                     credit: 4, semester: 1 },
      { code: '01100', name: 'İxtisas yönümlü xarici dil 1',                                credit: 5, semester: 5 },
      { code: '01101', name: 'İxtisas yönümlü xarici dil 2',                                credit: 8, semester: 6, prereq: ['01100'] },
      { code: '01102', name: 'İxtisas yönümlü xarici dil 3',                                credit: 7, semester: 7, prereq: ['01101'] },
      { code: '01103', name: 'Beynəlxalq iqtisadi münasibətlər',                            credit: 4, semester: 2 },
      { code: '01104', name: 'Müasir informasiya-kommunikasiya texnologiyaları',            credit: 3, semester: 2 },
      { code: '01105', name: 'Strateji idarəetmə',                                          credit: 3, semester: 7 },
      { code: '01106', name: 'Azərbaycan Respublikasının Milli təhlükəsizliyinin əsasları', credit: 3, semester: 4 },
    ],

    // Seçmə fənlər (ixtisas fənləri üzrə)
    majorElectives: [
      { title: 'Seçmə fənn (ixtisas) – 1', credit: 4, semester: 3, subjects: [
        { code: '01107', name: 'Müasir Siyasi ideologiyalar' },
        { code: '01108', name: 'Avropa və Amerika ölkələrinin tarixi' },
        { code: '01109', name: 'İctimai elmlərdə tədqiqat metodları' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 2', credit: 5, semester: 6, subjects: [
        { code: '01110', name: 'Geosiyasət' },
        { code: '01111', name: 'Geostrategiya' },
        { code: '01112', name: 'İctimai diplomatiya' },
        { code: '01113', name: 'İnzibati hüquq' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 3', credit: 6, semester: 4, subjects: [
        { code: '01114', name: 'İqtisadi diplomatiya' },
        { code: '01140', name: 'Ekologiya siyasəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 4', credit: 6, semester: 5, subjects: [
        { code: '01115', name: 'Diplomatik protokol və etiket' },
        { code: '01116', name: 'İnsan hüquqları' },
        { code: '01117', name: 'Beynəlxalq danışıqların strategiya və taktikası' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 5', credit: 8, semester: 3, subjects: [
        { code: '01118', name: 'Transmilli korporasiyalar' },
        { code: '01119', name: 'Ölkəşünaslığın əsasları' },
        { code: '01120', name: 'Beynəlxalq münasibətlərə giriş' },
        { code: '01121', name: 'Ölkələrin iqtisadi inkişaf modelləri' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 6', credit: 8, semester: 7, subjects: [
        { code: '00247', name: 'Dövlət qulluğu' },
        { code: '01122', name: 'Heyətin idarə edilməsi' },
        { code: '01123', name: 'İdarəetmə elmi' },
        { code: '01124', name: 'Dövlət idarəçiliyi' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 7', credit: 6, semester: 4, subjects: [
        { code: '01125', name: 'Dünya Siyasəti' },
        { code: '01126', name: 'Dünya iqtisadiyyatı' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 8', credit: 4, semester: 7, subjects: [
        { code: '01127', name: 'Enerji diplomatiyası' },
        { code: '01128', name: 'Konfliktologiya' },
        { code: '01129', name: 'Beynəlxalq iqtisadiyyat' },
        { code: '01130', name: 'ABŞ-ın Xarici Siyasəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 9', credit: 4, semester: 6, subjects: [
        { code: '01131', name: 'Təbii sərvətlərin iqtisadiyyatı' },
        { code: '00169', name: 'Beynəlxalq biznes iqtisadiyyatı' },
        { code: '00413', name: 'İnkişafda institutların rolu' },
        { code: '00182', name: 'Bilik iqtisadiyyatı' },
        { code: '01132', name: 'Beynəlxalq Ticarət' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 10', credit: 5, semester: 6, subjects: [
        { code: '01133', name: 'Diplomatik yazışma' },
        { code: '01134', name: 'Çinin Xarici Siyasəti' },
        { code: '01135', name: 'Rusiyanın Xarici Siyasəti' },
        { code: '01136', name: 'Kulturologiya' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 11', credit: 4, semester: 6, subjects: [
        { code: '01137', name: 'Avropanın xarici siyasəti' },
        { code: '01138', name: 'Türkiyənin Xarici Siyasəti' },
        { code: '01139', name: 'Diplomatik və konsul xidməti' },
      ]},
    ],

    // Təcrübə və buraxılış işi
    practice: [
      { code: '00862', name: 'Təcrübə', credit: 30, semester: 8 },
    ],
  },

  /* ─── 6004005 – MALİYYƏ – MALIYYƏ (bakalavriat, 4 il / 8 semestr) ── */
  finance: {
    name: 'Maliyyə',
    specialtyCode: '6004005',
    // İstiqamətlər: 1) Dövlət maliyyəsi (Büdcə sistemi, Dövlətin gəlir və xərclərinin idarə edilməsi, Beynəlxalq vergitutma)
    //   2) Korporativ maliyyə (Sahibkarlıq maliyyəsi və vençur kapitalı, Maliyyə təhlili, Portfelin idarə edilməsi, Maliyyə modelləşdirilməsi)
    //   3) İnvestisiyanın idarə edilməsi (Sabit gəlirli qiymətli kağızlar, Opsiyonlar və fyuçerslər, Şirkət birləşmələri, Alternativ investisiyalar)

    // Ümumi fənlər
    general: [
      { code: '00004', name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, semester: 1 },
      { code: '00005', name: 'Azərbaycanın tarixi', credit: 5, semester: 2 },
      { code: '00058', name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, semester: 1 },
      { code: '00122', name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, semester: 2, prereq: ['00058'] },
      { code: '00760', name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, semester: 3, prereq: ['00122'] },
      { code: '00934', name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, semester: 4, prereq: ['00760'] },
    ],

    // Seçmə fənlər (ümumi fənlər üzrə)
    generalElectives: [
      { title: 'Seçmə fənn (ümumi) – 1', credit: 3, semester: 8, subjects: [
        { code: '00341', name: 'Fəlsəfə' },
        { code: '00830', name: 'Sosiologiya' },
        { code: '00149', name: 'AR Konstitusiyası və hüququn əsasları' },
        { code: '00574', name: 'Məntiq' },
        { code: '00316', name: 'Etika' },
        { code: '00632', name: 'Multikulturalizmə giriş' },
      ]},
      { title: 'Seçmə fənn (ümumi) – 2', credit: 3, semester: 6, subjects: [
        { code: '00402', name: 'İnformasiya texnologiyaları' },
        { code: '00404', name: 'İnformasiyanın idarə edilməsi' },
        { code: '00758', name: 'Sahibkarlığın əsasları və biznesə giriş' },
        { code: '00671', name: 'Politologiya' },
      ]},
    ],

    // İxtisas fənləri
    major: [
      { code: '00021', name: 'İqtisadiyyata giriş', credit: 6, semester: 1 },
      { code: '00591', name: 'Mikroiqtisadiyyat', credit: 10, semester: 3 },
      { code: '00523', name: 'Makroiqtisadiyyat', credit: 10, semester: 4 },
      { code: '00056', name: 'Xətti cəbr və riyazi analiz', credit: 8, semester: 1 },
      { code: '00071', name: 'Ehtimal nəzəriyyəsi və riyazi statistika', credit: 8, semester: 2 },
      { code: '00016', name: 'İKT - baza kompyüter bilikləri', credit: 8, semester: 1 },
      { code: '00837', name: 'Statistika', credit: 10, semester: 6 },
      { code: '00282', name: 'Ekonometrika', credit: 10, semester: 7 },
      { code: '00031', name: 'Menecment', credit: 7, semester: 6 },
      { code: '00531', name: 'Maliyyə uçotu', credit: 6, semester: 4 },
      { code: '00503', name: 'Korporativ maliyyə', credit: 6, semester: 3 },
      { code: '00246', name: 'Dövlət maliyyəsi', credit: 6, semester: 5 },
      { code: '00524', name: 'Maliyyə bazarları', credit: 4, semester: 3 },
      { code: '00432', name: 'İnvestisiyanın idarə edilməsi', credit: 6, semester: 6 },
      { code: '00528', name: 'Maliyyə risklərinin idarə edilməsi', credit: 4, semester: 4 },
      { code: '00917', name: 'Vergitutma', credit: 4, semester: 7 },
      { code: '00526', name: 'Maliyyə menecmenti', credit: 4, semester: 8 },
      { code: '00034', name: 'Mülki müdafiə', credit: 3, semester: 7 },
    ],

    // Seçmə fənlər (ixtisas fənləri üzrə)
    majorElectives: [
      { title: 'Seçmə fənn (ixtisas) – 1', credit: 6, semester: 5, subjects: [
        { code: '00531', name: 'Maliyyə uçotu' },
        { code: '00525', name: 'Maliyyə hesabatlılığı' },
        { code: '00936', name: 'Xərclərin idarə edilməsi' },
        { code: '00749', name: 'Risk və nəzarət' },
        { code: '00618', name: 'Mühasibatda proqram təminatı' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 2', credit: 7, semester: 7, subjects: [
        { code: '00160', name: 'Bank işi' },
        { code: '00788', name: 'Sığorta' },
        { code: '00529', name: 'Maliyyə riyaziyyatı' },
        { code: '00222', name: 'Davranış maliyyəsi' },
        { code: '00130', name: 'Aktivlərin qiymətləndirilməsi və idarə edilməsi' },
        { code: '00681', name: 'Maliyyə mühəndisliyi' },
        { code: '00617', name: 'Könüllülük fəaliyyəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 3', credit: 6, semester: 5, subjects: [
        { code: '00736', name: 'Rəqəmsal iqtisadiyyat (Sahə iqtisadiyyatı)' },
        { code: '00779', name: 'Sənaye iqtisadiyyatı' },
        { code: '00332', name: 'Ətraf mühitin iqtisadiyyatı' },
        { code: '00157', name: 'Azərbaycan iqtisadiyyatı' },
        { code: '00821', name: 'Sosial sahələrin iqtisadiyyatı' },
        { code: '00428', name: 'İnstitutsional iqtisadiyyat' },
        { code: '00148', name: 'Aqrar iqtisadiyyat' },
        { code: '00221', name: 'Davranış iqtisadiyyatı' },
        { code: '00501', name: 'Könüllülük fəaliyyəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 4', credit: 6, semester: 4, subjects: [
        { code: '00532', name: 'Marketinq' },
        { code: '00726', name: 'Reklam işi' },
        { code: '00173', name: 'Beynəlxalq marketinq' },
        { code: '00710', name: 'Qiymət siyasəti' },
        { code: '00938', name: 'Xidmətlərin marketinqi' },
        { code: '00943', name: 'Yeni məhsulların inkişaf etdirilməsi' },
        { code: '00378', name: 'İctimaiyyətlə əlaqələr' },
        { code: '00385', name: 'İdman marketinqi' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 5', credit: 6, semester: 3, subjects: [
        { code: '00200', name: 'Biznesin əsasları' },
        { code: '00517', name: 'Liderlik' },
        { code: '00880', name: 'Təşkilat nəzəriyyəsi' },
        { code: '00823', name: 'Sosial sahibkarlıq' },
        { code: '00501', name: 'Könüllülük fəaliyyəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 6', credit: 7, semester: 8, subjects: [
        { code: '00682', name: 'Proseslərin idarə edilməsi' },
        { code: '00175', name: 'Beynəlxalq menecment' },
        { code: '00610', name: 'Müasir idarəetmə metodları' },
        { code: '00414', name: 'İnkişafın idarə edilməsi' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 7', credit: 8, semester: 5, subjects: [
        { code: '00436', name: 'İqtisadi dinamikanın əsasları' },
        { code: '00418', name: 'İnnovasiya iqtisadiyyatı' },
        { code: '00345', name: 'Firmanın iqtisadiyyatı' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 8', credit: 4, semester: 5, subjects: [
        { code: '00755', name: 'Sabit gəlirli qiymətli kağızlar və törəmə maliyyə alətləri' },
        { code: '00611', name: 'Opsiyonlar və fyuçerslər' },
        { code: '00759', name: 'Sahibkarlıq maliyyəsi və vençur kapitalı' },
        { code: '00207', name: 'Büdcə sistemi' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 9', credit: 4, semester: 6, subjects: [
        { code: '00530', name: 'Maliyyə təhlili' },
        { code: '00795', name: 'Şirkət birləşmələri, satınalmalar və özəl kapital' },
        { code: '00249', name: 'Dövlətin gəlir və xərclərinin idarə edilməsi' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 10', credit: 6, semester: 7, subjects: [
        { code: '00139', name: 'Alternativ investisiyalar' },
        { code: '00672', name: 'Portfelin idarə edilməsi' },
        { code: '00527', name: 'Maliyyə modelləşdirilməsi' },
        { code: '00180', name: 'Beynəlxalq vergitutma' },
      ]},
    ],

    // Təcrübə
    practice: [
      { code: '00023', name: 'Karyera planlaması', credit: 5, semester: 2 },
      { code: '00118', name: 'Yumşaq bacarıqlar (Soft skills)', credit: 9, semester: 2 },
      { code: '00787', name: 'Sərt bacarıqlar (Hard skills)', credit: 10, semester: 8 },
      { code: '00454', name: 'İstehsalat təcrübəsi / layihə', credit: 6, semester: 8 },
    ],
  },

  /* ─── 6008008 – TURİZM İŞİNİN TƏŞKİLİ – TURIZM IŞININ TƏŞKILI (bakalavriat, 4 il / 8 semestr) ── */
  tourism: {
    name: 'Turizm işinin təşkili',
    specialtyCode: '6008008',
    // Qeyd: plan UNEC-in Zaqatala filialı üçündür. Xarici dil-1 və -2 fənlərində PDF-dəki saat və həftəlik yük rəqəmləri bir-birinə uyğun gəlmir, həftəlik dərs yükü sütunu əsas götürülüb.

    // Ümumi fənlər
    general: [
      { code: '00004', name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, semester: 1 },
      { code: '00005', name: 'Azərbaycanın tarixi', credit: 5, semester: 1 },
      { code: '01222', name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, semester: 1 },
      { code: '00073', name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, semester: 2, prereq: ['01222'] },
      { code: '01035', name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, semester: 3, prereq: ['00073'] },
      { code: '01042', name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, semester: 4, prereq: ['01035'] },
    ],

    // Seçmə fənlər (ümumi fənlər üzrə)
    generalElectives: [
      { title: 'Seçmə fənn (ümumi) – 1', credit: 3, semester: 3, subjects: [
        { code: '00341', name: 'Fəlsəfə' },
        { code: '00830', name: 'Sosiologiya' },
        { code: '00149', name: 'AR Konstitusiyası və hüququn əsasları' },
        { code: '00574', name: 'Məntiq' },
        { code: '00317', name: 'Etika və estetika' },
        { code: '00632', name: 'Multikulturalizmə giriş' },
      ]},
      { title: 'Seçmə fənn (ümumi) – 2', credit: 3, semester: 2, subjects: [
        { code: '00402', name: 'İnformasiya texnologiyaları' },
        { code: '00405', name: 'İnformasiyanın idarə edilməsi və məlumatlar bazasının yaradılması' },
        { code: '00758', name: 'Sahibkarlığın əsasları və biznesə giriş' },
        { code: '00671', name: 'Politologiya' },
      ]},
    ],

    // İxtisas fənləri
    major: [
      { code: '00059_1', name: 'Turizmə giriş', credit: 5, semester: 1 },
      { code: '00314', name: 'Turizmin coğrafiyası', credit: 5, semester: 3 },
      { code: '00069_1', name: 'Biznes riyaziyyatı', credit: 6, semester: 1 },
      { code: '00342', name: 'Biznes statistikası', credit: 5, semester: 2 },
      { code: '00394', name: 'Menecmentin əsasları', credit: 5, semester: 2 },
      { code: '00364', name: 'Marketinqin əsasları', credit: 5, semester: 4 },
      { code: '00927', name: 'Mikroiqtisadiyyat', credit: 5, semester: 2 },
      { code: '00489', name: 'Makroiqtisadiyyat', credit: 5, semester: 3 },
      { code: '00763', name: 'Mühasibat uçotu', credit: 5, semester: 4 },
      { code: '00968', name: 'İdarəetmə uçotu və korporativ qərarların verilməsi', credit: 5, semester: 6 },
      { code: '00948', name: 'Turizmdə nəqliyyat', credit: 5, semester: 5 },
      { code: '00956', name: 'Turizm məhsulunun hazırlanması', credit: 5, semester: 2 },
      { code: '00769', name: 'Turizm siyasəti və planlaşdırılması', credit: 5, semester: 4 },
      { code: '00955', name: 'Dayanıqlı turizm', credit: 4, semester: 5 },
      { code: '00969', name: 'İnsan resurslarının idarə edilməsi', credit: 4, semester: 6 },
      { code: '00970', name: 'Destinasiyaların idarə edilməsi', credit: 4, semester: 6 },
      { code: '00715', name: 'Qonaqpərvərlik sahəsinin idarə edilməsi', credit: 5, semester: 4 },
      { code: '00419', name: 'Turizm hüququ', credit: 5, semester: 3 },
      { code: '00978', name: 'Turizmdə vasitəçilər', credit: 4, semester: 7 },
      { code: '00400', name: 'Sosial tədqiqata giriş', credit: 4, semester: 2 },
      { code: '00957', name: 'Keyfiyyət əsaslı tədqiqat metodları', credit: 5, semester: 5 },
      { code: '00979', name: 'Kəmiyyət əsaslı tədqiqat metodları', credit: 4, semester: 7 },
      { code: '00971', name: 'Bronlaşdırma sistemləri', credit: 4, semester: 6 },
      { code: '00972', name: 'Turist davranışı və psixologiyası', credit: 5, semester: 6 },
      { code: '00068', name: 'Mülki müdafiə və ilkin tibbi yardım', credit: 6, semester: 1 },
    ],

    // Seçmə fənlər (ixtisas fənləri üzrə)
    majorElectives: [
      { title: 'Seçmə fənn (ixtisas) – 1', credit: 8, semester: 3, subjects: [
        { code: '00434', name: 'Dünya turizm bazarı' },
        { code: '00583', name: 'Beynəlxalq və regional turizm bazarında Azərbaycan' },
        { code: '00633', name: 'Beynəlxalq turizm bazarlarında inkişaf trendləri' },
        { code: '00754', name: 'Müasir turizm bazarının beynəlxalq xarakteri' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 2', credit: 6, semester: 4, subjects: [
        { code: '00800', name: 'Mədəniyyətlərarası səriştələr' },
        { code: '00851', name: 'Türk dünyası mədəniyyətlərinə inteqrasiya' },
        { code: '00875', name: 'Mədəni irs və turizm' },
        { code: '00901', name: 'Tarixi və mədəni turizm' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 3', credit: 8, semester: 5, subjects: [
        { code: '00958', name: 'Turizm iqtisadiyyatı' },
        { code: '00959', name: 'Turizm və rəqəmsal iqtisadiyyat' },
        { code: '00960', name: 'Turizmin sosial-iqtisadi inkişafa təsiri' },
        { code: '00961', name: 'Maliyyə və investisiya' },
        { code: '00962', name: 'Biznesdə keyfiyyət təminatı' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 4', credit: 8, semester: 5, subjects: [
        { code: '00963', name: 'Turizmdə strateji idarəetmə' },
        { code: '00964', name: 'Kollektivdə işin təşkili' },
        { code: '00965', name: 'Müştəri məlumatı və paylama kanalının idarə olunması' },
        { code: '00966', name: 'Maliyyə risklərinin idarə edilməsi' },
        { code: '00967', name: 'İnvestisiyaların idarə edilməsi' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 5', credit: 8, semester: 6, subjects: [
        { code: '00973', name: 'Müalicə və sağlamlıq turizminin təşkili' },
        { code: '00974', name: 'Sanatoriya və kurort müəssisələrində işin təşkili' },
        { code: '00975', name: 'Turizmdə sanitariya və gigiyena' },
        { code: '00976', name: 'Balneologiya' },
        { code: '00977', name: 'Kneziterapiya' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 6', credit: 8, semester: 7, subjects: [
        { code: '00129', name: 'Macəra və idman turizmi' },
        { code: '00399', name: 'Kruiz turizminin təşkili' },
        { code: '00735', name: 'Qış turizminin təşkili xüsusiyyətləri' },
        { code: '00791', name: 'Dağ turizminin təşkili xüsusiyyətləri' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 7', credit: 8, semester: 7, subjects: [
        { code: '00256', name: 'Konqres, tədbirlər və konfransların təşkili' },
        { code: '00141', name: 'Hadisə turizmi' },
        { code: '00777', name: 'MİCE turizmi' },
        { code: '00106', name: 'Alternativ turizm' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 8', credit: 6, semester: 7, subjects: [
        { code: '00822', name: 'Turizmdə proqnozlaşdırma və planlaşdırma' },
        { code: '00869', name: 'Turizm xidmətlərinin keyfiyyətinin yüksəldilməsi yolları' },
        { code: '00315', name: 'Turizmdə marka (branding)' },
        { code: '00575', name: 'Turizm marketinqi' },
      ]},
    ],

    // Təcrübə
    practice: [
      { code: '00861', name: 'Təcrübə', credit: 21, semester: 8 },
      { code: '00210', name: 'Buraxılış işi', credit: 9, semester: 8 },
    ],
  },

  /* ─── 6008006 – SOSİAL İŞ – SOSIAL IŞ (bakalavriat, 4 il / 8 semestr) ── */
  socialWork: {
    name: 'Sosial iş',
    specialtyCode: '6008006',

    // Ümumi fənlər
    general: [
      { code: '00004', name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, semester: 2 },
      { code: '00005', name: 'Azərbaycanın tarixi', credit: 5, semester: 1 },
      { code: '01222', name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, semester: 1 },
      { code: '00073', name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, semester: 2, prereq: ['01222'] },
      { code: '00932', name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, semester: 3, prereq: ['00073'] },
      { code: '01042', name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, semester: 4, prereq: ['00932'] },
    ],

    // Seçmə fənlər (ümumi fənlər üzrə)
    generalElectives: [
      { title: 'Seçmə fənn (ümumi) – 1', credit: 3, semester: 6, subjects: [
        { code: '00614', name: 'Müasir təbiətşünaslıq konsepsiyası' },
        { code: '00608', name: 'Müasir dövrün sosial problemləri' },
        { code: '00350', name: 'Genderə giriş' },
        { code: '00632', name: 'Multikulturalizmə giriş' },
        { code: '00341', name: 'Fəlsəfə' },
        { code: '00671', name: 'Politologiya' },
        { code: '00574', name: 'Məntiq' },
      ]},
      { title: 'Seçmə fənn (ümumi) – 2', credit: 3, semester: 5, subjects: [
        { code: '00441', name: 'İqtisadiyyat' },
        { code: '00149', name: 'AR Konstitusiyası və hüququn əsasları' },
        { code: '00422', name: 'İnsan hüquqları' },
      ]},
    ],

    // İxtisas fənləri
    major: [
      { code: '00111', name: 'Sosial işdə riyazi metodlar', credit: 4, semester: 2 },
      { code: '00045', name: 'Sosiologiya', credit: 4, semester: 1 },
      { code: '00020', name: 'İnformatika', credit: 4, semester: 1 },
      { code: '00097', name: 'Psixologiya', credit: 4, semester: 2 },
      { code: '00644', name: 'Neyrobiologiya', credit: 4, semester: 5 },
      { code: '00043', name: 'Sosial işə giriş', credit: 6, semester: 1 },
      { code: '00109', name: 'Sosial iş təcrübəsində etik prinsiplər', credit: 6, semester: 2 },
      { code: '00044', name: 'Sosial işin nəzəriyyəsi və təcrübəsi-1', credit: 7, semester: 1 },
      { code: '00112', name: 'Sosial işin nəzəriyyəsi və təcrübəsi-2', credit: 4, semester: 2, prereq: ['00044'] },
      { code: '00826', name: 'Sosial statistika', credit: 4, semester: 3 },
      { code: '00819', name: 'Sosial proqramlar və xidmətlər', credit: 5, semester: 3 },
      { code: '00824', name: 'Sosial siyasət', credit: 5, semester: 5 },
      { code: '00343', name: 'Fərdlər, qruplar və ailələrlə sosial iş', credit: 6, semester: 4 },
      { code: '00225', name: 'Defektologiya', credit: 6, semester: 5 },
      { code: '00811', name: 'Sosial işdə tədqiqat metodları', credit: 9, semester: 6 },
      { code: '00683', name: 'Psixi sağlamlıq', credit: 6, semester: 6 },
      { code: '00158', name: 'Azərbaycanda sosial yardım sistemi', credit: 6, semester: 4 },
      { code: '00714', name: 'Qloballaşma və beynəlxalq sosial iş', credit: 5, semester: 3 },
      { code: '00820', name: 'Sosial psixologiya', credit: 6, semester: 3 },
      { code: '00818', name: 'Sosial pedaqogika', credit: 5, semester: 4 },
      { code: '00467', name: 'Keys menecment', credit: 6, semester: 7 },
      { code: '00110', name: 'Sosial işdə idarəetmə', credit: 5, semester: 2 },
      { code: '00034', name: 'Mülki müdafiə', credit: 3, semester: 4 },
    ],

    // Seçmə fənlər (ixtisas fənləri üzrə)
    majorElectives: [
      { title: 'Seçmə fənn (ixtisas) – 1', credit: 6, semester: 3, subjects: [
        { code: '00816', name: 'Sosial işin təşkili mexanizmləri' },
        { code: '00828', name: 'Sosial və iqtisadi mühitin sosial işə təsiri' },
        { code: '00664', name: 'Peşə etikası' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 2', credit: 6, semester: 5, subjects: [
        { code: '00595', name: 'Miqrantlarla sosial iş' },
        { code: '00349', name: 'Gənclərlə sosial iş' },
        { code: '00125', name: 'Ahıllarla sosial iş' },
        { code: '00748', name: 'Rifah sistemləri' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 3', credit: 6, semester: 4, subjects: [
        { code: '00126', name: 'Ailə və sosial iş' },
        { code: '00881', name: 'Təşkilat və icmalarla sosial iş' },
        { code: '00772', name: 'Şəhərsalma və şəhərlərdə sosial iş' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 4', credit: 6, semester: 7, subjects: [
        { code: '00814', name: 'Sosial işin iqtisadiyyatı və idarə edilməsi' },
        { code: '00810', name: 'Sosial işdə müasir yanaşmalar' },
        { code: '00725', name: 'Regional sosial iş' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 5', credit: 6, semester: 7, subjects: [
        { code: '00813', name: 'Sosial işin investisiya və maliyyə problemləri' },
        { code: '00299', name: 'Əlilliyi olan insanlarla sosial iş' },
        { code: '00950', name: 'Yerli icra orqanları və sosial iş' },
        { code: '00420', name: 'İnsan davranışı və sosial mühit' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 6', credit: 6, semester: 7, subjects: [
        { code: '00808', name: 'Sosial iş fəaliyyətində innovasiyalar' },
        { code: '00911', name: 'Uşaq və yeniyetmələrlə sosial iş' },
        { code: '00717', name: 'Qruplarla sosial iş' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 7', credit: 6, semester: 6, subjects: [
        { code: '00807', name: 'Sosial iqtisadiyyat' },
        { code: '00784', name: 'Sənayedə sosial iş' },
        { code: '00823', name: 'Sosial sahibkarlıq' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 8', credit: 6, semester: 7, subjects: [
        { code: '00812', name: 'Sosial işin inteqrasiya modeli' },
        { code: '00686', name: 'Qaçqın və məcburi köçkünlərlə sosial iş' },
        { code: '00127', name: 'Ailələrdə klinik sosial xidmət' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 9', credit: 6, semester: 5, subjects: [
        { code: '00809', name: 'Sosial işdə məşğulluq və kadr potensialı' },
        { code: '00227', name: 'Demoqrafiya və məşğulluq' },
        { code: '00856', name: 'Təbii fəlakətlərdə sosial iş' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 10', credit: 6, semester: 6, subjects: [
        { code: '00815', name: 'Sosial işin qiymətləndirilməsi' },
        { code: '00829', name: 'Sosial-tibbi xidmətlər' },
        { code: '00827', name: 'Sosial təminat sistemi' },
      ]},
    ],

    // Təcrübə
    practice: [
      { code: '00862', name: 'Təcrübə', credit: 30, semester: 8 },
    ],
  },

  /* ─── 6004008 – MÜHASİBAT – MÜHASIBAT (bakalavriat, 4 il / 8 semestr) ── */
  accounting: {
    name: 'Mühasibat',
    specialtyCode: '6004008',
    // İstiqamətlər: 1) Audit  2) Maliyyə hesabatlığı  3) Menecment mühasibatlığı (8–10-cu seçmə qrupları)
    // Qeyd: 3-cü seçmə qrupunda planda 00501 şifri də var (adı PDF-də oxunmur, digər planlara görə Könüllülük fəaliyyəti kimi yazılıb).
    // Qeyd: 00223 şifri bu planda Daxili audit fənninə aiddir (Marketinq planında isə Karyera planlaması).

    // Ümumi fənlər
    general: [
      { code: '00004', name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, semester: 2 },
      { code: '00005', name: 'Azərbaycanın tarixi', credit: 5, semester: 1 },
      { code: '01222', name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, semester: 1 },
      { code: '00122', name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, semester: 2, prereq: ['01222'] },
      { code: '00760', name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, semester: 3, prereq: ['00122'] },
      { code: '00934', name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, semester: 4, prereq: ['00760'] },
    ],

    // Seçmə fənlər (ümumi fənlər üzrə)
    generalElectives: [
      { title: 'Seçmə fənn (ümumi) – 1', credit: 3, semester: 5, subjects: [
        { code: '00341', name: 'Fəlsəfə' },
        { code: '00830', name: 'Sosiologiya' },
        { code: '00149', name: 'AR Konstitusiyası və hüququn əsasları' },
        { code: '00574', name: 'Məntiq' },
        { code: '00316', name: 'Etika' },
        { code: '00632', name: 'Multikulturalizmə giriş' },
      ]},
      { title: 'Seçmə fənn (ümumi) – 2', credit: 3, semester: 6, subjects: [
        { code: '00402', name: 'İnformasiya texnologiyaları' },
        { code: '00404', name: 'İnformasiyanın idarə edilməsi' },
        { code: '00758', name: 'Sahibkarlığın əsasları və biznesə giriş' },
        { code: '00671', name: 'Politologiya' },
      ]},
    ],

    // İxtisas fənləri
    major: [
      { code: '00021', name: 'İqtisadiyyata giriş', credit: 6, semester: 2 },
      { code: '00591', name: 'Mikroiqtisadiyyat', credit: 10, semester: 3 },
      { code: '00523', name: 'Makroiqtisadiyyat', credit: 10, semester: 4 },
      { code: '00056', name: 'Xətti cəbr və riyazi analiz', credit: 8, semester: 1 },
      { code: '00071', name: 'Ehtimal nəzəriyyəsi və riyazi statistika', credit: 8, semester: 2 },
      { code: '00016', name: 'İKT - baza kompyüter bilikləri', credit: 8, semester: 1 },
      { code: '00837', name: 'Statistika', credit: 10, semester: 5 },
      { code: '00282', name: 'Ekonometrika', credit: 10, semester: 6 },
      { code: '00031', name: 'Menecment', credit: 7, semester: 5 },
      { code: '00340', name: 'Fəaliyyətin effektiv idarə edilməsi', credit: 6, semester: 6 },
      { code: '00531', name: 'Maliyyə uçotu', credit: 6, semester: 3 },
      { code: '00382', name: 'İdarəetmə uçotu', credit: 6, semester: 5 },
      { code: '00195', name: 'Biznes hüququ', credit: 4, semester: 3 },
      { code: '00525', name: 'Maliyyə hesabatlılığı', credit: 6, semester: 4 },
      { code: '00152', name: 'Audit', credit: 4, semester: 5 },
      { code: '00917', name: 'Vergitutma', credit: 4, semester: 4 },
      { code: '00526', name: 'Maliyyə menecmenti', credit: 4, semester: 7 },
      { code: '00034', name: 'Mülki müdafiə', credit: 3, semester: 7 },
    ],

    // Seçmə fənlər (ixtisas fənləri üzrə)
    majorElectives: [
      { title: 'Seçmə fənn (ixtisas) – 1', credit: 6, semester: 8, subjects: [
        { code: '00531', name: 'Maliyyə uçotu' },
        { code: '00525', name: 'Maliyyə hesabatlılığı' },
        { code: '00936', name: 'Xərclərin idarə edilməsi' },
        { code: '00749', name: 'Risk və nəzarət' },
        { code: '00618', name: 'Mühasibatda proqram təminatı' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 2', credit: 7, semester: 6, subjects: [
        { code: '00160', name: 'Bank işi' },
        { code: '00788', name: 'Sığorta' },
        { code: '00529', name: 'Maliyyə riyaziyyatı' },
        { code: '00222', name: 'Davranış maliyyəsi' },
        { code: '00130', name: 'Aktivlərin qiymətləndirilməsi və idarə edilməsi' },
        { code: '00681', name: 'Maliyyə mühəndisliyi' },
        { code: '00617', name: 'Könüllülük fəaliyyəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 3', credit: 6, semester: 8, subjects: [
        { code: '00736', name: 'Rəqəmsal iqtisadiyyat (Sahə iqtisadiyyatı)' },
        { code: '00779', name: 'Sənaye iqtisadiyyatı' },
        { code: '00332', name: 'Ətraf mühitin iqtisadiyyatı' },
        { code: '00157', name: 'Azərbaycan iqtisadiyyatı' },
        { code: '00821', name: 'Sosial sahələrin iqtisadiyyatı' },
        { code: '00428', name: 'İnstitutsional iqtisadiyyat' },
        { code: '00148', name: 'Aqrar iqtisadiyyat' },
        { code: '00221', name: 'Davranış iqtisadiyyatı' },
        { code: '00501', name: 'Könüllülük fəaliyyəti' },
        { code: '01226', name: 'Yaşıl iqtisadiyyatın əsasları' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 4', credit: 6, semester: 3, subjects: [
        { code: '00532', name: 'Marketinq' },
        { code: '00726', name: 'Reklam işi' },
        { code: '00173', name: 'Beynəlxalq marketinq' },
        { code: '00710', name: 'Qiymət siyasəti' },
        { code: '00938', name: 'Xidmətlərin marketinqi' },
        { code: '00943', name: 'Yeni məhsulların inkişaf etdirilməsi' },
        { code: '00378', name: 'İctimaiyyətlə əlaqələr' },
        { code: '00385', name: 'İdman marketinqi' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 5', credit: 6, semester: 4, subjects: [
        { code: '00200', name: 'Biznesin əsasları' },
        { code: '00517', name: 'Liderlik' },
        { code: '00880', name: 'Təşkilat nəzəriyyəsi' },
        { code: '00823', name: 'Sosial sahibkarlıq' },
        { code: '00501', name: 'Könüllülük fəaliyyəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 6', credit: 7, semester: 7, subjects: [
        { code: '00682', name: 'Proseslərin idarə edilməsi' },
        { code: '00175', name: 'Beynəlxalq menecment' },
        { code: '00610', name: 'Müasir idarəetmə metodları' },
        { code: '00414', name: 'İnkişafın idarə edilməsi' },
        { code: '01221', name: 'Dayanaqlı inkişaf' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 7', credit: 8, semester: 8, subjects: [
        { code: '00436', name: 'İqtisadi dinamikanın əsasları' },
        { code: '00418', name: 'İnnovasiya iqtisadiyyatı' },
        { code: '00345', name: 'Firmalar, bazarlar və rəqabət' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 8', credit: 4, semester: 6, subjects: [
        { code: '00915', name: 'Vergi auditi' },
        { code: '00916', name: 'Vergi hesabatlılığı' },
        { code: '00202', name: 'Biznesin qiymətləndirilməsi' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 9', credit: 4, semester: 8, subjects: [
        { code: '00167', name: 'Beynəlxalq audit' },
        { code: '00133', name: 'Ali maliyyə menecmenti' },
        { code: '00840', name: 'Strateji biznes hesabatlılığı' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 10', credit: 6, semester: 7, subjects: [
        { code: '00223', name: 'Daxili audit' },
        { code: '00132', name: 'Ali idarəetmə hesabatlılığı' },
        { code: '00903', name: 'Maliyyə aktivlərinin qiymətləndirilməsi' },
      ]},
    ],

    // Təcrübə
    practice: [
      { code: '01223', name: 'Karyera planlaması', credit: 5, semester: 1 },
      { code: '01224', name: 'Yumşaq bacarıqlar (Soft skills)', credit: 9, semester: 2 },
      { code: '01225', name: 'Sərt bacarıqlar (Hard skills)', credit: 10, semester: 7 },
      { code: '00454', name: 'İstehsalat təcrübəsi / layihə', credit: 6, semester: 8 },
    ],
  },

  /* ─── 6004007 – MENECMENT – MENECMENT (bakalavriat, 4 il / 8 semestr) ── */
  management: {
    name: 'Menecment',
    specialtyCode: '6004007',
    // İstiqamətlər: 1) Korporativ menecment  2) İnsan resurslarının idarə edilməsi  3) Strateji menecment (8–10-cu seçmə qrupları)

    // Ümumi fənlər
    general: [
      { code: '00004', name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, semester: 1 },
      { code: '00005', name: 'Azərbaycanın tarixi', credit: 5, semester: 2 },
      { code: '01222', name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, semester: 1 },
      { code: '00122', name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, semester: 2, prereq: ['01222'] },
      { code: '00760', name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, semester: 3, prereq: ['00122'] },
      { code: '00934', name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, semester: 4, prereq: ['00760'] },
    ],

    // Seçmə fənlər (ümumi fənlər üzrə)
    generalElectives: [
      { title: 'Seçmə fənn (ümumi) – 1', credit: 3, semester: 7, subjects: [
        { code: '00341', name: 'Fəlsəfə' },
        { code: '00830', name: 'Sosiologiya' },
        { code: '00149', name: 'AR Konstitusiyası və hüququn əsasları' },
        { code: '00574', name: 'Məntiq' },
        { code: '00316', name: 'Etika' },
        { code: '00632', name: 'Multikulturalizmə giriş' },
      ]},
      { title: 'Seçmə fənn (ümumi) – 2', credit: 3, semester: 6, subjects: [
        { code: '00402', name: 'İnformasiya texnologiyaları' },
        { code: '00404', name: 'İnformasiyanın idarə edilməsi' },
        { code: '00758', name: 'Sahibkarlığın əsasları və biznesə giriş' },
        { code: '00671', name: 'Politologiya' },
      ]},
    ],

    // İxtisas fənləri
    major: [
      { code: '00021', name: 'İqtisadiyyata giriş', credit: 6, semester: 1 },
      { code: '00591', name: 'Mikroiqtisadiyyat', credit: 10, semester: 3 },
      { code: '00523', name: 'Makroiqtisadiyyat', credit: 10, semester: 5 },
      { code: '00056', name: 'Xətti cəbr və riyazi analiz', credit: 8, semester: 1 },
      { code: '00071', name: 'Ehtimal nəzəriyyəsi və riyazi statistika', credit: 8, semester: 2 },
      { code: '00016', name: 'İKT - baza kompyüter bilikləri', credit: 8, semester: 1 },
      { code: '00837', name: 'Statistika', credit: 10, semester: 5 },
      { code: '00282', name: 'Ekonometrika', credit: 10, semester: 6 },
      { code: '00031', name: 'Menecment', credit: 7, semester: 4 },
      { code: '00200', name: 'Biznesin əsasları', credit: 6, semester: 3 },
      { code: '00502', name: 'Korporativ idarəetmə', credit: 6, semester: 5 },
      { code: '00425', name: 'İnsan resurslarının idarə edilməsi', credit: 4, semester: 5 },
      { code: '00305', name: 'Əməliyyatların idarə edilməsi', credit: 4, semester: 4 },
      { code: '00844', name: 'Strateji menecment', credit: 6, semester: 7 },
      { code: '00416', name: 'İnnovasiya menecmenti', credit: 4, semester: 8 },
      { code: '00466', name: 'Keyfiyyətin idarə edilməsi', credit: 4, semester: 7 },
      { code: '00515', name: 'Layihələrin idarə edilməsi', credit: 6, semester: 4 },
      { code: '00034', name: 'Mülki müdafiə', credit: 3, semester: 4 },
    ],

    // Seçmə fənlər (ixtisas fənləri üzrə)
    majorElectives: [
      { title: 'Seçmə fənn (ixtisas) – 1', credit: 6, semester: 3, subjects: [
        { code: '00531', name: 'Maliyyə uçotu' },
        { code: '00525', name: 'Maliyyə hesabatlılığı' },
        { code: '00936', name: 'Xərclərin idarə edilməsi' },
        { code: '00749', name: 'Risk və nəzarət' },
        { code: '00618', name: 'Mühasibatda proqram təminatı' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 2', credit: 7, semester: 6, subjects: [
        { code: '00160', name: 'Bank işi' },
        { code: '00788', name: 'Sığorta' },
        { code: '00529', name: 'Maliyyə riyaziyyatı' },
        { code: '00222', name: 'Davranış maliyyəsi' },
        { code: '00130', name: 'Aktivlərin qiymətləndirilməsi və idarə edilməsi' },
        { code: '00681', name: 'Maliyyə mühəndisliyi' },
        { code: '00617', name: 'Könüllülük fəaliyyəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 3', credit: 6, semester: 8, subjects: [
        { code: '00736', name: 'Rəqəmsal iqtisadiyyat (Sahə iqtisadiyyatı)' },
        { code: '00779', name: 'Sənaye iqtisadiyyatı' },
        { code: '00332', name: 'Ətraf mühitin iqtisadiyyatı' },
        { code: '00157', name: 'Azərbaycan iqtisadiyyatı' },
        { code: '00821', name: 'Sosial sahələrin iqtisadiyyatı' },
        { code: '00428', name: 'İnstitutsional iqtisadiyyat' },
        { code: '00148', name: 'Aqrar iqtisadiyyat' },
        { code: '00221', name: 'Davranış iqtisadiyyatı' },
        { code: '01226', name: 'Yaşıl iqtisadiyyatın əsasları' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 4', credit: 6, semester: 4, subjects: [
        { code: '00532', name: 'Marketinq' },
        { code: '00726', name: 'Reklam işi' },
        { code: '00173', name: 'Beynəlxalq marketinq' },
        { code: '00710', name: 'Qiymət siyasəti' },
        { code: '00938', name: 'Xidmətlərin marketinqi' },
        { code: '00943', name: 'Yeni məhsulların inkişaf etdirilməsi' },
        { code: '00378', name: 'İctimaiyyətlə əlaqələr' },
        { code: '00385', name: 'İdman marketinqi' },
        { code: '00501', name: 'Könüllülük fəaliyyəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 5', credit: 6, semester: 8, subjects: [
        { code: '00200', name: 'Biznesin əsasları' },
        { code: '00517', name: 'Liderlik' },
        { code: '00880', name: 'Təşkilat nəzəriyyəsi' },
        { code: '00823', name: 'Sosial sahibkarlıq' },
        { code: '00501', name: 'Könüllülük fəaliyyəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 6', credit: 7, semester: 7, subjects: [
        { code: '00682', name: 'Proseslərin idarə edilməsi' },
        { code: '00175', name: 'Beynəlxalq menecment' },
        { code: '00610', name: 'Müasir idarəetmə metodları' },
        { code: '00414', name: 'İnkişafın idarə edilməsi' },
        { code: '01221', name: 'Dayanaqlı inkişaf' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 7', credit: 8, semester: 8, subjects: [
        { code: '00436', name: 'İqtisadi dinamikanın əsasları' },
        { code: '00418', name: 'İnnovasiya iqtisadiyyatı' },
        { code: '00345', name: 'Firmalar, bazarlar və rəqabət' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 8', credit: 4, semester: 6, subjects: [
        { code: '00379', name: 'İdarəetmə iqtisadiyyatı' },
        { code: '00937', name: 'Xidməti fəaliyyətin qiymətləndirilməsi və karyera menecmenti' },
        { code: '00424', name: 'İnsan resurslarının idarə edilməsində təlim və inkişaf' },
        { code: '00657', name: 'Oyunlar nəzəriyyəsi və strateji üstünlük' },
        { code: '00184', name: 'Biliklərin idarə edilməsi' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 9', credit: 4, semester: 3, subjects: [
        { code: '00882', name: 'Təşkilati davranış' },
        { code: '00195', name: 'Biznes hüququ' },
        { code: '00302', name: 'Əmək qanunvericiliyi' },
        { code: '00693', name: 'Qərarvermədə riyazi metodlar' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 10', credit: 6, semester: 6, subjects: [
        { code: '00384', name: 'İdarəetmənin sosiologiyası və psixologiyası' },
        { code: '00448', name: 'İşçi seçmə və yerləşdirmə' },
        { code: '00730', name: 'Rəqabət strategiyaları' },
        { code: '00902', name: 'Transmilli korporasiyalar' },
      ]},
    ],

    // Təcrübə
    practice: [
      { code: '01223', name: 'Karyera planlaması', credit: 5, semester: 2 },
      { code: '01224', name: 'Yumşaq bacarıqlar (Soft skills)', credit: 9, semester: 2 },
      { code: '01225', name: 'Sərt bacarıqlar (Hard skills)', credit: 10, semester: 7 },
      { code: '00454', name: 'İstehsalat təcrübəsi / layihə', credit: 6, semester: 8 },
    ],
  },

  /* ─── 6004006 – MARKETİNQ – MARKETINQ (bakalavriat, 4 il / 8 semestr) ── */
  marketing: {
    name: 'Marketinq',
    specialtyCode: '6004006',
    // İstiqamətlər: 1) Marketinq kommunikasiyaları  2) Brendləşmə strategiyası  3) Marketinq analitikası (8–10-cu seçmə qrupları)
    // Qeyd: bu planda Karyera planlaması/Yumşaq/Sərt bacarıqlar fənlərinin şifri 00223/00224/00225-dir (digər planlarda 01223/01224/01225).

    // Ümumi fənlər
    general: [
      { code: '00004', name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, semester: 1 },
      { code: '00005', name: 'Azərbaycanın tarixi', credit: 5, semester: 2 },
      { code: '01222', name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, semester: 1 },
      { code: '00122', name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, semester: 2, prereq: ['01222'] },
      { code: '00760', name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, semester: 3, prereq: ['00122'] },
      { code: '00934', name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, semester: 4, prereq: ['00760'] },
    ],

    // Seçmə fənlər (ümumi fənlər üzrə)
    generalElectives: [
      { title: 'Seçmə fənn (ümumi) – 1', credit: 3, semester: 7, subjects: [
        { code: '00341', name: 'Fəlsəfə' },
        { code: '00830', name: 'Sosiologiya' },
        { code: '00149', name: 'AR Konstitusiyası və hüququn əsasları' },
        { code: '00574', name: 'Məntiq' },
        { code: '00316', name: 'Etika' },
        { code: '00632', name: 'Multikulturalizmə giriş' },
      ]},
      { title: 'Seçmə fənn (ümumi) – 2', credit: 3, semester: 6, subjects: [
        { code: '00402', name: 'İnformasiya texnologiyaları' },
        { code: '00404', name: 'İnformasiyanın idarə edilməsi' },
        { code: '00758', name: 'Sahibkarlığın əsasları və biznesə giriş' },
        { code: '00671', name: 'Politologiya' },
      ]},
    ],

    // İxtisas fənləri
    major: [
      { code: '00021', name: 'İqtisadiyyata giriş', credit: 6, semester: 1 },
      { code: '00591', name: 'Mikroiqtisadiyyat', credit: 10, semester: 3 },
      { code: '00523', name: 'Makroiqtisadiyyat', credit: 10, semester: 4 },
      { code: '00056', name: 'Xətti cəbr və riyazi analiz', credit: 8, semester: 1 },
      { code: '00071', name: 'Ehtimal nəzəriyyəsi və riyazi statistika', credit: 8, semester: 2 },
      { code: '00016', name: 'İKT - baza komputer bilikləri', credit: 8, semester: 1 },
      { code: '00837', name: 'Statistika', credit: 10, semester: 6 },
      { code: '00282', name: 'Ekonometrika', credit: 10, semester: 7 },
      { code: '00031', name: 'Menecment', credit: 7, semester: 6 },
      { code: '00532', name: 'Marketinq', credit: 6, semester: 3 },
      { code: '00449', name: 'İstehlakçı davranışları', credit: 6, semester: 4 },
      { code: '00535', name: 'Marketinq tətqiqatları', credit: 4, semester: 3 },
      { code: '00843', name: 'Strateji marketinq', credit: 4, semester: 6 },
      { code: '00726', name: 'Reklam işi', credit: 6, semester: 7 },
      { code: '00761', name: 'Satışın idarə edilməsi', credit: 4, semester: 7 },
      { code: '00662', name: 'Pərakəndə ticarət marketinqi', credit: 4, semester: 4 },
      { code: '00741', name: 'Rəqəmsal marketinq', credit: 6, semester: 5 },
      { code: '00034', name: 'Mülki müdafiə', credit: 3, semester: 8 },
    ],

    // Seçmə fənlər (ixtisas fənləri üzrə)
    majorElectives: [
      { title: 'Seçmə fənn (ixtisas) – 1', credit: 6, semester: 3, subjects: [
        { code: '00531', name: 'Maliyyə uçotu' },
        { code: '00525', name: 'Maliyyə hesabatlılığı' },
        { code: '00936', name: 'Xərclərin idarə edilməsi' },
        { code: '00749', name: 'Risk və nəzarət' },
        { code: '00618', name: 'Mühasibatda proqram təminatı' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 2', credit: 7, semester: 7, subjects: [
        { code: '00160', name: 'Bank işi' },
        { code: '00788', name: 'Sığorta' },
        { code: '00529', name: 'Maliyyə riyaziyyatı' },
        { code: '00222', name: 'Davranış maliyyəsi' },
        { code: '00130', name: 'Aktivlərin qiymətləndirilməsi və idarə edilməsi' },
        { code: '00681', name: 'Maliyyə mühəndisliyi' },
        { code: '00617', name: 'Könüllülük fəaliyyəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 3', credit: 6, semester: 5, subjects: [
        { code: '00736', name: 'Rəqəmsal iqtisadiyyat (Sahə iqtisadiyyatı)' },
        { code: '00779', name: 'Sənaye iqtisadiyyatı' },
        { code: '00332', name: 'Ətraf mühitin iqtisadiyyatı' },
        { code: '00157', name: 'Azərbaycan iqtisadiyyatı' },
        { code: '00821', name: 'Sosial sahələrin iqtisadiyyatı' },
        { code: '00428', name: 'İnstitutsional iqtisadiyyat' },
        { code: '00148', name: 'Aqrar iqtisadiyyat' },
        { code: '00221', name: 'Davranış iqtisadiyyatı' },
        { code: '01226', name: 'Yaşıl iqtisadiyyatın əsasları' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 4', credit: 6, semester: 5, subjects: [
        { code: '00532', name: 'Marketinq' },
        { code: '00726', name: 'Reklam işi' },
        { code: '00173', name: 'Beynəlxalq marketinq' },
        { code: '00710', name: 'Qiymət siyasəti' },
        { code: '00938', name: 'Xidmətlərin marketinqi' },
        { code: '00943', name: 'Yeni məhsulların inkişaf etdirilməsi' },
        { code: '00378', name: 'İctimaiyyətlə əlaqələr' },
        { code: '00385', name: 'İdman marketinqi' },
        { code: '00501', name: 'Könüllülük fəaliyyəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 5', credit: 6, semester: 4, subjects: [
        { code: '00200', name: 'Biznesin əsasları' },
        { code: '00517', name: 'Liderlik' },
        { code: '00880', name: 'Təşkilat nəzəriyyəsi' },
        { code: '00823', name: 'Sosial sahibkarlıq' },
        { code: '00501', name: 'Könüllülük fəaliyyəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 6', credit: 7, semester: 8, subjects: [
        { code: '00682', name: 'Proseslərin idarə edilməsi' },
        { code: '00175', name: 'Beynəlxalq menecment' },
        { code: '00610', name: 'Müasir idarəetmə metodları' },
        { code: '00414', name: 'İnkişafın idarə edilməsi' },
        { code: '01221', name: 'Dayanaqlı inkişaf' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 7', credit: 8, semester: 5, subjects: [
        { code: '00436', name: 'İqtisadi dinamikanın əsasları' },
        { code: '00418', name: 'İnnovasiya iqtisadiyyatı' },
        { code: '00345', name: 'Firmalar, bazarlar və rəqabət' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 8', credit: 4, semester: 8, subjects: [
        { code: '00864', name: 'Tədbirlər marketinqi və sponsorluq' },
        { code: '00174', name: 'Beynəlxalq marketinq strategiyaları' },
        { code: '00534', name: 'Marketinq ölçmələri' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 9', credit: 4, semester: 5, subjects: [
        { code: '00817', name: 'Sosial media marketinq' },
        { code: '00206', name: 'Brendinqin əsasları' },
        { code: '00204', name: 'Brend aktivlərinin qiymətləndirilməsi' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 10', credit: 6, semester: 6, subjects: [
        { code: '00841', name: 'Strateji brend menecmenti' },
        { code: '00533', name: 'Marketinq analitikası' },
        { code: '00637', name: 'Müştəri əlaqələrinin idarə edilməsi (CRM)' },
      ]},
    ],

    // Təcrübə
    practice: [
      { code: '00223', name: 'Karyera planlaması', credit: 5, semester: 2 },
      { code: '00224', name: 'Yumşaq bacarıqlar (Soft skills)', credit: 9, semester: 2 },
      { code: '00225', name: 'Sərt bacarıqlar (Hard skills)', credit: 10, semester: 8 },
      { code: '00454', name: 'İstehsalat təcrübəsi / layihə', credit: 6, semester: 8 },
    ],
  },

  /* ─── 6005004 – EKOLOGİYA – EKOLOGIYA (bakalavriat, 4 il / 8 semestr) ── */
  ecology: {
    name: 'Ekologiya',
    specialtyCode: '6005004',

    // Ümumi fənlər
    general: [
      { code: '00004', name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, semester: 1 },
      { code: '00005', name: 'Azərbaycanın tarixi', credit: 5, semester: 2 },
      { code: '01222', name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, semester: 1 },
      { code: '00073', name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, semester: 2, prereq: ['01222'] },
      { code: '01035', name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, semester: 3, prereq: ['00073'] },
      { code: '01042', name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, semester: 4, prereq: ['01035'] },
    ],

    // Seçmə fənlər (ümumi fənlər üzrə)
    generalElectives: [
      { title: 'Seçmə fənn (ümumi) – 1', credit: 3, semester: 5, subjects: [
        { code: '00341', name: 'Fəlsəfə' },
        { code: '00830', name: 'Sosiologiya' },
        { code: '00149', name: 'AR Konstitusiyası və hüququn əsasları' },
        { code: '00574', name: 'Məntiq' },
        { code: '00317', name: 'Etika və estetika' },
        { code: '00632', name: 'Multikulturalizmə giriş' },
      ]},
      { title: 'Seçmə fənn (ümumi) – 2', credit: 3, semester: 6, subjects: [
        { code: '00263', name: 'Ekologiyada informasiya texnologiyalarının tətbiqi' },
        { code: '00405', name: 'İnformasiyanın idarə edilməsi və məlumatlar bazasının yaradılması' },
        { code: '00758', name: 'Sahibkarlığın əsasları və biznesə giriş' },
        { code: '00671', name: 'Politologiya' },
      ]},
    ],

    // İxtisas fənləri
    major: [
      { code: '00026', name: 'Kimya', credit: 6, semester: 1 },
      { code: '00006', name: 'Biologiya', credit: 6, semester: 1 },
      { code: '00001', name: 'Ali riyaziyyat', credit: 7, semester: 1 },
      { code: '00078', name: 'Biosfer və onun mühafizəsi', credit: 6, semester: 2 },
      { code: '00083', name: 'Fizika', credit: 4, semester: 2 },
      { code: '00117', name: 'Yer elmlərinin əsasları', credit: 6, semester: 2 },
      { code: '00908', name: 'Ümumi ekologiya', credit: 5, semester: 4 },
      { code: '00216', name: 'Coğrafi ekologiya', credit: 4, semester: 3 },
      { code: '00373', name: 'Heyvan ekologiyası', credit: 5, semester: 3 },
      { code: '00900', name: 'Torpaqşünaslıq', credit: 4, semester: 3 },
      { code: '00275', name: 'Ekoloji tədqiqat metodları', credit: 5, semester: 4 },
      { code: '00513', name: 'Landşaftşünaslıq və landşaftın ekologiyası', credit: 5, semester: 5 },
      { code: '00421', name: 'İnsan ekologiyası və dayanıqlı inkişaf', credit: 5, semester: 6 },
      { code: '00368', name: 'Hava və suyun keyfiyyəti, çirklənməsi və mühafizəsi', credit: 6, semester: 5 },
      { code: '00258', name: 'Ekologiya hüququ', credit: 4, semester: 6 },
      { code: '00268', name: 'Ekoloji kartoqrafiya və coğrafi informasiya sistemləri', credit: 8, semester: 3 },
      { code: '00775', name: 'Sənaye ekologiyası', credit: 4, semester: 6 },
      { code: '00269', name: 'Ekoloji kimya', credit: 6, semester: 6 },
      { code: '00578', name: 'Meşəçilik', credit: 6, semester: 7 },
      { code: '00270', name: 'Ekoloji monitorinq', credit: 5, semester: 7 },
      { code: '00077', name: 'Biomüxtəlifliyin qorunması', credit: 6, semester: 2 },
      { code: '00857', name: 'Təbii resursların dayanıqlı idarə edilməsi', credit: 4, semester: 4 },
      { code: '00034', name: 'Mülki müdafiə', credit: 3, semester: 1 },
    ],

    // Seçmə fənlər (ixtisas fənləri üzrə)
    majorElectives: [
      { title: 'Seçmə fənn (ixtisas) – 1', credit: 8, semester: 6, subjects: [
        { code: '00910', name: 'Urboekologiya' },
        { code: '00276', name: 'Ekoloji təhlil' },
        { code: '00137', name: 'Alternativ enerji mənbələrinin ekoloji təhlükəsizliyi' },
        { code: '00220', name: 'Davranış ekologiyası' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 2', credit: 8, semester: 4, subjects: [
        { code: '00159', name: 'Azərbaycanın ekoloji vəziyyəti və problemləri' },
        { code: '00281', name: 'Ekonometrika' },
        { code: '00642', name: 'Neft emalı sənayesinin ekoloji problemləri' },
        { code: '00636', name: 'Müqayisəli quru və dəniz ekologiyası' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 3', credit: 5, semester: 3, subjects: [
        { code: '00060', name: 'Azərbaycanın coğrafiyası' },
        { code: '00061', name: 'Davamlı insan inkişafı' },
        { code: '00062', name: 'Regional ekoloji problemlər' },
        { code: '00063', name: 'İqlim və su' },
        { code: '01218', name: 'Su ehtiyatlarının inteqrasiyalı idarə edilməsi' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 4', credit: 4, semester: 5, subjects: [
        { code: '00643', name: 'Nəqliyyatın ekoloji problemləri' },
        { code: '00472', name: 'Ətraf mühitin iqtisadiyyatı' },
        { code: '00333', name: 'Ətraf mühitin keyfiyyət normativləri' },
        { code: '00325', name: 'Ətraf mühitdə qlobal dəyişikliklər' },
        { code: '00185', name: 'Biocoğrafiyaya giriş' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 5', credit: 6, semester: 5, subjects: [
        { code: '00267', name: 'Ekoloji fəaliyyətin idarə olunması' },
        { code: '00335', name: 'Ətraf mühitin mühafizəsinin statistikası' },
        { code: '00806', name: 'Sosial ekologiya' },
        { code: '00329', name: 'Ətraf mühitin çirklənməsi və onun ekoloji təsirləri' },
        { code: '00272', name: 'Ekoloji problemlər və ətraf mühitin etikası' },
        { code: '00278', name: 'Ekoloji turizm' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 6', credit: 7, semester: 7, subjects: [
        { code: '00328', name: 'Ətraf mühitin çirklənməsi' },
        { code: '00264', name: 'Ekoloji auditin əsasları' },
        { code: '00232', name: 'Din və ekologiya' },
        { code: '00946', name: 'Yenilənə bilən və davamlı enerji' },
        { code: '00190', name: 'Biotexnologiyaya giriş' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 7', credit: 8, semester: 7, subjects: [
        { code: '00266', name: 'Ekoloji ekspertiza və layihələndirmənin əsasları' },
        { code: '00401', name: 'İnformasiya texnologiyaları' },
        { code: '00337', name: 'Ətraf mühitin qanunvericiliyi' },
        { code: '01217', name: 'Ətraf mühitin dayanıqlılığı' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 8', credit: 4, semester: 7, subjects: [
        { code: '00261', name: 'Ekologiya və həyat fəaliyyətinin təhlükəsizliyi' },
        { code: '00905', name: 'Tullantıların ekoloji-iqtisadi qiymətləndirilməsi' },
        { code: '00279', name: 'Ekoloji-iqtisadi tənzimləmə' },
        { code: '00640', name: 'Nanotexnologiyaya giriş' },
        { code: '00374', name: 'Hidrologiya' },
        { code: '00310', name: 'Enerji və ekologiya' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 9', credit: 4, semester: 4, subjects: [
        { code: '00855', name: 'Təbiətdən istifadənin iqtisadi və ekoloji əsasları' },
        { code: '00722', name: 'Regional ekologiya' },
        { code: '00947', name: 'Yer elmlərində kompüter dəstəkli dizayn' },
        { code: '00866', name: 'Təhlükəli və zərərli tullantılar' },
        { code: '01219', name: 'Ekoloji təhlükəsizlik' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 10', credit: 6, semester: 5, subjects: [
        { code: '00443', name: 'İqtisadiyyat və ekologiya' },
        { code: '00251', name: 'Dünyanın iqtisadi və sosial coğrafiyası' },
        { code: '00712', name: 'Qlobal ekologiya' },
        { code: '00720', name: 'Radioaktiv çirklənmə' },
        { code: '00326', name: 'Ətraf mühitə təsirin qiymətləndirilməsi' },
      ]},
    ],

    // Təcrübə
    practice: [
      { code: '00861', name: 'Təcrübə', credit: 21, semester: 8 },
      { code: '00210', name: 'Buraxılış işi', credit: 9, semester: 8 },
    ],
  },

  /* ─── 6005012 – STATİSTİKA – STATISTIKA (bakalavriat, 4 il / 8 semestr) ── */
  statistics: {
    name: 'Statistika',
    specialtyCode: '6005012',
    // İstiqamətlər: 1) Statistikanın nəzəriyyəsi  2) İqtisadi və sosial statistika  3) Məlumatlar elmi (Data science) (8–10-cu seçmə qrupları)

    // Ümumi fənlər
    general: [
      { code: '00004', name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, semester: 2 },
      { code: '00005', name: 'Azərbaycanın tarixi', credit: 5, semester: 1 },
      { code: '01222', name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, semester: 1 },
      { code: '00122', name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, semester: 2, prereq: ['01222'] },
      { code: '00760', name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, semester: 3, prereq: ['00122'] },
      { code: '00934', name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, semester: 4, prereq: ['00760'] },
    ],

    // Seçmə fənlər (ümumi fənlər üzrə)
    generalElectives: [
      { title: 'Seçmə fənn (ümumi) – 1', credit: 3, semester: 6, subjects: [
        { code: '00341', name: 'Fəlsəfə' },
        { code: '00830', name: 'Sosiologiya' },
        { code: '00149', name: 'AR Konstitusiyası və hüququn əsasları' },
        { code: '00574', name: 'Məntiq' },
        { code: '00316', name: 'Etika' },
        { code: '00632', name: 'Multikulturalizmə giriş' },
      ]},
      { title: 'Seçmə fənn (ümumi) – 2', credit: 3, semester: 5, subjects: [
        { code: '00402', name: 'İnformasiya texnologiyaları' },
        { code: '00404', name: 'İnformasiyanın idarə edilməsi' },
        { code: '00758', name: 'Sahibkarlığın əsasları və biznesə giriş' },
        { code: '00671', name: 'Politologiya' },
      ]},
    ],

    // İxtisas fənləri
    major: [
      { code: '00021', name: 'İqtisadiyyata giriş', credit: 6, semester: 2 },
      { code: '00591', name: 'Mikroiqtisadiyyat', credit: 10, semester: 5 },
      { code: '00523', name: 'Makroiqtisadiyyat', credit: 10, semester: 6 },
      { code: '00056', name: 'Xətti cəbr və riyazi analiz', credit: 8, semester: 1 },
      { code: '00071', name: 'Ehtimal nəzəriyyəsi və riyazi statistika', credit: 8, semester: 2 },
      { code: '00016', name: 'İKT - baza kompyüter bilikləri', credit: 8, semester: 1 },
      { code: '00837', name: 'Statistika', credit: 10, semester: 3 },
      { code: '00282', name: 'Ekonometrika', credit: 10, semester: 4 },
      { code: '00031', name: 'Menecment', credit: 7, semester: 5 },
      { code: '00893', name: 'Tətbiqi statistika', credit: 6, semester: 3 },
      { code: '00833', name: 'Statistik modelləşdirməyə giriş', credit: 6, semester: 4 },
      { code: '00445', name: 'İqtisadiyyatda əməliyyatların tədqiqi', credit: 4, semester: 3 },
      { code: '00834', name: 'Statistik proqram paketləri', credit: 4, semester: 4 },
      { code: '00217', name: 'Çoxölçülü statistik təhlil', credit: 6, semester: 5 },
      { code: '00883', name: 'Zaman sıralarının təhlili', credit: 4, semester: 7 },
      { code: '00572', name: 'Məlumatlar elmi', credit: 4, semester: 6 },
      { code: '00771', name: 'Seçmə müayinələrin layihələndirilməsi və təhlili', credit: 6, semester: 6 },
      { code: '00034', name: 'Mülki müdafiə', credit: 3, semester: 8 },
    ],

    // Seçmə fənlər (ixtisas fənləri üzrə)
    majorElectives: [
      { title: 'Seçmə fənn (ixtisas) – 1', credit: 6, semester: 4, subjects: [
        { code: '00531', name: 'Maliyyə uçotu' },
        { code: '00525', name: 'Maliyyə hesabatlılığı' },
        { code: '00936', name: 'Xərclərin idarə edilməsi' },
        { code: '00749', name: 'Risk və nəzarət' },
        { code: '00618', name: 'Mühasibatda proqram təminatı' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 2', credit: 7, semester: 6, subjects: [
        { code: '00160', name: 'Bank işi' },
        { code: '00788', name: 'Sığorta' },
        { code: '00529', name: 'Maliyyə riyaziyyatı' },
        { code: '00222', name: 'Davranış maliyyəsi' },
        { code: '00130', name: 'Aktivlərin qiymətləndirilməsi və idarə edilməsi' },
        { code: '00681', name: 'Maliyyə mühəndisliyi' },
        { code: '00617', name: 'Könüllülük fəaliyyəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 3', credit: 6, semester: 7, subjects: [
        { code: '00736', name: 'Rəqəmsal iqtisadiyyat (Sahə iqtisadiyyatı)' },
        { code: '00779', name: 'Sənaye iqtisadiyyatı' },
        { code: '00332', name: 'Ətraf mühitin iqtisadiyyatı' },
        { code: '00157', name: 'Azərbaycan iqtisadiyyatı' },
        { code: '00821', name: 'Sosial sahələrin iqtisadiyyatı' },
        { code: '00428', name: 'İnstitutsional iqtisadiyyat' },
        { code: '00148', name: 'Aqrar iqtisadiyyat' },
        { code: '00221', name: 'Davranış iqtisadiyyatı' },
        { code: '01226', name: 'Yaşıl iqtisadiyyatın əsasları' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 4', credit: 6, semester: 3, subjects: [
        { code: '00532', name: 'Marketinq' },
        { code: '00726', name: 'Reklam işi' },
        { code: '00173', name: 'Beynəlxalq marketinq' },
        { code: '00710', name: 'Qiymət siyasəti' },
        { code: '00938', name: 'Xidmətlərin marketinqi' },
        { code: '00943', name: 'Yeni məhsulların inkişaf etdirilməsi' },
        { code: '00378', name: 'İctimaiyyətlə əlaqələr' },
        { code: '00385', name: 'İdman marketinqi' },
        { code: '00501', name: 'Könüllülük fəaliyyəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 5', credit: 6, semester: 7, subjects: [
        { code: '00200', name: 'Biznesin əsasları' },
        { code: '00517', name: 'Liderlik' },
        { code: '00880', name: 'Təşkilat nəzəriyyəsi' },
        { code: '00823', name: 'Sosial sahibkarlıq' },
        { code: '00501', name: 'Könüllülük fəaliyyəti' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 6', credit: 7, semester: 8, subjects: [
        { code: '00682', name: 'Proseslərin idarə edilməsi' },
        { code: '00175', name: 'Beynəlxalq menecment' },
        { code: '00610', name: 'Müasir idarəetmə metodları' },
        { code: '00414', name: 'İnkişafın idarə edilməsi' },
        { code: '01221', name: 'Dayanaqlı inkişaf' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 7', credit: 8, semester: 7, subjects: [
        { code: '00436', name: 'İqtisadi dinamikanın əsasları' },
        { code: '00418', name: 'İnnovasiya iqtisadiyyatı' },
        { code: '00345', name: 'Firmalar, bazarlar və rəqabət' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 8', credit: 4, semester: 5, subjects: [
        { code: '00694', name: 'Qeyri-parametrik metodlar' },
        { code: '00593', name: 'Milli hesablar sistemi' },
        { code: '00440', name: 'İqtisadi statistika' },
        { code: '00446', name: 'İrihəcmli məlumatlar (Big Data)' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 9', credit: 4, semester: 8, subjects: [
        { code: '00131', name: 'Aktuar hesablamalar' },
        { code: '00197', name: 'Biznes statistikası' },
        { code: '00371', name: 'Həyat keyfiyyətinin statistikası' },
        { code: '00719', name: 'R proqramlaşdırma sistemi' },
      ]},
      { title: 'Seçmə fənn (ixtisas) – 10', credit: 6, semester: 7, subjects: [
        { code: '00888', name: 'Tətbiqi ekonometrika' },
        { code: '00832', name: 'Statistik eksperimentlərin dizaynı' },
        { code: '00254', name: 'Əhali statistikası' },
        { code: '00747', name: 'Rəsmi statistika' },
        { code: '00684', name: 'Python üzərində maşın təlimi' },
      ]},
    ],

    // Təcrübə
    practice: [
      { code: '01223', name: 'Karyera planlaması', credit: 5, semester: 1 },
      { code: '01224', name: 'Yumşaq bacarıqlar (Soft skills)', credit: 9, semester: 2 },
      { code: '01225', name: 'Sərt bacarıqlar (Hard skills)', credit: 10, semester: 8 },
      { code: '00454', name: 'İstehsalat təcrübəsi / layihə', credit: 6, semester: 8 },
    ],
  },
};

/* ── localStorage ──────────────────────────────────────────── */
const CURR_LS_KEY = 'unec_selected_specialty';
function getSavedSpecialty()  { try { return localStorage.getItem(CURR_LS_KEY) || null; } catch { return null; } }
function saveSpecialty(spec)  { try { localStorage.setItem(CURR_LS_KEY, spec); }          catch {} }
function clearSavedSpecialty(){ try { localStorage.removeItem(CURR_LS_KEY); }             catch {} }

/* ── Render helpers ────────────────────────────────────────── */
function selectSpecialty(spec) {
  const data = CURRICULUM_DATA[spec];
  if (!data) return;
  saveSpecialty(spec);

  document.querySelectorAll('.curr-specialty-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.spec === spec));

  document.getElementById('currSpecBadge').innerHTML =
    `<span class="material-symbols-outlined msi">${data.icon}</span> <strong>${data.name}</strong>`;

  // Render all 8 semesters; skip if data missing (some specs may lack s5-s8)
  for (let i = 1; i <= 8; i++) {
    const key = `semester${i}`;
    const block = document.getElementById(`curr-semester-block-s${i}`);
    if (data[key] && data[key].length) {
      renderSemesterTable(`s${i}`, data[key]);
      if (block) block.style.display = '';
    } else {
      if (block) block.style.display = 'none';
    }
  }

  document.getElementById('currEmptyState').style.display  = 'none';
  document.getElementById('currPlanPanel').style.display   = '';
  document.getElementById('currPlanPanel').classList.remove('curr-panel-in');
  requestAnimationFrame(() => requestAnimationFrame(() =>
    document.getElementById('currPlanPanel').classList.add('curr-panel-in')));
}

function renderSemesterTable(semKey, subjects) {
  const tbody   = document.getElementById(`curr-tbody-${semKey}`);
  const statsEl = document.getElementById(`curr-s${semKey.replace('s','')}-stats`);
  if (!tbody) return;

  const totalCredits = subjects.reduce((a, s) => a + s.credit, 0);
  const totalHours   = subjects.reduce((a, s) => a + s.hours,  0);
  const totalWeekly  = subjects.reduce((a, s) => a + s.weekly, 0);

  if (statsEl) statsEl.innerHTML =
    `<span class="curr-stat-pill">${totalCredits} kredit</span>` +
    `<span class="curr-stat-pill">${totalHours} saat</span>` +
    (totalWeekly ? `<span class="curr-stat-pill">${totalWeekly} h/həftə</span>` : '');

  // Fənn şifri: adi fənn → 1 şifr; seçmə fənn → qrupun bütün şifrləri
  const codesHTML = s => {
    const list = Array.isArray(s.codes) ? s.codes : (s.code ? [s.code] : []);
    if (!list.length) return '';
    const title = Array.isArray(s.codes) ? 'Seçmə fənn qrupu – bu şifrlərdən biri seçilir' : 'Fənn şifri';
    return `<div class="curr-codes" title="${title}">${list.map(c => `<span class="code-badge">${c}</span>`).join('')}</div>`;
  };

  tbody.innerHTML = subjects.map((s, i) => `
    <tr style="animation-delay:${i * 40}ms" class="curr-row-in">
      <td class="curr-td-name">${s.name}${codesHTML(s)}</td>
      <td><span class="curr-badge curr-badge--credit">${s.credit}</span></td>
      <td><span class="curr-badge curr-badge--hours">${s.hours || '—'}</span></td>
      <td><span class="curr-badge curr-badge--absence${s.absenceLimit <= 1 && s.absenceLimit > 0 ? ' warn' : ''}">${s.absenceLimit || '—'}</span></td>
      <td><span class="curr-badge curr-badge--weekly">${s.weekly || '—'}</span></td>
    </tr>`).join('');
}

function clearSpecialty() {
  clearSavedSpecialty();
  document.querySelectorAll('.curr-specialty-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('currPlanPanel').style.display  = 'none';
  document.getElementById('currEmptyState').style.display = '';
}

function initCurriculum() {
  const saved = getSavedSpecialty();
  if (saved && CURRICULUM_DATA[saved]) selectSpecialty(saved);
}

document.addEventListener('DOMContentLoaded', function () {
  const orig = window.switchBottomTab;
  if (typeof orig === 'function') {
    window.switchBottomTab = function (tab) {
      orig(tab);
      if (tab === 'curriculum') initCurriculum();
    };
  }
});
