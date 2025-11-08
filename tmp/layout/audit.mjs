import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const baseUrl = 'http://127.0.0.1:3100';
const outDir = path.resolve('tmp/layout');
const routes = [
  { path: '/', id: 'home' },
  { path: '/about', id: 'about' },
  { path: '/contact', id: 'contact' },
];

const targets = [
  { selector: 'header', id: 'header' },
  { selector: 'main', id: 'main' },
  { selector: 'footer', id: 'footer' },
  { selector: "[data-testid='hero']", id: 'hero' },
  { selector: "[data-testid='cta-section']", id: 'cta-section' },
];

const metrics = [];
const placeholderPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAACR0lEQVR4nO2ay0sDQRCGv6AQIvwFxIqiKiKigvhXiIOLi4GNi4t9CKIjIWFhYWNn4B+UFeoLISiIiY2Nj8R8SrsxMySZ/dnd3Z3ZnZnd2YCMTElzyXqT6ZnZfr7d7vzJ/mT2bHxpkOaCMwB5wFpgDLgLNAeeBu4Au4B14GLoCzgEnAbsAs8Bo4DegO/B2K69XWYGjJk708LtA8RiPTVeKb70YlW+ow64FmwAXwF8xyWkPAJbPtAbMB0mQxFG68IuAacBf9r+RakaE6l2O4ClUGYX9A7mARmAnMAxsDCyt7Qr+b7ruSYAKmATeBa38UvCA3wFzAN/sgiowYeS7kXf8fKX0d9AawBvCtAi79CYk5nADNwHbiQhuMCLgFzACjABZrLw3BtQ2nCVnHIxuAl8CkxoSlYqvSn0uV72DbAQmAx2nIXSUUgDgzD1ZNVU3wFvgF9Lm1WV5Lqf+KvzYm3rfy1lCiPdp3pMBLANpjx7qd86tSuGhykANwPzR/TXWwSvQI60X1FgAnBrY9O0bgBlgEtgi7qrPAiYAxsD5WPmerlSeJ/BPqO1cA2gExgDNfWeKzCDaASmwwa4R1p3Gd6vbfvuchQMvAzOBOfNb2DWwE5gCHQnjYzXmdRvAtP6Ng80NjC+lLPY7Dj2GQrlnO6ZEqzuq+jkX/pn0eepmWUOsQi4Ezs2Prm8qkz7C6tQ1wHpD8Gee+BlnpA5QmRZqF0dkLb7W/JlMCXGaz7rsG61/3PPmoy8h01uBdYD3ss47pbEd6lqs01oHY+mdYMy9croFmmR1qF0/OC/5znXHgfFFLDXgc1gMqyvTwDfgQ6CThAOgk4QDoJOEA6CTpErgk4QDoJOEA6CTpnnvQDPhupli/4IiAEZgAnAXmAFuB+cC5TVDfhDdVVn/df8BBZ1nx6YIEh4AAAAASUVORK5CYII=",
  "base64",
);

function ensureDir(targetPath) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
}

function writePlaceholderScreenshot(filePath) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, placeholderPng);
}

async function captureForRoute(page, route) {
  const url = `${baseUrl}${route.path}`;
  await page.goto(url, { waitUntil: 'networkidle' });

  for (const target of targets) {
    const locator = page.locator(target.selector).first();
    const count = await locator.count();
    const screenshotName = `${route.id}_${target.id}.png`;
    const screenshotPath = path.join(outDir, screenshotName);

    if (count === 0) {
      writePlaceholderScreenshot(screenshotPath);
      metrics.push({
        route: route.path,
        selector: target.selector,
        screenshot: screenshotPath,
        note: 'not-found',
      });
      continue;
    }

    const data = await locator.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        width: rect.width,
        height: rect.height,
        display: style.display,
        position: style.position,
        visibility: style.visibility,
        overflowX: style.overflowX,
        overflowY: style.overflowY,
      };
    });

    ensureDir(screenshotPath);
    try {
      await locator.scrollIntoViewIfNeeded();
      await locator.screenshot({ path: screenshotPath });
    } catch (error) {
      writePlaceholderScreenshot(screenshotPath);
      metrics.push({
        route: route.path,
        selector: target.selector,
        screenshot: screenshotPath,
        note: 'screenshot-failed',
        error: String(error),
        ...data,
      });
      continue;
    }

    metrics.push({
      route: route.path,
      selector: target.selector,
      screenshot: screenshotPath,
      ...data,
    });
  }
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  for (const route of routes) {
    await captureForRoute(page, route);
  }

  await browser.close();

  const metricsPath = path.join(outDir, 'metrics.json');
  fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
