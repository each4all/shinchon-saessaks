import type { Metadata } from "next";

import { StoriesSidebar } from "@/components/stories/StoriesSidebar";
import { Badge } from "@/components/ui/badge";
import { getPublicEventGallery } from "@/lib/data/class-schedule-repository";

import { EventGallery } from "./event-gallery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "교육행사 갤러리 | 신촌몬테소리유치원",
	description:
		"최근 진행된 신촌몬테소리유치원의 교육행사를 사진으로 만나보세요. 가족 운동회, 성경암송대회 등 아이들과 함께한 순간들을 기록합니다.",
};

function formatDateRange(start: Date, end?: Date | null) {
	const startStr = new Intl.DateTimeFormat("ko-KR", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(start);
	if (!end) return startStr;
	const endStr = new Intl.DateTimeFormat("ko-KR", {
		month: "2-digit",
		day: "2-digit",
	}).format(end);
	return `${startStr} ~ ${endStr}`;
}

export default async function StoriesEventsPage() {
	const events = await getPublicEventGallery({ limit: 12 });
	const galleryEvents = events.map((event) => ({
		id: event.id,
		title: event.title,
		description: event.description ?? undefined,
		location: event.location ?? undefined,
		classroomName: event.classroomName ?? "전체",
		dateText: formatDateRange(event.startDate, event.endDate),
		images: event.resources.map((resource) => resource.fileUrl),
	}));

	return (
		<div className="bg-[var(--background)] text-[var(--brand-navy)]">
	<section className="border-b border-[var(--border)] bg-white/85">
				<div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-12 sm:px-10 lg:px-12">
					<Badge variant="outline" className="w-fit">
						우리들 이야기
					</Badge>
			<h1 className="font-heading text-[clamp(2.25rem,4vw,3rem)] leading-tight">교육행사</h1>
			<p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
				가족 참여 행사, 신앙 프로그램, 졸업식 등 연중 주요 이벤트를 사진으로 되돌아볼 수 있습니다. 로그인한 보호자는 카드에서 원본
				이미지를 확인할 수 있어요.
			</p>
		</div>
	</section>

	<section className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-12">
		<div className="hidden lg:block">
			<StoriesSidebar title="교육 행사" />
		</div>
		<div className="space-y-10">
			<section className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 px-6 py-6 shadow-[var(--shadow-soft)]">
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
						<span className="rounded-full bg-[var(--brand-primary)]/10 px-3 py-1 text-[var(--brand-primary)]">Gallery</span>
						<span>교육행사 스토리</span>
					</div>
					<h2 className="font-heading text-[clamp(1.8rem,3vw,2.4rem)] text-[var(--brand-navy)]">현장감 있는 추억 앨범</h2>
					<p className="text-sm text-muted-foreground">
						가족운동회, 성경암송대회, 졸업식 등 주요 행사를 최신 순으로 모았습니다. 카드에서 원본 상세 이미지를 확인할 수 있습니다.
					</p>
				</div>

				<EventGallery events={galleryEvents} />
			</section>
		</div>
	</section>
		</div>
	);
}
