"use server";

import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const incrementSchema = z.object({
	postId: z.string().uuid(),
});

export async function incrementParentEducationViewCount(formData: FormData) {
	const session = await auth();
	if (!session || session.user?.role === "pending") {
		return;
	}

	const parsed = incrementSchema.safeParse({
		postId: (formData.get("postId") as string) ?? "",
	});

	if (!parsed.success) {
		return;
	}

	await db`
		UPDATE parent_education_posts
		SET view_count = view_count + 1
		WHERE id = ${parsed.data.postId}
	`;
}
