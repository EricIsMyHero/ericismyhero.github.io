// ============================================================
// I18N.JS — Mərkəzi tərcümə sistemi
// ------------------------------------------------------------
// Köhnə sistemdən fərqli olaraq, hər yeni funksiya avtomatik
// tərcümə əhatəsinə düşür: statik mətnə data-i18n atributu ver,
// JS-də dinamik mətn üçün t('key') çağır. Bir mərkəzdə saxlanır
// ki, funksiya əlavə edildikcə "unudulmasın".
//
// İstifadə (HTML):
//   <span data-i18n="key">Salam</span>
//   <input data-i18n-placeholder="key">
//   <div data-i18n-html="key"><!-- markup olan tərcümə --></div>
//   <button data-i18n-title="key">
//
// İstifadə (JS):
//   t('key')  → cari dildə mətn qaytarır
// ============================================================

const I18N = {
  az: {
    // ── Ümumi / paylaşılan ──────────────────────────────────
    btnCancel: "Ləğv et",
    btnClose: "Bağla",
    btnSave: "Yadda saxla",
    btnSend: "Göndər",
    loadingText: "Yüklənir...",
    seeAll: "Hamısına bax →",

    // ── Köhnə sistem — ui.js / data-utils.js bunlardan istifadə edir ──
    badge: "UNEC Students Hub",
    heroTitle: 'UNEC <span>Students</span><br>Hub',
    heroDesc: "UNEC tələbələri üçün materiallar, alətlər və toplum. Bir yerdə hər şey.",
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
    downloadPdf: "Endir",
    statCourses: "Kurs",
    statSubjects: "Fənn",
    statPdfs: "PDF",
    noFavorites: "Hələ seçilən PDF yoxdur. ★ basaraq əlavə edin.",
    noExtras: "Bu kurs üçün hələ əlavə material yoxdur.",
    footer: "Bu sayt rəsmi deyildir. Yalnız tələbələrin imtahan zamanı materialları daha rahat və əlçatan tapması üçün hazırlanıb.",
    semesterFall: "Payız Semestri",
    semesterSpring: "Yaz Semestri",

    // ── PWA quraşdırma bannerı ──────────────────────────────
    installBannerText: "Bu saytı tətbiq kimi əlavə et",
    installBannerLater: "Sonra",
    installBannerInstall: "Əlavə et",

    // ── Sidebar ──────────────────────────────────────────────
    sidebarMenu: "Menyu",
    sidebarThemeSelect: "Tema Seç",
    sidebarMoreThemes: "Daha çox tema",
    sidebarNews: "Yeniliklər",
    sidebarTelegramChannel: "Teleqram Kanalı",
    sidebarContributors: "Töhfəçilər",
    sidebarThanks: "Təşəkkürlər",
    sidebarAboutSection: "Sayt haqqında",
    sidebarAboutUs: "Haqqımızda",
    sidebarPrivacy: "Məxfilik siyasəti",
    sidebarTerms: "İstifadə Şərtləri",

    // ── Support toast ────────────────────────────────────────
    supportToastTitle: "Layihəyə dəstək ol",
    supportToastSub: "Birbank və ya m10 ilə töhfə ver",

    // ── Easter egg modalı ────────────────────────────────────
    easterHiddenSection: "Gizli Bölmə",
    easterThanksTitle: "Xüsusi Təşəkkürlər",
    easterDesc: "Bu sayta <strong>heç bir töhfə vermədiyiniz</strong> üçün sizə xüsusi minnətdarlığımızı bildiririk.",
    easterFooter: "Siz olmadan bu sayt tamamilə eyni olardı",

    // ── Xəta bildiriş modalı ─────────────────────────────────
    reportTitle: "Xəta Bildir",
    reportTypeLabel: "Xəta növü",
    reportTypePdfNotOpening: "PDF açılmır",
    reportTypeWrongSubject: "PDF yanlış fəndədir",
    reportTypeVisual: "Görünüş xətası",
    reportTypeOldMaterial: "Köhnə / yanlış material",
    reportTypeButtonBroken: "Düymə işləmir",
    reportTypeOther: "Digər",
    reportMessageLabel: "Xətanın məzmunu",
    reportMessagePlaceholder: "Xətanı qısa izah edin...",
    reportThanks: "Təşəkkür edirik!",
    reportSuccessDesc: "Xəta bildirişiniz alındı.<br>Ən qısa zamanda düzəldiləcək.",

    // ── Təşəkkürlər modalı ───────────────────────────────────
    thanksDesc: "Bu layihəyə töhfə verən hər kəsə ürəkdən təşəkkür edirik:",
    thanksFooterNote: "Bu sayt tələbələr üçün, tələbələr tərəfindən hazırlanıb",

    // ── Haqqımızda modalı ────────────────────────────────────
    aboutTitle: "Sayt Haqqında",
    aboutIntro: "UNEC Students Hub, <strong>UNEC tələbələri</strong> tərəfindən hazırlanmış müstəqil tələbə platformasıdır. Məqsədimiz tələbələrin akademik və gündəlik universitet həyatını asanlaşdıran resursları, alətləri və xidmətləri vahid platformada bir araya gətirməkdir. Platformada aşağıdakı xidmətlər təqdim olunur:",
    aboutItem1: "İmtahan materialları və öyrənmə resursları",
    aboutItem2: "Onlayn testlər və bilik yoxlama sistemi",
    aboutItem3: "GPA kalkulyatoru",
    aboutItem4: "İxtisas planı",
    aboutItem5: "Dashboard və nailiyyət sistemi",
    aboutItem6: "Material istəkləri",
    aboutItem7: "AI köməkçisi",
    aboutItem8: "Taymer və məhsuldarlıq alətləri",
    aboutItem9: "Gələcək tələbə xidmətləri və icma funksiyaları",
    aboutNote: "Platforma tələbələr tərəfindən idarə olunur və UNEC və ya hər hansı dövlət qurumu ilə rəsmi əlaqəsi yoxdur. Platformada yerləşdirilən materialların müəllif hüquqları onların qanuni sahiblərinə məxsusdur. Hüquq pozuntusu olduğunu düşünürsünüzsə, bizimlə əlaqə saxlayın.",
    aboutContactBtn: "Əlaqə saxla",

    // ── Privacy / Terms (yalnız başlıq — tam mətn hələ AZ) ───
    privacyTitle: "Məxfilik Siyasəti",
    termsTitle: "İstifadə Şərtləri",

    // ── Auth modalı ──────────────────────────────────────────
    authSubtitle: "Hesabına daxil ol, irəliləyişini izlə",
    authGoogleLogin: "Google ilə daxil ol",
    authGoogleRegister: "Google ilə qeydiyyat",
    authOrEmail: "və ya email ilə",
    authEmailLabel: "Email",
    authPasswordLabel: "Şifrə",
    authLoginBtn: "Daxil ol",
    authNoAccount: "Hesabın yoxdur?",
    authRegisterLink: "Qeydiyyat",
    authForgotPassword: "Şifrəmi unutdum",
    authFullNameLabel: "Ad Soyad",
    authPasswordHint: "minumum 8 simvol, böyük hərf, rəqəm",
    authRegisterBtn: "Qeydiyyatdan keç",
    authHaveAccount: "Hesabın var?",
    authResetBtn: "Sıfırlama linki göndər",
    authBackLink: "← Geri qayıt",

    // ── PDF yüklənmə ekranı ──────────────────────────────────
    pdfLoadingTitle: "PDF Açılır...",
    pdfLoadingSub: "Fayl hazırlanır, bir az gözləyin",

    // ── Ana səhifə — Niyə bölməsi ────────────────────────────
    whyBadge: "Niyə UNEC Students?",
    whySubtitle: "Tələbə həyatını asanlaşdıran hər şey bir yerdə",
    whyCard1Title: "Sürətli Axtarış",
    whyCard1Desc: "Fənn adını yaz, anında tap. Bütün materiallar indeksləşdirilib.",
    whyCard2Title: "PDF Preview",
    whyCard2Desc: "Yükləmədən birbaşa brauzerda aç, oxu, hazırlaş.",
    whyCard3Title: "AI Sual–Cavab",
    whyCard3Desc: "Material haqqında sual ver, AI sənə izah etsin.",
    whyCard4Title: "GPA Hesablayıcı",
    whyCard4Desc: "Kreditlərini daxil et, GPA-nı real vaxtda gör.",
    whyCard5Title: "Mobil Uyğun",
    whyCard5Desc: "PWA dəstəyi ilə tətbiq kimi quraşdır, oflayn işlə.",
    whyCard6Title: "Seçilmişlər",
    whyCard6Desc: "Sevimli materiallarını saxla, tez tap.",

    statActiveStudents: "Aktiv Tələbə",
    statLiveFirebase: "Firebase-dən canlı",
    statMaterialCard: "Material",
    statPdfFormat: "PDF formatında",
    statSubjectCard: "Fənn",
    stat4Courses: "4 kurs ərzində",
    statOpenPlatform: "Açıq Platforma",
    statAlwaysAvailable: "Həmişə əlçatan",

    // ── Populyar materiallar ─────────────────────────────────
    popularBadge: "Populyar Materiallar",
    popularTrend: "Trend",
    popularNew: "Yeni",
    popularViews1: "199 baxış",
    popularViews2: "115 baxış",
    popularViews3: "69 baxış",
    popularOpen: "Aç →",

    // ── Ana səhifə footer ─────────────────────────────────────
    homeFooterContact: "Əlaqə",
    homeFooterPrivacy: "Məxfilik",
    homeFooterTerms: "Şərtlər",

    // ── Kurslar / PDF axtarış ────────────────────────────────
    searchPdfPlaceholder: "PDF axtar...",

    // ── Dəstək səhifəsi ───────────────────────────────────────
    supportPageTitle: "Layihəyə Dəstək Ol",
    supportPageDesc: "Bu sayt tamamilə pulsuz və reklamsızdır. Server xərclərini ödəməyə kömək etsəniz, layihə davam edər.",
    supportBirbankLabel: "Birbank / Bank Kartı",
    supportCoffee: "Kofe",
    supportPopular: "Populyar",
    supportServer: "Server",
    supportQrPay: "QR ilə ödəniş et",
    supportM10Label: "m10 ilə sürətli",
    supportM10AnyAmount: "İstənilən məbləği göndər",
    supportTrustRow: "Visa · Mastercard · m10 dəstəklənir",
    supportContact: "Əlaqə saxla",

    // ── Testlər ───────────────────────────────────────────────
    testHeroTitle: 'UNEC <span>Test</span><br>Sistemi ᵇᵉᵗᵃ',
    testHeroDesc: "Bu sistem beta versiyada olduğu üçün cavabların səhv olma ehtimalı vardır.",
    testSelectorLabel: "Fənn seçin",
    testCountLabel: "Sual sayı",
    testStartBtn: "Testi Başlat",
    testQuestionWord: "Sual",
    testPrev: "← Əvvəlki",
    testNext: "Növbəti →",
    testFinish: "✓ Bitir",
    testResultTitle: "Nəticə",
    testRestartBtn: "Yenidən Başla",
    testReviewTitle: "Cavabların Baxışı",

    // ── GPA ───────────────────────────────────────────────────
    gpaPageBadge: "UNEC · Akademik",
    gpaHeroSub: "GPA-nı real vaxtda hesabla. Kreditlərini izləyərək nəticəni əvvəlcədən gör.",
    gpaModeCalc: "Kalkulyator",
    gpaModePred: "Proqnozlaşdırıcı",
    gpaTotalCredit: "Ümumi Kredit",
    gpaEarnedGpa: "Qazanılan GPA",
    gpaOverallGpa: "Ümumi GPA",
    gpaShareBtn: "GPA-nı paylaş",
    gpaAddSubjectBtn: "Yeni fənn əlavə et",
    gpaPredictorTitle: "Hədəf GPA Proqnozlaşdırıcı",
    gpaPredictorSub: "Hədəfinizə çatmaq üçün qalan fənlərdən neçə bal lazım olduğunu hesablayın.",
    gpaTargetLabel: "Hədəf GPA",
    gpaTargetPlaceholder: "məs. 80",
    gpaRemainingCreditLabel: "Qalan Kredit",
    gpaRemainingCreditPlaceholder: "məs. 30",
    gpaCurrentSubjects: "Cari fənlər",
    gpaFooter: "Hazırlanıb: <strong>UNEC Tələbələri</strong> üçün · AliVerse Studio",

    // ── Dashboard ─────────────────────────────────────────────
    dashLoginPromptTitle: "Öz İrəliləyişini İzlə",
    dashLoginPromptDesc: "Giriş et — streak, XP, GPA və test nəticələrin burada saxlanır.",
    dashLoginBtn: "Daxil ol / Qeydiyyat",
    dashGreeting: "Salam",
    dashEditProfileTitle: "Profili redaktə et",
    dashFactFaculty: "Fakültə",
    dashFactMajor: "İxtisas",
    dashFactYear: "Kurs",
    dashFactRank: "Səviyyə",
    dashFactSolved: "Həll edilən test",
    dashEditFacultyPlaceholder: "məs. İqtisadiyyat",
    dashEditMajorPlaceholder: "məs. Maliyyə",
    dashEditYearSelect: "Seç...",
    dashSignOut: "Çıxış",
    dashStatistics: "STATİSTİKA",
    dashDayUnit: "gün",
    dashTestUnit: "test",
    dashSolved: "Həll edilən",
    dashXpUnit: "xp",
    dashPoints: "Bal",
    dashLevel: "SƏVİYYƏ",
    dashRecentResults: "SON TEST NƏTİCƏLƏRİ",
    dashBadges: "Badgelər",
    streakHowTitle: "Streak necə qazanılır?",
    streakQuiz: "Quiz həll et",
    streakQuizDesc: "hər gün ən azı 1 test",
    streakPdf: "PDF aç",
    streakPdfDesc: "materialları oxu",
    streakGpa: "GPA yenilə",
    streakGpaDesc: "qiymətlərini əlavə et",
    streakTimer: "Study timer işlət",
    streakTimerDesc: "ən azı 5 dəqiqə",
    streakNote: "Streak hər gün saat 00:00-da sıfırlanır. Günlük aktivlik saxla!",

    // ── QR ödəniş modalı ──────────────────────────────────────
    qrPayTitle: "QR ilə Ödəniş",
    qrPayDesc: "Tətbiqlə QR kodu skan edin və istədiyiniz məbləği göndərin",

    // ── Quiz nəticələri modalı ────────────────────────────────
    quizResultsTitle: "Son Test Nəticələri",

    // ── İxtisas Planı (Curriculum) ───────────────────────────
    currHeaderSub: "İxtisasını seç, fənnlərini, kreditlərini və qayıb limitini öyrən",
    currSelectorLabel: "İxtisasını seç",
    currSpecEconomics: "İqtisadiyyat",
    currSpecFinance: "Maliyyə",
    currSpecAccounting: "Mühasibat",
    currSpecManagement: "Menecment",
    currSpecMarketing: "Marketinq",
    currSpecDesign: "Dizayn",
    currSpecFoodEng: "Qida mühəndisliyi",
    currSpecIntlRelations: "Beynəlxalq münasibətlər",
    currSpecIntlTrade: "Beynəlxalq ticarət və logistika",
    currChangeBtn: "← Dəyiş",
    currTableSubject: "Fənn",
    currTableCredit: "Kredit",
    currTableHours: "Saat",
    currTableAbsence: "Qayıb",
    currTableWeekly: "Həftəlik",
    currSem1: "I Semestr,I Kurs",
    currSem2: "II Semestr, I Kurs",
    currSem3: "III Semestr, II Kurs",
    currSem4: "IV Semestr, II Kurs",
    currSem5: "V Semestr, III Kurs",
    currSem6: "VI Semestr, III Kurs",
    currSem7: "VII Semestr, IV Kurs",
    currSem8: "VIII Semestr, IV Kurs",
    currGpaTip: "Bu məlumatlar bir-başa UNEC-in rəsmi saytından alınmışdır, məlumatlar 2024-cü ilə aiddir. Seçmə fənnlərin qarşısında mötərizə ilə fərqləndirilmiş fənlər keçirilməsi ehtimal olunan fənlərdir.",
    currEmptyText: "Yuxarıdan öz ixtisasını seç",

    // ── Material İstəkləri ────────────────────────────────────
    reqPageBadge: "Material İstəkləri",
    reqPageTitle: 'Axtardığını <span>tapa bilmirsən?</span>',
    reqHeroSub: "İstək yaz — başqa tələbələr kömək etsin.",
    reqNewBtn: "+ Yeni istək yaz",
    reqTextPlaceholder: "Məs: Maliyyə bazarları final sualları axtarıram",
    reqCourseSelectDefault: "Kurs (istəyə görə)",
    reqSubjectPlaceholder: "Fənn adı (istəyə görə)",
    reqFilterAll: "Hamısı",
    reqFilterOpen: "Açıq",
    reqFilterFulfilled: "Tapılıb",

    // ── Taymer ────────────────────────────────────────────────
    timerNotifBanner: "Bildiriş icazəsi ver",
    timerNotifBtn: "İcazə ver",
    timerPomodoroTitle: "Pomodoro Taymer",
    timerFocus: "Fokus",
    timerShortBreak: "Qısa fasilə",
    timerLongBreak: "Uzun fasilə",
    timerSession: "Sessiya",
    timerMinsToday: "Dəq (bu gün)",
    timerExamCountdown: "İmtahan Geri Sayımı",
    examNamePlaceholder: "Fənn adı (məs: Makroiqtisadiyyat)",
    examAddBtnMain: "＋ İmtahan əlavə et",
    examAddConfirm: "Əlavə et",
    examEmptyText: "İmtahan əlavə edilməyib.",

    // ── AI köməkçisi + Premium ────────────────────────────────
    aiHeaderTitle: "AI Köməkçi",
    aiOnline: "Onlayn",
    aiUpgradeBtn: "Yüksəlt",
    aiInputPlaceholder: "Sualını yaz...",
    aiLoginToWrite: "Yazmaq üçün daxil ol",
    aiDailyRemaining: "Bugün qalan sorğu:",
    aiLimitReachedPlaceholder: "Sabah davam et — günlük limit bitdi",
    premiumModalTitle: "Premium-a Yüksəl",
    premiumModalDesc: "Günlük sorğu limiti 12-yə, mesaj uzunluğu 400 simvola qədər artır.",
    premiumRedeemLabel: "Artıq kodun var?",
    premiumActivateBtn: "Aktivləşdir",
  },

  en: {
    // ── Ümumi / shared ───────────────────────────────────────
    btnCancel: "Cancel",
    btnClose: "Close",
    btnSave: "Save",
    btnSend: "Send",
    loadingText: "Loading...",
    seeAll: "See all →",

    // ── Legacy keys — used by ui.js / data-utils.js ──────────
    badge: "UNEC Students Hub",
    heroTitle: 'UNEC <span>Students</span><br>Hub',
    heroDesc: "Materials, tools and community for UNEC students. Everything in one place.",
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
    downloadPdf: "Download",
    statCourses: "Courses",
    statSubjects: "Subjects",
    statPdfs: "PDFs",
    noFavorites: "No favorites yet. Tap ★ to add one.",
    noExtras: "No extra materials for this course yet.",
    footer: "This site is unofficial. Created to help students find exam materials more easily.",
    semesterFall: "Fall Semester",
    semesterSpring: "Spring Semester",

    // ── PWA install banner ───────────────────────────────────
    installBannerText: "Add this site as an app",
    installBannerLater: "Later",
    installBannerInstall: "Install",

    // ── Sidebar ──────────────────────────────────────────────
    sidebarMenu: "Menu",
    sidebarThemeSelect: "Choose Theme",
    sidebarMoreThemes: "More themes",
    sidebarNews: "News",
    sidebarTelegramChannel: "Telegram Channel",
    sidebarContributors: "Contributors",
    sidebarThanks: "Thanks",
    sidebarAboutSection: "About the site",
    sidebarAboutUs: "About Us",
    sidebarPrivacy: "Privacy Policy",
    sidebarTerms: "Terms of Use",

    // ── Support toast ────────────────────────────────────────
    supportToastTitle: "Support the project",
    supportToastSub: "Contribute via Birbank or m10",

    // ── Easter egg modal ─────────────────────────────────────
    easterHiddenSection: "Hidden Section",
    easterThanksTitle: "Special Thanks",
    easterDesc: "For <strong>not contributing anything</strong> to this site, we extend our special gratitude.",
    easterFooter: "Without you, this site would be exactly the same",

    // ── Bug report modal ─────────────────────────────────────
    reportTitle: "Report a Bug",
    reportTypeLabel: "Bug type",
    reportTypePdfNotOpening: "PDF won't open",
    reportTypeWrongSubject: "PDF is in the wrong subject",
    reportTypeVisual: "Visual glitch",
    reportTypeOldMaterial: "Outdated / incorrect material",
    reportTypeButtonBroken: "Button doesn't work",
    reportTypeOther: "Other",
    reportMessageLabel: "Describe the issue",
    reportMessagePlaceholder: "Briefly explain the issue...",
    reportThanks: "Thank you!",
    reportSuccessDesc: "Your report has been received.<br>We'll fix it as soon as possible.",

    // ── Thanks modal ─────────────────────────────────────────
    thanksDesc: "We wholeheartedly thank everyone who has contributed to this project:",
    thanksFooterNote: "This site is made for students, by students",

    // ── About modal ──────────────────────────────────────────
    aboutTitle: "About the Site",
    aboutIntro: "UNEC Students Hub is an independent student platform built by <strong>UNEC students</strong>. Our goal is to bring together the resources, tools and services that make students' academic and everyday university life easier, all on one platform. The platform offers the following:",
    aboutItem1: "Exam materials and study resources",
    aboutItem2: "Online tests and a knowledge-check system",
    aboutItem3: "GPA calculator",
    aboutItem4: "Curriculum plan",
    aboutItem5: "Dashboard and achievement system",
    aboutItem6: "Material requests",
    aboutItem7: "AI assistant",
    aboutItem8: "Timer and productivity tools",
    aboutItem9: "Future student services and community features",
    aboutNote: "The platform is run by students and has no official affiliation with UNEC or any government body. Copyright for materials hosted on the platform belongs to their rightful owners. If you believe a copyright has been violated, please contact us.",
    aboutContactBtn: "Contact",

    // ── Privacy / Terms (title only for now) ─────────────────
    privacyTitle: "Privacy Policy",
    termsTitle: "Terms of Use",

    // ── Auth modal ────────────────────────────────────────────
    authSubtitle: "Log in to your account, track your progress",
    authGoogleLogin: "Continue with Google",
    authGoogleRegister: "Sign up with Google",
    authOrEmail: "or with email",
    authEmailLabel: "Email",
    authPasswordLabel: "Password",
    authLoginBtn: "Log In",
    authNoAccount: "Don't have an account?",
    authRegisterLink: "Register",
    authForgotPassword: "Forgot password",
    authFullNameLabel: "Full Name",
    authPasswordHint: "min 8 characters, uppercase letter, number",
    authRegisterBtn: "Sign Up",
    authHaveAccount: "Already have an account?",
    authResetBtn: "Send reset link",
    authBackLink: "← Go back",

    // ── PDF loading screen ────────────────────────────────────
    pdfLoadingTitle: "Opening PDF...",
    pdfLoadingSub: "Preparing the file, please wait",

    // ── Home — Why section ────────────────────────────────────
    whyBadge: "Why UNEC Students?",
    whySubtitle: "Everything that makes student life easier, in one place",
    whyCard1Title: "Fast Search",
    whyCard1Desc: "Type the subject name, find it instantly. All materials are indexed.",
    whyCard2Title: "PDF Preview",
    whyCard2Desc: "Open directly in your browser without downloading, read, prepare.",
    whyCard3Title: "AI Q&A",
    whyCard3Desc: "Ask a question about the material, let AI explain it to you.",
    whyCard4Title: "GPA Calculator",
    whyCard4Desc: "Enter your credits, see your GPA in real time.",
    whyCard5Title: "Mobile Friendly",
    whyCard5Desc: "Install as an app with PWA support, work offline.",
    whyCard6Title: "Favorites",
    whyCard6Desc: "Save your favorite materials, find them fast.",

    statActiveStudents: "Active Students",
    statLiveFirebase: "Live from Firebase",
    statMaterialCard: "Materials",
    statPdfFormat: "In PDF format",
    statSubjectCard: "Subjects",
    stat4Courses: "Across 4 courses",
    statOpenPlatform: "Open Platform",
    statAlwaysAvailable: "Always available",

    // ── Popular materials ─────────────────────────────────────
    popularBadge: "Popular Materials",
    popularTrend: "Trending",
    popularNew: "New",
    popularViews1: "199 views",
    popularViews2: "115 views",
    popularViews3: "69 views",
    popularOpen: "Open →",

    // ── Home footer ────────────────────────────────────────────
    homeFooterContact: "Contact",
    homeFooterPrivacy: "Privacy",
    homeFooterTerms: "Terms",

    // ── Courses / PDF search ───────────────────────────────────
    searchPdfPlaceholder: "Search PDFs...",

    // ── Support page ───────────────────────────────────────────
    supportPageTitle: "Support the Project",
    supportPageDesc: "This site is completely free and ad-free. If you help cover server costs, the project can keep going.",
    supportBirbankLabel: "Birbank / Bank Card",
    supportCoffee: "Coffee",
    supportPopular: "Popular",
    supportServer: "Server",
    supportQrPay: "Pay with QR",
    supportM10Label: "Quick with m10",
    supportM10AnyAmount: "Send any amount",
    supportTrustRow: "Visa · Mastercard · m10 supported",
    supportContact: "Contact",

    // ── Tests ────────────────────────────────────────────────
    testHeroTitle: 'UNEC <span>Test</span><br>System ᵇᵉᵗᵃ',
    testHeroDesc: "This system is in beta, so answers may occasionally be incorrect.",
    testSelectorLabel: "Select a subject",
    testCountLabel: "Number of questions",
    testStartBtn: "Start Test",
    testQuestionWord: "Question",
    testPrev: "← Previous",
    testNext: "Next →",
    testFinish: "✓ Finish",
    testResultTitle: "Result",
    testRestartBtn: "Restart",
    testReviewTitle: "Answer Review",

    // ── GPA ──────────────────────────────────────────────────
    gpaPageBadge: "UNEC · Academic",
    gpaHeroSub: "Calculate your GPA in real time. Track your credits and see the result in advance.",
    gpaModeCalc: "Calculator",
    gpaModePred: "Predictor",
    gpaTotalCredit: "Total Credits",
    gpaEarnedGpa: "Earned GPA",
    gpaOverallGpa: "Overall GPA",
    gpaShareBtn: "Share GPA",
    gpaAddSubjectBtn: "Add new subject",
    gpaPredictorTitle: "Target GPA Predictor",
    gpaPredictorSub: "Calculate how many points you need from remaining subjects to reach your target.",
    gpaTargetLabel: "Target GPA",
    gpaTargetPlaceholder: "e.g. 80",
    gpaRemainingCreditLabel: "Remaining Credits",
    gpaRemainingCreditPlaceholder: "e.g. 30",
    gpaCurrentSubjects: "Current subjects",
    gpaFooter: "Built for <strong>UNEC Students</strong> · AliVerse Studio",

    // ── Dashboard ────────────────────────────────────────────
    dashLoginPromptTitle: "Track Your Progress",
    dashLoginPromptDesc: "Log in — your streak, XP, GPA and test results are saved here.",
    dashLoginBtn: "Log In / Register",
    dashGreeting: "Hi",
    dashEditProfileTitle: "Edit profile",
    dashFactFaculty: "Faculty",
    dashFactMajor: "Major",
    dashFactYear: "Year",
    dashFactRank: "Level",
    dashFactSolved: "Tests solved",
    dashEditFacultyPlaceholder: "e.g. Economics",
    dashEditMajorPlaceholder: "e.g. Finance",
    dashEditYearSelect: "Select...",
    dashSignOut: "Sign Out",
    dashStatistics: "STATISTICS",
    dashDayUnit: "days",
    dashTestUnit: "tests",
    dashSolved: "Solved",
    dashXpUnit: "xp",
    dashPoints: "Points",
    dashLevel: "LEVEL",
    dashRecentResults: "RECENT TEST RESULTS",
    dashBadges: "Badges",
    streakHowTitle: "How do you earn a streak?",
    streakQuiz: "Solve a quiz",
    streakQuizDesc: "at least 1 test per day",
    streakPdf: "Open a PDF",
    streakPdfDesc: "read the materials",
    streakGpa: "Update GPA",
    streakGpaDesc: "add your grades",
    streakTimer: "Run the study timer",
    streakTimerDesc: "at least 5 minutes",
    streakNote: "Your streak resets every day at 00:00. Stay active daily!",

    // ── QR pay modal ───────────────────────────────────────────
    qrPayTitle: "Pay with QR",
    qrPayDesc: "Scan the QR code with the app and send the amount you want",

    // ── Quiz results modal ──────────────────────────────────────
    quizResultsTitle: "Recent Test Results",

    // ── Curriculum ────────────────────────────────────────────
    currHeaderSub: "Choose your specialty, learn your subjects, credits and absence limits",
    currSelectorLabel: "Choose your specialty",
    currSpecEconomics: "Economics",
    currSpecFinance: "Finance",
    currSpecAccounting: "Accounting",
    currSpecManagement: "Management",
    currSpecMarketing: "Marketing",
    currSpecDesign: "Design",
    currSpecFoodEng: "Food Engineering",
    currSpecIntlRelations: "International Relations",
    currSpecIntlTrade: "International Trade & Logistics",
    currChangeBtn: "← Change",
    currTableSubject: "Subject",
    currTableCredit: "Credit",
    currTableHours: "Hours",
    currTableAbsence: "Absence",
    currTableWeekly: "Weekly",
    currSem1: "Semester I, Year I",
    currSem2: "Semester II, Year I",
    currSem3: "Semester III, Year II",
    currSem4: "Semester IV, Year II",
    currSem5: "Semester V, Year III",
    currSem6: "Semester VI, Year III",
    currSem7: "Semester VII, Year IV",
    currSem8: "Semester VIII, Year IV",
    currGpaTip: "This data was taken directly from UNEC's official website and reflects 2024. Subjects marked in parentheses are elective subjects that may or may not be offered.",
    currEmptyText: "Choose your specialty above",

    // ── Material Requests ────────────────────────────────────
    reqPageBadge: "Material Requests",
    reqPageTitle: "Can't <span>find what you're looking for?</span>",
    reqHeroSub: "Post a request — let other students help.",
    reqNewBtn: "+ New request",
    reqTextPlaceholder: "E.g: Looking for Financial Markets final exam questions",
    reqCourseSelectDefault: "Course (optional)",
    reqSubjectPlaceholder: "Subject name (optional)",
    reqFilterAll: "All",
    reqFilterOpen: "Open",
    reqFilterFulfilled: "Found",

    // ── Timer ────────────────────────────────────────────────
    timerNotifBanner: "Allow notifications",
    timerNotifBtn: "Allow",
    timerPomodoroTitle: "Pomodoro Timer",
    timerFocus: "Focus",
    timerShortBreak: "Short break",
    timerLongBreak: "Long break",
    timerSession: "Session",
    timerMinsToday: "Min (today)",
    timerExamCountdown: "Exam Countdown",
    examNamePlaceholder: "Subject name (e.g: Macroeconomics)",
    examAddBtnMain: "＋ Add exam",
    examAddConfirm: "Add",
    examEmptyText: "No exam added yet.",

    // ── AI assistant + Premium ────────────────────────────────
    aiHeaderTitle: "AI Assistant",
    aiOnline: "Online",
    aiUpgradeBtn: "Upgrade",
    aiInputPlaceholder: "Type your question...",
    aiLoginToWrite: "Log in to write",
    aiDailyRemaining: "Questions left today:",
    aiLimitReachedPlaceholder: "Come back tomorrow — daily limit reached",
    premiumModalTitle: "Upgrade to Premium",
    premiumModalDesc: "Raises your daily question limit to 12 and message length to 400 characters.",
    premiumRedeemLabel: "Already have a code?",
    premiumActivateBtn: "Activate",
  }
};

// Köhnə koda uyğunluq — ui.js hələ `translations[lang]` istifadə edir
const translations = I18N;

let lang = localStorage.getItem('lang') || 'az';

function t(key) {
  return (I18N[lang] && I18N[lang][key] !== undefined) ? I18N[lang][key]
       : (I18N.az[key] !== undefined ? I18N.az[key] : key);
}

function applyI18n(root) {
  root = root || document;
  root.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  root.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  root.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.getAttribute('data-i18n-title'));
  });
  root.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
  });
}

function setLang(l) {
  lang = l;
  localStorage.setItem('lang', l);
  applyI18n();
  // köhnə sistemin gözlədiyi əlavə yeniləmələr
  if (typeof getCurrentView === 'function') {
    const view = getCurrentView();
    if (view === 'subjects' && typeof renderSubjects === 'function') renderSubjects(currentCourse);
    else if (view === 'home' && typeof renderCourses === 'function') renderCourses();
  }
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.placeholder = t('searchPlaceholder');
  document.querySelectorAll('.lang-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === l);
  });
}

// Geriyə uyğunluq: köhnə çağırışlar üçün applyTranslations() adı saxlanılır
function applyTranslations() {
  applyI18n();
  document.querySelectorAll('.lang-pill-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
}

document.addEventListener('DOMContentLoaded', () => applyI18n());
