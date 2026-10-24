# Material istəkləri — yazışma, fayl əlavəsi və bildirişlər (quraşdırma)

**Material İstəkləri** bölməsində istifadəçi istək yazır, başqaları həmin istəyin altında **hamıya açıq yazışmada** cavab verir, cavaba **fayl** (PDF, Word, şəkil və s.) əlavə edir. İstəyi açan şəxsə hər yeni cavabda bildiriş gedir. Hamısı admin paneldə ətraflı görünür.

Bu sənəd yalnız **bir dəfəlik quraşdırma** üçündür (Cloudflare R2, Vercel dəyişənləri, Firestore qaydaları). Push bildirişlərin özü artıq qurulub — bax [`PUSH-SETUP.md`](PUSH-SETUP.md).

## 0. Necə işləyir

```
İstifadəçi (sayt)                            Server (Vercel, api/push.js)                 Cloudflare R2 / FCM
─────────────────                            ────────────────────────────                 ───────────────────
1. Giriş edir + bildirişləri açır (şərt)
2. İstək yazır ──────────▶ req-create ──────▶ idToken + cihaz yoxlanır, Firestore-a yazır
3. Başqası cavab yazır:
   fayl seçir ───────────▶ file-url ────────▶ növ/ölçü yoxlanır, 10 dəq. etibarlı
                                              imzalı yükləmə linki verir
   fayl ────────────────────────────── PUT ─────────────────────────────────────────────▶ R2 (birbaşa; Vercel-dən keçmir)
   mətn + fayl açarları ─▶ req-send ────────▶ R2-də fayl yoxlanır (HEAD + ilk baytlar),
                                              mesaj yazılır, istək sahibinə bildiriş ──────▶ FCM ──▶ istək sahibinin cihazı
4. İstək sahibi cavab yazanda ─▶ req-send ──▶ əvvəl yazmış digər iştirakçılara bildiriş ──────▶ FCM
5. Bildirişə klik → saytda #/requests/<id> açılır (yazışma səhifəsi, canlı yenilənir)
```

Əsas qaydalar:

- **Giriş + bildiriş şərti.** İstək yazmaq və cavab vermək üçün hesaba daxil olmaq **və bu cihazda bildirişləri açmaq** lazımdır. Şərt **serverdə** yoxlanılır (brauzeri dəyişməklə keçilmir): hesabına bağlı ən azı bir bildiriş cihazı olmalıdır. Bunu söndürmək üçün — 2-ci bölmədə `REQUESTS_REQUIRE_PUSH=0`.
- **Yazışma hamıya açıqdır.** İstəyi və cavabları qonaqlar da oxuya bilər; yazmaq üçün giriş lazımdır.
- **Kimə bildiriş gedir?**
  - Başqası cavab yazanda → **istək sahibinə**.
  - İstək sahibi cavab yazanda → **əvvəl yazmış digər iştirakçılara** (hər birinə bir dəfə). Köməkçilər bir-birinə bildiriş göndərmir.
  - Müəllifin özünə heç vaxt getmir. Bildiriş uğursuz olsa belə mesaj itmir.
- **Faylların növü məhduddur:** `pdf, doc, docx, ppt, pptx, xls, xlsx, txt, png, jpg, jpeg, webp`. Video, arxiv (zip/rar), icra olunan fayl, `svg`/`html` **qəbul olunmur**. Hər mesajda ən çox **3 fayl**, hər biri ən çox **10 MB**.
- **Fayl əsl növünə görə yoxlanılır.** Yalnız uzantıya baxılmır: server faylın ilk baytlarını oxuyur (məs. `.pdf` faylı `%PDF-` ilə başlamalıdır). `exe` faylını adını dəyişib `pdf` kimi göndərmək alınmır, belə fayl R2-dən silinir.
- **Silmək:** istifadəçi öz mesajını və öz istəyini silə bilər; admin istənilənini silə bilər. Mesaj/istək silinəndə onun faylları R2-dən də silinir.

## 1. Cloudflare R2

Fayllar R2-də saxlanılır. Brauzer faylı **birbaşa R2-yə** yükləyir (Vercel-in sorğu ölçüsü limitinə düşmür); server yalnız imzalı link verir və yoxlayır.

### 1.1. Bucket

Mövcud material PDF-lərinin bucket-indən **ayrı** bucket yaratmağı məsləhət görürəm (məs. `unec-request-files`): beləliklə serverin açarı yalnız bu bucket-ə yaza bilir, materiallara toxuna bilmir.

1. Cloudflare Dashboard → **R2 object storage** → **Create bucket** → ad: `unec-request-files`.
2. Bucket-i aç → **Settings** → **Public access / Public Development URL (r2.dev)** → aktiv et. Sənə `https://pub-xxxxxxxx.r2.dev` formasında ünvan göstərəcək — bu **`R2_PUBLIC_BASE`**-dir (fayl linkləri bununla açılır).
   - `r2.dev` ünvanı sınaq/kiçik layihə üçündür. Sonradan **Custom domain** (məs. `files.unecstudentshub.com`) bağlayıb `R2_PUBLIC_BASE`-i dəyişə bilərsən; köhnə mesajlardakı linklər də işləməyə davam edir.

> İstəsən mövcud material bucket-indən də istifadə edə bilərsən (fayllar `request-files/` qovluğuna düşür). Onda `R2_BUCKET` həmin bucket-in adı olur və token həmin bucket-ə **yazma** icazəsi alır — məsləhət görmürəm.

### 1.2. CORS (mütləqdir)

Brauzer başqa domenə (R2) `PUT` göndərir, buna görə bucket CORS icazəsi verməlidir. Bucket → **Settings** → **CORS Policy** → **Add CORS policy** → **JSON** tabı → yapışdır → **Save**:

```json
[
  {
    "AllowedOrigins": ["https://unecstudentshub.com", "https://www.unecstudentshub.com"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"],
    "MaxAgeSeconds": 3600
  }
]
```

- `AllowedOrigins` yalnız sayt ünvanın olmalıdır (sonunda `/` və yol olmadan).
- Fayl **oxumaq** (link açmaq, şəkil göstərmək) üçün ayrıca CORS lazım deyil; yalnız yükləmə (`PUT`) üçün lazımdır.
- Yerli sınaq üçün (`http://localhost:8000`) müvəqqəti əlavə origin yaza bilərsən.

### 1.3. API token

1. **R2 object storage** səhifəsi → **Account Details** → **API Tokens** yanında **Manage** → **Create Account API token**.
2. **Permissions:** **Object Read & Write**.
3. **Specify bucket(s):** yalnız `unec-request-files`.
4. **Create** → açılan səhifədə **Access Key ID** və **Secret Access Key** görünür. Secret **yalnız bir dəfə** göstərilir, dərhal kopyala.
5. **Account ID**-ni R2 səhifəsinin sağ tərəfindən (və ya S3 API ünvanından: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`) götür.

## 2. Vercel mühit dəyişənləri

Vercel → layihə (`ericismyhero-github-io`) → **Settings → Environment Variables**:

| Dəyişən | Nə üçün | Qeyd |
| --- | --- | --- |
| `R2_ACCOUNT_ID` | **Yeni.** Cloudflare Account ID | Məcburi |
| `R2_ACCESS_KEY_ID` | **Yeni.** 1.3-dəki Access Key ID | Məcburi |
| `R2_SECRET_ACCESS_KEY` | **Yeni.** 1.3-dəki Secret Access Key | Məcburi, gizli saxla |
| `R2_BUCKET` | **Yeni.** Bucket adı (məs. `unec-request-files`) | Məcburi |
| `R2_PUBLIC_BASE` | **Yeni.** İctimai oxuma ünvanı (məs. `https://pub-xxxx.r2.dev`) | Verilməsə **mövcud material bucket-inin** ünvanı götürülür — ayrı bucket istifadə edirsənsə mütləq yaz |
| `R2_ENDPOINT` | İstəyə bağlı | Yalnız AB/US jurisdiksiyalı bucket üçün (məs. `<ACCOUNT_ID>.eu.r2.cloudflarestorage.com`) |
| `REQUESTS_REQUIRE_PUSH` | İstəyə bağlı | `0` yazsan, istək/cavab üçün **bildiriş açıq olmalıdır** şərti götürülür (giriş yenə lazımdır). Standart: şərt aktivdir |
| `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_API_KEY`, `FIREBASE_VAPID_KEY`, `ADMIN_SECRET_KEY`, `SITE_URL` | Mövcud | Push quraşdırmasından (bax `PUSH-SETUP.md`, 3-cü bölmə) |

Dəyişənləri əlavə etdikdən sonra **Redeploy** et. Dörd `R2_*` dəyişəndən biri çatmasa, sayt **yalnız mətn** göndərməyə icazə verir və "Fayl əlavə et" düyməsi gizlənir (xəta vermir).

## 3. Firestore təhlükəsizlik qaydaları (mütləqdir)

İndi bütün **yazma** əməliyyatları serverdən gedir (service account qaydaları keçir). Brauzer yalnız **oxuyur** (+ "Mən də axtarıram" və "Tapıldı et" əvvəlki kimi birbaşa yazılır). Firebase Console → Firestore → **Rules**:

```
match /databases/{database}/documents {

  match /material_requests/{id} {
    allow read: if true;
    // İstək yaratmaq və silmək yalnız serverdən (giriş + bildiriş şərti orada yoxlanılır)
    allow create, delete: if false;

    allow update: if request.auth != null && (
      // "Mən də axtarıram": yalnız öz uid-ni upvoterIds-ə əlavə edir və ya çıxarır
      (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['upvoterIds']) && (
         ( !(request.auth.uid in resource.data.upvoterIds)
           && request.resource.data.upvoterIds.size() == resource.data.upvoterIds.size() + 1
           && request.resource.data.upvoterIds.hasAll(resource.data.upvoterIds)
           && request.auth.uid in request.resource.data.upvoterIds )
         ||
         ( request.auth.uid in resource.data.upvoterIds
           && request.resource.data.upvoterIds.size() == resource.data.upvoterIds.size() - 1
           && resource.data.upvoterIds.hasAll(request.resource.data.upvoterIds)
           && !(request.auth.uid in request.resource.data.upvoterIds) )
      ))
      ||
      // "Tapıldı et": yalnız istəyin sahibi
      (resource.data.uid == request.auth.uid
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'fulfilledAt'])
        && request.resource.data.status == 'fulfilled')
    );

    // Yazışma: hamı oxuya bilər, yazmaq yalnız serverdən
    match /messages/{msgId} {
      allow read: if true;
      allow write: if false;
    }
  }

  // … mövcud qaydaların …
}
```

Qeydlər:

- `messages` üçün **`read: true`** olmasa yazışma səhifəsi "Cavablar yüklənə bilmədi" göstərir.
- `create, delete: if false` **vacibdir**: əks halda bilən istifadəçi Firestore-a birbaşa yazıb bildiriş şərtini və fayl yoxlamasını keçə bilər. Köhnə qaydan `create`-ə icazə verirdisə, **yeni saytı deploy etdikdən sonra** bunu dəyiş (köhnə sayt açıq qalan tab-lar "icazə yoxdur" alacaq — səhifəni yeniləmək kifayətdir).
- Əgər mövcud qaydalarında geniş `match /{document=**}` bloku varsa, bu `match`-lər **ondan əvvəl** olmalıdır. Rules Playground ilə yoxla.
- `push_tokens` və `push_log` qaydaları dəyişmir (`read, write: if false`).

## 4. Deploy

1. Bu yeniləmənin fayllarını repoya yüklə (GitHub-da fayl strukturunu qoruyaraq üzərinə yaz): `ai-vercel/lib/r2.js`, `ai-vercel/lib/threads.js` (yeni), `ai-vercel/lib/firestore.js`, `ai-vercel/lib/payments.js`, `ai-vercel/api/push.js`, `ai-vercel/api/admin-data.js`, sayt faylları (`index.html`, `scripts/…`, `styles/tools.css`), `admin-panel/index.html`.
2. `api/` qovluğunda hələ də **12 fayl** olmalıdır (Vercel Hobby limiti). Bu yeniləmə `api/`-yə yeni fayl **əlavə etmir**: yeni əməliyyatlar mövcud `api/push.js` içindədir.
3. Vercel → **Deployments** → son deploy **Ready** olmalıdır (R2 dəyişənlərini əlavə etdinsə **Redeploy** et).
4. Brauzerdə `https://ericismyhero-github-io.vercel.app/api/push` aç. Cavabda bunlar görünməlidir:
   ```json
   {"enabled":true,"vapidKey":"B…","requests":{"requirePush":true,"files":true,"maxFiles":3,"maxBytes":10485760,"types":["pdf","doc",…],"textMax":1000}}
   ```
   - `"files": false` → R2 dəyişənləri çatmır və ya Redeploy edilməyib.
   - `"requirePush": false` → push özü aktiv deyil (`FIREBASE_VAPID_KEY` yoxdur) və ya `REQUESTS_REQUIRE_PUSH=0`.
   - `"requests": null` → server `lib/threads.js`-i yükləyə bilməyib (fayl repoda yoxdur). Push özü bundan təsirlənmir.
5. Firestore qaydalarını (3-cü bölmə) **Publish** et.

## 5. Yoxlama (ardıcıllıqla)

İki hesab lazımdır: **A** (istək sahibi) və **B** (köməkçi). İkinci hesab üçün gizli pəncərə (Incognito) və ya başqa brauzer istifadə et.

1. **A:** saytda daxil ol → zəngdən/kartdan **bildirişləri aç** → *Material İstəkləri* → **Yeni istək yaz** → göndər. İstək siyahıda görünməlidir.
2. **Şərt yoxlaması:** çıxış et və ya bildirişləri söndür → "Yeni istək" / cavab sahəsində giriş və ya "Bildirişləri aç" xəbərdarlığı görünməli, "Göndər" bağlı olmalıdır.
3. **B:** daxil ol + bildirişləri aç → A-nın istəyində **Cavab yaz** → mətn yaz → **Fayl əlavə et** → PDF seç → Göndər.
4. **A-nın cihazına bildiriş gəlməlidir** ("Sənin istəyinə cavab gəldi"). Klik → saytda həmin istəyin yazışması açılmalıdır; fayl linki işləməlidir.
5. **A:** cavab yaz → **B-yə bildiriş** getməlidir ("İstək yazışmasında yeni mesaj").
6. Fayl qaydası: B `.mp4` və ya `.exe` seçəndə "Bu fayl növü qəbul olunmur" xəbərdarlığı çıxmalıdır.
7. **Admin panel** → *Material istəkləri* → həmin istəyi aç: mesajlar, istifadəçilərin emaili, fayllar və **hər mesaj üçün kimə bildiriş getdi və nəticəsi** (çatdı / qismən / çatmadı / aktiv cihaz yoxdur + xəta səbəbi) görünməlidir. *Bildirişlər* → **Son göndərişlər** cədvəlində eyni göndərişlər olmalıdır.

## 6. Admin paneldə gündəlik istifadə

**Material istəkləri** bölməsi:

- Siyahı: istək, istifadəçi, cavab sayı, upvote, status, son fəaliyyət. Üstündə ümumi say (istək / açıq / mesaj).
- **Bax** → istəyin təfərrüatı: istək sahibinin adı və emaili, bütün mesajlar (göndərənin emaili, rolu, vaxtı, fayllar) və hər mesajın altında **bildirişlər**: kimə (ad + email, "istək sahibi" / "əvvəl yazan"), neçə cihaza getdi, neçəsi çatdı, köhnə token silindimi, xəta kodu (`UNREGISTERED`, `UNAVAILABLE`, …). Alıcının aktiv cihazı yoxdursa "Aktiv cihaz yoxdur" yazılır.
- **Sil** (mesaj) və **İstəyi sil** — uyğunsuz məzmun üçün. Fayllar da R2-dən silinir. Geri qaytarmaq olmur.

**Bildirişlər → Son göndərişlər:** əl ilə göndərilənlər (*Əl ilə*) və istək yazışmasına görə avtomatik gedənlər (*İstək cavabı*) bir yerdə; "İstəyə bax" həmin istəyin təfərrüatını açır.

## 7. Limitlər

| Nə | Limit |
| --- | --- |
| İstəyin mətni | 300 simvol (əvvəlki kimi) |
| Cavabın mətni | 1000 simvol |
| Fayl sayı | mesajda ən çox 3 |
| Fayl ölçüsü | ən çox 10 MB |
| Bir istəkdə mesaj sayı | 300 (dolanda "yazışma doludur") |
| Yazma sürəti | bir istifadəçi bir istəkdə dəqiqədə 5 mesaj |
| İstək yaratma | bir istifadəçi saatda 5 istək |
| Yükləmə linkinin ömrü | 10 dəqiqə |

Limitlər `ai-vercel/lib/threads.js`-in əvvəlindəki `LIMITS` və `FILE_TYPES`-dadır.

## 8. Məxfilik və təhlükəsizlik

- **Yazışma hamıya açıqdır**: istifadəçinin **profil adı** (saytdakı ad) istəkdə və cavablarda görünür. **Email** yalnız admin paneldə görünür, Firestore-dakı istək/mesaj sənədlərində saxlanmır.
- **Fayl linkləri ictimaidir**: hər fayla təxmin edilməsi mümkün olmayan uzun ünvan verilir (`request-files/<istək>/<istifadəçi>/<32 simvol>.<uzantı>`), amma linki bilən hər kəs açır və yazışmanı görən hər kəs linkləri görür. İstifadəçilərə **şəxsi sənəd (pasport, şəxsiyyət vəsiqəsi və s.) yükləməməyi** xatırlat.
- Faylın növü yükləmə linkinə **imzalanır** (başqa növlə yükləmək olmur), yazışmaya əlavə olunmazdan əvvəl isə server əsl məzmunu yoxlayır. Şəkillər `image/*` kimi, sənədlər öz növü ilə təqdim olunur; HTML/SVG/JS yükləmək mümkün deyil.
- Yalnız **daxil olmuş** istifadəçi yaza bilər; server hər sorğuda Firebase `idToken`-i yoxlayır. İstifadəçi yalnız **öz** mesajını/istəyini silə bilər.
- Mətn brauzerdə həmişə **mətn kimi** göstərilir (HTML icra olunmur); linklər yalnız `https://` olarsa açılır.

## 9. Məhdudiyyətlər

- **Yüklənib göndərilməyən fayllar R2-də qala bilər.** İstifadəçi fayl seçib yüklənməsi bitəndən sonra göndərməsə (səhifəni bağlasa, xəta olsa), fayl `request-files/<istək-id>/…` qovluğunda qalır. Bunlar kiçik və az olur; istəsən R2 Dashboard-dan həmin qovluğu vaxtaşırı təmizlə. (Mesaja bağlı fayllar mesajla birlikdə silinir.)
- **Bildiriş şərti** bildirişi aça bilməyən istifadəçiləri (məs. iPhone-da sayt ana ekrana əlavə edilməyibsə, köhnə brauzer) yazmaqdan saxlayır — onlar oxuya bilər. Bu sənin seçimin deyilsə `REQUESTS_REQUIRE_PUSH=0` yaz.
- Admin siyahısı ən çox 500 istəyi, bir istəyin təfərrüatı ən çox 1000 mesajı göstərir (yazışma limiti 300 olduğundan praktikada bu kifayətdir).
- Realtime oxuma Firestore-un pulsuz limitinə (oxuma sayı) hesablanır: hər açıq yazışma səhifəsi mesajları dinləyir.

## 10. Problemlərin həlli

| Əlamət | Səbəb / həll |
| --- | --- |
| "Fayl yüklənmədi" toast-ı, brauzer konsolunda **CORS** xətası | R2 bucket-də CORS siyasəti yoxdur və ya `AllowedOrigins` sayt ünvanınla üst-üstə düşmür (1.2). `PUT` və `Content-Type` icazəsi olmalıdır. |
| Yükləmədə **403 / SignatureDoesNotMatch** | `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID` və ya `R2_BUCKET`-də səhv/boşluq; token həmin bucket-ə **Object Read & Write** verməyib; link 10 dəq.-dən çox əvvəl alınıb. Dəyişəndən sonra **Redeploy** etdinmi? |
| "Fayl əlavə et" düyməsi görünmür / "Fayl əlavə etmək hazırda mümkün deyil" | `/api/push` cavabında `"files": false` — R2 dəyişənləri çatmır (4-cü bölmə, 4-cü addım). |
| Fayl yüklənir, amma göndərəndə "Fayl yüklənmədi" (`attachment_missing`) | Yükləmə əslində alınmayıb (CORS/şəbəkə) və ya bucket adı səhvdir. |
| "Faylın məzmunu növünə uyğun gəlmir" | Faylın uzantısı ilə əsl növü fərqlidir (məs. şəkil `.pdf` adlandırılıb). Düzgün faylı seç. |
| Şəkil/fayl linki açılmır (401/403/404) | Bucket-də ictimai giriş (r2.dev) aktiv deyil və ya `R2_PUBLIC_BASE` səhvdir. |
| Yazışmada "Cavablar yüklənə bilmədi" | `messages` üçün Firestore qaydası yoxdur (3-cü bölmə). |
| Bildiriş açıq olduğu halda "bildirişlər açıq olmalıdır" | Cihaz hesaba bağlanmayıb (bildirişi giriş etməmişdən açıbsa). Sayt göndərməzdən əvvəl avtomatik bağlayır; alınmırsa kartda bildirişləri söndürüb yenidən aç. `push_tokens`-də həmin cihazın `uid` sahəsi olmalıdır. |
| İstək sahibinə bildiriş getmir | Admin paneldə mesajın altında nəticəyə bax: "Aktiv cihaz yoxdur" → istək sahibi bildirişləri açmayıb/söndürüb; `UNREGISTERED` → köhnə token (özü silinir); `PERMISSION_DENIED` → `PUSH-SETUP.md`, 2-ci bölmə. |
| "Çox tez göndərirsən" / "Çox istək yazdın" | Limitlər (7-ci bölmə). Bir az gözləmək kifayətdir. |
| `module_load_failed` / `"requests": null` | `ai-vercel/lib/threads.js` və ya `lib/r2.js` repoda yoxdur / sintaksis xətası. Vercel → Logs-a bax. Push abunəsi və əl ilə göndəriş bundan təsirlənmir. |
| Deploy "No more than 12 Serverless Functions" xətası | `ai-vercel/api/` qovluğunda 12-dən çox fayl var. Bu yeniləmə yeni fayl əlavə etmir; artıq/köhnə faylı sil. |

## 11. Sonrakı addımlar (istəyə bağlı)

- Bildirişləri açmış, amma çox yazan istifadəçilər üçün **hesabat/şikayət** düyməsi (uyğunsuz mesajlar üçün) və ya admin siyahısında şikayət sayğacı.
- Yükləmə tamamlanmayan faylları təmizləmək üçün planlı iş (R2 siyahılama + Firestore ilə müqayisə).
- Oxunmamış cavab sayğacı (istək kartında).
