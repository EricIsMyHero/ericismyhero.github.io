# 🎓 UNEC Students Hub

An open-source student platform built for the UNEC community.

UNEC Students Hub is a modern web platform designed to centralize academic resources, productivity tools, and student services in one place. The project aims to enhance the daily university experience by providing fast, accessible, and community-driven solutions.

**Live site:** [unecstudentshub.com](https://unecstudentshub.com) · **Latest release:** [v1.0.15](https://github.com/EricIsMyHero/ericismyhero.github.io/releases/latest)

This platform is independently developed and is not affiliated with UNEC or any official institution.

---

## Project Structure

```
ericismyhero.github.io/
│
├── index.html                  ← Main application
├── pdfs.js                     ← Exam materials index
├── manifest.json               ← Progressive Web App configuration
├── ads.txt                     ← Advertising configuration
├── LICENCE
├── README.md
│
├── scripts/                    ← Application logic
│   ├── i18n.js                 ← Centralized translation system (AZ / EN)
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
├── styles/                     ← Stylesheets
│   ├── base.css
│   ├── components.css
│   ├── features.css
│   ├── curriculum.css
│   ├── gpa.css
│   ├── dashboard.css
│   ├── timer.css
│   ├── requests.css
│   ├── ratings.css
│   └── chat.css
│
├── images/                     ← Project assets
│   ├── favicon.ico / .svg / -16.png / -32.png
│   ├── apple-touch-icon.png
│   ├── icon-192.png
│   ├── icon-512.png
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

* 📚 Exam Materials Library
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
* 🌙 Responsive Interface
* ⚡ Fast Performance

Currently: **56 subjects**, **114 exam materials**, and **15 majors** in the curriculum planner.

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

For AI functionality, deploy the `ai-vercel` directory using Vercel.

---

## Adding a Major to the Curriculum Planner

1. Add the major's semesters to `CURRICULUM_DATA` in `scripts/curriculum.js`.
2. Add its official subject codes to `CURRICULUM_CODES` in the same file.
3. Add a button with a matching `data-spec` value to the specialty grid in `index.html`.
4. Add the major's name to both `az` and `en` in `scripts/i18n.js` and reference it with `data-i18n`.

---

## Roadmap

* UI & Layout Redesign *(next)*
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
