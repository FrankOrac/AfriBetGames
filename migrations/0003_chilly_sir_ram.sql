CREATE TABLE "demo_ledger" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"balance_after" numeric(14, 2) NOT NULL,
	"reference" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_wallets" (
	"session_id" varchar PRIMARY KEY NOT NULL,
	"balance" numeric(14, 2) DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bets" ADD COLUMN "is_demo" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "bets" ADD COLUMN "demo_session_id" varchar;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD COLUMN "demo_mode_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "results" ADD COLUMN "is_demo" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "demo_ledger" ADD CONSTRAINT "demo_ledger_session_id_demo_wallets_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."demo_wallets"("session_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "demo_ledger_session_created_idx" ON "demo_ledger" USING btree ("session_id","created_at");