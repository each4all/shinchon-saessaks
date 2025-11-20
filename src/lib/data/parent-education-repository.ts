import { cache } from "react";

import { db } from "@/lib/db";

export type ParentEducationCategory = "parent_class" | "parent_recipe" | "seminar";

export type ParentEducationAttachment = {
	id: string;
	label: string | null;
	fileUrl: string;
};

export type ParentEducationPostRecord = {
	id: string;
	slug: string;
	title: string;
	summary: string | null;
	content: string | null;
	category: ParentEducationCategory;
	audienceScope: string;
	isPublished: boolean;
	publishAt: Date | null;
	viewCount: number;
	attachments: ParentEducationAttachment[];
	createdAt: Date;
	updatedAt: Date;
};

type QueryOptions = {
	category?: ParentEducationCategory | null;
	search?: string | null;
	limit?: number;
	offset?: number;
	publishedOnly?: boolean;
};

function mapRow(row: Record<string, unknown>): ParentEducationPostRecord {
	return {
		id: String(row.id),
		slug: String(row.slug),
		title: String(row.title),
		summary: row.summary ? String(row.summary) : null,
		content: row.content ? String(row.content) : null,
		category: row.category as ParentEducationCategory,
		audienceScope: String(row.audienceScope),
		isPublished: Boolean(row.isPublished),
		publishAt: row.publishAt ? new Date(String(row.publishAt)) : null,
		viewCount: Number(row.viewCount ?? 0),
		attachments: Array.isArray(row.attachments)
			? (row.attachments as Record<string, unknown>[]).map((attachment) => ({
					id: String(attachment.id ?? crypto.randomUUID()),
					label: attachment.label ? String(attachment.label) : null,
					fileUrl: String(attachment.fileUrl ?? ""),
			  }))
			: [],
		createdAt: new Date(String(row.createdAt)),
		updatedAt: new Date(String(row.updatedAt)),
	};
}

async function queryParentEducationPosts(options: QueryOptions) {
	const category = options.category ?? null;
	const search = options.search?.trim() || null;
	const limit = Math.min(Math.max(options.limit ?? 10, 1), 50);
	const offset = Math.max(options.offset ?? 0, 0);
	const publishedOnly = options.publishedOnly ?? true;

	const { rows } = await db`
		WITH filtered AS (
			SELECT
				pep.id,
				pep.slug,
				pep.title,
				pep.summary,
				pep.content,
				pep.category,
				pep.audience_scope AS "audienceScope",
				pep.is_published AS "isPublished",
				pep.publish_at AS "publishAt",
				pep.view_count AS "viewCount",
				pep.created_at AS "createdAt",
				pep.updated_at AS "updatedAt",
				COUNT(*) OVER() AS total_count
			FROM parent_education_posts pep
			WHERE
				(${category}::text IS NULL OR pep.category = ${category})
				AND (${publishedOnly}::boolean = false OR pep.is_published = true)
				AND (
					${search}::text IS NULL
					OR pep.title ILIKE '%' || ${search} || '%'
					OR pep.summary ILIKE '%' || ${search} || '%'
				)
			ORDER BY COALESCE(pep.publish_at, pep.created_at) DESC, pep.title ASC
			LIMIT ${limit} OFFSET ${offset}
		)
		SELECT
			filtered.*,
			COALESCE(
				json_agg(
					json_build_object(
						'id', pea.id,
						'label', pea.label,
						'fileUrl', pea.file_url
					)
				) FILTER (WHERE pea.id IS NOT NULL),
				'[]'
			) AS attachments
		FROM filtered
		LEFT JOIN parent_education_attachments pea ON pea.post_id = filtered.id
		GROUP BY filtered.id, filtered.slug, filtered.total_count, filtered.title, filtered.summary, filtered.content,
			filtered.category, filtered."audienceScope", filtered."isPublished", filtered."publishAt",
			filtered."viewCount", filtered."createdAt", filtered."updatedAt"
	`;

	const items = rows.map((row) => mapRow(row as Record<string, unknown>));
	const total = rows[0]?.total_count ? Number(rows[0].total_count) : items.length;

	return { items, total };
}

async function queryParentEducationBySlug(slug: string) {
	const { rows } = await db`
		SELECT
			pep.id,
			pep.slug,
			pep.title,
			pep.summary,
			pep.content,
			pep.category,
			pep.audience_scope AS "audienceScope",
			pep.is_published AS "isPublished",
			pep.publish_at AS "publishAt",
			pep.view_count AS "viewCount",
			pep.created_at AS "createdAt",
			pep.updated_at AS "updatedAt",
			COALESCE(
				json_agg(
					json_build_object(
						'id', pea.id,
						'label', pea.label,
						'fileUrl', pea.file_url
					)
				) FILTER (WHERE pea.id IS NOT NULL),
				'[]'
			) AS attachments
		FROM parent_education_posts pep
		LEFT JOIN parent_education_attachments pea ON pea.post_id = pep.id
		WHERE pep.slug = ${slug}
		GROUP BY pep.id
	`;

	if (rows.length === 0) {
		return null;
	}

	return mapRow(rows[0] as Record<string, unknown>);
}

export const listParentEducationPosts = cache(queryParentEducationPosts);
export const getParentEducationPostBySlug = cache(queryParentEducationBySlug);
