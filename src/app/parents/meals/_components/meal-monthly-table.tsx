"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, UtensilsCrossed } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

import {
	groupMealPlansByDate,
	type EnhancedMealPlan,
} from "../_lib/meal-view-model";

type MealMonthlyTableProps = {
	plans: EnhancedMealPlan[];
	initialMonth?: Date;
};

function startOfMonth(date: Date) {
	const next = new Date(date);
	next.setDate(1);
	next.setHours(0, 0, 0, 0);
	return next;
}

function startOfToday() {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return today;
}

function createCalendarDays(month: Date) {
	const firstOfMonth = startOfMonth(month);
	const leading = firstOfMonth.getDay();
	const calendarStart = new Date(firstOfMonth);
	calendarStart.setDate(firstOfMonth.getDate() - leading);

	return Array.from({ length: 42 }, (_, index) => {
		const current = new Date(calendarStart);
		current.setDate(calendarStart.getDate() + index);
		current.setHours(0, 0, 0, 0);
		return current;
	});
}

function toDateKey(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(
		2,
		"0",
	)}`;
}

function formatKoreanDate(date: Date, options?: Intl.DateTimeFormatOptions) {
	return new Intl.DateTimeFormat("ko-KR", options).format(date);
}

const KOREAN_WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function MealMonthlyTable({ plans, initialMonth }: MealMonthlyTableProps) {
	const [month, setMonth] = useState(() => startOfMonth(initialMonth ?? new Date()));
	const todayKey = toDateKey(startOfToday());
	const eventsByDate = useMemo(() => groupMealPlansByDate(plans), [plans]);
	const calendarDays = useMemo(() => createCalendarDays(month), [month]);
	const monthLabel = useMemo(
		() =>
			formatKoreanDate(month, {
				year: "numeric",
				month: "long",
			}),
		[month],
	);

	const [selectedDateKey, setSelectedDateKey] = useState(() => {
		const todayPlans = eventsByDate[todayKey];
		if (todayPlans?.items?.length) {
			return todayKey;
		}
		const firstWithMeals = calendarDays
			.map((day) => toDateKey(day))
			.find((key) => eventsByDate[key]?.items.length);
		return firstWithMeals ?? todayKey;
	});

	const selectedPlans = eventsByDate[selectedDateKey]?.items ?? [];

	const handleChangeMonth = (offset: number) => {
		setMonth((prev) => {
			const next = new Date(prev);
			next.setMonth(prev.getMonth() + offset);
			return startOfMonth(next);
		});
	};

	return (
		<div className="space-y-8">
			<div className="flex flex-wrap items-center gap-3">
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						onClick={() => handleChangeMonth(-1)}
						aria-label="이전 달 보기"
					>
						<ArrowLeft className="size-4" />
					</Button>
					<div className="font-heading text-xl text-[var(--brand-navy)]">{monthLabel}</div>
					<Button
						variant="outline"
						size="icon"
						onClick={() => handleChangeMonth(1)}
						aria-label="다음 달 보기"
					>
						<ArrowRight className="size-4" />
					</Button>
				</div>
				<Button variant="ghost" size="sm" onClick={() => setMonth(startOfMonth(new Date()))}>
					이번달 보기
				</Button>
			</div>

			<div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 shadow-[var(--shadow-soft)]">
				<table className="w-full border-separate border-spacing-0 text-sm">
					<thead>
						<tr className="bg-[var(--brand-mint)]/20 text-[var(--brand-navy)]">
							{KOREAN_WEEKDAYS.map((weekday) => (
								<th key={weekday} className="px-4 py-3 text-center font-medium">
									{weekday}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{Array.from({ length: 6 }).map((_, rowIndex) => (
							<tr key={`row-${rowIndex}`} className="border-t border-[var(--border)]">
								{calendarDays.slice(rowIndex * 7, rowIndex * 7 + 7).map((day) => {
									const key = toDateKey(day);
									const plansForDay = eventsByDate[key]?.items ?? [];
									const isCurrentMonth = day.getMonth() === month.getMonth();
									const isToday = key === todayKey;
									const isSelected = key === selectedDateKey;
									return (
										<td
											key={key}
											className={[
												"align-top border-l border-[var(--border)] p-0 text-left transition",
												!isCurrentMonth ? "bg-muted/30 text-muted-foreground" : "bg-white",
												isSelected && "ring-2 ring-[var(--brand-primary)] ring-offset-0",
											]
												.filter(Boolean)
												.join(" ")}
										>
											<button
												type="button"
												onClick={() => setSelectedDateKey(key)}
												className="flex h-full w-full flex-col gap-2 px-3 py-3 text-left"
											>
												<div className="flex items-center justify-between text-xs font-semibold">
													<span>{day.getDate()}</span>
													{isToday ? (
														<span className="rounded-full bg-[var(--brand-primary)] px-2 py-[1px] text-[10px] text-white">
															오늘
														</span>
													) : null}
												</div>
												{plansForDay.length === 0 ? (
													<p className="text-[11px] text-muted-foreground">등록된 식단 없음</p>
												) : (
													<ul className="flex flex-col gap-1 text-[11px] text-[var(--brand-navy)]">
														{plansForDay.map((plan) => (
															<li key={plan.id} className="flex items-center gap-1">
																<span className="inline-flex size-1.5 rounded-full bg-[var(--brand-primary)]" />
																<span className="font-semibold">
																	{plan.mealType === "breakfast"
																		? "조식"
																		: plan.mealType === "lunch"
																			? "중식"
																			: plan.mealType === "dinner"
																				? "석식"
																				: plan.mealType === "snack"
																					? "간식"
																					: "기타"}
																</span>
																<span className="text-muted-foreground">
																	{plan.menuItems[0] ?? "메뉴 등록 필요"}
																</span>
															</li>
														))}
													</ul>
												)}
											</button>
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<Card className="border-[var(--border)] bg-white/95 shadow-[var(--shadow-soft)]">
				<CardHeader className="flex flex-col gap-2">
					<Badge variant="mint" className="w-fit uppercase tracking-[0.18em]">
						선택한 날짜
					</Badge>
					<CardTitle className="text-xl text-[var(--brand-navy)]">
						{formatKoreanDate(new Date(selectedDateKey), {
							year: "numeric",
							month: "long",
							day: "numeric",
							weekday: "long",
						})}
					</CardTitle>
					<CardDescription className="text-sm text-muted-foreground">
						해당 날짜의 등록된 식단과 첨부 자료를 확인하세요.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{selectedPlans.length === 0 ? (
						<p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white/80 px-4 py-6 text-sm text-muted-foreground">
							등록된 식단 정보가 없습니다.
						</p>
					) : (
						selectedPlans.map((plan) => (
							<div
								key={plan.id}
								className="rounded-[var(--radius-md)] border border-[var(--border)]/70 bg-white px-4 py-5 shadow-sm"
							>
								<div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--brand-navy)]">
									<UtensilsCrossed className="size-4 text-[var(--brand-primary)]" />
									<span>
										{plan.mealType === "breakfast"
											? "조식"
											: plan.mealType === "lunch"
												? "중식"
												: plan.mealType === "dinner"
													? "석식"
													: plan.mealType === "snack"
														? "간식"
														: "기타"}
									</span>
									<span className="text-xs font-normal text-muted-foreground">
										· 공개 범위:{" "}
										{plan.audienceScope === "parents"
											? "학부모"
											: plan.audienceScope === "staff"
												? "교직원"
												: "전체"}
									</span>
								</div>
								<ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
									{plan.menuItems.map((item, index) => (
										<li key={`${plan.id}-menu-${index}`}>{item}</li>
									))}
								</ul>
								{plan.notes ? (
									<p className="mt-3 text-xs text-muted-foreground">알림: {plan.notes}</p>
								) : null}
								{plan.allergens.length ? (
									<p className="mt-1 text-xs text-[var(--brand-primary)]">
										알레르기 유발 식품: {plan.allergens.join(", ")}
									</p>
								) : (
									<p className="mt-1 text-xs text-muted-foreground">알레르기 유발 식품 없음</p>
								)}

								{plan.imageResources.length ? (
									<div className="mt-4 space-y-3">
										<h3 className="text-xs font-semibold text-[var(--brand-navy)]">사진</h3>
										<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
											{plan.imageResources.map((resource) => (
												<a
													key={resource.id}
													href={resource.fileUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="group relative block overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-[rgba(241,239,255,0.8)]"
													aria-label={resource.label ?? "식단 이미지"}
												>
													{/* eslint-disable-next-line @next/next/no-img-element */}
													<img
														src={resource.fileUrl}
														alt={resource.label ?? "식단 이미지"}
														loading="lazy"
														className="h-40 w-full object-cover transition-transform duration-200 group-hover:scale-105"
													/>
													{resource.label ? (
														<span className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-[10px] text-white">
															{resource.label}
														</span>
													) : null}
												</a>
											))}
										</div>
									</div>
								) : null}

								{plan.fileResources.length ? (
									<div className="mt-4 space-y-2">
										<h3 className="text-xs font-semibold text-[var(--brand-navy)]">첨부 자료</h3>
										<ul className="space-y-1 text-xs">
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
						))
					)}
				</CardContent>
			</Card>
		</div>
	);
}
