// Bilingual editorial content for the About, Privacy and Terms dialogs.
(function () {
  'use strict';

  const email = 'unecstudentshub@gmail.com';
  const updated = '2026-11-20';
  const copy = {
    az: {
      date: '20 noyabr 2026',
      updated: 'Son yenilənmə',
      outline: 'Mündəricat',
      contactTitle: 'Bizimlə əlaqə',
      contactText: 'Hər hansı şikayətiniz, təklifiniz və ya sualınız varsa, bizimlə əlaqə saxlayın. Müraciətinizdə mövzuya aid səhifə və ya material keçidini göstərə bilərsiniz.',
      contactButton: 'Əlaqə saxlayın',
      about: [
        ['Biz kimik',
          'UNEC Students Hub Azərbaycan Dövlət İqtisad Universitetinin tələbələri üçün yaradılmış müstəqil tələbə təşəbbüsüdür. Məqsədimiz dərs materiallarını tapmağı, imtahana hazırlaşmağı və universitet həyatını planlaşdırmağı asanlaşdırmaqdır.',
          'Layihəni tələbələr hazırlayıb və müstəqil şəkildə idarə edir. Universitet adından qərar vermək, arayış təqdim etmək və ya akademik məlumatı təsdiqləmək səlahiyyətimiz yoxdur.'],
        ['Təhsil resursları və alətlər',
          'Materiallar bölməsində dərs və imtahan PDF-lərini fənn və kurs üzrə tapa bilərsiniz. Elektron-Test və Elektron-Yazılı sınaqlar məşq etmək üçün nəzərdə tutulub. Material istəkləri bölməsində axtardığınız resursu icmadan soruşa bilərsiniz.',
          'GPA kalkulyatoru, ixtisas planı və imtahan taymeri hazırlığı planlaşdırmağa kömək edir. AI köməkçisi dərs mövzularını izah etməyə kömək edir. Hesaba daxil olduqda Dashboard-da sınaq nəticələrinizi və şəxsi irəliləyişinizi izləyə bilərsiniz.'],
        ['Tələbə Kompası və Karyera lövhəsi',
          'Tələbə Kompası tədris qaydaları, təqaüd, kampuslar və tələbə həyatı haqqında praktik bələdçilər təqdim edir. Məqalələrdəki mənbələr rəsmi məlumatı birbaşa yoxlamağa imkan verir.',
          'Karyera lövhəsində təcrübə, könüllülük və təlim elanlarını tapa bilərsiniz. Müraciət şərtlərini və son tarixi elanın təşkilatçısı müəyyən edir.'],
        ['İcmaya töhfə',
          'Materialdakı səhvi bildirmək, paylaşmağa icazəniz olan resursu təqdim etmək və yeni funksiya təklif etmək layihənin inkişafına kömək edir. Materialların müəllif hüquqları onların qanuni sahiblərinə məxsusdur.'],
      ],
      privacy: [
        ['Siyasətin əhatə dairəsi',
          'Bu siyasət UNEC Students Hub saytında hesab, təhsil alətləri, icma yazışmaları, bildirişlər və ödəniş funksiyalarından istifadə zamanı məlumatların necə işlənildiyini izah edir. Xarici müraciət formaları və digər saytlar öz məxfilik qaydalarını tətbiq edir.'],
        ['Hesab və profil',
          'Firebase Authentication giriş və hesabın təsdiqlənməsi üçün istifadə olunur. Giriş üsulundan asılı olaraq hesab identifikatoru, e-poçt, ad və profil şəkli alınır. Fakültə, ixtisas və kurs Firestore-da hesabla əlaqəli saxlanılır.'],
        ['Arena rekordları',
          'Hesabla oynadıqda ən yaxşı nəticəniz qlobal rekordlar cədvəlinə göndərilir. Cədvəldə e-poçtun @ işarəsindən əvvəlki hissəsi, nəticə və seçdiyiniz oyun görünüşü göstərilir. Hesab silindikdə ona bağlı qlobal rekordlar da silinir.'],
        ['Təhsil qeydləri və cihaz yaddaşı',
          'Hesaba daxil olduqda seçilmiş materiallar, saxlanılan Kompas məqalələri, GPA fənləri və tarixçəsi, həmçinin imtahan tarixləri cihazlar arasında sinxronlaşdırılır. İnternet olmadan etdiyiniz dəyişikliklər əlaqə bərpa olunanadək hesabınıza aid cihaz yaddaşında qalır.',
          'Qonaq kimi saxladığınız uyğun təhsil qeydləri ilk daxil olduğunuz hesaba köçürülə bilər. Hesabdan çıxanda şəxsi qeydlər ekrandan gizlədilir. Dil, tema, ixtisas planı və tamamlanma seçimləri cihazda qala bilər. Oflayn keş açıq sayt fayllarını saxlayır. Uzaq PDF-lər və hesab xidmətləri internet bağlantısı tələb edir.'],
        ['İctimai yazışmalar və fayllar',
          'Material istəkləri, fənn yazışmaları və göndərdiyiniz əlavə faylların keçidləri açıq görünə bilər. Yazışmalarda profil adınız göstərilə bilər. Əlavə fayllar Cloudflare R2-də yerləşdirilir. Şəxsi sənədləri, əlaqə məlumatlarını və başqalarına aid məxfi məlumatları açıq yazışmalarda paylaşmayın.'],
        ['Sınaqlar, şəxsi PDF-lər və süni intellekt',
          'Sınaq nəticələri və istifadə limitləri hesabla əlaqələndirilir. Şəxsi PDF sınaq hazırlamaq üçün emal olunur. Orijinal PDF serverdə yalnız emal müddətində istifadə olunur. Çıxarılan suallar və istinad cavabları hesabınıza bağlı saxlanılır. Bu mənbələr cari və əvvəlki Bakı təqvim günü ərzində istifadə oluna bilir və yeni yükləmələr köhnə qeydləri əvəz edə bilər.',
          'AI köməkçisinə yazdığınız sual və uyğun dərs konteksti, eləcə də yazılı sınaqlarda cavablarınız və uyğun mənbə izahları Groq-a ötürülür. Yazılı sınağın sualları, cavabları və nəticəsi hesabla əlaqəli saxlanılır. Növbəti yazılı sınaq yenilənəndə cari və əvvəlki Bakı təqvim gününə aid qeydlər saxlanılır. Sorğularda parol, şəxsiyyət məlumatı və digər həssas məlumat paylaşmayın.'],
        ['Bildirişlər və müraciətlər',
          'Brauzerdə push bildirişlərinə icazə versəniz, Firebase Cloud Messaging vasitəsilə cihaz tokeni, dil seçimi və varsa hesab identifikatoru işlənir. Bildirişləri saytın və ya brauzerin parametrlərindən söndürə bilərsiniz.',
          'Xəta bildirişi göndərdikdə daxil etdiyiniz mətn və uyğun material məlumatları Formspree vasitəsilə ötürülür. E-poçtla müraciətdə yazdığınız məlumatlar müraciətinizi araşdırmaq və sizə cavab vermək üçün istifadə olunur.'],
        ['Ödənişlər və görünürlük',
          'Onlayn ödəniş aktiv olduqda kart məlumatlarını ödəniş provayderinin səhifəsində daxil edirsiniz. Sayt sifarişin məbləğini, statusunu və əməliyyatı təsdiqləmək üçün lazım olan qeydləri saxlayır. Dəstəkçilər siyahısında adınızın və ya məbləğin görünməsi seçdiyiniz görünürlük ayarından asılıdır.'],
        ['Analitika, reklam və digər xidmətlər',
          'Google Analytics səhifə ziyarətləri və istifadə hadisələri barədə məlumat toplaya bilər. Google AdSense reklam göstərmək və reklam fəaliyyətini ölçmək üçün kukilərdən və digər texniki məlumatlardan istifadə edə bilər. Giriş sessiyası və sayt seçimləri üçün brauzer yaddaşından istifadə olunur.',
          'Sayt və onun server funksiyaları Vercel, Firebase və Cloudflare xidmətlərindən istifadə edir. Şriftlər Google Fonts-dan yüklənə bilər. Telegram kanalına, xarici müraciət formasına və ya ödəniş səhifəsinə keçdikdə müvafiq xidmətin öz qaydaları tətbiq olunur.'],
        ['Məlumatlarınıza nəzarət',
          'Daha çox bölməsində profilinizi və uyğun şəxsi təhsil qeydlərinizi JSON faylı kimi endirə, həmçinin yenidən giriş edib hesabın silinməsini təsdiqləyə bilərsiniz. Hesabın silinməsi giriş hesabını, profili, şəxsi təhsil qeydlərini və hesabla bağlı bildiriş tokenlərini əhatə edir.',
          'Açıq müzakirələrdən hesab adınız, öz yazışma məzmununuz və ona bağlı əlavələr çıxarılır. Digər iştirakçıların cavabları, anonimləşdirilmiş reytinqlər və hesabdan ayrılmış maliyyə qeydləri qala bilər. Əvvəllər endirdiyiniz faylları cihazınızdan idarə edə bilərsiniz. Ödəniş provayderindəki məlumatlara həmin xidmətin qaydaları tətbiq olunur.'],
      ],
      terms: [
        ['Şərtlərin tətbiqi',
          'Bu şərtlər UNEC Students Hub saytından, təhsil alətlərindən və hesab xidmətlərindən istifadəyə aiddir. Saytdan istifadə etməklə bu şərtlərə əməl etməyi qəbul edirsiniz. Platforma müstəqil tələbə təşəbbüsüdür və UNEC-i rəsmi şəkildə təmsil etmir.'],
        ['Hesab və giriş təhlükəsizliyi',
          'Hesab tələb edən funksiyalardan öz hesabınızla istifadə edin. Giriş məlumatlarınızı, təsdiq kodlarınızı və sessiya məlumatlarınızı qoruyun. Başqasının hesabına və ya şəxsi qeydlərinə icazəsiz giriş cəhdi, platformadakı limitlərin aşılması və xidmətə zərər verən müdaxilə qadağandır.'],
        ['Materiallar və müəllif hüquqları',
          'Yalnız yerləşdirməyə və paylaşmağa icazəniz olan faylları göndərin. Mənbə və müəllif barədə məlumatı mümkün olduqda qeyd edin. Materialdan istifadə və onun yenidən yayılması hüquq sahibinin icazə şərtlərinə tabedir.',
          'Hüquq pozuntusu olduğunu düşünürsünüzsə, materialın keçidini, iddianın əsasını və sizə cavab vermək üçün əlaqə məlumatını göndərin. Müraciət araşdırılarkən materialın görünməsi məhdudlaşdırıla bilər.'],
        ['İcma qaydaları',
          'Material istəklərində və yazışmalarda mövzuya aid, hörmətli məzmun paylaşın. Təhqir, ayrı-seçkilik, təhdid, spam, zərərli fayl, aldadıcı keçid və başqasının şəxsi məlumatının icazəsiz paylaşılması qadağandır. Qaydaları pozan məzmun silinə və müvafiq funksiyaya giriş məhdudlaşdırıla bilər.'],
        ['Təhsil alətləri və AI nəticələri',
          'GPA, kredit, təqaüd və ixtisas planı barədə göstəricilər istiqamətləndirmə üçündür. Sınaq nəticələri və AI qiymətləndirməsi fərdi hazırlıq üçündür. Akademik qərar verməzdən əvvəl məlumatı UNEC-in aidiyyəti bölməsində və qüvvədə olan sənədlərdə yoxlayın.'],
        ['Karyera elanları və xarici keçidlər',
          'Karyera lövhəsi işəgötürənlərin və təşkilatçıların elanlarını tapmağa kömək edir. Son tarixi, tələbləri, proqramın ödənişli olub-olmadığını və qəbul qərarını təşkilatçı müəyyən edir. Müraciət etməzdən əvvəl rəsmi elanı yoxlayın və şəxsi məlumatı yalnız təşkilatçının etibarlı müraciət formasına göndərin.'],
        ['Premium və dəstək ödənişləri',
          'Premium planın qiymətinə, müddətinə və imkanlarına ödənişdən əvvəl baxın. Könüllü dəstək və Premium plan ayrı seçimlərdir. Onlayn ödəniş aktiv olduqda kart məlumatlarını provayderin səhifəsində daxil edin. Ödəniş, aktivləşdirmə və ya geri qaytarma ilə bağlı müraciətdə əməliyyat nömrəsini göstərin.'],
        ['Hesabın silinməsi və xidmət dəyişiklikləri',
          'Hesabı silmək üçün Daha çox bölməsində yenidən giriş edib əməliyyatı təsdiqləmək tələb olunur. Silinmə geri qaytarılmır. Surət saxlamaq istəyirsinizsə, əvvəl məlumatlarınızı endirin.',
          'Texniki xidmət, mənbə dəyişiklikləri və üçüncü tərəf xidmətlərinin əlçatanlığı funksiyalara təsir edə bilər. Yenilənmiş şərtlər bu bölmədə göstərilir.'],
      ],
    },
    en: {
      date: '20 November 2026',
      updated: 'Last updated',
      outline: 'Contents',
      contactTitle: 'Contact us',
      contactText: 'Contact us with any complaint, suggestion or question. You can include the link to the relevant page or material in your message.',
      contactButton: 'Contact us',
      about: [
        ['Who we are',
          'UNEC Students Hub is an independent student initiative created for students at Azerbaijan State University of Economics. We bring together resources that make it easier to find study materials, prepare for exams and plan university life.',
          'Students built the project as an independent service. It has no authority to make decisions, issue documents or certify academic records on behalf of the university.'],
        ['Study resources and tools',
          'Browse course and exam PDFs by subject and year. Use Electronic Test and Electronic Written exams for practice, or ask the community for a missing resource through Material Requests.',
          'The GPA calculator, curriculum planner and exam timer help you plan your studies. The AI assistant can help explain study topics. Sign in to view practice results and track your progress in the Dashboard.'],
        ['Student Compass and Career Board',
          'Student Compass offers practical guides to academic procedures, stipends, campuses and student life. Its source links let you check the official information directly.',
          'The Career Board lists internships, volunteering and training opportunities. The organisation running each programme sets its requirements and application deadline.'],
        ['Contributing to the community',
          'You can improve the project by reporting an error, sharing a resource you have permission to distribute, or proposing a feature. Copyright in study materials belongs to the respective rights holders.'],
      ],
      privacy: [
        ['Scope of this policy',
          'This policy explains how UNEC Students Hub handles information when you use accounts, study tools, public discussions, notifications and payment features. External application forms and other websites apply their own privacy rules.'],
        ['Account and profile',
          'Firebase Authentication handles sign-in and account verification. Depending on the sign-in method, the service receives an account ID, email address, name and profile picture. Faculty, major and year are stored with your account in Firestore.'],
        ['Arena records',
          'When you play while signed in, your best results are submitted to the global leaderboard. The board shows the part of your email address before @, your result and your selected game appearance. Deleting your account also removes its global records.'],
        ['Study records and device storage',
          'When you sign in, saved materials, bookmarked Compass articles, GPA subjects and history, and exam dates can sync across devices. Offline changes remain in account-specific device storage until your connection returns.',
          'Eligible guest study records can move to the first account you sign into. Signing out hides private records from view. Language, theme, selected curriculum and completion choices may remain on the device. The offline cache stores public site files. Remote PDFs and account services require an internet connection.'],
        ['Public discussions and files',
          'Material requests, subject discussions and links to submitted attachments can be publicly visible. Your profile name may appear with your contributions. Cloudflare R2 hosts attachments. Keep private documents, contact details and other people’s confidential information out of public discussions.'],
        ['Practice exams, private PDFs and AI',
          'Practice results and usage allowances are linked to your account. Personal PDFs are processed to prepare practice questions. The server retains extracted questions and reference answers under your account and discards the original PDF. These sources are usable on the current and previous Baku calendar day, and new uploads can replace older records.',
          'Groq receives AI assistant questions with relevant study context and written practice answers with relevant source explanations. Written practice questions, answers and results are stored with your account. When written practice next updates, it retains records from the current and previous Baku calendar day. Keep passwords, identity details and other sensitive information out of prompts.'],
        ['Notifications and correspondence',
          'If you allow browser notifications, Firebase Cloud Messaging processes a device token, language preference and account ID when available. You can turn notifications off in the site or browser settings.',
          'When you report an issue, Formspree receives your message and the relevant material details. If you email us, we use the information you share to review and respond to your request.'],
        ['Payments and visibility',
          'When online payment is enabled, you enter card details on the payment provider’s page. The site keeps the order amount, status and records needed to confirm the transaction. Your visibility preference determines whether your name or amount appears in the supporters list.'],
        ['Analytics, advertising and other services',
          'Google Analytics may collect page visits and usage events. Google AdSense may use cookies and other technical information to display and measure advertising. The site uses browser storage for sign-in sessions and preferences.',
          'The site and its server functions use Vercel, Firebase and Cloudflare services. Fonts may load from Google Fonts. Telegram, external application forms and payment pages have their own terms and privacy practices.'],
        ['Managing your information',
          'From More, you can download your profile and eligible private study records as JSON, or sign in again and confirm account deletion. Deletion covers the sign-in account, profile, private study records and linked notification tokens.',
          'Your account name, your own message content and its linked attachments are removed from public discussions. Other participants’ replies, anonymised ratings and financial records separated from your account may be retained. You can manage downloaded copies on your device. The payment provider’s policy applies to information held by that service.'],
      ],
      terms: [
        ['Scope of these terms',
          'These terms apply to using the UNEC Students Hub website, study tools and account services. By using the platform, you agree to follow them. UNEC Students Hub is an independent student initiative with no authority to represent the university.'],
        ['Account and sign-in security',
          'Use your own account for features that require one. Keep login details, verification codes and session information secure. Unauthorised access to other accounts or private records, circumventing service limits and disruptive interference with the platform are prohibited.'],
        ['Materials and copyright',
          'Submit files only when you have permission to publish and share them. Include the source and author where possible. Use and redistribution are subject to the rights holder’s permissions.',
          'If you believe a material infringes your rights, send its link, the grounds for your claim and contact details for a reply. The material may be restricted while we review the request.'],
        ['Community rules',
          'Keep material requests and discussions relevant and respectful. Abuse, discrimination, threats, spam, harmful files, deceptive links and posting another person’s private information without permission are prohibited. Content may be removed and access to relevant features may be limited for rule violations.'],
        ['Study tools and AI results',
          'GPA, credit, stipend and curriculum figures are guidance. Practice scores and AI assessments are for personal study. Check current rules with the relevant UNEC office and official documents before making an academic decision.'],
        ['Career listings and external links',
          'The Career Board helps you find listings from employers and organisers. The organiser sets the deadline, eligibility, any payment or fees and the selection decision. Check the official listing and send personal information only through a trusted application form from the organiser.'],
        ['Premium and support payments',
          'Review the Premium plan price, duration and features before paying. Voluntary support and Premium plans are separate options. When online payment is enabled, enter card details on the provider’s page. Include the transaction reference when contacting us about a payment, activation or refund.'],
        ['Account deletion and service changes',
          'To delete your account, sign in again from More and confirm the action. Deletion is irreversible. Download your data first if you wish to keep a copy.',
          'Maintenance, changes to source materials and the availability of third-party services may affect features. Updated terms will appear in this section.'],
      ],
    },
  };

  function render() {
    const data = copy[lang] || copy.az;
    const { esc, ic } = window.UNEC;
    for (const box of document.querySelectorAll('[data-policy]')) {
      const type = box.dataset.policy;
      const sections = data[type];
      const sectionId = index => `policy-${type}-${index}`;
      const contactId = sectionId(sections.length);
      const topic = box.closest('.policy-modal').querySelector('h2').textContent;
      const subject = encodeURIComponent(`UNEC Students Hub — ${topic}`);
      const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${subject}`;
      const outline = type === 'about' ? '' : `<details class="policy-outline">
        <summary>${esc(data.outline)}</summary>
        <ul>${[...sections.map(([title]) => title), data.contactTitle].map((title, index) =>
          `<li><button type="button" data-policy-jump="${sectionId(index)}">${esc(title)}</button></li>`).join('')}</ul>
      </details>`;

      box.innerHTML = `
        ${type === 'about' ? '' : `<p class="policy-updated">${esc(data.updated)} · <time datetime="${updated}">${esc(data.date)}</time></p>`}
        ${outline}
        ${sections.map(([title, ...paragraphs], index) => `<section class="policy-section">
          <h3 id="${sectionId(index)}" tabindex="-1">${esc(title)}</h3>
          ${paragraphs.map(text => `<p>${esc(text)}</p>`).join('')}
        </section>`).join('')}
        <section class="policy-contact" aria-labelledby="${contactId}">
          <h3 id="${contactId}" tabindex="-1">${esc(data.contactTitle)}</h3>
          <p>${esc(data.contactText)}</p>
          <div class="policy-contact-actions">
            <a class="btn btn--primary" href="${esc(gmail)}" target="_blank" rel="noopener noreferrer">${ic('mail')}${esc(data.contactButton)}</a>
            <a class="policy-email" href="mailto:${email}">${email}</a>
          </div>
        </section>`;
    }
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-policy-jump]');
    const heading = button && document.getElementById(button.dataset.policyJump);
    if (!heading) return;
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ block: 'start' });
  });

  document.addEventListener('DOMContentLoaded', render);
  window.addEventListener('unec:langchange', render);
})();
