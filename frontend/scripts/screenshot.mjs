// One-off script to capture dashboard screenshots for the README.
// Usage: node scripts/screenshot.mjs  (requires the app running on :3000)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../../docs/screenshots');
mkdirSync(outDir, { recursive: true });

const URL = process.env.SHOT_URL ?? 'http://localhost:3000';

async function setTheme(page, theme) {
  await page.evaluate((t) => {
    const isDark = document.documentElement.classList.contains('dark');
    if ((t === 'dark') !== isDark) {
      const btn = [...document.querySelectorAll('button')].find((b) =>
        /mode|theme/i.test(b.getAttribute('aria-label') || ''),
      );
      btn?.click();
    }
  }, theme);
  await page.waitForTimeout(500);
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2,
  });
  await page.goto(URL, { waitUntil: 'networkidle' });
  // Wait for the analysis (demo fallback) to render its chart.
  await page.waitForSelector('svg.recharts-surface', { timeout: 15000 });
  await page.waitForTimeout(1200);

  await setTheme(page, 'dark');
  await page.screenshot({ path: `${outDir}/dashboard-dark.png`, fullPage: true });
  await page.screenshot({ path: `${outDir}/hero-dark.png` }); // above-the-fold

  await setTheme(page, 'light');
  await page.screenshot({ path: `${outDir}/dashboard-light.png`, fullPage: true });
  await page.screenshot({ path: `${outDir}/hero-light.png` });

  // Mobile view (dark)
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  await mobile.goto(URL, { waitUntil: 'networkidle' });
  await mobile.waitForSelector('svg.recharts-surface', { timeout: 15000 });
  await mobile.waitForTimeout(1000);
  await mobile.screenshot({ path: `${outDir}/dashboard-mobile.png`, fullPage: true });

  console.log('Screenshots written to', outDir);
} finally {
  await browser.close();
}
