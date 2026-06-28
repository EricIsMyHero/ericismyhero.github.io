# 🎓 UNEC Students Hub

An open-source student platform built for the UNEC community.

UNEC Students Hub is a modern web platform designed to centralize
academic resources, productivity tools, and student services in one
place. The project aims to enhance the daily university experience by
providing fast, accessible, and community-driven solutions.

This platform is independently developed and is not affiliated with UNEC
or any official institution.

------------------------------------------------------------------------

# Project Structure

``` text
ericismyhero.github.io/
│
├── index.html                  ← Main application
├── manifest.json               ← Progressive Web App configuration
├── ads.txt                     ← Advertising configuration
├── LICENCE
├── README.md
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
├── data/
│   └── subjects.json           ← Subject database
│
├── pdf/
│   ├── *.pdf                   ← Main exam materials
│
├── pdf-extra/
│   ├── *.pdf                   ← Additional learning resources
│
├── images/
│   ├── *.png
│   └── *.jpg                   ← Project assets
│
├── icon-192.png
├── icon-512.png
└── apple-touch-icon.png
```

------------------------------------------------------------------------

# Features

-   📚 Exam Materials Library
-   📝 Practice Tests
-   📊 GPA Calculator
-   📅 Major Planner
-   📥 Material Request System
-   ⏱️ Study Timer
-   🎯 Exam Countdown
-   🤖 AI Assistant
-   🛠️ Admin Panel
-   📱 Progressive Web App (PWA)
-   🌙 Responsive Interface
-   ⚡ Fast Performance

------------------------------------------------------------------------

# Technology Stack

``` text
HTML5
CSS3
JavaScript (ES6)
JSON
Progressive Web App
GitHub Pages
Vercel Functions
Firebase
Formspree
Google Fonts
```

------------------------------------------------------------------------

# Local Development

Clone the repository.

``` bash
git clone https://github.com/EricIsMyHero/ericismyhero.github.io.git
```

Run a local server.

``` bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .
```

Open:

``` text
http://localhost:8080
```

For AI functionality, deploy the `ai-vercel` directory using Vercel.

------------------------------------------------------------------------

# Roadmap

-   AI Study Assistant
-   Student Marketplace
-   Academic Calendar
-   Internship Board
-   Student Clubs
-   Discussion Forum
-   Notification System
-   Cloud Synchronization
-   Mobile Application
-   Analytics Dashboard
-   Student Profiles
-   Community Events

------------------------------------------------------------------------

# Contributing

Contributions are welcome.

1.  Fork the repository.
2.  Create a feature branch.
3.  Commit your changes.
4.  Push your branch.
5.  Open a Pull Request.

Suggestions, bug reports, and feature requests are always appreciated.

------------------------------------------------------------------------

# Disclaimer

UNEC Students Hub is an independent student project.

This platform is not officially associated with UNEC.

All educational materials belong to their respective authors.
Copyrighted content will be reviewed and removed upon request.

------------------------------------------------------------------------

# License

This project is released under the MIT License unless otherwise
specified.
