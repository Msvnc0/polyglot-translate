# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 

## [0.2.0] - 2026-05-22

### Added
- **Design System** — CSS variables based theme system (`design-system.css`): colors, spacing, radius, shadows, typography scale
- **Popup Redesign** — Complete modern popup with dynamic language grid (2-column, drag-drop reorder, add/remove), translate button, restore original button, recently used language pills (max 4, FIFO, ☆ pin to quick access), "More languages" dropdown, collapsible "More options" section, service selection pills
- **Options Page Redesign** — Card-based layout with sidebar navigation: Target Language card (with "Required" badge + attention pulse), Quick Access Languages, Page Translation card, Text Translation card, Site Rules card, Language Rules card, Hotkeys section with toggleable shortcuts, Appearance section with dark mode
- **Dark Mode** — System preference auto-detect (`prefers-color-scheme`) + manual toggle in popup and options, CSS variable based light/dark themes, seamless transition
- **Text Selection Popup Redesign** — Shadow DOM with drag bar, translated text area with action buttons (listen, copy, replace), "Show original" toggle, bottom toolbar with language and service pills
- **DeepL Integration** — API key configuration in options, enable/disable toggle, service pill in popup and text selection
- **Hotkeys Section** — Toggleable keyboard shortcuts (default off), link to chrome://extensions/shortcuts for key customization
- **3-dot Options Button** — Popup header button opens options page directly

### Changed
- Popup width set to 280px (compact design)
- `targetLanguage` is now fully independent of `targetLanguages` list — set from options, never auto-reset
- Quick Access pills reorder list only, do not change active target language
- Service selection in popup directly sets config + sends message to content script
- Language names resolved to full names for translation APIs (e.g. "tr" → "Turkish")

### Fixed
- **Bing `<b10>` tag pollution** — Strip `<b\d+>` wrapper tags from Bing API responses
- **Bing `&quot;` entities** — Unescape HTML entities in Bing parsed responses
- **Extension context invalidated crash** — `checkedLastError.js` wraps `chrome.runtime.sendMessage` and `getURL` with `isExtensionContextValid()` guard
- **`twpButtons is not defined` error** — Replaced with grid highlight
- **targetLanguage reset bug** — Removed all code paths that forced `targetLanguage = targetLanguages[0]`
- **DeepL empty response crash** — Added null check for `response.translations`
- **Null service crash** — Added null guards in `translateHTML`, `translateText`, `translateSingleText` when service not found


## [0.1.0] - 2026-05-14

### Added
- Rebranded from "TWP - Translate Web Pages" to "Polyglot Translate"
- Updated build pipeline artifact naming from `TWP_` to `Polyglot_`
- Updated Firefox extension ID to new UUID
- Updated npm package name from `traduzir-paginas-web` to `polyglot-translate`
- Updated version numbering from `10.1.1.0` to `0.1.0` (SemVer)

### Removed
- Original Patreon donation links
- Original Crowdin translation links
- Mozilla Add-ons store links

---

## Changelog Rules

### Format Rules
1. **Versions** use Semantic Versioning: `MAJOR.MINOR.PATCH`
2. **Dates** use ISO 8601 format: `YYYY-MM-DD`
3. **Categories** (in order): `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`
4. Only include categories that have entries for that version
5. Keep `## [Unreleased]` section at top for work-in-progress

### Entry Rules
1. Use present tense: "Add feature" not "Added feature"
2. Start with action verb: Add, Update, Remove, Fix, etc.
3. Reference issues/PRs at end: `(#123)`
4. Group related changes under single bullet when logical
5. Be specific but concise
