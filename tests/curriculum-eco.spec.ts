import { expect, test } from "@playwright/test";

import { ecoActivities, ecoIntro } from "@/data/eco-education";

test.describe("교육과정 > 생태 유아교육", () => {
	test("소개 문단과 핵심 활동을 노출한다", async ({ page }) => {
		await page.goto("/education/eco-education");

		await expect(page.getByRole("heading", { name: "생태 유아교육", exact: true })).toBeVisible();
		await expect(page.getByText(ecoIntro.headline)).toBeVisible();

		for (const paragraph of ecoIntro.description) {
			await expect(page.getByText(paragraph)).toBeVisible();
		}

		for (const activity of ecoActivities) {
			await expect(page.getByRole("heading", { name: activity.title })).toBeVisible();
			await expect(page.getByText(activity.description)).toBeVisible();
		}
	});

	test("사진 플레이스홀더 3개가 노출된다", async ({ page }) => {
		await page.goto("/education/eco-education");
		await expect(page.getByText("이미지 자리").nth(0)).toBeVisible();
		const placeholders = page.getByText("이미지 자리");
		await expect(placeholders).toHaveCount(5); // 2 hero + 3 photos
	});
});
