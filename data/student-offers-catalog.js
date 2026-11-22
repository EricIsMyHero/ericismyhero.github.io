(function () {
  'use strict';

  const offers = window.UNEC_STUDENT_OFFERS;
  const notes = {
    books: [
      ['Kitab və nəşrlər üzrə tələbə təklifi.', 'Endirimin hansı nəşrlərə aid olduğunu, kampaniyalı kitabların uyğunluğunu və onlayn sifariş şərtlərini yoxlayın.'],
      ['Student offer on books and publications.', 'Check eligible titles, whether sale books qualify and the terms for online orders.'],
    ],
    education: [
      ['Kurs və tədris xidməti üzrə tələbə təklifi.', 'Kursun adını, qrupu və başlama tarixini bildirərək endirimin hansı ödənişə tətbiq olunduğunu yoxlayın.'],
      ['Student offer on a course or education service.', 'Specify the course, group and start date. Confirm which payment qualifies.'],
    ],
    software: [
      ['Proqram təminatı üzrə tələbə təklifi.', 'Uyğun planı, qeydiyyat qaydasını və endirimdən sonra yenilənmə qiymətini yoxlayın.'],
      ['Student offer on software.', 'Check the eligible plan, sign-up process and renewal price after the discount.'],
    ],
    electronics: [
      ['Elektronika üzrə tələbə təklifi.', 'Alışdan əvvəl uyğun məhsulları, filialı və zəmanət şərtlərini dəqiqləşdirin.'],
      ['Student offer on electronics.', 'Confirm eligible products, the branch and warranty terms before buying.'],
    ],
    sports: [
      ['İdman kompleksi və ya məşğələ üzrə tələbə təklifi.', 'Getməzdən əvvəl uyğun xidmətin adını, cədvəli və abonementin endirimə daxil olub-olmadığını öyrənin.'],
      ['Student offer on a sports facility or activity.', 'Confirm activities, the schedule and eligible memberships before visiting.'],
    ],
    culture: [
      ['Mədəniyyət və bilet üzrə tələbə təklifi.', 'Kassada seçdiyiniz sərgi, tamaşa və seans üçün tələbə biletini və qəbul edilən sənədi yoxlayın.'],
      ['Student admission or tickets.', 'Ask the box office about student pricing and accepted documents for your exhibition, performance or session.'],
    ],
    food: [
      ['Yemək və içki üzrə tələbə təklifi.', 'Filialı və uyğun menyu məhsullarını ödənişdən əvvəl təsdiqləyin. Çatdırılma və kampaniyalı məhsullar üçün ayrıca şərtlər ola bilər.'],
      ['Student offer on food and drinks.', 'Confirm the branch and eligible menu items before paying. Delivery and promotional items may have separate terms.'],
    ],
    fashion: [
      ['Geyim və aksesuar üzrə tələbə təklifi.', 'Uyğun kolleksiyanı, filialı və alış üsulunu yoxlayın. Qaytarma və mövcud kampaniya şərtlərini kassadan öyrənin.'],
      ['Student offer on fashion and accessories.', 'Confirm eligible collections, branches and purchase methods. Ask the retailer about returns and other promotions.'],
    ],
    health: [
      ['Sağlamlıq və ya optika xidməti üzrə tələbə təklifi.', 'Qəbula yazılmazdan və ya sifariş verməzdən əvvəl uyğun xidmətləri və ilkin qiyməti mərkəzdən soruşun.'],
      ['Student offer on health or optical services.', 'Check eligible services and the original price before booking or ordering.'],
    ],
    beauty: [
      ['Gözəllik və qulluq üzrə tələbə təklifi.', 'Endirimin hansı brendə və məhsula aid olduğunu ödənişdən əvvəl yoxlayın.'],
      ['Student offer on beauty and personal care.', 'Confirm the eligible brands and products before paying.'],
    ],
    leisure: [
      ['Əyləncə fəaliyyəti üzrə tələbə təklifi.', 'Bilet və ya seans seçərkən uyğun tarixləri, rezervasiya qaydasını və tələbə təsdiqini yoxlayın.'],
      ['Student offer on a leisure activity.', 'Check eligible dates, booking requirements and student verification when choosing your ticket or session.'],
    ],
    internet: [
      ['Mobil rabitə və ya internet üzrə tələbə təklifi.', 'Uyğun nömrəni və tarifi, aktivləşdirmə qaydasını, paketin həcmini və müddətini operatorla təsdiqləyin.'],
      ['Student offer on mobile or internet service.', 'Confirm eligible numbers and plans, activation rules, package allowance and validity with the operator.'],
    ],
    travel: [
      ['Səyahət üzrə tələbə təklifi.', 'İstiqaməti, uçuş tarixlərini, uyğun sərnişinləri və yekun bilet qiymətini təşkilatçının rəsmi kanalında yoxlayın.'],
      ['Student travel offer.', 'Check eligible routes, dates, passengers and the final ticket price with the provider.'],
    ],
    other: [
      ['Tələbələr üçün xüsusi təklif.', 'Məhsul və ya xidmətin adını, filialı, qüvvədə olma müddətini və endirimin istifadə qaydasını təşkilatçıdan təsdiqləyin.'],
      ['Special offer for students.', 'Confirm the product or service, location, validity period and redemption steps with the provider.'],
    ],
  };

  // Add redemption methods to the original listings without changing their IDs.
  for (const [id, method] of [
    ['az-tercume', 'card'], ['baku-design-academy', 'qr'], ['citynet', 'card'],
    ['focus-optika', 'qr'], ['parlaq-imzalar', 'card'], ['ari', 'card'],
  ]) {
    const existing = offers.find(offer => offer.id === id);
    if (existing) existing.method = method;
  }

  // ID, name, initials, category, displayed benefit, redemption method
  const rows = [
    ['kolorit', 'Kolorit', 'KO', 'food', 7, 'qr'],
    ['bookzone', 'BOOKZONE GROUP MMC', 'BZ', 'books', 20, 'qr'],
    ['hedef-nesrleri', 'Hədəf Nəşrləri MMC', 'HN', 'books', 20, 'qr'],
    ['libra-kitab', 'LIBRA KİTAB MMC', 'LK', 'books', 25, 'qr'],
    ['mayak-yayinlari', 'Mayak Yayınları MMC', 'MY', 'books', 25, 'qr'],
    ['mimta-yayinlari', 'MİMTA Yayınları MMC', 'MY', 'books', 20, 'qr'],
    ['qedim-qala', 'Qədim Qala MMC', 'QQ', 'books', 25, 'qr'],
    ['strauss-press', 'Strauss press MMC', 'SP', 'books', 25, 'qr'],
    ['sebat', 'SƏBAT MMC', 'SƏ', 'books', 25, 'qr'],
    ['capar-yayinlari', 'Çapar yayınları MMC', 'ÇY', 'books', 20, 'qr'],
    ['abv', 'ABV – Təhlükəsizlik sistemləri və şəbəkə avadanlıqları', 'ABV', 'electronics', 10, 'qr'],
    ['aks-pro', 'AKS Pro', 'AKS', 'electronics', 20, 'card'],
    ['atl-academy', 'ATL Academy', 'ATL', 'education', 15, 'card'],
    ['azgreen', 'AZGREEN Mühəndislik və Ətraf Mühit Xidmətləri', 'AZG', 'other', 20, 'card'],
    ['abseron-olimpiya', 'Abşeron Olimpiya İdman Kompleksi', 'Aİ', 'sports', 20, 'qr'],
    ['berlin-klinika', 'Berlin Ailə və Uşaq Klinikası', 'BK', 'health', 30, 'qr'],
    ['beykoz-doner', 'Beykoz Döner', 'BD', 'food', 10, 'qr'],
    ['beyleqan-olimpiya', 'Beyləqan Olimpiya İdman Kompleksi', 'Bİ', 'sports', 20, 'qr'],
    ['bilesuvar-olimpiya', 'Biləsuvar Olimpiya İdman Kompleksi', 'Bİ', 'sports', 20, 'qr'],
    ['blue-optika', 'Blue Optika', 'BO', 'health', 10, 'qr'],
    ['bona-cake', 'Bona Cake & Coffee & Bakery', 'BC', 'food', 5, 'qr'],
    ['brend-house', 'Brend House', 'BH', 'fashion', 5, 'qr'],
    ['bubbles-bubble-tea', 'Bubbles Bubble Tea', 'BT', 'food', 10, 'qr'],
    ['buddha-sushi', 'Buddha Sushi', 'BS', 'food', 10, 'qr'],
    ['boyukfirat', 'Böyükfırat', 'BF', 'food', 10, 'qr'],
    ['berde-olimpiya', 'Bərdə Olimpiya İdman Kompleksi', 'Bİ', 'sports', 20, 'qr'],
    ['celt', 'CELT Tədris və İnkişaf Mərkəzi', 'CELT', 'education', '10–20%', 'card'],
    ['calvin-klein', 'Calvin Klein', 'CK', 'fashion', 5, 'qr'],
    ['cinnabon', 'Cinnabon', 'C', 'food', 15, 'qr'],
    ['coccinelle', 'Coccinelle', 'C', 'fashion', 5, 'qr'],
    ['code-academy', 'Code Academy', 'CA', 'education', 10, 'qr'],
    ['codelandia', 'Codelandia', 'CL', 'education', 20, 'qr'],
    ['coffeego', 'CoffeeGo', 'CG', 'food', 15, 'qr'],
    ['data-socool', 'Data SoCool', 'DS', 'education', 25, 'card'],
    ['digital-driving-academy', 'Digital Driving Academy', 'DDA', 'education', 10, 'qr'],
    ['dogtas', 'Doğtaş', 'D', 'other', 5, 'qr'],
    ['dunyagoz', 'Dünyagöz Xəstəxanası', 'DX', 'health', null, 'qr'],
    ['dusbere-evi', 'Düşbərə Evi', 'DE', 'food', 5, 'qr'],
    ['edu-company', 'Edu Company', 'EC', 'education', null],
    ['edu-max-academy', 'Edu Max Academy', 'EM', 'education', null],
    ['elegant-s-parfem', 'Elegant S Parfem', 'ES', 'beauty', null],
    ['enveron-ai', 'Enveron AI', 'EA', 'software', null],
    ['family-school', 'Family School', 'FS', 'education', null],
    ['fanatik-game-center', 'Fanatik Game Center', 'FG', 'leisure', null],
    ['fotoxalca', 'Fotoxalça', 'FX', 'other', null],
    ['fuzuli-olimpiya', 'Füzuli Olimpiya İdman Kompleksi', 'Fİ', 'sports', 20],
    ['gallery4kids', 'Gallery4Kids', 'G4', 'leisure', null],
    ['gilas-optic', 'Gilas Optic', 'GO', 'health', null],
    ['goranboy-olimpiya', 'Goranboy Olimpiya İdman Kompleksi', 'Gİ', 'sports', 20],
    ['goranboy-hovuz', 'Goranboy Üzgüçülük Hovuzu', 'GH', 'sports', null],
    ['greyder', 'Greyder', 'G', 'fashion', null],
    ['growth-guide', 'Growth Guide', 'GG', 'education', null],
    ['goygol-olimpiya', 'Göygöl Olimpiya İdman Kompleksi', 'Gİ', 'sports', 20],
    ['heyder-eliyev-idman-konsert', 'Heydər Əliyev adına İdman-Konsert Kompleksi', 'HƏ', 'sports', 20, 'qr'],
    ['happyland', 'Happyland', 'H', 'leisure', null],
    ['holberton', 'Holberton School Azerbaijan', 'HS', 'education', null],
    ['it-brains', 'IT Brains Academy MMC', 'IT', 'education', 10],
    ['itech-group', 'iTech Group', 'IT', 'other', null],
    ['ivy-hub', 'IVY Hub', 'IVY', 'education', null],
    ['inlingua', 'Inlingua', 'IN', 'education', null],
    ['accessorize', 'Accessorize', 'AC', 'fashion', 5, 'qr'],
    ['adidas', 'Adidas', 'AD', 'fashion', 5, 'qr'],
    ['almond-cake', 'Almond Cake', 'AC', 'food', 5, 'qr'],
    ['altun-kitab', 'Altun Kitab MMC', 'AK', 'books', 25, 'qr'],
    ['ametist-academy', 'Ametist Academy', 'AA', 'education', 25, 'card'],
    ['apply-uni', 'Apply Uni', 'AU', 'education', '20–50%', 'card'],
    ['astara-olimpiya', 'Astara Olimpiya İdman Kompleksi', 'Aİ', 'sports', 20, 'qr'],
    ['attar-gallery', 'Attar Gallery', 'AG', 'beauty', 40, 'qr'],
    ['avis-tibbi-market', 'Avis Tibbi Market', 'AV', 'health', '2–25%', 'qr'],
    ['dovlet-kukla-teatri', 'Azərbaycan Dövlət Kukla Teatrı', 'KT', 'culture', 20, 'qr'],
    ['genc-tamasacilar-teatri', 'Azərbaycan Dövlət Milli Gənc Tamaşaçılar Teatrı', 'GT', 'culture', 20, 'qr'],
    ['yug-teatri', 'Azərbaycan Dövlət Yuğ Teatrı', 'YT', 'culture', 20, 'qr'],
    ['agcabedi-olimpiya', 'Ağcabədi Olimpiya İdman Kompleksi', 'Aİ', 'sports', 20, 'qr'],
    ['agdam-olimpiya', 'Ağdam Olimpiya İdman Kompleksi', 'Aİ', 'sports', 20, 'qr'],
    ['agdas-olimpiya', 'Ağdaş Olimpiya İdman Kompleksi', 'Aİ', 'sports', 20, 'qr'],
    ['bahar-store', 'Bahar Store', 'BS', 'fashion', 10, 'qr'],
    ['bakcell', 'Bakcell', 'BC', 'internet', '5 GB', 'special'],
    ['baku-it-academy', 'Baku IT Academy', 'IT', 'education', 20, 'card'],
    ['baki-dovlet-sirki', 'Bakı Dövlət Sirki', 'BS', 'culture', 10, 'qr'],
    ['baki-nitq-merkezi', 'Bakı Nitq Mərkəzi', 'BN', 'education', 30, 'card'],
    ['balaken-olimpiya', 'Balakən Olimpiya İdman Kompleksi', 'Bİ', 'sports', 20, 'qr'],
    ['barratson', 'Barratson Education Center', 'BE', 'education', 10, 'card'],
    ['batut-arena', 'Batut Arena', 'BA', 'leisure', 50, 'qr'],
    ['ejdaha-doner', 'Əjdaha Döner', 'ƏD', 'food', 5, 'paycity'],
    ['park-cinema', 'Park Cinema', 'PC', 'leisure', 15, 'paycity'],
    ['innvino', 'InnVino', 'IV', 'food', 20, 'paycity'],
    ['lucky-art', 'Lucky Art', 'LA', 'other', 10, 'paycity'],
    ['iva', 'IVA', 'I', 'food', 5, 'card'],
    ['gurmania', 'Gurmania', 'GU', 'food', 20, 'paycity'],
    ['hertz', 'Hertz', 'HZ', 'travel', 10, 'paycity'],
    ['chocolatier', 'Chocolatier', 'CH', 'food', 10, 'paycity'],
    ['myshops', 'MYShops', 'MY', 'electronics', 2, 'paycity'],
    ['portal-games', 'Portal Games', 'PG', 'leisure', 30, 'card'],
    ['akademik-musiqili-teatr', 'Azərbaycan Dövlət Akademik Musiqili Teatrı', 'MT', 'culture', 20, 'qr'],
    ['akademik-rus-dram-teatri', 'Azərbaycan Dövlət Akademik Rus Dram Teatrı', 'RD', 'culture', 20, 'qr'],
  ];

  const studentRows = [
    ['xalca-muzeyi', 'Azərbaycan Milli Xalça Muzeyi', 'XM', 'culture', null, 'student-id'],
    ['iceriseher', 'İçərişəhər', 'İÇ', 'culture', null, 'student-id'],
    ['azal', 'AZAL', 'AZ', 'travel', null, 'online'],
    ['nar', 'Nar', 'N', 'internet', null, 'online'],
    ['shirinpay', 'Shirinpay', 'ŞP', 'food', null, 'student-id'],
    ['rotante', 'Rotante', 'R', 'food', null, 'student-id'],
    ['amoria-coffee', 'Amoria Coffee', 'AC', 'food', null, 'student-id'],
    ['dreamland-baku', 'Dreamland Baku', 'DB', 'leisure', 50],
    ['heyder-eliyev-merkezi', 'Heydər Əliyev Mərkəzi', 'HƏ', 'culture', null, 'student-id'],
  ];

  function addLocal(list, kind) {
    for (const [id, name, initials, category, amount, method] of list) {
      const [az, en] = notes[category];
      offers.push({
        id, name, initials, category, kind, method,
        percent: typeof amount === 'number' ? amount : null,
        amount: typeof amount === 'string' ? amount : '',
        az, en,
      });
    }
  }

  addLocal(rows, 'card');
  addLocal(studentRows, 'student');

  const onlineRows = [
    ['autodesk', 'Autodesk Education', 'AD', 'software', 'https://www.autodesk.com/education/edu-software/overview',
      ['Uyğun tələbələr üçün AutoCAD, Fusion və başqa Autodesk proqramlarına təhsil girişi.', 'Autodesk hesabında tələbə statusunu təsdiqləyin. Seçilən proqramın təhsil lisenziyasının müddətini və istifadə məhdudiyyətlərini yoxlayın.'],
      ['Education access to AutoCAD, Fusion and other Autodesk apps for eligible students.', 'Verify student status with Autodesk and check the duration and permitted uses of your selected product.']],
    ['miro', 'Miro Education', 'MI', 'software', 'https://miro.com/education/',
      ['Dərs və qrup layihələri üçün onlayn lövhələr üzrə təhsil planı.', 'Rəsmi müraciətdə tələbə statusunu, komanda ölçüsünü və lövhə imkanlarını yoxlayın.'],
      ['Education plan for online whiteboards used in classes and group projects.', 'Check eligibility, team size and board features in the official application.']],
    ['sketch', 'Sketch Education', 'SK', 'software', 'https://www.sketch.com/education/',
      ['İnterfeys dizaynı üçün Sketch-in təhsil imkanları.', 'Təhsil müraciətini və macOS uyğunluğunu yoxlayın. İş sahəsinin və sənədlərin plan dəyişəndə necə saxlanıldığını öyrənin.'],
      ['Sketch education access for interface design.', 'Check the education application and macOS compatibility. Review what happens to your workspace and documents if the plan changes.']],
    ['framer', 'Framer', 'FR', 'software', 'https://www.framer.com/pricing/',
      ['Veb dizayn və portfel səhifələri üzrə tələbə imkanı.', 'Cari tələbə proqramını, layihə limitini və xüsusi domenin qiymət şərtlərini Framer-də yoxlayın.'],
      ['Student offer for web design and portfolios.', 'Confirm a current student programme, project limits and custom-domain pricing with Framer.']],
    ['mural', 'Mural', 'MU', 'software', 'https://www.mural.co/education',
      ['Komanda lövhələri və qrup işi üçün Mural-ın təhsil imkanları.', 'Təhsil planına müraciət qaydasını, iştirakçı limitlərini və müddəti provayderdən yoxlayın.'],
      ['Mural education options for whiteboards and group work.', 'Check the application process, participant limits and term with the provider.']],
    ['lucidchart', 'Lucidchart', 'LC', 'software', 'https://lucid.co/education',
      ['Diaqram, proses xəritəsi və layihə sənədləri üzrə təhsil imkanı.', 'Tələbə hesabı, universitet lisenziyası və ixrac imkanları üçün Lucid-in cari şərtlərinə baxın.'],
      ['Education options for diagrams, process maps and project documents.', 'Check Lucid’s current terms for student accounts, institutional licences and export features.']],
    ['mongodb', 'MongoDB', 'DB', 'cloud', 'https://www.mongodb.com/students',
      ['Verilənlər bazası və bulud layihələri üzrə MongoDB tələbə proqramı.', 'Tələbə imtiyazı və pulsuz Atlas tarifinin limitlərini ayrıca yoxlayın. Ödənişli resurs yaratmazdan əvvəl qiymət şərtlərinə baxın.'],
      ['MongoDB student programme for database and cloud projects.', 'Check the student benefit and the Atlas free-tier limits separately. Review prices before creating paid resources.']],
    ['overleaf', 'Overleaf', 'OL', 'education', 'https://www.overleaf.com/edu',
      ['LaTeX ilə kurs işi, dissertasiya və elmi mətn hazırlamaq üçün təhsil imkanı.', 'Universitetinizi rəsmi təhsil siyahısında axtarın. Şəxsi və institusional planlarda əməkdaşlıq limitləri fərqlənə bilər.'],
      ['Education access for writing coursework, dissertations and research in LaTeX.', 'Search for your institution in the official directory. Personal and institutional plans may have different collaboration limits.']],
    ['ableton', 'Ableton', 'AB', 'software', 'https://www.ableton.com/en/shop/education/',
      ['Musiqi istehsalı üzrə Ableton-un təhsil qiyməti.', 'Planı və tələbə təsdiqini yoxladıqdan sonra yekun qiyməti, uyğun məhsulları və yenilənmə şərtlərini müqayisə edin.'],
      ['Ableton education pricing for music production.', 'Confirm the plan and eligibility, then compare the final price, eligible products and upgrade terms.']],
    ['prezi', 'Prezi', 'PZ', 'education', 'https://prezi.com/pricing/edu/',
      ['Təqdimat hazırlamaq üçün Prezi təhsil planları.', 'Müraciətdə universitet e-poçtu, məxfilik ayarları, ixrac və aylıq və ya illik ödəniş şərtlərini yoxlayın.'],
      ['Prezi education plans for presentations.', 'Review institutional email requirements, document privacy, export features and monthly or annual billing.']],
    ['spotify', 'Spotify Premium Student', 'SP', 'entertainment', 'https://www.spotify.com/student/',
      ['Təsdiqlənmiş tələbələr üçün Spotify abunə seçimi.', 'Azərbaycan üzrə planın əlçatanlığını, verifikasiya qaydasını və yenilənəndə tətbiq edilən qiyməti provayderdə yoxlayın.'],
      ['Spotify subscription option for verified students.', 'Check availability in Azerbaijan, the verification process and the renewal price with the provider.']],
    ['youtube', 'YouTube tələbə abunəliyi', 'YT', 'entertainment', 'https://support.google.com/youtube/answer/9158808',
      ['Uyğun ölkə və universitetdə YouTube tələbə abunəliyi imkanı.', 'Azərbaycan və universitetiniz üzrə uyğunluğu, tələbə təsdiqini və son abunə qiymətini rəsmi səhifədə yoxlayın.'],
      ['YouTube student membership in eligible countries and institutions.', 'Check availability for Azerbaijan and your institution, verification requirements and the final price on the official page.']],
    ['apple-education', 'Apple Education', 'AE', 'software', 'https://www.apple.com/education/',
      ['Apple-ın təhsillə bağlı proqram və alış imkanları.', 'Azərbaycan üzrə satış kanalını və tələbə qiymətinin qüvvədə olmasını yoxlayın. Apple Music və cihaz alışının şərtlərini ayrı yoxlayın.'],
      ['Apple programmes and purchasing options for education.', 'Confirm availability through an eligible retailer in Azerbaijan. Apple Music and hardware purchase terms differ.']],
  ];

  for (const [id, name, initials, category, url, az, en] of onlineRows) {
    offers.push({ id, name, initials, category, url, kind: 'online', method: 'online', az, en });
  }
})();
