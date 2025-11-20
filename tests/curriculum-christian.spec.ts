import { expect, test } from "@playwright/test";

import {
	christianIntro,
	christianPillars,
	christianSponsors,
} from "@/data/christian-education";

test.describe("교육과정 > 기독교 유아교육", () => {
	test("소개 문단과 4개의 핵심 기둥을 노출한다", async ({ page }) => {
		await page.goto("/education/christian-education");

		await expect(page.getByRole("heading", { name: "기독교 유아교육", exact: true })).toBeVisible();
		await expect(page.getByText(christianIntro.headline)).toBeVisible();

		for (const pillar of christianPillars) {
			await expect(page.getByRole("heading", { name: pillar.title })).toBeVisible();
			await expect(page.getByText(pillar.description)).toBeVisible();
		}
	});

	test("반별 후원 어린이 탭을 전환할 수 있다", async ({ page }) => {
		await page.goto("/education/christian-education");

		for (const sponsor of christianSponsors) {
			const tab = page.getByRole("tab", { name: sponsor.classroomLabel, exact: true });
			await tab.click();
			await expect(page.getByRole("heading", { name: sponsor.childName, exact: false })).toBeVisible();
		}
	});
});
