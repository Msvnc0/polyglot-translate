# Chrome Web Store Submission Guide

## Step-by-step submission process

### 1. Prepare the package

Upload file: `build/Polyglot_0.2.1_Chromium.zip` (make sure you ran `npm run build`)

### 2. Fill in metadata

**Title:** Polyglot Translate - Web Page Translator

**Summary:** Translate any web page in one click. Supports Google, Bing, Yandex, and DeepL with 100+ languages.

**Detailed Description:** (below)

**Category:** Productivity

**Language:** English

**Website:** https://github.com/Msvnc0/polyglot-translate

**Support URL:** https://github.com/Msvnc0/polyglot-translate/issues

**Privacy Policy URL:** [Upload the PRIVACY_POLICY.md below to GitHub Pages or create a Gist]

---

## Detailed Description (Copy-paste this)

Polyglot Translate makes reading websites in foreign languages effortless.

How it works:
Just click the toolbar icon and the page is instantly translated into your chosen language.

Translation Services:
- Google Translate
- Microsoft Translator (Bing)
- Yandex Translate
- DeepL (with your own API key for higher quality)

Switch between services anytime from the popup or text selection popup.

Supported Languages:
100+ languages including English, Spanish, French, German, Chinese, Japanese, Russian, Turkish, Arabic, Portuguese, Italian, Korean, Dutch, and many more.

Key Features:
- One-click page translation - entire page translated without leaving the site
- Text selection popup - translate any selected text on any page (hold Shift+Alt to show popup for selected text)
- Listen - hear the translated text spoken aloud (TTS)
- Quick access language list - pin your most-used languages for instant switching
- Dark mode - automatically follows your system preference
- Keyboard shortcuts - toggle translation with Alt+T, swap service with Alt+Q
- Auto-translate - automatically translate links on the same domain
- Never translate / Always translate - per-site rules with one click
- PDF translation support - translate PDF documents via conversion
- Translation cache - speed up repeat visits with cached translations

Your settings are stored locally. No account required.

Open source: See the code at github.com/Msvnc0/polyglot-translate

---

## Screenshots

### Option 1: Use Capture Tool (Recommended)
Capture actual screenshots from your browser extension:

1. Load `build/Polyglot_0.2.1_Chromium` as "unpacked extension" in Chrome
2. Open https://en.wikipedia.org/wiki/Main_Page
3. Click the Polyglot Translate icon in the toolbar
4. Choose a language (e.g. Spanish)
5. Click "Translate"
6. Wait for page to translate
7. Take screenshot: Win+Shift+S (Windows) or Chrome DevTools: Capture full size screenshot
8. Repeat for dark mode (with "system" theme)

**Required screenshots (at least 1, max 5):**
- **Screenshot 1:** Popup open showing language grid + translate button (Light mode, 640x400 or 1280x800)
- **Screenshot 2:** Page translated (before/after side by side, 1280x800)
- **Screenshot 3:** Text-selection popup showing translation (1280x800)
- **Screenshot 4:** Options page showing settings (1280x800)
- **Screenshot 5:** Dark mode comparison (640x400 or 1280x800)

### Option 2: Use screenshot-helper.html

1. Open `docs/store/screenshot-helper.html` in Chrome
2. Use DevTools: Cmd/Ctrl+Shift+P - "Capture area screenshot" or "Capture full size screenshot"
3. Each frame has labels showing recommended dimensions

---

## Promotional Images (Optional but strongly recommended)

**S/M/L promotional tiles:** 
440x280, 1400x560, 920x680

Use the promotional banner in `screenshot-helper.html` or create custom banners in:
- Figma
- Canva
- Adobe Express

---

## Tags / Search Keywords (English)

- translate
- translation
- web page translator
- language
- multilingual
- Google Translate
- DeepL
- Bing Translator
- Yandex
- text to speech
- TTS

---

## What changed in this version (for update submissions)

Use the text in `docs/store/CHANGE_SUMMARY.md`

---

## Privacy Policy

**IMPORTANT:** Chrome Web Store requires a public URL for privacy policy. 

### How to host your privacy policy:

**Option A - GitHub Pages (Recommended):**
1. Push `docs/store/PRIVACY_POLICY.md` to your repo
2. Enable GitHub Pages in repo settings (Settings > Pages)
3. Use the raw .md URL or convert to HTML using GitHub Pages
4. Use that URL in Chrome Web Store

**Option B - GitHub Gist:**
1. Go to gist.github.com
2. Paste contents of PRIVACY_POLICY.md
3. Create public gist
4. Use the raw gist URL in Chrome Web Store

**Option C - Personal Website:**
Upload PRIVACY_POLICY.md to your own website.

---

## Pricing & Distribution

**Pricing:** Free
**Distribution:** Public
**Visibility:** All regions (or select specific countries)

---

## Developer Account Setup

Before submitting:
1. Sign up at https://chrome.google.com/webstore/devconsole
2. Pay one-time $5 registration fee
3. Complete verification
4. Upload extension package and metadata
5. Submit for review (2-7 business days)

---

## Pre-submission Checklist

- [ ] `npm run build` completed successfully
- [ ] Build output exists: `build/Polyglot_0.2.1_Chromium.zip`
- [ ] Manifest version is correct (0.2.1)
- [ ] At least 1 screenshot taken (1280x800 recommended)
- [ ] Store listing description written
- [ ] Privacy policy hosted online with accessible URL
- [ ] Icon set includes 128x128, 64x64, 32x32, 16x16
- [ ] Extension loads without errors when unpacked
- [ ] All tabs test: Extension icon appears in toolbar
- [ ] Translation tested on at least 2 different websites
- [ ] Options page loads when clicking "Options" from popup/menu
- [ ] No console errors visible in popup/options background page

---

## Review Time

Typical: 1-3 business days
If rejected: Review feedback will appear in developer console, fix and resubmit.

---

## Store Listing Link (after approval)

After your extension is approved, it will appear at:
`https://chrome.google.com/webstore/detail/[your-extension-name]/[extension-id]`
