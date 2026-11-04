ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "aviator_sessions" ALTER COLUMN "start_multiplier" SET DATA TYPE numeric(10, 4);--> statement-breakpoint
ALTER TABLE "aviator_sessions" ALTER COLUMN "start_multiplier" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "aviator_sessions" ALTER COLUMN "current_multiplier" SET DATA TYPE numeric(10, 4);--> statement-breakpoint
ALTER TABLE "aviator_sessions" ALTER COLUMN "crash_multiplier" SET DATA TYPE numeric(10, 4);--> statement-breakpoint
ALTER TABLE "aviator_sessions" ALTER COLUMN "auto_cash_out_at" SET DATA TYPE numeric(10, 4);--> statement-breakpoint
ALTER TABLE "aviator_sessions" ALTER COLUMN "cashed_out_at" SET DATA TYPE numeric(10, 4);--> statement-breakpoint
ALTER TABLE "aviator_sessions" ALTER COLUMN "cashed_out_amount" SET DATA TYPE numeric(14, 2);--> statement-breakpoint
ALTER TABLE "bets" ALTER COLUMN "stake_amount" SET DATA TYPE numeric(14, 2);--> statement-breakpoint
ALTER TABLE "bets" ALTER COLUMN "potential_winning" SET DATA TYPE numeric(14, 2);--> statement-breakpoint
ALTER TABLE "bets" ALTER COLUMN "payout" SET DATA TYPE numeric(14, 2);--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "min_odds" SET DATA TYPE numeric(10, 4);--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "max_odds" SET DATA TYPE numeric(10, 4);--> statement-breakpoint
ALTER TABLE "winnings" ALTER COLUMN "winning_amount" SET DATA TYPE numeric(14, 2);