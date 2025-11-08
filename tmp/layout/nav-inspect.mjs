import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const baseUrl = 'http://127.0.0.1:3100';
const outDir = path.resolve('tmp/layout');

function ensureDir(p) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });

  const navScreenshot = path.join(outDir, 'nav_before_hover.png');
  ensureDir(navScreenshot);
  const nav = page.locator('header nav').first();
  await nav.screenshot({ path: navScreenshot });

  const label = nav.locator('a', { hasText: '유치원 소개' }).first();
  const navMetrics = await label.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return {
      width: rect.width,
      height: rect.height,
      whiteSpace: style.whiteSpace,
      textTransform: style.textTransform,
      letterSpacing: style.letterSpacing,
    };
  });
  fs.writeFileSync(path.join(outDir, 'nav_metrics.json'), JSON.stringify(navMetrics, null, 2));

  const menu = page.locator('header nav > div').filter({
    has: page.locator('text=유치원 소개'),
  }).first();
  await menu.hover();
  await page.waitForTimeout(500);
  const subLink = page.locator('a', { hasText: '인사말' }).first();
  await subLink.hover();
  await page.waitForTimeout(500);

  const panel = page.locator('[data-submenu]').first();
  const panelMetrics = await panel.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
    };
  });
  fs.writeFileSync(path.join(outDir, 'nav_submenu_metrics.json'), JSON.stringify(panelMetrics, null, 2));

  const hoverScreenshot = path.join(outDir, 'nav_after_hover.png');
  await page.locator('header').first().screenshot({ path: hoverScreenshot });

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
