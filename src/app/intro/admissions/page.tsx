import Link from "next/link";

import { IntroSidebar } from "@/components/intro/IntroSidebar";
import { Badge } from "@/components/ui/badge";
import { admissionsContent } from "@/data/admissions";

export default function AdmissionsPage() {
	const { steps, programs } = admissionsContent;

	return (
		<div className="bg-[var(--background)] text-[var(--brand-navy)]">
			<section className="border-b border-[var(--border)] bg-white/85">
				<div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-12 sm:px-10 lg:px-12">
					<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">유치원 소개</p>
					<h1 className="font-heading text-[clamp(2.4rem,4vw,3.2rem)] leading-tight">입학안내</h1>
					<nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="breadcrumb">
						<Link href="/" className="text-[var(--brand-primary)] underline-offset-4 hover:underline">
							홈
						</Link>
						<span>/</span>
						<span>유치원 소개</span>
						<span>/</span>
						<span>입학안내</span>
					</nav>
				</div>
			</section>

			<section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
			<div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
				<IntroSidebar stickyOffset={112} />

					<article className="space-y-8">
						<section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
							<h3 className="text-lg font-semibold text-[var(--brand-navy)]">입학 절차</h3>
							<ol className="relative mt-6 border-l border-dashed border-[var(--border)] pl-6">
								{steps.map((step, index) => (
									<li key={step.label} className="relative pb-6 last:pb-0">
										<span
											className="absolute -left-[11px] top-1 inline-flex size-4 items-center justify-center rounded-full border border-[var(--brand-primary)] bg-white text-[10px] font-semibold text-[var(--brand-primary)]"
										>
											{index + 1}
										</span>
										<div className="rounded-[var(--radius-md)] bg-white/80 px-4 py-3">
											<p className="text-sm font-semibold text-[var(--brand-primary)]">{step.label}</p>
											<p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
										</div>
									</li>
								))}
							</ol>
						</section>

						<section>
							<h3 className="text-lg font-semibold text-[var(--brand-navy)]">운영 과정</h3>
							<div className="mt-4 grid gap-4 md:grid-cols-2">
								{programs.map((program) => (
									<div
										key={program.title}
										className="flex h-full flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 p-5 shadow-[var(--shadow-soft)]"
									>
										<div className="flex items-center justify-between gap-3">
											<h4 className="text-base font-semibold text-[var(--brand-navy)]">{program.title}</h4>
											<Badge className="rounded-full bg-[var(--brand-mint)]/40 text-[var(--brand-primary)]" variant="outline">
												{program.tag}
											</Badge>
										</div>
										<ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
											{program.details.map((detail, index) => (
												<li key={`${program.title}-${index}`} className="flex items-start gap-2">
													<span className="mt-1 inline-flex size-1.5 rounded-full bg-[var(--brand-secondary)]" aria-hidden />
													<span>{detail}</span>
												</li>
											))}
										</ul>
										{program.groups?.length ? (
											<div className="mt-4 space-y-2 text-sm">
												<p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
													{program.groupsLabel ?? "구분"}
												</p>
												<div className="flex flex-wrap gap-2">
													{program.groups.map((group) => (
														<div
															key={`${program.title}-${group}`}
															className="rounded-[var(--radius-full)] border border-[var(--brand-primary)]/30 bg-[var(--brand-mint)]/25 px-4 py-1 text-sm font-semibold text-[var(--brand-primary)]"
														>
															{group}
														</div>
													))}
												</div>
											</div>
										) : null}
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
