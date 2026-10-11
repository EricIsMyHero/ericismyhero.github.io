# 🎓 UNEC Students Hub

An open-source student platform built for the UNEC community.

UNEC Students Hub is a modern web platform designed to centralize academic resources, productivity tools, and student services in one place. The project aims to enhance the daily university experience by providing fast, accessible, and community-driven solutions.

**Live site:** [unecstudentshub.com](https://unecstudentshub.com) · **Latest release:** [v1.1.0](https://github.com/EricIsMyHero/ericismyhero.github.io/releases/latest)

This platform is independently developed and is not affiliated with UNEC or any official institution.

---

## Project Structure

```
ericismyhero.github.io/
│
├── index.html                  ← Main application
├── pdfs.js                     ← Exam materials index
├── manifest.json               ← Progressive Web App configuration
├── sw.js                       ← Service worker
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
│   ├── requests.js
│   ├── ratings.js
│   ├── chat.js                 ← AI assistant panel
│   └── firebase.js
│
├── styles/                     ← Stylesheets (loaded in this order)
│   ├── base.css
│   ├── components.css
│   ├── features.css
│   ├── curriculum.css
│   ├── gpa.css
│   ├── dashboard.css
│   ├── chat.css
│   ├── ratings.css
│   ├── requests.css
│   ├── timer.css
│   ├── tokens.css              ← Design tokens (palette, type, spacing, radii)
│   ├── shell.css               ← Header, sidebar, bottom navigation, menu, sheets, buttons, chips
│   ├── screens.css             ← Home, Courses, material card & detail, GPA, More
│   └── legacy.css              ← Small adapters for the older screens (Tests, Dashboard, Timer …)
│
├── images/                     ← Project assets
│   ├── favicon.ico / .svg / -16.png / -32.png
│   ├── apple-touch-icon.png
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-1024.png
│   └── og-image.png            ← Social preview image
│
├── admin-panel/
│   └── index.html              ← Administration dashboard
│
├── ai-vercel/
│   ├── api/
│   │   ├── ask.js
│   │   ├── admin-data.js
│   │   └── firebase-config.js
│   │
│   ├── package.json
│   ├── vercel.json
│   └── README.md
│
└── data/
    └── subjects.json           ← Subject database
```

Exam materials (PDFs) are hosted on Cloudflare R2 and are not stored in this repository.

---

## Features

* 📚 Exam Materials Library — search, course chips, filters, favorites, and a shareable page for every material
* 🎓 Major Filter — select one or several majors to see the exam materials of their subjects
* 📝 Practice Tests
* 📊 GPA Calculator
* 📅 Curriculum Planner — 15 majors with subjects, subject codes, credits, hours, and absence limits
* 📥 Material Request System
* ⏱️ Study Timer
* 🎯 Exam Countdown
* 🤖 AI Assistant — retrieval-based answers, bilingual (AZ / EN)
* 🏆 Dashboard & Achievements — streaks, XP, badges
* 🌐 Bilingual Interface (AZ / EN)
* 🛠️ Admin Panel
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
| `#/courses` | All materials (search, course chips, filter sheet) |
| `#/courses/subjects` · `#/courses/subjects/<course>` · `#/courses/subjects/<course>/<subject>` | Browse by subject |
| `#/m/<course>/<subject>/<file>` · `#/x/<course>/<file>` | Material detail (shareable link; `x` = extra materials) |
| `#/tests` · `#/gpa` · `#/curriculum` · `#/requests` · `#/timer` · `#/dashboard` | Tools |
| `#/support` · `#/more` | Support, account and settings |

* **Mobile (below 1024px):** top bar, 4-item bottom navigation (Home, Courses, Support, More), a slide-in menu and bottom sheets.
* **Desktop (1024px and above):** a persistent sidebar and the same content in a wider grid.
* **Design tokens** are defined once in `styles/tokens.css`. The older theme variables (`--bg`, `--surface`, `--accent` …) are bridged to them, so every color theme keeps working.
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
DOMPurify
Formspree
Material Symbols
Google Fonts
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

Screens are hash routes, for example `http://localhost:8080/#/courses` or `http://localhost:8080/#/gpa`.

For AI functionality, deploy the `ai-vercel` directory using Vercel.

---

## Adding a Major to the Curriculum Planner

1. Add the major's semesters to `CURRICULUM_DATA` in `scripts/curriculum.js`.
2. Add its official subject codes to `CURRICULUM_CODES` in the same file.
3. Add a button with a matching `data-spec` value to the specialty grid in `index.html`.
4. Add the major's name to both `az` and `en` in `scripts/i18n.js` and reference it with `data-i18n`.
5. Map the major to its translation key in `MAJOR_I18N_KEYS` in `scripts/ui.js`, so the Courses filter shows the translated name.

---

## Roadmap

* ✅ UI & Layout Redesign
* Redesign of the remaining older screens (Tests, Dashboard, Timer) *(next)*
* ✅ AI Study Assistant
* Student Marketplace
* Academic Calendar
* Internship Board
* Student Clubs
* Discussion Forum
* Notification System
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
