import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getParentDashboardData } from "@/lib/data/parents-repository";

export const dynamic = "force-dynamic";

function formatDate(date: Date | null) {
	if (!date) return "";
	return new Intl.DateTimeFormat("ko-KR", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
}

export default async function ParentsDashboardPage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/member/login?redirect=/parents");
	}

	const dashboard = await getParentDashboardData(session.user.id);

	return (
		<div className="bg-[var(--background)] text-[var(--brand-navy)]">
			<section className="border-b border-[var(--border)] bg-white/85">
				<div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-12 sm:px-10 lg:px-12">
					<Badge variant="outline" className="w-fit">
						Parent Portal
					</Badge>
					<h1 className="font-heading text-[clamp(2.25rem,4vw,3rem)] leading-tight">
						{session.user.name ? `${session.user.name} 가정` : "학부모"}님, 안녕하세요!
					</h1>
					<p className="text-sm leading-relaxed text-muted-foreground">
						반별 소식과 일정, 첨부 자료를 이곳에서 확인할 수 있습니다. 오늘도 아이의 배움 여정을 응원해 주셔서 감사합니다.
					</p>
					{session.user.role === "admin" ? (
						<Button variant="outline" size="sm" className="w-fit" asChild>
							<Link href="/admin">관리자 콘솔 열기</Link>
						</Button>
					) : null}
				</div>
			</section>

			<section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10 sm:px-10 lg:px-12">
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<h2 className="font-heading text-xl">등록된 자녀</h2>
						<Button variant="ghost" size="sm" asChild>
							<Link href="/parents/profile">정보 수정</Link>
						</Button>
					</div>

					{dashboard.children.length === 0 ? (
						<p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white/80 px-4 py-8 text-center text-sm text-muted-foreground">
							승인된 자녀 정보가 없습니다. 원으로 문의해 주세요.
						</p>
					) : (
						<div className="grid gap-4 md:grid-cols-2">
							{dashboard.children.map((child) => (
								<Card key={child.id} className="border-[var(--border)] bg-white/85">
									<CardHeader className="space-y-2">
										<CardTitle className="text-lg">{child.name}</CardTitle>
										<CardDescription className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
											{child.classroomName ?? "배정 대기"}
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-2 text-sm text-muted-foreground">
										<p>
											담임교사: {child.leadTeacher ?? "-"}
											{child.assistantTeacher ? ` / 보조교사: ${child.assistantTeacher}` : ""}
										</p>
										<p>상태: {child.status === "active" ? "재원" : child.status}</p>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="font-heading text-xl">최근 반 소식</h2>
						<Button variant="ghost" size="sm" asChild>
							<Link href="/news/events">행사 전체 보기</Link>
						</Button>
					</div>

					{dashboard.posts.length === 0 ? (
						<p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white/80 px-4 py-8 text-center text-sm text-muted-foreground">
							등록된 반 소식이 없습니다.
						</p>
					) : (
						<div className="grid gap-4">
							{dashboard.posts.map((post) => (
								<Card key={post.id} className="border-[var(--border)] bg-white/85">
									<CardHeader className="space-y-3">
										<CardDescription className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
											{post.classroomName ?? "반 미지정"} · {formatDate(post.publishAt)}
										</CardDescription>
										<CardTitle className="text-lg">{post.title}</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3 text-sm text-muted-foreground">
										<p>{post.summary ?? post.content[0]}</p>
										{post.attachments.length ? (
											<ul className="list-disc space-y-1 pl-4 text-xs">
												{post.attachments.map((attachment) => (
													<li key={attachment.id}>
														<Link
															href={attachment.fileUrl}
															target="_blank"
															rel="noopener noreferrer"
															className="text-[var(--brand-primary)] underline-offset-4 hover:underline"
														>
																{attachment.label ?? "첨부"}
															</Link>
														</li>
													))}
											</ul>
										) : null}
                                     <Button variant="link" className="px-0 text-[var(--brand-primary)]" asChild>
                                         <Link href={`/parents/posts/${post.id}`}>자세히 보기</Link>
                                     </Button>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>

				<div className="space-y-4">
					<h2 className="font-heading text-xl">빠른 바로가기</h2>
					<div className="grid gap-4 md:grid-cols-3">
						{[
							{
								title: "급식 · 영양 안내",
								description: "이번 달 식단표와 영양사 공지를 한눈에 확인하세요.",
								href: "/parents/meals",
							},
							{
								title: "서식 자료실",
								description: "출결·건강 서류를 내려받고 바로 제출하세요.",
								href: "/parents/resources",
							},
							{
								title: "운영위원회 자료",
								description: "회의록과 예·결산 보고서를 투명하게 공개합니다.",
								href: "/parents/resources?section=committee",
							},
							{
								title: "1:1 문의",
								description: "운영/생활 문의를 남기면 담당자가 답변드립니다.",
								href: "/parents/inquiries",
							},
						].map((item) => (
							<Card key={item.title} className="border-[var(--border)] bg-white/85">
								<CardHeader className="space-y-2">
									<CardTitle className="text-lg">{item.title}</CardTitle>
									<CardDescription className="text-sm text-muted-foreground">{item.description}</CardDescription>
								</CardHeader>
								<CardContent>
									<Button variant="link" className="px-0 text-[var(--brand-primary)]" asChild>
										<Link href={item.href}>바로가기</Link>
									</Button>
								</CardContent>
							</Card>
							))}
					</div>
					{session.user.role === "admin" ? (
						<p className="text-xs text-muted-foreground">
							관리자는 언제든{" "}
							<Link href="/admin" className="text-[var(--brand-primary)] underline-offset-4 hover:underline">
								Admin Console
							</Link>
							에서 게시글과 리소스를 관리할 수 있습니다.
						</p>
					) : null}
				</div>
			</section>
		</div>
	);
}
