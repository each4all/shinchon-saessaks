import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const teacherCredentials = {
	email: "teacher@playwright.test",
	password: "Teacher123!",
};

const adminCredentials = {
	email: "admin@playwright.test",
	password: "Admin123!",
};

const nutritionCredentials = {
	email: "nutrition@playwright.test",
	password: "Nutrition123!",
};

const CLASSROOM_NAME = "Playwright Test Classroom";
const TITLE_PREFIX = "Playwright";

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

function futureDateTime(offsetHours = 24) {
	const date = new Date(Date.now() + offsetHours * 60 * 60 * 1000);
	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, "0");
	const dd = String(date.getDate()).padStart(2, "0");
	const hh = String(date.getHours()).padStart(2, "0");
	const min = String(date.getMinutes()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

test.describe("승인 및 검증 워크플로", () => {
	test.beforeEach(async ({ context }) => {
		await context.clearCookies();
	});

	test("교사 반 소식 초안이 관리자 승인으로 게시된다", async ({ page, context }) => {
		const title = `${TITLE_PREFIX} 반 소식 승인 ${Date.now()}`;
		const summary = "Playwright 자동화 테스트용 반 소식입니다.";

		// 교사 작성
		await loginAs(page, {
			...teacherCredentials,
			redirect: "/admin/class-posts",
		});

	await page.getByRole("heading", { name: "반 소식 작성" }).waitFor();
	const classPostForm = page
		.locator("form")
		.filter({ has: page.getByLabel("반 선택", { exact: true }) })
		.first();

	await classPostForm.getByLabel("반 선택", { exact: true }).selectOption({ label: CLASSROOM_NAME });
	await classPostForm.getByLabel("제목", { exact: true }).fill(title);
	await classPostForm.getByLabel("요약 (선택)", { exact: true }).fill(summary);

	await classPostForm.evaluate((form, content) => {
		const input = form.querySelector<HTMLInputElement>('input[name="contentMarkdown"]');
		if (input) {
			input.value = content;
			input.dispatchEvent(new Event("input", { bubbles: true }));
		}
	}, "Playwright에서 작성한 본문 내용입니다.");

	await classPostForm.getByRole("button", { name: "등록" }).click();
		await expect(page.getByText("초안이 저장되었습니다", { exact: false })).toBeVisible();

		const teacherRow = page.locator("table tr").filter({ has: page.getByText(title) });
		await expect(teacherRow).toContainText("승인 대기");

		// 관리자 승인
		await context.clearCookies();
		await loginAs(page, {
			...adminCredentials,
			redirect: "/admin/class-posts",
		});

		const pendingSection = page
			.locator("section")
			.filter({ has: page.getByRole("heading", { name: "승인 대기 게시글" }) });

		const pendingItem = pendingSection
			.getByRole("listitem")
			.filter({ has: page.getByText(title) })
			.first();
		await expect(pendingItem).toBeVisible();

		await pendingItem.getByRole("button", { name: "게시 승인" }).click();

		await expect(pendingSection.getByText(title)).toHaveCount(0);

		const adminRow = page.locator("table tr").filter({ has: page.getByText(title) });
		await expect(adminRow.getByText("게시")).toBeVisible();
	});

	test("교사 일정 초안이 관리자 게시로 전환된다", async ({ page, context }) => {
		const title = `${TITLE_PREFIX} 일정 승인 ${Date.now()}`;
		const start = futureDateTime(48);
		const end = futureDateTime(50);

		await loginAs(page, {
			...teacherCredentials,
			redirect: "/admin/class-schedules",
		});

	await page.getByRole("heading", { name: "일정 등록" }).waitFor();
	const scheduleForm = page
		.locator("form")
		.filter({ has: page.getByLabel("대상 반", { exact: true }) })
		.first();

	await scheduleForm.getByLabel("대상 반", { exact: true }).selectOption({ label: CLASSROOM_NAME });
	await scheduleForm.getByLabel("제목", { exact: true }).fill(title);
	await scheduleForm.getByLabel("설명", { exact: true }).fill("Playwright 자동화 테스트용 학사 일정입니다.");
	await scheduleForm.getByLabel("장소", { exact: true }).fill("테스트 교실");
	await scheduleForm.getByLabel("시작일시", { exact: true }).fill(start);
	await scheduleForm.getByLabel("종료일시 (선택)", { exact: true }).fill(end);
	await scheduleForm.getByRole("button", { name: "등록" }).click();

		await expect(page.getByText("초안이 저장되었습니다", { exact: false })).toBeVisible();

	const draftRow = page.locator("table tr").filter({ has: page.getByText(title) });
	await expect(draftRow.getByText("승인 대기", { exact: true }).first()).toBeVisible();

		await context.clearCookies();
		await loginAs(page, {
			...adminCredentials,
			redirect: "/admin/class-schedules",
		});

		const pendingSection = page
			.locator("section")
			.filter({ has: page.getByRole("heading", { name: "승인 대기 일정" }) });

		const pendingItem = pendingSection
			.getByRole("listitem")
			.filter({ has: page.getByText(title) })
			.first();
		await expect(pendingItem).toBeVisible();

		await pendingItem.getByRole("button", { name: "게시 승인" }).click();

		await expect(pendingSection.getByText(title)).toHaveCount(0);

	const publishedRow = page.locator("table tr").filter({ has: page.getByText(title) });
	await expect(publishedRow.getByText("게시", { exact: true }).first()).toBeVisible();
	});

	test("급식 첨부 검증과 중복 방지 메시지를 확인한다", async ({ page }) => {
		const menuDate = futureDateTime(72).slice(0, 10);
		const duplicateMenuDate = menuDate;
		const notesPrefix = `${TITLE_PREFIX} 급식 테스트`;

		await loginAs(page, {
			...nutritionCredentials,
			redirect: "/admin/meals",
		});

		// Invalid attachment URL
	await page.getByRole("heading", { name: "급식 정보 등록" }).waitFor();
	const mealForm = page
		.locator("form")
		.filter({ has: page.getByLabel("날짜", { exact: true }) })
		.first();

	await mealForm.getByLabel("날짜", { exact: true }).fill(menuDate);
	await mealForm.getByLabel("메뉴", { exact: true }).fill("테스트 식단 1\n테스트 식단 2");
	await mealForm.getByLabel("특이 사항 (선택)", { exact: true }).fill(`${notesPrefix} - invalid`);
	await mealForm.getByLabel("알레르기 (선택)", { exact: true }).fill("계란, 우유");
	await mealForm.locator('input#attachmentUrl-0').fill("ftp://invalid-url.test/file.pdf");

	await mealForm.getByRole("button", { name: "등록" }).click();
		await expect(
			page.getByText("첨부 URL은 http 또는 https 주소로 입력해 주세요."),
		).toBeVisible();

		// Valid creation
	await mealForm.getByLabel("날짜", { exact: true }).fill(menuDate);
	await mealForm.getByLabel("메뉴", { exact: true }).fill("테스트 식단 1\n테스트 식단 2");
	await mealForm.getByLabel("특이 사항 (선택)", { exact: true }).fill(`${notesPrefix} - valid`);
	await mealForm.locator('input#attachmentUrl-0').fill("https://example.com/menu.pdf");

	await mealForm.getByRole("button", { name: "등록" }).click();
		await expect(page.getByText("급식 정보를 등록했습니다.")).toBeVisible();

		const mealRow = page.locator("table tr").filter({ has: page.getByText(`${notesPrefix} - valid`) });
		await expect(mealRow).toBeVisible();

		// Duplicate detection
	await mealForm.getByLabel("날짜", { exact: true }).fill(duplicateMenuDate);
	await mealForm.getByLabel("메뉴", { exact: true }).fill("테스트 식단 1");
	await mealForm.getByLabel("특이 사항 (선택)", { exact: true }).fill(`${notesPrefix} - duplicate`);

	await mealForm.getByRole("button", { name: "등록" }).click();
		await expect(
			page.getByText("이미 같은 날짜와 식단 유형의 급식 정보가 등록되어 있습니다."),
		).toBeVisible();

		// Cleanup created plan through UI
		page.once("dialog", async (dialog) => {
			await dialog.accept();
		});
		await mealRow.getByRole("button", { name: "삭제" }).click();

		await expect(mealRow).toHaveCount(0);
	});
});
