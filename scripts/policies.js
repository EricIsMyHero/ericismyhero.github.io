// Product policies, in both interface languages. Static application copy, no user HTML.
(function () {
  const copy = {
    az: {
      privacy: [
        ['Məlumatların istifadəsi', 'UNEC Students Hub müstəqil tələbə platformasıdır. Hesab adı, e-poçt, profil şəkli və saxladığınız təhsil tarixçəsi hesab xidmətləri üçün Firebase Authentication və Firestore-da işlənir.'],
        ['Təhsil qeydləri və offline istifadə', 'Hesaba daxil olduqda seçilmiş materiallar, saxlanmış Kompas məqalələri, GPA qeydləri və imtahan tarixləri hesabınıza bağlı şəkildə Firestore-da saxlanılır və cihazlar arasında sinxronlaşdırılır. Offline dəyişikliklər bağlantı bərpa olunana qədər hesabınıza aid yerli yaddaşda qalır. Hesabdan çıxdıqda digər hesabın qeydləri göstərilmir. Qonaq qeydləri ilk daxil olduğunuz hesaba köçürülür. Tema, dil, seçilmiş plan və tamamlanma qeydləri cihazda qala bilər. Offline keş yalnız açıq sayt fayllarını saxlayır; şəxsi API cavabları və PDF-lər avtomatik keşlənmir. Ortaq cihazda saxlanılmış məlumatları təmizləyin.'],
        ['İstəklər və yazışmalar', 'Material istəkləri, şərhlər və göndərilmiş fayl keçidləri hamıya açıqdır. Şəxsi sənədlər paylaşmayın. Fayllar Cloudflare R2-də saxlanılır. Hesab silinərkən adınız və hesab əlaqəniz açıq yazışmalardan götürülür, öz mesaj məzmununuz və əlavələriniz silinir; digər iştirakçıların yazışması saxlanılır.'],
        ['Bildirişlər', 'Push bildirişləri könüllüdür. Aktiv etdikdə cihaz tokeni, dil və hesab bağlantısı Firebase Cloud Messaging üçün saxlanılır. İstənilən vaxt bildirişləri söndürə bilərsiniz.'],
        ['Xidmət təminatçıları', 'Sayt Firebase, Vercel, Cloudflare R2, Groq, Google Fonts, Google Analytics, Google AdSense və Formspree xidmətlərindən istifadə edir. Xəta müraciətləri Formspree-yə, AI sualları və uyğun dərs konteksti Groq-a ötürülür. Ödəniş aktivləşdirilərsə, kart məlumatları ödəniş provayderində işlənir.'],
        ['Yazılı sınaqlar', 'Yazdığınız cavablar və seçilmiş PDF-dən uyğun izahlar qiymətləndirmə üçün Groq-a göndərilir. Suallar, cavablar, nəticələr və gündəlik limit hesabınıza bağlı şəxsi qeyddə saxlanılır. Cari və əvvəlki günün sınaqları növbəti yazılı sınaq yenilənməsi zamanı saxlanılır, daha köhnə qeydlər çıxarılır. Hesab ixracına bu qeydlər daxildir; hesab silindikdə onlar da silinir. Bu, məşq üçün AI qiymətləndirməsidir və rəsmi bal deyil.'],
        ['AI və analitika', 'AI cavabları səhv ola bilər. Şəxsi və həssas məlumatları sorğuya daxil etməyin. Google Analytics ziyarət və istifadə hadisələrini, reklam xidməti isə öz siyasətinə uyğun texniki məlumatları işləyə bilər.'],
        ['Məlumatlarınızı idarə edin', 'Daha çox bölməsindən hesab məlumatlarınızı JSON şəklində endirə və yenidən girişlə hesabınızı silə bilərsiniz. Silmə profil və fərdi təhsil qeydlərini, cihaz tokenlərini və giriş hesabını əhatə edir. Maliyyə əməliyyatı qeydləri hesab bağlantısı götürülərək saxlanıla bilər. Brauzerdən endirdiyiniz surətlər avtomatik silinmir.'],
        ['Əlaqə', 'Məlumatların istifadəsi və müəllif hüquqları ilə bağlı müraciətlər: unecstudentshub@gmail.com. Siyasət yeniləndikdə bu səhifədə göstərilir.']
      ],
      terms: [
        ['Platforma', 'UNEC Students Hub universitetlə rəsmi əlaqəsi olmayan tələbə platformasıdır. İxtisas planı və hesablamalar rəsmi akademik qeydi əvəz etmir.'],
        ['Hesab', 'Öz hesabınızdan istifadə edin, giriş məlumatlarınızı paylaşmayın. Başqalarının məlumatlarına icazəsiz müdaxilə və xidmət məhdudiyyətlərini keçmək qadağandır.'],
        ['Materiallar və yazışmalar', 'Yalnız paylaşmaq hüququnuz olan faylları göndərin. Şəxsi məlumat, təhqir, spam və zərərli fayllar paylaşmayın. Uyğun olmayan məzmun silinə bilər. Müəllif hüquqları müraciətlərini unecstudentshub@gmail.com ünvanına göndərin.'],
        ['Alətlər və AI', 'Testlər, GPA, kredit və təqaüd hesablamalarını rəsmi mənbələrlə yoxlayın. AI cavablarının düzgünlüyünə və xidmətin fasiləsiz işləməsinə zəmanət verilmir.'],
        ['Ödəniş və premium', 'Aktiv planın müddəti və məbləği alışdan əvvəl göstərilir. Kart məlumatları saytımızda saxlanılmır. Ödəniş və premium problemləri üçün dəstəyə müraciət edin.'],
        ['Hesabın silinməsi', 'Hesabın silinməsi geri qaytarılmır. İstəsəniz əvvəl məlumatlarınızı endirin. Digər iştirakçıların məzmunu, anonim reytinqlər və hesab bağlantısı götürülmüş əməliyyat qeydləri saxlanıla bilər.'],
        ['Əlaqə və yenilənmə', 'Suallar və şikayətlər: unecstudentshub@gmail.com. Bu şərtlər xidmət dəyişdikcə yenilənə bilər.']
      ]
    },
    en: {
      privacy: [
        ['Use of information', 'UNEC Students Hub is an independent student platform. Your account name, email, profile photo and saved study history are processed through Firebase Authentication and Firestore to provide account services.'],
        ['Study records and offline use', 'When signed in, favorite materials, saved Compass articles, GPA records and exam dates are stored under your account in Firestore and synced across devices. Offline changes remain in an account-specific device cache until connectivity returns. Signing out hides that account’s records from other accounts. Guest records move to the first account you sign into. Theme, language, the selected plan and completion records may remain device-local. The offline cache stores only public site assets; private API responses and PDFs are not automatically cached. Clear saved data on shared devices.'],
        ['Requests and discussions', 'Material requests, comments and shared attachment links are public. Do not upload personal documents. Files are stored in Cloudflare R2. Account deletion removes your name and account association from public discussions and deletes your own message content and attachments; other participants’ messages remain.'],
        ['Notifications', 'Push notifications are optional. Enabling them stores a device token, language and account association for Firebase Cloud Messaging. You can turn notifications off at any time.'],
        ['Service providers', 'The site uses Firebase, Vercel, Cloudflare R2, Groq, Google Fonts, Google Analytics, Google AdSense and Formspree. Bug reports go to Formspree; AI questions and relevant study context go to Groq. If payments are enabled, card details are handled by the payment provider.'],
        ['Written practice', 'Your written answers and relevant explanations from the selected PDF are sent to Groq for grading. Questions, answers, results and daily usage are stored in a private account record. The current and previous day are retained on the next written-practice update, removing older records. These records are included in account exports and removed when your account is deleted. AI grading is for practice and is not an official mark.'],
        ['AI and analytics', 'AI answers may be incorrect. Do not include sensitive or personal information in prompts. Google Analytics may process visits and usage events; the advertising service may process technical information under its own policy.'],
        ['Control your data', 'From More, you can download your account data as JSON or delete your account after signing in again. Deletion covers your profile, private study records, device tokens and authentication account. Financial transaction records may be retained with account associations removed. Copies you have downloaded are not automatically deleted.'],
        ['Contact', 'For data and copyright requests, contact unecstudentshub@gmail.com. Changes to this policy are published on this page.']
      ],
      terms: [
        ['Platform', 'UNEC Students Hub is an independent student platform and is not affiliated with the university. Its curriculum and calculations do not replace official academic records.'],
        ['Account', 'Use your own account and keep login details private. Unauthorized access to other users’ information and bypassing service limits are prohibited.'],
        ['Materials and discussions', 'Upload only files you have the right to share. Do not post personal information, abuse, spam or harmful files. Inappropriate content may be removed. Send copyright requests to unecstudentshub@gmail.com.'],
        ['Tools and AI', 'Check test answers, GPA, credits and scholarship calculations against official sources. AI accuracy and uninterrupted service are not guaranteed.'],
        ['Payments and premium', 'An active plan’s price and duration are shown before purchase. We do not store card details. Contact support for payment or premium issues.'],
        ['Account deletion', 'Account deletion cannot be undone. Download your data first if you want a copy. Other participants’ content, anonymous ratings and de-identified transaction records may be retained.'],
        ['Contact and updates', 'Questions and complaints: unecstudentshub@gmail.com. These terms may be updated as the service changes.']
      ]
    }
  };
  function render() {
    const data = copy[lang] || copy.az;
    for (const [id, type] of [['privacyOverlay', 'privacy'], ['termsOverlay', 'terms']]) {
      const box = document.querySelector('#' + id + ' .privacy-body');
      if (box) box.innerHTML = data[type].map(([heading, text]) => `<section class="privacy-section"><h3>${UNEC.esc(heading)}</h3><p>${UNEC.esc(text)}</p></section>`).join('') + `<p class="privacy-updated">${lang === 'en' ? 'Updated: 13 November 2026' : 'Yenilənib: 13 noyabr 2026'}</p>`;
    }
  }
  document.addEventListener('DOMContentLoaded', render); window.addEventListener('unec:langchange', render);
})();
