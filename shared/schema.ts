import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, numeric, boolean, index, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { GameType } from "./game-types";
export { GameType } from "./game-types";

export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  minNumber: integer("min_number").notNull(),
  maxNumber: integer("max_number").notNull(),
  minOdds: numeric("min_odds", { precision: 10, scale: 4, mode: "number" }).notNull(),
  maxOdds: numeric("max_odds", { precision: 10, scale: 4, mode: "number" }).notNull(),
  numbersToSelect: integer("numbers_to_select").notNull(),
  minMatches: integer("min_matches").notNull(),
  hasBonus: boolean("has_bonus").notNull().default(false),
});

export const insertGameSchema = createInsertSchema(games).omit({ id: true });
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export const bets = pgTable("bets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => games.id, { onDelete: "restrict" }),
  selectedNumbers: text("selected_numbers").notNull(),
  bonusNumber: integer("bonus_number"),
  stakeAmount: numeric("stake_amount", { precision: 14, scale: 2, mode: "number" }).notNull(),
  potentialWinning: numeric("potential_winning", { precision: 14, scale: 2, mode: "number" }),
  status: text("status").notNull().default('pending'),
  payout: numeric("payout", { precision: 14, scale: 2, mode: "number" }),
  resultId: varchar("result_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("bets_game_id_idx").on(table.gameId),
  index("bets_created_at_idx").on(table.createdAt),
]);

export const insertBetSchema = z.object({
  gameId: z.string().uuid(),
  selectedNumbers: z.array(z.number().int()).min(1).max(10),
  bonusNumber: z.number().int().optional(),
  stakeAmount: z.number().finite().min(1).max(1_000_000),
}).strict();

export type InsertBet = z.infer<typeof insertBetSchema>;
export type NewBet = InsertBet & { potentialWinning?: number };
export type Bet = typeof bets.$inferSelect;

export const results = pgTable("results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => games.id, { onDelete: "restrict" }),
  drawDate: timestamp("draw_date").notNull(),
  winningNumbers: text("winning_numbers").notNull(),
  bonusNumber: integer("bonus_number"),
  odds: text("odds").notNull(),
}, (table) => [
  index("results_game_draw_idx").on(table.gameId, table.drawDate),
]);

export const insertResultSchema = z.object({
  gameId: z.string().uuid(),
  drawDate: z.coerce.date(),
  winningNumbers: z.array(z.number().int()).min(1).max(10),
  bonusNumber: z.number().int().optional(),
  odds: z.array(z.number().finite().positive()).min(1).max(10),
}).strict();

export type InsertResult = z.infer<typeof insertResultSchema>;
export type Result = typeof results.$inferSelect;

export const winnings = pgTable("winnings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  betId: varchar("bet_id").notNull().references(() => bets.id, { onDelete: "cascade" }),
  resultId: varchar("result_id").notNull().references(() => results.id, { onDelete: "restrict" }),
  matchedNumbers: text("matched_numbers").notNull(),
  matchedCount: integer("matched_count").notNull(),
  winningAmount: numeric("winning_amount", { precision: 14, scale: 2, mode: "number" }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("winnings_bet_id_idx").on(table.betId),
  index("winnings_created_at_idx").on(table.createdAt),
]);

export const insertWinningSchema = createInsertSchema(winnings).omit({ 
  id: true, 
  createdAt: true 
}).extend({
  matchedNumbers: z.array(z.number()),
});

export type InsertWinning = z.infer<typeof insertWinningSchema>;
export type Winning = typeof winnings.$inferSelect;

export const gameCodes = pgTable("game_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  gameId: varchar("game_id").references(() => games.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at"),
  usesRemaining: integer("uses_remaining"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGameCodeSchema = z.object({
  code: z.string().trim().min(6).max(40).regex(/^[A-Z0-9_-]+$/i),
  gameId: z.string().uuid().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  usesRemaining: z.number().int().positive().nullable().optional(),
}).strict();

export type InsertGameCode = z.infer<typeof insertGameCodeSchema>;
export type GameCode = typeof gameCodes.$inferSelect;

export const aviatorSessions = pgTable("aviator_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  betId: varchar("bet_id").notNull().references(() => bets.id, { onDelete: "cascade" }),
  startMultiplier: numeric("start_multiplier", { precision: 10, scale: 4, mode: "number" }).notNull().default(1),
  currentMultiplier: numeric("current_multiplier", { precision: 10, scale: 4, mode: "number" }).notNull(),
  crashMultiplier: numeric("crash_multiplier", { precision: 10, scale: 4, mode: "number" }).notNull(),
  status: text("status").notNull().default('active'),
  autoCashOutAt: numeric("auto_cash_out_at", { precision: 10, scale: 4, mode: "number" }),
  cashedOutAt: numeric("cashed_out_at", { precision: 10, scale: 4, mode: "number" }),
  cashedOutAmount: numeric("cashed_out_amount", { precision: 14, scale: 2, mode: "number" }),
  multiplierHistory: text("multiplier_history").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  uniqueIndex("aviator_sessions_bet_id_idx").on(table.betId),
]);

export const insertAviatorSessionSchema = createInsertSchema(aviatorSessions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
}).extend({
  multiplierHistory: z.array(z.object({
    time: z.number(),
    multiplier: z.number(),
  })),
});

export type InsertAviatorSession = z.infer<typeof insertAviatorSessionSchema>;
export type AviatorSession = typeof aviatorSessions.$inferSelect;

export const forumPosts = pgTable("forum_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorName: text("author_name").notNull(),
  title: text("title").notNull(),
  contentType: text("content_type").notNull(),
  gameType: text("game_type").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertForumPostSchema = z.object({
  authorName: z.string().trim().min(2).max(50),
  title: z.string().trim().min(4).max(120),
  contentType: z.enum(["win_story", "lucky_numbers", "game_code", "suggestion"]),
  gameType: z.enum(GameType),
  content: z.string().trim().min(10).max(2_000),
}).strict();

export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumPost = typeof forumPosts.$inferSelect;

export const forumComments = pgTable("forum_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => forumPosts.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("forum_comments_post_id_idx").on(table.postId),
]);

export const insertForumCommentSchema = z.object({
  postId: z.string().uuid(),
  authorName: z.string().trim().min(2).max(50),
  comment: z.string().trim().min(2).max(1_000),
}).strict();

export type InsertForumComment = z.infer<typeof insertForumCommentSchema>;
export type ForumComment = typeof forumComments.$inferSelect;

export const virtualWeeks = pgTable("virtual_weeks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weekNumber: integer("week_number").notNull(),
  totalWeeks: integer("total_weeks").notNull().default(35),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull().default('active'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVirtualWeekSchema = createInsertSchema(virtualWeeks).omit({
  id: true,
  createdAt: true,
});

export type InsertVirtualWeek = z.infer<typeof insertVirtualWeekSchema>;
export type VirtualWeek = typeof virtualWeeks.$inferSelect;

export const contactInquiries = pgTable("contact_inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default('general'),
  status: text("status").notNull().default('new'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertContactInquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(30).optional(),
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10).max(5_000),
  type: z.enum(["general", "investor"]).default("general"),
}).strict();

export type InsertContactInquiry = z.infer<typeof insertContactInquirySchema>;
export type ContactInquiry = typeof contactInquiries.$inferSelect;
