"use client";

import Image from "next/image";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

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
	const [imageIndex, setImageIndex] = useState(0);

	const openEvent = (event: GalleryEvent) => {
		setSelected(event);
		setImageIndex(0);
	};

	const closeModal = () => setSelected(null);

	const showPrev = () => {
		if (!selected) return;
		setImageIndex((current) => (current - 1 + selected.images.length) % selected.images.length);
	};

	const showNext = () => {
		if (!selected) return;
		setImageIndex((current) => (current + 1) % selected.images.length);
	};

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
						onClick={() => openEvent(event)}
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
							{event.description ? (
								<p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">{event.description}</p>
							) : null}
						</div>
					</button>
				))}
			</div>

			{selected ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={closeModal}>
					<div
						className="relative w-full max-w-4xl bg-white p-6 shadow-2xl"
						onClick={(event) => event.stopPropagation()}
					>
						<button
							type="button"
							onClick={closeModal}
							className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-white shadow-lg transition hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black"
							aria-label="닫기"
						>
							<X className="size-5" />
						</button>

						<div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--background)]">
							<Image
								src={selected.images[imageIndex]}
								alt={selected.title}
								fill
								className="pointer-events-none object-contain"
								sizes="(min-width:768px) 60vw, 100vw"
							/>
							{selected.images.length > 1 ? (
								<>
									<button
										type="button"
										onClick={showPrev}
										className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[var(--brand-navy)] shadow transition hover:bg-white"
										aria-label="이전 사진"
									>
										<ChevronLeft className="size-5" />
									</button>
									<button
										type="button"
										onClick={showNext}
										className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[var(--brand-navy)] shadow transition hover:bg-white"
										aria-label="다음 사진"
									>
										<ChevronRight className="size-5" />
									</button>
								</>
							) : null}
						</div>

						{selected.images.length > 1 ? (
							<div className="mt-3 flex gap-2 overflow-x-auto">
								{selected.images.map((image, idx) => (
									<button
										key={`${selected.id}-thumb-${idx}`}
										type="button"
										onClick={() => setImageIndex(idx)}
										className={`relative h-16 w-24 overflow-hidden rounded-[var(--radius-sm)] border ${
											idx === imageIndex ? "border-[var(--brand-primary)]" : "border-[var(--border)] opacity-70"
										}`}
									>
										<Image src={image} alt={selected.title} fill className="object-cover" sizes="96px" />
									</button>
								))}
							</div>
						) : null}

						<div className="mt-4 space-y-2">
							<div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
								<Badge variant="outline">{selected.classroomName ?? "전체"}</Badge>
								{selected.location ? <Badge variant="secondary">{selected.location}</Badge> : null}
								<Badge variant="ghost">{selected.dateText}</Badge>
							</div>
							<p className="text-base font-semibold text-[var(--brand-navy)]">{selected.title}</p>
							{selected.description ? (
								<p className="text-sm leading-relaxed text-muted-foreground">{selected.description}</p>
							) : null}
						</div>
					</div>
				</div>
			) : null}
		</>
	);
}
