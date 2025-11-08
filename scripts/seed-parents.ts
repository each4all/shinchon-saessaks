import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config } from "dotenv";
import { db } from "@/lib/db";

const envFile = [".env.local", ".env"].find((file) => existsSync(resolve(process.cwd(), file)));
if (envFile) {
	config({ path: envFile });
}

async function seedParents() {
	console.log("🔄 Seeding classrooms/children...");

	const classroomRows: { id: string; name: string }[] = [];
	const targetClassrooms = [
		{ name: "Petit A (만3세)", description: "첫 등원 적응반", age: "만3세", lead: "김하늘", assistant: "이세온" },
		{ name: "Prime B (만4세)", description: "융합 프로젝트 반", age: "만4세", lead: "박가온", assistant: "정다빈" },
	];

	for (const classroom of targetClassrooms) {
		const existing = await db`SELECT id FROM classrooms WHERE name = ${classroom.name}`;
		if (existing.rows.length > 0) {
			classroomRows.push({ id: existing.rows[0].id, name: classroom.name });
			await db`
				UPDATE classrooms
				SET description = ${classroom.description},
					age_range = ${classroom.age},
					lead_teacher = ${classroom.lead},
					assistant_teacher = ${classroom.assistant},
					updated_at = now()
				WHERE id = ${existing.rows[0].id}
			`;
		} else {
			const inserted = await db`
				INSERT INTO classrooms (name, description, age_range, lead_teacher, assistant_teacher)
				VALUES (${classroom.name}, ${classroom.description}, ${classroom.age}, ${classroom.lead}, ${classroom.assistant})
				RETURNING id, name
			`;
			classroomRows.push(inserted.rows[0] as { id: string; name: string });
		}
	}

	const petitId = classroomRows.find((row) => row.name.includes("Petit"))?.id;
	const primeId = classroomRows.find((row) => row.name.includes("Prime"))?.id;

	const childRows: { id: string; name: string }[] = [];
const targetChildren = [
		{ name: "김솔", classroomId: petitId },
		{ name: "박하윤", classroomId: primeId },
	];

	for (const child of targetChildren) {
		const existingChild = await db`SELECT id FROM children WHERE name = ${child.name}`;
		if (existingChild.rows.length > 0) {
			childRows.push({ id: existingChild.rows[0].id, name: child.name });
			await db`
				UPDATE children SET classroom_id = ${child.classroomId}, updated_at = now() WHERE id = ${existingChild.rows[0].id}
			`;
		} else if (child.classroomId) {
			const insertedChild = await db`
				INSERT INTO children (classroom_id, name, status)
				VALUES (${child.classroomId}, ${child.name}, 'active')
				RETURNING id, name
			`;
			childRows.push(insertedChild.rows[0] as { id: string; name: string });
		}
	}

	const [parent] = (await db`SELECT id FROM users WHERE email = 'parent-active@playwright.test'`).rows;
const [admin] = (await db`SELECT id FROM users WHERE email = 'admin@playwright.test'`).rows;
const [nutrition] = (await db`SELECT id FROM users WHERE email = 'nutrition@playwright.test'`).rows;

	if (parent) {
		for (const child of childRows) {
			await db`
				INSERT INTO child_parents (child_id, parent_id, relationship, primary_contact)
				VALUES (${child.id}, ${parent.id}, 'mother', true)
				ON CONFLICT DO NOTHING
			`;
		}
	}

	const classPostSeeds = [
		{
			title: "10월 주간 프로젝트 안내",
			summary: "나무와 가을 잎을 주제로 한 주간 프로젝트 안내",
			content: [
				"이번 주 Petit A 반은 '가을 숲 관찰' 프로젝트를 진행합니다.",
				"월요일에는 교실에서 낙엽과 열매를 탐색하고, 수요일에는 야외 관찰을 진행합니다.",
				"금요일에는 부모님과 함께하는 작은 전시 시간을 가질 예정입니다.",
			],
			classroomId: petitId,
			attachments: [
				{
					label: "가정 안내문",
					url: "http://www.shinchonkid.com/web/upload/parent-letter-1014.jpg",
				},
			],
		},
		{
			title: "Prime B 11월 일정",
			summary: "11월 통합 프로젝트와 생일파티 일정",
			content: [
				"11월에는 '우리 몸 탐험' 프로젝트를 진행하며, 금요일마다 실험 활동이 진행됩니다.",
				"11/15에는 4세 생일파티가 있으니 간단한 간식을 준비해 주세요.",
			],
			classroomId: primeId,
			attachments: [],
		},
	];

	for (const post of classPostSeeds) {
		if (!post.classroomId) continue;
		const contentJson = JSON.stringify(post.content);
		const existingPost = await db`
			SELECT id FROM class_posts WHERE title = ${post.title} AND classroom_id = ${post.classroomId}
		`;

		let postId = existingPost.rows[0]?.id as string | undefined;

		if (postId) {
			await db`
				UPDATE class_posts
				SET summary = ${post.summary},
					content = ${contentJson},
					publish_at = now(),
					status = 'published',
					published_at = now(),
					published_by = ${admin?.id ?? null},
					updated_by = ${admin?.id ?? null},
					updated_at = now()
				WHERE id = ${postId}
			`;
		} else {
			const insertedPost = await db`
				INSERT INTO class_posts (classroom_id, author_id, title, summary, content, publish_at, status, published_at, published_by)
				VALUES (${post.classroomId}, ${admin?.id ?? null}, ${post.title}, ${post.summary}, ${contentJson}, now(), 'published', now(), ${admin?.id ?? null})
				RETURNING id
			`;
			postId = insertedPost.rows[0]?.id as string;
		}

		if (!postId) continue;

		await db`DELETE FROM class_post_media WHERE post_id = ${postId}`;

		for (const [index, attachment] of post.attachments.entries()) {
			await db`
				INSERT INTO class_post_media (post_id, file_url, caption, alt_text, media_type, display_order)
				VALUES (
					${postId},
					${attachment.url},
					${attachment.label ?? null},
					${attachment.label ?? null},
					${"image"},
					${index}
				)
			`;
		}
	}

	const scheduleSeeds = [
		{
			title: "11월 방문 수업",
			description: "보호자 초청 공개수업",
			classroomId: petitId,
			startDate: new Date(Date.UTC(2025, 10, 14, 1, 0)),
			endDate: new Date(Date.UTC(2025, 10, 14, 3, 0)),
			location: "Petit A 교실",
		},
		{
			title: "정기 운영위원회",
			description: "11월 운영위원회 정기 회의",
			classroomId: null,
			startDate: new Date(Date.UTC(2025, 10, 20, 2, 0)),
			endDate: new Date(Date.UTC(2025, 10, 20, 3, 0)),
			location: "본관 2층 회의실",
		},
	];

	for (const schedule of scheduleSeeds) {
		const existingSchedule = await db`
			SELECT id FROM class_schedules WHERE title = ${schedule.title} AND start_date = ${schedule.startDate.toISOString()}
		`;
		if (existingSchedule.rows.length > 0) {
			await db`
				UPDATE class_schedules
				SET description = ${schedule.description ?? null},
					classroom_id = ${schedule.classroomId ?? null},
					end_date = ${schedule.endDate?.toISOString() ?? null},
					location = ${schedule.location ?? null},
					updated_at = now()
				WHERE id = ${existingSchedule.rows[0].id}
			`;
		} else {
			await db`
				INSERT INTO class_schedules (classroom_id, title, description, start_date, end_date, location)
				VALUES (${schedule.classroomId ?? null}, ${schedule.title}, ${schedule.description ?? null}, ${schedule.startDate.toISOString()}, ${schedule.endDate?.toISOString() ?? null}, ${schedule.location ?? null})
			`;
		}
	}

	const mealPlanSeeds = [
		{
			menuDate: new Date(Date.UTC(2025, 9, 6)),
			mealType: "lunch",
			menuItems: ["현미밥", "어묵국", "닭가슴살채소볶음", "계란찜", "사과"],
			allergens: ["계란", "대두"],
			notes: "전체 공개 식단 예시입니다. 알레르기 1,5번 포함.",
			audienceScope: "all",
			attachments: [
				{
					label: "10월 2주 식단표 (PDF)",
					url: "https://www.shinchonkid.com/web/upload/meal/2025-10-week2.pdf",
				},
			],
		},
		{
			menuDate: new Date(Date.UTC(2025, 9, 7)),
			mealType: "snack",
			menuItems: ["현미떡", "우유"],
			allergens: ["우유"],
			notes: "학부모 전용 간식 정보입니다.",
			audienceScope: "parents",
			attachments: [],
		},
	];

	for (const mealPlan of mealPlanSeeds) {
		const menuDateIso = mealPlan.menuDate.toISOString();
		const menuDateDay = menuDateIso.slice(0, 10);
		const audienceScope = mealPlan.audienceScope;

		const existingPlan = await db`
			SELECT id FROM meal_plans
			WHERE DATE(menu_date) = ${menuDateDay}::date
				AND meal_type = ${mealPlan.mealType}
			LIMIT 1
		`;

		let planId = existingPlan.rows[0]?.id as string | undefined;

		if (planId) {
			await db`
				UPDATE meal_plans
				SET
					menu_date = ${menuDateIso},
					menu_items = ${JSON.stringify(mealPlan.menuItems)},
					allergens = ${mealPlan.allergens.length > 0 ? JSON.stringify(mealPlan.allergens) : null},
					notes = ${mealPlan.notes ?? null},
					audience_scope = ${audienceScope},
					updated_by = ${nutrition?.id ?? admin?.id ?? null},
					updated_at = now()
				WHERE id = ${planId}
			`;
		} else {
			const insertedPlan = await db`
				INSERT INTO meal_plans (
					menu_date,
					meal_type,
					menu_items,
					allergens,
					notes,
					audience_scope,
					created_by,
					updated_by
				)
				VALUES (
					${menuDateIso},
					${mealPlan.mealType},
					${JSON.stringify(mealPlan.menuItems)},
					${mealPlan.allergens.length > 0 ? JSON.stringify(mealPlan.allergens) : null},
					${mealPlan.notes ?? null},
					${audienceScope},
					${nutrition?.id ?? admin?.id ?? null},
					${nutrition?.id ?? admin?.id ?? null}
				)
				RETURNING id
			`;
			planId = insertedPlan.rows[0]?.id as string | undefined;
		}

		if (!planId) {
			continue;
		}

		await db`
			DELETE FROM meal_plan_resources
			WHERE plan_id = ${planId}
		`;

		for (const attachment of mealPlan.attachments) {
			if (!attachment.url) {
				continue;
			}
			await db`
				INSERT INTO meal_plan_resources (plan_id, file_url, label, media_type)
				VALUES (
					${planId},
					${attachment.url},
					${attachment.label ?? null},
					${attachment.url.toLowerCase().endsWith(".pdf") ? "document" : "image"}
				)
				ON CONFLICT DO NOTHING
			`;
		}
	}

	const resourceSeeds = [
		{
			title: "외출·조퇴 신청서",
			description: "아이의 외출 또는 조퇴가 필요할 때 제출하는 기본 양식",
			category: "행정/생활",
			resourceType: "form",
			fileUrl: "https://www.shinchonkid.com/web/upload/forms/early-dismissal.pdf",
			publishedAt: new Date(Date.UTC(2025, 8, 1)),
		},
		{
			title: "약 복용 의뢰서",
			description: "투약이 필요한 경우 교사에게 전달하는 의뢰서",
			category: "건강",
			resourceType: "form",
			fileUrl: "https://www.shinchonkid.com/web/upload/forms/medicine-consent.pdf",
			publishedAt: new Date(Date.UTC(2025, 7, 20)),
		},
		{
			title: "교외 체험학습 사전동의서",
			description: "학부모 주관 체험학습 신청 시 제출",
			category: "체험학습",
			resourceType: "form",
			fileUrl: "https://www.shinchonkid.com/web/upload/forms/fieldtrip-consent.pdf",
			publishedAt: new Date(Date.UTC(2025, 8, 15)),
		},
		{
			title: "2025년 2분기 운영위원회 회의록",
			description: "7월 정기회의 안건 및 의결 사항",
			category: "운영위원회",
			resourceType: "committee",
			fileUrl: "https://www.shinchonkid.com/web/upload/committee/2025-q2-minutes.pdf",
			publishedAt: new Date(Date.UTC(2025, 6, 10)),
		},
		{
			title: "2025년 계획된 예·결산 보고서",
			description: "운영위원회 공유용 재정 현황 보고",
			category: "운영위원회",
			resourceType: "committee",
			fileUrl: "https://www.shinchonkid.com/web/upload/committee/2025-budget-review.pdf",
			publishedAt: new Date(Date.UTC(2025, 5, 28)),
		},
	];

	for (const resource of resourceSeeds) {
		const existingResource = await db`
			SELECT id FROM parent_resources WHERE title = ${resource.title} AND resource_type = ${resource.resourceType}
		`;

		if (existingResource.rows.length > 0) {
			await db`
				UPDATE parent_resources
				SET description = ${resource.description ?? null},
					category = ${resource.category ?? null},
					file_url = ${resource.fileUrl},
					published_at = ${resource.publishedAt?.toISOString() ?? null},
					updated_at = now()
				WHERE id = ${existingResource.rows[0].id}
			`;
		} else {
			await db`
				INSERT INTO parent_resources (title, description, category, resource_type, file_url, published_at)
				VALUES (${resource.title}, ${resource.description ?? null}, ${resource.category ?? null}, ${resource.resourceType}, ${resource.fileUrl}, ${resource.publishedAt?.toISOString() ?? null})
			`;
		}
	}

	console.log("✅ Parent seed complete");
}

seedParents()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
