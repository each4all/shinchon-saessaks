import { expect, test } from "@playwright/test";

import { legacyDailySchedule } from "@/data/curriculum";

test.describe("교육과정 > 하루일과", () => {
	test("하루일과 일정표를 표로 노출한다", async ({ page }) => {
		await page.goto("/education/daily-schedule");

		await expect(page.getByRole("heading", { name: "하루 일과", exact: true })).toBeVisible();
		const scheduleRows = page.locator('[data-slot="table"] tbody tr');
		await expect(scheduleRows).toHaveCount(legacyDailySchedule.length);
		await expect(page.getByText("1코스 몬테소리 자유선택")).toBeVisible();
	});

	test("사이드바에 교육과정 네비게이션을 그대로 노출한다", async ({ page }) => {
		await page.goto("/education/daily-schedule");

		const sidebar = page.locator("aside").first();
		const labels = ["하루일과", "몬테소리 교육", "기독교 유아교육", "생태 유아교육", "부모교육"] as const;
		for (const label of labels) {
			await expect(sidebar.getByRole("link", { name: label, exact: true })).toBeVisible();
		}
	});
});
