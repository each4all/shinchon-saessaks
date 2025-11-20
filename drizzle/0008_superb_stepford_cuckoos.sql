CREATE TYPE "public"."class_post_audience_scope" AS ENUM('all', 'classroom', 'private');--> statement-breakpoint
CREATE TYPE "public"."class_post_media_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."class_post_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."class_schedule_audience_scope" AS ENUM('all', 'parents', 'staff');--> statement-breakpoint
CREATE TYPE "public"."class_schedule_event_type" AS ENUM('field_trip', 'holiday', 'notice', 'workshop', 'other');--> statement-breakpoint
CREATE TYPE "public"."class_schedule_status" AS ENUM('draft', 'published', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."meal_plan_audience_scope" AS ENUM('parents', 'staff', 'all');--> statement-breakpoint
CREATE TYPE "public"."meal_type" AS ENUM('breakfast', 'lunch', 'dinner', 'snack', 'other');--> statement-breakpoint
CREATE TYPE "public"."nutrition_bulletin_category" AS ENUM('bulletin', 'report', 'menu_plan');--> statement-breakpoint
CREATE TYPE "public"."nutrition_bulletin_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."parent_education_category" AS ENUM('parent_class', 'parent_recipe', 'seminar');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('parent', 'teacher', 'nutrition', 'admin');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('pending', 'active');--> statement-breakpoint
CREATE TABLE "child_parents" (
	"child_id" uuid,
	"parent_id" uuid,
	"relationship" text,
	"primary_contact" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "children" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"classroom_id" uuid,
	"name" text NOT NULL,
	"birthdate" timestamp,
	"enrollment_date" timestamp,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_post_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"thumbnail_url" text,
	"media_type" "class_post_media_type" DEFAULT 'image' NOT NULL,
	"alt_text" text,
	"caption" text,
	"display_order" integer,
	"is_cover" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"classroom_id" uuid,
	"author_id" uuid,
	"title" text NOT NULL,
	"summary" text,
	"content" text NOT NULL,
	"content_blocks" jsonb,
	"audience_scope" "class_post_audience_scope" DEFAULT 'classroom' NOT NULL,
	"status" "class_post_status" DEFAULT 'draft' NOT NULL,
	"publish_at" timestamp,
	"published_at" timestamp,
	"published_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_schedule_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"label" text,
	"media_type" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_schedule_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" uuid NOT NULL,
	"classroom_id" uuid,
	"group_code" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"classroom_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"location" text,
	"event_type" "class_schedule_event_type" DEFAULT 'other' NOT NULL,
	"audience_scope" "class_schedule_audience_scope" DEFAULT 'parents' NOT NULL,
	"status" "class_schedule_status" DEFAULT 'draft' NOT NULL,
	"cancellation_reason" text,
	"notification_at" timestamp,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classroom_teachers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"classroom_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"role" text DEFAULT 'lead' NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classrooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"age_range" text,
	"lead_teacher" text,
	"assistant_teacher" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_plan_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"label" text,
	"media_type" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"menu_date" timestamp NOT NULL,
	"meal_type" "meal_type" DEFAULT 'lunch' NOT NULL,
	"menu_items" jsonb NOT NULL,
	"allergens" jsonb,
	"notes" text,
	"audience_scope" "meal_plan_audience_scope" DEFAULT 'parents' NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nutrition_bulletins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" "nutrition_bulletin_category" DEFAULT 'bulletin' NOT NULL,
	"status" "nutrition_bulletin_status" DEFAULT 'draft' NOT NULL,
	"publish_at" timestamp,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parent_education_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"label" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parent_education_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"content" text,
	"category" "parent_education_category" DEFAULT 'parent_recipe' NOT NULL,
	"audience_scope" text DEFAULT 'parents' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"publish_at" timestamp,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "parent_education_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "parent_inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"admin_reply" text,
	"replied_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parent_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text,
	"resource_type" text DEFAULT 'form' NOT NULL,
	"file_url" text NOT NULL,
	"published_at" timestamp,
	"audience_scope" text DEFAULT 'parents' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'parent'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."user_status";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" SET DATA TYPE "public"."user_status" USING "status"::"public"."user_status";--> statement-breakpoint
ALTER TABLE "child_parents" ADD CONSTRAINT "child_parents_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_parents" ADD CONSTRAINT "child_parents_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "children" ADD CONSTRAINT "children_classroom_id_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_post_media" ADD CONSTRAINT "class_post_media_post_id_class_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."class_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_posts" ADD CONSTRAINT "class_posts_classroom_id_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_posts" ADD CONSTRAINT "class_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_posts" ADD CONSTRAINT "class_posts_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_posts" ADD CONSTRAINT "class_posts_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_schedule_resources" ADD CONSTRAINT "class_schedule_resources_schedule_id_class_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."class_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_schedule_targets" ADD CONSTRAINT "class_schedule_targets_schedule_id_class_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."class_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_schedule_targets" ADD CONSTRAINT "class_schedule_targets_classroom_id_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_classroom_id_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classroom_teachers" ADD CONSTRAINT "classroom_teachers_classroom_id_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classroom_teachers" ADD CONSTRAINT "classroom_teachers_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan_resources" ADD CONSTRAINT "meal_plan_resources_plan_id_meal_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."meal_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nutrition_bulletins" ADD CONSTRAINT "nutrition_bulletins_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nutrition_bulletins" ADD CONSTRAINT "nutrition_bulletins_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_education_attachments" ADD CONSTRAINT "parent_education_attachments_post_id_parent_education_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."parent_education_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_education_posts" ADD CONSTRAINT "parent_education_posts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_education_posts" ADD CONSTRAINT "parent_education_posts_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_inquiries" ADD CONSTRAINT "parent_inquiries_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;