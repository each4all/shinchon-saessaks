CREATE TYPE "parent_education_category" AS ENUM ('parent_class', 'parent_recipe', 'seminar');

CREATE TABLE IF NOT EXISTS "parent_education_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"slug" text NOT NULL UNIQUE,
	"title" text NOT NULL,
	"summary" text,
	"content" text,
	"category" "parent_education_category" NOT NULL DEFAULT 'parent_recipe',
	"audience_scope" text NOT NULL DEFAULT 'parents',
	"is_published" boolean NOT NULL DEFAULT false,
	"publish_at" timestamp,
	"view_count" integer NOT NULL DEFAULT 0,
	"created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"updated_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"created_at" timestamp NOT NULL DEFAULT now(),
	"updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "parent_education_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"post_id" uuid NOT NULL REFERENCES "parent_education_posts"("id") ON DELETE CASCADE,
	"file_url" text NOT NULL,
	"label" text,
	"created_at" timestamp NOT NULL DEFAULT now()
);
