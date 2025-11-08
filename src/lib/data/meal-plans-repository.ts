import { cache } from "react";

import { db } from "@/lib/db";

export type MealPlanResource = {
	id: string;
	fileUrl: string;
	label?: string | null;
	mediaType?: string | null;
};

export type MealPlan = {
	id: string;
	menuDate: Date;
	mealType: string;
	menuItems: string[];
	allergens: string[];
	notes?: string | null;
	audienceScope: string;
	createdBy?: string | null;
	updatedBy?: string | null;
	resources: MealPlanResource[];
};

export type NutritionBulletin = {
	id: string;
	title: string;
	content: string;
	category: string;
	status: string;
	publishAt?: Date | null;
	createdAt: Date;
	updatedAt: Date;
};

function toStringArray(value: unknown): string[] {
	if (!value) return [];
	if (Array.isArray(value)) {
		return value.map((item) => String(item ?? "")).filter((item) => item.length > 0);
	}
	if (typeof value === "string") {
		try {
			const parsed = JSON.parse(value);
			if (Array.isArray(parsed)) {
				return parsed.map((item) => String(item ?? "")).filter((item) => item.length > 0);
			}
		} catch {
			return value.length > 0 ? [value] : [];
		}
	}
	return [];
}

function mapMealPlan(row: Record<string, unknown>): MealPlan {
	return {
		id: String(row.id),
		menuDate: new Date(String(row.menuDate)),
		mealType: String(row.mealType),
		menuItems: toStringArray(row.menuItems),
		allergens: toStringArray(row.allergens),
		notes: (row.notes as string | null) ?? null,
		audienceScope: String(row.audienceScope ?? "parents"),
		createdBy: row.createdBy ? String(row.createdBy) : null,
		updatedBy: row.updatedBy ? String(row.updatedBy) : null,
		resources: Array.isArray(row.resources)
			? (row.resources as Record<string, unknown>[]).map((resource) => ({
					id: String(resource.id ?? crypto.randomUUID()),
					fileUrl: String(resource.fileUrl ?? ""),
					label: resource.label ? String(resource.label) : null,
					mediaType: resource.mediaType ? String(resource.mediaType) : null,
				}))
			: [],
	};
}

function mapNutritionBulletin(row: Record<string, unknown>): NutritionBulletin {
	return {
		id: String(row.id),
		title: String(row.title),
		content: String(row.content),
		category: String(row.category ?? "bulletin"),
		status: String(row.status ?? "draft"),
		publishAt: row.publishAt ? new Date(String(row.publishAt)) : null,
		createdAt: new Date(String(row.createdAt)),
		updatedAt: new Date(String(row.updatedAt)),
	};
}

async function fetchMealPlans(options?: {
	from?: Date;
	to?: Date;
	audience?: Array<string>;
	mealType?: string;
	limit?: number;
}): Promise<MealPlan[]> {
	const from = options?.from ? options.from.toISOString() : null;
	const to = options?.to ? options.to.toISOString() : null;
	const mealType = options?.mealType ?? null;
	const audience = options?.audience ?? null;
	const limit = options?.limit ?? 90;

	const { rows } = await db`
		SELECT
			mp.id,
			mp.menu_date AS "menuDate",
			mp.meal_type AS "mealType",
			mp.menu_items AS "menuItems",
			mp.allergens AS "allergens",
			mp.notes,
			mp.audience_scope AS "audienceScope",
			mp.created_by AS "createdBy",
			mp.updated_by AS "updatedBy",
			COALESCE(
				(
					SELECT json_agg(
						json_build_object(
							'id', mpr.id,
							'fileUrl', mpr.file_url,
							'label', mpr.label,
							'mediaType', mpr.media_type
						)
						ORDER BY mpr.created_at DESC
					)
					FROM meal_plan_resources mpr
					WHERE mpr.plan_id = mp.id
				),
				'[]'::json
			) AS resources
		FROM meal_plans mp
		WHERE
			(${from}::date IS NULL OR mp.menu_date::date >= ${from}::date)
			AND (${to}::date IS NULL OR mp.menu_date::date <= ${to}::date)
			AND (${mealType}::meal_type IS NULL OR mp.meal_type = ${mealType})
		ORDER BY mp.menu_date ASC, mp.meal_type ASC
		LIMIT ${limit}
	`;

	let plans = rows.map((row) => mapMealPlan(row as Record<string, unknown>));
	if (audience && audience.length > 0) {
		const allowedScopes = new Set(audience);
		plans = plans.filter((plan) => allowedScopes.has(plan.audienceScope));
	}
	return plans;
}

async function fetchMealPlanById(planId: string): Promise<MealPlan | null> {
	const { rows } = await db`
		SELECT
			mp.id,
			mp.menu_date AS "menuDate",
			mp.meal_type AS "mealType",
			mp.menu_items AS "menuItems",
			mp.allergens AS "allergens",
			mp.notes,
			mp.audience_scope AS "audienceScope",
			mp.created_by AS "createdBy",
			mp.updated_by AS "updatedBy",
			COALESCE(
				(
					SELECT json_agg(
						json_build_object(
							'id', mpr.id,
							'fileUrl', mpr.file_url,
							'label', mpr.label,
							'mediaType', mpr.media_type
						)
						ORDER BY mpr.created_at DESC
					)
					FROM meal_plan_resources mpr
					WHERE mpr.plan_id = mp.id
				),
				'[]'::json
			) AS resources
		FROM meal_plans mp
		WHERE mp.id = ${planId}
		LIMIT 1
	`;

	if (!rows.length) return null;
	return mapMealPlan(rows[0] as Record<string, unknown>);
}

async function fetchMealPlansForParents(options?: { from?: Date; to?: Date; mealType?: string }): Promise<MealPlan[]> {
	const rangeFrom = options?.from ?? new Date();
	const rangeTo = options?.to ?? new Date(rangeFrom.getTime() + 1000 * 60 * 60 * 24 * 30);

	return fetchMealPlans({
		from: rangeFrom,
		to: rangeTo,
		mealType: options?.mealType,
		audience: ["parents", "all"],
		limit: 120,
	});
}

async function fetchNutritionBulletins(options?: {
	includeDrafts?: boolean;
	limit?: number;
	status?: string;
}): Promise<NutritionBulletin[]> {
	const includeDrafts = options?.includeDrafts ?? false;
	const status = options?.status ?? null;
	const limit = options?.limit ?? 50;

	const { rows } = await db`
		SELECT
			nb.id,
			nb.title,
			nb.content,
			nb.category,
			nb.status,
			nb.publish_at AS "publishAt",
			nb.created_at AS "createdAt",
			nb.updated_at AS "updatedAt"
		FROM nutrition_bulletins nb
		WHERE (${status}::nutrition_bulletin_status IS NULL OR nb.status = ${status})
			AND (${includeDrafts} = true OR nb.status = 'published')
		ORDER BY COALESCE(nb.publish_at, nb.created_at) DESC, nb.created_at DESC
		LIMIT ${limit}
	`;

	return rows.map((row) => mapNutritionBulletin(row as Record<string, unknown>));
}

async function fetchNutritionBulletinById(bulletinId: string): Promise<NutritionBulletin | null> {
	const { rows } = await db`
		SELECT
			nb.id,
			nb.title,
			nb.content,
			nb.category,
			nb.status,
			nb.publish_at AS "publishAt",
			nb.created_at AS "createdAt",
			nb.updated_at AS "updatedAt"
		FROM nutrition_bulletins nb
		WHERE nb.id = ${bulletinId}
		LIMIT 1
	`;

	if (!rows.length) return null;
	return mapNutritionBulletin(rows[0] as Record<string, unknown>);
}

export const getMealPlans = cache(fetchMealPlans);
export const getMealPlan = cache(fetchMealPlanById);
export const getParentMealPlans = cache(fetchMealPlansForParents);
export const getNutritionBulletins = cache(fetchNutritionBulletins);
export const getNutritionBulletin = cache(fetchNutritionBulletinById);

async function fetchParentNutritionBulletins(limit = 20): Promise<NutritionBulletin[]> {
	return fetchNutritionBulletins({
		includeDrafts: false,
		status: "published",
		limit,
	});
}

export const getParentNutritionBulletins = cache(fetchParentNutritionBulletins);

async function fetchPublicMealPlans(options?: { from?: Date; to?: Date; mealType?: string; limit?: number }) {
	const rangeFrom = options?.from ?? new Date();
	const rangeTo = options?.to ?? new Date(rangeFrom.getTime() + 1000 * 60 * 60 * 24 * 30);

	return fetchMealPlans({
		from: rangeFrom,
		to: rangeTo,
		mealType: options?.mealType,
		audience: ["all"],
		limit: options?.limit ?? 120,
	});
}

async function fetchPublicNutritionBulletins(limit = 12): Promise<NutritionBulletin[]> {
	return fetchNutritionBulletins({
		includeDrafts: false,
		status: "published",
		limit,
	});
}

export const getPublicMealPlans = cache(fetchPublicMealPlans);
export const getPublicNutritionBulletins = cache(fetchPublicNutritionBulletins);
