import Image from "next/image";
import Link from "next/link";

import { IntroSidebar } from "@/components/intro/IntroSidebar";
import { ideologyContent } from "@/data/ideology";

export default function IdeologyPage() {
	const { motto, pillars } = ideologyContent;

	return (
		<div className="bg-[var(--background)] text-[var(--brand-navy)]">
			<section className="border-b border-[var(--border)] bg-white/85">
				<div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-12 sm:px-10 lg:px-12">
					<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">유치원 소개</p>
					<h1 className="font-heading text-[clamp(2.4rem,4vw,3.2rem)] leading-tight">원훈</h1>
					<nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="breadcrumb">
						<Link href="/" className="text-[var(--brand-primary)] underline-offset-4 hover:underline">
							홈
						</Link>
						<span>/</span>
						<span>유치원 소개</span>
						<span>/</span>
						<span>원훈</span>
					</nav>
				</div>
			</section>

			<section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
				<div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
					<IntroSidebar />

					<article className="space-y-8">
						<section className="grid gap-6 rounded-[var(--radius-lg)] border border-[var(--brand-primary)]/25 bg-white/95 p-6 shadow-[var(--shadow-soft)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
							<div className="space-y-3">
								<h2 className="text-[clamp(2rem,3vw,2.6rem)] font-heading text-[var(--brand-primary)]">
									{motto.description}
								</h2>
							</div>
							<div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full border border-[var(--border)] bg-white md:mx-0">
								<Image src={motto.imageSrc} alt={motto.imageAlt} fill className="object-contain p-3" sizes="112px" />
							</div>
						</section>

						<section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							{pillars.map((pillar) => (
								<div
									key={pillar.title}
									className="flex h-full flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 p-5 text-sm text-center shadow-[var(--shadow-soft)]"
								>
									<div className="relative h-20 w-20 overflow-hidden rounded-full border border-[var(--border)] bg-white">
										<Image src={pillar.imageSrc} alt={pillar.imageAlt} fill className="object-contain p-3" sizes="80px" />
									</div>
									<div className="space-y-2">
										<p className="text-base font-semibold text-[var(--brand-navy)]">{pillar.title}</p>
										<p className="text-muted-foreground">{pillar.description}</p>
									</div>
								</div>
							))}
						</section>
					</article>
				</div>
			</section>
		</div>
	);
}
