const { sql } = require("@vercel/postgres");
(async () => {
  const { rows } = await sql`SELECT slug, title, category, is_published FROM parent_education_posts ORDER BY publish_at DESC LIMIT 20`;
  console.log(rows);
  process.exit(0);
})();
