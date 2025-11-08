import Image from "next/image";

import type { EnvironmentImage } from "@/data/environment";

interface EnvironmentGalleryProps {
	images: EnvironmentImage[];
}

export function EnvironmentGallery({ images }: EnvironmentGalleryProps) {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{images.map((image) => (
				<figure
					key={image.src}
					className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/95 shadow-[var(--shadow-soft)]"
				>
					<div className="relative h-60 w-full">
						<Image
							src={image.src}
							alt={image.title}
							fill
							className="object-cover transition duration-500 group-hover:scale-105"
							sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
							priority={false}
						/>
					</div>
					<figcaption className="border-t border-[var(--border)] bg-white/90 px-4 py-3 text-sm font-semibold text-[var(--brand-navy)]">
						{image.title}
					</figcaption>
				</figure>
			))}
		</div>
	);
}
