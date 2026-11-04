CREATE TABLE "aviator_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bet_id" varchar NOT NULL,
	"start_multiplier" real DEFAULT 1 NOT NULL,
	"current_multiplier" real NOT NULL,
	"crash_multiplier" real NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"auto_cash_out_at" real,
	"cashed_out_at" real,
	"cashed_out_amount" real,
	"multiplier_history" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "bets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" varchar NOT NULL,
	"selected_numbers" text NOT NULL,
	"bonus_number" integer,
	"stake_amount" real NOT NULL,
	"potential_winning" real,
	"status" text DEFAULT 'pending' NOT NULL,
	"payout" real,
	"result_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_inquiries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'general' NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_comments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" varchar NOT NULL,
	"author_name" text NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_name" text NOT NULL,
	"title" text NOT NULL,
	"content_type" text NOT NULL,
	"game_type" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_codes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"game_id" varchar,
	"expires_at" timestamp,
	"uses_remaining" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "game_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"min_number" integer NOT NULL,
	"max_number" integer NOT NULL,
	"min_odds" real NOT NULL,
	"max_odds" real NOT NULL,
	"numbers_to_select" integer NOT NULL,
	"min_matches" integer NOT NULL,
	"has_bonus" boolean DEFAULT false NOT NULL,
	CONSTRAINT "games_type_unique" UNIQUE("type")
);
--> statement-breakpoint
CREATE TABLE "results" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" varchar NOT NULL,
	"draw_date" timestamp NOT NULL,
	"winning_numbers" text NOT NULL,
	"bonus_number" integer,
	"odds" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "virtual_weeks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"week_number" integer NOT NULL,
	"total_weeks" integer DEFAULT 35 NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "winnings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bet_id" varchar NOT NULL,
	"result_id" varchar NOT NULL,
	"matched_numbers" text NOT NULL,
	"matched_count" integer NOT NULL,
	"winning_amount" real NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aviator_sessions" ADD CONSTRAINT "aviator_sessions_bet_id_bets_id_fk" FOREIGN KEY ("bet_id") REFERENCES "public"."bets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bets" ADD CONSTRAINT "bets_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_post_id_forum_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."forum_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_codes" ADD CONSTRAINT "game_codes_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "winnings" ADD CONSTRAINT "winnings_bet_id_bets_id_fk" FOREIGN KEY ("bet_id") REFERENCES "public"."bets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "winnings" ADD CONSTRAINT "winnings_result_id_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."results"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "aviator_sessions_bet_id_idx" ON "aviator_sessions" USING btree ("bet_id");--> statement-breakpoint
CREATE INDEX "bets_game_id_idx" ON "bets" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "bets_created_at_idx" ON "bets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "forum_comments_post_id_idx" ON "forum_comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "results_game_draw_idx" ON "results" USING btree ("game_id","draw_date");--> statement-breakpoint
CREATE UNIQUE INDEX "winnings_bet_id_idx" ON "winnings" USING btree ("bet_id");--> statement-breakpoint
CREATE INDEX "winnings_created_at_idx" ON "winnings" USING btree ("created_at");