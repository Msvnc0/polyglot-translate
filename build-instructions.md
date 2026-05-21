## Build Instructions

### Prerequisites

- Node.js (v16+)
- npm

### Setup

```bash
npm install
```

### Build

```bash
# Build with local source maps (recommended for development)
npm run build:local-sourcemaps

# Build with remote source maps (for release)
npm run build
```

### Output

Build artifacts are placed in the `build/` directory:

- `Polyglot_{version}_Firefox/` — Firefox extension
- `Polyglot_{version}_Firefox.zip` — Firefox extension (zipped)
- `Polyglot_{version}_Firefox_selfhosted/` — Firefox self-hosted extension
- `Polyglot_{version}_Firefox_selfhosted.zip` — Firefox self-hosted (zipped)
- `Polyglot_{version}_Chromium/` — Chrome/Edge/Brave extension
- `Polyglot_{version}_Chromium.zip` — Chromium extension (zipped)
- `Polyglot_{version}_Chromium.crx` — Signed Chromium extension (only with `--sign` flag)

### Loading the Extension

**Firefox:**
1. Open `about:debugging`
2. Click "This Firefox" → "Load Temporary Add-on"
3. Select any file in `build/Polyglot_*_Firefox/`

**Chrome:**
1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `build/Polyglot_*_Chromium/`

### Polyfill

The `src/lib/polyfill.js` file is precompiled from core-js polyfills. To rebuild:

```bash
npm run polyfill
```

### Note

The `extra` folder is not part of the extension build. It contains utility scripts for language data and localization management.