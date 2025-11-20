
"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Lock } from "lucide-react";

import { LoginModal } from "@/components/site/login-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbox } from "@/components/stories/lightbox";

export type ClassNewsGalleryAttachment = {
	id: string;
	previewUrl: string;
	fullUrl: string;
	caption?: string;
	alt?: string;
};

export type ClassNewsGalleryPost = {
	id: string;
	title: string;
	summary?: string;
	classroomName?: string;
	dateText: string;
	attachments: ClassNewsGalleryAttachment[];
};

export type ClassNewsGalleryTab = {
	key: string;
	label: string;
	posts: ClassNewsGalleryPost[];
};

type ClassNewsGalleryProps = {
	tabs: ClassNewsGalleryTab[];
	defaultTab: string;
	isAuthenticated: boolean;
	canViewGallery: boolean;
	isPendingParent: boolean;
	defaultLoginOpen?: boolean;
	loginRedirectPath: string;
};

export function ClassNewsGallery({
	tabs,
	defaultTab,
	isAuthenticated,
	canViewGallery,
	isPendingParent,
	defaultLoginOpen = false,
	loginRedirectPath,
}: ClassNewsGalleryProps) {
	const safeDefault = useMemo(() => defaultTab ?? tabs[0]?.key ?? "gaenari", [defaultTab, tabs]);
	const [activeTab, setActiveTab] = useState(safeDefault);
	const [selectedPost, setSelectedPost] = useState<ClassNewsGalleryPost | null>(null);
	const [loginOpen, setLoginOpen] = useState(defaultLoginOpen);
	const [lightboxIndex, setLightboxIndex] = useState(0);

	const openPost = (post: ClassNewsGalleryPost) => {
		setSelectedPost(post);
		setLightboxIndex(0);
	};

	const closePost = () => setSelectedPost(null);

	const renderGuestState = () => (
		<div className="flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-white/80 px-6 py-12 text-center text-sm text-muted-foreground">
			<Lock className="h-5 w-5 text-[var(--brand-primary)]" aria-hidden />
			<p>사진과 자세한 활동 기록은 로그인 후 확인하실 수 있습니다.</p>
			<Button variant="outline" onClick={() => setLoginOpen(true)}>
				로그인하고 전체 보기
			</Button>
		</div>
	);

	const renderPendingState = () => (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/85 px-6 py-10 text-center text-sm leading-relaxed text-muted-foreground">
			<p className="font-semibold text-[var(--brand-navy)]">승인 완료 후 사진이 공개됩니다.</p>
			<p className="mt-2">승인 대기 중인 보호자는 학부모 포털 &gt; 승인 안내 페이지에서 상태를 확인할 수 있습니다.</p>
		</div>
	);

	const renderEmptyState = (label: string) => (
		<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-white/85 px-6 py-10 text-center text-sm text-muted-foreground">
			{label}에 게시된 사진이 아직 없습니다.
		</div>
	);

	return (
		<>
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="flex flex-wrap gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-white/90 px-2 py-2 shadow-[var(--shadow-soft)]">
					{tabs.map((tab) => (
						<TabsTrigger
							key={tab.key}
							value={tab.key}
							className="min-w-[110px] rounded-[var(--radius-md)] border border-transparent px-3 py-1.5 text-sm font-semibold data-[state=active]:border-[var(--brand-primary)] data-[state=active]:bg-[var(--brand-primary)]/10"
						>
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

				{tabs.map((tab) => (
					<TabsContent key={tab.key} value={tab.key} className="mt-6">
						{canViewGallery ? (
							tab.posts.length ? (
								<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
									{tab.posts.map((post, index) => (
										<button
											key={post.id}
											type="button"
											onClick={() => openPost(post)}
											className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white text-left shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:shadow-xl"
											data-testid="class-gallery-card"
										>
											<div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--surface-muted)]">
												<Image
													src={post.attachments[0]?.previewUrl ?? "/images/placeholder-card.jpg"}
													alt={post.attachments[0]?.alt ?? post.title}
													fill
													className="object-cover"
													sizes="(min-width:1024px) 33vw, 100vw"
													priority={index === 0}
												/>
											</div>
											<div className="flex flex-1 flex-col gap-2 px-5 py-4">
												<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
													<Badge variant="outline">{post.classroomName ?? "우리반"}</Badge>
													<Badge variant="ghost">{post.dateText}</Badge>
												</div>
												<p className="text-base font-semibold text-[var(--brand-navy)]">{post.title}</p>
												{post.summary ? (
													<p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{post.summary}</p>
												) : null}
											</div>
										</button>
									))}
								</div>
							) : (
								renderEmptyState(tab.label)
							)
						) : isAuthenticated ? (
							isPendingParent ? renderPendingState() : renderEmptyState("권한이 있는 계정으로 로그인해 주세요")
						) : (
							renderGuestState()
						)}
					</TabsContent>
				))}
			</Tabs>

			<Lightbox
				open={!!selectedPost}
				onClose={closePost}
				items={
					selectedPost
						? selectedPost.attachments.map((a, idx) => ({
								id: `${selectedPost.id}-${a.id}`,
								src: a.fullUrl,
								thumb: a.previewUrl,
								alt: a.alt ?? `${selectedPost.title} - ${idx + 1}`,
								title: selectedPost.title,
								description: selectedPost.summary,
								meta: selectedPost.dateText,
							}))
						: []
				}
				startIndex={lightboxIndex}
			/>

			<LoginModal open={loginOpen && !isAuthenticated} onClose={() => setLoginOpen(false)} redirectTo={loginRedirectPath} />
		</>
	);
}
