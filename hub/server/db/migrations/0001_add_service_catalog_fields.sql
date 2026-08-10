ALTER TABLE "hub"."applications" ADD COLUMN IF NOT EXISTS "category" varchar(255) DEFAULT 'Public Applications';
--> statement-breakpoint
ALTER TABLE "hub"."applications" ADD COLUMN IF NOT EXISTS "status" varchar(50) DEFAULT 'Production';
--> statement-breakpoint
ALTER TABLE "hub"."applications" ADD COLUMN IF NOT EXISTS "ministry" varchar(255);
--> statement-breakpoint
ALTER TABLE "hub"."applications" ADD COLUMN IF NOT EXISTS "features" jsonb DEFAULT '[]'::jsonb;
--> statement-breakpoint
ALTER TABLE "hub"."applications" ADD COLUMN IF NOT EXISTS "tags" jsonb DEFAULT '[]'::jsonb;
--> statement-breakpoint
ALTER TABLE "hub"."applications" ADD COLUMN IF NOT EXISTS "icon" varchar(255) DEFAULT 'i-lucide-app-window';
