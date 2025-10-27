import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

async function loginAsAdmin(page: Page) {
	const redirectParam = encodeURIComponent("/admin");
	await page.goto(`/member/login?redirect=${redirectParam}`);

	await page.getByLabel("이메일").fill("admin@playwright.test");
	await page.getByLabel("비밀번호").fill("Admin123!");
	await page.getByRole("button", { name: "로그인" }).click();
	await page.waitForLoadState("networkidle");
}

test.describe("관리자 로그아웃 버튼", () => {
	test("대시보드 헤더에 로그아웃 버튼이 노출된다", async ({ page }) => {
		await loginAsAdmin(page);

		await expect(page).toHaveURL(/\/admin$/);
		await expect(page.getByRole("button", { name: "로그아웃" }).first()).toBeVisible();
	});

});
