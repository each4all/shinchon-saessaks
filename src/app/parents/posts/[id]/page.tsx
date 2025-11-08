import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CalendarDays, ExternalLink, ImageIcon, Paperclip, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { getParentClassPost } from "@/lib/data/class-posts-repository";

export const dynamic = "force-dynamic";

function formatDate(date: Date | null) {
	if (!date) return "";
	return new Intl.DateTimeFormat("ko-KR", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
}

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];

function isImageAttachment(attachment: { fileUrl: string; mediaType?: string | null }) {
	if (!attachment?.fileUrl) return false;
	if (attachment.mediaType) {
		return attachment.mediaType.startsWith("image");
	}
	try {
		const url = new URL(attachment.fileUrl);
		const pathname = url.pathname.toLowerCase();
		return IMAGE_EXTENSIONS.some((ext) => pathname.endsWith(`.${ext}`));
	} catch {
		const lower = attachment.fileUrl.toLowerCase();
		return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(`.${ext}`));
	}
}

type ParentPostDetailPageProps = {
	params: Promise<{ id: string }>;
};

export default async function ParentPostDetailPage({ params }: ParentPostDetailPageProps) {
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/stories/class-news?login=1");
	}

	const { id } = await params;

	const post = await getParentClassPost(session.user.id, id);
	if (!post) {
		notFound();
	}

	const publishedDate = post.publishAt ?? post.createdAt;
	const publishedDateIso = publishedDate?.toISOString();

	return (
		<>
			<div
				className="pointer-events-none fixed inset-0 z-40 bg-[rgba(22,18,52,0.55)] backdrop-blur-sm"
				aria-hidden
			/>
			<div className="relative z-50 flex min-h-screen items-start justify-center px-4 py-10 sm:px-6 lg:px-8">
				<div className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.5)] bg-white/95 shadow-[0_40px_120px_rgba(28,9,80,0.18)]">
					<header className="flex flex-col gap-6 border-b border-[var(--border)] bg-[rgba(249,247,255,0.9)] px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10">
						<div className="flex flex-col gap-3">
							<div className="flex flex-wrap items-center gap-3">
								<Badge variant="outline" className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em]">
									Class News
								</Badge>
								<span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
									<CalendarDays className="h-3.5 w-3.5" aria-hidden />
									<time dateTime={publishedDateIso}>{formatDate(publishedDate)}</time>
								</span>
								<span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
									<ImageIcon className="h-3.5 w-3.5" aria-hidden />
									{post.attachments.filter(isImageAttachment).length}장
								</span>
							</div>
							<h1 className="font-heading text-[clamp(2rem,4vw,2.75rem)] leading-tight text-[var(--brand-navy)]">
								{post.title}
							</h1>
							<p className="text-sm text-muted-foreground">
								<strong className="font-medium text-[var(--brand-navy)]">
									{post.classroomName ?? "반 미지정"}
								</strong>
								<span className="mx-2 text-[var(--brand-navy)]/30">·</span>
								<span>게시글은 승인 완료 후 학부모에게 노출됩니다.</span>
							</p>
							{post.summary ? (
								<p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{post.summary}</p>
							) : null}
						</div>
						<Link
							href="/parents/posts"
							className="group inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--brand-primary)] transition hover:bg-[rgba(129,87,236,0.08)]"
						>
							<span>목록으로</span>
							<X className="h-4 w-4 transition group-hover:rotate-90" aria-hidden />
							<span className="sr-only">목록으로 돌아가기</span>
						</Link>
					</header>

					<div className="grid gap-10 px-6 py-8 sm:px-10 sm:py-10">
						<article className="space-y-6 rounded-[var(--radius-lg)] bg-white/90 p-6 text-base leading-relaxed text-muted-foreground shadow-[var(--shadow-soft)]">
							{post.content.map((paragraph, index) => (
								<p key={`${post.id}-paragraph-${index}`} className="whitespace-pre-line">
									{paragraph}
								</p>
							))}
						</article>

						{(() => {
							const imageAttachments = post.attachments.filter(isImageAttachment);
							const fileAttachments = post.attachments.filter((attachment) => !isImageAttachment(attachment));

							return (
								<>
									{imageAttachments.length ? (
										<section className="space-y-4">
											<div className="flex items-center justify-between">
												<h2 className="text-xl font-semibold text-[var(--brand-navy)]">사진 갤러리</h2>
												<span className="text-xs text-muted-foreground">이미지를 선택하면 새 창에서 크게 볼 수 있어요.</span>
											</div>
											<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
												{imageAttachments.map((attachment, index) => (
													<a
														key={`${post.id}-image-${index}`}
														href={attachment.fileUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="group relative block overflow-hidden rounded-[22px] border border-[rgba(129,87,236,0.15)] bg-[rgba(245,242,255,0.85)] shadow-[var(--shadow-soft)] transition hover:-translate-y-1"
														aria-label={attachment.label ?? `${post.title} 이미지`}
													>
														{/* eslint-disable-next-line @next/next/no-img-element */}
														<img
															src={attachment.fileUrl}
															alt={attachment.label ?? `${post.title} 이미지`}
															loading="lazy"
															className="h-64 w-full object-cover transition duration-200 group-hover:scale-105"
														/>
														<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-0 transition group-hover:opacity-100" />
														<div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 px-4 py-3 text-xs text-white">
															<span className="truncate font-medium">
																{attachment.label ?? `사진 ${index + 1}`}
															</span>
															<ExternalLink className="h-4 w-4" aria-hidden />
														</div>
													</a>
												))}
											</div>
										</section>
									) : null}

									{fileAttachments.length ? (
										<section className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 p-6 text-sm shadow-[var(--shadow-soft)]">
											<div className="flex items-center gap-2 text-[var(--brand-navy)]">
												<Paperclip className="h-4 w-4" aria-hidden />
												<h2 className="text-base font-semibold">첨부 자료</h2>
											</div>
											<ul className="space-y-2">
												{fileAttachments.map((attachment) => (
													<li key={attachment.id}>
														<Link
															href={attachment.fileUrl}
															target="_blank"
															rel="noopener noreferrer"
															className="inline-flex items-center gap-1 text-[var(--brand-primary)] underline-offset-4 hover:underline"
														>
															<ExternalLink className="h-3.5 w-3.5" aria-hidden />
															<span>{attachment.label ?? "첨부 자료"}</span>
														</Link>
													</li>
												))}
											</ul>
										</section>
									) : null}
								</>
							);
						})()}
					</div>
				</div>
			</div>
		</>
	);
}
