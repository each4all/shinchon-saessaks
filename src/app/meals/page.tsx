import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicMealPlans, getPublicNutritionBulletins } from "@/lib/data/meal-plans-repository";

import { MealMonthlyTable } from "@/app/parents/meals/_components/meal-monthly-table";
import { enhanceMealPlans, groupMealPlansByDate } from "@/app/parents/meals/_lib/meal-view-model";

export const dynamic = "force-dynamic";

function formatDate(date: Date, options?: Intl.DateTimeFormatOptions) {
	return new Intl.DateTimeFormat("ko-KR", options ?? { month: "long", day: "numeric", weekday: "short" }).format(date);
}

type PublicMealPlan = Awaited<ReturnType<typeof getPublicMealPlans>>[number];

function getMealTypeLabel(mealType: string) {
	switch (mealType) {
		case "breakfast":
			return "조식";
		case "lunch":
			return "중식";
		case "dinner":
			return "석식";
		case "snack":
			return "간식";
		default:
			return "기타";
	}
}

function getAudienceScopeLabel(audienceScope: string) {
	switch (audienceScope) {
		case "parents":
			return "학부모";
		case "staff":
			return "교직원";
		case "all":
			return "전체";
		default:
			return audienceScope;
	}
}

export default async function PublicMealsPage() {
	const [mealPlans, bulletins] = await Promise.all([
		getPublicMealPlans({ from: new Date() }),
		getPublicNutritionBulletins(18),
	] as const);

	const enhancedPlans = enhanceMealPlans<PublicMealPlan>(mealPlans);
	const groupedMeals = groupMealPlansByDate(enhancedPlans);
	const groupedKeys = Object.keys(groupedMeals).sort();
	return (
		<div className="bg-[var(--background)] text-[var(--brand-navy)]">
			<section className="border-b border-[var(--border)] bg-white/90">
				<div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-14 sm:px-10 lg:px-12">
					<Badge variant="outline" className="w-fit">
						Meal Program
					</Badge>
					<h1 className="font-heading text-[clamp(2.4rem,4vw,3.2rem)] leading-tight">이달의 급식 · 영양 안내</h1>
					<p className="text-sm leading-relaxed text-muted-foreground">
						신촌몬테소리유치원의 월간 급식표와 영양 안내를 한눈에 확인하세요. 공개 급식 정보는 누구나 열람할 수 있으며,
						알레르기 표시는 식단 계획 시 참고용으로 제공됩니다.
					</p>
				</div>
			</section>

			<section className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12 sm:px-10 lg:px-12">
				<div className="space-y-6">
					<div className="flex items-center justify-between flex-wrap gap-3">
						<h2 className="font-heading text-[clamp(1.6rem,2.5vw,2.2rem)]">오늘의 식단</h2>
						<p className="text-xs text-muted-foreground">전체 공개된 식단 일정만 표기됩니다.</p>
					</div>
					{enhancedPlans.length ? (
						<MealMonthlyTable plans={enhancedPlans} initialMonth={enhancedPlans[0]?.menuDate} />
					) : (
						<p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white/85 px-4 py-10 text-center text-sm text-muted-foreground">
							공개된 급식 일정이 없습니다. 급식표가 등록되면 이곳에서 안내해 드립니다.
						</p>
					)}
				</div>

				<div className="space-y-6">
					<div className="flex items-center justify-between flex-wrap gap-3">
						<h2 className="font-heading text-[clamp(1.6rem,2.5vw,2.2rem)]">다가오는 급식 안내</h2>
						<p className="text-xs text-muted-foreground">
							세부 식단은 학부모 포털에서도 확인할 수 있으며, 필요 시 교직원 안내와 내용이 다를 수 있습니다.
						</p>
					</div>

					{groupedKeys.length === 0 ? (
						<p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white/85 px-4 py-10 text-center text-sm text-muted-foreground">
							등록된 급식 정보가 없습니다.
						</p>
					) : (
						<div className="space-y-5">
							{groupedKeys.map((key) => {
								const { date, items } = groupedMeals[key];
								return (
									<Card key={key} className="border-[var(--border)] bg-white/90">
										<CardHeader className="flex flex-col gap-2">
											<CardDescription className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
												{formatDate(date, { year: "numeric", month: "numeric", day: "numeric", weekday: "short" })}
											</CardDescription>
											<CardTitle className="text-lg text-[var(--brand-navy)]">
												{formatDate(date, { month: "long", day: "numeric" })} 식단 안내
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-4">
											{items.map((plan) => (
												<div key={plan.id} className="space-y-3 rounded-[var(--radius-sm)] border border-[var(--border)]/70 bg-white px-4 py-4">
													<div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--brand-navy)]">
														<span>{getMealTypeLabel(plan.mealType)}</span>
														<span className="text-xs font-normal text-muted-foreground">
															· 공개 범위: {getAudienceScopeLabel(plan.audienceScope)}
														</span>
													</div>
													<ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
														{plan.menuItems.map((item, index) => (
															<li key={`${plan.id}-${index}`}>{item}</li>
														))}
													</ul>
													{plan.notes ? <p className="text-xs text-muted-foreground">알림: {plan.notes}</p> : null}
													{plan.allergens.length ? (
														<p className="text-xs text-[var(--brand-primary)]">알레르기 유발 식품: {plan.allergens.join(", ")}</p>
													) : (
														<p className="text-xs text-muted-foreground">알레르기 유발 식품 없음</p>
													)}
													{plan.imageResources.length ? (
														<div className="pt-2">
															<h3 className="text-xs font-semibold text-[var(--brand-navy)]">사진</h3>
															<div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
																{plan.imageResources.slice(0, 3).map((resource) => (
																	<a
																		key={resource.id}
																		href={resource.fileUrl}
																		target="_blank"
																		rel="noopener noreferrer"
																		className="group relative block overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-[rgba(241,239,255,0.8)]"
																		aria-label={resource.label ?? `${plan.menuDate.toISOString().slice(0, 10)} 식단 이미지`}
																	>
																		{/* eslint-disable-next-line @next/next/no-img-element */}
																		<img
																			src={resource.fileUrl}
																			alt={resource.label ?? "식단 이미지"}
																			loading="lazy"
																			className="h-40 w-full object-cover transition-transform duration-200 group-hover:scale-105"
																		/>
																		{resource.label ? (
																			<span className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-[10px] text-white">{resource.label}</span>
																		) : null}
																	</a>
																))}
															</div>
															{plan.imageResources.length > 3 ? (
																<p className="text-xs text-muted-foreground">외 {plan.imageResources.length - 3}장</p>
															) : null}
														</div>
													) : null}
													{plan.fileResources.length ? (
														<div className="pt-2">
															<h3 className="text-xs font-semibold text-[var(--brand-navy)]">첨부 자료</h3>
															<ul className="mt-1 space-y-1 text-xs">
																{plan.fileResources.map((resource) => (
																	<li key={resource.id}>
																		<Link
																			href={resource.fileUrl}
																			target="_blank"
																			rel="noopener noreferrer"
																			className="text-[var(--brand-primary)] underline-offset-4 hover:underline"
																		>
																			{resource.label ?? "첨부 파일"}
																		</Link>
																	</li>
																))}
															</ul>
														</div>
													) : null}
												</div>
											))}
										</CardContent>
									</Card>
								);
							})}
						</div>
					)}
				</div>

				<div className="space-y-6">
					<div className="flex items-center justify-between flex-wrap gap-3">
						<h2 className="font-heading text-[clamp(1.6rem,2.5vw,2.2rem)]">영양사 공지</h2>
						<p className="text-xs text-muted-foreground">
							영양 교육, 가정 연계 활동, 식품 안전 안내 등 공지된 정보를 모아두었습니다.
						</p>
					</div>

					{bulletins.length === 0 ? (
						<p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white/85 px-4 py-10 text-center text-sm text-muted-foreground">
							등록된 영양 공지가 없습니다.
						</p>
					) : (
						<div className="grid gap-4">
							{bulletins.map((bulletin) => (
								<Card key={bulletin.id} className="border-[var(--border)] bg-white/90">
									<CardHeader className="space-y-3">
										<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
											<Badge variant="outline" className="uppercase tracking-[0.18em]">
												{bulletin.category === "bulletin"
													? "영양 소식"
													: bulletin.category === "menu_plan"
														? "식단 계획"
														: "보고서"}
											</Badge>
											<span>
												{bulletin.publishAt
													? formatDate(bulletin.publishAt, { year: "numeric", month: "numeric", day: "numeric" })
													: "게시일 미정"}
											</span>
										</div>
										<CardTitle className="text-lg text-[var(--brand-navy)]">{bulletin.title}</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3 text-sm text-muted-foreground">
										<p className="whitespace-pre-line leading-relaxed">{bulletin.content}</p>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>
			</section>
		</div>
	);
}
