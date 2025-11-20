import Link from "next/link";

import { CurriculumSidebar } from "@/components/curriculum/CurriculumSidebar";
import { montessoriAreas, montessoriIntro } from "@/data/montessori";

const PLACEHOLDER_COUNT = 4;

export default function MontessoriPage() {
	return (
		<div className="bg-[var(--background)] text-[var(--brand-navy)]">
			<section className="border-b border-[var(--border)] bg-white/90">
				<div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-12 sm:px-10 lg:px-12">
					<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">교육과정</p>
					<h1 className="font-heading text-[clamp(2.4rem,4vw,3.2rem)] leading-tight">몬테소리 교육</h1>
					<p className="text-sm text-muted-foreground">신촌몬테소리유치원의 몬테소리 교육 철학과 영역을 한눈에 살펴보세요.</p>
					<nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="breadcrumb">
						<Link href="/" className="text-[var(--brand-primary)] underline-offset-4 hover:underline">
							홈
						</Link>
						<span>/</span>
						<span>교육과정</span>
						<span>/</span>
						<span>몬테소리 교육</span>
					</nav>
				</div>
			</section>

			<section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
				<div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
					<CurriculumSidebar stickyOffset={112} />
					<section className="rounded-[0.65rem] border border-[var(--border)] bg-white/95 p-6 shadow-[var(--shadow-soft)]">
						<header className="space-y-4 border-b border-dashed border-[var(--border)] pb-6">
							<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{montessoriIntro.tagline}</p>
							<h2 className="font-heading text-[clamp(1.8rem,3vw,2.3rem)] text-[var(--brand-navy)]">
								{montessoriIntro.headline}
							</h2>
							<p className="text-base leading-relaxed text-[var(--brand-navy)]/85">{montessoriIntro.description}</p>
						</header>

						<div className="mt-8 space-y-8">
							{montessoriAreas.map((area) => (
								<article
									key={area.id}
									className="rounded-[0.65rem] border border-[var(--border)] bg-white/90 p-5 shadow-[var(--shadow-soft)]"
								>
									<div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
										<div aria-label="사진 자리" className="flex flex-wrap gap-3">
											{Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
												<div
													key={`${area.id}-placeholder-${index}`}
													className="flex h-20 flex-1 min-w-[120px] items-center justify-center rounded-[0.5rem] border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/60 text-xs text-muted-foreground"
												>
													이미지 자리
												</div>
											))}
										</div>
										<div className="space-y-3">
											<div className="flex flex-wrap items-center gap-2">
												<span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
													{area.highlightLabel}
												</span>
											</div>
											<h3 className="font-heading text-xl text-[var(--brand-navy)]">{area.title}</h3>
											<p className="text-sm leading-relaxed text-[var(--brand-navy)]/85">{area.description}</p>
										</div>
									</div>
								</article>
							))}
						</div>
					</section>
				</div>
			</section>
		</div>
	);
}
