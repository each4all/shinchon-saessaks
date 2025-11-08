"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import type { FormState } from "../form-state";

const createScheduleSchema = z.object({
	classroomId: z.string().uuid().optional().or(z.literal("")),
	title: z.string().min(2, "제목을 입력해 주세요."),
	description: z
		.string()
		.optional()
		.transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined)),
	startDate: z.string().min(1, "시작일을 입력해 주세요."),
	endDate: z
		.string()
		.optional()
		.transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined)),
	location: z
		.string()
		.optional()
		.transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined)),
	eventType: z.enum(["field_trip", "holiday", "notice", "workshop", "other"]).default("other"),
	status: z.enum(["draft", "published", "cancelled"]).default("draft"),
	audienceScope: z.enum(["all", "parents", "staff"]).default("parents"),
});

function parseScheduleDates(start: string, end?: string | null) {
	const startDate = new Date(start);
	const endDate = end ? new Date(end) : null;
	if (Number.isNaN(startDate.getTime())) {
		throw new Error("유효한 시작일을 입력해 주세요.");
	}
	if (endDate && Number.isNaN(endDate.getTime())) {
		throw new Error("유효한 종료일을 확인해 주세요.");
	}
	return { startDate, endDate };
}

async function isTeacherAssignedToClassroom(teacherId: string, classroomId: string | null) {
	if (!classroomId) return false;
	const { rows } = await db`
		SELECT 1
		FROM classroom_teachers
		WHERE teacher_id = ${teacherId}
			AND classroom_id = ${classroomId}
		LIMIT 1
	`;
	return rows.length > 0;
}

async function getScheduleSnapshot(scheduleId: string) {
	const { rows } = await db`
		SELECT classroom_id AS "classroomId", created_by AS "createdBy"
		FROM class_schedules
		WHERE id = ${scheduleId}
		LIMIT 1
	`;
	return rows[0] as { classroomId: string | null; createdBy: string | null } | undefined;
}

export async function createScheduleAction(_: FormState, formData: FormData): Promise<FormState> {
	const session = await auth();
	const role = session?.user?.role ?? "";

	if (!session || (role !== "admin" && role !== "teacher")) {
		return { status: "error", message: "권한이 필요합니다." };
	}

	const parsed = createScheduleSchema.safeParse({
		classroomId: formData.get("classroomId")?.toString(),
		title: formData.get("title")?.toString() ?? "",
		description: formData.get("description")?.toString(),
		startDate: formData.get("startDate")?.toString() ?? "",
		endDate: formData.get("endDate")?.toString(),
		location: formData.get("location")?.toString(),
		eventType: formData.get("eventType")?.toString() as z.infer<typeof createScheduleSchema>["eventType"],
		status: formData.get("status")?.toString() as z.infer<typeof createScheduleSchema>["status"],
		audienceScope: formData.get("audienceScope")?.toString() as z.infer<typeof createScheduleSchema>["audienceScope"],
	});

	if (!parsed.success) {
		return {
			status: "error",
			message: "입력값을 확인해 주세요.",
			issues: parsed.error.issues.map((issue) => issue.message),
		};
	}

	try {
		const targetClassroomId = parsed.data.classroomId || null;
		if (role === "teacher") {
			const allowed = await isTeacherAssignedToClassroom(session.user.id, targetClassroomId);
			if (!allowed) {
				return {
					status: "error",
					message: "담당 반 일정만 등록할 수 있습니다.",
				};
			}
		}

		const { startDate, endDate } = parseScheduleDates(parsed.data.startDate, parsed.data.endDate ?? null);
		const effectiveStatus = role === "teacher" && parsed.data.status === "published" ? "draft" : parsed.data.status;

		await db`
			INSERT INTO class_schedules (
				classroom_id,
				title,
				description,
				start_date,
				end_date,
				location,
				event_type,
				status,
				audience_scope,
				created_by,
				updated_by
			)
			VALUES (
				${targetClassroomId},
				${parsed.data.title},
				${parsed.data.description ?? null},
				${startDate.toISOString()},
				${endDate ? endDate.toISOString() : null},
				${parsed.data.location ?? null},
				${parsed.data.eventType},
				${effectiveStatus},
				${parsed.data.audienceScope},
				${session.user.id},
				${session.user.id}
			)
		`;

		revalidatePath("/admin/class-schedules");
		revalidatePath("/parents");
		revalidatePath("/parents/schedule");

		const successMessage =
			role === "teacher"
				? "초안이 저장되었습니다. 관리자 승인 후 게시됩니다."
				: parsed.data.status === "published"
					? "일정을 게시했습니다."
					: parsed.data.status === "cancelled"
						? "취소된 일정으로 저장했습니다."
						: "일정을 등록했습니다.";

		return { status: "success", message: successMessage };
	} catch (error) {
		console.error("[createScheduleAction]", error);
		return { status: "error", message: error instanceof Error ? error.message : "저장 중 오류가 발생했습니다." };
	}
}

export async function deleteScheduleAction(_: FormState, formData: FormData): Promise<FormState> {
	const session = await auth();
	const role = session?.user?.role ?? "";

	if (!session || (role !== "admin" && role !== "teacher")) {
		return { status: "error", message: "권한이 필요합니다." };
	}

	const scheduleId = formData.get("scheduleId") as string | null;
	if (!scheduleId) {
		return { status: "error", message: "삭제할 일정을 찾지 못했습니다." };
	}

	const snapshot = await getScheduleSnapshot(scheduleId);
	if (!snapshot) {
		return { status: "error", message: "일정을 찾을 수 없습니다." };
	}

	if (role === "teacher") {
		const allowed = await isTeacherAssignedToClassroom(session.user.id, snapshot.classroomId);
		if (!allowed || snapshot.createdBy !== session.user.id) {
			return { status: "error", message: "담당 반에서 등록한 일정만 삭제할 수 있습니다." };
		}
	}

	await db`DELETE FROM class_schedules WHERE id = ${scheduleId}`;
	revalidatePath("/admin/class-schedules");
	revalidatePath("/parents");
	revalidatePath("/parents/schedule");
	return { status: "success", message: "삭제되었습니다." };
}

const changeScheduleStatusSchema = z.object({
	scheduleId: z.string().uuid(),
	status: z.enum(["draft", "published", "cancelled"]),
	cancellationReason: z
		.string()
		.optional()
		.transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined)),
});

export async function updateScheduleStatusAction(_: FormState, formData: FormData): Promise<FormState> {
	const session = await auth();
	const role = session?.user?.role ?? "";

	if (!session || role !== "admin") {
		return { status: "error", message: "관리자 권한이 필요합니다." };
	}

	const parsed = changeScheduleStatusSchema.safeParse({
		scheduleId: formData.get("scheduleId")?.toString() ?? "",
		status: formData.get("status")?.toString() ?? "",
		cancellationReason: formData.get("cancellationReason")?.toString(),
	});

	if (!parsed.success) {
		return { status: "error", message: "상태를 변경할 수 없습니다." };
	}

	const { scheduleId, status, cancellationReason } = parsed.data;

	if (status === "cancelled" && !cancellationReason) {
		return { status: "error", message: "취소 사유를 입력해 주세요." };
	}

	await db`
		UPDATE class_schedules
		SET
			status = ${status},
			cancellation_reason = ${status === "cancelled" ? cancellationReason ?? "" : null},
			updated_by = ${session.user.id},
			updated_at = now()
		WHERE id = ${scheduleId}
	`;

	revalidatePath("/admin/class-schedules");
	revalidatePath("/parents");
	revalidatePath("/parents/schedule");

	return { status: "success", message: "일정 상태를 변경했습니다." };
}
