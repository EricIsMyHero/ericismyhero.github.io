// ============================================================
// Hər fənnə mütləq "type" yazın: "test" və ya "yazili"
// Hər fənnə mütləq "semester" yazın: 1 (Payız) və ya 2 (Yaz)
// subjects altında: { type: "test", semester: 1, pdfs: [...] }
// ============================================================
const data = {
  "1-ci kurs": {
    icon: "📘",
    subjects: {
      "Xətti cəbr və riyazi analiz": {
        type: "test", semester: 1, pdfs: [
          { name: "Xətti Cəbr və Riyazi Analiz Q26", file: "xcraQ26.pdf" }
        ]
      },
      "İKT - Baza kompüter bilikləri": {
        type: "test", semester: 1, pdfs: [
          { name: "İKT - Baza Kompüter Bilikləri Q26", file: "iktQ26.pdf" },
          { name: "İKT - Baza Kompüter Bilikləri Q25", file: "iktQ25.pdf" }
        ]
      },
      "Azərbaycanın tarixi": {
        type: "test", semester: 1, pdfs: [
          { name: "Azərbaycanın Tarixi Q26", file: "aztarixiQ26.pdf" }
        ]
      },
      "Karyera planlaması": {
        type: "test", semester: 1, pdfs: [
          { name: "Karyera Planlaması Q26", file: "karyeraQ26.pdf" },
          { name: "Karyera Planlaması Q25", file: "karyeraQ25.pdf" }
        ]
      },
      "Xarici dildə işgüzar və akademik kommunikasiya A1": {
        type: "test", semester: 1, pdfs: [
          { name: "White Death A1", file: "whitedeathA1.pdf" }
        ]
      },
      "Riyaziyyat 1": {
        type: "test", semester: 1, pdfs: [
          { name: "Riyaziyyat 1 Q24", file: "riyaziyyat1Q24.pdf" }
        ]
      },
      "Hidrologiya": {
        type: "yazili", semester: 1, pdfs: [
          { name: "Hidrologiya - 1", file: "hidrologiya1.pdf" }
        ]
      },
      "Fizikanın əsasları": {
        type: "yazili", semester: 1, pdfs: [
          { name: "Fizikanın Əsasları - Kollekvium", file: "fizikaninesaslarikollek1.pdf" }
        ]
      },
      "Ümumi kimya": {
        type: "yazili", semester: 1, pdfs: [
          { name: "Ümumi Kimya - Kollekvium", file: "umumikimyakollek1.pdf" },
          { name: "Ümumi Kimya - 36-75", file: "umumikimya36-75.pdf" },
        ]
      },
      "Ehtimal nəzəriyyəsi və riyazi statistika": {
        type: "test", semester: 2, pdfs: [
          { name: "Ehtimal Nəzəriyyəsi və Riyazi Statistika Y25", file: "enrsY25.pdf" },
          { name: "Ehtimal Nəzəriyyəsi və Riyazi Statistika Y23", file: "enrsY23.pdf" }
        ]
      },
      "Xarici dildə işgüzar və akademik kommunikasiya A2": {
        type: "test", semester: 2, pdfs: [
          { name: "Robinson Crusoe A2", file: "robinsoncrusoeA2.pdf" }
        ]
      },
      "Azərbaycan dilində işgüzar və akademik kommunikasiya": {
        type: "test", semester: 2, pdfs: [
          { name: "ADİAK Q26", file: "adiakQ26.pdf" },
          { name: "ADİAK Y25", file: "adiakY25.pdf" },
          { name: "ADİAK Y23", file: "adiakY23.pdf" }
        ]
      },
      "Yumşaq bacarıqlar (Soft skills)": {
        type: "test", semester: 2, pdfs: [
          { name: "Soft Skills Y25", file: "softskillsY25.pdf" }
        ]
      },
      "İqtisadiyyata giriş": {
        type: "yazili", semester: 2, pdfs: [
          { name: "İqtisadiyyata Giriş - 1", file: "iqtisadiyyat1.pdf" }
        ]
      },
      "Mülki müdafiə": {
        type: "test", semester: 2, pdfs: [
          { name: "Mülki Müdafiə Q26", file: "mulkimudafieQ26.pdf" },
          { name: "Mülki Müdafiə Y24", file: "mulkimudafieY24.pdf" },
          { name: "Mülki Müdafiə Q23", file: "mulkimudafieQ23.pdf" }
        ]
      },
      "Mühəndis qrafikası": {
        type: "yazili", semester: 2, pdfs: [
          { name: "Mühəndis Qrafikası - 1", file: "muhendisqrafikasi1.pdf" }
        ]
      },
      "Ümumi ekologiya": {
        type: "yazili", semester: 2, pdfs: [
          { name: "Ümumi Ekologiya - 1", file: "umumiekologiya1.pdf" }
        ]
      },
      "Riyaziyyat 2": {
        type: "yazili", semester: 2, pdfs: [
          { name: "Riyaziyyat 2 Y25", file: "riyaziyyat2Y25.pdf" }
        ]
      },
      "Analitik kimya və instrumental analiz": {
        type: "yazili", semester: 2, pdfs: [
          { name: "Analitik Kimya və İnstrumental Analiz - Kollekvium", file: "akiakollek1.pdf" }
        ]
      },
      "Liner cebir ve matematiksel analiz": {
        type: "test", semester: 1, pdfs: [
          { name: "Liner Cebir ve Matematiksel Analiz Q26", file: "lcmaQ26.pdf" },
          { name: "Liner Cebir ve Matematiksel Analiz Q23", file: "lcmaQ23.pdf" }
        ]
      },
      "Azerbaycanın tarihi": {
        type: "test", semester: 1, pdfs: [
          { name: "Azerbaycanın Tarihi Q26", file: "aztarihiQ26.pdf" },
          { name: "Azerbaycanın Tarihi Q25", file: "aztarihiQ25.pdf" }
        ]
      },
      "Bilgi işlem teknolojileri": {
        type: "test", semester: 1, pdfs: [
          { name: "Bilgi İşlem Teknolojileri - 1", file: "bit1.pdf" }
        ]
      },
      "Yönetim ve organizasyon": {
        type: "test", semester: 1, pdfs: [
          { name: "Yönetim ve Organizasyon Q25", file: "yonetimorganizasyonQ25.pdf" }
        ]
      },
      "Olasılık teorisi ve matematiksel istatistik": {
        type: "test", semester: 2, pdfs: [
          { name: "Olasılık Teorisi ve Matematiksel İstatistik Y26", file: "otmiY26.pdf" }
        ]
      },
    }
  },
  "2-ci kurs": {
    icon: "📗",
    subjects: {
      "Mikroiqtisadiyyat": {
        type: "yazili", semester: 1, pdfs: [
          { name: "Mikroiqtisadiyyat - 1", file: "mikroiqt1.pdf" },
          { name: "Mikroiqtisadiyyat - 2", file: "mikroiqt2.pdf" },
          { name: "Mikroiqtisadiyyat - 3", file: "mikroiqt3.pdf" },
          { name: "Mikroiqtisadiyyat - 1 - Məsələlər", file: "mikroiqtmesele1.pdf" },
          { name: "Mikroiqtisadiyyat - 2 - Məsələlər", file: "mikroiqtmesele2.pdf" }
        ]
      },
      "Qiymət siyasəti": {
        type: "yazili", semester: 1, pdfs: [
          { name: "Qiymət Siyasəti", file: "qiymet1.pdf" }
        ]
      },
      "Əməyin iqtisadiyyatı": {
        type: "yazili", semester: 1, pdfs: [
          { name: "Əməyin İqtisadiyyatı - 1", file: "emek1.pdf" },
          { name: "Əməyin İqtisadiyyatı - 1 - Kollekvium", file: "emekkollek1.pdf" }
        ]
      },
      "Xarici dildə işgüzar və akademik kommunikasiya B1": {
        type: "test",  semester: 1,  pdfs: [
          { name: "Forrest Gump B1", file: "forrestgumpB1.pdf" }
        ]
      },
      "Ətraf mühitin iqtisadiyyatı": {
        type: "yazili", semester: 1, pdfs: [
          { name: "Ətraf Mühitin İqtisadiyyatı - 1", file: "emi1.pdf" },
          { name: "Ətraf Mühitin İqtisadiyyatı - 2", file: "emi2.pdf" },
          { name: "Ətraf Mühitin İqtisadiyyatı - 1 - Kollekvium", file: "emikollek1.pdf" },
          { name: "Ətraf Mühitin İqtisadiyyatı - 2 - Kollekvium", file: "emikollek2.pdf" }
        ]
      },
      "Azərbaycan iqtisadiyyatı": {
        type: "yazili", semester: 2, pdfs: [
          { name: "Azərbaycan İqtisadiyyatı - 1", file: "aziqt1.pdf" },
          { name: "Azərbaycan İqtisadiyyatı - 2", file: "aziqt2.pdf" },
          { name: "Azərbaycan İqtisadiyyatı - 3", file: "aziqt3.pdf" }
        ]
      },
      "Makroiqtisadiyyat": {
        type: "yazili", semester: 2, pdfs: [
          { name: "Makroiqtisadiyyat - 1", file: "makroiqt1.pdf" },
          { name: "Makroiqtisadiyyat - 1 - Məsələlər", file: "makroiqtmesele1.pdf" }
        ]
      },
      "Maliyyə uçotu": {
        type: "test", semester: 2, pdfs: [
          { name: "Maliyyə Uçotu Q26", file: "maliyyeQ26.pdf" }
        ]
      },
      "Xarici dildə işgüzar və akademik kommunikasiya B1+": {
        type: "test", semester: 2, pdfs: [
          { name: "Sherlock Holmes B1+", file: "sherlockholmesB1+.pdf" }
        ]
      },
      "İqtisadi fikir tarixi": {
        type: "yazili", semester: 2, pdfs: [
          { name: "İqtisadi Fikir Tarixi - 1", file: "iqtfkrtrx1.pdf" },
          { name: "İqtisadi Fikir Tarixi - 2", file: "iqtfkrtrx2.pdf" },
          { name: "İqtisadi Fikir Tarixi - 3", file: "iqtfkrtrx3.pdf" }
        ]
      },
      "Xərclərin idarə edilməsi": { 
        type: "test", semester: 2, pdfs: [
          { name: "Xərclərin İdarə Edilməsi Y25", file: "xerclerY25.pdf" }
        ]
      },
    }
  },
  "3-cü kurs": {
    icon: "📙",
    subjects: {
      "Mülki müdafiə": {
        type: "test", semester: 1, pdfs: [
          { name: "Mülki Müdafiə Q26", file: "mulkimudafieQ26.pdf" },
          { name: "Mülki Müdafiə Y24", file: "mulkimudafieY24.pdf" },
          { name: "Mülki Müdafiə Q23", file: "mulkimudafieQ23.pdf" }
        ]
      },
      "Statistika": {
        type: "yazili", semester: 1, pdfs: [
          { name: "Statistika", file: "statistika.pdf" }
        ]
      }
    }
  },
  "4-cü kurs": {
    icon: "📕",
    subjects: {
      "Menecment": {
        type: "test", semester: 1, pdfs: [
          { name: "Management material", file: "Manage.pdf" }
        ]
      }
    }
  }
};

const EXTRAS_BASE = "/unecimtahanmateriallari/pdf-extra/";

const extrasData = {
  "1-ci kurs": [
    { name: "Ehtimal nəzəriyyəsi və riyazi statistika - Kollekvium", file: "enrskollektaplarla1.pdf", desc: "Bir çox testin yanında həlli yolu var" },
    { name: "Azərbaycan dilində işgüzar və akademik kommunikasiya - Test", file: "adiaktest1.pdf", desc: "ADİAK fənninə aid test" },
    { name: "Ümumi kimya - 20 ballar", file: "umumikimya20ballar.pdf", desc: "Ümumi Kimya fənninin 20 ballıq sualları" }
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
