# 🎓 UNEC Students Hub

An open-source student platform built for the UNEC community.

UNEC Students Hub is a modern web platform designed to centralize academic resources, productivity tools, and student services in one place. The project aims to enhance the daily university experience by providing fast, accessible, and community-driven solutions.

**Live site:** [unecstudentshub.com](https://unecstudentshub.com) · **Latest release:** [v1.1.19](https://github.com/EricIsMyHero/ericismyhero.github.io/releases/latest)

This platform is independently developed and is not affiliated with UNEC or any official institution.

---

## Project Structure

```
ericismyhero.github.io/
│
├── index.html                  ← Main application
├── pdfs.js                     ← Exam materials index
├── manifest.json               ← Progressive Web App configuration
├── sw.js                       ← Service worker (shows push notifications; caches nothing)
├── CNAME                       ← Custom domain
├── robots.txt
├── sitemap.xml
├── ads.txt                     ← Advertising configuration
├── LICENCE
├── README.md
│
├── scripts/                    ← Application logic
│   ├── i18n.js                 ← Centralized translation system (AZ / EN)
│   ├── i18n-app.js             ← Strings of the redesigned interface (AZ / EN)
│   ├── app-core.js             ← App shell: hash router, navigation, menu drawer, bottom sheets, toasts
│   ├── app-materials.js        ← Courses list, filters, material cards and material detail
│   ├── app-screens.js          ← Home, "More" screen, news sheet, GPA stepper
│   ├── data-utils.js
│   ├── ui.js
│   ├── features.js
│   ├── pdf-loader.js
│   ├── curriculum.js           ← Curriculum data: 15 majors, subject codes
│   ├── gpa.js
│   ├── dashboard.js
│   ├── badges.js
│   ├── timer.js
│   ├── requests.js             ← Material requests: list, public reply thread (`#/requests/<id>`), file attachments, login + notifications gate
│   ├── payments.js             ← Support screen: online payment flow, supporters list, "My contributions"
│   ├── push.js                 ← Push notifications: opt-in card, device token (FCM), sync with the server
│   ├── splash.js               ← Launch splash controller (state machine: readiness, slow/failed states, cleanup)
│   ├── ratings.js
│   ├── chat.js                 ← AI assistant panel
│   └── firebase.js
│
├── styles/                     ← Stylesheets (loaded in this order)
│   ├── splash.css              ← Launch splash animation (first stylesheet; self-contained)
│   ├── base.css
│   ├── components.css
│   ├── features.css
│   ├── curriculum.css
│   ├── gpa.css
│   ├── dashboard.css
│   ├── chat.css
│   ├── ratings.css
│   ├── tokens.css              ← Design tokens (palette, type, spacing, radii)
│   ├── shell.css               ← Header, sidebar, bottom navigation, menu, sheets, buttons, chips
│   ├── screens.css             ← Home, Courses, material card & detail, GPA, More
│   ├── tools.css               ← Tests, Dashboard, Timer & Exams, Material Requests (list, threads, composer), Curriculum Planner
│   ├── support.css             ← Support screen and payment flow
│   └── legacy.css              ← Small adapters for the parts not redesigned yet (sign-in dialog, AI chat …)
│
├── images/                     ← Project assets
│   ├── favicon.ico / .svg / -16.png / -32.png
│   ├── apple-touch-icon.png
│   ├── icon-any-192.png / -512.png        ← PWA icons (transparent sticker; used by the manifest, `purpose: any`)
│   ├── icon-maskable-192.png / -512.png   ← PWA icons on #00152E, logo inside the safe zone (`purpose: maskable`)
│   ├── icon-192.png / -512.png / -1024.png ← Original cream-background logo (not referenced by the manifest any more)
│   └── og-image.png            ← Social preview image
│
├── admin-panel/
│   └── index.html              ← Administration dashboard (push sender + send history, material requests with threads, files and notification results)
│
├── ai-vercel/
│   ├── api/
│   │   ├── ask.js
│   │   ├── admin-data.js
│   │   ├── firebase-config.js
│   │   ├── redeem-code.js
│   │   ├── telegram-news.js    ← Latest posts of the Telegram channel for the news panel
│   │   ├── push.js             ← Web push + material request threads: subscribe / unsubscribe, req-create / req-send / file-url / delete (signed-in), stats / send / admin-* (admin) — one function
│   │   ├── payment-config.js · payment-create.js · payment-callback.js · payment-status.js
│   │   └── supporters.js · my-donations.js
│   ├── lib/                    ← Firestore REST client, payment providers (test, Epoint), shared payment logic, Web Push (FCM) helpers,
│   │                             request threads (`threads.js`), Cloudflare R2 client with AWS SigV4 (`r2.js`)
│   │
│   ├── package.json
│   ├── vercel.json
│   ├── PAYMENTS-SETUP.md       ← Payment setup guide (Azerbaijani)
│   ├── PUSH-SETUP.md           ← Push notification setup guide (Azerbaijani)
│   ├── REQUESTS-SETUP.md       ← Material request threads & file attachments setup guide (Azerbaijani)
│   └── README.md
│
└── data/
    └── subjects.json           ← Subject database
```

Exam materials (PDFs) are hosted on Cloudflare R2 and are not stored in this repository.

---

## Features

* 📚 Exam Materials Library — newest-first ordering, search, course chips, filters, favorites, clear links to each material's information page, and related PDFs grouped by subject and semester
* 🎓 Major Filter — select one or several majors to see the exam materials of their subjects
* 📝 Practice Tests — questions are read from the PDFs in the background (subjects appear as they load), 10–50 questions, timer, answer review with *All / Wrong / Skipped* filters
* 📊 GPA Calculator
* 📅 Curriculum Planner — 15 majors with subjects, subject codes, credits, hours, and absence limits; jump between semesters with one tap
* 📥 Material Request System — sign in and turn on notifications to post a request; anyone signed in can reply in a public thread under it, attaching files (PDF, Word, PowerPoint, Excel, TXT, images — no video, up to 3 files × 10 MB); the requester gets a push notification for every reply, and the other participants when the requester answers
* 🔔 News Panel — the latest 3 posts of the Telegram channel, plus fulfilled material requests
* 📣 Push Notifications — visitors opt in with one tap and get messages even when the site is closed; admins send them to everyone, to one language, or to one user from the admin panel
* ⏱️ Study Timer — Pomodoro (focus / short break / long break); keeps correct time even when the browser tab is in the background
* 🎯 Exam Countdown
* 💳 Support & Payments — pick an amount, pay on the bank gateway's secure page (no card data touches this site), and choose whether your name and amount appear in the public *Supporters* list; signed-in users also get *My contributions*. Runs in test mode until a payment gateway is connected, and falls back to the Birbank / m10 / QR options meanwhile
* 🤖 AI Assistant — retrieval-based answers, bilingual (AZ / EN)
* 🏆 Dashboard & Achievements — streaks, XP, badges
* 🌐 Bilingual Interface (AZ / EN)
* 🛠️ Admin Panel — including the push notification sender with send history, and the material requests with full threads, attachments and per-message notification results
* 📱 Progressive Web App (PWA)
* 📲 Mobile-first Interface — bottom navigation, slide-in menu and bottom sheets on phones; a sidebar on desktop
* 🎨 11 Color Themes with a light / dark switch
* 🌙 Responsive Interface
* ⚡ Fast Performance

Currently: **56 subjects**, **114 exam materials**, and **15 majors** in the curriculum planner.

---

## Interface Architecture

The interface is a single-page app without a framework. All screens live in `index.html` and are switched by a small hash router in `scripts/app-core.js`.

| Route | Screen |
| --- | --- |
| `#/home` | Home |
| `#/courses/subjects` · `#/courses/subjects/<course>` · `#/courses/subjects/<course>/<subject>` | Browse by subject — **the Courses section opens here** (a bare `#/courses` redirects to it) |
| `#/courses/all` · `#/courses?q=<text>` · `#/courses?course=<course>` · `#/courses?fav=1` | All materials (search, course chips, filter sheet); the query forms are used by search, the sidebar course list and Favorites |
| `#/m/<course>/<subject>/<file>` · `#/x/<course>/<file>` | Material detail (shareable link; `x` = extra materials) |
| `#/tests` · `#/gpa` · `#/curriculum` · `#/requests` · `#/timer` · `#/dashboard` | Tools |
| `#/requests/<id>` | A material request and its public reply thread (the link a push notification opens) |
| `#/support` · `#/more` | Support, account and settings |

* **Mobile (below 1024px):** top bar, 4-item bottom navigation (Home, Courses, Support, More), a slide-in menu and bottom sheets.
* **Desktop (1024px and above):** a persistent sidebar and the same content in a wider grid.
* **Design tokens** are defined once in `styles/tokens.css`. The older theme variables (`--bg`, `--surface`, `--accent` …) are bridged to them, so every color theme keeps working.
* **Subject material cards:** the display title, PDF icon, badges and rating stay on the card; the raw filename and direct open, download and favorite controls are removed from this view. A labeled **View details** link with an arrow opens the existing material information page, where the filename and file actions remain available. The card background also links to that page, while rating buttons keep their separate behavior. The new labels support both AZ and EN and update when the language changes.
* **Related materials:** the material information page shows other PDFs from the **same subject**, excluding the open file. On phones (below 768px), this is the only recommendation group. Tablets and desktops (768px and above) show a second column with materials from **other subjects in the same course and semester**, excluding files already listed for the current subject. Each group initially shows at most **3 cards**; **See all** expands any remaining cards in place, and **Show less** collapses the group again. Empty groups show a message instead of falling back to unrelated materials.
* **News panel:** `scripts/app-screens.js` asks `GET /api/telegram-news` (`ai-vercel/api/telegram-news.js`) for the latest 3 posts of the public Telegram channel `unecstudentshub`. The function reads the channel's public web preview (`t.me/s/<channel>`), so it works for public *channels* only; the channel name can be changed with the `TELEGRAM_CHANNEL` environment variable. Responses are cached for 5 minutes on the CDN and 10 minutes in the browser.
* **Launch splash:** `index.html` + `styles/splash.css` + `scripts/splash.js` show a short branded animation on the first visit (≈3.65 s: awakening → logo → network → brand reveal → dissolve) and a shorter one (≈1.6 s) for returning visitors. It is never shown on a refresh within the same session, within 30 minutes of the previous one, to search-engine crawlers, or without JavaScript. Force it with `?splash=full`, `?splash=short` or hide it with `?splash=off`. It leaves only when the animation, the DOM/first route, web fonts and the first Firebase auth state are all ready (each wait is capped); after 5 s it shows a “still loading” status, after 15 s (or if a core script fails to load) an error screen with *Try again* / *Continue anyway*. `prefers-reduced-motion` gets a static logo that fades out. The logo layers (`images/splash-*.webp`) are cut from the original `images/icon-1024.png` (transparent background, the tagline recolored white for the dark background); the logo is never redrawn in CSS. `manifest.json` uses `#00152E` for `background_color`/`theme_color` and dedicated icons (`icon-any-*` transparent, `icon-maskable-*` on the same navy) so the native launch screen of an installed PWA matches the splash; after changing the manifest an installed PWA may need to be reinstalled to pick up the new icons. Note: `tokens.css` zeroes animation/transition durations under reduced motion, so the splash overrides that for its own timing.
* **Support & payments:** `scripts/payments.js` talks to the `payment-*`, `supporters` and `my-donations` functions in `ai-vercel/`. Amounts are stored in qəpik (integers); the result shown after returning from the gateway is read from the server-side order (`?order=` is only an id); the gateway callback is signature-checked and idempotent; test-mode payments never reach the public list. If `GET /api/payment-config` reports `enabled: false` (or the server is unreachable) the screen shows the old Birbank / m10 / QR block. Setup, environment variables and the Firestore rules snippet: [`ai-vercel/PAYMENTS-SETUP.md`](ai-vercel/PAYMENTS-SETUP.md).
* **Push notifications:** `scripts/push.js` draws an opt-in card (`[data-push-box]`) in the news and settings sheets. The browser's permission prompt appears only after the visitor taps *Enable*; the script then registers `sw.js`, asks Firebase Cloud Messaging for a device token and sends it to `POST /api/push` (`ai-vercel/api/push.js`), which checks it with FCM (`validate_only`) and stores it in Firestore (`push_tokens`; signed-in users are linked by uid, the interface language is saved too). In **Admin panel → Bildirişlər** an admin writes a title, a text and an optional link and sends it to everyone, to one language, or to one user by email. Large audiences are sent in chunks (the server returns a `cursor` and the panel continues from it, so nobody gets a message twice), dead tokens are removed automatically and every send is logged in `push_log`. `sw.js` shows each push (data-only messages: `title`, `body`, `url`) and focuses or opens the site on click. iPhone / iPad (iOS 16.4+) receive push only from the site added to the Home Screen. The backend is a **single** serverless function: Vercel's Hobby plan allows at most 12 functions per deployment and `ai-vercel/api/` now has exactly 12, so a new endpoint has to be merged into an existing function. Needs the `FIREBASE_VAPID_KEY` environment variable (plus the existing `FIREBASE_SERVICE_ACCOUNT` and `ADMIN_SECRET_KEY`); without it push stays off. Setup, Firestore rules and troubleshooting: [`ai-vercel/PUSH-SETUP.md`](ai-vercel/PUSH-SETUP.md).
* **Material request threads:** `scripts/requests.js` lists requests from Firestore (`material_requests`) and opens a request at `#/requests/<id>`, where replies (`material_requests/<id>/messages`) update live. The browser only **reads**; every write goes through `POST /api/push` (`req-create`, `req-send`, `file-url`, `req-delete`, `msg-delete`), which verifies the Firebase `idToken`, requires at least one notification device linked to the account (switch off with `REQUESTS_REQUIRE_PUSH=0`), rate-limits, and sends the notifications. Files are uploaded by the browser straight to Cloudflare R2 through a short-lived presigned `PUT` link (the server signs it with AWS SigV4 in `ai-vercel/lib/r2.js`, no SDK); before a message is saved the server checks every file's size, type and real content (magic bytes) and deletes anything that does not match. Allowed types: `pdf doc docx ppt pptx xls xlsx txt png jpg jpeg webp`. The admin panel shows each thread with sender emails, files and, under every message, who was notified and whether it arrived. Needs the `R2_*` environment variables for attachments; setup, CORS, Firestore rules and troubleshooting: [`ai-vercel/REQUESTS-SETUP.md`](ai-vercel/REQUESTS-SETUP.md). The thread logic lives in `lib/threads.js`, which `api/push.js` loads lazily, so push keeps working even if that file is missing.
* **Material data** still comes from `pdfs.js`. PDFs are served from Cloudflare R2 and are opened or downloaded through `openFileUrl` / `downloadFileUrl` in `scripts/ui.js`. Direct downloads need CORS enabled on the R2 bucket; otherwise the file opens in a new tab.

---

## Technology Stack

```
HTML5
CSS3
JavaScript (ES6)
JSON
Progressive Web App
GitHub Pages
Cloudflare R2
Vercel Functions
Groq
Firebase
Firebase Cloud Messaging (Web Push)
DOMPurify
Formspree
Material Symbols
Google Fonts
Bank payment gateway (Epoint adapter)
```

---

## Local Development

Clone the repository.

```
git clone https://github.com/EricIsMyHero/ericismyhero.github.io.git
```

Run a local server.

```
# Python
python3 -m http.server 8080

# Node.js
npx serve .
```

Open:

```
http://localhost:8080
```

Screens are hash routes, for example `http://localhost:8080/#/courses/subjects` or `http://localhost:8080/#/gpa`.

For AI functionality, the Telegram posts in the news panel, online payments and push notifications, deploy the `ai-vercel` directory using Vercel. If the backend is unreachable the site keeps working: the panel falls back to the last cached posts or to a link to the channel.

---

## Material Addition Dates and Ordering

Materials use an `addedAt` timestamp in `pdfs.js`. All material lists, search results, favorites, extras and related-material groups show the newest additions first, before pagination or the three-card recommendation limit. Equal timestamps keep their existing catalog order; unknown dates are placed last. The source arrays and rating leaderboards keep their own order.

Historical dates are backed by [`data/material-history.json`](data/material-history.json), which records the source commit and path for each asset. Original tracked PDF uploads are used where their identity can be verified, following renames and distinguishing reused filenames. Re-uploading `pdfs.js`, changing a title or moving an entry between courses does not make an old PDF new. When no upload can be verified, the first catalog reference for that exact `pdf/` or `pdf-extra/` path is used and marked as such. Git cannot establish the original upload time of files stored only in Cloudflare R2.

For a new material, include its actual publication timestamp as `addedAt`, using ISO 8601 with a timezone (for example, `2026-10-30T15:00:00+04:00`). Keep that date when editing the material later. If the new entry is already committed, its first catalog commit can also supply the date. New uncommitted entries without a date are rejected by the sync tool rather than assigned today's date.

From the repository root, use a checkout with full Git history to sync the catalog and its provenance, then validate:

```sh
python3 tools/sync-material-dates.py
python3 tools/sync-material-dates.py --check
node --test tests/material-order.test.cjs
```

Review and commit both `pdfs.js` and `data/material-history.json` after syncing. This is a maintenance command; the static site does not query GitHub or need a build step to sort materials.

---

## Adding a Major to the Curriculum Planner

1. Add the major's semesters to `CURRICULUM_DATA` in `scripts/curriculum.js`.
2. Add its official subject codes to `CURRICULUM_CODES` in the same file.
3. Add a button with a matching `data-spec` value to the specialty grid in `index.html`.
4. Add the major's name to both `az` and `en` in `scripts/i18n.js` and reference it with `data-i18n`.
5. Map the major to its translation key in `MAJOR_I18N_KEYS` in `scripts/ui.js`, so the Courses filter shows the translated name.
6. Map the major to its translation key in `CURR_SPEC_KEYS` in `scripts/curriculum.js`, so the plan heading is translated too.

---

## Roadmap

* ✅ UI & Layout Redesign
* ✅ Redesign of the remaining older screens (Tests, Dashboard, Timer & Exams, Material Requests, Curriculum Planner)
* ✅ Support screen with an online payment flow *(test mode until a gateway contract is in place)*
* Redesign of the sign-in dialog *(next)*
* Payment gateway go-live (Epoint), offer / refund-policy page
* ✅ AI Study Assistant
* Student Marketplace
* Academic Calendar
* Internship Board
* Student Clubs
* Discussion Forum
* ✅ Notification System — web push notifications sent from the admin panel
* ✅ Material request replies — public threads with file attachments and notifications
* Cloud Synchronization
* Mobile Application
* Analytics Dashboard
* Student Profiles
* Community Events

---

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

Suggestions, bug reports, and feature requests are always appreciated.

---

## Disclaimer

UNEC Students Hub is an independent student project.

This platform is not officially associated with UNEC.

All educational materials belong to their respective authors. Copyrighted content will be reviewed and removed upon request.

---

## License

This project is released under the MIT License unless otherwise specified.
