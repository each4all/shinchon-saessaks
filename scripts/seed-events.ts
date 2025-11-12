import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config } from "dotenv";

import { db } from "@/lib/db";

const envFile = [".env.local", ".env"].find((file) => existsSync(resolve(process.cwd(), file)));
if (envFile) {
	config({ path: envFile });
}

const EVENT_SEEDS = [
	{
		title: "신촌 한마음 가족 운동회",
		description: "가족이 함께 즐기는 2025년 신촌 한마음 가족 운동회",
		startDate: new Date("2025-05-24T10:00:00+09:00"),
		endDate: new Date("2025-05-24T14:00:00+09:00"),
		location: "신촌교회 운동장",
		eventType: "field_trip",
		images: [
			"/images/events/family-sports-2025/1761297789_232468.jpg",
			"/images/events/family-sports-2025/1761297789_291347.jpg",
			"/images/events/family-sports-2025/1761297789_404858.jpg",
			"/images/events/family-sports-2025/1761297789_626340.jpg",
		],
	},
	{
		title: "2025 성경암송대회",
		description: "아이들이 말씀을 암송하며 믿음을 나누는 2025 성경암송대회",
		startDate: new Date("2025-03-10T09:30:00+09:00"),
		endDate: new Date("2025-03-10T12:00:00+09:00"),
		location: "신촌몬테소리 강당",
		eventType: "workshop",
		images: [
			"/images/events/bible-memory-2025/1756441796_250821.jpg",
			"/images/events/bible-memory-2025/1756441796_377175.jpg",
			"/images/events/bible-memory-2025/1756441796_625697.jpg",
			"/images/events/bible-memory-2025/1756441797_032629.jpg",
		],
	},
];

async function seedEvents() {
	console.log("🔄 Seeding event schedules...");

	const { rows: adminRows } = await db`SELECT id FROM users WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1`;
	const adminId = adminRows[0]?.id ?? null;

	for (const event of EVENT_SEEDS) {
		const existing = await db`SELECT id FROM class_schedules WHERE title = ${event.title} LIMIT 1`;
		let scheduleId: string;

		if (existing.rows.length > 0) {
			scheduleId = existing.rows[0].id as string;
			console.log(`\t➡️  Updating ${event.title}`);
			await db`
				UPDATE class_schedules
				SET description = ${event.description},
					start_date = ${event.startDate.toISOString()},
					end_date = ${event.endDate?.toISOString() ?? null},
					location = ${event.location},
					event_type = ${event.eventType},
					status = 'published',
					audience_scope = 'all',
					updated_at = now(),
					updated_by = ${adminId}
				WHERE id = ${scheduleId}
			`;
		} else {
			console.log(`\t➕  Inserting ${event.title}`);
			const inserted = await db`
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
					null,
					${event.title},
					${event.description},
					${event.startDate.toISOString()},
					${event.endDate?.toISOString() ?? null},
					${event.location},
					${event.eventType},
					'published',
					'all',
					${adminId},
					${adminId}
				)
				RETURNING id
			`;
			scheduleId = inserted.rows[0].id as string;
		}

		await db`DELETE FROM class_schedule_resources WHERE schedule_id = ${scheduleId}`;

		for (const [index, imageUrl] of event.images.entries()) {
			await db`
				INSERT INTO class_schedule_resources (schedule_id, file_url, label, media_type, created_at)
				VALUES (
					${scheduleId},
					${imageUrl},
					${`${event.title} 사진 ${index + 1}`},
					'image',
					now()
				)
			`;
		}
	}

	console.log("✅ Event schedules seeded.");
	process.exit(0);
}

seedEvents().catch((error) => {
	console.error(error);
	process.exit(1);
});
