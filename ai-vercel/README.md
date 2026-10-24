# UNEC AI Backend — Vercel Deploy

## Deploy Addımları

1. Bu qovluğu ayrıca GitHub repo kimi yüklə
2. [vercel.com](https://vercel.com) → **New Project** → repo connect et
3. **Environment Variables** bölməsində əlavə et:
   ```
   GEMINI_API_KEY = sənin_gemini_açarın
   ```
4. **Deploy** düyməsinə bas

## Gemini API Açarı Almaq

1. [aistudio.google.com](https://aistudio.google.com) → Get API Key
2. Pulsuz, qeydiyyat tələb edir

## Frontend Qoşma

`index.html`-dəki widget-də `VERCEL_URL`-i deploy sonrası alınan URL ilə əvəz et:
```js
const BACKEND_URL = "https://sənin-layihə.vercel.app";
```

## Endpoint

```
POST https://sənin-layihə.vercel.app/api/ask
Content-Type: application/json

{
  "question": "Mikroiqtisadiyyat nə öyrədir?",
  "context": "..."   // optional
}
```

## Teleqram yenilikləri — `GET /api/telegram-news`

Saytın "Yeniliklər" panelində və ana səhifədə Teleqram kanalının son 3 postunu göstərmək üçündür. Açıq kanalın veb önizləməsini (`https://t.me/s/<kanal>`) oxuyur — **API açarı və ya bot lazım deyil**.

```
GET https://sənin-layihə.vercel.app/api/telegram-news            → son 3 post
GET https://sənin-layihə.vercel.app/api/telegram-news?limit=5    → 1–5 arası post

{ "channel": "unecstudentshub",
  "posts": [ { "id": 38, "url": "https://t.me/unecstudentshub/38", "text": "…", "date": "2026-10-09T07:31:07.000Z" } ] }
```

- Kanal adı standart olaraq `unecstudentshub`-dır; dəyişmək üçün Vercel-də `TELEGRAM_CHANNEL` mühit dəyişənini təyin et.
- Yalnız **açıq kanallar** üçün işləyir (qrupların veb önizləməsi yoxdur). Mətni olmayan postlar (yalnız şəkil/video) və xidməti mesajlar ("kanal şəkli dəyişdi", "post sancıldı") buraxılır.
- Cavab CDN-də 5 dəqiqə keşlənir; Telegram cavab verməsə `502` qaytarılır və sayt öz keşindən / kanala keçiddən istifadə edir.
- Bu, Telegram-ın rəsmi API-si deyil: Telegram önizləmə HTML-ini dəyişsə, yalnız `api/telegram-news.js`-dəki `parse()` funksiyasını yeniləmək lazım olacaq.
- Deploydan sonra yoxla: brauzerdə `/api/telegram-news` aç — JSON görünməlidir.

## Ödəniş sistemi (Dəstək ekranı)

Dəstək ekranındakı onlayn ödənişin backend hissəsidir. **Tam quraşdırma, test rejimi və Epoint-ə keçid qaydası: [`PAYMENTS-SETUP.md`](PAYMENTS-SETUP.md).**

| Endpoint | Metod | Nə edir |
| --- | --- | --- |
| `/api/payment-config` | GET | Ödəniş aktivdirmi (`enabled`), rejim (`test`/`live`), hədlər, hazır məbləğlər. Gizli heç nə qaytarmır |
| `/api/payment-create` | POST | `{ amount, name?, visibility, lang?, idToken? }` → sifariş yaradır, şlüz yönləndirməsini (`redirectUrl`) qaytarır |
| `/api/payment-callback` | POST | Şlüzdən server→server nəticə (imza yoxlanılır, idempotentdir). Epoint panelində `result URL` budur |
| `/api/payment-status` | GET `?order=` | Sifarişin vəziyyəti: `pending` / `paid` / `failed` / `review` |
| `/api/supporters` | GET | İctimai "Dəstəkçilər" siyahısı (yalnız ödəyənin icazə verdiyi məlumat) |
| `/api/my-donations` | POST `{ idToken }` | Daxil olmuş istifadəçinin öz ödənişləri və ümumi məbləğ |

Mühit dəyişənləri: `PAYMENT_PROVIDER` (`test` / `epoint`; boşdursa söndürülüdür), `EPOINT_PUBLIC_KEY`, `EPOINT_PRIVATE_KEY`, istəyə bağlı `SITE_URL`, `PAYMENT_MIN_AZN`, `PAYMENT_MAX_AZN`, `PAYMENT_PRESETS`. Firestore üçün mövcud `FIREBASE_SERVICE_ACCOUNT`, istifadəçi tokenini yoxlamaq üçün `FIREBASE_API_KEY` istifadə olunur.

Fayllar: `lib/firestore.js` (Firestore REST + service account), `lib/providers.js` (şlüz adapterləri: `test`, `epoint`), `lib/payments.js` (ortaq məntiq).

> ⚠️ Firestore-da `donations` və `supporters` kolleksiyaları üçün brauzer girişi qadağan olunmalıdır (`allow read, write: if false`) — bax `PAYMENTS-SETUP.md`, 5-ci bölmə.

## Push bildirişlər

Sayt bağlı olanda belə, bildiriş icazəsi vermiş istifadəçilərə admin panelindən istənilən vaxt bildiriş göndərmək üçündür (Firebase Cloud Messaging). **Tam quraşdırma, yoxlama və problemlərin həlli: [`PUSH-SETUP.md`](PUSH-SETUP.md).**

| Endpoint | Metod | Nə edir |
| --- | --- | --- |
| `/api/push` | GET | `{ enabled, vapidKey }` — push aktivdirmi və public VAPID açarı |
| `/api/push` | POST | `{ action: 'subscribe', token, lang?, idToken? }` və ya `{ action: 'unsubscribe', token }` — saytdakı "Aç/Söndür" düyməsi |
| `/api/push` | POST | **Admin** (`X-Admin-Key`): `{ action: 'stats' }` və ya `{ action: 'send', title, body, url?, audience: 'all'\|'az'\|'en'\|'user', email?, dryRun?, after? }` — bir sorğu ~8 san. işləyir, cihaz çoxdursa `cursor` qaytarır (admin paneli onunla davam edir) |

> Push üçün **bir** serverless funksiya istifadə olunur (`api/push.js`): Vercel Hobby planında layihədə ən çoxu 12 funksiya ola bilər, `api/` qovluğuna yeni fayl əlavə etməzdən əvvəl sayı yoxla.

Mühit dəyişənləri: `FIREBASE_VAPID_KEY` (yeni), mövcud `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_API_KEY`, `ADMIN_SECRET_KEY`; istəyə bağlı `SITE_URL`.
Fayllar: `lib/push.js` (göndəriş məntiqi), `api/push.js`. İstəyə bağlı: `PUSH_DEADLINE_MS` (bir sorğuda göndərişə ayrılan vaxt, standart 8000).

> ⚠️ Firestore-da `push_tokens` və `push_log` kolleksiyaları üçün brauzer girişi qadağan olunmalıdır (`allow read, write: if false`) — bax `PUSH-SETUP.md`, 4-cü bölmə.

## Material istəkləri — yazışma və fayl əlavəsi

İstəyin altında hamıya açıq yazışma: cavab yazmaq, fayl (PDF, Word, şəkil və s.) əlavə etmək, istək sahibinə bildiriş. **Tam quraşdırma (Cloudflare R2, Firestore qaydaları, yoxlama, problemlərin həlli): [`REQUESTS-SETUP.md`](REQUESTS-SETUP.md).**

Hamısı mövcud **`/api/push`** funksiyasının içindədir (yeni fayl yoxdur — Hobby planında `api/` qovluğunda 12 funksiya limiti saxlanılır). Giriş tələb edən əməliyyatlar `idToken` (Firebase) ilə, admin əməliyyatları `X-Admin-Key` ilə qorunur.

| Əməliyyat (`action`) | Kim | Nə edir |
| --- | --- | --- |
| `req-create` | giriş | `{ text, course?, subject? }` — yeni istək (bildiriş açıq olmalıdır*) |
| `file-url` | giriş | `{ requestId, name, size }` — R2-yə birbaşa yükləmə üçün 10 dəq. etibarlı imzalı `PUT` linki |
| `req-send` | giriş | `{ requestId, text?, attachments?: [{ key, name }] }` — cavab; fayllar R2-də yoxlanılır, istək sahibinə (və ya sahibi yazanda əvvəlki iştirakçılara) bildiriş gedir |
| `req-delete`, `msg-delete` | giriş (öz məzmunu) | İstəyi / mesajı və fayllarını silir |
| `admin-requests`, `admin-request` | admin | İstək siyahısı / yazışma + istifadəçi emailləri + hər mesajın bildiriş nəticələri |
| `admin-req-delete`, `admin-msg-delete` | admin | İstənilən istəyi / mesajı silir |
| `admin-push-log` | admin | Son göndərişlər (əl ilə + istək cavabları) |

\* `REQUESTS_REQUIRE_PUSH=0` ilə bildiriş şərti söndürülür. `GET /api/push` cavabındakı `requests` sahəsi (`requirePush`, `files`, `maxFiles`, `maxBytes`, `types`, `textMax`) saytın hansı qaydaları göstərəcəyini bildirir.

Mühit dəyişənləri: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` (fayl əlavəsi üçün), `R2_PUBLIC_BASE`, `R2_ENDPOINT`, `REQUESTS_REQUIRE_PUSH` (istəyə bağlı).
Fayllar: `lib/threads.js` (yazışma məntiqi), `lib/r2.js` (Cloudflare R2 üçün AWS SigV4 imzası, kitabxanasız), `lib/firestore.js` (massiv/xəritə sahələri və atomik sayğac əlavə olunub).

> ⚠️ Firestore-da `material_requests` və `material_requests/{id}/messages` üçün qaydalar yenilənməlidir (yazma yalnız serverdən) — bax `REQUESTS-SETUP.md`, 3-cü bölmə.
