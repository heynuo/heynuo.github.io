# HeyNuo — Personal Website & Digital Knowledge Base

[![Live Site](https://img.shields.io/badge/Live%20Website-heynuo.github.io-blue?style=for-the-badge&logo=github)](https://heynuo.github.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](js/script.js)
[![HTML5 & CSS3](https://img.shields.io/badge/Stack-HTML5%20%2F%20CSS3-E34F26?style=for-the-badge&logo=html5&logoColor=white)](css/style.css)

> Clean, accessible, lightweight personal website and knowledge base featuring technical tutorials on Java OOP, modern web development guides, and authentic Islamic research.

---

## 🌐 Live Website

- **Production URL:** [https://heynuo.github.io/](https://heynuo.github.io/)
- **Ruqyah Shariyah Companion:** [https://heynuo.github.io/heynuo.github.io-ruqyah-guide/](https://heynuo.github.io/heynuo.github.io-ruqyah-guide/)

---

## ✨ Features & Architecture

- **🌓 Dual-Theme Engine (Dark / Light Mode):**
  - Smooth CSS transitions with system color-scheme detection (`prefers-color-scheme`).
  - Theme state persisted via `localStorage` with zero flash of unstyled theme (FOUT).

- **🎨 Modern Glassmorphism & Modular Design System:**
  - Built entirely on Vanilla CSS using native `@layer` (`reset`, `base`, `components`, `utilities`) and CSS custom properties (variables).
  - Modern typography powered by Google Fonts (*Plus Jakarta Sans* and *Inter*), optimized with non-blocking `<link>` tags and preconnect hints.

- **🎧 Embedded Custom Audio Player:**
  - Bespoke HTML5 audio player designed for Quranic recitations and Ruqyah listening.
  - Features real-time track seeking, volume control, playback rate adjustment, time elapsed display, and keyboard accessibility.

- **📖 Reading & UX Enhancements:**
  - Real-time scroll-driven reading progress bar across long-form articles.
  - Floating circular progress scroll-to-top button.
  - Skip-to-content links and accessible ARIA attributes across all interactive components.
  - Lightly obfuscated contact endpoints preventing public scrapers from crawling contact details.

- **⚡ Performance & SEO:**
  - Zero external JavaScript frameworks or heavy runtime dependencies for instant page loads.
  - Fully responsive, mobile-first layouts across all screen viewports.
  - Comprehensive OpenGraph metadata, Twitter Cards, XML Sitemap, and JSON-LD structured data.

---

## 📂 Project Structure

```text
heynuo.github.io/
├── index.html                  # Homepage (featured articles, stats, search, bio)
├── about.html                  # Bio, expertise, values, and tech stack
├── contact.html                # Contact form, socials, and dynamic reach-out links
├── 404.html                    # Custom animated 404 error page
├── java-oop.html               # Java Object-Oriented Programming crash course
├── jinn-islamic-theology.html  # Authentic research & comprehensive Ruqyah verses
├── web-dev-guide.html          # Modern web development fundamentals & workflow
├── css/
│   └── style.css               # Unified CSS layers, tokens, components, and layout
├── js/
│   └── script.js               # Theme engine, audio player, copy features, and UI logic
├── assets/
│   ├── audio/                  # Ruqyah & recitation audio tracks
│   ├── banners/                # High-definition 3D tech & research banners
│   └── icons/                  # 3D UI icons and graphics
├── robots.txt                  # Search engine crawl directives
├── sitemap.xml                 # XML sitemap for SEO discovery
├── LICENSE                     # MIT Open Source License
└── README.md                   # Project documentation
```

---

## 🛠️ Tech Stack

| Domain | Technology |
|---|---|
| **Structure** | Semantic HTML5, ARIA roles, JSON-LD schema |
| **Styling** | Vanilla CSS3, CSS Custom Properties, `@layer`, Flexbox & CSS Grid |
| **Typography** | Plus Jakarta Sans, Inter (Google Fonts) |
| **Interactivity** | Vanilla JavaScript (ES6+ modular utility pattern) |
| **Hosting & CI/CD** | GitHub Pages (static automated deployment) |

---

## 🚀 Local Development

Since this project has zero external build tools or node dependencies, running it locally is instant:

### Option 1: Direct File
Simply double-click `index.html` or open it directly in any modern browser.

### Option 2: Local HTTP Server (Recommended)
Using Python:
```bash
python -m http.server 8000
```
Or using Node `serve` / `npx`:
```bash
npx serve .
```
Then navigate to `http://localhost:8000` in your web browser.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — feel free to use and reference the code for your own personal sites and learning!
