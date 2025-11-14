import Link from "next/link";

import { IntroSidebar } from "@/components/intro/IntroSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { schoolHistories, type HistoryEntry, type HistoryRange } from "@/data/history";

const historyRanges = [...schoolHistories].sort((a, b) => a.orderIndex - b.orderIndex);

type HistoryPageProps = {
	searchParams?: Promise<Record<string, string | string[]>>;
};

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
	const resolvedSearchParams = (await searchParams) ?? {};
	const rangeParam = resolvedSearchParams.range ?? resolvedSearchParams.tab;
	const requestedRange = Array.isArray(rangeParam) ? rangeParam[0] : rangeParam ?? null;
	const fallbackRange = historyRanges[0]?.slug ?? "modern";
	const defaultValue = requestedRange && historyRanges.some((item) => item.slug === requestedRange) ? requestedRange : fallbackRange;

	return (
		<div className="bg-[var(--background)] text-[var(--brand-navy)]">
			<section className="border-b border-[var(--border)] bg-white/85">
				<div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-12 sm:px-10 lg:px-12">
					<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">유치원 소개</p>
					<h1 className="font-heading text-[clamp(2.4rem,4vw,3.2rem)] leading-tight">연혁</h1>
					<nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="breadcrumb">
						<Link href="/" className="text-[var(--brand-primary)] underline-offset-4 hover:underline">
							홈
						</Link>
						<span>/</span>
						<span>유치원 소개</span>
						<span>/</span>
						<span>연혁</span>
					</nav>
				</div>
			</section>

			<section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
				<div className="space-y-8">
					<Tabs key={defaultValue} defaultValue={defaultValue} className="w-full">
						<div className="flex justify-center">
							<TabsList className="flex flex-wrap items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-white/80 px-3 py-2 shadow-[var(--shadow-soft)]">
								{historyRanges.map((range) => (
									<TabsTrigger
										key={range.slug}
										value={range.slug}
										className="min-w-[140px] rounded-[var(--radius-md)] border border-transparent px-3 py-1.5 text-sm font-semibold data-[state=active]:border-[var(--brand-primary)] data-[state=active]:bg-[var(--brand-mint)]/20"
									>
										{range.label}
									</TabsTrigger>
								))}
							</TabsList>
						</div>

						{historyRanges.map((range) => (
							<TabsContent key={range.slug} value={range.slug} className="mt-6">
								<div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
									<IntroSidebar />
									<HistoryPanel range={range} />
								</div>
							</TabsContent>
						))}
					</Tabs>
				</div>
			</section>
		</div>
	);
}

function HistoryPanel({ range }: { range: HistoryRange }) {
	return (
		<article className="space-y-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
			<header className="space-y-2 border-b border-dashed border-[var(--border)] pb-4">
				<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{range.period}</p>
				<h2 className="text-[clamp(1.6rem,2.4vw,2.2rem)] font-semibold text-[var(--brand-navy)]">{range.label}</h2>
				{range.description ? (
					<p className="text-sm text-muted-foreground">{range.description}</p>
				) : null}
			</header>

			<HistoryTimeline entries={range.entries} />
		</article>
	);
}

function HistoryTimeline({ entries }: { entries: HistoryEntry[] }) {
	return (
		<ol className="space-y-5">
			{entries.map((entry) => (
				<li key={entry.year} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--brand-mint)]/10 p-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
						<div className="min-w-[72px] font-heading text-3xl font-semibold text-[var(--brand-primary)]">
							{entry.year}
						</div>
						<ul className="flex-1 space-y-2 text-sm leading-relaxed text-[var(--brand-navy)]">
							{entry.events.map((event, index) => (
								<li key={`${entry.year}-${index}`} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
									{event.date ? (
										<span className="font-semibold text-[var(--brand-secondary)] sm:w-20 sm:shrink-0">
											{event.date}
										</span>
									) : null}
									<p className="text-sm leading-relaxed text-[var(--brand-navy)]">{event.description}</p>
								</li>
							))}
						</ul>
					</div>
				</li>
			))}
		</ol>
	);
}
