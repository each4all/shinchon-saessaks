"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ScheduleEvent = {
	id: string;
	title: string;
	classroomName?: string | null;
	location?: string | null;
	eventType?: string | null;
	status: string;
	startDate: string;
	endDate?: string | null;
	cancellationReason?: string | null;
};

const STATUS_META: Record<
	string,
	{
		label: string;
		badgeClass: string;
		indicatorClass: string;
	}
> = {
	published: {
		label: "게시",
		badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-200",
		indicatorClass: "bg-emerald-500",
	},
	cancelled: {
		label: "취소",
		badgeClass: "bg-destructive/20 text-destructive border-destructive/40",
		indicatorClass: "bg-destructive",
	},
};

const EVENT_LABEL: Record<string, string> = {
	notice: "공지",
	field_trip: "체험학습",
	workshop: "워크숍",
	holiday: "휴일",
	other: "기타",
};

function startOfDay(date: Date) {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

function addMonths(date: Date, months: number) {
	const d = new Date(date);
	d.setMonth(d.getMonth() + months);
	return d;
}

function toDateKey(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function createCalendarDays(month: Date) {
	const start = new Date(month);
	start.setDate(1);
	start.setHours(0, 0, 0, 0);

	const firstDay = start.getDay(); // 0 (Sun) - 6 (Sat)
	const leading = firstDay; // keep Sunday-start grid
	const calendarStart = new Date(start);
	calendarStart.setDate(start.getDate() - leading);

	return Array.from({ length: 42 }, (_, index) => {
		const current = new Date(calendarStart);
		current.setDate(calendarStart.getDate() + index);
		return current;
	});
}

type ScheduleCalendarProps = {
	events: ScheduleEvent[];
	initialMonthISO: string;
};

export function ScheduleCalendar({ events, initialMonthISO }: ScheduleCalendarProps) {
	const initialMonth = useMemo(() => {
		const base = new Date(initialMonthISO);
		if (Number.isNaN(base.getTime())) {
			return startOfDay(new Date());
		}
		base.setDate(1);
		return base;
	}, [initialMonthISO]);

	const statusOptions = useMemo(() => {
		const unique = new Set(events.map((event) => event.status));
		return Array.from(unique.values());
	}, [events]);

	const [currentMonth, setCurrentMonth] = useState<Date>(initialMonth);
	const [activeStatuses, setActiveStatuses] = useState<Set<string>>(
		() => new Set(statusOptions.length ? statusOptions : ["published"]),
	);

	const parsedEvents = useMemo(
		() =>
			events.map((event) => {
				const start = startOfDay(new Date(event.startDate));
				const end = event.endDate ? startOfDay(new Date(event.endDate)) : start;
				return {
					...event,
					start,
					end,
				};
			}),
		[events],
	);

	const filteredEvents = useMemo(() => {
		return parsedEvents.filter((event) => activeStatuses.has(event.status));
	}, [parsedEvents, activeStatuses]);

	const eventsByDay = useMemo(() => {
		const map = new Map<string, typeof filteredEvents>();
		for (const event of filteredEvents) {
			const cursor = new Date(event.start);
			while (cursor <= event.end) {
				const key = toDateKey(cursor);
				const list = map.get(key);
				if (list) {
					list.push(event);
				} else {
					map.set(key, [event]);
				}
				cursor.setDate(cursor.getDate() + 1);
			}
		}
		return map;
	}, [filteredEvents]);

	const calendarDays = useMemo(() => createCalendarDays(currentMonth), [currentMonth]);
	const todayKey = toDateKey(new Date());
	const monthLabel = useMemo(
		() =>
			new Intl.DateTimeFormat("ko-KR", {
				year: "numeric",
				month: "long",
			}).format(currentMonth),
		[currentMonth],
	);

	const toggleStatus = (status: string) => {
		setActiveStatuses((prev) => {
			const next = new Set(prev);
			if (next.has(status)) {
				next.delete(status);
			} else {
				next.add(status);
			}
			return next.size ? next : new Set([status]);
		});
	};

	const resetStatuses = () => {
		setActiveStatuses(new Set(statusOptions.length ? statusOptions : ["published"]));
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						onClick={() => setCurrentMonth((prev) => addMonths(prev, -1))}
						aria-label="이전 달"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<div className="text-lg font-semibold text-[var(--brand-navy)]">{monthLabel}</div>
					<Button
						variant="outline"
						size="icon"
						onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
						aria-label="다음 달"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
				<Button variant="ghost" size="sm" onClick={() => setCurrentMonth(startOfDay(new Date()))}>
					오늘로 이동
				</Button>
			</div>

			<div className="flex flex-wrap gap-2 text-sm">
				{statusOptions.map((status) => {
					const meta = STATUS_META[status] ?? {
						label: status,
						badgeClass: "bg-muted text-muted-foreground border-[var(--border)]",
						indicatorClass: "bg-muted-foreground",
					};
					const isActive = activeStatuses.has(status);
					return (
						<Button
							key={status}
							variant={isActive ? "default" : "outline"}
							size="sm"
							onClick={() => toggleStatus(status)}
						>
							{meta.label}
						</Button>
					);
				})}
				<Button variant="ghost" size="sm" onClick={resetStatuses}>
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
					const eventsForDay = eventsByDay.get(key) ?? [];
					const isCurrentMonthDay = day.getMonth() === currentMonth.getMonth();
					const isToday = key === todayKey;
					return (
						<div
							key={key}
							className={cn(
								"flex min-h-[7.5rem] flex-col gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white/90 px-3 py-2",
								!isCurrentMonthDay && "bg-muted/40 text-muted-foreground",
							)}
						>
							<div className="flex items-center justify-between text-xs font-semibold">
								<span>{day.getDate()}</span>
								{isToday ? <span className="rounded-full bg-[var(--brand-primary)] px-2 py-[1px] text-[10px] text-white">오늘</span> : null}
							</div>
							<ul className="space-y-1 text-xs text-muted-foreground">
								{eventsForDay.map((event) => {
									const meta = STATUS_META[event.status] ?? {
										label: event.status,
										badgeClass: "bg-muted text-muted-foreground border-[var(--border)]",
										indicatorClass: "bg-muted-foreground",
									};
									return (
										<li
											key={`${event.id}-${key}`}
											className="rounded-[var(--radius-sm)] border border-[var(--border)]/70 bg-white/90 px-2 py-1 shadow-sm"
										>
											<div className="flex items-center gap-1 text-[10px] font-semibold">
												<span className={cn("inline-flex h-2 w-2 shrink-0 rounded-full", meta.indicatorClass)} />
												<span>{meta.label}</span>
												{event.eventType ? (
													<Badge variant="outline" className="h-4 px-1 text-[10px]">
														{EVENT_LABEL[event.eventType] ?? event.eventType}
													</Badge>
												) : null}
											</div>
											<div className="mt-1 space-y-0.5">
												<p className="text-[11px] font-semibold text-[var(--brand-navy)]">
													{event.title}
												</p>
												{event.classroomName ? (
													<p className="text-[10px] text-muted-foreground">{event.classroomName}</p>
												) : null}
												{event.location ? (
													<p className="text-[10px] text-muted-foreground">장소: {event.location}</p>
												) : null}
												{event.status === "cancelled" && event.cancellationReason ? (
													<p className="text-[10px] text-destructive">취소 사유: {event.cancellationReason}</p>
												) : null}
											</div>
										</li>
									);
								})}
							</ul>
						</div>
					);
				})}
			</div>

			{filteredEvents.length === 0 ? (
				<p className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-white/70 px-4 py-8 text-center text-xs text-muted-foreground">
					선택된 조건에 해당하는 일정이 없습니다.
				</p>
			) : null}
		</div>
	);
}
