import { cache } from "react";

import { db } from "@/lib/db";

export type ScheduleTarget = {
	id: string;
	classroomId: string | null;
	classroomName?: string | null;
	groupCode?: string | null;
};

export type ScheduleResource = {
	id: string;
	fileUrl: string;
	label?: string | null;
	mediaType?: string | null;
};

export type ClassSchedule = {
	id: string;
	classroomId: string | null;
	classroomName?: string | null;
	title: string;
	description?: string | null;
	startDate: Date;
	endDate?: Date | null;
	location?: string | null;
	eventType: string;
	status: string;
	audienceScope: string;
	cancellationReason?: string | null;
	notificationAt?: Date | null;
	createdBy?: string | null;
	updatedBy?: string | null;
	targets: ScheduleTarget[];
	resources: ScheduleResource[];
};

function parseJsonArray<T>(value: unknown, mapper: (item: Record<string, unknown>) => T): T[] {
	if (!value) return [];

	const toArray = (input: unknown) => {
		if (Array.isArray(input)) return input as Record<string, unknown>[];
		if (typeof input === "string") {
			try {
				const parsed = JSON.parse(input);
				return Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : [];
			} catch {
				return [];
			}
		}
		return [];
	};

	return toArray(value)
		.map((item) => mapper(item))
		.filter((item) => item != null);
}

function mapTargets(value: unknown): ScheduleTarget[] {
	return parseJsonArray(value, (item) => ({
		id: String(item.id ?? crypto.randomUUID()),
		classroomId: item.classroomId ? String(item.classroomId) : null,
		classroomName: item.classroomName ? String(item.classroomName) : null,
		groupCode: item.groupCode ? String(item.groupCode) : null,
	}));
}

function mapResources(value: unknown): ScheduleResource[] {
	return parseJsonArray(value, (item) => ({
		id: String(item.id ?? crypto.randomUUID()),
		fileUrl: String(item.fileUrl ?? ""),
		label: item.label ? String(item.label) : null,
		mediaType: item.mediaType ? String(item.mediaType) : null,
	})).filter((resource) => resource.fileUrl.length > 0);
}

function mapRowToSchedule(row: Record<string, unknown>): ClassSchedule {
	return {
		id: String(row.id),
		classroomId: row.classroomId ? String(row.classroomId) : null,
		classroomName: (row.classroomName as string | null) ?? null,
		title: String(row.title),
		description: (row.description as string | null) ?? null,
		startDate: new Date(String(row.startDate)),
		endDate: row.endDate ? new Date(String(row.endDate)) : null,
		location: (row.location as string | null) ?? null,
		eventType: String(row.eventType ?? "other"),
		status: String(row.status ?? "draft"),
		audienceScope: String(row.audienceScope ?? "parents"),
		cancellationReason: (row.cancellationReason as string | null) ?? null,
		notificationAt: row.notificationAt ? new Date(String(row.notificationAt)) : null,
		createdBy: row.createdBy ? String(row.createdBy) : null,
		updatedBy: row.updatedBy ? String(row.updatedBy) : null,
		targets: mapTargets(row.targets),
		resources: mapResources(row.resources),
	};
}

async function fetchSchedules(options?: {
	classroomId?: string;
	classroomIds?: string[];
	from?: Date;
	to?: Date;
	status?: string;
	includeDrafts?: boolean;
	limit?: number;
}): Promise<ClassSchedule[]> {
	const classroomId = options?.classroomId ?? null;
	const classroomIds = options?.classroomIds ?? null;
	const from = options?.from ? options.from.toISOString() : null;
	const to = options?.to ? options.to.toISOString() : null;
	const status = options?.status ?? null;
	const includeDrafts = options?.includeDrafts ?? true;
	const limit = options?.limit ?? 100;

	const { rows } = await db`
		SELECT
			s.id,
			s.classroom_id AS "classroomId",
			s.title,
			s.description,
			s.start_date AS "startDate",
			s.end_date AS "endDate",
			s.location,
			s.event_type AS "eventType",
			s.status,
			s.audience_scope AS "audienceScope",
			s.cancellation_reason AS "cancellationReason",
			s.notification_at AS "notificationAt",
			s.created_by AS "createdBy",
			s.updated_by AS "updatedBy",
			cl.name AS "classroomName",
			COALESCE(
				(
					SELECT json_agg(
						json_build_object(
							'id', cst.id,
							'classroomId', cst.classroom_id,
							'classroomName', target_cl.name,
							'groupCode', cst.group_code
						)
						ORDER BY cst.created_at DESC
					)
					FROM class_schedule_targets cst
					LEFT JOIN classrooms target_cl ON target_cl.id = cst.classroom_id
					WHERE cst.schedule_id = s.id
				),
				'[]'::json
			) AS targets,
			COALESCE(
				(
					SELECT json_agg(
						json_build_object(
							'id', csr.id,
							'fileUrl', csr.file_url,
							'label', csr.label,
							'mediaType', csr.media_type
						)
						ORDER BY csr.created_at DESC
					)
					FROM class_schedule_resources csr
					WHERE csr.schedule_id = s.id
				),
				'[]'::json
			) AS resources
		FROM class_schedules s
		LEFT JOIN classrooms cl ON cl.id = s.classroom_id
		WHERE
			(${classroomId}::uuid IS NULL OR s.classroom_id = ${classroomId})
			AND (${from}::timestamp IS NULL OR s.start_date >= ${from})
			AND (${to}::timestamp IS NULL OR s.start_date <= ${to})
			AND (
				${includeDrafts} = true
				OR s.status = 'published'
			)
			AND (${status}::text IS NULL OR s.status = ${status})
		ORDER BY s.start_date ASC
		LIMIT ${limit}
	`;

	let schedules = rows.map((row) => mapRowToSchedule(row as Record<string, unknown>));
	if (classroomIds && classroomIds.length > 0) {
		const allowedIds = new Set(classroomIds);
		schedules = schedules.filter((schedule) =>
			schedule.classroomId ? allowedIds.has(schedule.classroomId) : false,
		);
	}
	return schedules;
}

async function fetchSchedulesForParent(parentId: string, from?: Date, to?: Date): Promise<ClassSchedule[]> {
	const fromValue = from ? from.toISOString() : null;
	const toValue = to ? to.toISOString() : null;

	const { rows } = await db`
		SELECT DISTINCT ON (s.id)
			s.id,
			s.classroom_id AS "classroomId",
			s.title,
			s.description,
			s.start_date AS "startDate",
			s.end_date AS "endDate",
			s.location,
			s.event_type AS "eventType",
			s.status,
			s.audience_scope AS "audienceScope",
			s.cancellation_reason AS "cancellationReason",
			s.notification_at AS "notificationAt",
			s.created_by AS "createdBy",
			s.updated_by AS "updatedBy",
			cl.name AS "classroomName",
			COALESCE(
				(
					SELECT json_agg(
						json_build_object(
							'id', cst.id,
							'classroomId', cst.classroom_id,
							'classroomName', target_cl.name,
							'groupCode', cst.group_code
						)
						ORDER BY cst.created_at DESC
					)
					FROM class_schedule_targets cst
					LEFT JOIN classrooms target_cl ON target_cl.id = cst.classroom_id
					WHERE cst.schedule_id = s.id
				),
				'[]'::json
			) AS targets,
			COALESCE(
				(
					SELECT json_agg(
						json_build_object(
							'id', csr.id,
							'fileUrl', csr.file_url,
							'label', csr.label,
							'mediaType', csr.media_type
						)
						ORDER BY csr.created_at DESC
					)
					FROM class_schedule_resources csr
					WHERE csr.schedule_id = s.id
				),
				'[]'::json
			) AS resources
		FROM child_parents cp
		JOIN children c ON cp.child_id = c.id
	JOIN class_schedules s ON (
		s.status IN ('published', 'cancelled')
			AND (s.audience_scope = 'all' OR s.audience_scope = 'parents')
			AND (
				s.classroom_id = c.classroom_id
				OR s.classroom_id IS NULL
				OR EXISTS (
					SELECT 1
					FROM class_schedule_targets cst
					WHERE cst.schedule_id = s.id
						AND cst.classroom_id = c.classroom_id
				)
			)
		)
		LEFT JOIN classrooms cl ON cl.id = s.classroom_id
		WHERE cp.parent_id = ${parentId}
			AND (${fromValue}::timestamp IS NULL OR s.start_date >= ${fromValue})
			AND (${toValue}::timestamp IS NULL OR s.start_date <= ${toValue})
		ORDER BY s.id, s.start_date
	`;

	return rows.map((row) => {
		const schedule = mapRowToSchedule(row as Record<string, unknown>);
		return {
			...schedule,
			classroomName: schedule.classroomId ? schedule.classroomName : schedule.classroomName ?? "전체",
		};
	});
}

export const getSchedules = cache(fetchSchedules);
export const getParentSchedules = cache(fetchSchedulesForParent);
