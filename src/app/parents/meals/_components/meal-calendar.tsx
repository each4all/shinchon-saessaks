"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MealCalendarEvent } from "../_lib/meal-view-model";

const MEAL_TYPE_LABEL: Record<string, string> = {
	breakfast: "조식",
	lunch: "중식",
	dinner: "석식",
	snack: "간식",
	other: "기타",
};

const MEAL_TYPE_COLOR: Record<string, string> = {
	breakfast: "bg-sky-500",
	lunch: "bg-emerald-500",
	dinner: "bg-indigo-500",
	snack: "bg-amber-500",
	other: "bg-muted-foreground",
};

type MealCalendarProps = {
	events: MealCalendarEvent[];
	initialMonthISO: string;
};

const AUDIENCE_LABEL: Record<string, string> = {
	parents: "학부모",
	staff: "교직원",
	all: "전체",
};

function addMonths(date: Date, months: number) {
	const next = new Date(date);
	next.setMonth(next.getMonth() + months);
	return next;
}

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

function toDateKey(date: Date | string) {
	const d = typeof date === "string" ? new Date(date) : date;
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function MealCalendar({ events, initialMonthISO }: MealCalendarProps) {
	const initialMonth = useMemo(() => {
		const parsed = new Date(initialMonthISO);
		return Number.isNaN(parsed.getTime()) ? startOfMonth(new Date()) : startOfMonth(parsed);
	}, [initialMonthISO]);

	const [month, setMonth] = useState(initialMonth);
	const [activeTypes, setActiveTypes] = useState<Set<string>>(() => {
		const unique = new Set(events.map((event) => event.mealType));
		return unique.size ? unique : new Set(["lunch"]);
	});

	const todayKey = toDateKey(startOfToday());

	const mealTypes = useMemo(() => {
		const set = new Set(events.map((event) => event.mealType));
		return Array.from(set.values());
	}, [events]);

	const eventsByDay = useMemo(() => {
		const map = new Map<string, MealCalendarEvent[]>();
		for (const event of events) {
			const key = toDateKey(event.menuDate);
			const list = map.get(key);
			if (list) {
				list.push(event);
			} else {
				map.set(key, [event]);
			}
		}
		return map;
	}, [events]);

	const filteredEventsByDay = useMemo(() => {
		const map = new Map<string, MealCalendarEvent[]>();
		eventsByDay.forEach((list, key) => {
			const filtered = list.filter((event) => activeTypes.has(event.mealType));
			if (filtered.length) {
				map.set(key, filtered);
			}
		});
		return map;
	}, [eventsByDay, activeTypes]);

	const calendarDays = useMemo(() => createCalendarDays(month), [month]);
	const monthLabel = useMemo(
		() =>
			new Intl.DateTimeFormat("ko-KR", {
				year: "numeric",
				month: "long",
			}).format(month),
		[month],
	);

	const toggleType = (type: string) => {
		setActiveTypes((prev) => {
			const next = new Set(prev);
			if (next.has(type)) {
				next.delete(type);
			} else {
				next.add(type);
			}
			return next.size ? next : new Set([type]);
		});
	};

	const resetFilters = () => {
		setActiveTypes(new Set(mealTypes.length ? mealTypes : ["lunch"]));
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<Button variant="outline" size="icon" onClick={() => setMonth((prev) => addMonths(prev, -1))} aria-label="이전 달">
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<div className="text-lg font-semibold text-[var(--brand-navy)]">{monthLabel}</div>
					<Button variant="outline" size="icon" onClick={() => setMonth((prev) => addMonths(prev, 1))} aria-label="다음 달">
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
				<Button variant="ghost" size="sm" onClick={() => setMonth(startOfMonth(new Date()))}>
					이번달 보기
				</Button>
			</div>

			<div className="flex flex-wrap items-center gap-2 text-sm">
				{mealTypes.map((type) => {
					const label = MEAL_TYPE_LABEL[type] ?? type;
					const isActive = activeTypes.has(type);
					return (
						<Button
							key={type}
							variant={isActive ? "default" : "outline"}
							size="sm"
							onClick={() => toggleType(type)}
						>
							{label}
						</Button>
					);
				})}
				<Button variant="ghost" size="sm" onClick={resetFilters}>
					전체 보기
				</Button>
			</div>

			<div className="grid grid-cols-7 gap-[.6rem] text-xs font-semibold text-muted-foreground">
				{["일", "월", "화", "수", "목", "금", "토"].map((label) => (
					<div key={label} className="rounded-[var(--radius-sm)] bg-white/60 px-3 py-2 text-center">
						{label}
					</div>
				))}
			</div>

			<div className="grid grid-cols-7 gap-[.6rem]">
				{calendarDays.map((day) => {
					const key = toDateKey(day);
					const eventsForDay = filteredEventsByDay.get(key) ?? [];
					const isCurrentMonthDay = day.getMonth() === month.getMonth();
					const isToday = key === todayKey;
					return (
						<div
							key={key}
							className={cn(
								"flex min-h-[8rem] flex-col gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white/90 px-3 py-2",
								!isCurrentMonthDay && "bg-muted/40 text-muted-foreground",
							)}
						>
							<div className="flex items-center justify-between text-xs font-semibold">
								<span>{day.getDate()}</span>
								{isToday ? <span className="rounded-full bg-[var(--brand-primary)] px-2 py-[1px] text-[10px] text-white">오늘</span> : null}
							</div>
							<ul className="space-y-1 text-[11px]">
								{eventsForDay.map((event) => {
									const label = MEAL_TYPE_LABEL[event.mealType] ?? event.mealType;
									const indicator = MEAL_TYPE_COLOR[event.mealType] ?? "bg-muted-foreground";
									return (
										<li
											key={`${event.id}-${key}`}
											className="rounded-[var(--radius-sm)] border border-[var(--border)]/80 bg-white/95 px-2 py-1 shadow-sm"
										>
											<div className="flex items-center gap-2">
												<span className={cn("inline-flex h-2 w-2 shrink-0 rounded-full", indicator)} />
												<span className="font-semibold text-[var(--brand-navy)]">{label}</span>
												<Badge variant="outline" className="h-4 px-1 text-[10px]">
													{AUDIENCE_LABEL[event.audienceScope] ?? event.audienceScope}
												</Badge>
											</div>
											<ul className="mt-1 list-disc space-y-0.5 pl-3 text-[10px] text-muted-foreground">
												{event.menuItems.slice(0, 3).map((item, index) => (
													<li key={`${event.id}-item-${index}`}>{item}</li>
												))}
											</ul>
											{event.menuItems.length > 3 ? (
												<p className="text-[10px] text-muted-foreground">외 {event.menuItems.length - 3}개</p>
											) : null}
											{event.notes ? (
												<p className="text-[10px] text-muted-foreground">알림: {event.notes}</p>
											) : null}
											{event.allergens.length ? (
												<p className="text-[10px] text-[var(--brand-primary)]">알레르기: {event.allergens.join(", ")}</p>
											) : null}
										</li>
									);
								})}
							</ul>
						</div>
					);
				})}
			</div>

			{filteredEventsByDay.size === 0 ? (
				<p className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-white/70 px-4 py-8 text-center text-xs text-muted-foreground">
					선택한 조건에 해당하는 식단이 없습니다.
				</p>
			) : null}
		</div>
	);
}
