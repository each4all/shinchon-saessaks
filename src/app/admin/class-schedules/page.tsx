import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { auth } from "@/lib/auth";
import { getClassrooms, getTeacherClassrooms } from "@/lib/data/class-posts-repository";
import { getSchedules } from "@/lib/data/class-schedule-repository";

import { CreateScheduleForm } from "./_components/create-schedule-form";
import { DeleteScheduleButton } from "./_components/delete-schedule-button";
import { UpdateScheduleStatusButton } from "./_components/update-schedule-status-button";

export const dynamic = "force-dynamic";

function formatDateRange(start: Date, end?: Date | null) {
	const startStr = new Intl.DateTimeFormat("ko-KR", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	}).format(start);
	if (!end) return startStr;
	const endStr = new Intl.DateTimeFormat("ko-KR", {
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	}).format(end);
	return `${startStr} ~ ${endStr}`;
}

const EVENT_LABEL: Record<string, string> = {
	notice: "공지",
	field_trip: "체험학습",
	workshop: "워크숍",
	holiday: "휴일",
	other: "기타",
};

const AUDIENCE_LABEL: Record<string, string> = {
	all: "전체 공개",
	parents: "학부모",
	staff: "교직원",
};

const STATUS_LABEL: Record<string, string> = {
	draft: "승인 대기",
	published: "게시",
	cancelled: "취소",
};

const STATUS_BADGE_VARIANT: Record<string, "outline" | "success" | "destructive"> = {
	draft: "outline",
	published: "success",
	cancelled: "destructive",
};

export default async function AdminClassSchedulesPage() {
	const session = await auth();
	const role = session?.user?.role ?? "guest";
	const userId = session?.user?.id ?? "";

	let classrooms = await getClassrooms();
	let schedules = await getSchedules({ limit: 200, includeDrafts: role !== "parent" });
	let teacherClassroomIds: string[] = [];

	if (role === "teacher") {
		const teacherClassrooms = await getTeacherClassrooms(userId);
		teacherClassroomIds = teacherClassrooms.map((classroom) => classroom.id);
		classrooms = teacherClassrooms;
		if (teacherClassroomIds.length === 0) {
			schedules = [];
		} else {
			schedules = await getSchedules({
				classroomIds: teacherClassroomIds,
				includeDrafts: true,
				limit: 200,
			});
		}
	}

	const canDeleteSchedule = (schedule: (typeof schedules)[number]) => {
		if (role === "admin") return true;
		if (role === "teacher") {
			return schedule.createdBy === userId && teacherClassroomIds.includes(schedule.classroomId ?? "");
		}
		return false;
	};
	const pendingSchedules = role === "admin" ? schedules.filter((schedule) => schedule.status === "draft") : [];

	return (
		<div className="space-y-8">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-secondary)]">Admin Console</p>
					<h1 className="font-heading text-[clamp(2rem,3vw,2.75rem)] leading-tight">학사 일정 관리</h1>
					<p className="text-sm text-muted-foreground">반별 일정과 전체 행사를 등록하고 학부모 포털에 노출합니다.</p>
				</div>
				<Button variant="outline" asChild>
					<Link href="/admin">대시보드로 돌아가기</Link>
				</Button>
			</div>

			<CreateScheduleForm
				classrooms={classrooms}
				role={role}
				disabled={role === "teacher" && teacherClassroomIds.length === 0}
			/>

			{role === "admin" ? (
				<section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[rgba(248,247,255,0.6)] p-6 shadow-[var(--shadow-soft)]">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<h2 className="text-lg font-semibold text-[var(--brand-navy)]">승인 대기 일정</h2>
							<p className="text-sm text-muted-foreground">교사가 등록한 일정 초안을 검토하고 게시 여부를 결정하세요.</p>
						</div>
						<Badge variant={pendingSchedules.length > 0 ? "outline" : "success"}>대기 {pendingSchedules.length}건</Badge>
					</div>
					{pendingSchedules.length === 0 ? (
						<p className="mt-4 rounded-[var(--radius-sm)] border border-dashed border-[var(--border)] bg-white/60 px-4 py-6 text-sm text-muted-foreground">
							승인 대기 중인 일정이 없습니다.
						</p>
					) : (
						<ul className="mt-4 space-y-3">
							{pendingSchedules.map((schedule) => (
								<li
									key={schedule.id}
									className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-white/80 p-4 md:flex-row md:items-center md:justify-between"
								>
									<div className="space-y-1">
										<p className="text-sm font-semibold text-[var(--brand-navy)]">
											{schedule.title}
											<span className="ml-2 text-xs text-muted-foreground">
												{schedule.classroomName ?? "전체"} · {formatDateRange(schedule.startDate, schedule.endDate)}
											</span>
										</p>
										<p className="text-xs text-muted-foreground md:max-w-xl">
											{schedule.description ?? schedule.location ?? "세부 내용이 없습니다."}
										</p>
									</div>
									<div className="flex flex-wrap items-center gap-2">
										<UpdateScheduleStatusButton scheduleId={schedule.id} status="published" size="sm">
											게시 승인
										</UpdateScheduleStatusButton>
										<UpdateScheduleStatusButton
											scheduleId={schedule.id}
											status="cancelled"
											variant="destructive"
											requireReason
											size="sm"
											confirmMessage="일정을 취소 처리하시겠습니까? 취소 사유가 학부모에게 공유됩니다."
										>
											취소 처리
										</UpdateScheduleStatusButton>
									</div>
								</li>
							))}
						</ul>
					)}
				</section>
			) : null}

			<section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-lg	font-semibold">등록된 일정</h2>
						<p className="text-sm text-muted-foreground">날짜 순으로 정렬됩니다.</p>
					</div>
					<Badge variant="outline">총 {schedules.length}건</Badge>
				</div>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>대상</TableHead>
							<TableHead>제목</TableHead>
							<TableHead>기간</TableHead>
							<TableHead>상태</TableHead>
							<TableHead>장소 · 유형</TableHead>
							<TableHead className="text-right">관리</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{schedules.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
									등록된 일정이 없습니다.
								</TableCell>
							</TableRow>
						) : (
							schedules.map((schedule) => (
								<TableRow key={schedule.id}>
									<TableCell>{schedule.classroomName ?? "전체"}</TableCell>
									<TableCell className="font-semibold">
										<div className="flex flex-col gap-1">
											<span>{schedule.title}</span>
											{schedule.description ? (
												<span className="text-xs font-normal text-muted-foreground">{schedule.description}</span>
											) : null}
										</div>
									</TableCell>
									<TableCell>{formatDateRange(schedule.startDate, schedule.endDate)}</TableCell>
									<TableCell>
										<div className="flex flex-col gap-1">
											<Badge variant={STATUS_BADGE_VARIANT[schedule.status] ?? "outline"}>
												{STATUS_LABEL[schedule.status] ?? schedule.status}
											</Badge>
											{schedule.status === "cancelled" && schedule.cancellationReason ? (
												<span className="text-xs text-destructive/80">{schedule.cancellationReason}</span>
											) : null}
											{role === "teacher" && schedule.createdBy === userId ? (
												<span className="text-xs text-muted-foreground">
													{schedule.status === "draft"
														? "관리자 승인 대기 중입니다."
														: schedule.status === "cancelled"
															? "관리자가 일정을 취소 처리했습니다."
															: "게시 중인 일정입니다."}
												</span>
											) : null}
										</div>
									</TableCell>
									<TableCell>
										<div className="flex flex-col gap-1">
											<span>{schedule.location ?? "-"}</span>
											<div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
												<Badge variant="outline">{EVENT_LABEL[schedule.eventType] ?? schedule.eventType}</Badge>
												<Badge variant="ghost">{AUDIENCE_LABEL[schedule.audienceScope] ?? schedule.audienceScope}</Badge>
											</div>
										</div>
									</TableCell>
									<TableCell className="text-right">
										<div className="flex flex-wrap justify-end gap-2">
											{role === "admin" ? (
												<>
													{schedule.status !== "published" ? (
														<UpdateScheduleStatusButton
															scheduleId={schedule.id}
															status="published"
															variant="default"
															size="sm"
														>
															게시
														</UpdateScheduleStatusButton>
													) : (
														<UpdateScheduleStatusButton scheduleId={schedule.id} status="draft" size="sm">
															초안으로
														</UpdateScheduleStatusButton>
													)}
													{schedule.status !== "cancelled" ? (
														<UpdateScheduleStatusButton
															scheduleId={schedule.id}
															status="cancelled"
															variant="destructive"
															requireReason
															defaultReason={schedule.cancellationReason ?? ""}
															confirmMessage="일정을 취소 처리하시겠습니까? 취소 사유가 학부모에게 공유됩니다."
															size="sm"
														>
															취소
														</UpdateScheduleStatusButton>
													) : (
														<UpdateScheduleStatusButton scheduleId={schedule.id} status="published" size="sm">
															재게시
														</UpdateScheduleStatusButton>
													)}
												</>
											) : null}
											{canDeleteSchedule(schedule) ? <DeleteScheduleButton scheduleId={schedule.id} /> : null}
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
					<TableCaption>삭제 시 학부모 포털 일정에서도 제거됩니다.</TableCaption>
				</Table>
			</section>
		</div>
	);
}
