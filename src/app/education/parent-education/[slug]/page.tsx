import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getParentEducationPostBySlug } from "@/lib/data/parent-education-repository";

import { incrementParentEducationViewCount } from "./actions";

type ParentEducationDetailPageProps = {
	params: { slug: string };
};

export default async function ParentEducationDetailPage({ params }: ParentEducationDetailPageProps) {
	const session = await auth();

	const post = await getParentEducationPostBySlug(params.slug);
	if (!post) {
		notFound();
	}

	const isApprovedParent = session?.user?.role === "parent" && session.user?.status === "active";
	const isStaff = session?.user?.role === "admin" || session?.user?.role === "teacher";

	if (!post.isPublished && !isStaff) {
		redirect("/education/parent-education?tab=education");
	}

	return (
		<div className="bg-[var(--background)] text-[var(--brand-navy)]">
			<section className="border-b border-[var(--border)] bg-white/90">
				<div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-12 sm:px-10 lg:px-12">
					<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">교육과정 · 부모교육</p>
					<h1 className="font-heading text-[clamp(2.2rem,4vw,3rem)] leading-tight">{post.title}</h1>
					<p className="text-sm text-muted-foreground">
						{post.summary ?? "학부모님과 나누고 싶은 부모교육 콘텐츠입니다."}
					</p>
					<nav className="text-xs text-muted-foreground" aria-label="breadcrumb">
						<Link href="/" className="underline-offset-4 hover:underline">
							홈
						</Link>
						<span className="px-1">/</span>
						<Link href="/education/daily-schedule" className="underline-offset-4 hover:underline">
							교육과정
						</Link>
						<span className="px-1">/</span>
						<Link href="/education/parent-education?tab=education" className="underline-offset-4 hover:underline">
							부모교육
						</Link>
						<span className="px-1">/</span>
						<span>{post.title}</span>
					</nav>
				</div>
			</section>

			<section className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 sm:px-10 lg:px-12">
				<div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/95 p-6 shadow-[var(--shadow-soft)]">
					<div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-[var(--border)] pb-4 text-sm text-muted-foreground">
						<p>카테고리: {renderCategory(post.category)}</p>
						<p>조회수: {post.viewCount.toLocaleString()}</p>
						<p>게시일: {post.publishAt ? post.publishAt.toLocaleDateString("ko-KR") : "미게시"}</p>
					</div>

					{post.content ? (
						<div className="prose prose-sm mt-6 max-w-none text-[var(--brand-navy)]">
							{post.content.split("\n").map((paragraph, index) => (
								<p key={`${post.id}-p-${index}`}>{paragraph}</p>
							))}
						</div>
					) : (
						<p className="mt-6 text-sm text-muted-foreground">본문이 등록되지 않은 글입니다.</p>
					)}

					{post.attachments.length ? (
						<div className="mt-8">
							<h3 className="text-sm font-semibold text-[var(--brand-navy)]">첨부 파일</h3>
							<ul className="mt-3 space-y-2">
								{post.attachments.map((attachment) => (
									<li key={attachment.id}>
										<Link
											href={attachment.fileUrl}
											target="_blank"
											className="text-sm text-[var(--brand-primary)] underline-offset-4 hover:underline"
										>
											{attachment.label ?? attachment.fileUrl}
										</Link>
									</li>
								))}
							</ul>
						</div>
					) : null}
				</div>

				{!isApprovedParent ? (
					<div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)]/80 p-4 text-sm text-muted-foreground">
						<p className="font-semibold text-[var(--brand-primary)]">학부모 승인 필요</p>
						<p className="mt-1">
							상세 본문과 첨부 파일은 승인된 학부모 계정으로 로그인해야 열람할 수 있습니다.
							{session ? (
								<span> 계정 승인 상태를 운영팀에 문의해 주세요.</span>
							) : (
								<>
									<span> </span>
									<Link href="/member/login" className="underline">
										로그인
									</Link>
									<span> 후 확인해 주세요.</span>
								</>
							)}
						</p>
					</div>
				) : null}

				<div className="flex flex-wrap gap-3">
					<Button variant="outline" asChild>
						<Link href="/education/parent-education?tab=education">목록으로 돌아가기</Link>
					</Button>
					<form action={incrementParentEducationViewCount}>
						<input type="hidden" name="postId" value={post.id} />
						<Button type="submit" variant="outline">
							조회수 업데이트
						</Button>
					</form>
				</div>
			</section>
		</div>
	);
}

function renderCategory(category: string) {
	switch (category) {
		case "parent_recipe":
			return "부모레시피";
		case "parent_class":
			return "학부모교실";
		case "seminar":
			return "세미나";
		default:
			return category;
	}
}
