import Link from "next/link";

import { CurriculumSidebar } from "@/components/curriculum/CurriculumSidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { legacyDailySchedule } from "@/data/curriculum";

const periodRowCounts = legacyDailySchedule.reduce<Record<string, number>>((acc, row) => {
	acc[row.period] = (acc[row.period] ?? 0) + 1;
	return acc;
}, {});

const periodStyles: Record<
	string,
	{
		badgeClass: string;
		badgeTextClass: string;
		periodCellClass: string;
		bulletClass: string;
	}
> = {
	"오전 일과": {
		badgeClass: "bg-[rgba(141,211,199,0.28)] border border-[rgba(46,111,108,0.12)]",
		badgeTextClass: "text-[var(--brand-secondary)]",
		periodCellClass: "bg-[rgba(141,211,199,0.1)]",
		bulletClass: "bg-[rgba(46,111,108,0.7)]",
	},
	"점심 시간": {
		badgeClass: "bg-[rgba(255,209,102,0.32)] border border-[rgba(255,181,70,0.18)]",
		badgeTextClass: "text-[#c77400]",
		periodCellClass: "bg-[rgba(255,209,102,0.15)]",
		bulletClass: "bg-[rgba(255,181,70,0.75)]",
	},
	"오후 일과": {
		badgeClass: "bg-[rgba(173,200,255,0.3)] border border-[rgba(110,140,230,0.2)]",
		badgeTextClass: "text-[var(--brand-primary)]",
		periodCellClass: "bg-[rgba(173,200,255,0.16)]",
		bulletClass: "bg-[rgba(110,140,230,0.85)]",
	},
};

const defaultPeriodStyle = {
	badgeClass: "bg-[var(--surface-muted)] border border-[var(--border)]",
	badgeTextClass: "text-[var(--brand-navy)]",
	periodCellClass: "bg-[var(--surface-muted)]/70",
	bulletClass: "bg-[var(--brand-secondary)]/80",
};

export default function DailySchedulePage() {
	const renderedPeriods = new Set<string>();
	return (
		<div className="bg-[var(--background)] text-[var(--brand-navy)]">
			<section className="border-b border-[var(--border)] bg-white/85">
				<div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-12 sm:px-10 lg:px-12">
					<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">교육과정</p>
					<h1 className="font-heading text-[clamp(2.4rem,4vw,3.2rem)] leading-tight">하루 일과</h1>
					<p className="text-sm text-muted-foreground">신촌몬테소리의 하루 일과표를 그대로 안내합니다.</p>
					<nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="breadcrumb">
						<Link href="/" className="text-[var(--brand-primary)] underline-offset-4 hover:underline">
							홈
						</Link>
						<span>/</span>
						<span>교육과정</span>
						<span>/</span>
						<span>하루일과</span>
					</nav>
				</div>
			</section>

			<section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
				<div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
					<CurriculumSidebar stickyOffset={112} />
					<section
						id="schedule"
						className="rounded-[0.65rem] border border-[var(--border)] bg-white/95 p-6 shadow-[var(--shadow-soft)]"
					>
						<header className="space-y-2">
							<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">일과표</p>
							<h2 className="font-heading text-[clamp(1.8rem,3vw,2.3rem)] text-[var(--brand-navy)]">신촌몬테소리 하루 일과</h2>
						</header>
						<Table className="text-[15px] leading-relaxed [&_th]:px-4 [&_th]:py-4 [&_td]:px-4 [&_td]:py-5">
								<TableHeader>
									<TableRow disableHover>
									<TableHead className="w-[110px] text-xs">구분</TableHead>
									<TableHead className="w-[120px] text-xs">시간</TableHead>
									<TableHead className="text-xs">일정</TableHead>
									<TableHead className="text-xs">내용</TableHead>
								</TableRow>
							</TableHeader>
						<TableBody>
							{legacyDailySchedule.map((row, index) => {
								const isFirst = !renderedPeriods.has(row.period);
								renderedPeriods.add(row.period);
								const styles = periodStyles[row.period] ?? defaultPeriodStyle;
								return (
									<TableRow
										disableHover
										key={`${row.time}-${row.title}`}
										className={`align-top ${index % 2 === 0 ? "bg-white" : "bg-[rgba(248,248,252,0.7)]"}`}
									>
										{isFirst ? (
											<TableCell
												rowSpan={periodRowCounts[row.period]}
												className={`align-top text-xs font-semibold ${styles.periodCellClass}`}
											>
												<span
													className={`inline-flex w-full items-center justify-center rounded-full px-3 py-1 text-[11px] ${styles.badgeClass} ${styles.badgeTextClass}`}
												>
													{row.period}
												</span>
											</TableCell>
										) : null}
										<TableCell className="align-top text-sm font-medium text-[var(--brand-navy)]">
											{row.time}
										</TableCell>
										<TableCell className="align-top whitespace-normal font-semibold text-[var(--brand-navy)]">
											{row.title}
										</TableCell>
										<TableCell className="align-top whitespace-pre-wrap text-sm leading-relaxed text-[var(--brand-navy)]">
											<ul className="space-y-2">
												{row.details.map((detail) => (
													<li key={`${row.time}-${detail}`} className="flex items-start gap-2">
														<span className={`mt-2 size-1.5 rounded-full ${styles.bulletClass}`} aria-hidden />
														<span>{detail}</span>
													</li>
												))}
											</ul>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
						</Table>
					</section>
				</div>
			</section>
		</div>
	);
}
