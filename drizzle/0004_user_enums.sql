DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
		CREATE TYPE "user_role" AS ENUM ('parent', 'admin');
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
		CREATE TYPE "user_status" AS ENUM ('pending', 'active');
	END IF;
END$$;

ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "user_role" USING "role"::"user_role";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'parent';

ALTER TABLE "users" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "status" TYPE "user_status" USING "status"::"user_status";
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'pending';
