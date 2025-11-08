import { expect, test } from "@playwright/test";

test.describe("Greeting content and navigation UX", () => {
	test("renders greeting tabs with comfortable spacing", async ({ page }) => {
		await page.goto("/intro/greeting");

		await expect(page.getByRole("heading", { name: "인사말" })).toBeVisible();
		await expect(page.getByRole("tab", { name: "이사장" })).toBeVisible();
		await expect(page.getByRole("tab", { name: "원장" })).toBeVisible();

		await page.getByRole("tab", { name: "원장" }).click();
		await expect(page.getByRole("heading", { name: /아이의 리듬/ })).toBeVisible();

		await page.screenshot({ path: "test-results/greeting-tabs.png", fullPage: true });
	});

	test("desktop submenu stacks vertically without oversized width", async ({ page }) => {
		await page.goto("/");

		const trigger = page.getByRole("link", { name: "유치원 소개" });
		await trigger.hover();

		const submenu = page.locator("[data-submenu]").first();
		await expect(submenu).toBeVisible();

		const box = await submenu.boundingBox();
		expect(box?.width ?? 0).toBeLessThanOrEqual(360);

		await page.screenshot({ path: "test-results/nav-desktop.png" });
	});

	test("mobile navigation covers the main content and resets scrolling", async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto("/");

		await page.getByLabel("모바일 메뉴 열기").click();

		const panel = page.locator("[data-mobile-nav-panel]");
		await expect(panel).toBeVisible();

		await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");

		const panelZ = await panel.evaluate((node) => Number(window.getComputedStyle(node).zIndex));
		expect(panelZ).toBeGreaterThanOrEqual(1);

		await panel.getByRole("button", { name: "유치원 소개 하위 메뉴 토글" }).click();

		await panel.getByRole("link", { name: "인사말" }).first().click();
		await page.waitForURL("**/intro/greeting");

		await expect(panel).toBeHidden();
		await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

		await page.screenshot({ path: "test-results/nav-mobile.png", fullPage: true });
	});
});
