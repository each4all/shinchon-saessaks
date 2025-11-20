"use client";

import Image from "next/image";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Lightbox } from "@/components/stories/lightbox";

type GalleryEvent = {
	id: string;
	title: string;
	description?: string;
	location?: string;
	classroomName?: string;
	dateText: string;
	images: string[];
};

type EventGalleryProps = {
	events: GalleryEvent[];
};

export function EventGallery({ events }: EventGalleryProps) {
	const [selected, setSelected] = useState<GalleryEvent | null>(null);
	const [startIndex, setStartIndex] = useState(0);

	if (!events.length) {
		return (
			<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-white/80 p-10 text-center text-sm text-muted-foreground">
				게시된 행사가 없습니다. 관리자에서 일정을 등록하면 자동으로 노출됩니다.
			</div>
		);
	}

	return (
		<>
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{events.map((event, index) => (
					<button
						key={event.id}
						type="button"
						onClick={() => {
							setSelected(event);
							setStartIndex(0);
						}}
						className="flex h-full flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-white text-left shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:shadow-xl"
					>
						<div className="relative aspect-[4/3] w-full overflow-hidden">
							<Image
								src={event.images[0]}
								alt={event.title}
								fill
								className="object-cover"
								sizes="(min-width:1024px) 33vw, 100vw"
								priority={index === 0}
							/>
						</div>
						<div className="flex flex-1 flex-col gap-2 px-5 py-4">
							<div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
								<Badge variant="outline">{event.classroomName ?? "전체"}</Badge>
								{event.location ? <Badge variant="secondary">{event.location}</Badge> : null}
								<Badge variant="ghost">{event.dateText}</Badge>
							</div>
							<h2 className="text-base font-semibold text-[var(--brand-navy)]">{event.title}</h2>
							<p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
								{event.description?.trim() || `${event.title} 현장의 순간을 사진으로 만나보세요.`}
							</p>
						</div>
					</button>
				))}
			</div>

			<Lightbox
				open={!!selected}
				onClose={() => setSelected(null)}
				items={
					selected
						? selected.images.map((img, idx) => ({
								id: `${selected.id}-${idx}`,
								src: img,
								thumb: img,
								alt: `${selected.title} - ${idx + 1}`,
								title: selected.title,
								description: selected.description,
								meta: selected.dateText,
						  }))
						: []
				}
				startIndex={startIndex}
			/>
		</>
	);
}
