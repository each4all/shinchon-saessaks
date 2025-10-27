import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

async function loginAs(
	page: Page,
	{
		email,
		password,
		redirect = "/parents",
	}: { email: string; password: string; redirect?: string },
) {
	const redirectParam = encodeURIComponent(redirect);
	await page.goto(`/member/login?redirect=${redirectParam}`);

	await page.getByLabel("이메일").fill(email);
	await page.getByLabel("비밀번호").fill(password);
	await page.getByRole("button", { name: "로그인" }).click();
	await page.waitForLoadState("networkidle");
}

test.describe("헤더 인증 상태 표시", () => {
	test.beforeEach(async ({ context }) => {
		await context.clearCookies();
	});

	test("로그인하지 않은 방문자는 학부모 포털 버튼이 보이지 않는다", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByRole("link", { name: "학부모 포털" })).toHaveCount(0);
	});

	test("학부모 로그인 후 헤더에 로그인 링크가 남아있는지 확인", async ({ page }) => {
		await loginAs(page, {
			email: "parent-active@playwright.test",
			password: "Parent123!",
			redirect: "/parents",
		});

		await expect(page).toHaveURL(/\/parents$/);
		await expect(page.getByRole("link", { name: "로그인" })).toHaveCount(0);
		await expect(page.getByRole("link", { name: "학부모 포털" })).toBeVisible();
		await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();
	});

	test("관리자 로그인 후 홈 화면 헤더에서 관리자 콘솔 이동 버튼 확인", async ({ page }) => {
		await loginAs(page, {
			email: "admin@playwright.test",
			password: "Admin123!",
			redirect: "/",
		});

		await expect(page).toHaveURL("http://localhost:3100/");
		await expect(page.getByRole("link", { name: "관리자 콘솔" })).toBeVisible();
		await expect(page.getByRole("link", { name: "학부모 포털" })).toHaveCount(0);
		await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();
	});

	test("승인 대기 학부모는 헤더에서 대기 안내 페이지로 이동한다", async ({ page }) => {
		await loginAs(page, {
			email: "parent-pending@playwright.test",
			password: "Parent123!",
			redirect: "/",
		});

		await expect(page).toHaveURL(/\/parents\/pending$/);
		const portalLink = page.getByRole("link", { name: "학부모 포털" });
		await expect(portalLink).toBeVisible();
		await expect(portalLink).toHaveAttribute("href", "/parents/pending");
		await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();
	});
});
