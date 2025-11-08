import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getClassPost, getClassrooms, getTeacherClassrooms } from "@/lib/data/class-posts-repository";
import { auth } from "@/lib/auth";

import { EditClassPostForm, type ClassPostFormValues } from "../../_components/create-class-post-form";

type EditClassPostPageProps = {
	params: Promise<{ id: string }>;
};

export default async function EditClassPostPage({ params }: EditClassPostPageProps) {
	const session = await auth();
	if (!session) {
		redirect("/member/login?redirect=/admin/class-posts");
	}
	const role = session.user?.role;
	const userId = session.user?.id ?? "";

	const { id } = await params;
	let classrooms = await getClassrooms();
	const post = await getClassPost(id);

	if (!post) {
		notFound();
	}

	if (role === "teacher") {
		const teacherClassrooms = await getTeacherClassrooms(userId);
		const allowedIds = new Set(teacherClassrooms.map((classroom) => classroom.id));

		if (!allowedIds.has(post.classroomId ?? "")) {
			redirect("/admin/class-posts");
		}

		classrooms = teacherClassrooms;
	}
	if (role !== "admin" && role !== "teacher") {
		redirect("/admin");
	}

	const initialValues: ClassPostFormValues = {
		postId: post.id,
		classroomId: post.classroomId ?? "",
		title: post.title,
		summary: post.summary ?? "",
		publishAt: post.publishAt ? post.publishAt.toISOString() : null,
		contentMarkdown: post.content.join("\n\n"),
		audienceScope: post.audienceScope,
		attachments: post.attachments.map((attachment) => ({
			label: attachment.label ?? "",
			url: attachment.fileUrl,
		})),
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-secondary)]">Admin Console</p>
					<h1 className="font-heading text-[clamp(2rem,3vw,2.75rem)] leading-tight">반 소식 수정</h1>
					<p className="text-sm text-muted-foreground">학급별 공지/활동 소식을 수정하고 부모에게 빠르게 공유하세요.</p>
				</div>
				<Button variant="outline" asChild>
					<Link href="/admin/class-posts">목록으로 돌아가기</Link>
				</Button>
			</div>

			<EditClassPostForm classrooms={classrooms} initialValues={initialValues} role={role ?? "guest"} />
		</div>
	);
}
