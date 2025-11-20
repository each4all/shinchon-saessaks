import { NextResponse } from "next/server";

import { getParentEducationPostBySlug } from "@/lib/data/parent-education-repository";

type Params = {
	params: {
		slug: string;
	};
};

export async function GET(_request: Request, { params }: Params) {
	const slug = params.slug.toLowerCase();
	const post = await getParentEducationPostBySlug(slug);

	if (!post) {
		return NextResponse.json({ error: "Not Found" }, { status: 404 });
	}

	return NextResponse.json(
		{
			...post,
			publishAt: post.publishAt?.toISOString() ?? null,
			createdAt: post.createdAt.toISOString(),
			updatedAt: post.updatedAt.toISOString(),
		},
		{ headers: { "Cache-Control": "no-store" } },
	);
}
