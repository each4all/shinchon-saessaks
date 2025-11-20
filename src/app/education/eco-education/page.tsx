import Link from "next/link";

import { CurriculumSidebar } from "@/components/curriculum/CurriculumSidebar";
import { ecoActivities, ecoIntro } from "@/data/eco-education";

const HERO_PLACEHOLDER_COUNT = 2;
const PHOTO_PLACEHOLDER_COUNT = 3;

export default function EcoEducationPage() {
	return (
		<div className="bg-[var(--background)] text-[var(--brand-navy)]">
			<section className="border-b border-[var(--border)] bg-white/85">
				<div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-12 sm:px-10 lg:px-12">
					<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">교육과정</p>
					<h1 className="font-heading text-[clamp(2.4rem,4vw,3.2rem)] leading-tight">생태 유아교육</h1>
					<p className="text-sm text-muted-foreground">생태 감수성을 키우는 커리큘럼과 체험 활동을 확인할 수 있습니다.</p>
					<nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="breadcrumb">
						<Link href="/" className="text-[var(--brand-primary)] underline-offset-4 hover:underline">
							홈
						</Link>
						<span>/</span>
						<span>교육과정</span>
						<span>/</span>
						<span>생태 유아교육</span>
					</nav>
				</div>
			</section>

			<section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
				<div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
					<CurriculumSidebar />
					<section className="rounded-[0.65rem] border border-[var(--border)] bg-white/95 p-6 shadow-[var(--shadow-soft)]">
						<header className="space-y-4 border-b border-dashed border-[var(--border)] pb-6">
							<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{ecoIntro.tagline}</p>
							<h2 className="font-heading text-[clamp(1.8rem,3vw,2.3rem)] text-[var(--brand-navy)]">{ecoIntro.headline}</h2>
							<div className="grid gap-4 md:grid-cols-2">
								{Array.from({ length: HERO_PLACEHOLDER_COUNT }).map((_, index) => (
									<div
										key={`eco-hero-${index}`}
										className="flex h-32 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/70 text-xs text-muted-foreground"
									>
										이미지 자리
									</div>
								))}
							</div>
							<div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
								{ecoIntro.description.map((paragraph) => (
									<p key={paragraph}>{paragraph}</p>
								))}
							</div>
						</header>

						<section className="mt-8 space-y-6">
							<div className="flex flex-col gap-1">
								<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">핵심 활동</p>
								<h3 className="font-heading text-xl text-[var(--brand-navy)]">자연을 가까이에서 만나는 프로그램</h3>
							</div>
							<div className="grid gap-4 md:grid-cols-2">
								{ecoActivities.map((activity) => (
									<article
										key={activity.id}
										className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white/90 p-4 shadow-[var(--shadow-soft)]"
									>
										<h4 className="text-lg font-semibold text-[var(--brand-primary)]">{activity.title}</h4>
										<p className="mt-2 text-sm leading-relaxed text-muted-foreground">{activity.description}</p>
									</article>
								))}
							</div>
						</section>

						<section className="mt-10 space-y-4">
							<div className="flex flex-col gap-1">
								<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">현장 스냅</p>
								<h3 className="font-heading text-xl text-[var(--brand-navy)]">생태 수업 스냅샷</h3>
							</div>
							<div className="flex flex-wrap gap-4">
								{Array.from({ length: PHOTO_PLACEHOLDER_COUNT }).map((_, index) => (
									<div
										key={`eco-photo-${index}`}
										className="flex size-28 items-center justify-center rounded-full border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/60 text-xs text-muted-foreground"
									>
										이미지 자리
									</div>
								))}
							</div>
						</section>
					</section>
				</div>
			</section>
		</div>
	);
}
