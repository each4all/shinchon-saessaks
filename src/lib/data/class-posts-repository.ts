import { cache } from "react";

import { db } from "@/lib/db";

export type Classroom = {
	id: string;
	name: string;
	description?: string | null;
	ageRange?: string | null;
	leadTeacher?: string | null;
	assistantTeacher?: string | null;
};

export type ClassPost = {
	id: string;
	classroomId: string | null;
	classroomName?: string | null;
	title: string;
	summary?: string | null;
	content: string[];
	status: string;
	audienceScope: string;
	publishAt: Date | null;
	publishedAt?: Date | null;
	createdAt: Date;
	authorId?: string | null;
	attachments: {
		id: string;
		label?: string | null;
		caption?: string | null;
		fileUrl: string;
		thumbnailUrl?: string | null;
		mediaType?: string | null;
		altText?: string | null;
		isCover?: boolean;
		displayOrder?: number | null;
	}[];
};

export type ClassPostPreview = {
	id: string;
	classroomName?: string | null;
	title: string;
	summary?: string | null;
	publishAt: Date | null;
	createdAt: Date;
};

function parseContent(value: unknown): string[] {
	if (!value) return [];
	if (Array.isArray(value)) {
		return value.map((item) => String(item));
	}
	if (typeof value === "string") {
		try {
			const parsed = JSON.parse(value);
			if (Array.isArray(parsed)) {
				return parsed.map((item) => String(item));
			}
			return [String(parsed)];
		} catch {
			return [value];
		}
	}
	return [];
}

function parseAttachments(value: unknown) {
	if (!value) return [];
	if (typeof value === "string") {
		try {
			const parsed = JSON.parse(value);
			if (Array.isArray(parsed)) {
				return parsed
					.map((item) => {
						const caption =
							"caption" in (item as Record<string, unknown>) ? ((item as { caption?: string | null }).caption ?? null) : null;
						const label =
							"label" in (item as Record<string, unknown>) ? ((item as { label?: string | null }).label ?? null) : caption;
						return {
							id: String((item as { id?: string }).id ?? crypto.randomUUID()),
							label,
							caption,
							fileUrl: String((item as { fileUrl?: string }).fileUrl ?? ""),
							thumbnailUrl:
								"thumbnailUrl" in (item as Record<string, unknown>)
									? ((item as { thumbnailUrl?: string | null }).thumbnailUrl ?? null)
									: null,
							mediaType:
								"mediaType" in (item as Record<string, unknown>)
									? ((item as { mediaType?: string | null }).mediaType ?? null)
									: null,
							altText:
								"altText" in (item as Record<string, unknown>)
									? ((item as { altText?: string | null }).altText ?? null)
									: null,
							isCover:
								"isCover" in (item as Record<string, unknown>)
									? Boolean((item as { isCover?: boolean }).isCover)
									: false,
							displayOrder:
								"displayOrder" in (item as Record<string, unknown>)
									? Number((item as { displayOrder?: number | null }).displayOrder ?? 0)
									: null,
						};
					})
					.filter((attachment) => attachment.fileUrl.length > 0);
			}
			return [];
		} catch {
			return [];
		}
	}
	if (Array.isArray(value)) {
		return value
			.map((item) => {
				const caption =
					"caption" in (item as Record<string, unknown>) ? ((item as { caption?: string | null }).caption ?? null) : null;
				const label =
					"label" in (item as Record<string, unknown>) ? ((item as { label?: string | null }).label ?? null) : caption;
				return {
					id: String((item as { id?: string }).id ?? crypto.randomUUID()),
					label,
					caption,
					fileUrl: String((item as { fileUrl?: string }).fileUrl ?? ""),
					thumbnailUrl:
						"thumbnailUrl" in (item as Record<string, unknown>)
							? ((item as { thumbnailUrl?: string | null }).thumbnailUrl ?? null)
							: null,
					mediaType:
						"mediaType" in (item as Record<string, unknown>)
							? ((item as { mediaType?: string | null }).mediaType ?? null)
							: null,
					altText:
						"altText" in (item as Record<string, unknown>)
							? ((item as { altText?: string | null }).altText ?? null)
							: null,
					isCover:
						"isCover" in (item as Record<string, unknown>)
							? Boolean((item as { isCover?: boolean }).isCover)
							: false,
					displayOrder:
						"displayOrder" in (item as Record<string, unknown>)
							? Number((item as { displayOrder?: number | null }).displayOrder ?? 0)
							: null,
				};
			})
			.filter((attachment) => attachment.fileUrl.length > 0);
	}
	return [];
}

function mapRowToClassPost(row: Record<string, unknown>): ClassPost {
	return {
		id: String(row.id),
		classroomId: row.classroomId ? String(row.classroomId) : null,
		classroomName: (row.classroomName as string | null) ?? null,
		title: String(row.title),
		summary: (row.summary as string | null) ?? null,
		content: parseContent(row.content),
		status: String(row.status ?? "draft"),
		audienceScope: String(row.audienceScope ?? "classroom"),
		publishAt: row.publishAt ? new Date(String(row.publishAt)) : null,
		publishedAt: row.publishedAt ? new Date(String(row.publishedAt)) : null,
		createdAt: new Date(String(row.createdAt)),
		authorId: row.authorId ? String(row.authorId) : null,
		attachments: parseAttachments(row.attachments),
	};
}

function makePreviewSummary(summary: string | null, content: string[]): string | null {
	const trimmedSummary = summary?.trim();
	if (trimmedSummary) {
		return trimmedSummary.length > 140 ? `${trimmedSummary.slice(0, 137)}…` : trimmedSummary;
	}

	for (const paragraph of content) {
		const trimmed = paragraph.trim();
		if (trimmed.length) {
			return trimmed.length > 140 ? `${trimmed.slice(0, 137)}…` : trimmed;
		}
	}

	return null;
}

async function queryClassrooms(): Promise<Classroom[]> {
	const { rows } = await db`
		SELECT id, name, description, age_range AS "ageRange", lead_teacher AS "leadTeacher", assistant_teacher AS "assistantTeacher"
		FROM classrooms
		ORDER BY name
	`;

	return rows.map((row) => ({
		id: String(row.id),
		name: String(row.name),
		description: (row.description as string | null) ?? null,
		ageRange: (row.ageRange as string | null) ?? null,
		leadTeacher: (row.leadTeacher as string | null) ?? null,
		assistantTeacher: (row.assistantTeacher as string | null) ?? null,
	}));
}

async function queryClassroomsForTeacher(teacherId: string): Promise<Classroom[]> {
	const { rows } = await db`
		SELECT
			c.id,
			c.name,
			c.description,
			c.age_range AS "ageRange",
			c.lead_teacher AS "leadTeacher",
			c.assistant_teacher AS "assistantTeacher"
		FROM classroom_teachers ct
		JOIN classrooms c ON c.id = ct.classroom_id
		WHERE ct.teacher_id = ${teacherId}
		ORDER BY c.name
	`;

	return rows.map((row) => ({
		id: String(row.id),
		name: String(row.name),
		description: (row.description as string | null) ?? null,
		ageRange: (row.ageRange as string | null) ?? null,
		leadTeacher: (row.leadTeacher as string | null) ?? null,
		assistantTeacher: (row.assistantTeacher as string | null) ?? null,
	}));
}

async function queryClassPosts(options?: {
	classroomId?: string;
	classroomIds?: string[];
	authorId?: string;
	includeDrafts?: boolean;
	limit?: number;
}): Promise<ClassPost[]> {
	const classroomId = options?.classroomId ?? null;
	const classroomIds = options?.classroomIds ?? null;
	const authorId = options?.authorId ?? null;
	const includeDrafts = options?.includeDrafts ?? false;
	const limit = options?.limit ?? 50;

	const { rows } = await db`
		SELECT
			cp.id,
			cp.classroom_id AS "classroomId",
			cp.title,
			cp.summary,
			cp.content,
			cp.status,
			cp.audience_scope AS "audienceScope",
			cp.publish_at AS "publishAt",
			cp.published_at AS "publishedAt",
			cp.created_at AS "createdAt",
			cp.author_id AS "authorId",
			cl.name AS "classroomName",
			COALESCE(
				json_agg(
					json_build_object(
						'id', cpm.id,
						'label', cpm.caption,
						'caption', cpm.caption,
						'fileUrl', cpm.file_url,
						'thumbnailUrl', cpm.thumbnail_url,
						'mediaType', cpm.media_type,
						'altText', cpm.alt_text,
						'isCover', cpm.is_cover,
						'displayOrder', cpm.display_order
					)
					ORDER BY cpm.display_order NULLS LAST, cpm.created_at
				) FILTER (WHERE cpm.id IS NOT NULL),
				'[]'
			) AS attachments
		FROM class_posts cp
		LEFT JOIN class_post_media cpm ON cpm.post_id = cp.id
			LEFT JOIN classrooms cl ON cl.id = cp.classroom_id
		WHERE (${classroomId}::uuid IS NULL OR cp.classroom_id = ${classroomId})
			AND (${authorId}::uuid IS NULL OR cp.author_id = ${authorId})
			AND (${includeDrafts} = true OR cp.status = 'published')
		GROUP BY cp.id, cl.name
		ORDER BY COALESCE(cp.published_at, cp.publish_at, cp.created_at) DESC
		LIMIT ${limit}
	`;

	let posts = rows.map((row) => mapRowToClassPost(row as Record<string, unknown>));
	if (classroomIds && classroomIds.length > 0) {
		const classroomIdSet = new Set(classroomIds);
		posts = posts.filter((post) => (post.classroomId ? classroomIdSet.has(post.classroomId) : false));
	}
	return posts;
}

async function queryClassPostById(id: string): Promise<ClassPost | null> {
	const { rows } = await db`
		SELECT
			cp.id,
			cp.classroom_id AS "classroomId",
			cp.title,
			cp.summary,
			cp.content,
			cp.status,
			cp.audience_scope AS "audienceScope",
			cp.publish_at AS "publishAt",
			cp.published_at AS "publishedAt",
			cp.created_at AS "createdAt",
			cp.author_id AS "authorId",
			cl.name AS "classroomName",
			COALESCE(
				json_agg(
					json_build_object(
						'id', cpm.id,
						'label', cpm.caption,
						'caption', cpm.caption,
						'fileUrl', cpm.file_url,
						'thumbnailUrl', cpm.thumbnail_url,
						'mediaType', cpm.media_type,
						'altText', cpm.alt_text,
						'isCover', cpm.is_cover,
						'displayOrder', cpm.display_order
					)
					ORDER BY cpm.display_order NULLS LAST, cpm.created_at
				) FILTER (WHERE cpm.id IS NOT NULL),
				'[]'
			) AS attachments
		FROM class_posts cp
		LEFT JOIN class_post_media cpm ON cpm.post_id = cp.id
		LEFT JOIN classrooms cl ON cl.id = cp.classroom_id
		WHERE cp.id = ${id}
		GROUP BY cp.id, cl.name
	`;

	if (!rows.length) return null;
	return mapRowToClassPost(rows[0] as Record<string, unknown>);
}

async function queryClassPostsForParent(parentId: string, limit = 20): Promise<ClassPost[]> {
	const { rows } = await db`
		SELECT
			cp.id,
			cp.classroom_id AS "classroomId",
			cp.title,
			cp.summary,
			cp.content,
			cp.status,
			cp.audience_scope AS "audienceScope",
			cp.publish_at AS "publishAt",
			cp.published_at AS "publishedAt",
			cp.created_at AS "createdAt",
			cp.author_id AS "authorId",
			cl.name AS "classroomName",
			COALESCE(
				json_agg(
					json_build_object(
						'id', cpm.id,
						'label', cpm.caption,
						'caption', cpm.caption,
						'fileUrl', cpm.file_url,
						'thumbnailUrl', cpm.thumbnail_url,
						'mediaType', cpm.media_type,
						'altText', cpm.alt_text,
						'isCover', cpm.is_cover,
						'displayOrder', cpm.display_order
					)
					ORDER BY cpm.display_order NULLS LAST, cpm.created_at
				) FILTER (WHERE cpm.id IS NOT NULL),
				'[]'
			) AS attachments
		FROM child_parents cp_map
		JOIN children c ON cp_map.child_id = c.id
		JOIN class_posts cp ON cp.classroom_id = c.classroom_id
		LEFT JOIN class_post_media cpm ON cpm.post_id = cp.id
		LEFT JOIN classrooms cl ON cl.id = cp.classroom_id
		WHERE cp_map.parent_id = ${parentId}
			AND cp.status = 'published'
		GROUP BY cp.id, cl.name
		ORDER BY COALESCE(cp.published_at, cp.publish_at, cp.created_at) DESC
		LIMIT ${limit}
	`;
	return rows.map((row) => mapRowToClassPost(row as Record<string, unknown>));
}

async function queryClassPostForParent(parentId: string, postId: string): Promise<ClassPost | null> {
	const { rows } = await db`
		SELECT
			cp.id,
			cp.classroom_id AS "classroomId",
			cp.title,
			cp.summary,
			cp.content,
			cp.status,
			cp.audience_scope AS "audienceScope",
			cp.publish_at AS "publishAt",
			cp.published_at AS "publishedAt",
			cp.created_at AS "createdAt",
			cp.author_id AS "authorId",
			cl.name AS "classroomName",
			COALESCE(
				json_agg(
					json_build_object(
						'id', cpm.id,
						'label', cpm.caption,
						'caption', cpm.caption,
						'fileUrl', cpm.file_url,
						'thumbnailUrl', cpm.thumbnail_url,
						'mediaType', cpm.media_type,
						'altText', cpm.alt_text,
						'isCover', cpm.is_cover,
						'displayOrder', cpm.display_order
					)
					ORDER BY cpm.display_order NULLS LAST, cpm.created_at
				) FILTER (WHERE cpm.id IS NOT NULL),
				'[]'
			) AS attachments
		FROM child_parents cp_map
		JOIN children c ON cp_map.child_id = c.id
		JOIN class_posts cp ON cp.classroom_id = c.classroom_id
		LEFT JOIN class_post_media cpm ON cpm.post_id = cp.id
		LEFT JOIN classrooms cl ON cl.id = cp.classroom_id
		WHERE cp_map.parent_id = ${parentId}
			AND cp.id = ${postId}
			AND cp.status = 'published'
		GROUP BY cp.id, cl.name
	`;

	if (!rows.length) return null;
	return mapRowToClassPost(rows[0] as Record<string, unknown>);
}

async function queryPublicClassPostPreviews(limit = 12): Promise<ClassPostPreview[]> {
	const { rows } = await db`
		SELECT
			cp.id,
			cp.title,
			cp.summary,
			cp.content,
			cp.publish_at AS "publishAt",
			cp.created_at AS "createdAt",
			cl.name AS "classroomName"
		FROM class_posts cp
		LEFT JOIN classrooms cl ON cl.id = cp.classroom_id
		WHERE cp.status = 'published'
			AND cp.audience_scope = 'all'
		ORDER BY COALESCE(cp.publish_at, cp.created_at) DESC
		LIMIT ${limit}
	`;

	return rows.map((row) => {
		const content = parseContent(row.content);
		return {
			id: String(row.id),
			title: String(row.title),
			classroomName: (row.classroomName as string | null) ?? null,
			summary: makePreviewSummary((row.summary as string | null) ?? null, content),
			publishAt: row.publishAt ? new Date(String(row.publishAt)) : null,
			createdAt: new Date(String(row.createdAt)),
		};
	});
}

export const getClassrooms = cache(queryClassrooms);
export const getTeacherClassrooms = cache(queryClassroomsForTeacher);
export const getClassPosts = cache(queryClassPosts);
export const getClassPost = cache(queryClassPostById);
export const getParentClassPosts = cache(queryClassPostsForParent);
export const getParentClassPost = cache(queryClassPostForParent);
export const getPublicClassPostPreviews = queryPublicClassPostPreviews;
