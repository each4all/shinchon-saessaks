import Image from "next/image";
import Link from "next/link";

import { CurriculumSidebar } from "@/components/curriculum/CurriculumSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	christianIntro,
	christianPillars,
	christianSponsors,
	compassionCta,
} from "@/data/christian-education";

const HERO_PLACEHOLDER_COUNT = 2;

export default function ChristianEducationPage() {
	const defaultSponsor = christianSponsors[0]?.id ?? "";

	return (
		<div className="bg-[var(--background)] text-[var(--brand-navy)]">
			<section className="border-b border-[var(--border)] bg-white/85">
				<div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-12 sm:px-10 lg:px-12">
					<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">교육과정</p>
					<h1 className="font-heading text-[clamp(2.4rem,4vw,3.2rem)] leading-tight">기독교 유아교육</h1>
					<p className="text-sm text-muted-foreground">말씀과 기도로 자라는 기독교 유아교육 흐름과 후원 어린이 이야기를 소개합니다.</p>
					<nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="breadcrumb">
						<Link href="/" className="text-[var(--brand-primary)] underline-offset-4 hover:underline">
							홈
						</Link>
						<span>/</span>
						<span>교육과정</span>
						<span>/</span>
						<span>기독교 유아교육</span>
					</nav>
				</div>
			</section>

			<section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
				<div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
					<CurriculumSidebar />
					<section className="rounded-[0.65rem] border border-[var(--border)] bg-white/95 p-6 shadow-[var(--shadow-soft)]">
						<header className="space-y-3 border-b border-dashed border-[var(--border)] pb-6">
							<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{christianIntro.tagline}</p>
							<h2 className="font-heading text-[clamp(1.8rem,3vw,2.3rem)] text-[var(--brand-navy)]">
								{christianIntro.headline}
							</h2>
							<div className="grid gap-4 md:grid-cols-2">
								{Array.from({ length: HERO_PLACEHOLDER_COUNT }).map((_, index) => (
									<div
										key={`hero-placeholder-${index}`}
										className="flex h-32 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/70 text-xs text-muted-foreground"
									>
										이미지 자리
									</div>
								))}
							</div>
							<div className="space-y-3 pt-4 text-sm leading-relaxed text-muted-foreground">
								{christianIntro.description.map((paragraph) => (
									<p key={paragraph}>{paragraph}</p>
								))}
							</div>
						</header>

						<section className="mt-8 space-y-4">
							<div>
								<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">핵심 기둥</p>
								<h3 className="font-heading text-xl text-[var(--brand-navy)]">말씀 기반 4단계 흐름</h3>
							</div>
							<div className="grid gap-4 md:grid-cols-2">
								{christianPillars.map((pillar) => (
									<article
										key={pillar.id}
										className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white/90 p-4 shadow-[var(--shadow-soft)]"
									>
										<h4 className="text-lg font-semibold text-[var(--brand-primary)]">{pillar.title}</h4>
										<p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
									</article>
								))}
							</div>
						</section>

						<section className="mt-10 space-y-6">
							<div className="flex flex-col gap-1">
								<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">컴패션 스토리</p>
								<h3 className="font-heading text-2xl text-[var(--brand-navy)]">반별 후원 어린이 이야기</h3>
								<p className="text-sm text-muted-foreground">각 반에서 함께 기도하고 있는 후원 어린이들의 이야기를 탭에서 확인할 수 있습니다.</p>
							</div>

							<Tabs defaultValue={defaultSponsor} className="w-full">
								<div className="flex justify-center">
									<TabsList className="flex flex-wrap items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-white/80 px-3 py-2 shadow-[var(--shadow-soft)]">
										{christianSponsors.map((sponsor) => (
											<TabsTrigger
												key={sponsor.id}
												value={sponsor.id}
												className="min-w-[140px] rounded-[var(--radius-md)] border border-transparent px-3 py-1.5 text-sm font-semibold data-[state=active]:border-[var(--brand-primary)] data-[state=active]:bg-[var(--brand-mint)]/20"
											>
												{sponsor.classroomLabel}
											</TabsTrigger>
										))}
									</TabsList>
								</div>

								{christianSponsors.map((sponsor) => (
									<TabsContent key={sponsor.id} value={sponsor.id} className="mt-6">
									<div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
										<figure className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-white/90 p-4">
											<div className="flex h-[280px] w-full items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/70 text-sm text-muted-foreground">
												사진 자리
											</div>
												<figcaption className="space-y-1 text-center">
													<h4 className="text-xl font-heading text-[var(--brand-navy)]">
														{sponsor.childName}
														{sponsor.englishName ? (
															<span className="ml-2 text-base text-muted-foreground">
																({sponsor.englishName})
															</span>
														) : null}
													</h4>
													<ul className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm text-muted-foreground">
														<li className="font-semibold text-[var(--brand-navy)]">생일</li>
														<li>{sponsor.birth}</li>
														<li className="font-semibold text-[var(--brand-navy)]">성별</li>
														<li>{sponsor.gender}</li>
														<li className="font-semibold text-[var(--brand-navy)]">국가</li>
														<li>{sponsor.country}</li>
													</ul>
												</figcaption>
											</figure>
											<div className="space-y-4">
												{sponsor.story.map((paragraph, index) => (
													<p key={`${sponsor.id}-story-${index}`} className="text-sm leading-relaxed text-muted-foreground">
														{paragraph}
													</p>
												))}

												{sponsor.favorites?.length ? (
													<div className="space-y-2">
														<p className="text-sm font-semibold text-[var(--brand-navy)]">좋아하는 활동</p>
														<ul className="flex flex-wrap gap-2 text-xs text-muted-foreground">
															{sponsor.favorites.map((activity) => (
																<li
																	key={`${sponsor.id}-${activity}`}
																	className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)]/60 px-3 py-1"
																>
																	{activity}
																</li>
															))}
														</ul>
													</div>
												) : null}

												{sponsor.prayerFocus ? (
													<p className="rounded-[var(--radius-md)] border border-[var(--brand-primary)]/60 bg-[var(--brand-mint)]/25 px-4 py-3 text-sm font-medium text-[var(--brand-navy)]">
														{sponsor.prayerFocus}
													</p>
												) : null}
											</div>
										</div>
									</TabsContent>
								))}
							</Tabs>
						</section>

						<section className="mt-10 space-y-4">
							<div className="space-y-1">
								<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">컴패션 안내</p>
								<h3 className="font-heading text-xl text-[var(--brand-navy)]">{compassionCta.heading}</h3>
								<p className="text-sm text-muted-foreground">{compassionCta.description}</p>
							</div>
							<Link
								href={compassionCta.url}
								target="_blank"
								rel="noreferrer"
								className="block overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-soft)]"
							>
								<Image
									src={compassionCta.bannerUrl}
									alt="컴패션 후원 안내 배너"
									width={1200}
									height={360}
									className="h-auto w-full object-cover"
									priority
								/>
								<span className="sr-only">{compassionCta.buttonLabel}</span>
							</Link>
						</section>
					</section>
				</div>
			</section>
		</div>
	);
}
