CREATE SCHEMA IF NOT EXISTS "hub";
--> statement-breakpoint
CREATE TABLE "hub"."applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer,
	"short_name" varchar(255) NOT NULL,
	"long_name" varchar(255) NOT NULL,
	"description" text,
	"logo_url" text,
	"monetized" boolean DEFAULT false,
	"primary_sku" varchar(50) DEFAULT 'APP-SRV-STD',
	"sku_grid" jsonb DEFAULT '[]'::jsonb,
	"payment_methods" jsonb DEFAULT '[]'::jsonb,
	"callback_url" text,
	"journal_voucher" jsonb DEFAULT '{}'::jsonb,
	"access_control_type" varchar(50) DEFAULT 'STANDARD',
	"openfga_schema" text,
	"service_path" varchar(255),
	"github_codeowners" text,
	"github_repo_url" text,
	"deployment_targets" jsonb DEFAULT '[]'::jsonb,
	"gcp_project_id" varchar(255),
	"platform_services" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "applications_short_name_unique" UNIQUE("short_name")
);
