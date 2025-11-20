import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
	listParentEducationPosts,
	type ParentEducationCategory,
} from "@/lib/data/parent-education-repository";
import { auth } from "@/lib/auth";

import { CreateParentEducationForm } from "./_components/create-parent-education-form";
import { DeleteParentEducationButton, TogglePublishButton } from "./_components/parent-education-actions";

const CATEGORY_LABELS: Record<ParentEducationCategory, string> = {
	parent_recipe: "부모레시피",
	parent_class: "학부모교실",
	seminar: "세미나",
};

function formatDate(value: Date | null) {
	if (!value) return "—";
	return new Intl.DateTimeFormat("ko-KR", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(value);
}

export default async function ParentEducationAdminPage() {
	const session = await auth();
	if (!session || session.user?.role !== "admin") {
		redirect("/member/login");
	}

	const { items, total } = await listParentEducationPosts({
		limit: 100,
		offset: 0,
		publishedOnly: false,
	});

	return (
		<div className="space-y-8">
			<header className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/95 p-6 shadow-[var(--shadow-soft)]">
				<div className="space-y-2">
					<p className="font-medium uppercase tracking-[0.3em] text-[var(--brand-secondary)]">Parent Admin</p>
					<h1 className="font-heading text-[clamp(2.25rem,3vw,3rem)] leading-tight text-[var(--brand-navy)]">
						부모교육 자료 관리
					</h1>
					<p className="text-sm leading-relaxed text-muted-foreground">
						부모레시피, 학부모교실, 세미나 자료를 등록하고 게시 상태를 제어합니다. 총 {total}건의 글이 저장되어 있으며,
						게시 전환 시 `/education/parent-education` 페이지와 API가 즉시 갱신됩니다.
					</p>
				</div>
				<Button asChild variant="outline">
					<Link href="/education/parent-education?tab=education" target="_blank">
						부모교육 페이지 열기
					</Link>
				</Button>
			</header>

			<CreateParentEducationForm />

			<section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/95 p-4 shadow-[var(--shadow-soft)]">
				<div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-4">
					<div>
						<h2 className="text-lg font-semibold text-[var(--brand-navy)]">등록된 부모교육 글</h2>
						<p className="text-xs text-muted-foreground">게시/초안 상태를 전환하거나 삭제할 수 있습니다.</p>
					</div>
				</div>
				<div className="mt-4 overflow-x-auto">
					<Table className="min-w-[640px] text-sm">
						<TableHeader>
							<TableRow>
								<TableHead className="w-[120px]">카테고리</TableHead>
								<TableHead>제목</TableHead>
								<TableHead className="w-[90px] text-center">조회</TableHead>
								<TableHead className="w-[150px] text-center">게시일</TableHead>
								<TableHead className="w-[160px] text-center">상태</TableHead>
								<TableHead className="w-[200px] text-center">액션</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{items.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
										등록된 글이 없습니다. 새 글을 작성해 주세요.
									</TableCell>
								</TableRow>
							) : (
								items.map((post) => (
									<TableRow key={post.id}>
										<TableCell>{CATEGORY_LABELS[post.category]}</TableCell>
										<TableCell className="font-medium text-[var(--brand-navy)]">
											<div className="flex flex-col">
												<span>{post.title}</span>
												{post.summary ? (
													<span className="text-xs text-muted-foreground">{post.summary}</span>
												) : null}
											</div>
										</TableCell>
										<TableCell className="text-center text-muted-foreground">
											{post.viewCount.toLocaleString()}
										</TableCell>
										<TableCell className="text-center text-muted-foreground">
											{formatDate(post.publishAt)}
										</TableCell>
										<TableCell className="text-center">
											{post.isPublished ? (
												<span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
													게시
												</span>
											) : (
												<span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
													초안
												</span>
											)}
										</TableCell>
										<TableCell className="text-center">
											<div className="flex items-center justify-center gap-2">
												<TogglePublishButton postId={post.id} isPublished={post.isPublished} />
												<DeleteParentEducationButton postId={post.id} />
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</section>
		</div>
	);
}
