import { expect, test } from "@playwright/test";

test.describe("교육과정 > 부모교육", () => {
	test("부모교육 탭에서 게시글 목록을 노출한다", async ({ page }) => {
		await page.goto("/education/parent-education");

		await expect(page.getByRole("heading", { name: "부모교육", exact: true })).toBeVisible();

		const rows = page.locator('[data-slot="table-body"] tr');
		await expect(rows.first()).toBeVisible();
	});

	test("검색폼과 탭 안내를 노출한다", async ({ page }) => {
		await page.goto("/education/parent-education");

		await expect(page.getByPlaceholder("제목 또는 키워드를 입력해 주세요.")).toBeEnabled();
		await expect(page.getByRole("button", { name: "검색" })).toBeEnabled();
		await expect(page.getByRole("tab", { name: "학부모교실", exact: true })).toBeVisible();
		await expect(page.getByRole("tab", { name: "부모교육", exact: true })).toBeVisible();
	});
});
