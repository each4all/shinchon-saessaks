import { chromium, devices } from 'playwright';
import path from 'path';

const baseUrl = 'http://127.0.0.1:3100';
const outDir = path.resolve('tmp/layout');

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 13'],
  });
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle' });

  const menuButton = page.getByLabel('모바일 메뉴 열기');
  await menuButton.click();
  await page.waitForTimeout(400);

  const mobileContainer = page.locator('[data-mobile-nav]').first();
  const mobileNav = path.join(outDir, 'nav_mobile_open.png');
  await mobileContainer.screenshot({ path: mobileNav });

  const envToggle = page.getByRole('button', { name: '교육환경' });
  await envToggle.click();
  await page.waitForTimeout(200);

  const envState = path.join(outDir, 'nav_mobile_environment.png');
  await mobileContainer.screenshot({ path: envState });

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
