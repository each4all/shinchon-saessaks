"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import type { FormState } from "../form-state";

const createClassPostSchema = z.object({
	classroomId: z.string().uuid({ message: "반을 선택해 주세요." }),
	title: z.string().min(2, "제목을 입력해 주세요."),
	summary: z
		.string()
		.optional()
		.transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined)),
	contentMarkdown: z
		.string()
		.min(5, "본문을 입력해 주세요."),
	publishAt: z
		.string()
		.optional()
		.transform((value) => {
			const trimmed = value?.trim();
			if (!trimmed) return undefined;
			const date = new Date(trimmed);
			return Number.isNaN(date.getTime()) ? undefined : date;
		}),
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
					}),
			}),
		)
		.max(5),
	audienceScope: z.enum(["classroom", "all", "private"]).default("classroom"),
});

function markdownToParagraphs(markdown: string) {
	const normalized = markdown
		.replace(/\r\n/g, "\n")
		.replace(/[\t\f\v]/g, " ")
		.trim();

	const cleaned = normalized
		.replace(/!\[[^\]]*\]\([^)]*\)/g, "")
		.replace(/\[[^\]]*\]\(([^)]*)\)/g, "$1")
		.replace(/[`*_#>~-]/g, "");

	const paragraphs = cleaned
		.split(/\n{2,}/)
		.map((paragraph) => paragraph.trim())
		.filter((paragraph) => paragraph.length > 0);

	return JSON.stringify(paragraphs.length > 0 ? paragraphs : [cleaned]);
}

function mapFormData(formData: FormData) {
	const attachmentLabels = formData.getAll("attachmentLabel") as string[];
	const attachmentUrls = formData.getAll("attachmentUrl") as (string | undefined)[];

	const attachments = attachmentLabels.map((label, index) => ({
		label,
		url: attachmentUrls[index],
	}));

	return {
		classroomId: String(formData.get("classroomId") ?? ""),
		title: (formData.get("title") as string | null) ?? "",
		summary: formData.get("summary") as string | undefined,
		contentMarkdown: (formData.get("contentMarkdown") as string | null) ?? "",
		publishAt: formData.get("publishAt") as string | undefined,
		attachments,
		audienceScope: (formData.get("audienceScope") as string | undefined) ?? "classroom",
	};
}

async function isTeacherAssignedToClassroom(teacherId: string, classroomId: string) {
	const result = await db`
		SELECT 1
		FROM classroom_teachers
		WHERE teacher_id = ${teacherId}
			AND classroom_id = ${classroomId}
		LIMIT 1
	`;

	return result.rows.length > 0;
}

async function getPostAccessSnapshot(postId: string) {
	const { rows } = await db`
		SELECT classroom_id AS "classroomId", author_id AS "authorId", audience_scope AS "audienceScope"
		FROM class_posts
		WHERE id = ${postId}
		LIMIT 1
	`;
	return rows[0] as { classroomId: string | null; authorId: string | null; audienceScope: string } | undefined;
}

export async function createClassPostAction(_: FormState, formData: FormData): Promise<FormState> {
	const session = await auth();
	const role = session?.user?.role ?? "";

	if (!session || (role !== "admin" && role !== "teacher")) {
		return {
			status: "error",
			message: "권한이 필요합니다.",
		};
	}

	const parsed = createClassPostSchema.safeParse(mapFormData(formData));
	if (!parsed.success) {
		return {
			status: "error",
			message: "입력값을 확인해 주세요.",
			issues: parsed.error.issues.map((issue) => issue.message),
		};
	}

	const data = parsed.data;
	const audienceScope = role === "admin" ? data.audienceScope : "classroom";
	const publishAtValue = data.publishAt ? data.publishAt.toISOString() : null;
	const initialStatus = role === "admin" ? "published" : "draft";
	const initialPublishedAt = initialStatus === "published" ? new Date().toISOString() : null;

	if (role === "teacher") {
		const allowed = await isTeacherAssignedToClassroom(session.user.id, data.classroomId);
		if (!allowed) {
			return {
				status: "error",
				message: "담당 반이 아닌 게시글은 작성할 수 없습니다.",
			};
		}
	}

	try {
		const content = markdownToParagraphs(data.contentMarkdown);

		const inserted = await db`
			INSERT INTO class_posts (
				classroom_id,
				author_id,
				title,
				summary,
				content,
				publish_at,
				status,
				audience_scope,
				published_at,
				published_by,
				updated_by
			)
			VALUES (
				${data.classroomId},
				${session.user.id},
				${data.title},
				${data.summary ?? null},
				${content},
				${publishAtValue},
				${initialStatus},
				${audienceScope},
				${initialPublishedAt},
				${initialStatus === "published" ? session.user.id : null},
				${session.user.id}
			)
			RETURNING id
		`;

		const postId = inserted.rows[0]?.id as string | undefined;

		if (!postId) {
			throw new Error("게시글 저장에 실패했습니다.");
		}

		const attachments = data.attachments.filter((attachment) => attachment.url);
		for (const [index, attachment] of attachments.entries()) {
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

		revalidatePath("/admin/class-posts");
		revalidatePath("/parents");
		revalidatePath("/parents/posts");
		revalidatePath("/stories/class-news");

		const successMessage =
			role === "admin" ? "반 소식을 게시했습니다." : "초안이 저장되었습니다. 관리자 승인 후 게시됩니다.";

		return {
			status: "success",
			message: successMessage,
		};
	} catch (error) {
		console.error("[createClassPostAction]", error);
		return {
			status: "error",
			message: "게시글 저장 중 오류가 발생했습니다.",
		};
	}
}

export async function deleteClassPostAction(_: FormState, formData: FormData): Promise<FormState> {
	const session = await auth();
	const role = session?.user?.role ?? "";

	if (!session || (role !== "admin" && role !== "teacher")) {
		return {
			status: "error",
			message: "권한이 필요합니다.",
		};
	}

	const postId = formData.get("postId") as string | null;
	if (!postId) {
		return {
			status: "error",
			message: "삭제할 게시글을 찾을 수 없습니다.",
		};
	}

	const snapshot = await getPostAccessSnapshot(postId);
	if (!snapshot) {
		return {
			status: "error",
			message: "게시글을 찾을 수 없습니다.",
		};
	}

	if (role === "teacher") {
		if (!snapshot.classroomId) {
			return {
				status: "error",
				message: "담당 반이 아닌 게시글은 삭제할 수 없습니다.",
			};
		}
		const allowed = await isTeacherAssignedToClassroom(session.user.id, snapshot.classroomId);
		if (!allowed || snapshot.authorId !== session.user.id) {
			return {
				status: "error",
				message: "담당 반에서 작성한 게시글만 삭제할 수 있습니다.",
			};
		}
	}

	try {
		await db`DELETE FROM class_post_media WHERE post_id = ${postId}`;
		await db`DELETE FROM class_posts WHERE id = ${postId}`;

		revalidatePath("/admin/class-posts");
		revalidatePath("/parents");
		revalidatePath("/parents/posts");
		revalidatePath("/stories/class-news");

		return {
			status: "success",
			message: "반 소식을 삭제했습니다.",
		};
	} catch (error) {
		console.error("[deleteClassPostAction]", error);
		return {
			status: "error",
			message: "삭제 중 문제가 발생했습니다.",
		};
	}
}

export async function updateClassPostAction(_: FormState, formData: FormData): Promise<FormState> {
	const session = await auth();
	const role = session?.user?.role ?? "";

	if (!session || (role !== "admin" && role !== "teacher")) {
		return {
			status: "error",
			message: "권한이 필요합니다.",
		};
	}

	const postId = formData.get("postId")?.toString();
	if (!postId) {
		return {
			status: "error",
			message: "수정할 게시글을 찾을 수 없습니다.",
		};
	}

	const parsed = createClassPostSchema.safeParse(mapFormData(formData));
	if (!parsed.success) {
		return {
			status: "error",
			message: "입력값을 확인해 주세요.",
			issues: parsed.error.issues.map((issue) => issue.message),
		};
	}

	const data = parsed.data;
	const publishAtValue = data.publishAt ? data.publishAt.toISOString() : null;

	const snapshot = await getPostAccessSnapshot(postId);
	if (!snapshot) {
		return {
			status: "error",
			message: "게시글을 찾을 수 없습니다.",
		};
	}

	if (role === "teacher") {
		const currentClassroomId = snapshot.classroomId;
		if (!currentClassroomId) {
			return {
				status: "error",
				message: "담당 반이 아닌 게시글은 수정할 수 없습니다.",
			};
		}
		const assignedCurrent = await isTeacherAssignedToClassroom(session.user.id, currentClassroomId);
		const assignedNew =
			data.classroomId === currentClassroomId ||
			(await isTeacherAssignedToClassroom(session.user.id, data.classroomId));

		if (!assignedCurrent || !assignedNew) {
			return {
				status: "error",
				message: "담당 반 게시글만 수정할 수 있습니다.",
			};
		}
	}

	try {
		const content = markdownToParagraphs(data.contentMarkdown);
		const nextAudienceScope =
			role === "admin"
				? data.audienceScope
				: snapshot.audienceScope === "all"
					? "all"
					: "classroom";

		const updated = await db`
			UPDATE class_posts
			SET
				classroom_id = ${data.classroomId},
				title = ${data.title},
				summary = ${data.summary ?? null},
				content = ${content},
				publish_at = ${publishAtValue},
				audience_scope = ${nextAudienceScope},
				updated_by = ${session.user.id},
				updated_at = now()
			WHERE id = ${postId}
			RETURNING id
		`;

		if (!updated.rows.length) {
			return { status: "error", message: "게시글을 찾을 수 없습니다." };
		}

		await db`DELETE FROM class_post_media WHERE post_id = ${postId}`;
		const attachments = data.attachments.filter((attachment) => attachment.url);
		for (const [index, attachment] of attachments.entries()) {
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

		revalidatePath("/admin/class-posts");
		revalidatePath("/parents");
		revalidatePath("/parents/posts");
		revalidatePath("/stories/class-news");

		return {
			status: "success",
			message: "반 소식이 수정되었습니다.",
		};
	} catch (error) {
		console.error("[updateClassPostAction]", error);
		return {
			status: "error",
			message: "게시글 수정 중 문제가 발생했습니다.",
		};
	}
}

const changeStatusSchema = z.object({
	postId: z.string().uuid(),
	status: z.enum(["draft", "published", "archived"]),
});

export async function changeClassPostStatusAction(_: FormState, formData: FormData): Promise<FormState> {
	const session = await auth();
	const role = session?.user?.role ?? "";

	if (!session) {
		return { status: "error", message: "권한이 필요합니다." };
	}

	const parsed = changeStatusSchema.safeParse({
		postId: formData.get("postId")?.toString() ?? "",
		status: formData.get("status")?.toString() ?? "",
	});

	if (!parsed.success) {
		return {
			status: "error",
			message: "상태를 변경할 수 없습니다.",
		};
	}

	const { postId, status } = parsed.data;
	const snapshot = await getPostAccessSnapshot(postId);
	if (!snapshot) {
		return { status: "error", message: "게시글을 찾을 수 없습니다." };
	}

	if (role === "teacher") {
		if (status !== "draft") {
			return { status: "error", message: "게시나 숨김은 관리자만 가능합니다." };
		}
		if (!snapshot.classroomId) {
			return { status: "error", message: "담당 반이 아닌 게시글입니다." };
		}
		const allowed = await isTeacherAssignedToClassroom(session.user.id, snapshot.classroomId);
		if (!allowed) {
			return { status: "error", message: "담당 반 게시글만 변경할 수 있습니다." };
		}
	}

	await db`
		UPDATE class_posts
		SET
			status = ${status},
			published_at = CASE WHEN ${status} = 'published' THEN now() ELSE NULL END,
			published_by = CASE WHEN ${status} = 'published' THEN ${session.user.id}::uuid ELSE NULL END,
			updated_by = ${session.user.id},
			updated_at = now()
		WHERE id = ${postId}
	`;

	revalidatePath("/admin/class-posts");
	revalidatePath("/parents");
	revalidatePath("/parents/posts");
	revalidatePath("/stories/class-news");

	return { status: "success", message: "상태가 변경되었습니다." };
}
