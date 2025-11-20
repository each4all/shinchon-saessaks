"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type LightboxItem = {
	id: string;
	src: string;
	alt?: string;
	thumb?: string;
	title?: string;
	description?: string;
	meta?: string;
};

type LightboxProps = {
	open: boolean;
	items: LightboxItem[];
	startIndex?: number;
	onClose: () => void;
};

export function Lightbox({ open, items, startIndex = 0, onClose }: LightboxProps) {
	const safeItems = useMemo(() => items ?? [], [items]);
	const [index, setIndex] = useState(startIndex);
	const thumbStripRef = useRef<HTMLDivElement | null>(null);
	const thumbPress = useRef<{ x: number; y: number; ts: number; idx: number } | null>(null);

	useEffect(() => {
		if (!open) return;
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIndex(startIndex ?? 0);
	}, [startIndex, open]);

	useEffect(() => {
		if (!open) return undefined;
		const { body, documentElement } = document;
		const prevBody = body.style.overflow;
		const prevHtml = documentElement.style.overflow;
		body.style.overflow = "hidden";
		documentElement.style.overflow = "hidden";
		return () => {
			body.style.overflow = prevBody;
			documentElement.style.overflow = prevHtml;
		};
	}, [open]);

	const prev = () => {
		if (!safeItems.length) return;
		setIndex((cur) => (cur - 1 + safeItems.length) % safeItems.length);
	};
	const next = () => {
		if (!safeItems.length) return;
		setIndex((cur) => (cur + 1) % safeItems.length);
	};

	const handleThumbClick = (idx: number) => {
		setIndex(idx);
	};

	const jumpFirst = () => safeItems.length && setIndex(0);
	const jumpLast = () => safeItems.length && setIndex(safeItems.length - 1);

	useEffect(() => {
		if (!open) return undefined;
		const handler = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			} else if (event.key === "ArrowLeft") {
				event.preventDefault();
				prev();
			} else if (event.key === "ArrowRight") {
				event.preventDefault();
				next();
			} else if (event.key === "Home") {
				event.preventDefault();
				jumpFirst();
			} else if (event.key === "End") {
				event.preventDefault();
				jumpLast();
			}
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	});

	// 활성 썸네일을 중앙으로 스크롤
	useEffect(() => {
		if (!thumbStripRef.current || !safeItems.length) return;
		const strip = thumbStripRef.current;
		const active = strip.querySelector<HTMLButtonElement>('button[aria-current="true"]');
		if (!active) return;
		const targetCenter = active.offsetLeft + active.offsetWidth / 2 - strip.clientWidth / 2;
		const nextScroll = Math.max(0, Math.min(strip.scrollWidth - strip.clientWidth, targetCenter));
		strip.scrollTo({ left: nextScroll, behavior: "smooth" });
	}, [index, safeItems.length]);

	const handleThumbPointerDown = (e: React.PointerEvent<HTMLButtonElement>, idx: number) => {
		thumbPress.current = { x: e.clientX, y: e.clientY, ts: e.timeStamp, idx };
	};

	const handleThumbPointerUp = (e: React.PointerEvent<HTMLButtonElement>, idx: number) => {
		const start = thumbPress.current;
		thumbPress.current = null;
		if (!start) return;
		const dist = Math.hypot(e.clientX - start.x, e.clientY - start.y);
		const dt = e.timeStamp - start.ts;
		if (start.idx === idx && dist < 6 && dt < 350) {
			e.preventDefault();
			e.stopPropagation();
			setIndex(idx);
		}
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6" onClick={onClose}>
			<div
				className="relative flex h-full w-full max-w-6xl max-h-[calc(100vh-2rem)] flex-col gap-3 overflow-hidden rounded-[var(--radius-lg)] bg-white/98 p-4 sm:p-6 shadow-2xl"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					onClick={onClose}
					className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-white shadow-lg transition hover:bg-black/90"
					aria-label="닫기"
				>
					<X className="size-5" />
				</button>

				<div className="relative flex-1 overflow-hidden rounded-[var(--radius-md)] bg-[var(--surface-muted)]">
					{safeItems.length ? (
						<Image
							src={safeItems[index]?.src ?? safeItems[0]?.src}
							alt={safeItems[index]?.alt ?? "gallery image"}
							fill
							className="object-contain"
							sizes="(min-width:1024px) 70vw, 100vw"
							draggable={false}
						/>
					) : null}
					{safeItems.length > 1 ? (
						<>
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									prev();
								}}
								className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[var(--brand-navy)] shadow hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
								aria-label="이전 이미지"
							>
								<ChevronLeft className="size-5" />
							</button>
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									next();
								}}
								className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[var(--brand-navy)] shadow hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
								aria-label="다음 이미지"
							>
								<ChevronRight className="size-5" />
							</button>
						</>
					) : null}
					{safeItems.length ? (
						<div className="absolute left-0 right-0 bottom-3 flex justify-center text-xs font-medium text-white drop-shadow">
							{index + 1} / {safeItems.length}
						</div>
					) : null}
				</div>

				<div className="space-y-1">
					{safeItems[index]?.title ? (
						<p className="text-base font-semibold text-[var(--brand-navy)]">{safeItems[index]?.title}</p>
					) : null}
					{safeItems[index]?.meta ? (
						<p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{safeItems[index]?.meta}</p>
					) : null}
					{safeItems[index]?.description ? (
						<p className="text-sm leading-relaxed text-muted-foreground">{safeItems[index]?.description}</p>
					) : null}
				</div>

				{safeItems.length > 1 ? (
					<div
						ref={thumbStripRef}
						className="flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide"
						style={{ scrollbarWidth: "none" }}
						role="listbox"
						aria-label="썸네일"
						onWheel={(e) => {
							if (!thumbStripRef.current) return;
							thumbStripRef.current.scrollLeft += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
						}}
					>
						{safeItems.map((item, idx) => (
							<button
								key={item.id}
								type="button"
								onPointerDown={(e) => handleThumbPointerDown(e, idx)}
								onPointerUp={(e) => handleThumbPointerUp(e, idx)}
								onClick={() => handleThumbClick(idx)}
								className={`pointer-events-auto relative h-16 w-24 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border ${
									idx === index ? "border-[var(--brand-primary)] shadow-sm" : "border-[var(--border)] opacity-75"
								}`}
								aria-current={idx === index}
								draggable={false}
							>
								<Image
									src={item.thumb ?? item.src}
									alt={item.alt ?? "thumbnail"}
									fill
									className="object-cover"
									sizes="96px"
									draggable={false}
								/>
							</button>
						))}
					</div>
				) : null}
			</div>
		</div>
	);
}
