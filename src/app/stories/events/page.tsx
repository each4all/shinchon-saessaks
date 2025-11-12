import type { Metadata } from "next";

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
					<h1 className="font-heading text-[clamp(2.25rem,4vw,3rem)] leading-tight">교육행사 갤러리</h1>
				</div>
			</section>

			<section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 sm:px-10 lg:px-12">
				<EventGallery events={galleryEvents} />
			</section>
		</div>
	);
}
