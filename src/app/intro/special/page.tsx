import Link from "next/link";

import { IntroSidebar } from "@/components/intro/IntroSidebar";
import { Badge } from "@/components/ui/badge";
import { specialContent } from "@/data/special";

export default function SpecialPage() {
	const { heroTitle, heroSubtitle, heroBody, features } = specialContent;

	return (
		<div className="bg-[var(--background)] text-[var(--brand-navy)]">
			<section className="border-b border-[var(--border)] bg-white/85">
				<div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-12 sm:px-10 lg:px-12">
					<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">유치원 소개</p>
					<h1 className="font-heading text-[clamp(2.4rem,4vw,3.2rem)] leading-tight">본원의 특색</h1>
					<nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="breadcrumb">
						<Link href="/" className="text-[var(--brand-primary)] underline-offset-4 hover:underline">
							홈
						</Link>
						<span>/</span>
						<span>유치원 소개</span>
						<span>/</span>
						<span>본원의 특색</span>
					</nav>
				</div>
			</section>

			<section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
				<div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
					<IntroSidebar />

					<article className="space-y-8">
				<section className="rounded-[0.65rem] border border-[var(--brand-primary)]/25 bg-white/95 p-6 shadow-[var(--shadow-soft)]">
							<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">교육 철학</p>
							<h2 className="mt-2 text-[clamp(1.8rem,2.4vw,2.2rem)] font-semibold text-[var(--brand-primary)]">{heroTitle}</h2>
							<p className="mt-2 text-base font-medium text-[var(--brand-navy)]">{heroSubtitle}</p>
							<div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
								{heroBody.map((paragraph, idx) => (
									<p key={`hero-body-${idx}`}>{paragraph}</p>
								))}
							</div>
						</section>

				<section>
							<h3 className="text-lg font-semibold text-[var(--brand-navy)]">신촌몬테소리의 대표 프로그램</h3>
					<div className="mt-4 grid gap-4 md:grid-cols-2">
								{features.map((feature) => (
							<div
								key={feature.title}
								className="flex h-full flex-col gap-3 rounded-[0.65rem] border border-[var(--border)] bg-white/90 p-5 shadow-[var(--shadow-soft)]"
							>
										<div className="flex items-center justify-between gap-3">
											<h4 className="text-base font-semibold text-[var(--brand-navy)]">{feature.title}</h4>
											<Badge className="rounded-full bg-[var(--brand-mint)]/40 text-[var(--brand-primary)]" variant="outline">
												{feature.badge}
											</Badge>
										</div>
										<p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
									</div>
								))}
							</div>
						</section>
					</article>
				</div>
			</section>
		</div>
	);
}
