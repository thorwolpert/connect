ALTER TABLE "hub"."applications" ADD COLUMN IF NOT EXISTS "links" jsonb DEFAULT '{}'::jsonb;
--> statement-breakpoint
