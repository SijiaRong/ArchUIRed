#!/usr/bin/env bash
# Export banner.html to PNG + PDF at 800×2000 viewport
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HTML_FILE="$SCRIPT_DIR/banner.html"
OUTPUT_PNG="$SCRIPT_DIR/banner.png"
OUTPUT_PDF="$SCRIPT_DIR/banner.pdf"

echo "Setting up Playwright in temp dir..."
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

cat > package.json << 'PKG'
{ "name": "banner-export", "private": true, "type": "module" }
PKG

npm install playwright --silent 2>/dev/null
npx playwright install chromium 2>/dev/null
echo "✓ Playwright ready"

cat > export.mjs << 'SCRIPT'
import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join, extname } from 'path';

const SERVE_DIR = process.argv[2];
const HTML_FILE = process.argv[3];
const OUTPUT_PNG = process.argv[4];
const OUTPUT_PDF = process.argv[5];

const MIME = {
  '.html':'text/html','.css':'text/css','.js':'application/javascript',
  '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml',
  '.woff2':'font/woff2','.ttf':'font/ttf'
};

const server = createServer((req, res) => {
  const url = decodeURIComponent(req.url);
  const fp = join(SERVE_DIR, url === '/' ? HTML_FILE : url);
  try {
    const c = readFileSync(fp);
    res.writeHead(200, {'Content-Type': MIME[extname(fp)] || 'application/octet-stream'});
    res.end(c);
  } catch { res.writeHead(404); res.end('Not found'); }
});

const port = await new Promise(r => server.listen(0, () => r(server.address().port)));
console.log(`  Server on port ${port}`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 2000 } });

await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(2000);

// Hide browser background, capture only the banner
await page.evaluate(() => {
  document.body.style.background = '#fff';
  document.body.style.margin = '0';
  const banner = document.querySelector('.banner');
  if (banner) { banner.style.margin = '0'; banner.style.boxShadow = 'none'; }
});

// PNG screenshot
await page.screenshot({
  path: OUTPUT_PNG,
  clip: { x: 0, y: 0, width: 800, height: 2000 },
  type: 'png'
});
console.log(`  ✓ PNG saved: ${OUTPUT_PNG}`);

// PDF — single tall page matching banner dimensions
await page.pdf({
  path: OUTPUT_PDF,
  width: '800px',
  height: '2000px',
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
});
console.log(`  ✓ PDF saved: ${OUTPUT_PDF}`);

await browser.close();
server.close();
SCRIPT

echo "Exporting banner..."
node export.mjs "$SCRIPT_DIR" "banner.html" "$OUTPUT_PNG" "$OUTPUT_PDF"

rm -rf "$TEMP_DIR"

echo ""
echo "Done! Files:"
echo "  PNG: $OUTPUT_PNG"
echo "  PDF: $OUTPUT_PDF"

# Open PDF
open "$OUTPUT_PDF" 2>/dev/null || true
