// ============================================================
// Hər fənnə mütləq "type" yazın: "test" və ya "yazili"
// Hər fənnə mütləq "semester" yazın: 1 (Payız) və ya 2 (Yaz)
// subjects altında: { type: "test", semester: 1, pdfs: [...] }
// 
// PDF TİPLƏRİ (pdfType) - Əl ilə təyin olunur:
// "important"    → Vacib / Əsas material
// "exam"         → İmtahan sualları
// "quiz"         → Quiz / Kiçik imtahan
// "notes"        → Dərs qeydləri
// "summary"      → Xülasə / Konspekt
// "practice"     → Praktiki məşğələ
// "reference"    → Ədəbiyyat / İstinad
// "optional"     → Əlavə / İxtiyari
// "old"          → Köhnə material
// ============================================================

const BASE = "/";
const EXTRAS_BASE = "/pdf-extra/";

const PDF_TYPES = {
  important:  { label: "Vacib",       color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)" },
  exam:       { label: "İmtahan",     color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.3)" },
  quiz:       { label: "Quiz",        color: "#eab308", bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.3)" },
  notes:      { label: "Qeydlər",     color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)" },
  summary:    { label: "Xülasə",      color: "#06b6d4", bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.3)" },
  practice:   { label: "Praktika",    color: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)" },
  reference:  { label: "Ədəbiyyat",   color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.3)" },
  optional:   { label: "Əlavə",       color: "#a855f7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.3)" },
  old:        { label: "Köhnə",       color: "#6b7280", bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.3)" }
};

const data = {
  "1-ci kurs": {
    icon: "📘",
    subjects: {
      "Xətti cəbr və riyazi analiz": {
        type: "test", semester: 1, pdfs: [
          { name: "Xətti Cəbr və Riyazi Analiz Q26", file: "xcraQ26.pdf", pdfType: "exam" }
        ]
      },
      "İKT - Baza kompüter bilikləri": {
        type: "test", semester: 1, pdfs: [
          { name: "İKT - Baza Kompüter Bilikləri Q26", file: "iktQ26.pdf", pdfType: "exam" },
          { name: "İKT - Baza Kompüter Bilikləri Q25", file: "iktQ25.pdf", pdfType: "old" }
        ]
      },
      "Azərbaycanın tarixi": {
        type: "test", semester: 1, pdfs: [
          { name: "Azərbaycanın Tarixi Q26", file: "aztarixiQ26.pdf", pdfType: "exam" }
        ]
      },
      "Karyera planlaması": {
        type: "test", semester: 1, pdfs: [
          { name: "Karyera Planlaması Q26", file: "karyeraQ26.pdf", pdfType: "exam" },
          { name: "Karyera Planlaması Q25", file: "karyeraQ25.pdf", pdfType: "old" }
        ]
      },
      "Xarici dildə işgüzar və akademik kommunikasiya A1": {
        type: "test", semester: 1, pdfs: [
          { name: "White Death A1", file: "whitedeathA1.pdf", pdfType: "exam" }
        ]
      },
      "Riyaziyyat-1": {
        type: "test", semester: 1, pdfs: [
          { name: "Riyaziyyat-1 Q24", file: "riyaziyyat1Q24.pdf", pdfType: "exam" }
        ]
      },
      "Hidrologiya": {
        type: "yazili", semester: 1, pdfs: [
          { name: "Hidrologiya - 1", file: "hidrologiya1.pdf", pdfType: "notes" }
        ]
      },
      "Fizikanın əsasları": {
        type: "yazili", semester: 1, pdfs: [
          { name: "Fizikanın Əsasları - Kollekvium", file: "fizikaninesaslarikollek1.pdf", pdfType: "practice" }
        ]
      },
      "Ümumi kimya": {
        type: "yazili", semester: 1, pdfs: [
          { name: "Ümumi Kimya - Kollekvium", file: "umumikimyakollek1.pdf", pdfType: "practice" },
          { name: "Ümumi Kimya - 36-75", file: "umumikimya36-75.pdf", pdfType: "notes" }
        ]
      },
      "Ehtimal nəzəriyyəsi və riyazi statistika": {
        type: "test", semester: 2, pdfs: [
          { name: "Ehtimal Nəzəriyyəsi və Riyazi Statistika Y25", file: "enrsY25.pdf", pdfType: "exam" },
          { name: "Ehtimal Nəzəriyyəsi və Riyazi Statistika Y23", file: "enrsY23.pdf", pdfType: "old" }
        ]
      },
      "Xarici dildə işgüzar və akademik kommunikasiya A2": {
        type: "test", semester: 2, pdfs: [
          { name: "Robinson Crusoe A2", file: "robinsoncrusoeA2.pdf", pdfType: "exam" }
        ]
      },
      "Azərbaycan dilində işgüzar və akademik kommunikasiya": {
        type: "test", semester: 2, pdfs: [
          { name: "ADİAK Q26", file: "adiakQ26.pdf", pdfType: "exam" },
          { name: "ADİAK Y25", file: "adiakY25.pdf", pdfType: "exam" },
          { name: "ADİAK Y23", file: "adiakY23.pdf", pdfType: "old" }
        ]
      },
      "Yumşaq bacarıqlar (Soft skills)": {
        type: "test", semester: 2, pdfs: [
          { name: "Soft Skills Y25", file: "softskillsY25.pdf", pdfType: "exam" }
        ]
      },
      "İqtisadiyyata giriş": {
        type: "yazili", semester: 2, pdfs: [
          { name: "İqtisadiyyata Giriş - 1", file: "iqtisadiyyat1.pdf", pdfType: "notes" }
        ]
      },
      "Mülki müdafiə": {
        type: "test", semester: 2, pdfs: [
          { name: "Mülki Müdafiə Q26", file: "mulkimudafieQ26.pdf", pdfType: "exam" },
          { name: "Mülki Müdafiə Y24", file: "mulkimudafieY24.pdf", pdfType: "exam" },
          { name: "Mülki Müdafiə Q23", file: "mulkimudafieQ23.pdf", pdfType: "old" }
        ]
      },
      "Mühəndis qrafikası": {
        type: "yazili", semester: 2, pdfs: [
          { name: "Mühəndis Qrafikası - 1", file: "muhendisqrafikasi1.pdf", pdfType: "notes" }
        ]
      },
      "Ümumi ekologiya": {
        type: "yazili", semester: 2, pdfs: [
          { name: "Ümumi Ekologiya - 1", file: "umumiekologiya1.pdf", pdfType: "notes" }
        ]
      },
      "Riyaziyyat-2": {
        type: "yazili", semester: 2, pdfs: [
          { name: "Riyaziyyat-2 Y25", file: "riyaziyyat2Y25.pdf", pdfType: "exam" }
        ]
      },
      "Analitik kimya və instrumental analiz": {
        type: "yazili", semester: 2, pdfs: [
          { name: "Analitik Kimya və İnstrumental Analiz - 1 - Kollekvium", file: "akiakollek1.pdf", pdfType: "practice" }
        ]
      },
      "Sosial işdə idarəetmə": {
        type: "yazili", semester: 2, pdfs: [
          { name: "Sosial İşdə İdarəetmə - 1 - Kollekvium", file: "sosialisdeidareetmekollek1.pdf", pdfType: "practice" }
        ]
      },
      "Sosial iş təcrübəsində etik prinsiplər": {
        type: "yazili", semester: 2, pdfs: [
          { name: "Sosial İş Təcrübəsində Etik Prinsiplər - 1 - Kollekvium", file: "sitepkollek1.pdf", pdfType: "practice" },
          { name: "Sosial İş Təcrübəsində Etik Prinsiplər - 2 - Kollekvium", file: "sitepkollek2.pdf", pdfType: "practice" }
        ]
      },
      "Psixologiya": {
        type: "test", semester: 2, pdfs: [
          { name: "Psixologiya Y23", file: "psixologiyaY23.pdf", pdfType: "old" },
          { name: "Psixologiya - 1 - Kollekvium", file: "psixologiyakollek1.pdf", pdfType: "practice" }
        ]
      },
      "Sosial işin nəzəriyyəsi və təcrübəsi-2": {
        type: "yazili", semester: 2, pdfs: [
          { name: "Sosial işin nəzəriyyəsi və təcrübəsi-2 - 1 - Semester", file: "sint1.pdf", pdfType: "notes" },
          { name: "Sosial işin nəzəriyyəsi və təcrübəsi-2 - 1 - Kollekvium", file: "sintkollek1.pdf", pdfType: "practice" }
        ]
      },
      "Sosial işdə riyazi metodlar": {
        type: "test", semester: 2, pdfs: [
          { name: "Sosial İşdə Riyazi Metodlar - 1 - Kollekvium", file: "sirmkollek1.pdf", pdfType: "practice" }
        ]
      },
      "Liner cebir ve matematiksel analiz": {
        type: "test", semester: 1, pdfs: [
          { name: "Liner Cebir ve Matematiksel Analiz Q26", file: "lcmaQ26.pdf", pdfType: "exam" },
          { name: "Liner Cebir ve Matematiksel Analiz Q23", file: "lcmaQ23.pdf", pdfType: "old" }
        ]
      },
      "Azerbaycanın tarihi": {
        type: "test", semester: 1, pdfs: [
          { name: "Azerbaycanın Tarihi Q26", file: "aztarihiQ26.pdf", pdfType: "exam" },
          { name: "Azerbaycanın Tarihi Q25", file: "aztarihiQ25.pdf", pdfType: "old" }
        ]
      },
      "Bilgi işlem teknolojileri": {
        type: "test", semester: 1, pdfs: [
          { name: "Bilgi İşlem Teknolojileri - 1", file: "bit1.pdf", pdfType: "exam" }
        ]
      },
      "Yönetim ve organizasyon": {
        type: "test", semester: 1, pdfs: [
          { name: "Yönetim ve Organizasyon Q25", file: "yonetimorganizasyonQ25.pdf", pdfType: "exam" }
        ]
      },
      "Olasılık teorisi ve matematiksel istatistik": {
        type: "test", semester: 2, pdfs: [
          { name: "Olasılık Teorisi ve Matematiksel İstatistik Y26", file: "otmiY26.pdf", pdfType: "exam" }
        ]
      }
    }
  },
  "2-ci kurs": {
    icon: "📗",
    subjects: {
      "Mikroiqtisadiyyat": {
        type: "yazili", semester: 1, pdfs: [
          { name: "Mikroiqtisadiyyat - 1", file: "mikroiqt1.pdf", pdfType: "notes" },
          { name: "Mikroiqtisadiyyat - 2", file: "mikroiqt2.pdf", pdfType: "notes" },
          { name: "Mikroiqtisadiyyat - 3", file: "mikroiqt3.pdf", pdfType: "notes" },
          { name: "Mikroiqtisadiyyat - 1 - Məsələlər", file: "mikroiqtmesele1.pdf", pdfType: "practice" },
          { name: "Mikroiqtisadiyyat - 2 - Məsələlər", file: "mikroiqtmesele2.pdf", pdfType: "practice" }
        ]
      },
      "Qiymət siyasəti": {
        type: "yazili", semester: 1, pdfs: [
          { name: "Qiymət Siyasəti", file: "qiymet1.pdf", pdfType: "notes" }
        ]
      },
      "Əməyin iqtisadiyyatı": {
        type: "yazili", semester: 1, pdfs: [
          { name: "Əməyin İqtisadiyyatı - 1", file: "emek1.pdf", pdfType: "notes" },
          { name: "Əməyin İqtisadiyyatı - 1 - Kollekvium", file: "emekkollek1.pdf", pdfType: "practice" }
        ]
      },
      "Xarici dildə işgüzar və akademik kommunikasiya B1": {
        type: "test", semester: 1, pdfs: [
          { name: "Forrest Gump B1", file: "forrestgumpB1.pdf", pdfType: "exam" }
        ]
      },
      "Ətraf mühitin iqtisadiyyatı": {
        type: "yazili", semester: 1, pdfs: [
          { name: "Ətraf Mühitin İqtisadiyyatı - 1", file: "emi1.pdf", pdfType: "notes" },
          { name: "Ətraf Mühitin İqtisadiyyatı - 2", file: "emi2.pdf", pdfType: "notes" },
          { name: "Ətraf Mühitin İqtisadiyyatı - 1 - Kollekvium", file: "emikollek1.pdf", pdfType: "practice" },
          { name: "Ətraf Mühitin İqtisadiyyatı - 2 - Kollekvium", file: "emikollek2.pdf", pdfType: "practice" }
        ]
      },
      "Azərbaycan iqtisadiyyatı": {
        type: "yazili", semester: 2, pdfs: [
          { name: "Azərbaycan İqtisadiyyatı - 1", file: "aziqt1.pdf", pdfType: "notes" },
          { name: "Azərbaycan İqtisadiyyatı - 2", file: "aziqt2.pdf", pdfType: "notes" },
          { name: "Azərbaycan İqtisadiyyatı - 3", file: "aziqt3.pdf", pdfType: "notes" }
        ]
      },
      "Makroiqtisadiyyat": {
        type: "yazili", semester: 2, pdfs: [
          { name: "Makroiqtisadiyyat - 1", file: "makroiqt1.pdf", pdfType: "notes" },
          { name: "Makroiqtisadiyyat - 1 - Məsələlər", file: "makroiqtmesele1.pdf", pdfType: "practice" }
        ]
      },
      "Maliyyə uçotu": {
        type: "test", semester: 2, pdfs: [
          { name: "Maliyyə Uçotu Q26", file: "maliyyeQ26.pdf", pdfType: "exam" }
        ]
      },
      "Xarici dildə işgüzar və akademik kommunikasiya B1+": {
        type: "test", semester: 2, pdfs: [
          { name: "Sherlock Holmes B1+", file: "sherlockholmesB1+.pdf", pdfType: "exam" }
        ]
      },
      "İqtisadi fikir tarixi": {
        type: "yazili", semester: 2, pdfs: [
          { name: "İqtisadi Fikir Tarixi - 1", file: "iqtfkrtrx1.pdf", pdfType: "notes" },
          { name: "İqtisadi Fikir Tarixi - 2", file: "iqtfkrtrx2.pdf", pdfType: "notes" },
          { name: "İqtisadi Fikir Tarixi - 3", file: "iqtfkrtrx3.pdf", pdfType: "notes" }
        ]
      },
      "Xərclərin idarə edilməsi": {
        type: "test", semester: 2, pdfs: [
          { name: "Xərclərin İdarə Edilməsi Y25", file: "xerclerY25.pdf", pdfType: "exam" }
        ]
      }
    }
  },
  "3-cü kurs": {
    icon: "📙",
    subjects: {
      "Mülki müdafiə": {
        type: "test", semester: 1, pdfs: [
          { name: "Mülki Müdafiə Q26", file: "mulkimudafieQ26.pdf", pdfType: "exam" },
          { name: "Mülki Müdafiə Y24", file: "mulkimudafieY24.pdf", pdfType: "exam" },
          { name: "Mülki Müdafiə Q23", file: "mulkimudafieQ23.pdf", pdfType: "old" }
        ]
      },
      "Statistika": {
        type: "yazili", semester: 1, pdfs: [
          { name: "Statistika", file: "statistika.pdf", pdfType: "notes" }
        ]
      }
    }
  },
  "4-cü kurs": {
    icon: "📕",
    subjects: {
      "Menecment": {
        type: "test", semester: 1, pdfs: [
          { name: "Management material", file: "Manage.pdf", pdfType: "important" }
        ]
      }
    }
  }
};

const extrasData = {
  "1-ci kurs": [
    { name: "Ehtimal nəzəriyyəsi və riyazi statistika - Kollekvium", file: "enrskollektaplarla1.pdf", desc: "Bir çox testin yanında həlli yolu var", pdfType: "practice" },
    { name: "Azərbaycan dilində işgüzar və akademik kommunikasiya - Test", file: "adiaktest1.pdf", desc: "ADİAK fənninə aid test", pdfType: "exam" },
    { name: "Ümumi kimya - 20 ballar", file: "umumikimya20ballar.pdf", desc: "Ümumi Kimya fənninin 20 ballıq sualları", pdfType: "exam" }
  ],
  "2-ci kurs": [
    { name: "Robinson Crusoe - Azərbaycan", file: "robinsonazeA2.pdf", desc: "Robinson Crusoe Azərbaycan dilindəki versiyası", pdfType: "optional" }
  ],
  "3-cü kurs": [
    { name: "Nümunə Material", file: "numune3.pdf", desc: "Əlavə qeydlər", pdfType: "optional" }
  ],
  "4-cü kurs": [
    { name: "Nümunə Material", file: "numune4.pdf", desc: "Əlavə qeydlər", pdfType: "optional" }
  ]
};