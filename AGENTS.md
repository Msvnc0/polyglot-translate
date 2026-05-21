# AGENTS.md — Polyglot Translate

## Project Overview

Browser extension for real-time page translation. Supports Firefox (MV2) and Chromium (MV3) from a single `src/` tree. Fork of [TWP by FilipePS](https://github.com/FilipePS/Traduzir-paginas-web).

Translation engines: Google, Bing, Yandex, DeepL.

## Build & Run

```bash
npm install                                    # install deps
npm run build:local-sourcemaps                 # dev build (local sourcemaps)
npm run build                                  # release build (remote sourcemaps)
```

Output → `build/Polyglot_{version}_Firefox/` and `build/Polyglot_{version}_Chromium/`.

Version is read from `src/manifest.json` → `version` field. Increment there before release.

No tests, no linter, no typecheck commands configured.

## Build Architecture

- **Gulp** pipeline (`gulpfile.js`) copies `src/` → `build/`, runs Babel on all JS, produces Firefox zip + Chromium zip
- **Chromium build** is a copy of Firefox build with `chrome_manifest.json` swapped in as `manifest.json`, plus all background scripts concatenated into `background-bundle.js` (MV3 service worker requirement)
- **Polyfill** (`src/lib/polyfill.js`) is built separately via `npm run polyfill` (webpack from core-js). Rebuild if you change browser targets.

## Dual Manifest System

- `src/manifest.json` — Firefox MV2 (background scripts array, `browser_action`, `page_action`)
- `src/chrome_manifest.json` — Chromium MV3 (service worker, `action`, `host_permissions`)
- Gulp renames them during build. Chrome manifest references `background-bundle.js` (auto-generated).

## Source Structure

```
src/
├── background/          # Extension background/service worker
│   ├── background.js    # Main background logic
│   ├── translationService.js  # Translation API clients (Google, Bing, Yandex, DeepL)
│   ├── translationCache.js    # IndexedDB cache (TTL + LRU)
│   └── textToSpeech.js        # TTS via Google/Bing
├── contentScript/       # Injected into web pages
│   ├── pageTranslator.js      # DOM translation engine
│   ├── translateSelected.js   # Text selection popup (Shadow DOM)
│   ├── showOriginal.js        # Show original text overlay
│   ├── showTranslated.js      # Translated text display
│   └── popupMobile.js         # Mobile floating popup
├── options/             # Options page (sidebar + cards layout)
│   ├── options.html      # Sections: translation, deepl, appearance, hotkeys, advanced
│   ├── options.css       # Self-contained CSS (no external dependencies)
│   ├── options.js        # Dynamically generates list items, toggles, shortcuts
│   └── open-options.html # Lightweight opener (opens options.html in tab)
├── popup/               # Browser action popup
│   ├── popup.html / popup.css / popup.js  # Modern popup (280px compact)
│   ├── improve-translation.html/js        # Translation feedback
│   └── popup-translate-document.html/js   # Document translation
├── lib/                 # Shared modules (loaded as content scripts + background)
│   ├── config.js        # twpConfig — all user settings with defaults, observers, persistence
│   ├── i18n.js          # twpI18n — localization from _locales/
│   ├── languages.js     # Language code/name mappings
│   ├── platformInfo.js  # Detect mobile/firefox/chrome at runtime
│   ├── darkmode.js      # Dark mode controller (system pref + localStorage)
│   └── stuff.js         # Utility helpers ($ selector shorthand, etc.)
├── _locales/            # 43 languages — each has messages.json
└── styles/
    └── design-system.css  # CSS variables + shared tokens (popup + content scripts)
```

## Critical Patterns

### Script Load Order
Scripts must load in dependency order (enforced by manifest `content_scripts` and HTML `<script>` tags):
`polyfill → checkedLastError → stuff → languages → config → platformInfo → i18n → [page-specific scripts]`

`config.js` (`twpConfig`) and `i18n.js` (`twpI18n`) are global singletons used everywhere. Code wraps in `twpConfig.onReady().then(...)`.

### Platform Detection
- `platformInfo.isMobile.any` — hide `.desktopOnly` elements
- `chrome.pageAction` presence — show `.firefox-only` elements (Chrome MV3 removes `pageAction`)
- These classes are toggled via injected `<style>` in JS, not CSS media queries

### Options Page
- Sidebar nav uses `<a href="#section-id">` with JS click handler
- Old hashes (`#languages`, `#sites`, `#style`, etc.) are mapped via `sectionMap` in `options.js`
- Dynamic list items use CSS classes `list-item` + `list-close`
- Dark mode: hidden `<select id="darkMode">` synced with sidebar toggle + appearance pills

### Config System
All settings go through `twpConfig.get()` / `twpConfig.set()`. Defaults in `config.js:defaultConfig`. Observers via `twpConfig.onReady()` and `twpConfig.addObserver()`.

### Translation Services
- Google, Bing, Yandex are free (no API key needed)
- DeepL requires API key (free tier: 500K chars/month)
- Services selected via pills in popup and text selection popup
- `getSafeServiceByName()` returns null if service not available — callers must handle null

## Things to Avoid

- **Do not add W3CSS** — removed in v0.2.0, all UI uses custom CSS
- **Do not add donation/Patreon UI** — removed in v0.2.0 modernization
- **Do not modify `background-bundle.js`** — it's auto-generated during Chromium build
- **Do not add npm dependencies** for UI — vanilla JS/CSS only
- **Do not add LLM features** — removed in v0.2.0, not planned

## i18n

- `_locales/{lang}/messages.json` — standard browser extension locale format
- `twpI18n.getMessage("key")` returns localized string
- `data-i18n="key"` attribute on elements auto-translated by `twpI18n.translateDocument()`
- `extra/` has CrowdIn integration scripts for localization management (not part of build)
