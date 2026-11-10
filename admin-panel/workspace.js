const WORKSPACE_TEMPLATE =
  '<nav id="nav" aria-label="İş sahəsinin kateqoriyaları"></nav><span id="crumb" hidden></span><div id="hero" hidden></div><div id="warning" hidden><button id="issue" type="button">Texniki yoxlama</button></div><div class="page"><div class="heading"><div><div class="overline" style="margin:0 0 10px;color:#789064">PLANLA. YOXLA. PAYLAŞ.</div><h2 id="heading">Hər yenilik bir yerdə.</h2><div class="sub" id="subtitle">Buraxılışdan paylaşımadək — bütün işlərin vahid görünüşü.</div></div><button class="primary" id="add">＋ Yeni tapşırıq</button></div><div class="stats" id="stats"></div><section class="panel"><div class="panelhead"><h3 id="paneltitle">Tapşırıqlar <span class="count" id="count"></span></h3><div><button id="tablebtn" title="Cədvəl görünüşü">☷ Cədvəl</button> <button id="boardbtn" title="Lövhə görünüşü">▥ Lövhə</button></div></div><div class="toolbar" id="toolbar"><input aria-label="Tapşırıq axtar" id="search" placeholder="⌕  Başlıq və ya mətn üzrə axtar…"/><select aria-label="Status" id="status"><option value="">Bütün statuslar</option><option>Qaralama</option><option>Yoxlamada</option><option>Hazır</option><option>Tamamlandı</option></select><select aria-label="Prioritet" id="priority"><option value="">Bütün prioritetlər</option><option>Yüksək</option><option>Orta</option><option>Aşağı</option></select><button id="export">İxrac ↓</button><button id="import">İdxal ↑</button><input accept="application/json" hidden="" id="file" type="file"/></div><div id="content"></div></section><div class="footnote"><span>Redaktələr yalnız bu brauzerdə saxlanır. Ehtiyat nüsxə üçün ixrac et.</span><span>GitHub yalnız oxunur. Sosial paylaşım avtomatik deyil.</span></div></div><dialog id="editor"><form id="taskform"><div class="modalhead"><h3 id="modaltitle">Tapşırıq</h3><button aria-label="Bağla" id="close" type="button">✕</button></div><div class="form" id="fields"></div><div class="actions"><button id="delete" type="button">Sil</button><button id="duplicate" type="button">Nüsxəsini yarat</button><button id="copy" type="button">Mətni kopyala</button><button class="primary" type="submit">Dəyişiklikləri saxla</button></div></form></dialog><div class="toast" id="toast" role="status"></div>';
window.mountAdminWorkspace = function (host) {
  if (host.shadowRoot?.childNodes.length) return;
  const shadow = host.shadowRoot || host.attachShadow({ mode: "open" });
  const template = WORKSPACE_TEMPLATE;
  shadow.innerHTML =
    '<link rel="stylesheet" href="' +
    new URL("workspace.css?v=20261110", window.document.baseURI).href +
    '">' +
    template;
  const document = {
    getElementById: (id) => shadow.getElementById(id),
    querySelectorAll: (q) => shadow.querySelectorAll(q),
    createElement: (tag) => window.document.createElement(tag),
  };
  function validTasks(rows) {
    return (
      Array.isArray(rows) &&
      rows.length <= 2000 &&
      new Set(rows.map((t) => t?.id)).size === rows.length &&
      rows.every(
        (t) =>
          t &&
          typeof t.id === "string" &&
          /^[a-zA-Z0-9-]{1,100}$/.test(t.id) &&
          typeof t.title === "string" &&
          t.title.trim() &&
          t.title.length <= 1000 &&
          statuses.includes(t.status) &&
          cats.slice(1, 7).includes(t.type) &&
          ["Yüksək", "Orta", "Aşağı"].includes(t.priority) &&
          Number.isFinite(Date.parse(t.updated)) &&
          Object.values(t).every(
            (v) => typeof v === "string" && v.length <= 20000,
          ) &&
          (!t.link || /^https?:\/\//i.test(t.link)),
      )
    );
  }
  const cats = [
    "Ümumi baxış",
    "Post",
    "Story",
    "Buraxılış qeydləri",
    "Material toplama elanı",
    "Platformadaxili bildiriş",
    "Texniki yoxlama",
    "GitHub dəyişiklikləri",
  ];
  const icons = ["01", "02", "03", "04", "05", "06", "07", "08"];
  const statuses = ["Qaralama", "Yoxlamada", "Hazır", "Tamamlandı"];
  const features = [
    "İmtahan materialları",
    "Onlayn testlər",
    "GPA kalkulyatoru",
    "İxtisas planı",
    "Dashboard və nailiyyət sistemi",
    "Material istəkləri",
    "AI köməkçisi",
    "Taymer və məhsuldarlıq alətləri",
    "Tələbə Kompası",
    "Ümumi platforma",
  ];
  const base = "https://unecstudentshub.com";
  let seed = [];
  function add(
    title,
    type,
    feature,
    channel,
    text,
    goal,
    notes,
    priority = "Orta",
    status = "Qaralama",
    cta = "Platformaya keç",
    link = base,
  ) {
    seed.push({
      id: crypto.randomUUID(),
      title,
      type,
      feature,
      channel,
      text,
      goal,
      notes,
      priority,
      status,
      cta,
      link,
      updated: "2026-11-09T12:00:00+04:00",
      metrics: "Hədəf: müəyyən edilməyib. Faktiki nəticə: ölçülməyib.",
      owner: "Təyin edilməyib",
    });
  }
  add(
    "v1.1.21 — yenilikləri tanıt",
    "Post",
    "İxtisas planı",
    "Instagram",
    "UNEC Students Hub v1.1.21 ✨\nİxtisas planında seçdiyin kursun iki semestrini birlikdə gör. İlk açılış profilindəki kursa uyğunlaşır; “Hamısı” ilə bütün planı aç.\nƏvvəlki kursların fənləri avtomatik tamamlanmış görünür. Məsələn, 3-cü kurs seçdikdə I–IV semestrlər işarələnir. Avtomatik işarələri dəyişmək, cari və gələcək fənləri əl ilə tamamlamaq mümkündür. Əvvəlki əl ilə seçimlər qorunur.\nMüstəqil tələbə platforması — unecstudentshub.com",
    "Buraxılışın əsas faydasını tələbəyə çatdırmaq.",
    "İstifadəçinin təqdim etdiyi v1.1.21 qeydlərinə əsaslanır. Paylaşmadan əvvəl canlı interfeyslə müqayisə et.",
    "Yüksək",
    "Yoxlamada",
  );
  add(
    "v1.1.21 — tam buraxılış mətni",
    "Buraxılış qeydləri",
    "İxtisas planı",
    "GitHub / sayt",
    "UNEC Students Hub v1.1.21\n\nİxtisas planı\n• Yığcam kurs seçicisi seçilmiş kursun iki semestrini göstərir.\n• İlk açılış profildəki kursa uyğun olur; “Hamısı” bütün planı açır.\n• Əvvəlki kursların fənləri avtomatik tamamlanmış görünür.\n• Cari və gələcək fənləri əl ilə tamamlamaq mümkündür.\n• Avtomatik işarələr dəyişdirilə bilir, əvvəlki əl ilə seçimlər qorunur.\n\nDigər dəyişikliklər\nOflayn təhsil alətləri, hesab və AI yoxlamaları barədə yeniliklər bildirilib. Dəqiq əhatə və davranışlar texniki yoxlamadan sonra bu bölməyə əlavə edilməlidir.",
    "Yenidən istifadə edilə bilən dəqiq buraxılış qeydi hazırlamaq.",
    "Tam commit, buraxılış tarixi və oflayn əhatə məlum deyil. Bu mətnin son bölməsini təsdiqləmədən yayımlama.",
    "Yüksək",
    "Yoxlamada",
  );
  add(
    "3 kadrda yeni ixtisas planı",
    "Story",
    "İxtisas planı",
    "Instagram",
    "Kadr 1: İxtisas planın indi kursuna uyğun açılır.\nKadr 2: 3-cü kursdasan? I–IV semestrlər avtomatik tamamlanmış görünür. İstənilən işarəni dəyişə bilərsən.\nKadr 3: Cari semestrini aç, planını yoxla!\nKeçid stikeri: unecstudentshub.com",
    "Yeniliyi qısa və aydın göstərmək.",
    "9:16 real ekran görüntüləri istifadə et. Profil kursunu və avtomatik seçimləri sına.",
  );
  add(
    "İmtahana hazırlaş: materialları tap",
    "Post",
    "İmtahan materialları",
    "Instagram",
    "İmtahana hazırlaşarkən material axtarışına daha az vaxt ayır 📚\nUNEC Students Hub-da fənninə aid mövcud materialları nəzərdən keçir. Material kartından “Məlumata bax” keçidini aç, fayl məlumatını yoxla və oxumağa başla.\nBütün fənlər üzrə material olacağına zəmanət verilmir.",
    "Material tapma axınını tanıtmaq.",
    "v1.1.19 qeydlərinə əsaslanır. Real fənn və mövcud fayldan ekran görüntüsü seç.",
  );
  add(
    "Biliyini onlayn testlə yoxla",
    "Post",
    "Onlayn testlər",
    "Instagram",
    "Mövzunu oxudun? İndi biliyini yoxla.\nUNEC Students Hub-da mövcud onlayn testlərdən istifadə et və hazırlığını davam etdir.\nFənninə uyğun testin olub-olmadığını platformada yoxla.",
    "Test funksiyasına keçid yaratmaq.",
    "Testlərin mövcudluğunu yoxla. Təsdiqlənməmiş statistika və nəticə vədi əlavə etmə.",
  );
  add(
    "GPA kalkulyatoru — qısa video",
    "Post",
    "GPA kalkulyatoru",
    "TikTok",
    "Video planı: nəticələrini hazırla → GPA kalkulyatorunu aç → tələb olunan qiymət və kreditləri daxil et → hesablamaya bax.\nEkran mətni: “Ortalamana bir yerdə bax.”\nPaylaşım mətni: GPA-nı hesablamaq üçün UNEC Students Hub-dan istifadə et. Hesablama məlumat xarakterlidir; rəsmi nəticəni universitet sistemindən yoxla.",
    "Kalkulyatorun istifadəsini göstərmək.",
    "Giriş sahələrini real interfeyslə uyğunlaşdır. TikTok profil ünvanı ayrıca təsdiqlənməlidir.",
    "Orta",
    "Qaralama",
  );
  add(
    "Profil və nailiyyətlər",
    "Story",
    "Dashboard və nailiyyət sistemi",
    "Instagram",
    "Kadr 1: Tələbə profilinə daxil ol.\nKadr 2: Dashboard və nailiyyətlər bölməsinə bax.\nKadr 3: Öz hesabındakı mövcud göstəriciləri kəşf et.",
    "Profil imkanlarının görünürlüğünü artırmaq.",
    "Yalnız həqiqətən görünən nailiyyətləri göstər; şəxsi məlumatları gizlət.",
  );
  add(
    "Material istəyi və cavablar",
    "Post",
    "Material istəkləri",
    "Telegram",
    "Axtardığın materialı tapa bilmədin?\nUNEC Students Hub-da material istəyi yarat və fənni aydın qeyd et. İstək altındakı cavablarda material paylaşmaq mümkündür.\nCavab yazmaq üçün hesaba giriş tələb edilir. Bildirişlər standart quruluşda könüllüdür.",
    "Tələbələri material mübadiləsinə yönəltmək.",
    "v1.1.18 qeydlərinə əsaslanır. Fayl yükləmə, cavab və bildiriş axınını canlı sına.",
  );
  add(
    "AI köməkçisi — istifadə çərçivəsi",
    "Story",
    "AI köməkçisi",
    "Instagram",
    "AI köməkçisi ilə mövzunu daha sadə izah etməsini istə.\nNümunə sorğu: “Bu anlayışı sadə dildə və bir nümunə ilə izah et.”\nCavabı dərs materialları ilə müqayisə et; AI cavablarında səhvlər ola bilər.",
    "AI köməkçisindən düşünülmüş istifadəni təşviq etmək.",
    "Giriş, hesab və istifadə limitlərini faktiki interfeysdən yoxla. Limit uydurma.",
  );
  add(
    "Fokus vaxtı: taymeri aç",
    "Story",
    "Taymer və məhsuldarlıq alətləri",
    "Instagram",
    "Bir mövzu seç. Diqqətini yayındıran bildirişləri bağla. UNEC Students Hub-da taymeri aç və dərsə başla.\nKiçik, davamlı addımlar hazırlığı asanlaşdırır.",
    "Məhsuldarlıq alətini gündəlik istifadəyə gətirmək.",
    "Taymerin real idarəetməsini göstər. Avtomatik statistika və ya sinxronizasiya vəd etmə.",
  );
  for (const channel of ["Instagram", "WhatsApp", "Telegram"])
    add(
      "Material toplayırıq — " + channel,
      "Material toplama elanı",
      "İmtahan materialları",
      channel,
      "UNEC tələbələri, materialları birlikdə əlçatan edək! 📚\nPaylaşılmasına icazə verilən dərs qeydlərini, konspektləri və imtahana hazırlıq materiallarını UNEC Students Hub üçün toplayırıq.\nGöndərərkən fənn, ixtisas və kursu qeyd et. Şəxsi məlumatları əvvəlcədən sil. Yalnız paylaşmaq hüququn olan materialları göndər.\nMaterialı Instagram hesabımıza DM ilə göndərə bilərsən. Layihə müstəqildir, UNEC ilə rəsmi əlaqəsi yoxdur. Müəllif hüquqları sahiblərinə məxsusdur.",
      "İcazəli və düzgün təsnif edilmiş material toplamaq.",
      "Materialın paylaşım icazəsini və şəxsi məlumatların silindiyini yoxla. WhatsApp/Telegram qrup keçidləri təqdim edilməyib.",
      "Yüksək",
      "Qaralama",
      "Materialını DM ilə göndər",
      "https://www.instagram.com/unecstudentshub",
    );
  for (const [name, text] of [
    [
      "Haqqımızda",
      "UNEC Students Hub tələbələr tərəfindən idarə olunan müstəqil platformadır. UNEC və ya dövlət qurumları ilə rəsmi əlaqəsi yoxdur.",
    ],
    [
      "İstifadə",
      "Fənnini seç → mövcud materiala bax → faylı aç. Ekran görüntülərini cari interfeysə uyğun əlavə et.",
    ],
    [
      "Xidmətlər",
      "Materiallar, onlayn testlər, GPA kalkulyatoru, ixtisas planı, dashboard, material istəkləri, AI köməkçisi və taymer.",
    ],
    [
      "Sual-cavab",
      "Platforma rəsmidir? Xeyr.\nMaterial göndərə bilərəm? Paylaşım icazən varsa, fənn, ixtisas və kursu qeyd edərək DM göndər.",
    ],
    [
      "Yeniliklər",
      "v1.1.21: kursa uyğun ixtisas planı və əvvəlki kursların avtomatik tamamlanması.",
    ],
  ])
    add(
      "Seçilmiş hekayə: " + name,
      "Story",
      "Ümumi platforma",
      "Instagram",
      text,
      "Daimi story highlight məzmunu hazırlamaq.",
      "Eyni ikon üslubu və 9:16 format. Mətnin ekranın təhlükəsiz sahəsində qalmasını yoxla.",
    );
  add(
    "v1.1.21 — tətbiqdaxili elan",
    "Platformadaxili bildiriş",
    "İxtisas planı",
    "Platforma",
    "İxtisas planın yeniləndi!\nProfilindəki kursa uyğun semestrləri gör, əvvəlki kursların avtomatik tamamlanmış fənlərini yoxla və istədiyin işarəni dəyiş.",
    "Yeniliyi aktiv istifadəçiyə çatdırmaq.",
    "Bu yalnız mətn layihəsidir. Sayta bildiriş göndərilməyib; çatdırılma mexanizmi ayrıca təsdiqlənməlidir.",
    "Orta",
    "Qaralama",
    "İxtisas planına bax",
  );
  add(
    "TikTok ünvanını dəqiqləşdir",
    "Texniki yoxlama",
    "Ümumi platforma",
    "Sayt / TikTok",
    "Yoxlama addımları:\n1. “Daha çox” səhifəsində TikTok keçidini aç.\n2. Cari href-i https://www.tiktok.com/@unecstudentshub.com ilə müqayisə et.\n3. Hesab sahibindən doğru istifadəçi adını təsdiqlə.\n4. Düzəlişdən sonra masaüstü və mobil görünüşdə keçidi sına.",
    "Yanlış profilə yönləndirmə riskini aradan qaldırmaq.",
    "26.10.2026 tarixli 7612063 commit-i barədə əvvəlki qeyddə .com şəkilçili ünvan göstərilib. Cari kod yoxlanmayıb. @unecstudentshub ehtimaldır, təsdiqlənmiş əvəz deyil.",
    "Yüksək",
    "Yoxlamada",
    "Commit-ə bax",
    "https://github.com/EricIsMyHero/ericismyhero.github.io/commit/7612063a0f80511cf597947872d8ada1859e7cc5",
  );
  add(
    "Kurs və avtomatik tamamlama sınağı",
    "Texniki yoxlama",
    "İxtisas planı",
    "Sayt",
    "□ Profildə 3-cü kurs seç.\n□ İlk açılışda 3-cü kursun semestrlərini yoxla.\n□ I–IV semestrlərin avtomatik işarələndiyini yoxla.\n□ Avtomatik işarəni dəyiş və səhifəni yenilə.\n□ Cari və gələcək fənni əl ilə tamamla.\n□ Əvvəlki əl ilə seçimlərin saxlandığını yoxla.\n□ “Hamısı” ilə bütün planı aç.",
    "v1.1.21 davranışını təsdiqləmək.",
    "Sınaq aparılmayıb. Cihaz, brauzer, gözlənilən və faktiki nəticəni buraya yaz.",
    "Yüksək",
    "Yoxlamada",
  );
  add(
    "Oflayn, hesab və AI yoxlamaları",
    "Texniki yoxlama",
    "AI köməkçisi",
    "Sayt / PWA",
    "□ Buraxılış diff-indən oflayn işləyən alətlərin dəqiq siyahısını çıxar.\n□ İlk açılış və keşlənmiş açılışı şəbəkəsiz sına.\n□ Hesabdan çıxmış istifadəçinin məhdudiyyətlərini yoxla.\n□ AI sorğusunda icazə və xəta davranışını sına.\n□ Şəbəkə bərpa olduqda davranışı qeydə al.",
    "Ümumi yenilik başlıqlarını yoxlanmış davranışlarla dəqiqləşdirmək.",
    "Bütün platformanın və AI-nin oflayn işlədiyini iddia etmə. Dəqiq əhatə hələ təsdiqlənməyib.",
    "Yüksək",
    "Yoxlamada",
  );
  add(
    "Cavab, fayl və push axını",
    "Texniki yoxlama",
    "Material istəkləri",
    "Sayt",
    "□ Hesaba daxil ol və bildiriş icazəsini yoxla.\n□ Test istəyinə cavab yaz.\n□ İcazəli PDF faylı əlavə et və açıldığını yoxla.\n□ İstəyi açan hesabda push bildirişini yoxla.\n□ Upvote və “Tapıldı” axınının işləməsini sına.",
    "v1.1.18 axınında geriləmələri aşkar etmək.",
    "R2 və Firestore qaydalarının mövcud quruluşunu yoxla. Heç bir sınaq avtomatik icra edilməyib.",
    "Yüksək",
    "Qaralama",
  );
  const key = "unec-workspace-v1";
  let tasks = seed;
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (validTasks(saved)) tasks = saved;
    else if (saved !== null)
      queueMicrotask(() =>
        toast(
          "Saxlanmış məlumatın formatı uyğun deyil. İlkin qeydlər dəyişdirilməyib.",
        ),
      );
  } catch {
    queueMicrotask(() => toast("İş sahəsi yaddaşı oxunmadı."));
  }
  let lastSaved = structuredClone(tasks);
  let active = "Ümumi baxış",
    view = "table",
    current = null;
  const $ = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  function toast(s) {
    const node = $("toast");
    if (!node) return;
    node.textContent = s;
    node.style.display = "block";
    setTimeout(() => (node.style.display = "none"), 2700);
  }
  function persist() {
    if (!validTasks(tasks)) {
      tasks = structuredClone(lastSaved);
      toast(
        "Sahələri yoxla: ən çox 2 000 tapşırıq və hər mətn üçün 20 000 simvol saxlanılır.",
      );
      return false;
    }
    try {
      localStorage.setItem(key, JSON.stringify(tasks));
      lastSaved = structuredClone(tasks);
      return true;
    } catch {
      tasks = structuredClone(lastSaved);
      toast("Yaddaşa yazılmadı. Redaktəni kopyala və yer boşalt.");
      return false;
    }
  }
  const badge = (s) =>
    `<span class="badge ${{ Yoxlamada: "review", Hazır: "ready", Qaralama: "draft", Tamamlandı: "done" }[s] || ""}">${esc(s)}</span>`;
  const date = (s) =>
    new Date(s).toLocaleDateString("az-AZ", { timeZone: "Asia/Baku" });
  function render() {
    $("nav").innerHTML = cats
      .map(
        (c, i) =>
          `<button data-cat="${c}" class="${active === c ? "active" : ""}" aria-pressed="${active === c}"><span>${icons[i]}</span>${c}<span>${i > 0 && i < 7 ? tasks.filter((t) => t.type === c).length : ""}</span></button>`,
      )
      .join("");
    document.querySelectorAll("[data-cat]").forEach(
      (b) =>
        (b.onclick = () => {
          active = b.dataset.cat;
          render();
        }),
    );
    $("crumb").textContent = active;
    $("heading").textContent =
      active === "Ümumi baxış" ? "Hər yenilik bir yerdə." : active;
    $("hero").hidden = true;
    $("warning").hidden = true;
    $("stats").innerHTML = [
      ["Bütün tapşırıqlar", tasks.length, "Məzmun və texniki işlər"],
      [
        "Yoxlama gözləyir",
        tasks.filter((t) => t.status === "Yoxlamada").length,
        "Təsdiqdən əvvəl nəzərdən keçir",
      ],
      [
        "Paylaşıma hazır",
        tasks.filter((t) => t.status === "Hazır").length,
        "Statusu əl ilə yenilə",
      ],
      [
        "Tamamlanıb",
        tasks.filter((t) => t.status === "Tamamlandı").length,
        "Qeydə alınmış nəticələr",
      ],
    ]
      .map(
        (x) =>
          `<div class="stat"><label>${x[0]}</label><b>${x[1].toString().padStart(2, "0")}</b><small>${x[2]}</small></div>`,
      )
      .join("");
    $("toolbar").hidden = active === "GitHub dəyişiklikləri";
    $("tablebtn").hidden = $("boardbtn").hidden =
      active === "GitHub dəyişiklikləri";
    $("paneltitle").textContent =
      active === "GitHub dəyişiklikləri" ? "Dəyişiklik jurnalı" : "Tapşırıqlar";
    if (active === "GitHub dəyişiklikləri") {
      renderCommits();
      return;
    }
    const q = $("search").value.toLocaleLowerCase("az");
    const list = tasks.filter(
      (t) =>
        (active === "Ümumi baxış" || t.type === active) &&
        (!$("status").value || t.status === $("status").value) &&
        (!$("priority").value || t.priority === $("priority").value) &&
        [t.title, t.text, t.feature, t.channel]
          .join(" ")
          .toLocaleLowerCase("az")
          .includes(q),
    );
    $("paneltitle").innerHTML =
      `Tapşırıqlar <span class="count">${list.length} tapşırıq</span>`;
    if (!list.length) {
      $("content").innerHTML =
        '<div class="empty">Uyğun tapşırıq tapılmadı. Filtrləri dəyiş və ya yeni tapşırıq yarat.</div>';
      return;
    }
    if (view === "table")
      $("content").innerHTML =
        `<div class="tablewrap"><table><thead><tr><th>TAPŞIRIQ</th><th>KANAL / NÖV</th><th>STATUS</th><th>PRİORİTET</th><th>SON DƏYİŞİKLİK</th><th></th></tr></thead><tbody>${list.map((t) => `<tr data-id="${t.id}" tabindex="0"><td class="titlecell">${esc(t.title)}<small>${esc(t.feature)}</small></td><td>${esc(t.channel)}<br><small style="color:#8b968d">${esc(t.type)}</small></td><td>${badge(t.status)}</td><td class="priority ${t.priority === "Yüksək" ? "high" : ""}">● ${esc(t.priority)}</td><td>${date(t.updated)}</td><td>↗</td></tr>`).join("")}</tbody></table></div>`;
    else
      $("content").innerHTML =
        '<div class="board">' +
        statuses
          .map(
            (s) =>
              `<div class="column"><h4>${s} · ${list.filter((t) => t.status === s).length}</h4>${list
                .filter((t) => t.status === s)
                .map(
                  (t) =>
                    `<div class="card" tabindex="0" data-id="${t.id}"><span class="badge">${esc(t.channel)}</span><b>${esc(t.title)}</b><p>${esc(t.feature)}</p><span class="priority ${t.priority === "Yüksək" ? "high" : ""}">● ${esc(t.priority)}</span></div>`,
                )
                .join("")}</div>`,
          )
          .join("") +
        "</div>";
    document.querySelectorAll("[data-id]").forEach((el) => {
      el.onclick = () => openTask(el.dataset.id);
      el.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") openTask(el.dataset.id);
      };
    });
  }
  let commitCache = null;
  async function renderCommits() {
    const container = $("content");
    if (!container) return;
    container.innerHTML =
      '<div class="empty">GitHub dəyişiklikləri yüklənir…</div>';
    try {
      if (!commitCache) {
        const r = await fetch(
          "https://api.github.com/repos/EricIsMyHero/ericismyhero.github.io/commits?per_page=8",
          { headers: { Accept: "application/vnd.github+json" } },
        );
        if (!r.ok) throw Error();
        const data = await r.json();
        if (!Array.isArray(data)) throw Error();
        commitCache = data;
      }
      if (active !== "GitHub dəyişiklikləri" || !container.isConnected) return;
      container.innerHTML =
        '<p class="footnote">GitHub-dan yalnız oxuma. Commit və release bu paneldən avtomatik yayımlanmır.</p>' +
        commitCache
          .filter((c) => /^[a-f0-9]{40}$/.test(c.sha))
          .map(
            (c) =>
              `<article class="commit"><code>${esc(c.sha.slice(0, 7))}</code><small> · ${date(c.commit?.committer?.date)}</small><h3>${esc(c.commit?.message?.split("\n")[0])}</h3><a href="https://github.com/EricIsMyHero/ericismyhero.github.io/commit/${c.sha}" target="_blank" rel="noopener noreferrer">GitHub-da aç</a></article>`,
          )
          .join("");
    } catch {
      if (active === "GitHub dəyişiklikləri")
        container.innerHTML =
          '<div class="empty">GitHub məlumatı hazırda yüklənmir. <a href="https://github.com/EricIsMyHero/ericismyhero.github.io/commits/main/" target="_blank" rel="noopener noreferrer">Commit siyahısını aç</a>.</div>';
    }
    if (!container.isConnected || active !== "GitHub dəyişiklikləri") return;
    container.innerHTML += tasks
      .filter((t) => t.commit)
      .map(
        (t) =>
          `<article class="commit"><small>İş sahəsindəki qeyd</small><h3>${esc(t.title)}</h3><code>${esc(t.commit)}</code><p>${esc(t.summary)}</p><p>${esc(t.impact)}</p><p>${esc(t.notes)}</p><button data-edit="${esc(t.id)}">Redaktə et</button></article>`,
      )
      .join("");
    document
      .querySelectorAll("[data-edit]")
      .forEach((b) => (b.onclick = () => openTask(b.dataset.edit)));
  }
  const defs = [
    ["title", "Başlıq", "input"],
    ["goal", "Məqsəd", "area"],
    ["feature", "Əlaqəli funksiya", features],
    ["type", "Məzmun növü", cats.slice(1, 7)],
    ["channel", "Kanal", "input"],
    ["owner", "Məsul şəxs", "input"],
    ["text", "Azərbaycan dilində hazır mətn / şablon", "area"],
    ["cta", "CTA — hərəkət çağırışı", "input"],
    ["link", "Keçid", "url"],
    ["status", "Status", statuses],
    ["priority", "Prioritet", ["Yüksək", "Orta", "Aşağı"]],
    ["notes", "Yoxlama qeydləri", "area"],
    ["metrics", "Nəticə göstəriciləri — hədəf / faktiki", "area"],
    ["commit", "GitHub commit (istəyə bağlı)", "input"],
    ["commitDate", "Commit tarixi", "input"],
    ["summary", "Dəyişiklik xülasəsi", "area"],
    ["impact", "İstifadəçiyə təsir", "area"],
  ];
  function openTask(id) {
    current = tasks.find((t) => t.id === id) || {
      title: "",
      goal: "",
      feature: features[0],
      type: cats.slice(1, 7).includes(active) ? active : "Post",
      channel: "Instagram",
      status: "Qaralama",
      priority: "Orta",
      link: base,
      metrics: "Hədəf: \nFaktiki: ölçülməyib.",
    };
    $("modaltitle").textContent = current.id
      ? "Tapşırığı redaktə et"
      : "Yeni tapşırıq";
    $("fields").innerHTML =
      defs
        .map(
          ([k, label, type]) =>
            `<label class="field ${type === "area" || k === "title" ? "wide" : ""}">${label}${Array.isArray(type) ? `<select name="${k}">${type.map((v) => `<option ${v === current[k] ? "selected" : ""}>${v}</option>`).join("")}</select>` : type === "area" ? `<textarea name="${k}" ${k === "text" ? 'style="min-height:190px"' : ""}>${esc(current[k])}</textarea>` : `<input name="${k}" type="${type === "url" ? "url" : "text"}" value="${esc(current[k])}" ${k === "title" ? "required" : ""}>`}</label>`,
        )
        .join("") +
      `<small class="wide">Son dəyişiklik: ${current.updated ? esc(new Date(current.updated).toLocaleString("az-AZ", { timeZone: "Asia/Baku" })) : "Hələ saxlanmayıb"} · İlkin qeydlərin tarixi iş sahəsinin hazırlanma tarixidir.</small>`;
    $("delete").hidden = $("duplicate").hidden = !current.id;
    $("editor").showModal();
  }
  $("taskform").onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    if (data.link && !/^https?:\/\//i.test(data.link)) {
      toast("Keçid http və ya https ilə başlamalıdır.");
      return;
    }
    const t = {
      ...current,
      ...data,
      id: current.id || crypto.randomUUID(),
      updated: new Date().toISOString(),
    };
    tasks = current.id
      ? tasks.map((x) => (x.id === current.id ? t : x))
      : [t, ...tasks];
    if (!persist()) return;
    $("editor").close();
    render();
    toast("Tapşırıq saxlanıldı");
  };
  $("close").onclick = () => $("editor").close();
  $("add").onclick = () => openTask();
  function openIssue() {
    const t = tasks.find((t) => t.type === "Texniki yoxlama");
    if (t) openTask(t.id);
    else toast("Yoxlama tapşırığı silinib. Yeni tapşırıq yarada bilərsən.");
  }
  $("issue").onclick = openIssue;
  $("delete").onclick = () => {
    if (confirm("Bu tapşırıq silinsin?")) {
      tasks = tasks.filter((t) => t.id !== current.id);
      if (!persist()) return;
      $("editor").close();
      render();
    }
  };
  $("duplicate").onclick = () => {
    const data = Object.fromEntries(new FormData($("taskform")));
    const t = {
      ...current,
      ...data,
      id: crypto.randomUUID(),
      title: data.title + " — nüsxə",
      status: "Qaralama",
      updated: new Date().toISOString(),
    };
    tasks.unshift(t);
    if (!persist()) return;
    $("editor").close();
    render();
    openTask(t.id);
  };
  $("copy").onclick = async () => {
    const f = new FormData($("taskform"));
    try {
      await navigator.clipboard.writeText(
        [f.get("text"), f.get("cta"), f.get("link")]
          .filter(Boolean)
          .join("\n\n"),
      );
      toast("Mətn və CTA kopyalandı");
    } catch {
      toast("Kopyalama mümkün olmadı. Mətn sahəsindən əl ilə kopyala.");
    }
  };
  $("search").oninput = render;
  $("status").onchange = $("priority").onchange = render;
  $("tablebtn").onclick = () => {
    view = "table";
    render();
  };
  $("boardbtn").onclick = () => {
    view = "board";
    render();
  };
  $("export").onclick = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify({ version: 1, tasks }, null, 2)], {
        type: "application/json",
      }),
    );
    a.download = "UNEC-is-sahesi.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("Ehtiyat nüsxə ixrac edildi");
  };
  $("import").onclick = () => $("file").click();
  $("file").onchange = async (e) => {
    const input = e.currentTarget;
    const file = input.files[0];
    if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024) throw Error();
      const x = JSON.parse(await file.text());
      if (!input.isConnected) return;
      if (x.version !== 1 || !validTasks(x.tasks)) throw Error();
      if (confirm("İdxal hazırkı tapşırıqları əvəz edəcək. Davam edilsin?")) {
        tasks = x.tasks;
        if (!persist()) return;
        render();
        toast("Tapşırıqlar idxal edildi");
      }
    } catch {
      toast("Etibarlı iş sahəsi JSON faylı seç.");
    }
    input.value = "";
  };
  render();
};
