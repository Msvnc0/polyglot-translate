const { chromium } = require('playwright');
const path = require('path');

async function screenshotPopup() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 400, height: 650 } });
  const page = await context.newPage();

  // Popup page
  await page.goto('file:///' + path.join(__dirname, '../../build/Polyglot_0.2.1_Chromium/popup/popup.html').replace(/\\/g, '/'));
  // Wait for any scripts
  await page.waitForTimeout(1000);

  // Set light mode by default
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--color-bg', '#ffffff');
    document.documentElement.style.setProperty('--color-surface', '#f8f9fa');
    document.documentElement.style.setProperty('--color-text', '#202124');
    document.documentElement.style.setProperty('--color-text-secondary', '#6c757d');
    document.body.style.background = '#ffffff';
  });

  await page.screenshot({ path: 'docs/store/screenshots/01-popup-light.png', type: 'png' });

  // Dark mode
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--color-bg', '#1a1d21');
    document.documentElement.style.setProperty('--color-surface', '#2c3035');
    document.documentElement.style.setProperty('--color-text', '#f8f9fa');
    document.documentElement.style.setProperty('--color-text-secondary', '#adb5bd');
    document.body.style.background = '#1a1d21';
  });

  await page.screenshot({ path: 'docs/store/screenshots/02-popup-dark.png', type: 'png' });

  await browser.close();
}

async function screenshotOptions() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  await page.goto('file:///' + path.join(__dirname, '../../build/Polyglot_0.2.1_Chromium/options/options.html').replace(/\\/g, '/'));
  await page.waitForTimeout(2000);

  // Light mode
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--color-bg', '#ffffff');
    document.documentElement.style.setProperty('--color-surface', '#f8f9fa');
    document.documentElement.style.setProperty('--color-text', '#202124');
    document.body.style.background = '#ffffff';
  });

  await page.screenshot({ path: 'docs/store/screenshots/03-options-light.png' });

  // Dark mode
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--color-bg', '#1a1d21');
    document.documentElement.style.setProperty('--color-surface', '#2c3035');
    document.documentElement.style.setProperty('--color-text', '#f8f9fa');
    document.body.style.background = '#1a1d21';
  });

  await page.screenshot({ path: 'docs/store/screenshots/04-options-dark.png' });

  await browser.close();
}

async function main() {
  console.log('Capturing popup...');
  await screenshotPopup();
  console.log('Capturing options...');
  await screenshotOptions();
  console.log('Done!');
}

main().catch(console.error);
