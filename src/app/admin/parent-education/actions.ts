"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { initialFormState, type FormState } from "../form-state";

const categoryEnum = z.enum(["parent_class", "parent_recipe", "seminar"]);

const baseSchema = z.object({
	title: z.string().min(2, "제목을 입력해 주세요."),
	slug: z
		.string()
		.trim()
		.optional()
		.transform((value) => (value && value.length > 0 ? value : undefined)),
	category: categoryEnum,
	summary: z
		.string()
		.optional()
		.transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined)),
	content: z
		.string()
		.optional()
		.transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined)),
	audienceScope: z.enum(["parents", "staff"]).default("parents"),
	publishNow: z.boolean().default(false),
});

function slugify(title: string) {
	return title
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

function mapFormData(formData: FormData) {
	return {
		title: (formData.get("title") as string | null) ?? "",
		slug: formData.get("slug") as string | undefined,
		category: (formData.get("category") as string | undefined) ?? "parent_recipe",
		summary: formData.get("summary") as string | undefined,
		content: formData.get("content") as string | undefined,
		audienceScope: (formData.get("audienceScope") as string | undefined) ?? "parents",
		publishNow: formData.get("publishNow") === "on",
	};
}

function assertAdmin(session: Awaited<ReturnType<typeof auth>>) {
	if (!session || session.user?.role !== "admin") {
		throw new Error("관리자 권한이 필요합니다.");
	}
	return session;
}

function revalidateParentEducation() {
	revalidatePath("/education/parent-education");
	revalidatePath("/admin/parent-education");
	revalidatePath("/api/parent-education");
}

export async function createParentEducationPostAction(
	_prevState: FormState,
	formData: FormData,
): Promise<FormState> {
	const session = await auth();
	try {
		assertAdmin(session);
	} catch (error) {
		return { status: "error", message: error instanceof Error ? error.message : "권한이 필요합니다." };
	}

	const parsed = baseSchema.safeParse(mapFormData(formData));
	if (!parsed.success) {
		return {
			status: "error",
			message: "입력값을 확인해 주세요.",
			issues: parsed.error.issues.map((issue) => issue.message),
		};
	}

	const data = parsed.data;
	const slug = data.slug ?? slugify(data.title);
	const publishAtValue = data.publishNow ? new Date() : null;

	await db`
		INSERT INTO parent_education_posts (
			slug,
			title,
			summary,
			content,
			category,
			audience_scope,
			is_published,
			publish_at,
			created_by,
			updated_by
		) VALUES (
			${slug},
			${data.title},
			${data.summary ?? null},
			${data.content ?? null},
			${data.category},
			${data.audienceScope},
			${data.publishNow},
			${publishAtValue},
			${session?.user?.id ?? null},
			${session?.user?.id ?? null}
		)
		ON CONFLICT (slug)
		DO UPDATE SET
			title = EXCLUDED.title,
			summary = EXCLUDED.summary,
			content = EXCLUDED.content,
			category = EXCLUDED.category,
			audience_scope = EXCLUDED.audience_scope,
			is_published = EXCLUDED.is_published,
			publish_at = EXCLUDED.publish_at,
			updated_at = now(),
			updated_by = ${session?.user?.id ?? null}
	`;

	revalidateParentEducation();

	return { status: "success", message: "부모교육 글이 저장되었습니다." };
}

const toggleSchema = z.object({
	postId: z.string().uuid(),
	isPublished: z.boolean(),
});

export async function toggleParentEducationPublishAction(
	_prevState: FormState,
	formData: FormData,
): Promise<FormState> {
	const session = await auth();
	try {
		assertAdmin(session);
	} catch (error) {
		return { status: "error", message: error instanceof Error ? error.message : "권한이 필요합니다." };
	}

	const parsed = toggleSchema.safeParse({
		postId: (formData.get("postId") as string) ?? "",
		isPublished: formData.get("isPublished") === "true",
	});

	if (!parsed.success) {
		return { status: "error", message: "요청을 확인해 주세요." };
	}

	const { postId, isPublished } = parsed.data;
	const publishAtValue = isPublished ? new Date() : null;

	await db`
		UPDATE parent_education_posts
		SET
			is_published = ${isPublished},
			publish_at = ${publishAtValue},
			updated_at = now(),
			updated_by = ${session?.user?.id ?? null}
		WHERE id = ${postId}
	`;

	revalidateParentEducation();

	return { status: "success", message: isPublished ? "게시 상태로 전환했습니다." : "초안 상태로 전환했습니다." };
}

const deleteSchema = z.object({
	postId: z.string().uuid(),
});

export async function deleteParentEducationPostAction(
	_prevState: FormState,
	formData: FormData,
): Promise<FormState> {
	const session = await auth();
	try {
		assertAdmin(session);
	} catch (error) {
		return { status: "error", message: error instanceof Error ? error.message : "권한이 필요합니다." };
	}

	const parsed = deleteSchema.safeParse({
		postId: (formData.get("postId") as string) ?? "",
	});

	if (!parsed.success) {
		return { status: "error", message: "삭제할 게시글을 확인해 주세요." };
	}

	await db`
		DELETE FROM parent_education_posts
		WHERE id = ${parsed.data.postId}
	`;

	revalidateParentEducation();

	return { status: "success", message: "삭제되었습니다." };
}
