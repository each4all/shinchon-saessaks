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

test.describe("인증·권한 경로", () => {
	test.beforeEach(async ({ context }) => {
		await context.clearCookies();
	});

	test("활성 학부모 계정은 /parents 접근 가능", async ({ page }) => {
	await loginAs(page, {
		email: "parent-active@playwright.test",
		password: "Parent123!",
	});

	const cookies = await page.context().cookies();
	const sessionCookie = cookies.find((cookie) => cookie.name.includes("session-token"));
	expect(sessionCookie, "세션 쿠키가 설정되어 있어야 합니다.").toBeDefined();

	await page.goto("/parents");
	await expect(page).toHaveURL(/\/parents$/);
	await expect(page.getByRole("heading", { name: "등록된 자녀" })).toBeVisible();
	});

	test("승인 대기 학부모는 포털 이동 시 대기 안내 페이지를 보게 된다", async ({ page }) => {
		await loginAs(page, {
			email: "parent-pending@playwright.test",
			password: "Parent123!",
		});

		await expect(page).toHaveURL(/\/parents\/pending$/);
		await expect(
			page.getByRole("heading", { name: "관리자 확인 후 이용하실 수 있어요" }),
		).toBeVisible();
		await expect(
			page.getByText("요청하신 계정은 아직 승인 절차가 진행 중입니다.", { exact: false }),
		).toBeVisible();
	});

	test("로그인 없이 /admin 접근 시 로그인 페이지로 이동", async ({ page }) => {
		await page.goto("/admin");

		await expect(page).toHaveURL(/\/member\/login\?redirect=%2Fadmin/);
	});

	test("학부모 계정은 /admin 접근 시 홈페이지로 리디렉트", async ({ page }) => {
	await loginAs(page, {
		email: "parent-active@playwright.test",
		password: "Parent123!",
		redirect: "/admin",
	});

	await expect(page).toHaveURL(/http:\/\/(127\.0\.0\.1|localhost):3100\/?$/);
	});

	test("관리자 계정은 /admin 페이지에 접근 가능", async ({ page }) => {
		await loginAs(page, {
			email: "admin@playwright.test",
			password: "Admin123!",
			redirect: "/admin",
		});

		await expect(page).toHaveURL(/\/admin$/);
		await expect(page.getByRole("heading", { name: "콘텐츠 관리" })).toBeVisible();
		await expect(page.getByRole("heading", { name: "게시글 작성" })).toBeVisible();
		await expect(page.getByText("등록된 게시글")).toBeVisible();
	});

	test("관리자 계정은 /admin/parent-resources 페이지에 접근 가능", async ({ page }) => {
		await loginAs(page, {
			email: "admin@playwright.test",
			password: "Admin123!",
			redirect: "/admin/parent-resources",
		});

		await expect(page.getByRole("heading", { name: "서식 · 운영위원회 자료" })).toBeVisible();
		await expect(page.getByRole("heading", { name: "새 자료 등록" })).toBeVisible();
	});

	test("관리자 계정은 /admin/parent-inquiries 페이지에 접근 가능", async ({ page }) => {
		await loginAs(page, {
			email: "admin@playwright.test",
			password: "Admin123!",
			redirect: "/admin/parent-inquiries",
		});

		await expect(page.getByRole("heading", { name: "1:1 문의 관리" })).toBeVisible();
		await expect(page.getByText("학부모 문의 현황을 확인하고 상태/답변을 실시간으로 업데이트합니다.")).toBeVisible();
	});

	test("학부모 계정은 /parents/resources 자료실을 확인할 수 있다", async ({ page }) => {
		await loginAs(page, {
			email: "parent-active@playwright.test",
			password: "Parent123!",
			redirect: "/parents/resources",
		});

		await expect(page.getByRole("heading", { name: "서식 및 운영위원회 자료", exact: true })).toBeVisible();
		await expect(page.getByRole("heading", { name: "서식 자료실", exact: true })).toBeVisible();
		await expect(page.getByRole("heading", { name: "운영위원회 자료", exact: true })).toBeVisible();
	});

	test("학부모 계정은 /parents/inquiries 에서 문의를 등록할 수 있다", async ({ page }) => {
		await loginAs(page, {
			email: "parent-active@playwright.test",
			password: "Parent123!",
			redirect: "/parents/inquiries",
		});

		await expect(page.getByRole("heading", { name: "1:1 문의" })).toBeVisible();

		const uniqueSubject = `Playwright 문의 ${Date.now()}`;

		await page.getByLabel("문의 유형").selectOption("document");
		await page.getByLabel("제목").fill(uniqueSubject);
		await page.getByLabel("내용").fill("Playwright 테스트에서 자동으로 전송한 문의입니다.");

		await page.getByRole("button", { name: "문의 보내기" }).click();
		await expect(page.getByText("문의가 접수되었습니다.")).toBeVisible();
		await expect(page.getByText(uniqueSubject).first()).toBeVisible();
	});
});
