import { expect, test } from "@playwright/test";

import { montessoriAreas, montessoriIntro } from "@/data/montessori";

test.describe("교육과정 > 몬테소리", () => {
	test("Legacy 텍스트를 새 UI로 노출한다", async ({ page }) => {
		await page.goto("/education/montessori");

		await expect(page.getByRole("heading", { name: "몬테소리 교육", exact: true })).toBeVisible();
		await expect(page.getByText(montessoriIntro.headline)).toBeVisible();

		for (const area of montessoriAreas) {
			await expect(page.getByRole("heading", { name: area.title, exact: true })).toBeVisible();
			await expect(page.getByText(area.description)).toBeVisible();
		}
	});

	test("이미지 플레이스홀더가 영역 수에 맞게 노출된다", async ({ page }) => {
		await page.goto("/education/montessori");

		const placeholders = page.getByText("이미지 자리");
		await expect(placeholders).toHaveCount(montessoriAreas.length * 4);
	});
});
