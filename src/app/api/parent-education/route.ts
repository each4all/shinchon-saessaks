import { NextResponse } from "next/server";

import {
	listParentEducationPosts,
	type ParentEducationCategory,
} from "@/lib/data/parent-education-repository";

function parseCategory(value: string | null): ParentEducationCategory | null {
	if (!value) return null;
	const lower = value.toLowerCase();
	if (lower === "parent_class" || lower === "parent_recipe" || lower === "seminar") {
		return lower;
	}
	return null;
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10) || 1, 1);
	const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "10", 10) || 10, 1), 50);
	const offset = (page - 1) * limit;
	const search = searchParams.get("q");
	const category = parseCategory(searchParams.get("category"));
	const includeDrafts = searchParams.get("drafts") === "true";

	const { items, total } = await listParentEducationPosts({
		category,
		search,
		limit,
		offset,
		publishedOnly: !includeDrafts,
	});

	const payload = {
		data: items.map((item) => ({
			...item,
			publishAt: item.publishAt?.toISOString() ?? null,
			createdAt: item.createdAt.toISOString(),
			updatedAt: item.updatedAt.toISOString(),
		})),
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.max(Math.ceil(total / limit), 1),
		},
	};

	return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
}
