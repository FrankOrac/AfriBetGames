CREATE TABLE "compliance_gates" (
	"key" text PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"label" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"evidence" text,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operator_audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"target" text NOT NULL,
	"details" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"betting_enabled" boolean DEFAULT false NOT NULL,
	"community_posting_enabled" boolean DEFAULT false NOT NULL,
	"contact_submissions_enabled" boolean DEFAULT false NOT NULL,
	"maintenance_mode" boolean DEFAULT false NOT NULL,
	"house_edge_percentage" numeric(5, 2) DEFAULT 15 NOT NULL,
	"max_daily_payout_ratio" numeric(5, 4) DEFAULT 0.75 NOT NULL,
	"max_single_win_multiplier" numeric(12, 2) DEFAULT 1000 NOT NULL,
	"updated_by" text DEFAULT 'system' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "operator_audit_logs_created_at_idx" ON "operator_audit_logs" USING btree ("created_at");