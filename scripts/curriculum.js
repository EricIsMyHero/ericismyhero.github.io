/* =============================================================
   CURRICULUM.JS  –  İxtisas Planı Modulu
   UNEC tələbəsi üçün 8 semestr fənn cədvəli + localStorage
   ============================================================= */

const CURRICULUM_DATA = {

  /* ─── İQTİSADİYYAT ──────────────────────────────────────── */
  economics: {
    name: 'İqtisadiyyat', icon: 'trending_up',
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
      { name: 'Ekonometrika',                           credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Sosial sahələrin iqtisadiyyatı',         credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1',                         credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 2',                         credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 3',                         credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
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
      { name: 'Seçmə fənn - 3',                        credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 4',                        credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
  },

  /* ─── MALİYYƏ ──────────────────────────────────────── */
  finance: {
    name: 'Maliyyə', icon: 'payments',
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
    name: 'Mühasibat', icon: 'receipt_long',
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
    name: 'Menecment', icon: 'explore',
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
    name: 'Marketinq', icon: 'bar_chart',
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
    name: 'Dizayn', icon: 'palette',
    semester1: [
      { name: 'Azərbaycanın tarixi',            credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Rəsm-1',                          credit: 6, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Rəngkarlıq-1',                    credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Dizaynın əsasları-1',             credit: 5, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Dizayn tarixi',                   credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester2: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, hours: 60, absenceLimit: 7, weekly: 4 },
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
      { name: 'Seçmə fənn - 5 (Məhsulların bədii tərtibatı (Sənaye dizaynı))', credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 6 (Geyimin layihələndirilməsi (Geyim dizaynı))', credit: 5, hours: 45, absenceLimit: 5, weekly: 3 },
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
      { name: 'Seçmə fənn - 4 (Portfolio (Sənaye dizaynı))',      credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 5 (Maketləşdirmə (Sənaye dizaynı))',  credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester8: [
      { name: 'İstehsalat təcrübəsi',            credit: 21, hours: 0, absenceLimit: 0, weekly: 0 },
      { name: 'Buraxılış işi',                   credit: 9, hours: 0, absenceLimit: 0, weekly: 0 },
    ],
  },

   /* ─── QİDA MÜHƏNDİSLİYİ ──────────────────────────────────────── */
  foodEngineering: {
    name: 'Qida mühəndisliyi', icon: 'restaurant',
    semester1: [
      { name: 'Azərbaycan tarixi',                          credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Xətti cəbr və analitik həndəsə',             credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Ümumi kimya',                                credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Analitik kimya',                             credit: 5, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Fizikanın əsasları',                         credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester2: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, hours: 60, absenceLimit: 7, weekly: 4 },
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
      { name: 'Seçmə fənn - 1 (Qida mühəndisliyi dizaynı və iqtisadiyyatı)', credit: 5, hours: 45, absenceLimit: 5, weekly: 3 },
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
    name: 'Beynəlxalq münasibətlər', icon: 'public',
    semester1: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya', credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Azərbaycanın tarixi',                          credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1', credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Beynəlxalq münasibətlər tarixi-1',             credit: 6, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Siyasi fikir tarixi',                          credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Mülki müdafiə',                                credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'İqtisadiyyatın əsasları',                      credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester2: [
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2', credit: 3, hours: 60, absenceLimit: 7, weekly: 4 },
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
      { name: 'Seçmə fənn (İnformasiya texnologiyaları (İxtisas üzrə))', credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 3 (İqtisadi diplomatiya)',        credit: 6, hours: 45, absenceLimit: 5, weekly: 3 },
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
    name: 'Beynəlxalq ticarət və logistika', icon: 'directions_boat',
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
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4', credit: 4, hours: 75, absenceLimit: 9, weekly: 5 },
      { name: 'Makroiqtisadiyyat',                               credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Biznesin əsasları',                               credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Təchizat zəncirinin idarəedilməsi',               credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 4 (Marketinq)',                      credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester5: [
      { name: 'Beynəlxalq iqtisadiyyat',                         credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Beynəlxalq nəqliyyat əməliyyatları',              credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 3 (Rəqəmsal iqtisadiyyat (Sahə iqtisadiyyatı))', credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
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
    name: 'Ekologiya', icon: 'eco',
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
    name: 'Statistika', icon: 'calculate',
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
