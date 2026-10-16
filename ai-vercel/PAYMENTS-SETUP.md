# Ödəniş sistemi — quraşdırma və istifadə qaydası

Bu sənəd **Dəstək** ekranındakı onlayn ödəniş sisteminin necə işlədiyini, test rejimində necə yoxlanacağını və real bank şlüzünə (məsələn, Epoint) necə qoşulacağını izah edir.

> **Qısa vəziyyət:** bütün kod hazırdır və **test rejimində** işləyir. Real ödəniş üçün bank şlüzü ilə müqavilə və onun açarları lazımdır — onlar olmadan sayt avtomatik olaraq köhnə üsullara (Birbank / m10 / QR) qayıdır. Heç nə sınmır.

---

## 1. Necə işləyir

```
İstifadəçi (brauzer)                Vercel (ai-vercel)                     Şlüz (Epoint)
────────────────────                ──────────────────                     ─────────────
Məbləğ + ad + görünüş seçir
        │  POST /api/payment-create
        ├──────────────────────────► sifariş yaradır (Firestore: donations, status=pending)
        │                            şlüzdən ödəniş linki istəyir ───────► link qaytarır
        │ ◄───── redirectUrl ────────┤
        │
        ├── şlüzün təhlükəsiz səhifəsinə keçir (kart məlumatı BURADA daxil edilir) ──► ödəniş
        │                                                                              │
        │                            POST /api/payment-callback  ◄───────────────────┤ (server → server, imzalı)
        │                            imzanı yoxlayır, sifarişi paid/failed edir,
        │                            real ödənişdirsə supporters-ə yazır
        │
        │ ◄── şlüz istifadəçini /?order=UNEC-…#/support ünvanına qaytarır
        │  GET /api/payment-status?order=…  (bir neçə saniyə ərzində yoxlayır)
        ├──────────────────────────► serverdəki vəziyyəti qaytarır → "Təşəkkür edirik!"
```

Əsas prinsiplər:

* **Kart məlumatı saytdan və serverimizdən keçmir.** İstifadəçi ödənişi bankın öz səhifəsində edir.
* **Nəticəyə yalnız serverdəki sifariş vəziyyətinə görə inanılır.** `?order=` yalnız sifariş nömrəsidir; URL-ə `success` yazmaqla heç nə "ödənilmiş" olmur.
* **Callback imzalanır.** İmza yanlışdırsa sorğu rədd edilir. Eyni callback təkrar gəlsə, heç nə dəyişmir (idempotent).
* **Məbləğ uyğunsuzluğu** (şlüz sifarişdəkindən fərqli məbləğ təsdiqləsə) `paid` yox, `review` (əl ilə baxış) statusu alır.
* Məbləğlər serverdə **qəpiklə (tam ədəd)** saxlanır; üzən nöqtə xətası yoxdur.

## 2. İstifadəçi nə görür

| | |
| --- | --- |
| **Məbləğ** | 3 / 5 / 7 / 10 ₼ hazır düymələri və ya istənilən məbləğ (standart 1–500 ₼, 2 onluq rəqəmə qədər) |
| **Ad** | İstəyə bağlı (maks. 40 simvol). Daxil olmuş istifadəçinin adı avtomatik doldurulur |
| **Görünüş** | Ödəyən seçir: **Ad və məbləğ** · **Yalnız ad** · **Anonim** (standart — anonim) |
| **Dəstəkçilər** | İctimai siyahı. Yalnız ödəyənin icazə verdiyi məlumat göstərilir |
| **Töhfələrim** | Daxil olmuş istifadəçi öz ödənişlərini və ümumi məbləği görür |
| **Qonaq** | Daxil olmadan da ödəmək olar; ödəniş hesaba bağlanmır (Töhfələrim-də görünmür) |

Şlüz aktiv olmayanda (və ya server əlçatmaz olanda) Dəstək ekranı köhnə Birbank / m10 / QR üsullarını göstərir, yan paneldəki Dəstəkçilər/Töhfələrim gizlənir, dəstək bildirişi (toast) də köhnə düymələri saxlayır.

## 3. Test rejimində yoxlamaq (müqavilə olmadan)

Vercel → **Settings → Environment Variables**:

```
PAYMENT_PROVIDER = test
```

`FIREBASE_SERVICE_ACCOUNT` və `FIREBASE_API_KEY` layihədə artıq var (redeem-code və firebase-config üçün). Dəyişəni əlavə etdikdən sonra **Redeploy** et.

Nəticə: Dəstək ekranında **TEST** nişanı və sarı xəbərdarlıq görünür. "Ödəniş et" basanda banka yönləndirmə əvəzinə **"Uğurlu ödəniş / Uğursuz ödəniş"** simulyasiya paneli açılır. Bunlar yoxlanılır: sifariş yaradılması, nəticənin tətbiqi, qayıdış mesajı, Töhfələrim (TEST nişanı ilə).

Test rejiminin qaydaları:

* Real pul çıxmır.
* Test ödənişləri **heç vaxt** ictimai Dəstəkçilər siyahısına düşmür və "Ümumi töhfə"yə daxil edilmir.
* ⚠️ Test rejimini **real saytda uzun müddət açıq saxlama**: istənilən adam saxta "ödəniş" edə bilər (heç nə yazılmır/ödənilmir, amma sayt "TEST" göstərir və Firestore-da `donations` sənədləri yığılır).

Test rejimini söndürmək üçün `PAYMENT_PROVIDER` dəyişənini sil (və ya boş burax) — sayt köhnə üsullara qayıdır.

## 4. Real şlüzə keçid (Epoint)

Kod Epoint-in rəsmi "API Epoint" sənədinə görə yazılıb (`lib/providers.js`). Başqa şlüz seçsən (məsələn, başqa bankın eKomm/hosted-checkout həlli), eyni qaydada `providers.js`-ə yeni adapter əlavə olunur — qalan hissə dəyişmir.

### 4.1. Addımlar

1. **Epoint ilə müqavilə bağla** və merchant hesabı aç (hüquqi tələblər üçün 7-ci bölməyə bax).
2. Merchant panelindən **public key** və **private key** götür.
3. Merchant panelində **result URL** olaraq bunu göstər (Vercel domeninin özünü yaz):
   ```
   https://<sənin-vercel-layihən>.vercel.app/api/payment-callback
   ```
4. Vercel → Environment Variables:
   ```
   PAYMENT_PROVIDER   = epoint
   EPOINT_PUBLIC_KEY  = <public key>
   EPOINT_PRIVATE_KEY = <private key>
   ```
   (`PAYMENT_PROVIDER=test` varsa, `epoint` ilə əvəz et.)
5. **Redeploy**.
6. 8-ci bölmədəki yoxlama siyahısını keç — **əvvəlcə 1 ₼ ilə real ödəniş et**.

### 4.2. Bütün mühit dəyişənləri

| Dəyişən | Məcburi? | İzah |
| --- | --- | --- |
| `PAYMENT_PROVIDER` | bəli | `test` və ya `epoint`. Boşdursa ödəniş söndürülüdür (köhnə üsullar göstərilir) |
| `EPOINT_PUBLIC_KEY`, `EPOINT_PRIVATE_KEY` | `epoint` üçün | Epoint merchant panelindən. **Private key heç vaxt frontend-ə və ya repoya yazılmır** |
| `FIREBASE_SERVICE_ACCOUNT` | bəli | Artıq mövcuddur (redeem-code də istifadə edir). Sifarişləri Firestore-a yazmaq üçün |
| `FIREBASE_API_KEY` | tövsiyə | Artıq mövcuddur. Daxil olmuş istifadəçinin ID token-ini yoxlayıb ödənişi hesaba bağlamaq üçün; yoxdursa ödənişlər qonaq kimi qeyd olunur |
| `SITE_URL` | xeyr | Şlüzdən qayıdış ünvanı. Standart: `https://unecstudentshub.com` |
| `PAYMENT_MIN_AZN` / `PAYMENT_MAX_AZN` | xeyr | Standart `1` / `500` |
| `PAYMENT_PRESETS` | xeyr | Hazır məbləğlər, vergüllə. Standart `3,5,7,10` (maks. 6 ədəd, hədlər daxilində) |

## 5. Firestore: təhlükəsizlik qaydaları və indekslər

Sifarişlər (`donations`) şəxsi məlumat (ad, uid) saxlayır; `supporters` yalnız server vasitəsilə oxunmalıdır. Server Firestore-a **service account** ilə yazır (qaydaları keçir), buna görə brauzerə bu kolleksiyalara **heç bir** birbaşa giriş vermək lazım deyil. Firebase Console → Firestore → **Rules** bölməsinə əlavə et (mövcud qaydaların içinə):

```
match /databases/{database}/documents {
  match /donations/{id}  { allow read, write: if false; }
  match /supporters/{id} { allow read, write: if false; }
  // … sənin mövcud qaydaların …
}
```

Əgər mövcud qaydaların "hər şeyə icazə" verən geniş bir `match /{document=**}` bloku varsa, yuxarıdakı iki `match` **ondan əvvəl** olmalıdır və yoxlamaq üçün Rules Playground-dan istifadə et. Bu addım **mütləqdir**: onsuz brauzerdən bu kolleksiyaları oxumaq mümkün ola bilər.

İndeks: əlavə **composite indeks tələb olunmur** (`supporters` yalnız `createdAt`-a görə, `donations` yalnız `uid`-ə görə sorğulanır).

### Məlumat modeli

`donations/{orderId}` — `orderId`, `provider`, `mode` (`test`/`live`), `status` (`pending` → `paid` | `failed` | `review`), `amount` (qəpik), `currency`, `uid` (qonaqdırsa `null`), `name`, `visibility`, `lang`, `transaction`, `rrn`, `failReason`, `createdAt`, `paidAt`, `updatedAt`.

`supporters/{orderId}` — yalnız **real** (`live`) və **ödənilmiş** sifarişlər üçün: `name` (anonimdə `null`), `amount` (yalnız "ad və məbləğ" seçilibsə), `anonymous`, `createdAt`. Kimin ödədiyini göstərən `uid` və ya sifariş detalları burada **yoxdur**.

## 6. Məxfilik

* **İctimai siyahıda** yalnız ödəyənin seçdiyi görünür. Anonim seçilibsə ad və məbləğ siyahıya heç yazılmır.
* **Şəxsi (yalnız server/admin üçün) `donations` sənədində** ad (yazılıbsa), uid (daxil olubsa), məbləğ və sifariş tarixçəsi saxlanır — hətta anonim görünüşdə də. Bu, mühasibat və mübahisəli ödənişlərin həlli üçündür.
* Kart nömrəsi, CVV və s. **heç yerdə saxlanmır** — onlar yalnız bankın səhifəsində daxil edilir.
* Şəxsi məlumatların saxlanması üçün sayta qısa **məxfilik qeydi** əlavə etmək məsləhətdir (hüquqi mətn bu paketə daxil deyil).

## 7. Şlüz tələb edə biləcək şeylər (mən yazmamışam)

Bank şlüzləri adətən aşağıdakıları tələb edir. Dəqiq siyahını seçdiyin şlüzdən öyrən — bu paketdə **yoxdur**:

* Qeydiyyatdan keçmiş hüquqi şəxs və ya fərdi sahibkar, bank hesabı.
* Saytda **ictimai oferta / ödəniş şərtləri**, **geri qaytarma (refund) siyasəti**, əlaqə məlumatı və xidmətin təsviri olan səhifə.
* Saytın texniki yoxlanması (HTTPS, domen, ödəniş düymələrinin və qaytarma səhifəsinin işləməsi).

Layihə hazırda **ianə/dəstək** xarakterlidir (qarşılığında məhsul yoxdur). Bunun şlüz və vergi baxımından necə qeyd olunacağını müqavilə mərhələsində şlüzlə və mühasiblə dəqiqləşdir. Mən bu mətnləri hüquqi məsləhət kimi yazmıram.

## 8. Canlıya çıxmazdan əvvəl yoxlama siyahısı

- [ ] Firestore qaydalarında `donations` və `supporters` üçün `allow … if false` var (5-ci bölmə)
- [ ] `PAYMENT_PROVIDER=epoint`, açarlar Vercel-də, **frontend-də və repoda yoxdur**
- [ ] Epoint panelində `result URL` = `…/api/payment-callback`
- [ ] Brauzerdə `…/api/payment-config` aç: `{"enabled":true,"mode":"live",…}` görünməlidir
- [ ] **1 ₼** real ödəniş: yönləndirmə → ödəniş → saytda "Təşəkkür edirik!" → Vercel logs-da `payment-callback` xətası yoxdur
- [ ] Firestore-da həmin `donations` sənədi `status: paid`; "ad və məbləğ" seçilibsə `supporters`-də görünür
- [ ] Anonim seçilmiş ödənişdə siyahıda ad/məbləğ **yoxdur**
- [ ] Uğursuz kart (bank imtina) → "Ödəniş tamamlanmadı"
- [ ] Ödənişi yarımçıq bağla → səhifəyə qayıdanda "Təsdiq hələ gəlməyib" və "Yenidən yoxla"
- [ ] Daxil olmuş hesabla ödə → "Töhfələrim"-də görünür
- [ ] Telefonda yoxla (390 px) və İngilis dilində bir dəfə bax

## 9. Məlum məhdudiyyətlər (dürüst siyahı)

* **Real Firestore və real Epoint ilə hələ sınaqdan keçməyib.** Backend 86 avtomatik yoxlama ilə **simulyasiya edilmiş** Firestore/Epoint-ə qarşı, ön tərəf isə 211 yoxlama ilə **stub server**ə qarşı sınanıb. Epoint sxemi rəsmi sənəddən yazılıb; ilk real 1 ₼ ödəniş mütləq lazımdır.
* **Statusun şlüzdən sorğulanması (reconciliation) yoxdur.** Callback gəlməsə (şəbəkə xətası və s.), sifariş `pending` qalır və istifadəçiyə "Təsdiq hələ gəlməyib" göstərilir. Belə sifarişləri Epoint panelindən yoxlayıb Firestore-da əl ilə `paid` etmək lazım ola bilər.
* **Sorğu limiti (rate limit) yoxdur.** Sifariş yaratma qonaqlara açıqdır; kimsə çoxlu `pending` sənəd yarada bilər (pul çıxmır, yalnız Firestore-da yer tutur). Lazım olsa Vercel Firewall / Upstash ilə limit əlavə olunur.
* **Geri qaytarma (refund) idarəsi yoxdur.** Geri qaytarmanı şlüz panelindən et və lazım gələrsə `supporters` sənədini əl ilə sil.
* `review` statusu (məbləğ uyğunsuzluğu) yalnız Firestore/Vercel logs-da görünür, avtomatik bildiriş yoxdur.
* İctimai siyahı və config CDN-də **60 saniyə** keşlənir (yeni ödəniş bir az gec görünə bilər).
* Premium "Yüksəlt" (kod ilə aktivləşdirmə) axını **ayrıdır** və bu sistemə toxunmur.

## 10. Problem həlli

| Əlamət | Səbəb / həll |
| --- | --- |
| Dəstək ekranında "Ödəniş xidməti əlçatmazdır" | `…/api/payment-config` cavab vermir və ya Vercel deploy olmayıb. Brauzerdə ünvanı aç |
| "Onlayn ödəniş tezliklə" | `PAYMENT_PROVIDER` boşdur və ya açarlar/`FIREBASE_SERVICE_ACCOUNT` yoxdur → `enabled:false` |
| Ödənişdən sonra "Təsdiq hələ gəlməyib" | Epoint `result URL` yanlışdır / callback çatmır. Vercel → Logs → `payment-callback` |
| Logda `invalid_signature` | `EPOINT_PRIVATE_KEY` yanlışdır (boşluq/sətir sonu) və ya başqa mühitin açarıdır |
| Logda `MƏBLƏĞ UYĞUNSUZLUĞU` | Şlüz fərqli məbləğ təsdiqləyib; sifariş `review` olub — Epoint panelindən yoxla |
| Brauzer konsolunda CORS xətası | Sayt `ALLOWED_ORIGINS` siyahısında olmayan domendən açılıb (`lib/payments.js`) |
