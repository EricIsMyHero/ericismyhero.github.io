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
      { name: 'İnkişaf iqtisadiyyatı',                                       credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Sərt bacarıqlar (Hard skills)',                                 credit: 10, hours: 30, absenceLimit: 3, weekly: 2 },
      { name: 'Seçmə fənn - 1',                               credit: 3, hours: 45, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 1',                                         credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1',                                   credit: 6, hours: 60,  absenceLimit: 7, weekly: 4 },
    ],
    semester8: [
      { name: 'İstehsalat təcrübəsi / layihə',         credit: 6, hours: 0, absenceLimit: 0, weekly: 0 },
      { name: 'Seçmə fənn - 1',                        credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2',                        credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 3',                        credit: 4, hours: 75, absenceLimit: 5, weekly: 3 },
      { name: 'Seçmə fənn - 4',                        credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
  },

  /* ─── MALİYYƏ ───────────────────────────────────────────── */
  finance: {
    name: 'Maliyyə', icon: '💰',
    semester1: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya',   credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xətti cəbr və riyazi analiz',                            credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İKT - baza komputer bilikləri',                          credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İqtisadiyyata giriş',                                    credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1',       credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester2: [
      { name: 'Azərbaycanın tarixi',                                    credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Ehtimal nəzəriyyəsi və riyazi statistika',               credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Karyera planlaması',                                     credit: 5, hours: 30, absenceLimit: 3, weekly: 2 },
      { name: 'Yumşaq bacarıqlar (Soft skills)',                        credit: 9, hours: 30, absenceLimit: 3, weekly: 2 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2',       credit: 3, hours: 75, absenceLimit: 9, weekly: 5 },
    ],
    semester3: [
      { name: 'Vergitutma',                                             credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Maliyyə uçotu',                                          credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Mikroiqtisadiyyat',                                      credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Sosial sahibkarlıq',                                     credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3',       credit: 4, hours: 90, absenceLimit: 11, weekly: 6 },
    ],
    semester4: [
      { name: 'Korporativ maliyyə',                                     credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Marketinq',                                              credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Makroiqtisadiyyat',                                      credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Maliyyə risklərinin idarə edilməsi',                     credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4',       credit: 4, hours: 75, absenceLimit: 9, weekly: 5 },
    ],
    semester5: [
      { name: 'Beynəlxalq maliyyə',                                     credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Qiymətli kağızlar bazarı',                               credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Dövlət büdcəsi',                                         credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Maliyyə modelləşdirməsi',                                credit: 7, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Elmi tədqiqat metodologiyası',                           credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester6: [
      { name: 'Sığorta işi',                                            credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Maliyyə auditi',                                         credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İnvestisiya menecmenti',                                 credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1',                                         credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Maliyyə hüququ',                                         credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester7: [
      { name: 'Portfel idarəçiliyi',                                    credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Derivativlər və fyuçerslər',                             credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2',                                         credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İstehsalat təcrübəsi',                                   credit: 6, hours: 0,  absenceLimit: 0, weekly: 0 },
    ],
    semester8: [
      { name: 'Rəqəmsal maliyyə texnologiyaları',                       credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 3',                                         credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Buraxılış işi / Dövlət imtahanı',                        credit: 12, hours: 0, absenceLimit: 0, weekly: 0 },
    ],
  },

  /* ─── MÜHASİBAT ─────────────────────────────────────────── */
  accounting: {
    name: 'Mühasibat', icon: '📊',
    semester1: [
      { name: 'Azərbaycanın tarixi',                                    credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xətti cəbr və riyazi analiz',                            credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İKT - baza komputer bilikləri',                          credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1',       credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Karyera planlaması',                                     credit: 5, hours: 30, absenceLimit: 3, weekly: 2 },
    ],
    semester2: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya',   credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Mühasibat uçotunun əsasları',                            credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İqtisadiyyata giriş',                                    credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2',       credit: 3, hours: 75, absenceLimit: 9, weekly: 5 },
      { name: 'Yumşaq bacarıqlar (Soft skills)',                        credit: 9, hours: 30, absenceLimit: 3, weekly: 2 },
    ],
    semester3: [
      { name: 'Maliyyə uçotu - I',                                      credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Mikroiqtisadiyyat',                                      credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Vergitutma',                                             credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3',       credit: 4, hours: 90, absenceLimit: 11, weekly: 6 },
      { name: 'Ehtimal nəzəriyyəsi və riyazi statistika',               credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester4: [
      { name: 'Maliyyə uçotu - II',                                     credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Makroiqtisadiyyat',                                      credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İdarəetmə uçotu',                                        credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4',       credit: 4, hours: 75, absenceLimit: 9, weekly: 5 },
      { name: 'Biznes hüququ',                                          credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester5: [
      { name: 'Audit',                                                  credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Vergi uçotu',                                            credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Maliyyə hesabatları',                                    credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Korporativ maliyyə',                                     credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Elmi tədqiqat metodologiyası',                           credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester6: [
      { name: 'Beynəlxalq maliyyə hesabatları standartları (BMHS)',     credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xüsusi uçot məsələləri',                                 credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Mühasibat proqramları (1C)',                              credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1',                                         credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Büdcə uçotu',                                            credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester7: [
      { name: 'Uçot siyasəti',                                          credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Sahibkarlıq uçotu',                                      credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2',                                         credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İstehsalat təcrübəsi',                                   credit: 6, hours: 0,  absenceLimit: 0, weekly: 0 },
    ],
    semester8: [
      { name: 'Konsolidasiya edilmiş hesabatlar',                       credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 3',                                         credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Buraxılış işi / Dövlət imtahanı',                        credit: 12, hours: 0, absenceLimit: 0, weekly: 0 },
    ],
  },

  /* ─── MENECMENT ─────────────────────────────────────────── */
  management: {
    name: 'Menecment', icon: '🏢',
    semester1: [
      { name: 'Azərbaycanın tarixi',                                    credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xətti cəbr və riyazi analiz',                            credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İKT - baza komputer bilikləri',                          credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1',       credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Karyera planlaması',                                     credit: 5, hours: 30, absenceLimit: 3, weekly: 2 },
    ],
    semester2: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya',   credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İqtisadiyyata giriş',                                    credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İdarəetmə əsasları',                                     credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2',       credit: 3, hours: 75, absenceLimit: 9, weekly: 5 },
      { name: 'Yumşaq bacarıqlar (Soft skills)',                        credit: 9, hours: 30, absenceLimit: 3, weekly: 2 },
    ],
    semester3: [
      { name: 'Mikroiqtisadiyyat',                                      credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Təşkilati davranış',                                     credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Marketinq əsasları',                                     credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3',       credit: 4, hours: 90, absenceLimit: 11, weekly: 6 },
      { name: 'Mühasibat uçotu',                                        credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester4: [
      { name: 'Makroiqtisadiyyat',                                      credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Strateji menecment',                                     credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İnsan resurslarının idarəsi',                            credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4',       credit: 4, hours: 75, absenceLimit: 9, weekly: 5 },
      { name: 'Maliyyə uçotu',                                          credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester5: [
      { name: 'Layihənin idarə edilməsi',                               credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Sahibkarlıq',                                            credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Korporativ idarəetmə',                                   credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Statistika',                                             credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Elmi tədqiqat metodologiyası',                           credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester6: [
      { name: 'Dəyişikliklərin idarəsi',                                credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Biznes proseslərinin optimallaşdırılması',                credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Rəqabət strategiyaları',                                 credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1',                                         credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Liderlik psixologiyası',                                 credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester7: [
      { name: 'Beynəlxalq biznes',                                      credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Rəqəmsal menecment',                                     credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2',                                         credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İstehsalat təcrübəsi',                                   credit: 6, hours: 0,  absenceLimit: 0, weekly: 0 },
    ],
    semester8: [
      { name: 'Start-up idarəetməsi',                                   credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 3',                                         credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Buraxılış işi / Dövlət imtahanı',                        credit: 12, hours: 0, absenceLimit: 0, weekly: 0 },
    ],
  },

  /* ─── MARKETİNQ ─────────────────────────────────────────── */
  marketing: {
    name: 'Marketinq', icon: '📣',
    semester1: [
      { name: 'Azərbaycanın tarixi',                                    credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xətti cəbr və riyazi analiz',                            credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İKT - baza komputer bilikləri',                          credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1',       credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Karyera planlaması',                                     credit: 5, hours: 30, absenceLimit: 3, weekly: 2 },
    ],
    semester2: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya',   credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İqtisadiyyata giriş',                                    credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Marketinq əsasları',                                     credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2',       credit: 3, hours: 75, absenceLimit: 9, weekly: 5 },
      { name: 'Yumşaq bacarıqlar (Soft skills)',                        credit: 9, hours: 30, absenceLimit: 3, weekly: 2 },
    ],
    semester3: [
      { name: 'Mikroiqtisadiyyat',                                      credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İstehlakçı davranışı',                                   credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Rəqəmsal marketinq',                                     credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3',       credit: 4, hours: 90, absenceLimit: 11, weekly: 6 },
      { name: 'Brendinq',                                               credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester4: [
      { name: 'Makroiqtisadiyyat',                                      credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Bazar tədqiqatı',                                        credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İctimaiyyətlə əlaqələr (PR)',                            credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4',       credit: 4, hours: 75, absenceLimit: 9, weekly: 5 },
      { name: 'Məzmun marketinqi',                                      credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester5: [
      { name: 'Sosial media marketinqi',                                credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Reklam strategiyası',                                    credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Satış menecmenti',                                       credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Statistika',                                             credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Elmi tədqiqat metodologiyası',                           credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester6: [
      { name: 'E-ticarət',                                              credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Data analitikası (marketinqdə)',                         credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'SEO / SEM əsasları',                                     credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1',                                         credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Müştəri münasibətlərinin idarəsi (CRM)',                 credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester7: [
      { name: 'Beynəlxalq marketinq',                                   credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Kampaniya planlaması',                                   credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2',                                         credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İstehsalat təcrübəsi',                                   credit: 6, hours: 0,  absenceLimit: 0, weekly: 0 },
    ],
    semester8: [
      { name: 'Marketinqdə süni intellekt',                             credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 3',                                         credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Buraxılış işi / Dövlət imtahanı',                        credit: 12, hours: 0, absenceLimit: 0, weekly: 0 },
    ],
  },

  /* ─── BANK İŞİ ───────────────────────────────────────────── */
  banking: {
    name: 'Bank işi', icon: '🏦',
    semester1: [
      { name: 'Azərbaycanın tarixi',                                    credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xətti cəbr və riyazi analiz',                            credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İKT - baza komputer bilikləri',                          credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-1',       credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Karyera planlaması',                                     credit: 5, hours: 30, absenceLimit: 3, weekly: 2 },
    ],
    semester2: [
      { name: 'Azərbaycan dilində işgüzar və akademik kommunikasiya',   credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İqtisadiyyata giriş',                                    credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Bank işinin əsasları',                                   credit: 8, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-2',       credit: 3, hours: 75, absenceLimit: 9, weekly: 5 },
      { name: 'Yumşaq bacarıqlar (Soft skills)',                        credit: 9, hours: 30, absenceLimit: 3, weekly: 2 },
    ],
    semester3: [
      { name: 'Mikroiqtisadiyyat',                                      credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Maliyyə uçotu',                                          credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Kredit əməliyyatları',                                   credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-3',       credit: 4, hours: 90, absenceLimit: 11, weekly: 6 },
      { name: 'Pul tədavülü nəzəriyyəsi',                               credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester4: [
      { name: 'Makroiqtisadiyyat',                                      credit: 10, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Pul və bank nəzəriyyəsi',                                credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Maliyyə risklərinin idarəsi',                            credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Xarici dildə işgüzar və akademik kommunikasiya-4',       credit: 4, hours: 75, absenceLimit: 9, weekly: 5 },
      { name: 'Vergitutma',                                             credit: 4, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester5: [
      { name: 'Mərkəzi bank fəaliyyəti',                                credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Beynəlxalq hesablaşmalar',                               credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Qiymətli kağızlar bazarı',                               credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Statistika',                                             credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Elmi tədqiqat metodologiyası',                           credit: 4, hours: 45, absenceLimit: 5, weekly: 3 },
    ],
    semester6: [
      { name: 'Bank hüququ',                                            credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Lizinq və faktorinq',                                    credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Elektron bankçılıq',                                     credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 1',                                         credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Sığorta',                                                credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
    ],
    semester7: [
      { name: 'İslam bankçılığı',                                       credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Maliyyə texnologiyaları (FinTech)',                      credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 2',                                         credit: 6, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'İstehsalat təcrübəsi',                                   credit: 6, hours: 0,  absenceLimit: 0, weekly: 0 },
    ],
    semester8: [
      { name: 'Kripto maliyyə və blokçeyn',                             credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Seçmə fənn - 3',                                         credit: 5, hours: 60, absenceLimit: 7, weekly: 4 },
      { name: 'Buraxılış işi / Dövlət imtahanı',                        credit: 12, hours: 0, absenceLimit: 0, weekly: 0 },
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
