const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const useRuffle = process.argv[3] === '--flash';
const inputURL = process.argv[2];
if (!inputURL) {
  console.error('❌ You must enter a valid URL as an argument.');
  process.exit(1);
}

const IGNORED_URLS = [
  'https://unpkg.com/@ruffle-rs/ruffle'
];

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  if (useRuffle) await page.addScriptTag({ url: 'https://unpkg.com/@ruffle-rs/ruffle' });

  page.on('response', async (response) => {
    const url = response.url();
    if (IGNORED_URLS.some(ignored => url.startsWith(ignored))) return;

    try {
      const urlObj = new URL(url);
      const pathname = decodeURIComponent(urlObj.pathname);
      const baseDir = path.join('websites', urlObj.hostname);
      let savePath = path.join(baseDir, pathname);
      if (savePath.endsWith(path.sep) || savePath.endsWith('/')) {
        savePath = path.join(savePath, 'index.html');
      }

      savePath = savePath.replace(/[:*?"<>|]/g, '_');
      fs.mkdirSync(path.dirname(savePath), { recursive: true });

      const buffer = await response.body();
      fs.writeFileSync(savePath, buffer);

      console.log('✅ Saved:', url);
    } catch (err) {
      console.error(`❌ Error with "${url}":`, err.message);
    }
  });

  page.on('framenavigated', async (frame) => {
    if (useRuffle) {
      try {
        if (!frame.isDetached()) {
          await frame.addScriptTag({ url: 'https://unpkg.com/@ruffle-rs/ruffle' });
        }
      } catch (err) {
        console.error('❌ Error while injecting Ruffle:', err.message);
      }
    }
  });

  await page.goto(inputURL, { waitUntil: 'domcontentloaded' });
})();