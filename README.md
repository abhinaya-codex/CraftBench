# Craftbench

### Build. Debug. Learn. Analyze. Ship.

Craftbench is a browser-based developer workspace: a full offline developer toolbox, a build-prep lab, a project health analyzer, and a learning center — plus an optional AI coder you power with your own OpenRouter key. No account, no backend, no database. It runs as a static site and deploys straight to GitHub Pages.

Created by **Abhinaya Tripathee** — developer identity **CoDeX**
GitHub: [github.com/abhinaya-codex](https://github.com/abhinaya-codex)

---

## Features

### 🧰 Developer Toolbox (offline, no key required)
- **JSON** — format, validate, minify, tree view
- **Regex Tester** — live match highlighting, capture groups, common patterns
- **JWT Decoder** — header & payload viewer (decoding only — does not verify signatures)
- **Encoding** — Base64, URL, Unicode escapes, HTML entities
- **UUID Generator** — bulk v4 (random) and v7 (time-ordered) generation
- **Hash Generator** — SHA-256 / SHA-384 / SHA-512 via the Web Crypto API
- **Time Converter** — Unix timestamp ↔ human-readable date, with relative time
- **Color Converter** — HEX / RGB / HSL / CSS variable output
- **Diff Viewer** — line-level text and code comparison
- **Minifier** — HTML, CSS, and basic JavaScript

### 🚀 Build Lab
- **README Architect** — generate a complete README.md from a form
- **.gitignore Generator** — combine templates (Node, Python, React, Next.js, C++, Java, Android, Flutter, Go, Rust)
- **License Generator** — MIT, Apache 2.0, BSD 3-Clause, GPL v3

### 🔍 Project Analyzer
Upload a `.zip` of a project and get, entirely client-side:
- File count, line counts, comment/blank line breakdown
- Language distribution
- Largest files
- A heuristic **Project Health Score** (documentation, structure, testing, git-readiness)
- A readiness checklist (README, LICENSE, .gitignore, tests, CI)
- A dependency viewer for `package.json`, `requirements.txt`, and `pyproject.toml`

Nothing is uploaded to a server — the ZIP is read and analyzed inside your browser tab.

### 🧠 Learning Center
Interactive roadmaps (Web Dev, Frontend, Backend, Full Stack, Python, JavaScript, C++, AI/ML, DevOps) with topic checklists. Progress is saved locally.

### 🐛 BugLab
A set of broken code snippets across syntax, logic, loops, functions, arrays, and async bugs, with difficulty tiers (Beginner → Nightmare), hints, and local score/streak tracking.

### 🤖 CoDeX AI Coder (optional, BYOK)
Connect your own **OpenRouter** API key to unlock:
- A chat interface for describing a project idea
- A structured plan (name, description, stack, features, file structure) before any code is generated
- Full project generation as a real file tree, downloadable as a ZIP
- Quick actions: Build, Debug, Explain, Refactor, Optimize, Test, Document, Convert, Improve UI, Security

Craftbench never ships or stores a shared API key. Your key lives only in this browser's `localStorage` and is sent directly from your browser to OpenRouter when you use the AI Coder — Craftbench itself never sees that traffic.

### ⌨️ Extras
- Command palette (`Ctrl/Cmd + K`) to jump to any tool
- A lightweight in-app terminal (press `C`) — an app command helper, not a real OS shell
- Dark mode by default, with a light theme toggle
- Local data export/import as JSON, and a one-click "clear all local data"
- Fully responsive: sidebar becomes a drawer on mobile

---

## Getting started

Craftbench has no build step. Clone it and open `index.html`, or serve the folder with any static file server:

```bash
git clone https://github.com/abhinaya-codex/craftbench.git
cd craftbench
python3 -m http.server 8080
# then open http://localhost:8080
```

### Deploying to GitHub Pages
1. Push this repository to GitHub.
2. In **Settings → Pages**, set the source to the `main` branch, root folder.
3. Your site will be live at `https://<your-username>.github.io/craftbench/`.

No environment variables, secrets, or server configuration are required — every offline feature works immediately.

### Connecting the AI Coder (optional)
1. Create a key at [openrouter.ai/keys](https://openrouter.ai/keys).
2. In Craftbench, go to **AI Coder → AI Settings**.
3. Paste your key, pick a model, and enable the AI Coder.

---

## Architecture

Craftbench is intentionally dependency-light:

- **Vanilla JavaScript (ES modules)** — no framework, no bundler, no build step
- **Hash-based routing** — each view is a small module exporting a `render(el)` function
- `localStorage` for all local persistence (settings, AI key, roadmap/BugLab progress)
- [JSZip](https://stuk.github.io/jszip/) (via CDN) for reading uploaded project ZIPs and packaging AI-generated projects for download
- Direct `fetch` calls from the browser to the OpenRouter API for AI features — no backend proxy

```text
craftbench/
├── index.html
├── css/
│   └── style.css
└── js/
    ├── app.js              # router, nav, command palette, terminal
    ├── storage.js          # localStorage helper
    ├── ui.js                # toast, copy, escape helpers
    ├── theme.js
    ├── dashboard.js
    ├── toolboxHub.js
    ├── buildHub.js
    ├── settingsPage.js
    ├── analyze.js           # Project Analyzer
    ├── learn.js              # Learning Center roadmaps
    ├── buglab.js
    ├── comingSoon.js
    ├── tools/                # JSON, Regex, JWT, Encoding, UUID, Hash, Time, Color, Diff, Minify
    └── build/                # README, .gitignore, License generators
    └── ai/
        ├── settings.js       # OpenRouter BYOK settings
        └── chat.js           # CoDeX AI Coder chat + project generation
```

---

## Privacy

**Craftbench is local-first.** Every offline tool — the Toolbox, Build Lab, and Project Analyzer — processes your code and files entirely inside this browser tab. Nothing is uploaded to a server.

The one exception is the **AI Coder**: when you use it, your prompt and any code you include are sent directly from your browser to OpenRouter's API, using the key you provided. Browser `localStorage` is convenient, not a secure vault — don't paste a key on a shared or public machine, and rotate it if you suspect it's been exposed.

---

## Limitations (read this before relying on it)

- The in-browser terminal is an app command helper, not a real operating-system shell.
- JWT decoding shows header/payload only — it does **not** verify signatures.
- The JavaScript minifier strips comments and blank lines; it is not a full parser or a replacement for a real bundler (esbuild, terser) in production.
- The Project Health Score is a heuristic based on common signals (README, LICENSE, tests, etc.) — not a certification of code quality.
- AI-generated code is not guaranteed to be correct, secure, or bug-free. Review everything CoDeX produces before shipping it.
- Language *editing* support (syntax highlighting, formatting) is broader than language *execution* support — Craftbench does not run arbitrary compiled languages in the browser.

---

## Roadmap

- API Playground (GET/POST/PUT/PATCH/DELETE with cURL & fetch/requests snippets)
- Open-source templates (CONTRIBUTING.md, CODE_OF_CONDUCT.md, issue/PR templates)
- Monaco-based editor with multi-file tabs and split view for the AI Coder's generated projects
- Expanded BugLab challenge library
- Web Worker–backed analysis for very large project ZIPs

---

## Contributing

Issues and pull requests are welcome. Please open an issue first for anything beyond a small fix, so we can discuss the approach.

## License

MIT — see [LICENSE](./LICENSE).

---

**Craftbench** — a complete developer workspace that works without AI, and becomes an AI-powered coding environment the moment you connect your own OpenRouter key.
