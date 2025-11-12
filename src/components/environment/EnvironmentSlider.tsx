"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import type { EnvironmentImage } from "@/data/environment";

interface EnvironmentSliderProps {
	images: EnvironmentImage[];
}

export function EnvironmentSlider({ images }: EnvironmentSliderProps) {
	const slides = useMemo(() => images.filter((img) => Boolean(img.src)), [images]);
	const total = slides.length;
	const [index, setIndex] = useState(0);

	const goTo = useCallback(
		(direction: "prev" | "next") => {
			setIndex((current) => {
				if (total === 0) {
					return 0;
				}
				const delta = direction === "next" ? 1 : -1;
				return (current + delta + total) % total;
			});
		},
		[total],
	);

	if (total === 0) {
		return (
			<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-white/70 p-8 text-center text-sm text-muted-foreground">
				준비된 이미지가 없습니다.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap justify-center gap-3 overflow-x-auto pb-1">
				{slides.map((image, thumbIndex) => (
					<button
						key={`thumb-${image.src}`}
						type="button"
						onClick={() => setIndex(thumbIndex)}
						className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-[var(--radius-md)] border transition ${
							thumbIndex === index
								? "border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/40"
								: "border-[var(--border)] opacity-70 hover:opacity-100"
						}`}
						aria-current={thumbIndex === index}
						aria-label={`${image.title} 이미지 보기`}
					>
						<Image
							src={image.src}
							alt={image.title}
							fill
							className="object-cover"
							sizes="112px"
							priority={false}
						/>
					</button>
				))}
			</div>

			<div className="relative">
				<div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/95 shadow-[var(--shadow-soft)]">
					<div
						className="flex transition-transform duration-500 ease-in-out"
						style={{ transform: `translateX(-${index * 100}%)` }}
					>
						{slides.map((image) => (
							<figure key={image.src} className="relative w-full flex-shrink-0 grow-0 basis-full">
								<div className="flex min-h-[420px] w-full items-center justify-center bg-[var(--background)]">
									<Image
										src={image.src}
										alt={image.title}
										width={1920}
										height={1080}
										className="h-full w-full object-contain"
										priority={false}
									/>
								</div>
								<figcaption className="border-t border-[var(--border)] bg-white/90 px-4 py-3 text-center text-sm text-[var(--brand-navy)]">
									<span className="font-semibold">{image.title}</span>
									{image.description ? (
										<p className="mt-1 text-xs text-muted-foreground">{image.description}</p>
									) : null}
								</figcaption>
							</figure>
						))}
					</div>
				</div>

				<button
					type="button"
					onClick={() => goTo("prev")}
					className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-[var(--brand-navy)] shadow hover:bg-white"
					aria-label="이전 이미지"
				>
					<ChevronLeft className="size-5" />
				</button>
				<button
					type="button"
					onClick={() => goTo("next")}
					className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-[var(--brand-navy)] shadow hover:bg-white"
					aria-label="다음 이미지"
				>
					<ChevronRight className="size-5" />
				</button>
			</div>
		</div>
	);
}
