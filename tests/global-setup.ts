import { config as loadEnv } from "dotenv";
import { pbkdf2Sync, randomBytes } from "crypto";
import { sql } from "@vercel/postgres";

type TestUser = {
	name: string;
	email: string;
	password: string;
	role: "parent" | "admin" | "teacher" | "nutrition";
	status: "active" | "pending";
};

const TEST_USERS: TestUser[] = [
	{
		name: "E2E Active Parent",
		email: "parent-active@playwright.test",
		password: "Parent123!",
		role: "parent",
		status: "active",
	},
	{
		name: "E2E Pending Parent",
		email: "parent-pending@playwright.test",
		password: "Parent123!",
		role: "parent",
		status: "pending",
	},
	{
		name: "E2E Admin",
		email: "admin@playwright.test",
		password: "Admin123!",
		role: "admin",
		status: "active",
	},
	{
		name: "E2E Teacher",
		email: "teacher@playwright.test",
		password: "Teacher123!",
		role: "teacher",
		status: "active",
	},
	{
		name: "E2E Nutritionist",
		email: "nutrition@playwright.test",
		password: "Nutrition123!",
		role: "nutrition",
		status: "active",
	},
];

const SALT_BYTE_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 120_000;
const DIGEST = "sha512";

function hashPassword(password: string) {
	const salt = randomBytes(SALT_BYTE_LENGTH).toString("hex");
	const derivedKey = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");

	return `${ITERATIONS}:${salt}:${derivedKey}`;
}

async function ensureTestUsers() {
	const connectionString =
		process.env.POSTGRES_URL ??
		process.env.DATABASE_URL ??
		process.env.POSTGRES_URL_NON_POOLING ??
		process.env.POSTGRES_PRISMA_URL;

	if (!connectionString) {
		throw new Error("POSTGRES_URL (또는 DATABASE_URL) 환경 변수가 필요합니다.");
	}

	for (const user of TEST_USERS) {
		const hashedPassword = hashPassword(user.password);

		await sql`
			INSERT INTO users (name, email, password_hash, role, status)
			VALUES (${user.name}, ${user.email}, ${hashedPassword}, ${user.role}, ${user.status})
			ON CONFLICT (email) DO UPDATE SET
				name = EXCLUDED.name,
				password_hash = EXCLUDED.password_hash,
				role = EXCLUDED.role,
				status = EXCLUDED.status,
				updated_at = now()
		`;
	}
}

const CLASSROOM_NAME = "Playwright Test Classroom";
const CLASSROOM_DESCRIPTION = "E2E 자동화 테스트용 교실";

async function ensureClassroomAssignments() {
	const teacherEmail = "teacher@playwright.test";

	const teacherResult = await sql`SELECT id FROM users WHERE email = ${teacherEmail}`;
	if (teacherResult.rows.length === 0) {
		throw new Error("Teacher user was not created successfully for tests.");
	}
	const teacherId = teacherResult.rows[0]?.id as string;

	const classroomResult = await sql`SELECT id FROM classrooms WHERE name = ${CLASSROOM_NAME}`;
	let classroomId = classroomResult.rows[0]?.id as string | undefined;

	if (!classroomId) {
		const inserted = await sql`
			INSERT INTO classrooms (name, description, age_range, lead_teacher, assistant_teacher)
			VALUES (${CLASSROOM_NAME}, ${CLASSROOM_DESCRIPTION}, ${"만 4~5세"}, ${"E2E 교사"}, ${"E2E 보조교사"})
			RETURNING id
		`;
		classroomId = inserted.rows[0]?.id as string;
	}

	if (!classroomId) {
		throw new Error("Failed to ensure test classroom.");
	}

	await sql`
		DELETE FROM classroom_teachers
		WHERE classroom_id = ${classroomId} AND teacher_id = ${teacherId}
	`;

	await sql`
		INSERT INTO classroom_teachers (classroom_id, teacher_id, role)
		SELECT ${classroomId}, ${teacherId}, ${"lead"}
		WHERE NOT EXISTS (
			SELECT 1
			FROM classroom_teachers
			WHERE classroom_id = ${classroomId}
				AND teacher_id = ${teacherId}
		)
	`;
}

export default async function globalSetup() {
	loadEnv({ path: ".env.local" });
	await ensureTestUsers();
	await ensureClassroomAssignments();
}
