import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getParentSchedules } from "@/lib/data/class-schedule-repository";

import { ScheduleCalendar } from "./_components/schedule-calendar";

export const dynamic = "force-dynamic";

export default async function ParentSchedulePage() {
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/member/login?redirect=/parents/schedule");
	}

	const now = new Date();
	const rangeStart = new Date(now);
	rangeStart.setMonth(rangeStart.getMonth() - 1);
	rangeStart.setDate(1);
	const rangeEnd = new Date(now);
	rangeEnd.setMonth(rangeEnd.getMonth() + 2);
	rangeEnd.setDate(0);

	const schedules = await getParentSchedules(session.user.id, rangeStart, rangeEnd);

	const calendarEvents = schedules.map((item) => ({
		id: item.id,
		title: item.title,
		classroomName: item.classroomName,
		location: item.location,
		eventType: item.eventType,
		status: item.status,
		startDate: item.startDate.toISOString(),
		endDate: item.endDate ? item.endDate.toISOString() : null,
		cancellationReason: item.cancellationReason ?? null,
	}));

	return (
		<div className="bg-[var(--background)] text-[var(--brand-navy)]">
			<section className="border-b border-[var(--border)] bg-white/85">
				<div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-12 sm:px-10 lg:px-12">
					<Badge variant="outline" className="w-fit">Schedule</Badge>
					<h1 className="font-heading text-[clamp(2rem,3.5vw,3rem)] leading-tight">학사 일정</h1>
					<p className="text-sm leading-relaxed text-muted-foreground">
						달력에서 우리 반과 전체 일정을 확인하세요. 취소된 일정은 붉은 표시로 안내됩니다.
					</p>
				</div>
			</section>

			<section className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 sm:px-10 lg:px-12">
				{calendarEvents.length === 0 ? (
					<p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white/80 px-4 py-10 text-center text-sm text-muted-foreground">
						등록된 일정이 없습니다.
					</p>
				) : (
					<ScheduleCalendar events={calendarEvents} initialMonthISO={now.toISOString()} />
				)}

				<Button variant="ghost" size="sm" asChild className="w-fit">
					<Link href="/parents">대시보드로 돌아가기</Link>
				</Button>
			</section>
		</div>
	);
}
