import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { auth } from "@/lib/auth";
import { getClassPosts, getClassrooms, getTeacherClassrooms } from "@/lib/data/class-posts-repository";

import { CreateClassPostForm } from "./_components/create-class-post-form";
import { DeleteClassPostButton } from "./_components/delete-class-post-button";
import { UpdateClassPostStatusButton } from "./_components/update-class-post-status-button";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
	draft: "승인 대기",
	published: "게시",
	archived: "숨김",
};

const STATUS_BADGE_VARIANT: Record<string, "outline" | "success" | "destructive"> = {
	draft: "outline",
	published: "success",
	archived: "destructive",
};

function formatDate(date: Date | null | undefined) {
	if (!date) return "-";
	return new Intl.DateTimeFormat("ko-KR", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
}

export default async function AdminClassPostsPage() {
	const session = await auth();
	const role = session?.user?.role ?? "guest";
	const userId = session?.user?.id ?? "";
	const isAdmin = role === "admin";

	let classrooms = await getClassrooms();
	let posts = await getClassPosts({ limit: 100, includeDrafts: true });
	let teacherClassroomIds: string[] = [];

	if (role === "teacher") {
		classrooms = await getTeacherClassrooms(userId);
		teacherClassroomIds = classrooms.map((classroom) => classroom.id);

		if (teacherClassroomIds.length === 0) {
			posts = [];
		} else {
			posts = await getClassPosts({
				classroomIds: teacherClassroomIds,
				limit: 100,
				includeDrafts: true,
			});
		}
	}

	const canDelete = isAdmin;
	const pendingPosts = isAdmin ? posts.filter((post) => post.status === "draft") : [];

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-secondary)]">Admin Console</p>
						<h1 className="font-heading text-[clamp(2rem,3vw,2.75rem)] leading-tight">반 소식 관리</h1>
						<p className="text-sm text-muted-foreground">학급별 소식을 작성하고 첨부 자료를 추가해 학부모 포털에 공유합니다.</p>
					</div>
					{role === "admin" ? (
						<Button variant="outline" asChild>
							<Link href="/admin">대시보드로 돌아가기</Link>
						</Button>
					) : null}
				</div>

				<CreateClassPostForm
					classrooms={classrooms}
					disabled={role === "teacher" && teacherClassroomIds.length === 0}
					role={role}
				/>
				{role === "teacher" && teacherClassroomIds.length === 0 ? (
					<p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
						아직 담당 반이 배정되지 않았습니다. 관리자에게 문의해 주세요.
					</p>
				) : null}
			</div>

			{isAdmin ? (
				<section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[rgba(248,247,255,0.6)] p-6 shadow-[var(--shadow-soft)]">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<h2 className="text-lg font-semibold text-[var(--brand-navy)]">승인 대기 게시글</h2>
							<p className="text-sm text-muted-foreground">교사가 등록한 초안을 검토하고 게시 여부를 결정하세요.</p>
						</div>
						<Badge variant={pendingPosts.length > 0 ? "outline" : "success"}>대기 {pendingPosts.length}건</Badge>
					</div>
					{pendingPosts.length === 0 ? (
						<p className="mt-4 rounded-[var(--radius-sm)] border border-dashed border-[var(--border)] bg-white/60 px-4 py-6 text-sm text-muted-foreground">
							승인 대기 중인 게시글이 없습니다.
						</p>
					) : (
						<ul className="mt-4 space-y-3">
							{pendingPosts.map((post) => (
								<li
									key={post.id}
									className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-white/80 p-4 md:flex-row md:items-center md:justify-between"
								>
									<div className="space-y-1">
										<p className="text-sm font-semibold text-[var(--brand-navy)]">
											{post.title}
											<span className="ml-2 text-xs text-muted-foreground">
												{post.classroomName ?? "반 미지정"} · 등록 {formatDate(post.createdAt)}
											</span>
										</p>
										<p className="text-xs text-muted-foreground md:max-w-xl">
											{post.summary ?? post.content[0] ?? "요약 정보가 없습니다."}
										</p>
									</div>
									<div className="flex flex-wrap items-center gap-2">
										<UpdateClassPostStatusButton postId={post.id} status="published" size="sm">
											게시 승인
										</UpdateClassPostStatusButton>
										<UpdateClassPostStatusButton
											postId={post.id}
											status="archived"
											variant="destructive"
											size="sm"
											confirmMessage="해당 게시글을 숨김 처리하겠습니까?"
										>
											숨김 처리
										</UpdateClassPostStatusButton>
									</div>
								</li>
							))}
						</ul>
					)}
				</section>
			) : null}

			<section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-lg font-semibold">등록된 반 소식</h2>
						<p className="text-sm text-muted-foreground">최신 순으로 정렬됩니다. 학부모 포털과 학급별 페이지에 노출됩니다.</p>
					</div>
					<Badge variant="outline">총 {posts.length}건</Badge>
				</div>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>반</TableHead>
							<TableHead>제목</TableHead>
							<TableHead>요약</TableHead>
							<TableHead>상태</TableHead>
							<TableHead>게시일</TableHead>
							<TableHead className="text-right">관리</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{posts.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
									등록된 게시글이 없습니다.
								</TableCell>
							</TableRow>
						) : (
							posts.map((post) => (
								<TableRow key={post.id}>
									<TableCell>{post.classroomName ?? "반 미지정"}</TableCell>
									<TableCell className="font-semibold">{post.title}</TableCell>
									<TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">
										{post.summary ?? post.content[0] ?? "-"}
										{role === "teacher" && post.authorId === userId ? (
											<span className="mt-1 block text-xs text-muted-foreground">
												{post.status === "draft"
													? "관리자 승인 대기 중입니다."
													: post.status === "archived"
														? "관리자가 숨김 처리했습니다. 수정 후 재검토를 요청하세요."
														: "게시 중인 소식입니다."}
											</span>
										) : null}
									</TableCell>
									<TableCell>
										<Badge variant={STATUS_BADGE_VARIANT[post.status] ?? "outline"}>
											{STATUS_LABEL[post.status] ?? post.status}
										</Badge>
									</TableCell>
									<TableCell className="text-sm">
										{formatDate(post.publishedAt ?? post.publishAt ?? post.createdAt)}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex flex-wrap justify-end gap-2">
											<Button variant="outline" size="sm" asChild>
												<Link href={`/admin/class-posts/${post.id}/preview`} target="_blank">
													미리보기
												</Link>
											</Button>
											<Button variant="outline" size="sm" asChild>
												<Link href={`/admin/class-posts/${post.id}/edit`}>수정</Link>
											</Button>
											{isAdmin ? (
												<>
													{post.status !== "published" ? (
														<UpdateClassPostStatusButton postId={post.id} status="published" variant="default">
															게시
														</UpdateClassPostStatusButton>
													) : (
														<UpdateClassPostStatusButton postId={post.id} status="draft">
															초안으로
														</UpdateClassPostStatusButton>
													)}
													{post.status !== "archived" ? (
														<UpdateClassPostStatusButton
															postId={post.id}
															status="archived"
															variant="destructive"
															confirmMessage="해당 게시글을 숨김 처리하겠습니까?"
														>
															숨김
														</UpdateClassPostStatusButton>
													) : null}
												</>
											) : null}
											{role === "teacher" && post.authorId === userId && post.status === "archived" ? (
												<UpdateClassPostStatusButton postId={post.id} status="draft">
													재검토 요청
												</UpdateClassPostStatusButton>
											) : null}
											{canDelete || post.authorId === userId ? <DeleteClassPostButton postId={post.id} /> : null}
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
					<TableCaption>삭제 시 학부모 포털에서도 사라집니다.</TableCaption>
				</Table>
			</section>
		</div>
	);
}
