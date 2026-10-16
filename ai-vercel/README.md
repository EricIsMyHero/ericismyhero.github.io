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
