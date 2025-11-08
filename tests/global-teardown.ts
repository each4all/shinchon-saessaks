import { config as loadEnv } from "dotenv";
import { sql } from "@vercel/postgres";

const TEST_EMAILS = [
	"parent-active@playwright.test",
	"parent-pending@playwright.test",
	"admin@playwright.test",
	"teacher@playwright.test",
	"nutrition@playwright.test",
];

const CLASSROOM_NAME = "Playwright Test Classroom";
const TITLE_PREFIX = "Playwright";

export default async function globalTeardown() {
	loadEnv({ path: ".env.local" });

	if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL && !process.env.POSTGRES_URL_NON_POOLING) {
		return;
	}

	await sql`
		DELETE FROM class_post_media
		WHERE post_id IN (
			SELECT id FROM class_posts WHERE title LIKE ${`${TITLE_PREFIX}%`}
		)
	`;
	await sql`DELETE FROM class_posts WHERE title LIKE ${`${TITLE_PREFIX}%`}`;

	await sql`
		DELETE FROM class_schedule_resources
		WHERE schedule_id IN (
			SELECT id FROM class_schedules WHERE title LIKE ${`${TITLE_PREFIX}%`}
		)
	`;
	await sql`DELETE FROM class_schedules WHERE title LIKE ${`${TITLE_PREFIX}%`}`;

	await sql`
		DELETE FROM meal_plan_resources
		WHERE plan_id IN (
			SELECT id FROM meal_plans WHERE notes LIKE ${`${TITLE_PREFIX}%`}
		)
	`;
	await sql`DELETE FROM meal_plans WHERE notes LIKE ${`${TITLE_PREFIX}%`}`;

	await sql`DELETE FROM nutrition_bulletins WHERE title LIKE ${`${TITLE_PREFIX}%`}`;

	await sql`
		DELETE FROM classroom_teachers
		WHERE classroom_id IN (
			SELECT id FROM classrooms WHERE name = ${CLASSROOM_NAME}
		)
	`;

	await sql`DELETE FROM classrooms WHERE name = ${CLASSROOM_NAME}`;
	for (const email of TEST_EMAILS) {
		await sql`
			DELETE FROM parent_inquiries
			WHERE parent_id = (SELECT id FROM users WHERE email = ${email})
		`;
		await sql`
			DELETE FROM users WHERE email = ${email}
		`;
	}
}
