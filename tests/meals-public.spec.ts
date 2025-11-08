import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const nutritionCredentials = {
	email: "nutrition@playwright.test",
	password: "Nutrition123!",
};

const TITLE_PREFIX = "E2E-Meal-Public";

async function loginAs(
	page: Page,
	{
		email,
		password,
		redirect = "/admin",
	}: { email: string; password: string; redirect?: string },
) {
	const redirectParam = encodeURIComponent(redirect);
	await page.goto(`/member/login?redirect=${redirectParam}`);

	await page.getByLabel("이메일").fill(email);
	await page.getByLabel("비밀번호").fill(password);
	await page.getByRole("button", { name: "로그인" }).click();
	await page.waitForLoadState("networkidle");
}

function futureDate(offsetHours = 24) {
	const date = new Date(Date.now() + offsetHours * 60 * 60 * 1000);
	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, "0");
	const dd = String(date.getDate()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
}

test.describe("퍼블릭 급식 공개", () => {
	test.beforeEach(async ({ context }) => {
		await context.clearCookies();
	});

	test("전체 공개 식단이 퍼블릭 페이지에서 달력/카드로 노출된다", async ({ page }) => {
		const menuDate = futureDate(48);
		const notes = `${TITLE_PREFIX}-${menuDate}`;

		await loginAs(page, {
			...nutritionCredentials,
			redirect: "/admin/meals",
		});

		const mealForm = page
			.locator("form")
			.filter({ has: page.getByLabel("날짜", { exact: true }) })
			.first();

		await mealForm.getByLabel("날짜", { exact: true }).fill(menuDate);
		await mealForm.getByLabel("메뉴", { exact: true }).fill("테스트 식단 A\n테스트 식단 B");
		await mealForm.getByLabel("특이 사항 (선택)", { exact: true }).fill(notes);
		await mealForm.getByLabel("공개 범위", { exact: true }).selectOption("all");

		await mealForm.getByRole("button", { name: "등록" }).click();
		await expect(page.getByText("급식 정보를 등록했습니다.")).toBeVisible();

		await page.goto("/meals");
		await expect(page.getByRole("heading", { name: "이달의 급식 · 영양 안내" })).toBeVisible();
		await expect(page.getByText(notes)).toBeVisible();

		await page.goto("/admin/meals");
		const mealRow = page.locator("table tr").filter({ has: page.getByText(notes) });
		page.once("dialog", async (dialog) => {
			await dialog.accept();
		});
		await mealRow.getByRole("button", { name: "삭제" }).click();
		await expect(mealRow).toHaveCount(0);
	});
});
