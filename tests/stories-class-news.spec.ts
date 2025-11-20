import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

async function loginAs(
	page: Page,
	{
		email,
		password,
		redirect = "/stories/class-news",
	}: { email: string; password: string; redirect?: string },
) {
	const redirectParam = encodeURIComponent(redirect);
	await page.goto(`/member/login?redirect=${redirectParam}`);
	await page.getByLabel("이메일").fill(email);
	await page.getByLabel("비밀번호").fill(password);
	await page.getByRole("button", { name: "로그인" }).click();
	await page.waitForLoadState("networkidle");
}

test.describe("우리들 이야기 - 반별 교육활동", () => {
	test("비로그인 사용자는 로그인 안내를 본다", async ({ page }) => {
		await page.goto("/stories/class-news");
	await expect(page.getByRole("heading", { name: "반별 교육활동 미리보기" })).toBeVisible();
	const loginButton = page.getByRole("button", { name: "로그인하고 전체 보기" }).first();
		await expect(loginButton).toBeVisible();
		await loginButton.click();
		await expect(page.getByRole("heading", { name: "로그인 후 자세히 확인하세요" })).toBeVisible();
	});

	test("학부모 로그인 후 갤러리 카드를 열람할 수 있다", async ({ page, context }) => {
		await context.clearCookies();
		await loginAs(page, {
			email: "parent-active@playwright.test",
			password: "Parent123!",
			redirect: "/stories/class-news",
		});

		await expect(page).toHaveURL(/\/stories\/class-news/);
		const galleryCard = page.getByTestId("class-gallery-card").first();
		await expect(galleryCard).toBeVisible();
		await galleryCard.click();
		await expect(page.getByRole("button", { name: "닫기" })).toBeVisible();
	});
});
