# Screenshot Capture Guide

This helper file displays the Chrome Web Store required visual elements for screenshots.

## How to capture screenshots

### Method 1: DevTools (Fastest)
1. Open `docs/store/screenshot-helper.html` in Chrome
2. Press F12 to open DevTools
3. Press Ctrl+Shift+P (or Cmd+Shift+P on Mac)
4. Type "Capture area screenshot" or "Capture full size screenshot"
5. Select/crop the area you want
6. Chrome automatically downloads the image

### Method 2: Snipping Tool / Snip & Sketch
1. Open the HTML file in Chrome
2. Press Win+Shift+S (Windows) or Cmd+Shift+4 (Mac)
3. Select the frame area with the correct dimensions
4. Save the file

## Required Dimensions

| Asset | Min | Recommended | Purpose |
|-------|-----|-------------|---------|
| Screenshot 1 | 640x400 | 1280x800 | Popup showing language selection |
| Screenshot 2 | 640x400 | 1280x800 | Translated page |
| Screenshot 3 | 640x400 | 1280x800 | Text selection popup |
| Screenshot 4 | 640x400 | 1280x800 | Options page |
| Small promo | 440x280 | 440x280 | Store listing thumbnail |
| Large promo | 440x280 | 1400x560 | Store listing banner |
| Marquee | 1400x560 | 1400x560 | Featured placement |

## Recommended Screenshot Order

1. **Popup Light** - Shows the main interface with language grid
2. **Popup Dark** - Same content but in dark mode
3. **Options Page** - Shows settings and customization
4. **Before/After** - Side by side of original & translated page
5. **Text Selection** - Shows inline translation popup on selected text

## Tips

- Use a clean browser window (hide bookmarks bar, show only one tab)
- Use light theme for first screenshots, dark for variety
- If showing a translated page, pick a well-known site (Wikipedia, news site)
- Use consistent language example (e.g., translate English → Spanish)
- Avoid showing personal data or sensitive information
