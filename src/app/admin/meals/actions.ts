"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import type { FormState } from "../form-state";

const ALLOWED_ATTACHMENT_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".gif", ".webp"];
const ALLOWED_ATTACHMENT_HOSTS = ["drive.google.com", "docs.google.com"];

function isValidHttpUrl(value: string) {
	try {
		const url = new URL(value);
		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}

function hasAllowedAttachmentType(value: string) {
	try {
		const url = new URL(value);
		const pathname = url.pathname.toLowerCase();
		if (ALLOWED_ATTACHMENT_EXTENSIONS.some((extension) => pathname.endsWith(extension))) {
			return true;
		}
		return ALLOWED_ATTACHMENT_HOSTS.some((host) => url.hostname.toLowerCase().endsWith(host));
	} catch {
		return false;
	}
}

function dedupeStrings(values: string[] = []) {
	return Array.from(new Set(values.map((value) => value.trim()).filter((value) => value.length > 0)));
}

function inferAttachmentMediaType(value: string) {
	try {
		const url = new URL(value);
		const pathname = url.pathname.toLowerCase();
		if (pathname.endsWith(".pdf")) return "document";
		if (pathname.match(/\.(jpg|jpeg|png|gif|webp)$/)) return "image";
		return undefined;
	} catch {
		return undefined;
	}
}

const mealPlanSchema = z.object({
	menuDate: z.string().min(1, "날짜를 선택해 주세요."),
	mealType: z.enum(["breakfast", "lunch", "dinner", "snack", "other"]).default("lunch"),
	menuItems: z
		.string()
		.min(1, "메뉴를 한 가지 이상 입력해 주세요.")
		.transform((value) =>
			value
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => line.length > 0),
		),
	allergens: z
		.string()
		.optional()
		.transform((value) =>
			dedupeStrings(
				(value ?? "")
					.split(",")
					.map((item) => item.trim())
					.filter((item) => item.length > 0),
			),
		),
	notes: z
		.string()
		.optional()
		.transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined)),
	audienceScope: z.enum(["parents", "staff", "all"]).default("parents"),
	attachments: z
		.array(
			z.object({
				label: z
					.string()
					.optional()
					.transform((value) => {
						const trimmed = value?.trim();
						return trimmed && trimmed.length > 0 ? trimmed : undefined;
					}),
				url: z
					.string()
					.optional()
					.transform((value) => {
						const trimmed = value?.trim();
						return trimmed && trimmed.length > 0 ? trimmed : undefined;
					})
					.refine((value) => !value || isValidHttpUrl(value), {
						message: "첨부 URL은 http 또는 https 주소로 입력해 주세요.",
					})
					.refine((value) => !value || hasAllowedAttachmentType(value), {
						message: "PDF 또는 이미지(JPG, PNG, GIF, WEBP) 주소만 업로드할 수 있습니다.",
					}),
			}),
		)
		.max(3),
});

const mealPlanUpdateSchema = mealPlanSchema.extend({
	planId: z.string().uuid(),
});

function normalizeFormData(formData: FormData) {
	const attachmentLabels = formData.getAll("attachmentLabel") as string[];
	const attachmentUrls = formData.getAll("attachmentUrl") as (string | undefined)[];
	const attachmentCount = Math.max(attachmentLabels.length, attachmentUrls.length);

	const attachments = Array.from({ length: attachmentCount }).map((_, index) => ({
		label: attachmentLabels[index],
		url: attachmentUrls[index],
	}));

	return {
		menuDate: formData.get("menuDate")?.toString() ?? "",
		mealType: formData.get("mealType")?.toString() ?? "lunch",
		menuItems: formData.get("menuItems")?.toString() ?? "",
		allergens: formData.get("allergens")?.toString(),
		notes: formData.get("notes")?.toString(),
		audienceScope: formData.get("audienceScope")?.toString() ?? "parents",
		attachments,
	};
}

export async function createMealPlanAction(_: FormState, formData: FormData): Promise<FormState> {
	const session = await auth();
	const role = session?.user?.role ?? "";

	if (!session || (role !== "admin" && role !== "nutrition")) {
		return { status: "error", message: "급식 관리 권한이 필요합니다." };
	}

	const parsed = mealPlanSchema.safeParse(normalizeFormData(formData));
	if (!parsed.success) {
		return {
			status: "error",
			message: "입력값을 확인해 주세요.",
			issues: parsed.error.issues.map((issue) => issue.message),
		};
	}

	const data = parsed.data;
	const menuDate = new Date(data.menuDate);
	if (Number.isNaN(menuDate.getTime())) {
		return { status: "error", message: "유효한 날짜를 입력해 주세요." };
	}
	const menuDateDay = menuDate.toISOString().slice(0, 10);

	const duplicateCheck = await db`
		SELECT id
		FROM meal_plans
		WHERE DATE(menu_date) = ${menuDateDay}
			AND meal_type = ${data.mealType}
		LIMIT 1
	`;

	if (duplicateCheck.rows.length > 0) {
		return {
			status: "error",
			message: "이미 같은 날짜와 식단 유형의 급식 정보가 등록되어 있습니다.",
		};
	}

	const mealPlanResult = await db`
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
			${menuDate.toISOString()},
			${data.mealType},
			${JSON.stringify(data.menuItems)},
			${data.allergens ? JSON.stringify(data.allergens) : null},
			${data.notes ?? null},
			${data.audienceScope},
			${session.user.id},
			${session.user.id}
		)
		RETURNING id
	`;

	const planId = mealPlanResult.rows[0]?.id as string | undefined;
	if (!planId) {
		return { status: "error", message: "급식 정보를 저장하지 못했습니다." };
	}

	for (const attachment of data.attachments) {
		if (!attachment.url) {
			continue;
		}
		await db`
			INSERT INTO meal_plan_resources (plan_id, file_url, label, media_type)
			VALUES (
				${planId},
				${attachment.url},
				${attachment.label ?? null},
				${inferAttachmentMediaType(attachment.url) ?? null}
			)
		`;
	}

	revalidatePath("/admin/meals");
	revalidatePath("/parents/meals");
	revalidatePath("/meals");

	return { status: "success", message: "급식 정보를 등록했습니다." };
}

export async function deleteMealPlanAction(_: FormState, formData: FormData): Promise<FormState> {
	const session = await auth();
	const role = session?.user?.role ?? "";

	if (!session || (role !== "admin" && role !== "nutrition")) {
		return { status: "error", message: "급식 관리 권한이 필요합니다." };
	}

	const planId = formData.get("planId")?.toString();
	if (!planId) {
		return { status: "error", message: "삭제할 항목을 찾지 못했습니다." };
	}

	await db`DELETE FROM meal_plan_resources WHERE plan_id = ${planId}`;
	await db`DELETE FROM meal_plans WHERE id = ${planId}`;

	revalidatePath("/admin/meals");
	revalidatePath("/parents/meals");
	revalidatePath("/meals");

	return { status: "success", message: "삭제되었습니다." };
}

export async function updateMealPlanAction(_: FormState, formData: FormData): Promise<FormState> {
	const session = await auth();
	const role = session?.user?.role ?? "";

	if (!session || (role !== "admin" && role !== "nutrition")) {
		return { status: "error", message: "급식 관리 권한이 필요합니다." };
	}

	const parsed = mealPlanUpdateSchema.safeParse({
		...normalizeFormData(formData),
		planId: formData.get("planId")?.toString() ?? "",
	});

	if (!parsed.success) {
		return {
			status: "error",
			message: "입력값을 확인해 주세요.",
			issues: parsed.error.issues.map((issue) => issue.message),
		};
	}

	const data = parsed.data;
	const planId = data.planId;
	const menuDate = new Date(data.menuDate);
	if (Number.isNaN(menuDate.getTime())) {
		return { status: "error", message: "유효한 날짜를 입력해 주세요." };
	}
	const menuDateDay = menuDate.toISOString().slice(0, 10);

	const duplicateCheck = await db`
		SELECT id
		FROM meal_plans
		WHERE DATE(menu_date) = ${menuDateDay}
			AND meal_type = ${data.mealType}
			AND id <> ${planId}
		LIMIT 1
	`;

	if (duplicateCheck.rows.length > 0) {
		return {
			status: "error",
			message: "같은 날짜와 식단 유형의 급식 정보가 이미 존재합니다.",
		};
	}

	const updated = await db`
		UPDATE meal_plans
		SET
			menu_date = ${menuDate.toISOString()},
			meal_type = ${data.mealType},
			menu_items = ${JSON.stringify(data.menuItems)},
			allergens = ${data.allergens && data.allergens.length > 0 ? JSON.stringify(data.allergens) : null},
			notes = ${data.notes ?? null},
			audience_scope = ${data.audienceScope},
			updated_by = ${session.user.id},
			updated_at = now()
		WHERE id = ${planId}
		RETURNING id
	`;

	if (!updated.rows.length) {
		return { status: "error", message: "급식 정보를 찾을 수 없습니다." };
	}

	await db`DELETE FROM meal_plan_resources WHERE plan_id = ${planId}`;
	for (const attachment of data.attachments) {
		if (!attachment.url) {
			continue;
		}
		await db`
			INSERT INTO meal_plan_resources (plan_id, file_url, label, media_type)
			VALUES (
				${planId},
				${attachment.url},
				${attachment.label ?? null},
				${inferAttachmentMediaType(attachment.url) ?? null}
			)
		`;
	}

	revalidatePath("/admin/meals");
	revalidatePath("/parents/meals");
	revalidatePath("/meals");

	return { status: "success", message: "급식 정보를 수정했습니다." };
}

const nutritionBulletinSchema = z.object({
	title: z.string().min(2, "제목을 입력해 주세요."),
	content: z.string().min(5, "내용을 입력해 주세요."),
	category: z.enum(["bulletin", "report", "menu_plan"]).default("bulletin"),
	status: z.enum(["draft", "published", "archived"]).default("draft"),
	publishAt: z
		.string()
		.optional()
		.transform((value) => {
			const trimmed = value?.trim();
			if (!trimmed) return undefined;
			const date = new Date(trimmed);
			return Number.isNaN(date.getTime()) ? undefined : date;
		}),
});

const nutritionBulletinUpdateSchema = nutritionBulletinSchema.extend({
	bulletinId: z.string().uuid(),
});

const changeNutritionBulletinStatusSchema = z.object({
	bulletinId: z.string().uuid(),
	status: z.enum(["draft", "published", "archived"]),
});

function normalizeBulletinFormData(formData: FormData) {
	return {
		title: formData.get("title")?.toString() ?? "",
		content: formData.get("content")?.toString() ?? "",
		category: (formData.get("category")?.toString() ?? "bulletin") as z.infer<typeof nutritionBulletinSchema>["category"],
		status: (formData.get("status")?.toString() ?? "draft") as z.infer<typeof nutritionBulletinSchema>["status"],
		publishAt: formData.get("publishAt")?.toString(),
	};
}

export async function createNutritionBulletinAction(_: FormState, formData: FormData): Promise<FormState> {
	const session = await auth();
	const role = session?.user?.role ?? "";

	if (!session || (role !== "admin" && role !== "nutrition")) {
		return { status: "error", message: "영양 게시물을 등록할 권한이 필요합니다." };
	}

	const parsed = nutritionBulletinSchema.safeParse(normalizeBulletinFormData(formData));
	if (!parsed.success) {
		return {
			status: "error",
			message: "입력값을 확인해 주세요.",
			issues: parsed.error.issues.map((issue) => issue.message),
		};
	}

	const data = parsed.data;

	const publishAtValue =
		data.status === "published"
			? (data.publishAt ?? new Date())
			: data.publishAt;

	await db`
		INSERT INTO nutrition_bulletins (
			title,
			content,
			category,
			status,
			publish_at,
			created_by,
			updated_by
		)
		VALUES (
			${data.title},
			${data.content},
			${data.category},
			${data.status},
			${publishAtValue ? publishAtValue.toISOString() : null},
			${session.user.id},
			${session.user.id}
		)
	`;

	revalidatePath("/admin/meals");
	revalidatePath("/parents/meals");
	revalidatePath("/meals");

	return { status: "success", message: "영양 게시물을 등록했습니다." };
}

export async function updateNutritionBulletinAction(_: FormState, formData: FormData): Promise<FormState> {
	const session = await auth();
	const role = session?.user?.role ?? "";

	if (!session || (role !== "admin" && role !== "nutrition")) {
		return { status: "error", message: "영양 게시물을 수정할 권한이 필요합니다." };
	}

	const parsed = nutritionBulletinUpdateSchema.safeParse({
		...normalizeBulletinFormData(formData),
		bulletinId: formData.get("bulletinId")?.toString() ?? "",
	});

	if (!parsed.success) {
		return {
			status: "error",
			message: "입력값을 확인해 주세요.",
			issues: parsed.error.issues.map((issue) => issue.message),
		};
	}

	const data = parsed.data;
	const publishAtValue =
		data.status === "published"
			? (data.publishAt ?? new Date())
			: undefined;
	let publishAtIso: string | null;
	if (data.status === "draft") {
		publishAtIso = null;
	} else if (data.status === "archived") {
		publishAtIso = data.publishAt ? data.publishAt.toISOString() : null;
	} else {
		publishAtIso = publishAtValue ? publishAtValue.toISOString() : null;
	}

	const updated = await db`
		UPDATE nutrition_bulletins
		SET
			title = ${data.title},
			content = ${data.content},
			category = ${data.category},
			status = ${data.status},
			publish_at = ${publishAtIso},
			updated_by = ${session.user.id},
			updated_at = now()
		WHERE id = ${data.bulletinId}
		RETURNING id
	`;

	if (!updated.rows.length) {
		return { status: "error", message: "영양 게시물을 찾을 수 없습니다." };
	}

	revalidatePath("/admin/meals");
	revalidatePath("/parents/meals");
	revalidatePath("/meals");

	return { status: "success", message: "영양 게시물을 수정했습니다." };
}

export async function changeNutritionBulletinStatusAction(_: FormState, formData: FormData): Promise<FormState> {
	const session = await auth();
	const role = session?.user?.role ?? "";

	if (!session || (role !== "admin" && role !== "nutrition")) {
		return { status: "error", message: "영양 게시물을 변경할 권한이 필요합니다." };
	}

	const parsed = changeNutritionBulletinStatusSchema.safeParse({
		bulletinId: formData.get("bulletinId")?.toString() ?? "",
		status: formData.get("status")?.toString() ?? "",
	});

	if (!parsed.success) {
		return { status: "error", message: "상태를 변경할 수 없습니다." };
	}

	const { bulletinId, status } = parsed.data;

	await db`
		UPDATE nutrition_bulletins
		SET
			status = ${status},
			publish_at = CASE
				WHEN ${status} = 'published' THEN COALESCE(publish_at, now())
				WHEN ${status} = 'draft' THEN NULL
				ELSE publish_at
			END,
			updated_by = ${session.user.id},
			updated_at = now()
		WHERE id = ${bulletinId}
	`;

	revalidatePath("/admin/meals");
	revalidatePath("/parents/meals");
	revalidatePath("/meals");

	return { status: "success", message: "상태가 변경되었습니다." };
}

export async function deleteNutritionBulletinAction(_: FormState, formData: FormData): Promise<FormState> {
	const session = await auth();
	const role = session?.user?.role ?? "";

	if (!session || (role !== "admin" && role !== "nutrition")) {
		return { status: "error", message: "영양 게시물을 삭제할 권한이 필요합니다." };
	}

	const bulletinId = formData.get("bulletinId")?.toString();
	if (!bulletinId) {
		return { status: "error", message: "삭제할 게시물을 찾지 못했습니다." };
	}

	await db`DELETE FROM nutrition_bulletins WHERE id = ${bulletinId}`;

	revalidatePath("/admin/meals");
	revalidatePath("/parents/meals");
	revalidatePath("/meals");

	return { status: "success", message: "삭제되었습니다." };
}
