import { sql } from "@vercel/postgres";

async function main() {
	const { rows } =
		await sql`SELECT slug, title, category, is_published FROM parent_education_posts ORDER BY publish_at DESC LIMIT 20`;
	console.log(rows);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
