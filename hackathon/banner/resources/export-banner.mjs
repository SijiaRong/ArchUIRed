import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVE_DIR = __dirname;

const MIME = {
  '.html':'text/html','.css':'text/css','.js':'application/javascript',
  '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml',
  '.woff2':'font/woff2','.ttf':'font/ttf'
};

const server = createServer((req, res) => {
  const url = decodeURIComponent(req.url);
  const fp = join(SERVE_DIR, url === '/' ? 'banner.html' : url);
  try {
    const c = readFileSync(fp);
    res.writeHead(200, {'Content-Type': MIME[extname(fp)] || 'application/octet-stream'});
    res.end(c);
  } catch { res.writeHead(404); res.end('Not found'); }
});

const port = await new Promise(r => server.listen(0, () => r(server.address().port)));
console.log(`Server on port ${port}`);

const browser = await chromium.launch({
  executablePath: '/Users/zac/Library/Caches/ms-playwright/chromium-1217/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
});
const page = await browser.newPage({ viewport: { width: 800, height: 2000 } });

await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(2500);

// Clean up for export
await page.evaluate(() => {
  document.body.style.background = '#fff';
  document.body.style.margin = '0';
  const b = document.querySelector('.banner');
  if (b) { b.style.margin = '0'; b.style.boxShadow = 'none'; }
});

// PNG
const pngPath = join(__dirname, 'banner.png');
await page.screenshot({ path: pngPath, clip: { x: 0, y: 0, width: 800, height: 2000 }, type: 'png' });
console.log(`PNG saved: ${pngPath}`);

// PDF — single page, use CSS @page size
const pdfPath = join(__dirname, 'banner.pdf');
await page.pdf({
  path: pdfPath,
  width: '800px',
  height: '2000px',
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
});
console.log(`PDF saved: ${pdfPath}`);

await browser.close();
server.close();
