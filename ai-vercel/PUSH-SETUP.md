# Push bildirişlər — quraşdırma və istifadə

Bu sistem sayt **bağlı olanda belə** (telefon/kompüter kilidli, brauzer arxa planda) bildiriş icazəsi vermiş istifadəçilərə istədiyin vaxt bildiriş göndərməyə imkan verir. Admin panelində **Bildirişlər** bölməsindən göndərilir.

## 0. Necə işləyir

```
İstifadəçi (sayt)                        Server (Vercel)                      Google FCM
─────────────────                        ───────────────                      ──────────
1. "Aç" düyməsi → brauzer icazə soruşur
2. /sw.js qeydiyyatdan keçir, FCM token alır ───────────────────────────────▶ token
3. token ──▶ POST /api/push-subscribe ──▶ FCM-də yoxlayır, Firestore-a yazır
                                          (push_tokens kolleksiyası)

Admin panel ▶ POST /api/push-send ──────▶ tokenləri oxuyur ──▶ FCM HTTP v1 ──▶ cihaz
                                          ölü tokenləri silir                  │
Cihaz: sw.js "push" hadisəsi ◀─────────────────────────────────────────────────┘
       → bildiriş göstərilir → klikdə saytı açır
```

- Bildiriş **yalnız istifadəçi özü "Aç"a basanda** soruşulur (səhifə açılan kimi yox).
- Qonaqlar da abunə ola bilər. Daxil olmuş istifadəçinin cihazı hesabına bağlanır (konkret istifadəçiyə test göndərmək üçün); çıxış edəndə ayrılır.
- Mesajlar *data-only* göndərilir, bildirişi `sw.js` özü göstərir. Beləliklə Firebase SDK service worker-ə yüklənmir.

## 1. Firebase Console

1. [Firebase Console](https://console.firebase.google.com) → layihən → ⚙️ **Project settings** → **Cloud Messaging** tab.
2. **Firebase Cloud Messaging API (V1)** yanında **Enabled** yazmalıdır. Söndürülübsə `⋮` → *Manage API in Google Cloud Console* → **Enable**.
3. Aşağıda **Web configuration → Web Push certificates** → **Generate key pair**. Alınan uzun açar (adətən `B…` ilə başlayır) **VAPID public key**-dir. Bu açar gizli deyil, amma Vercel-ə dəyişən kimi əlavə edəcəyik.
4. Əgər Firebase **Web API Key**-ə Google Cloud Console → *APIs & Services → Credentials* bölməsində **API restrictions** qoymusansa, siyahıya bunları da əlavə et: **Firebase Installations API** və **FCM Registration API**. Yoxsa brauzerdə `messaging/token-subscribe-failed` xətası alacaqsan.

## 2. Service account icazəsi

`FIREBASE_SERVICE_ACCOUNT` artıq Vercel-də var (Firestore üçün). Firebase-in standart `firebase-adminsdk-…` service account-u adətən FCM göndərə bilir. Admin paneldə **PERMISSION_DENIED** görsən:

- Google Cloud Console → **IAM** → həmin service account-a **Firebase Cloud Messaging API Admin** (və ya *Firebase Admin SDK Administrator Service Agent*) rolunu ver;
- 1-ci bölmədəki **FCM API (V1)**-in aktiv olduğunu yenidən yoxla.

## 3. Vercel mühit dəyişənləri

Vercel → layihə → **Settings → Environment Variables**:

| Dəyişən | Nə üçün | Qeyd |
| --- | --- | --- |
| `FIREBASE_VAPID_KEY` | **Yeni.** 1-ci bölmənin 3-cü addımındakı public key | Yoxdursa push söndürülü qalır (`/api/push-subscribe` → `enabled:false`) |
| `FIREBASE_SERVICE_ACCOUNT` | Mövcud | Firestore + FCM göndərişi |
| `FIREBASE_API_KEY` | Mövcud | Daxil olmuş istifadəçinin tokenini yoxlamaq üçün |
| `ADMIN_SECRET_KEY` | Mövcud | Admin panelinin giriş kodu (push göndərişi də bununla qorunur) |
| `SITE_URL` | İstəyə bağlı | Bildirişdəki nisbi linklər üçün baza (standart `https://unecstudentshub.com`) |

Dəyişəni əlavə etdikdən sonra **Redeploy** et.

## 4. Firestore təhlükəsizlik qaydaları (mütləqdir)

Tokenlər şəxsi məlumatdır. Server service account ilə yazır (qaydaları keçir), brauzerə bu kolleksiyalara **heç bir** giriş vermə. Firebase Console → Firestore → **Rules**:

```
match /databases/{database}/documents {
  match /push_tokens/{id} { allow read, write: if false; }
  match /push_log/{id}    { allow read, write: if false; }
  // … mövcud qaydaların …
}
```

Əgər mövcud qaydalarında geniş `match /{document=**}` bloku varsa, yuxarıdakı iki `match` **ondan əvvəl** olmalıdır. Rules Playground ilə yoxla.

## 5. Deploy

Dəyişən fayllar:

| Fayl | Nə dəyişdi |
| --- | --- |
| `sw.js` | `push` və `notificationclick` işləyiciləri (keş yoxdur) |
| `scripts/push.js` *(yeni)* | "Aç/Söndür" düyməsi, FCM token, serverə qeyd |
| `index.html` | Firebase Messaging SDK, `push.js`, yeniliklər və ayarlar panelində kart, məxfilik bəndi |
| `scripts/i18n-app.js`, `styles/tools.css` | AZ/EN mətnlər və kartın görünüşü |
| `admin-panel/index.html` | **Bildirişlər** bölməsi |
| `ai-vercel/api/push-subscribe.js`, `ai-vercel/api/push-send.js`, `ai-vercel/lib/push.js` *(yeni)* | Abunə və göndəriş API-si |
| `ai-vercel/lib/firestore.js` | FCM scope-u, `setDoc` / `deleteDoc` / `listDocs` |
| `ai-vercel/vercel.json` | `push-send` üçün 60 saniyə vaxt limiti |

Repo-ya push et: GitHub Pages saytı, Vercel isə `ai-vercel`-i əvvəlki kimi yeniləyir.

## 6. Yoxlama (ardıcıllıqla)

1. Brauzerdə `https://ericismyhero-github-io.vercel.app/api/push-subscribe` aç → `{"enabled":true,"vapidKey":"B…"}` görünməlidir. `enabled:false` olarsa 3-cü bölməni yoxla.
2. Saytı **Ctrl+F5** ilə yenilə (köhnə JS keşdə qalmasın) → yuxarıdakı 🔔 → **Aç** → brauzerin icazə sorğusunda **İcazə ver**. "Bildirişlər aktiv edildi" yazısı çıxmalıdır.
3. Admin panel → **Bildirişlər** → "Abunəçi cihaz" sayı 1 olmalıdır.
4. **İlk test özünə:** saytda hesabınla daxil ol → Kimə: *Konkret istifadəçi* → öz email-ini yaz → başlıq/mətn yaz → **Göndər**. Bildiriş gəlməlidir.
5. Klik et → sayt (və ya yazdığın link) açılmalıdır.
6. Hər şey işləyirsə, *Hamıya* seçib göndərə bilərsən. Göndərməzdən əvvəl **"Neçə cihaza gedəcək?"** düyməsi sayı göstərir; **Göndər** ayrıca təsdiq istəyir.

## 7. Gündəlik istifadə

Admin panel → **Bildirişlər**:

- **Başlıq** (80 simvola qədər) və **Mətn** (240) — düz mətndir, HTML yazma.
- **Klik linki** boş olarsa ana səhifə açılır. Yaza bilərsən: `#/requests`, `/yol`, `https://unecstudentshub.com/...` və ya `https://t.me/...` (başqa domenlər qəbul edilmir).
- **Kimə:** hamı / yalnız Azərbaycan dilini seçənlər / yalnız English / konkret istifadəçi (email ilə).
- Nəticə: *Göndərildi / Uğursuz / Köhnəlmiş token silindi*. Hər göndəriş Firestore-da `push_log` kolleksiyasında qeyd olunur.

Tövsiyələr: tez-tez göndərmə (istifadəçilər icazəni ləğv edər), qısa və konkret yaz, hər bildirişdə link ver.

## 8. Platforma qeydləri

- **Chrome / Edge / Firefox** (kompüter və Android): işləyir.
- **iPhone/iPad (iOS 16.4+):** yalnız sayt **Ana ekrana əlavə edildikdə** (Paylaş → *Ana ekrana əlavə et*) və oradan açıldıqda. Adi Safari tabında push yoxdur — sayt bu halda istifadəçiyə təlimat göstərir. `manifest.json`-da `display: standalone` artıq var.
- **Safari (macOS 13+):** işləyir.
- **Brave:** *Settings → Privacy → Use Google services for push messaging* aktiv olmalıdır.
- İstifadəçi brauzerdə icazəni bloklayıbsa sayt yalnız "brauzer parametrlərindən aç" deyə bilər; icazəni koddan yenidən soruşmaq mümkün deyil.

## 9. Məhdudiyyətlər və böyümə

- Bir göndəriş eyni anda 25 sorğu ilə gedir və **50 saniyədən** sonra yeni sorğu başlatmır (Vercel limiti). Minlərlə cihaz üçün bu kifayətdir. Qismən göndəriş olarsa admin paneli bunu qırmızı xəbərdarlıqla göstərir — eyni bildirişi təkrar göndərmə (artıq alanlara da gedər).
- Dəfələrlə on minlərlə cihaza çatsan, FCM **topic** abunəliyinə və ya növbə sisteminə keçmək lazım olacaq.
- Köhnəlmiş/silinmiş tokenlər göndəriş zamanı avtomatik təmizlənir. Sayt aktiv abunəliyi hər 7 gündən bir serverdə təzələyir.
- `/api/push-subscribe` açıq endpoint-dir, amma uydurma token bazaya düşmür: hər token əvvəlcə FCM-də `validate_only` ilə yoxlanır.

## 10. Problemlərin həlli

| Əlamət | Səbəb / həll |
| --- | --- |
| Sayt "Bildirişləri aktiv etmək alınmadı" deyir | Brauzer konsolunda xətaya bax. `push_disabled` → 3-cü bölmə; `messaging/token-subscribe-failed` → 1-ci bölmənin 4-cü addımı (API restrictions) və VAPID açarının **eyni Firebase layihəsindən** olması |
| Admin paneldə *"Push aktiv deyil"* | `FIREBASE_VAPID_KEY` və ya `FIREBASE_SERVICE_ACCOUNT` yoxdur, ya da dəyişəndən sonra Redeploy edilməyib |
| `PERMISSION_DENIED` | 2-ci bölmə |
| `SENDER_ID_MISMATCH` | Token başqa Firebase layihəsinin VAPID açarı ilə alınıb; açarı yoxla (belə tokenlər avtomatik silinir) |
| "Göndərildi" yazır, amma bildiriş görünmür | İşletim sisteminin *Rahatsız etmə / Focus Assist* rejimi, brauzerin sayt bildirişi parametri, Android-də batareya qənaəti. Chrome-da `chrome://serviceworker-internals` və DevTools → Application → Service Workers |
| `sw.js` köhnə qalır | DevTools → Application → Service Workers → **Unregister**, səhifəni yenilə |
| `Uğursuz: … INTERNAL / UNAVAILABLE` | FCM-in müvəqqəti xətası; token silinmir, bir az sonra yenidən göndər |

## 11. Məxfilik

Serverdə saxlanılan: FCM token, dil (`az`/`en`), daxil olubsa `uid`, yaradılma/yenilənmə vaxtı. İstifadəçi **Söndür** düyməsinə basanda token silinir. `index.html`-dəki məxfilik siyasətinə uyğun bənd əlavə edilib (Cloud Messaging də xidmətlər siyahısındadır).

## 12. Sonrakı addımlar (istəyə bağlı)

- **Avtomatik bildiriş:** Telegram kanalında yeni post çıxanda push (Vercel Cron + `lib/push.js`-in `sendMany`-si).
- **Planlı göndəriş:** admin paneldə tarix/saat seçimi.
- Fənn və ya kurs üzrə abunəlik (token sənədinə `topics` sahəsi).
