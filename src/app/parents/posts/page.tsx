import Link from "next/link";
import { redirect } from "next/navigation";

import { CalendarDays, ImageIcon, Paperclip } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { getParentClassPosts } from "@/lib/data/class-posts-repository";

import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

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

function formatDate(date: Date | null) {
	if (!date) return "";
	return new Intl.DateTimeFormat("ko-KR", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
}

export default async function ParentPostsPage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/stories/class-news?login=1");
	}

	const posts = await getParentClassPosts(session.user.id, 40);

	return (
		<div className="bg-[var(--background)] text-[var(--brand-navy)]">
			<section className="border-b border-[var(--border)] bg-white/85">
				<div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-12 sm:px-10 lg:px-12">
					<Badge variant="outline" className="w-fit">
						Class News
					</Badge>
					<h1 className="font-heading text-[clamp(2rem,4vw,3rem)] leading-tight">반 소식 전체 보기</h1>
					<p className="text-sm leading-relaxed text-muted-foreground">
						아이 반에서 올라온 소식을 한 페이지에서 확인하세요. 첨부된 안내문과 사진은 새 창으로 열립니다.
					</p>
					<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
						<span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-3 py-1">
							<CalendarDays className="h-3.5 w-3.5" aria-hidden />
							<em className="not-italic text-[var(--brand-navy)]/70">최근 40건까지 제공</em>
						</span>
						<span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-3 py-1">
							<ImageIcon className="h-3.5 w-3.5" aria-hidden />
							<em className="not-italic text-[var(--brand-navy)]/70">사진</em>
						</span>
						<span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-3 py-1">
							<Paperclip className="h-3.5 w-3.5" aria-hidden />
							<em className="not-italic text-[var(--brand-navy)]/70">첨부</em>
						</span>
					</div>
				</div>
			</section>

			<section className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 sm:px-10 lg:px-12">
				{posts.length === 0 ? (
					<p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white/80 px-4 py-12 text-center text-sm text-muted-foreground">
						등록된 소식이 없습니다.
					</p>
				) : (
					<Table>
						<TableCaption className="px-4 text-left text-xs text-muted-foreground">
							최신 게시글이 상단에 표시됩니다. 제목을 선택하면 상세 내용을 모달 형태로 확인할 수 있습니다.
						</TableCaption>
						<TableHeader className="bg-[rgba(241,239,255,0.7)]">
							<TableRow className="text-xs uppercase tracking-[0.18em]">
								<TableHead className="w-16 text-center">No.</TableHead>
								<TableHead className="w-32 text-center">반</TableHead>
								<TableHead>제목</TableHead>
								<TableHead className="w-40 text-center">게시일</TableHead>
								<TableHead className="w-32 text-center">첨부</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{posts.map((post, index) => {
								const reversedIndex = posts.length - index;
								const imageCount = post.attachments.filter(isImageAttachment).length;
								const fileCount = post.attachments.length - imageCount;

								return (
									<TableRow key={post.id} className="align-top">
										<TableCell className="text-center text-sm text-muted-foreground">{reversedIndex}</TableCell>
										<TableCell className="text-center text-sm font-medium text-[var(--brand-navy)]">
											{post.classroomName ?? "반 미지정"}
										</TableCell>
										<TableCell className="py-4 text-sm">
											<div className="flex flex-col gap-1">
												<Link
													href={`/parents/posts/${post.id}`}
													className="text-[var(--brand-primary)] underline-offset-4 hover:underline"
												>
													{post.title}
												</Link>
												{post.summary ? (
													<p className="line-clamp-2 text-xs leading-snug text-muted-foreground">{post.summary}</p>
												) : null}
											</div>
										</TableCell>
										<TableCell className="text-center text-sm text-muted-foreground">
											{formatDate(post.publishAt ?? post.createdAt)}
										</TableCell>
										<TableCell>
											<div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
												{imageCount > 0 ? (
													<span
														className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-2 py-1"
														title={`사진 ${imageCount}개`}
													>
														<ImageIcon className="h-3 w-3" aria-hidden />
														<span>{imageCount}</span>
													</span>
												) : (
													<span className="inline-flex h-7 min-w-[3.5rem] items-center justify-center rounded-full border border-dashed border-[var(--border)] bg-white px-2 py-1 text-[10px] uppercase tracking-wide text-[var(--brand-navy)]/40">
														없음
													</span>
												)}
												{fileCount > 0 ? (
													<span
														className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-2 py-1"
														title={`첨부 ${fileCount}개`}
													>
														<Paperclip className="h-3 w-3" aria-hidden />
														<span>{fileCount}</span>
													</span>
												) : null}
											</div>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				)}
			</section>
		</div>
	);
}
