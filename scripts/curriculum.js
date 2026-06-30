/* =============================================================
   CURRICULUM.JS  –  İxtisas Planı Modulu
   UNEC tələbəsi üçün 8 semestr fənn cədvəli + localStorage
   ============================================================= */

const CURRICULUM_DATA = {

  /* ─── İQTİSADİYYAT ──────────────────────────────────────── */
  economics: {
    name: 'İqtisadiyyat', icon: '📈',
    semester1: [
      { name: 'Azərbaycanın tarixi',                                    credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xətti cəbr və riyazi analiz',                            credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İKT - baza komputer bilikləri',                          credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1',       credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Karyera planlaması',                                     credit: 5, hours: 30, absenceLimit: 3, weekly: 2 },
    ],
    semester2: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya',   credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Ehtimal nəzəriyyəsi və riyazi statistika',               credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İqtisadiyyata giriş',                                    credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2',       credit: 3, hours: 75, absenceLimit: 9, weekly: 5 },
      { name: 'Yumşaq bacarıqlar (Soft skills)',                        credit: 9, hours: 30, absenceLimit: 3, weekly: 2 },
    ],
    semester3: [
      { name: 'Ətraf mühitin iqtisadiyyatı',                           credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Əməyin iqtisadiyyatı',                                  credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Mikroiqtisadiyyat',                                     credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3',      credit: 4, hours: 90, absenceLimit: 11, weekly: 6 },
      { name: 'Seçmə fənn - 1 (Qiymət siyasəti)',                      credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester4: [
      { name: 'Azərbaycan iqtisadiyyatı',                               credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İqtisadi fikir tarixi',                                  credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Makroiqtisadiyyat',                                      credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4',       credit: 4, hours: 75, absenceLimit: 9, weekly: 5 },
      { name: 'Seçmə fənn - 1 (Maliyyə uçotu)',                         credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester5: [
      { name: 'Menecment',                                        credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Statistika',                                       credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Beynəlxalq iqtisadiyyat',                          credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Rəqəmsal iqtisadiyyat (Sahə iqtisadiyyatı)',       credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Mülki müdafiə',                                    credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester6: [
      { name: 'Ekonometrika',                           credit: 10, hours: 60, absenceLimit: 5, weekly: 4 },
      { name: 'Sosial sahələrin iqtisadiyyatı',         credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1',                         credit: 3, hours: 45, absenceLimit: 7, weekly: 3 },
      { name: 'Seçmə fənn - 2',                         credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 3',                         credit: 4, hours: 45, absenceLimit: 7, weekly: 3 },
    ],
    semester7: [
      { name: 'İnkişaf iqtisadiyyatı',               credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Sərt bacarıqlar (Hard skills)',       credit: 10, hours: 30, absenceLimit: 3, weekly: 2 },
      { name: 'Seçmə fənn - 1',                      credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 2',                      credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 3',                      credit: 6, hours: 60,  absenceLimit: 7, weekly: 4 },
    ],
    semester8: [
      { name: 'İstehsalat təcrübəsi / layihə',         credit: 6, hours: 0, absenceLimit: 0, weekly: 0 },
      { name: 'Seçmə fənn - 1',                        credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2',                        credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 3',                        credit: 4, hours: 75, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 4',                        credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
  },

  /* ─── MALİYYƏ ──────────────────────────────────────── */
  finance: {
    name: 'Maliyyə', icon: '💰',
    semester1: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1',    credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İqtisadiyyata giriş',                                  credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xətti cəbr və riyazi analiz',                          credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İKT - baza kompyüter bilikləri',                       credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester2: [
      { name: 'Azərbaycanın tarixi',                                  credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2',     credit: 3, hours: 75, absenceLimit: 9, weekly: 5 },
      { name: 'Ehtimal nəzəriyyəsi və riyazi statistika',             credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Karyera planlaması',                                   credit: 5, hours: 30, absenceLimit: 3, weekly: 2 },
      { name: 'Yumşaq bacarıqlar (Soft skills)',                      credit: 9, hours: 30, absenceLimit: 3, weekly: 2 },
    ],
    semester3: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3',     credit: 4, hours: 90, absenceLimit: 11, weekly: 6 },
      { name: 'Mikroiqtisadiyyat',                                    credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Maliyyə uçotu',                                        credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Vergitutma',                                           credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1 (Biznesin əsasları)',                   credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4',     credit: 4, hours: 90, absenceLimit: 11, weekly: 6 },
      { name: 'Makroiqtisadiyyat',                                    credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Korporativ maliyyə',                                   credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Maliyyə risklərinin idarə edilməsi',                   credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1 (Marketinq)',                           credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester5: [
      { name: 'Dövlət maliyyəsi',                                     credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Maliyyə bazarları',                                    credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1 (Maliyyə hesabatlılığı)',               credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2 (Rəqəmsal iqtisadiyyat)',               credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 3 (İqtisadi dinamikanın əsasları)',       credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester6: [
      { name: 'Statistika',                                           credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Menecment',                                            credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İnvestisiyanın idarə edilməsi',                        credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1 (Maliyyə təhlili)',                     credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 2 (İnformasiya texnologiyaları)',         credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester7: [
      { name: 'Mülki müdafiə',                                        credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Ekonometrika',                                         credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1 (Bank işi)',                            credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2 (Sabit gəlirli qiymətli kağızlar)',     credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 3 (Alternativ investisiyalar)',           credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester8: [
      { name: 'Maliyyə menecmenti',                                   credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Sərt bacarıqlar (Hard skills)',                        credit: 10, hours: 30, absenceLimit: 3, weekly: 2 },
      { name: 'İstehsalat təcrübəsi / layihə',                        credit: 6, hours: 0, absenceLimit: 0, weekly: 0 },
      { name: 'Seçmə fənn - 1 (Proseslərin idarə edilməsi)',          credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2 (Fəlsəfə)',                             credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
  },

  /* ─── MÜHASİBAT ──────────────────────────────────────── */
  accounting: {
    name: 'Mühasibat', icon: '🧾',
    semester1: [
      { name: 'Azərbaycanın tarixi',                          credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xətti cəbr və riyazi analiz',                   credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İKT - baza kompyüter bilikləri',                credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Karyera planlaması',                            credit: 5, hours: 30, absenceLimit: 3, weekly: 2 },
    ],
    semester2: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, hours: 75, absenceLimit: 9, weekly: 5 },
      { name: 'İqtisadiyyata giriş',                            credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Ehtimal nəzəriyyəsi və riyazi statistika',       credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Yumşaq bacarıqlar (Soft skills)',                credit: 9, hours: 30, absenceLimit: 3, weekly: 2 },
    ],
    semester3: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, hours: 90, absenceLimit: 11, weekly: 6 },
      { name: 'Mikroiqtisadiyyat',                              credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Maliyyə uçotu',                                  credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Biznes hüququ',                                  credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1 (Marketinq)',                     credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, hours: 90, absenceLimit: 11, weekly: 6 },
      { name: 'Makroiqtisadiyyat',                              credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Maliyyə hesabatlılığı',                          credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Vergitutma',                                     credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1 (Biznesin əsasları)',             credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester5: [
      { name: 'Seçmə fənn - 1 (Fəlsəfə)',                       credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Statistika',                                     credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Menecment',                                      credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İdarəetmə uçotu',                                credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Audit',                                          credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester6: [
      { name: 'Seçmə fənn - 1 (İnformasiya texnologiyaları)',   credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Ekonometrika',                                   credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Fəaliyyətin effektiv idarə edilməsi',            credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2 (Bank işi)',                      credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 3 (Vergi auditi)',                  credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester7: [
      { name: 'Maliyyə menecmenti',                             credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Mülki müdafiə',                                  credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Sərt bacarıqlar (Hard skills)',                  credit: 10, hours: 30, absenceLimit: 3, weekly: 2 },
      { name: 'Seçmə fənn - 1 (Proseslərin idarə edilməsi)',    credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2 (Daxili audit)',                 credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester8: [
      { name: 'İstehsalat təcrübəsi / layihə',                  credit: 6, hours: 0, absenceLimit: 0, weekly: 0 },
      { name: 'Seçmə fənn - 1 (Maliyyə uçotu)',                 credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2 (Rəqəmsal iqtisadiyyat)',         credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 3 (İqtisadi dinamikanın əsasları)', credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 4 (Beynəlxalq audit)',              credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
  },

  /* ─── MENECMENT ──────────────────────────────────────── */
  management: {
    name: 'Menecment', icon: '🧭',
    semester1: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1',    credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İqtisadiyyata giriş',                                  credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xətti cəbr və riyazi analiz',                          credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İKT - baza kompyüter bilikləri',                       credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester2: [
      { name: 'Azərbaycanın tarixi',                                  credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2',     credit: 3, hours: 75, absenceLimit: 9, weekly: 5 },
      { name: 'Ehtimal nəzəriyyəsi və riyazi statistika',             credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Karyera planlaması',                                   credit: 5, hours: 30, absenceLimit: 3, weekly: 2 },
      { name: 'Yumşaq bacarıqlar (Soft skills)',                      credit: 9, hours: 30, absenceLimit: 3, weekly: 2 },
    ],
    semester3: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3',     credit: 4, hours: 90, absenceLimit: 11, weekly: 6 },
      { name: 'Mikroiqtisadiyyat',                                    credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Biznesin əsasları',                                    credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1 (Maliyyə uçotu)',                       credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2 (Təşkilati davranış)',                  credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4',     credit: 4, hours: 90, absenceLimit: 11, weekly: 6 },
      { name: 'Menecment',                                            credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Əməliyyatların idarə edilməsi',                        credit: 4, hours: 30, absenceLimit: 3, weekly: 2 },
      { name: 'Layihələrin idarə edilməsi',                           credit: 6, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Mülki müdafiə',                                        credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 1 (Marketinq)',                           credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester5: [
      { name: 'Makroiqtisadiyyat',                                    credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Statistika',                                           credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Koorporativ idarəetmə',                                credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İnsan resurslarının idarə edilməsi',                   credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester6: [
      { name: 'Ekonometrika',                                         credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn (İnformasiya texnologiyaları)',             credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 1 (Bank işi)',                            credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2 (İdarəetmə iqtisadiyyatı)',             credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 3 (İdarəetmənin sosiologiyası)',         credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester7: [
      { name: 'Seçmə fənn (Fəlsəfə)',                                 credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Strateji menecment',                                   credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Keyfiyyətin idarə edilməsi',                           credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Sərt bacarıqlar (Hard skills)',                        credit: 10, hours: 30, absenceLimit: 3, weekly: 2 },
      { name: 'Seçmə fənn - 1 (Proseslərin idarə edilməsi)',          credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester8: [
      { name: 'İstehsalat təcrübəsi / layihə',                        credit: 6, hours: 0, absenceLimit: 0, weekly: 0 },
      { name: 'İnnovasiya menecmenti',                                credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1 (Rəqəmsal iqtisadiyyat)',               credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2 (Liderlik)',                            credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 3 (İqtisadi dinamikanın əsasları)',       credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
  },

  /* ─── MARKETİNQ ──────────────────────────────────────── */
  marketing: {
    name: 'Marketinq', icon: '📊',
    semester1: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1',    credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İqtisadiyyata giriş',                                  credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xətti cəbr və riyazi analiz',                          credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İKT - baza komputer bilikləri',                        credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester2: [
      { name: 'Azərbaycanın tarixi',                                  credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2',     credit: 3, hours: 75, absenceLimit: 9, weekly: 5 },
      { name: 'Ehtimal nəzəriyyəsi və riyazi statistika',             credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Karyera planlaması',                                   credit: 5, hours: 30, absenceLimit: 3, weekly: 2 },
      { name: 'Yumşaq bacarıqlar (Soft skills)',                      credit: 9, hours: 30, absenceLimit: 3, weekly: 2 },
    ],
    semester3: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3',     credit: 4, hours: 90, absenceLimit: 11, weekly: 6 },
      { name: 'Mikroiqtisadiyyat',                                    credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Marketinq',                                            credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Marketinq tətqiqatları',                               credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2 (Maliyyə uçotu)',                       credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4',     credit: 4, hours: 90, absenceLimit: 11, weekly: 6 },
      { name: 'Makroiqtisadiyyat',                                    credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İstehlakçı davranışları',                              credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Pərakəndə ticarət marketinqi',                         credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1 (Biznesin əsasları)',                   credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester5: [
      { name: 'Rəqəmsal marketinq',                                   credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1 (Rəqəmsal iqtisadiyyat)',               credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2 (Beynəlxalq marketinq)',                credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 3 (İqtisadi dinamikanın əsasları)',       credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 4 (Sosial media marketinq)',              credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester6: [
      { name: 'Statistika',                                           credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Menecment',                                            credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Strateji marketinq',                                   credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn (İnformasiya texnologiyaları)',             credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 1 (Strateji brend menecmenti)',          credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester7: [
      { name: 'Ekonometrika',                                         credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Reklam işi',                                           credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Satışın idarə edilməsi',                               credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn (Fəlsəfə)',                                 credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 1 (Bank işi)',                            credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester8: [
      { name: 'Mülki müdafiə',                                        credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 1 (Proseslərin idarə edilməsi)',          credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2 (Tədbirlər marketinqi)',                credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Sərt bacarıqlar (Hard skills)',                        credit: 10, hours: 30, absenceLimit: 3, weekly: 2 },
      { name: 'İstehsalat təcrübəsi / layihə',                        credit: 6, hours: 0, absenceLimit: 0, weekly: 0 },
    ],
  },

  /* ─── DİZAYN ──────────────────────────────────────── */
  design: {
    name: 'Dizayn', icon: '🎨',
    semester1: [
      { name: 'Azərbaycanın tarixi',            credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Rəsm-1',                          credit: 6, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Rəngkarlıq-1',                    credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Dizaynın əsasları-1',             credit: 5, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Dizayn tarixi',                   credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester2: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Rəsm-2',                          credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Rəngkarlıq-2',                    credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Dizaynın əsasları-2',             credit: 5, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn (Qrafik dizayn)',      credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester3: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Rəsm-3',                          credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Rəngkarlıq-3',                    credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Perspektiva',                     credit: 6, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Erqonomika',                      credit: 5, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn (Konstruktivləşmənin əsasları)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Rəsm-4',                          credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Rəngkarlıq-4',                    credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn (İnformasiya texnologiyaları)', credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn (Layihə qrafikası)',   credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn (Heykəltəraşlıq)',     credit: 8, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester5: [
      { name: 'Seçmə fənn - 1 (Qrafik dizayn proqramları)', credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2 (Geyimin modelləşdirilməsi)', credit: 5, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 3 (Koloristika)',    credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 4 (Bədii qrafika)',  credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 5 (Məhsulların bədii tərtibatı)', credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 6 (Geyimin layihələndirilməsi)', credit: 5, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester6: [
      { name: 'Seçmə fənn - 1 (Moda və kostyum tarixi)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2 (Moda və stil)',   credit: 6, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 3 (Dekorativ tətbiqi sənət)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 4 (Kostyumun kompozisiyası)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 5 (Material, texnika və texnologiya)', credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Mülki müdafiə',                   credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester7: [
      { name: 'Seçmə fənn - 1 (Fəlsəfə)',        credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Multikulturalizmə giriş',         credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 2 (Parçaların bədii tərtibatı)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 3 (Tətbiqi mexanika)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 4 (Portfolio)',      credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 5 (Maketləşdirmə)',  credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester8: [
      { name: 'İstehsalat təcrübəsi',            credit: 21, hours: 0, absenceLimit: 0, weekly: 0 },
      { name: 'Buraxılış işi',                   credit: 9, hours: 0, absenceLimit: 0, weekly: 0 },
    ],
  },

   /* ─── QİDA MÜHƏNDİSLİYİ ──────────────────────────────────────── */
  foodEngineering: {
    name: 'Qida mühəndisliyi', icon: '🍽️',
    semester1: [
      { name: 'Azərbaycan tarixi',                          credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xətti cəbr və analitik həndəsə',             credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Ümumi kimya',                                credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Analitik kimya',                             credit: 5, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Fizikanın əsasları',                         credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester2: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Riyazi analiz',                              credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Üzvi kimya',                                 credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Tətbiqi Fizika',                             credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İxtisasa giriş',                             credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 1 (Biologiya)',                 credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester3: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Tətbiqi riyaziyyat',                         credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Qida kimyası',                               credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Qida mühəndisliyində qidalanma və sağlamlıq', credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2 (Ümumi mikrobiologiya)',      credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Qida məhsullarının biokimyası',              credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Qida mikrobiologiyası',                      credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Qida məhsullarının keyfiyyətinə texniki-kimyəvi nəzarət', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1 (Qida mühəndisliyi dizaynı)', credit: 5, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn (Fəlsəfə)',                       credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester5: [
      { name: 'Seçmə fənn (İnformasiya texnologiyaları)',   credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Kompüter əsaslı mühəndis qrafikası',         credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Qida məhsullarının soyudulma texnologiyası', credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Mülki müdafiə',                              credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 3 (İstilik və kütlə transferi)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 4 (Bölmə əməliyyatları laboratoriyası)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester6: [
      { name: 'Qida məhsullarının təhlükəsizliyi',          credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Qida biotexnologiyası',                      credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Qida sənayesi müəssisələrində texnoloji layihələndirmə', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2 (Ədədi analiz)',              credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 5 (Yağ texnologiyası)',         credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 6 (Taxıl texnologiyası)',       credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester7: [
      { name: 'Sağlamlıq və əməyin mühafizəsi',             credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Keyfiyyəti idarəetmə sistemləri',            credit: 5, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Qida sənayesində texnoloji əməliyyatlar',    credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 7 (Meyvə və tərəvəz texnologiyası)', credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 8 (Ət texnologiyası)',          credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 9 (Süd texnologiyası)',         credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester8: [
      { name: 'İstehsalat təcrübəsi',                       credit: 21, hours: 0, absenceLimit: 0, weekly: 0 },
      { name: 'Buraxılış işi',                              credit: 9, hours: 0, absenceLimit: 0, weekly: 0 },
    ],
  },

   /* ─── BEYNƏLXALQ MÜNASİBƏTLƏR ──────────────────────────────────────── */
  internationalRelations: {
    name: 'Beynəlxalq münasibətlər', icon: '🌍',
    semester1: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Azərbaycanın tarixi',                          credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Beynəlxalq münasibətlər tarixi-1',             credit: 6, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Siyasi fikir tarixi',                          credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Mülki müdafiə',                                credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'İqtisadiyyatın əsasları',                      credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester2: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Siyasi coğrafiya',                             credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Beynəlxalq münasibətlər tarixi-2',             credit: 6, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Türk xalqlarının müasir tarixi',               credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Beynəlxalq münasibətlər nəzəriyyəsi',          credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Beynəlxalq iqtisadi münasibətlər',             credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Müasir informasiya-kommunikasiya texnologiyaları', credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester3: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Beynəlxalq münasibətlər tarixi-3',             credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Siyasi təhlil və tənqidi təfəkkür',            credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Beynəlxalq hüquq',                             credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1 (Müasir Siyasi ideologiyalar)', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 5 (Transmilli korporasiyalar)',   credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Müasir diplomatiya',                           credit: 5, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Azərbaycan Respublikasının Milli təhlükəsizliyinin əsasları', credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn (Fəlsəfə)',                         credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn (İnformasiya texnologiyaları)',     credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 3 (İqtisadi diplomatiya)',        credit: 6, hours: 45, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 7 (Dünya Siyasəti)',              credit: 6, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester5: [
      { name: 'Siyasət nəzəriyyəsi',                          credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Beynəlxalq təhlükəsizlik',                     credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İnteqrasiya prosesləri və beynəlxalq təşkilatlar', credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Azərbaycan Respublikasının xarici siyasəti',  credit: 5, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'İxtisas yönümlü xarici dil 1',                 credit: 5, hours: 75, absenceLimit: 9, weekly: 5 },
      { name: 'Seçmə fənn - 4 (Diplomatik protokol və etiket)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester6: [
      { name: 'Müqayisəli siyasi sistemlər',                  credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İxtisas yönümlü xarici dil 2',                 credit: 8, hours: 90, absenceLimit: 11, weekly: 6 },
      { name: 'Seçmə fənn - 2 (Geosiyasət)',                  credit: 5, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 9 (Təbii sərvətlərin iqtisadiyyatı)', credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 10 (Diplomatik yazışma)',         credit: 5, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 11 (Avropanın xarici siyasəti)',  credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester7: [
      { name: 'Xarici siyasətin təhlili',                     credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Müasir münaqişələr və sülh prosesi',           credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Strateji idarəetmə',                           credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'İxtisas yönümlü xarici dil 3',                 credit: 7, hours: 90, absenceLimit: 11, weekly: 6 },
      { name: 'Seçmə fənn - 6 (Dövlət qulluğu)',              credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 8 (Enerji diplomatiyası)',        credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester8: [
      { name: 'İstehsalat təcrübəsi',                         credit: 30, hours: 0, absenceLimit: 0, weekly: 0 },
    ],
  },

/* ─── BEYNƏLXALQ TİCARƏT VƏ LOGİSTİKA ──────────────────────────────────────── */
  internationalTradeLogistics: {
    name: 'Beynəlxalq ticarət və logistika', icon: '🚢',
    semester1: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İqtisadiyyata giriş',                           credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xətti cəbr və riyazi analiz',                   credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İKT - baza komputer bilikləri',                 credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester2: [
      { name: 'Azərbaycanın tarixi',                           credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, hours: 75, absenceLimit: 9, weekly: 5 },
      { name: 'Ehtimal nəzəriyyəsi və riyazi statistika',      credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Karyera planlaması',                            credit: 5, hours: 30, absenceLimit: 3, weekly: 2 },
      { name: 'Yumşaq bacarıqlar (Soft skills)',                credit: 9, hours: 30, absenceLimit: 3, weekly: 2 },
    ],
    semester3: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, hours: 90, absenceLimit: 11, weekly: 6 },
      { name: 'Mikroiqtisadiyyat',                              credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Logistikanın əsasları',                          credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Beynəlxalq ticarət hüququ',                      credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1 (Maliyyə uçotu)',                 credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, hours: 90, absenceLimit: 11, weekly: 6 },
      { name: 'Makroiqtisadiyyat',                               credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Biznesin əsasları',                               credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Təchizat zəncirinin idarəedilməsi',               credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 4 (Marketinq)',                      credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester5: [
      { name: 'Beynəlxalq iqtisadiyyat',                         credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Beynəlxalq nəqliyyat əməliyyatları',              credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 3 (Rəqəmsal iqtisadiyyat)',          credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 5 (Biznesin əsasları)',              credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 7 (İqtisadi dinamikanın əsasları)',  credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester6: [
      { name: 'Statistika',                                      credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Menecment',                                       credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Beynəlxalq ticarət',                              credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Beynəlxalq biznes',                               credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn (İnformasiya texnologiyaları)',        credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester7: [
      { name: 'Seçmə fənn (Fəlsəfə)',                            credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Ekonometrika',                                    credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2 (Bank işi)',                       credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 8 (İdxal/İxrac əməliyyatları)',      credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 9 (Ehtiyatların idarə edilməsi)',    credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester8: [
      { name: 'Mülki müdafiə',                                   credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 6 (Proseslərin idarə edilməsi)',     credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 10 (Anbar təsərrüfatı)',             credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Sərt bacarıqlar (Hard skills)',                   credit: 10, hours: 30, absenceLimit: 3, weekly: 2 },
      { name: 'İstehsalat təcrübəsi / layihə',                   credit: 6, hours: 0, absenceLimit: 0, weekly: 0 },
    ],
  },

   /* ─── EKOLOGİYA ──────────────────────────────────────── */
  ecology: {
    name: 'Ekologiya', icon: '🌿',
    semester1: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Kimya',                                  credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Biologiya',                              credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Ali riyaziyyat',                         credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Mülki müdafiə',                          credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester2: [
      { name: 'Azərbaycanın tarixi',                    credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Biosfer və onun mühafizəsi',             credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Fizika',                                 credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Yer elmlərinin əsasları',                credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Biomüxtəlifliyin qorunması',             credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester3: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Coğrafi ekologiya',                      credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Heyvan ekologiyası',                     credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Torpaqşünaslıq',                         credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Ekoloji kartoqrafiya və coğrafi informasiya sistemləri', credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 3 (Azərbaycanın coğrafiyası)', credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Ümumi ekologiya',                        credit: 5, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Ekoloji tədqiqat metodları',             credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Təbii resursların dayanıqlı idarə edilməsi', credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 2 (Azərbaycanın ekoloji vəziyyəti)', credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 9 (Təbiətdən istifadənin iqtisadi və ekoloji əsasları)', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester5: [
      { name: 'Seçmə fənn (Fəlsəfə)',                   credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Landşaftşünaslıq və landşaftın ekologiyası', credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Hava və suyun keyfiyyəti, çirklənməsi və mühafizəsi', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 4 (Nəqliyyatın ekoloji problemləri)', credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 5 (Ekoloji fəaliyyətin idarə olunması)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 10 (İqtisadiyyat və ekologiya)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester6: [
      { name: 'Seçmə fənn (Ekologiyada informasiya texnologiyalarının tətbiqi)', credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'İnsan ekologiyası və dayanıqlı inkişaf', credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Ekologiya hüququ',                       credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Sənaye ekologiyası',                     credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Ekoloji kimya',                          credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1 (Urboekologiya)',         credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester7: [
      { name: 'Meşəçilik',                              credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Ekoloji monitorinq',                     credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 6 (Ətraf mühitin çirklənməsi)', credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 7 (Ekoloji ekspertiza və layihələndirmənin əsasları)', credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 8 (Ekologiya və həyat fəaliyyətinin təhlükəsizliyi)', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester8: [
      { name: 'İstehsalat təcrübəsi',                   credit: 21, hours: 0, absenceLimit: 0, weekly: 0 },
      { name: 'Buraxılış işi',                          credit: 9, hours: 0, absenceLimit: 0, weekly: 0 },
    ],
  },

/* ─── STATİSTİKA ──────────────────────────────────────── */
  statistics: {
    name: 'Statistika', icon: '🔢',
    semester1: [
      { name: 'Azərbaycanın tarixi',                    credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xətti cəbr və riyazi analiz',            credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İKT - baza kompyüter bilikləri',         credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
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
      { name: 'Statistika',                             credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Tətbiqi statistika',                     credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İqtisadiyyatda əməliyyatların tədqiqi',  credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 4 (Marketinq)',             credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester4: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, hours: 90, absenceLimit: 11, weekly: 6 },
      { name: 'Ekonometrika',                           credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Statistik modelləşdirməyə giriş',        credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Statistik proqram paketləri',            credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1 (Maliyyə uçotu)',         credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester5: [
      { name: 'Seçmə fənn (İnformasiya texnologiyaları)', credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Mikroiqtisadiyyat',                      credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Menecment',                              credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Çoxölçülü statistik təhlil',             credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 8 (Qeyri-parametrik metodlar)', credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester6: [
      { name: 'Seçmə fənn (Fəlsəfə)',                   credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Makroiqtisadiyyat',                      credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Məlumatlar elmi',                        credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə müayinələrin layihələndirilməsi və təhlili', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2 (Bank işi)',              credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester7: [
      { name: 'Zaman sıralarının təhlili',              credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 3 (Rəqəmsal iqtisadiyyat)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 5 (Biznesin əsasları)',     credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 7 (İqtisadi dinamikanın əsasları)', credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 10 (Tətbiqi ekonometrika)', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester8: [
      { name: 'Mülki müdafiə',                          credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Sərt bacarıqlar (Hard skills)',          credit: 10, hours: 30, absenceLimit: 3, weekly: 2 },
      { name: 'İstehsalat təcrübəsi / layihə',          credit: 6, hours: 0, absenceLimit: 0, weekly: 0 },
      { name: 'Seçmə fənn - 6 (Proseslərin idarə edilməsi)', credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 9 (Aktuar hesablamalar)',   credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
  },

/* ─── DÖVLƏT VƏ BƏLƏDİYYƏ İDARƏETMƏSİ ──────────────────────────────────────── */
  publicAdministration: {
    name: 'Dövlət və bələdiyyə idarəetməsi', icon: '🏛️',
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
    name: 'Biznesin idarə edilməsi', icon: '💼',
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
    `${data.icon} <strong>${data.name}</strong>`;

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

  tbody.innerHTML = subjects.map((s, i) => `
    <tr style="animation-delay:${i * 40}ms" class="curr-row-in">
      <td class="curr-td-name">${s.name}</td>
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
