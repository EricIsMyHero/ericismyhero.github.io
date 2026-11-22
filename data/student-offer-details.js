// Transcribed from the supplied UniBot detail screens. The offers retain their
// original IDs and any independent verification of the underlying programmes.
(function () {
  'use strict';

  const catalogue = window.UNEC_STUDENT_OFFERS;
  const offers = new Map(catalogue.map(offer => [offer.id, offer]));
  const qrSteps = [
    ['TələbəPlus tətbiqini açın.', 'Kassada profilinizdəki QR kodu göstərin.', 'Endirim tətbiq edildikdən sonra ödəniş edin.'],
    ['Open the TələbəPlus app.', 'Show your profile QR code at checkout.', 'Pay after the discount is applied.'],
  ];
  const cardSteps = [
    ['TələbəPlus kartınızı göstərin.', 'Ödənişdən əvvəl endirimin tətbiq edilməsini xahiş edin.'],
    ['Show your TələbəPlus card.', 'Ask for the discount to be applied before paying.'],
  ];

  for (const [id, address, hours] of [
    ['mimta-yayinlari', 'Həsən bəy Zərdabi küçəsi 78V, Bakı', '10:00–20:00'],
    ['parlaq-imzalar', 'Qara Qarayev prospekti 82A, Bakı AZ1096'],
    ['qedim-qala', 'Nobel prospekti 23, Bakı', '09:00–18:00'],
    ['sebat', 'Nəsimi küçəsi 32M, Nizami rayonu, Bakı'],
    ['capar-yayinlari', 'Mirzəağa Əliyev küçəsi 245, Bakı', '10:00–20:00'],
    ['strauss-press', 'Mikayıl Müşfiq küçəsi 1C, Badamdar Estates, Bakı', '09:00–18:00'],
    ['aks-pro', 'Park Bulvar AVM', '10:00–22:00'],
    ['abv', 'Ziya Bünyadov prospekti 43, Bakı', '09:00–18:00'],
    ['ari', 'Akademik Lətif İmanov küçəsi 35, Bakı AZ1141', '10:00–19:00'],
    ['bookzone', 'Mirzəağa Əliyev küçəsi 147B, Nəsimi rayonu, Bakı', '10:00–20:00'],
    ['libra-kitab', 'Ziya Bünyadov prospekti 5A, Bakı', '08:00–21:00'],
    ['hedef-nesrleri', 'Həsən Əliyev küçəsi 80D, Gənclik, Bakı', '09:00–18:00'],
    ['mayak-yayinlari', 'Qara Qarayev prospekti 2, Bakı'],
  ]) {
    const offer = offers.get(id);
    offer.locations = [{ address, hours }];
    offer.steps = offer.method === 'qr' ? qrSteps : cardSteps;
  }

  // Each language supplies a short description, eligibility or pricing terms,
  // then the ordered redemption steps.
  function update(id, az, en, fields = {}) {
    Object.assign(offers.get(id), {
      source: 'unibot', az: az.slice(0, 2), en: en.slice(0, 2),
      steps: [az.slice(2), en.slice(2)], ...fields,
    });
  }

  update('azal', [
    'Bakı ilə Türkiyə şəhərləri arasındakı aviabiletlərə 25% tələbə endirimi.',
    'Təklif Türkiyədə yaşayış icazəsi olan azərbaycanlı tələbələr üçündür. Uçuşdan ən azı 14 gün əvvəl bron tələb olunur.',
    'Türkiyədə yaşayış icazənizi və tələbə sənədlərinizi hazırlayın.',
    'AZAL çağrı mərkəzindən seçdiyiniz reysin və tarifin uyğunluğunu soruşun.',
    'Uçuşdan ən azı 14 gün əvvəl biletinizi bron edin.',
  ], [
    '25% student discount on flights between Baku and cities in Türkiye.',
    'The offer is for Azerbaijani students with a Turkish residence permit. Book at least 14 days before departure.',
    'Prepare your Turkish residence permit and proof of student status.',
    'Ask the AZAL call centre whether your flight and fare qualify.',
    'Book at least 14 days before departure.',
  ], { percent: 25, url: 'https://www.azal.az/az/' });

  update('nar', [
    'CavanNar Mini, CavanNar 9 və CavanNar 12 gənclər tarifləri.',
    'Şəkildə CavanNar Mini ayda 3,40 AZN göstərilir. Paketə 1 GB internet, sosial şəbəkələr üçün 1 GB və 200 dəqiqə daxildir. Aktivləşdirmədən əvvəl cari qiymət və uyğunluğu yoxlayın.',
    'Nar saytında CavanNar səhifəsini tapın.',
    'Uyğun paketi seçin.',
    'Nar+ tətbiqi, tarifin USSD kodu və ya Nar mağazası vasitəsilə paketi aktivləşdirin.',
  ], [
    'CavanNar Mini, CavanNar 9 and CavanNar 12 mobile plans for young customers.',
    'The screenshot lists CavanNar Mini at AZN 3.40 per month with 1 GB of data, 1 GB for social media and 200 minutes. Confirm current pricing and eligibility before activating.',
    'Find CavanNar on the Nar website.',
    'Choose a plan that fits.',
    'Activate it in Nar+, with the plan’s USSD code or at a Nar store.',
  ], { amount: ['3,40 AZN', 'AZN 3.40'], url: 'https://www.nar.az/' });

  update('shirinpay', [
    'Tələbə vəsiqəsi ilə hər iki filialda bütün menyuya 15% endirim.',
    'Uyğun filiallar Y. V. Çəmənzəminli küçəsi 18 və Gala Shopping Village-dir.',
    'Tələbə vəsiqənizi götürün.',
    'Sifariş zamanı vəsiqəni kafedə göstərin.',
    'Menyu endiriminin yekun məbləğdə tətbiqini yoxlayın.',
  ], [
    '15% off the entire menu at both branches with a student ID.',
    'The branches listed are 18 Y. V. Çəmənzəminli Street and Gala Shopping Village.',
    'Bring your student ID.',
    'Show it at the café when ordering.',
    'Check that the menu discount appears in the total.',
  ], { percent: 15, locations: [
    { address: 'Y. V. Çəmənzəminli küçəsi 18' },
    { address: 'Gala Shopping Village' },
  ] });

  update('amoria-coffee', [
    'Tələbə vəsiqəsi ilə bütün içkilərə 15% endirim.',
    'Təklif içkilərə aiddir. Sifarişdən əvvəl məntəqədə cari şərtləri soruşun.',
    'Tələbə vəsiqənizi kassada göstərin.',
    'İçkilər üzrə 15% endirimin tətbiq edildiyini yoxlayıb ödəniş edin.',
  ], [
    '15% off all drinks with a student ID.',
    'The offer covers drinks. Ask the café for the current terms before ordering.',
    'Show your student ID at checkout.',
    'Pay once the 15% drinks discount has been applied.',
  ], { percent: 15 });

  update('rotante', [
    'Rotante-də tələbə vəsiqəsi ilə 15% endirim.',
    'Endirimin seçdiyiniz sifarişə tətbiqini məntəqədən dəqiqləşdirin.',
    'Tələbə vəsiqənizi sifarişdən əvvəl göstərin.',
    '15% endirim tətbiq edildikdən sonra ödəniş edin.',
  ], [
    '15% off at Rotante with a student ID.',
    'Check with the venue whether the discount applies to your order.',
    'Show your student ID before ordering.',
    'Pay once the 15% discount has been applied.',
  ], { percent: 15 });

  update('xalca-muzeyi', [
    'Azərbaycan Milli Xalça Muzeyinə tələbələr üçün giriş 3 AZN.',
    'Şəkildə adi giriş bileti 7 AZN, tələbələr üçün bələdçi xidməti isə 5 AZN göstərilir.',
    'Tələbə vəsiqənizi muzeyin kassasında göstərin.',
    'Tələbə bileti alın. Bələdçi xidmətini istəyirsinizsə, qiyməti kassadan soruşun.',
  ], [
    'AZN 3 student admission to the Azerbaijan National Carpet Museum.',
    'The screenshot lists standard admission at AZN 7 and the student guide service at AZN 5.',
    'Show your student ID at the museum ticket office.',
    'Buy a student ticket. Ask the ticket office for the guide price if you want a guide.',
  ], { amount: '3 AZN' });

  update('heyder-eliyev-merkezi', [
    'Daimi muzey və sərgilərə uyğun tələbələr üçün 2 AZN-lik bilet.',
    'Təklif Azərbaycan vətəndaşı olan tələbələrə aiddir. Klassik avtomobillər sərgisi istisnadır.',
    'Tələbə vəsiqənizi hazırlayın.',
    'Vəsiqəni kassada göstərin və ya onlayn alış zamanı tələbə təsdiqi qaydasını izləyin.',
    'Uyğun sərgi üçün güzəştli bileti alın.',
  ], [
    'AZN 2 admission to the permanent museum and exhibitions for eligible students.',
    'The offer is for students who are Azerbaijani citizens. It excludes the classic car exhibition.',
    'Have your student ID ready.',
    'Show it at the ticket office or follow the student verification process when buying online.',
    'Buy a discounted ticket for an eligible exhibition.',
  ], { amount: '2 AZN' });

  update('iceriseher', [
    'Yerli tələbələr üçün Qız Qalasına 1 AZN, Şirvanşahlar Sarayı Kompleksinə 3 AZN.',
    'Bu tariflər Azərbaycan vətəndaşı olan tələbələr üçün göstərilib.',
    'Tələbə vəsiqənizi ziyarət etdiyiniz abidənin kassasında göstərin.',
    'Həmin abidə üçün tələbə bileti alın.',
  ], [
    'AZN 1 for the Maiden Tower and AZN 3 for the Palace of the Shirvanshahs for local students.',
    'The prices are listed for students who are Azerbaijani citizens.',
    'Show your student ID at the ticket office for the site you are visiting.',
    'Buy a student ticket for that site.',
  ], { amount: '1–3 AZN' });

  update('datacamp', [
    'DataCamp Premium üçün şəkildə 50% tələbə endirimi göstərilir.',
    'GitHub Student Developer Pack-də ayrıca birdəfəlik 3 aylıq giriş göstərilib. Hər iki təklifin cari qiymətini, müddətini və uyğunluğunu ayrıca yoxlayın.',
    'DataCamp-in tələbə qiymətləri səhifəsini açın.',
    'Tələbə statusunuzu təsdiqləyin və yekun Premium qiymətinə baxın.',
    'GitHub paketi üçün uyğunluğunuz varsa, həmin təklifi GitHub hesabınızdan ayrıca aktivləşdirin.',
  ], [
    'The screenshot lists a 50% student discount on DataCamp Premium.',
    'It also lists a separate one-time three-month offer via GitHub Student Developer Pack. Check current pricing, duration and eligibility for each offer.',
    'Open DataCamp’s student pricing page.',
    'Verify your student status and review the final Premium price.',
    'If eligible, redeem the separate GitHub offer through your GitHub account.',
  ], { method: 'online', percent: 50, url: 'https://www.datacamp.com/pricing/student' });

  update('codecademy', [
    'Şəkildə təsdiqlənmiş tələbələr üçün illik Pro planına 35% və daha çox endirim göstərilir.',
    'İllik yekun qiyməti, ölkə üzrə əlçatanlığı və növbəti ödənişin məbləğini yoxlayın.',
    'Codecademy Student Center səhifəsini açın.',
    'SheerID vasitəsilə tələbə statusunuzu təsdiqləyin.',
    'Verilən birdəfəlik kodu Pro planı üçün ödənişdə tətbiq edin.',
  ], [
    'The screenshot lists 35% or more off the annual Pro plan for verified students.',
    'Check the annual total, country availability and renewal price.',
    'Open Codecademy’s Student Center.',
    'Verify your student status through SheerID.',
    'Apply the one-time code at Pro checkout.',
  ], { method: 'online', amount: '35%+' });

  update('wolfram-alpha', [
    'Wolfram|Alpha Pro üçün ayrıca tələbə tarifi.',
    'Şəkildə addım-addım həllər, məsələ generatoru və fayl yükləmə göstərilir. Paket və cari qiyməti ödənişdən əvvəl dəqiqləşdirin.',
    'Wolfram|Alpha Pro tarifləri səhifəsini açın.',
    'Student planını seçin.',
    'Qeydiyyatda təhsil müəssisənizi göstərin və qiyməti yoxlayın.',
  ], [
    'A dedicated student rate for Wolfram|Alpha Pro.',
    'The screenshot lists step-by-step solutions, a problem generator and file uploads. Confirm included features and current pricing before paying.',
    'Open the Wolfram|Alpha Pro pricing page.',
    'Select the Student plan.',
    'Enter your institution during sign-up and check the price.',
  ], { method: 'online' });

  update('youtube', [
    'YouTube və YouTube Music üçün reklamsız tələbə abunəliyi.',
    'Şəkildə Azərbaycan uyğun ölkələr sırasında göstərilir. Universitet üzrə uyğunluğu və abunə qiymətini rəsmi səhifədə yoxlayın. Tələbə statusu hər il yenidən təsdiqlənir.',
    'YouTube Premium-un tələbə səhifəsini açın.',
    'Tələbə planını seçin və Google hesabınıza daxil olun.',
    'SheerID ilə tələbə statusunuzu təsdiqləyin.',
  ], [
    'An ad-free student membership for YouTube and YouTube Music.',
    'The screenshot lists Azerbaijan as eligible. Verify your institution and the subscription price on the official page. Student status is rechecked annually.',
    'Open the YouTube Premium student page.',
    'Select the Student plan and sign in to Google.',
    'Verify your student status through SheerID.',
  ]);

  update('apple-education', [
    'Apple Music kataloqu üçün endirimli tələbə abunəliyi.',
    'Şəkildə UNiDAYS təsdiqi göstərilir. Ölkə üzrə qiyməti və hesabınızda hansı təsdiq üsulunun təqdim edildiyini Apple Music-də yoxlayın. Tələbə statusunu vaxtaşırı yeniləyin.',
    'Apple Music tətbiqində abunə seçimlərini açın.',
    'Tələbə planını seçin və göstərilən təsdiq prosesini tamamlayın.',
    'Abunəni təsdiqləməzdən əvvəl cari qiyməti yoxlayın.',
  ], [
    'A discounted student subscription to the Apple Music catalogue.',
    'The screenshot shows UNiDAYS verification. Check the price and the verification flow offered for your account in Apple Music. Renew your student verification when prompted.',
    'Open subscription options in Apple Music.',
    'Select the Student plan and complete the verification shown.',
    'Confirm the current price before subscribing.',
  ], { name: 'Apple Music Student', initials: 'AM', category: 'entertainment', url: 'https://support.apple.com/en-us/106008' });

  update('spotify', [
    'Azərbaycanda akkreditə olunmuş ali məktəb tələbələri üçün Spotify Premium Student.',
    'Şəkildə ilk ay pulsuz, sonra ayda 2,99 ABŞ dolları göstərilir. Qiyməti və sınaq müddətinə uyğunluğu ödənişdən əvvəl yoxlayın. Tələbə təsdiqi 12 aydan sonra yenilənə bilər.',
    'Spotify-ın tələbə səhifəsində Premium tələbə planını seçin.',
    'SheerID vasitəsilə ali məktəbinizi və tələbə statusunuzu təsdiqləyin.',
    'Yekun aylıq qiyməti yoxlayıb planı aktivləşdirin.',
  ], [
    'Spotify Premium Student for students at accredited higher education institutions in Azerbaijan.',
    'The screenshot lists a free first month followed by US$2.99 per month. Check current pricing and trial eligibility. Student verification can be renewed after 12 months.',
    'Select Premium Student on Spotify’s student page.',
    'Verify your institution and student status through SheerID.',
    'Review the final monthly price and activate the plan.',
  ]);

  update('sketch', [
    'Mac üçün bir redaktor yeri və 50 GB yaddaşı olan pulsuz Sketch Workspace.',
    'Şəkildə bir illik giriş və təhsil müddətində yenilənmə göstərilir. Tətbiqin Mac tələblərini yoxlayın.',
    'Sketch Education səhifəsində formanı doldurun.',
    'Tələbə statusunuzu təsdiqləyən sənədi əlavə edin.',
    'Təsdiqdən sonra Workspace-i aktivləşdirin.',
  ], [
    'A free Sketch Workspace for Mac with one editor seat and 50 GB of storage.',
    'The screenshot lists one year of access, renewable while studying. Check the Mac system requirements.',
    'Complete the form on Sketch’s education page.',
    'Attach proof of student status.',
    'Activate the Workspace after approval.',
  ], { amount: ['Pulsuz', 'Free'] });

  update('framer', [
    'Akkreditə olunmuş ali məktəb tələbələri üçün sayt, CMS, hostinq və AI alətləri olan Framer Basic.',
    'Şəkildə planın təhsil müddətində pulsuz olduğu, yoxlamanın 5 iş gününə qədər çəkə biləcəyi və təsdiqin təxminən 11 aydan bir yeniləndiyi göstərilir.',
    'Framer-in tələbə səhifəsini açın.',
    'Universitet e-poçtunuz və tələbə sənədinizlə müraciət edin.',
    'Təsdiqdən sonra Basic planının cari limitlərini yoxlayın.',
  ], [
    'Framer Basic with a site, CMS, hosting and AI tools for students at accredited institutions.',
    'The screenshot lists free access while studying, review within five business days and reverification around every 11 months.',
    'Open Framer’s student page.',
    'Apply with your university email address and proof of student status.',
    'Check the current Basic limits after approval.',
  ], { amount: ['Pulsuz', 'Free'], url: 'https://www.framer.com/education/students/' });

  update('mural', [
    'Qrup işi üçün pulsuz Mural təhsil planı.',
    'Şəkildə 10 üzv, 25 qonaq və limitsiz ziyarətçi limiti göstərilir. Müraciətdə hesabın cari şərtlərini yoxlayın.',
    'Mural hesabı yaradın və Education planına müraciət edin.',
    'Universitet e-poçtu və ya sənədlə təhsil müəssisəsinə aidiyyətinizi təsdiqləyin.',
    'Təsdiqlənmiş Workspace-i açın.',
  ], [
    'A free Mural education plan for group work.',
    'The screenshot lists 10 members, 25 guests and unlimited visitors. Check the current account terms when applying.',
    'Create a Mural account and apply for Education.',
    'Verify your institutional affiliation by email or document.',
    'Open the approved Workspace.',
  ], { amount: ['Pulsuz', 'Free'] });

  update('mongodb', [
    'GitHub Student Developer Pack üzvləri üçün şəkildə 50 ABŞ dolları Atlas krediti və sertifikasiya vauçeri göstərilir.',
    'Aktiv GitHub Student Developer Pack tələb olunur. Şəkildə peşəkar sertifikasiya vauçerinin 150 ABŞ dolları dəyərində olduğu qeyd edilib. Kreditin müddətini və ödənişli resursların qiymətini yoxlayın.',
    'GitHub Student Developer Pack üçün tələbə təsdiqini tamamlayın.',
    'MongoDB tələbə səhifəsində GitHub hesabınızı bağlayın.',
    'Atlas krediti və sertifikasiya vauçeri üçün aktivləşdirmə qaydasını izləyin.',
  ], [
    'The screenshot lists US$50 in Atlas credit and a certification voucher for GitHub Student Developer Pack members.',
    'An active GitHub Student Developer Pack is required. The screenshot values the professional certification voucher at US$150. Check credit expiry and the cost of paid resources.',
    'Complete student verification for the GitHub Student Developer Pack.',
    'Connect your GitHub account on MongoDB’s student page.',
    'Follow the redemption steps for the Atlas credit and certification voucher.',
  ], { amount: '$50' });

  update('overleaf', [
    'LaTeX üçün Overleaf Student tarifi. Şəkildə illik ödənişdə aylıq ekvivalent 8,20 ABŞ dollarından başlayır.',
    'Şəkildə hər layihə üçün 10 həmmüəllif və AI köməkçisi göstərilir. İllik yekun qiyməti və universitet lisenziyasını müqayisə edin.',
    'Overleaf hesabı yaradın.',
    'Tariflər səhifəsində Student planını seçin.',
    'Yekun məbləği və yenilənmə şərtlərini yoxlayıb ödəniş edin.',
  ], [
    'An Overleaf Student plan for LaTeX. The screenshot lists a monthly equivalent starting at US$8.20 when billed annually.',
    'The screenshot lists 10 collaborators per project and an AI assistant. Compare the annual total with any institutional access.',
    'Create an Overleaf account.',
    'Select Student on the pricing page.',
    'Check the total and renewal terms before paying.',
  ]);

  update('lucidchart', [
    'Diaqram və sxemlər üçün pulsuz Lucidchart Educational hesabı.',
    'Şəkildə birgə redaktə, limitsiz fiqurlar və yenilənə bilən ikiillik giriş göstərilir. EDU yüksəltməsi bir həftəyə qədər çəkə bilər.',
    'Universitet e-poçtu ilə Lucid hesabı yaradın.',
    'Rol kimi Student seçin.',
    'EDU yüksəltmə formasını doldurun və təsdiqi gözləyin.',
  ], [
    'A free Lucidchart Educational account for diagrams and flowcharts.',
    'The screenshot lists co-editing, unlimited shapes and two years of renewable access. An EDU upgrade can take up to a week.',
    'Create a Lucid account with your university email.',
    'Select Student as your role.',
    'Complete the EDU upgrade form and wait for approval.',
  ], { amount: ['Pulsuz', 'Free'] });

  update('ableton', [
    'Ableton Live Standard və Suite EDU lisenziyalarına 40% endirim.',
    'Şəkildə təklif 18 yaşdan yuxarı və ya 18 yaşında olan əyani tələbələr üçün göstərilir. Təsdiqin təxminən bir iş günü çəkdiyi qeyd olunur.',
    'Ableton mağazasında uyğun EDU versiyasını seçin.',
    'Hesabınızda tələbə vəsiqəsi və ya arayış yükləyin.',
    'Təsdiqdən sonra EDU lisenziyasını aktivləşdirin.',
  ], [
    '40% off Ableton Live Standard and Suite EDU licences.',
    'The screenshot lists eligibility for full-time students aged 18 or older. Verification is described as taking around one business day.',
    'Choose an eligible EDU version in the Ableton shop.',
    'Upload your student ID or enrolment letter in your account.',
    'Activate the EDU licence after approval.',
  ], { percent: 40 });

  const basecamp = {
    id: 'basecamp', name: 'Basecamp', initials: 'BC', category: 'software',
    kind: 'online', method: 'online', url: 'https://basecamp.com/discounts',
  };
  catalogue.push(basecamp);
  offers.set(basecamp.id, basecamp);
  update('basecamp', [
    'Təhsil layihələri üçün pulsuz Basecamp hesabı.',
    'Şəkildə tələbələr üçün təhsil məqsədli istifadə göstərilir. Müraciətdə universitetinizi, ixtisasınızı və gözlənilən məzuniyyət ilinizi qeyd edin.',
    'Basecamp hesabı yaradın.',
    'Universitet e-poçtunuzdan Basecamp dəstəyinə təhsil təklifi üçün müraciət edin.',
    'Təsdiq cavabında hesabın aktivləşdirilməsi qaydasını izləyin.',
  ], [
    'A free Basecamp account for education projects.',
    'The screenshot lists student access for educational use. Include your institution, field of study and expected graduation year when applying.',
    'Create a Basecamp account.',
    'Apply for the education offer by contacting Basecamp support from your university email.',
    'Follow the activation instructions in the approval reply.',
  ], { amount: ['Pulsuz', 'Free'] });

  update('prezi', [
    'Universitet e-poçtu ilə pulsuz EDU seçimi və endirimli EDU Plus və EDU Pro planları.',
    'Müraciətdə hər planın paylaşım, məxfilik, ixrac və ödəniş şərtlərini müqayisə edin.',
    'Prezi-də universitet e-poçtunuzla qeydiyyatdan keçin.',
    'Uyğun EDU planını seçin və e-poçtunuzu təsdiqləyin.',
    'Universitet e-poçtunuz yoxdursa, tələbə sənədinin qəbulunu dəstəkdən soruşun.',
  ], [
    'A free EDU option and discounted EDU Plus and EDU Pro plans with a university email.',
    'Compare sharing, privacy, export and billing terms for each plan when applying.',
    'Sign up for Prezi using your university email.',
    'Choose an EDU plan and confirm the email address.',
    'If you have no university email, ask support whether it accepts student documents.',
  ]);

  update('github', [
    'Təsdiqlənmiş tələbələr üçün GitHub Pro, Copilot Student və Student Developer Pack.',
    'Şəxsi GitHub hesabı, ən azı 13 yaş və diplom verən proqramda cari qeydiyyat tələb olunur. Azure, JetBrains və Namecheap kimi tərəfdaş təkliflərinin şərtlərini ayrıca yoxlayın.',
    'Şəxsi GitHub hesabınıza daxil olun.',
    'Student Developer Pack üçün tələbə müraciətini açın.',
    'Təhsil e-poçtu və ya tarixli tələbə sənədi ilə statusunuzu təsdiqləyin.',
    'Təsdiqdən sonra uyğun tərəfdaş təkliflərini ayrıca aktivləşdirin.',
  ], [
    'GitHub Pro, Copilot Student and the Student Developer Pack for verified students.',
    'You need a personal GitHub account, must be at least 13 and must be enrolled in a diploma-granting programme. Check partner offers such as Azure, JetBrains and Namecheap separately.',
    'Sign in to your personal GitHub account.',
    'Open the student application for the Student Developer Pack.',
    'Verify your status with an academic email or dated proof of enrolment.',
    'Redeem eligible partner offers individually after approval.',
  ], { method: 'online' });

  update('jetbrains', [
    'Tələbələr üçün IntelliJ IDEA, PyCharm, GoLand və digər JetBrains IDE-lərinə pulsuz təhsil lisenziyası. JetBrains siyahısına unec.edu.az daxildir.',
    'Lisenziya təhsil məqsədli istifadə üçündür. Qəbul edilən sənədlərə və hər il yenilənmə qaydasına JetBrains-də baxın.',
    'JetBrains-in tələbə müraciət formasını açın.',
    'Universitet e-poçtu, uyğun ISIC/ITIC kartı və ya GitHub Student Developer Pack ilə müraciət edin.',
    'Təsdiqlənən lisenziyanı JetBrains hesabınıza bağlayın.',
  ], [
    'Free education licensing for IntelliJ IDEA, PyCharm, GoLand and other JetBrains IDEs. JetBrains lists unec.edu.az as an academic domain.',
    'The licence is for education use. Check accepted documents and annual renewal with JetBrains.',
    'Open the JetBrains student application.',
    'Apply with an institutional email, an eligible ISIC/ITIC card or the GitHub Student Developer Pack.',
    'Connect the approved licence to your JetBrains account.',
  ], { method: 'online', amount: ['Pulsuz', 'Free'] });

  update('figma', [
    'Tələbələr üçün Figma və FigJam təhsil planı. Şəkildə komanda işi, paylaşılan layihələr və Dev Mode göstərilir.',
    'Education planı üçün tələbə statusu təsdiqi tələb olunur. Komandanızı dəyişməzdən əvvəl mövcud layihələrə tətbiq edilən şərtləri yoxlayın.',
    'Təhsil e-poçtunuzla Figma hesabı yaradın və ya hesabınıza daxil olun.',
    'Figma Education səhifəsində müraciət edin.',
    'Təsdiqlənən Education planını uyğun komandaya tətbiq edin.',
  ], [
    'A Figma and FigJam education plan for students. The screenshot lists teamwork, shared projects and Dev Mode.',
    'The Education plan requires student verification. Check what happens to existing projects before changing your team’s plan.',
    'Create or sign in to a Figma account with your academic email.',
    'Apply on the Figma Education page.',
    'Apply the approved Education plan to an eligible team.',
  ], { method: 'online', amount: ['Pulsuz', 'Free'] });

  update('microsoft-365', [
    'Uyğun universitet hesabları üçün Office 365 Education A1. Word, Excel, PowerPoint, Teams və OneDrive təhsil hesabı vasitəsilə əlçatan ola bilər.',
    'Universitetin proqramda iştirakı və qurumun lisenziyası əlçatanlığı müəyyən edir. A1 əsasən veb tətbiqləri əhatə edir, masaüstü proqramları ayrıca lisenziyadan asılıdır.',
    'Microsoft Education səhifəsində qeydiyyata başlayın.',
    'Universitetin verdiyi e-poçt ünvanını daxil edin.',
    'Hesabınız üçün açılan tətbiqləri yoxlayın.',
  ], [
    'Office 365 Education A1 for eligible university accounts. Word, Excel, PowerPoint, Teams and OneDrive may be available through an education account.',
    'Availability depends on institutional participation and licensing. A1 primarily covers web apps. Desktop apps depend on separate licensing.',
    'Start sign-up on the Microsoft Education page.',
    'Enter your university-issued email address.',
    'Check the applications available to your account.',
  ], { method: 'online' });

  update('azure', [
    'Uyğun tələbələr üçün 12 ay ərzində 100 ABŞ dolları Azure krediti. Bank kartı tələb olunmur.',
    'Microsoft tələbə statusunu universitet e-poçtu ilə yoxlayır. Xidmətlərin pulsuz limitləri və ödənişləri fərqlənir. Hər il uyğunluq davam edərsə, yenilənmə şərtlərini yoxlayın.',
    'Azure for Students səhifəsini açın və Microsoft hesabınıza daxil olun.',
    'Universitet e-poçtu ilə tələbə statusunuzu təsdiqləyin.',
    'Təsdiqdən sonra kredit balansını və resurs limitlərini yoxlayın.',
  ], [
    'US$100 in Azure credit for 12 months for eligible students, with no credit card needed.',
    'Microsoft verifies student status with an institutional email. Free limits and charges vary by service. Check annual renewal terms if you remain eligible.',
    'Open Azure for Students and sign in to Microsoft.',
    'Verify student status with your institutional email.',
    'Check the credit balance and resource limits after approval.',
  ], { method: 'online', amount: '$100' });

  update('notion', [
    'Konspekt, planlama və layihələr üçün pulsuz Notion Education planı.',
    'Şəkildə Plus funksiyaları və limitsiz səhifə və bloklar göstərilir. İş sahəsinin uyğunluğunu və əlavə üzvlərə aid şərtləri qiymət səhifəsində yoxlayın.',
    'Universitet e-poçtunuzla Notion hesabı yaradın.',
    'İş sahəsinin plan ayarlarında Education seçimini açın.',
    'Təhsil domeninizin uyğunluğunu təsdiqləyib planı aktivləşdirin.',
  ], [
    'A free Notion Education plan for notes, planning and projects.',
    'The screenshot lists Plus features and unlimited pages and blocks. Check workspace eligibility and terms for additional members on the pricing page.',
    'Create a Notion account with your university email.',
    'Open Education in the workspace’s plan settings.',
    'Confirm that your academic domain qualifies and activate the plan.',
  ], { method: 'online', amount: ['Pulsuz', 'Free'] });

  update('autodesk', [
    'AutoCAD, Fusion, Revit, 3ds Max və digər Autodesk proqramlarına birillik pulsuz təhsil girişi.',
    'Uyğun tələbələr giriş müddətini uzada bilirlər. Seçilən məhsulun təhsil lisenziyasının şərtlərini yoxlayın.',
    'Autodesk Education saytında hesab yaradın.',
    'Tələbə statusunuzu universitet e-poçtu və ya tələb olunan sənədlə təsdiqləyin.',
    'Uyğun proqramı seçib yükləyin.',
  ], [
    'One year of free education access to AutoCAD, Fusion, Revit, 3ds Max and other Autodesk software.',
    'Eligible students can renew access. Check the education licence terms for the selected product.',
    'Create an account on Autodesk Education.',
    'Verify student status with your university email or the required proof.',
    'Choose and download an eligible application.',
  ], { amount: ['Pulsuz', 'Free'] });

  update('unity', [
    'Uyğun tələbələr üçün birillik pulsuz Unity Student planı.',
    'Şəkildə 16 yaşdan etibarən uyğunluq və tələbə statusu davam etdikcə yenilənmə göstərilir. Layihənin kommersiya istifadəsi və yayımı üçün lisenziya şərtlərini yoxlayın.',
    'Unity Student səhifəsini açın və Unity ID hesabınıza daxil olun.',
    'SheerID vasitəsilə tələbə statusunuzu təsdiqləyin.',
    'Təsdiq e-poçtundakı təlimatla planı aktivləşdirin.',
  ], [
    'A free one-year Unity Student plan for eligible students.',
    'The screenshot lists eligibility from age 16 and renewal while studying. Check the licence terms for commercial use and distribution.',
    'Open Unity Student and sign in with your Unity ID.',
    'Verify your student status through SheerID.',
    'Activate the plan with the instructions in the confirmation email.',
  ], { method: 'online', amount: ['Pulsuz', 'Free'] });

  update('miro', [
    'Qrup layihələri üçün iki il pulsuz Miro Education planı.',
    'Şəkildə limitsiz lövhələr, yüksək keyfiyyətli ixrac və 10-a qədər iştirakçı göstərilir. Müddətin sonunda yenidən müraciət edilə bilər.',
    'Miro hesabı yaradın və Education planına müraciət edin.',
    'Tələbə vəsiqənizi və ya arayışınızı yükləyin.',
    'Müraciətin nəticəsini izləyin. Şəkildə yoxlama üçün 3–7 iş günü göstərilib.',
  ], [
    'A free two-year Miro Education plan for group projects.',
    'The screenshot lists unlimited boards, high-quality exports and up to 10 participants. You can reapply at the end of the term.',
    'Create a Miro account and apply for Education.',
    'Upload your student ID or enrolment letter.',
    'Follow the application status. The screenshot lists three to seven business days for review.',
  ], { amount: ['Pulsuz', 'Free'] });
})();
