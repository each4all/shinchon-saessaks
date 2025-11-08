-- Phase 2 schema expansion for class posts, schedules, meals, and role management

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'class_post_audience_scope') THEN
		CREATE TYPE class_post_audience_scope AS ENUM ('all', 'classroom', 'private');
	END IF;
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'class_post_media_type') THEN
		CREATE TYPE class_post_media_type AS ENUM ('image', 'video');
	END IF;
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'class_post_status') THEN
		CREATE TYPE class_post_status AS ENUM ('draft', 'published', 'archived');
	END IF;
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'class_schedule_audience_scope') THEN
		CREATE TYPE class_schedule_audience_scope AS ENUM ('all', 'parents', 'staff');
	END IF;
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'class_schedule_event_type') THEN
		CREATE TYPE class_schedule_event_type AS ENUM ('field_trip', 'holiday', 'notice', 'workshop', 'other');
	END IF;
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'class_schedule_status') THEN
		CREATE TYPE class_schedule_status AS ENUM ('draft', 'published', 'cancelled');
	END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'meal_plan_audience_scope') THEN
		CREATE TYPE meal_plan_audience_scope AS ENUM ('parents', 'staff');
	END IF;
END$$;

DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM pg_type t
		JOIN pg_enum e ON t.oid = e.enumtypid
		WHERE t.typname = 'meal_plan_audience_scope'
		AND e.enumlabel = 'all'
	) THEN
		RETURN;
	END IF;

	ALTER TYPE meal_plan_audience_scope ADD VALUE IF NOT EXISTS 'all' AFTER 'parents';
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'meal_type') THEN
		CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack', 'other');
	END IF;
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nutrition_bulletin_category') THEN
		CREATE TYPE nutrition_bulletin_category AS ENUM ('bulletin', 'report', 'menu_plan');
	END IF;
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nutrition_bulletin_status') THEN
		CREATE TYPE nutrition_bulletin_status AS ENUM ('draft', 'published', 'archived');
	END IF;
END$$;

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'teacher';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'nutrition';

-- Replace legacy attachments table with richer media metadata
DROP TABLE IF EXISTS class_post_attachments;

CREATE TABLE IF NOT EXISTS class_post_media (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	post_id uuid NOT NULL REFERENCES class_posts (id) ON DELETE CASCADE,
	file_url text NOT NULL,
	thumbnail_url text,
	media_type class_post_media_type NOT NULL DEFAULT 'image',
	alt_text text,
	caption text,
	display_order integer,
	is_cover boolean NOT NULL DEFAULT false,
	created_at timestamp NOT NULL DEFAULT now()
);

ALTER TABLE class_posts
	ADD COLUMN IF NOT EXISTS content_blocks jsonb,
	ADD COLUMN IF NOT EXISTS audience_scope class_post_audience_scope NOT NULL DEFAULT 'classroom',
	ADD COLUMN IF NOT EXISTS status class_post_status NOT NULL DEFAULT 'draft',
	ADD COLUMN IF NOT EXISTS published_at timestamp,
	ADD COLUMN IF NOT EXISTS published_by uuid REFERENCES users (id) ON DELETE SET NULL,
	ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES users (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_class_post_media_post ON class_post_media (post_id);

-- Teacher assignments per classroom
CREATE TABLE IF NOT EXISTS classroom_teachers (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	classroom_id uuid NOT NULL REFERENCES classrooms (id) ON DELETE CASCADE,
	teacher_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
	role text NOT NULL DEFAULT 'lead',
	assigned_at timestamp NOT NULL DEFAULT now(),
	created_at timestamp NOT NULL DEFAULT now(),
	UNIQUE (classroom_id, teacher_id)
);

-- Extend class schedules with richer metadata and attachments
ALTER TABLE class_schedules
	ADD COLUMN IF NOT EXISTS event_type class_schedule_event_type NOT NULL DEFAULT 'other',
	ADD COLUMN IF NOT EXISTS status class_schedule_status NOT NULL DEFAULT 'draft',
	ADD COLUMN IF NOT EXISTS cancellation_reason text,
	ADD COLUMN IF NOT EXISTS notification_at timestamp,
	ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES users (id) ON DELETE SET NULL,
	ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES users (id) ON DELETE SET NULL;

ALTER TABLE class_schedules
	ALTER COLUMN audience_scope DROP DEFAULT;

ALTER TABLE class_schedules
	ALTER COLUMN audience_scope TYPE class_schedule_audience_scope
	USING audience_scope::class_schedule_audience_scope;

ALTER TABLE class_schedules
	ALTER COLUMN audience_scope SET DEFAULT 'parents';

CREATE TABLE IF NOT EXISTS class_schedule_targets (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	schedule_id uuid NOT NULL REFERENCES class_schedules (id) ON DELETE CASCADE,
	classroom_id uuid REFERENCES classrooms (id) ON DELETE CASCADE,
	group_code text,
	created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS class_schedule_resources (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	schedule_id uuid NOT NULL REFERENCES class_schedules (id) ON DELETE CASCADE,
	file_url text NOT NULL,
	label text,
	media_type text,
	created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_class_schedule_targets_schedule ON class_schedule_targets (schedule_id);
CREATE INDEX IF NOT EXISTS idx_class_schedule_resources_schedule ON class_schedule_resources (schedule_id);

-- Meal & nutrition tables
CREATE TABLE IF NOT EXISTS meal_plans (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	menu_date date NOT NULL,
	meal_type meal_type NOT NULL DEFAULT 'lunch',
	menu_items jsonb NOT NULL,
	allergens jsonb,
	notes text,
	audience_scope meal_plan_audience_scope NOT NULL DEFAULT 'parents',
	created_by uuid REFERENCES users (id) ON DELETE SET NULL,
	updated_by uuid REFERENCES users (id) ON DELETE SET NULL,
	created_at timestamp NOT NULL DEFAULT now(),
	updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meal_plan_resources (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	plan_id uuid NOT NULL REFERENCES meal_plans (id) ON DELETE CASCADE,
	file_url text NOT NULL,
	label text,
	media_type text,
	created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nutrition_bulletins (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	title text NOT NULL,
	content text NOT NULL,
	category nutrition_bulletin_category NOT NULL DEFAULT 'bulletin',
	status nutrition_bulletin_status NOT NULL DEFAULT 'draft',
	publish_at timestamp,
	created_by uuid REFERENCES users (id) ON DELETE SET NULL,
	updated_by uuid REFERENCES users (id) ON DELETE SET NULL,
	created_at timestamp NOT NULL DEFAULT now(),
	updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meal_plans_menu_date ON meal_plans (menu_date);
