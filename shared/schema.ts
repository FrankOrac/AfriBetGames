import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export enum GameType {
  VIRTUAL = 'virtual',
  MINOR = 'minor',
  MAJOR = 'major',
  MEGA = 'mega',
  NOON = 'noon',
  NIGHT = 'night',
  AVIATOR = 'aviator',
}

export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  minNumber: integer("min_number").notNull(),
  maxNumber: integer("max_number").notNull(),
  minOdds: real("min_odds").notNull(),
  maxOdds: real("max_odds").notNull(),
  numbersToSelect: integer("numbers_to_select").notNull(),
  minMatches: integer("min_matches").notNull(),
  hasBonus: boolean("has_bonus").notNull().default(false),
});

export const insertGameSchema = createInsertSchema(games).omit({ id: true });
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export const bets = pgTable("bets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull(),
  selectedNumbers: text("selected_numbers").notNull(),
  bonusNumber: integer("bonus_number"),
  stakeAmount: real("stake_amount").notNull(),
  potentialWinning: real("potential_winning"),
  status: text("status").notNull().default('pending'),
  payout: real("payout"),
  resultId: varchar("result_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBetSchema = createInsertSchema(bets).omit({ 
  id: true, 
  createdAt: true 
}).extend({
  selectedNumbers: z.array(z.number()).min(1),
  bonusNumber: z.number().optional(),
  stakeAmount: z.number().min(1),
});

export type InsertBet = z.infer<typeof insertBetSchema>;
export type Bet = typeof bets.$inferSelect;

export const results = pgTable("results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull(),
  drawDate: timestamp("draw_date").notNull(),
  winningNumbers: text("winning_numbers").notNull(),
  bonusNumber: integer("bonus_number"),
  odds: text("odds").notNull(),
});

export const insertResultSchema = createInsertSchema(results).omit({ id: true }).extend({
  winningNumbers: z.array(z.number()).min(1),
  bonusNumber: z.number().optional(),
  odds: z.array(z.number()).min(1),
});

export type InsertResult = z.infer<typeof insertResultSchema>;
export type Result = typeof results.$inferSelect;

export const winnings = pgTable("winnings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  betId: varchar("bet_id").notNull(),
  resultId: varchar("result_id").notNull(),
  matchedNumbers: text("matched_numbers").notNull(),
  matchedCount: integer("matched_count").notNull(),
  winningAmount: real("winning_amount").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

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
  gameId: varchar("game_id").notNull(),
  expiresAt: timestamp("expires_at"),
  usesRemaining: integer("uses_remaining"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGameCodeSchema = createInsertSchema(gameCodes).omit({
  id: true,
  createdAt: true,
});

export type InsertGameCode = z.infer<typeof insertGameCodeSchema>;
export type GameCode = typeof gameCodes.$inferSelect;

export const aviatorSessions = pgTable("aviator_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  betId: varchar("bet_id").notNull(),
  startMultiplier: real("start_multiplier").notNull().default(1.0),
  currentMultiplier: real("current_multiplier").notNull(),
  crashMultiplier: real("crash_multiplier").notNull(),
  status: text("status").notNull().default('active'),
  autoCashOutAt: real("auto_cash_out_at"),
  cashedOutAt: real("cashed_out_at"),
  cashedOutAmount: real("cashed_out_amount"),
  multiplierHistory: text("multiplier_history").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

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

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({
  id: true,
  createdAt: true,
});

export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumPost = typeof forumPosts.$inferSelect;

export const forumComments = pgTable("forum_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull(),
  authorName: text("author_name").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertForumCommentSchema = createInsertSchema(forumComments).omit({
  id: true,
  createdAt: true,
});

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

export const insertContactInquirySchema = createInsertSchema(contactInquiries).omit({
  id: true,
  createdAt: true,
  status: true,
});

export type InsertContactInquiry = z.infer<typeof insertContactInquirySchema>;
export type ContactInquiry = typeof contactInquiries.$inferSelect;
