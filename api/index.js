// server/app.ts
import compression from "compression";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { randomUUID as randomUUID2 } from "node:crypto";

// server/routes.ts
import { randomInt } from "node:crypto";
import { z as z2 } from "zod";

// server/storage.ts
import { randomUUID } from "crypto";

// shared/game-types.ts
var GameType = /* @__PURE__ */ ((GameType2) => {
  GameType2["VIRTUAL"] = "virtual";
  GameType2["MINOR"] = "minor";
  GameType2["MAJOR"] = "major";
  GameType2["MEGA"] = "mega";
  GameType2["NOON"] = "noon";
  GameType2["NIGHT"] = "night";
  GameType2["AVIATOR"] = "aviator";
  return GameType2;
})(GameType || {});

// server/game-catalog.ts
var GAME_CATALOG = [
  {
    type: "virtual" /* VIRTUAL */,
    name: "Virtual Betting",
    description: "Weekly rounds with a published draw schedule and verified results.",
    minNumber: 0,
    maxNumber: 40,
    minOdds: 1.01,
    maxOdds: 7,
    numbersToSelect: 5,
    minMatches: 3,
    hasBonus: false
  },
  {
    type: "minor" /* MINOR */,
    name: "Minor Game",
    description: "Pick 5 unique numbers from 0-40 and match 3 or more to win.",
    minNumber: 0,
    maxNumber: 40,
    minOdds: 1.01,
    maxOdds: 7,
    numbersToSelect: 5,
    minMatches: 3,
    hasBonus: false
  },
  {
    type: "major" /* MAJOR */,
    name: "Major Game",
    description: "Pick 7 unique numbers from 0-60 and match 3 or more to win.",
    minNumber: 0,
    maxNumber: 60,
    minOdds: 1.01,
    maxOdds: 13,
    numbersToSelect: 7,
    minMatches: 3,
    hasBonus: false
  },
  {
    type: "mega" /* MEGA */,
    name: "Mega Game",
    description: "Pick 10 unique numbers from 0-90 and match 5 or more to win.",
    minNumber: 0,
    maxNumber: 90,
    minOdds: 1.01,
    maxOdds: 17,
    numbersToSelect: 10,
    minMatches: 5,
    hasBonus: false
  },
  {
    type: "noon" /* NOON */,
    name: "Noon Game",
    description: "Daily noon draw. Pick 3 unique numbers from 0-25 plus a bonus number.",
    minNumber: 0,
    maxNumber: 25,
    minOdds: 1.01,
    maxOdds: 12,
    numbersToSelect: 3,
    minMatches: 2,
    hasBonus: true
  },
  {
    type: "night" /* NIGHT */,
    name: "Night Game",
    description: "Daily midnight draw. Pick 3 unique numbers from 0-25 plus a bonus number.",
    minNumber: 0,
    maxNumber: 25,
    minOdds: 1.01,
    maxOdds: 12,
    numbersToSelect: 3,
    minMatches: 2,
    hasBonus: true
  },
  {
    type: "aviator" /* AVIATOR */,
    name: "Number Aviator",
    description: "A fast number game with server-authoritative multiplier settlement.",
    minNumber: 1,
    maxNumber: 36,
    minOdds: 3,
    maxOdds: 8,
    numbersToSelect: 3,
    minMatches: 2,
    hasBonus: false
  }
];

// server/database-storage.ts
import { neon } from "@neondatabase/serverless";
import { and, asc, desc, eq, gt, gte, isNull, or, sql as sql2 } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, numeric, boolean, index, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var games = pgTable("games", {
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
  hasBonus: boolean("has_bonus").notNull().default(false)
});
var insertGameSchema = createInsertSchema(games).omit({ id: true });
var bets = pgTable("bets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => games.id, { onDelete: "restrict" }),
  selectedNumbers: text("selected_numbers").notNull(),
  bonusNumber: integer("bonus_number"),
  stakeAmount: numeric("stake_amount", { precision: 14, scale: 2, mode: "number" }).notNull(),
  potentialWinning: numeric("potential_winning", { precision: 14, scale: 2, mode: "number" }),
  status: text("status").notNull().default("pending"),
  payout: numeric("payout", { precision: 14, scale: 2, mode: "number" }),
  resultId: varchar("result_id"),
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (table) => [
  index("bets_game_id_idx").on(table.gameId),
  index("bets_created_at_idx").on(table.createdAt)
]);
var insertBetSchema = z.object({
  gameId: z.string().uuid(),
  selectedNumbers: z.array(z.number().int()).min(1).max(10),
  bonusNumber: z.number().int().optional(),
  stakeAmount: z.number().finite().min(1).max(1e6)
}).strict();
var results = pgTable("results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => games.id, { onDelete: "restrict" }),
  drawDate: timestamp("draw_date").notNull(),
  winningNumbers: text("winning_numbers").notNull(),
  bonusNumber: integer("bonus_number"),
  odds: text("odds").notNull()
}, (table) => [
  index("results_game_draw_idx").on(table.gameId, table.drawDate)
]);
var insertResultSchema = z.object({
  gameId: z.string().uuid(),
  drawDate: z.coerce.date(),
  winningNumbers: z.array(z.number().int()).min(1).max(10),
  bonusNumber: z.number().int().optional(),
  odds: z.array(z.number().finite().positive()).min(1).max(10)
}).strict();
var winnings = pgTable("winnings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  betId: varchar("bet_id").notNull().references(() => bets.id, { onDelete: "cascade" }),
  resultId: varchar("result_id").notNull().references(() => results.id, { onDelete: "restrict" }),
  matchedNumbers: text("matched_numbers").notNull(),
  matchedCount: integer("matched_count").notNull(),
  winningAmount: numeric("winning_amount", { precision: 14, scale: 2, mode: "number" }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (table) => [
  uniqueIndex("winnings_bet_id_idx").on(table.betId),
  index("winnings_created_at_idx").on(table.createdAt)
]);
var insertWinningSchema = createInsertSchema(winnings).omit({
  id: true,
  createdAt: true
}).extend({
  matchedNumbers: z.array(z.number())
});
var gameCodes = pgTable("game_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  gameId: varchar("game_id").references(() => games.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at"),
  usesRemaining: integer("uses_remaining"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertGameCodeSchema = z.object({
  code: z.string().trim().min(6).max(40).regex(/^[A-Z0-9_-]+$/i),
  gameId: z.string().uuid().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  usesRemaining: z.number().int().positive().nullable().optional()
}).strict();
var aviatorSessions = pgTable("aviator_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  betId: varchar("bet_id").notNull().references(() => bets.id, { onDelete: "cascade" }),
  startMultiplier: numeric("start_multiplier", { precision: 10, scale: 4, mode: "number" }).notNull().default(1),
  currentMultiplier: numeric("current_multiplier", { precision: 10, scale: 4, mode: "number" }).notNull(),
  crashMultiplier: numeric("crash_multiplier", { precision: 10, scale: 4, mode: "number" }).notNull(),
  status: text("status").notNull().default("active"),
  autoCashOutAt: numeric("auto_cash_out_at", { precision: 10, scale: 4, mode: "number" }),
  cashedOutAt: numeric("cashed_out_at", { precision: 10, scale: 4, mode: "number" }),
  cashedOutAmount: numeric("cashed_out_amount", { precision: 14, scale: 2, mode: "number" }),
  multiplierHistory: text("multiplier_history").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at")
}, (table) => [
  uniqueIndex("aviator_sessions_bet_id_idx").on(table.betId)
]);
var insertAviatorSessionSchema = createInsertSchema(aviatorSessions).omit({
  id: true,
  createdAt: true,
  completedAt: true
}).extend({
  multiplierHistory: z.array(z.object({
    time: z.number(),
    multiplier: z.number()
  }))
});
var forumPosts = pgTable("forum_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorName: text("author_name").notNull(),
  title: text("title").notNull(),
  contentType: text("content_type").notNull(),
  gameType: text("game_type").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertForumPostSchema = z.object({
  authorName: z.string().trim().min(2).max(50),
  title: z.string().trim().min(4).max(120),
  contentType: z.enum(["win_story", "lucky_numbers", "game_code", "suggestion"]),
  gameType: z.enum(GameType),
  content: z.string().trim().min(10).max(2e3)
}).strict();
var forumComments = pgTable("forum_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => forumPosts.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (table) => [
  index("forum_comments_post_id_idx").on(table.postId)
]);
var insertForumCommentSchema = z.object({
  postId: z.string().uuid(),
  authorName: z.string().trim().min(2).max(50),
  comment: z.string().trim().min(2).max(1e3)
}).strict();
var virtualWeeks = pgTable("virtual_weeks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weekNumber: integer("week_number").notNull(),
  totalWeeks: integer("total_weeks").notNull().default(35),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertVirtualWeekSchema = createInsertSchema(virtualWeeks).omit({
  id: true,
  createdAt: true
});
var contactInquiries = pgTable("contact_inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("general"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertContactInquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(30).optional(),
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10).max(5e3),
  type: z.enum(["general", "investor"]).default("general")
}).strict();

// server/database-storage.ts
var MAX_LIST_ROWS = 500;
var DatabaseStorage = class {
  db;
  catalogReady;
  constructor(connectionString) {
    this.db = drizzle(neon(connectionString));
  }
  ensureCatalog() {
    if (!this.catalogReady) {
      this.catalogReady = this.db.insert(games).values([...GAME_CATALOG]).onConflictDoNothing({ target: games.type }).then(() => void 0).catch((error) => {
        this.catalogReady = void 0;
        throw error;
      });
    }
    return this.catalogReady;
  }
  async getGame(id) {
    await this.ensureCatalog();
    return (await this.db.select().from(games).where(eq(games.id, id)).limit(1))[0];
  }
  async getGameByType(type) {
    await this.ensureCatalog();
    return (await this.db.select().from(games).where(eq(games.type, type)).limit(1))[0];
  }
  async getAllGames() {
    await this.ensureCatalog();
    return this.db.select().from(games).orderBy(games.name);
  }
  async createGame(game) {
    return (await this.db.insert(games).values(game).returning())[0];
  }
  async getBet(id) {
    return (await this.db.select().from(bets).where(eq(bets.id, id)).limit(1))[0];
  }
  async getAllBets() {
    return this.db.select().from(bets).orderBy(desc(bets.createdAt)).limit(MAX_LIST_ROWS);
  }
  async getBetsByGame(gameId) {
    return this.db.select().from(bets).where(eq(bets.gameId, gameId)).orderBy(desc(bets.createdAt)).limit(MAX_LIST_ROWS);
  }
  async createBet(bet) {
    return (await this.db.insert(bets).values({
      gameId: bet.gameId,
      selectedNumbers: JSON.stringify(bet.selectedNumbers),
      bonusNumber: bet.bonusNumber ?? null,
      stakeAmount: bet.stakeAmount,
      potentialWinning: bet.potentialWinning ?? null,
      status: "pending"
    }).returning())[0];
  }
  async getResult(id) {
    return (await this.db.select().from(results).where(eq(results.id, id)).limit(1))[0];
  }
  async getAllResults() {
    return this.db.select().from(results).orderBy(desc(results.drawDate)).limit(MAX_LIST_ROWS);
  }
  async getResultsByGame(gameId) {
    return this.db.select().from(results).where(eq(results.gameId, gameId)).orderBy(desc(results.drawDate)).limit(MAX_LIST_ROWS);
  }
  async getLatestResult(gameId) {
    return (await this.db.select().from(results).where(eq(results.gameId, gameId)).orderBy(desc(results.drawDate)).limit(1))[0];
  }
  async getFirstResultAfter(gameId, after) {
    return (await this.db.select().from(results).where(and(eq(results.gameId, gameId), gte(results.drawDate, after))).orderBy(asc(results.drawDate)).limit(1))[0];
  }
  async createResult(result) {
    return (await this.db.insert(results).values({
      ...result,
      winningNumbers: JSON.stringify(result.winningNumbers),
      bonusNumber: result.bonusNumber ?? null,
      odds: JSON.stringify(result.odds)
    }).returning())[0];
  }
  async getWinning(id) {
    return (await this.db.select().from(winnings).where(eq(winnings.id, id)).limit(1))[0];
  }
  async getWinningByBet(betId) {
    return (await this.db.select().from(winnings).where(eq(winnings.betId, betId)).limit(1))[0];
  }
  async getAllWinnings() {
    return this.db.select().from(winnings).orderBy(desc(winnings.createdAt)).limit(MAX_LIST_ROWS);
  }
  async createWinning(winning) {
    const inserted = await this.db.insert(winnings).values({
      ...winning,
      matchedNumbers: JSON.stringify(winning.matchedNumbers)
    }).onConflictDoNothing({ target: winnings.betId }).returning();
    return inserted[0] ?? await this.getWinningByBet(winning.betId);
  }
  async updateBetOutcome(betId, status, payout, resultId) {
    return (await this.db.update(bets).set({ status, payout, resultId }).where(eq(bets.id, betId)).returning())[0];
  }
  async getGameCode(code) {
    return (await this.db.select().from(gameCodes).where(eq(gameCodes.code, code.toUpperCase())).limit(1))[0];
  }
  async createGameCode(gameCode) {
    return (await this.db.insert(gameCodes).values({
      ...gameCode,
      code: gameCode.code.toUpperCase(),
      gameId: gameCode.gameId ?? null,
      expiresAt: gameCode.expiresAt ?? null,
      usesRemaining: gameCode.usesRemaining ?? null
    }).returning())[0];
  }
  async useGameCode(code) {
    const now = /* @__PURE__ */ new Date();
    const updated = await this.db.update(gameCodes).set({ usesRemaining: sql2`${gameCodes.usesRemaining} - 1` }).where(and(
      eq(gameCodes.code, code.toUpperCase()),
      or(isNull(gameCodes.expiresAt), gt(gameCodes.expiresAt, now)),
      gt(gameCodes.usesRemaining, 0)
    )).returning({ id: gameCodes.id });
    if (updated.length > 0) return true;
    const unlimited = await this.db.select({ id: gameCodes.id }).from(gameCodes).where(and(
      eq(gameCodes.code, code.toUpperCase()),
      or(isNull(gameCodes.expiresAt), gt(gameCodes.expiresAt, now)),
      isNull(gameCodes.usesRemaining)
    )).limit(1);
    return unlimited.length > 0;
  }
  async getAviatorSession(id) {
    return (await this.db.select().from(aviatorSessions).where(eq(aviatorSessions.id, id)).limit(1))[0];
  }
  async getAviatorSessionByBet(betId) {
    return (await this.db.select().from(aviatorSessions).where(eq(aviatorSessions.betId, betId)).limit(1))[0];
  }
  async createAviatorSession(session) {
    return (await this.db.insert(aviatorSessions).values({
      ...session,
      multiplierHistory: JSON.stringify(session.multiplierHistory)
    }).returning())[0];
  }
  async updateAviatorSession(id, updates) {
    const { id: _id, betId: _betId, createdAt: _createdAt, ...allowed } = updates;
    return (await this.db.update(aviatorSessions).set(allowed).where(eq(aviatorSessions.id, id)).returning())[0];
  }
  async getForumPost(id) {
    return (await this.db.select().from(forumPosts).where(eq(forumPosts.id, id)).limit(1))[0];
  }
  async getAllForumPosts() {
    return this.db.select().from(forumPosts).orderBy(desc(forumPosts.createdAt)).limit(100);
  }
  async getForumPostsByGameType(gameType) {
    return this.db.select().from(forumPosts).where(eq(forumPosts.gameType, gameType)).orderBy(desc(forumPosts.createdAt)).limit(100);
  }
  async createForumPost(post) {
    return (await this.db.insert(forumPosts).values(post).returning())[0];
  }
  async getForumComment(id) {
    return (await this.db.select().from(forumComments).where(eq(forumComments.id, id)).limit(1))[0];
  }
  async getForumCommentsByPost(postId) {
    return this.db.select().from(forumComments).where(eq(forumComments.postId, postId)).orderBy(forumComments.createdAt).limit(200);
  }
  async createForumComment(comment) {
    return (await this.db.insert(forumComments).values(comment).returning())[0];
  }
  async getContactInquiry(id) {
    return (await this.db.select().from(contactInquiries).where(eq(contactInquiries.id, id)).limit(1))[0];
  }
  async getAllContactInquiries() {
    return this.db.select().from(contactInquiries).orderBy(desc(contactInquiries.createdAt)).limit(MAX_LIST_ROWS);
  }
  async createContactInquiry(inquiry) {
    return (await this.db.insert(contactInquiries).values({
      ...inquiry,
      phone: inquiry.phone ?? null,
      type: inquiry.type ?? "general",
      status: "new"
    }).returning())[0];
  }
};

// server/storage.ts
var MemStorage = class {
  games;
  bets;
  results;
  winnings;
  gameCodes;
  aviatorSessions;
  forumPosts;
  forumComments;
  contactInquiries;
  constructor() {
    this.games = /* @__PURE__ */ new Map();
    this.bets = /* @__PURE__ */ new Map();
    this.results = /* @__PURE__ */ new Map();
    this.winnings = /* @__PURE__ */ new Map();
    this.gameCodes = /* @__PURE__ */ new Map();
    this.aviatorSessions = /* @__PURE__ */ new Map();
    this.forumPosts = /* @__PURE__ */ new Map();
    this.forumComments = /* @__PURE__ */ new Map();
    this.contactInquiries = /* @__PURE__ */ new Map();
    this.seedGames();
  }
  seedGames() {
    GAME_CATALOG.forEach((game) => {
      const id = randomUUID();
      this.games.set(id, {
        ...game,
        id,
        description: game.description ?? null,
        hasBonus: game.hasBonus ?? false
      });
    });
  }
  seedForumPosts() {
  }
  async getGame(id) {
    return this.games.get(id);
  }
  async getGameByType(type) {
    return Array.from(this.games.values()).find(
      (game) => game.type === type
    );
  }
  async getAllGames() {
    return Array.from(this.games.values());
  }
  async createGame(insertGame) {
    const id = randomUUID();
    const game = {
      ...insertGame,
      id,
      description: insertGame.description ?? null,
      hasBonus: insertGame.hasBonus ?? false
    };
    this.games.set(id, game);
    return game;
  }
  async getBet(id) {
    return this.bets.get(id);
  }
  async getAllBets() {
    return Array.from(this.bets.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  async getBetsByGame(gameId) {
    return Array.from(this.bets.values()).filter((bet) => bet.gameId === gameId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async createBet(insertBet) {
    const id = randomUUID();
    const bet = {
      id,
      gameId: insertBet.gameId,
      selectedNumbers: JSON.stringify(insertBet.selectedNumbers),
      bonusNumber: insertBet.bonusNumber ?? null,
      stakeAmount: insertBet.stakeAmount,
      potentialWinning: insertBet.potentialWinning ?? null,
      status: "pending",
      payout: null,
      resultId: null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.bets.set(id, bet);
    return bet;
  }
  async getResult(id) {
    return this.results.get(id);
  }
  async getAllResults() {
    return Array.from(this.results.values()).sort(
      (a, b) => new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime()
    );
  }
  async getResultsByGame(gameId) {
    return Array.from(this.results.values()).filter((result) => result.gameId === gameId).sort((a, b) => new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime());
  }
  async getLatestResult(gameId) {
    const results2 = await this.getResultsByGame(gameId);
    return results2[0];
  }
  async getFirstResultAfter(gameId, after) {
    return Array.from(this.results.values()).filter((result) => result.gameId === gameId && new Date(result.drawDate).getTime() >= after.getTime()).sort((left, right) => new Date(left.drawDate).getTime() - new Date(right.drawDate).getTime())[0];
  }
  async createResult(insertResult) {
    const id = randomUUID();
    const result = {
      id,
      gameId: insertResult.gameId,
      drawDate: insertResult.drawDate,
      winningNumbers: JSON.stringify(insertResult.winningNumbers),
      bonusNumber: insertResult.bonusNumber ?? null,
      odds: JSON.stringify(insertResult.odds)
    };
    this.results.set(id, result);
    return result;
  }
  async getWinning(id) {
    return this.winnings.get(id);
  }
  async getWinningByBet(betId) {
    return Array.from(this.winnings.values()).find(
      (winning) => winning.betId === betId
    );
  }
  async getAllWinnings() {
    return Array.from(this.winnings.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  async createWinning(insertWinning) {
    const id = randomUUID();
    const winning = {
      id,
      betId: insertWinning.betId,
      resultId: insertWinning.resultId,
      matchedNumbers: JSON.stringify(insertWinning.matchedNumbers),
      matchedCount: insertWinning.matchedCount,
      winningAmount: insertWinning.winningAmount,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.winnings.set(id, winning);
    return winning;
  }
  async updateBetOutcome(betId, status, payout, resultId) {
    const bet = this.bets.get(betId);
    if (!bet) return void 0;
    const updatedBet = {
      ...bet,
      status,
      payout,
      resultId
    };
    this.bets.set(betId, updatedBet);
    return updatedBet;
  }
  seedGameCodes() {
  }
  async getGameCode(code) {
    return this.gameCodes.get(code.toUpperCase());
  }
  async createGameCode(insertGameCode) {
    const id = randomUUID();
    const gameCode = {
      id,
      code: insertGameCode.code.toUpperCase(),
      gameId: insertGameCode.gameId ?? null,
      expiresAt: insertGameCode.expiresAt ?? null,
      usesRemaining: insertGameCode.usesRemaining ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.gameCodes.set(gameCode.code, gameCode);
    return gameCode;
  }
  async useGameCode(code) {
    const normalizedCode = code.toUpperCase();
    const gameCode = this.gameCodes.get(normalizedCode);
    if (!gameCode) return false;
    if (gameCode.expiresAt && new Date(gameCode.expiresAt) < /* @__PURE__ */ new Date()) {
      return false;
    }
    if (gameCode.usesRemaining !== null) {
      if (gameCode.usesRemaining <= 0) return false;
      const updatedCode = {
        ...gameCode,
        usesRemaining: gameCode.usesRemaining - 1
      };
      this.gameCodes.set(normalizedCode, updatedCode);
    }
    return true;
  }
  async getAviatorSession(id) {
    return this.aviatorSessions.get(id);
  }
  async getAviatorSessionByBet(betId) {
    return Array.from(this.aviatorSessions.values()).find(
      (session) => session.betId === betId
    );
  }
  async createAviatorSession(insertSession) {
    const id = randomUUID();
    const session = {
      id,
      betId: insertSession.betId,
      startMultiplier: insertSession.startMultiplier ?? 1,
      currentMultiplier: insertSession.currentMultiplier,
      crashMultiplier: insertSession.crashMultiplier,
      status: insertSession.status ?? "active",
      autoCashOutAt: insertSession.autoCashOutAt ?? null,
      cashedOutAt: insertSession.cashedOutAt ?? null,
      cashedOutAmount: insertSession.cashedOutAmount ?? null,
      multiplierHistory: JSON.stringify(insertSession.multiplierHistory),
      createdAt: /* @__PURE__ */ new Date(),
      completedAt: null
    };
    this.aviatorSessions.set(id, session);
    return session;
  }
  async updateAviatorSession(id, updates) {
    const session = this.aviatorSessions.get(id);
    if (!session) return void 0;
    const updatedSession = {
      ...session,
      ...updates
    };
    this.aviatorSessions.set(id, updatedSession);
    return updatedSession;
  }
  async getForumPost(id) {
    return this.forumPosts.get(id);
  }
  async getAllForumPosts() {
    return Array.from(this.forumPosts.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  async getForumPostsByGameType(gameType) {
    return Array.from(this.forumPosts.values()).filter((post) => post.gameType === gameType).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async createForumPost(insertPost) {
    const id = randomUUID();
    const post = {
      id,
      authorName: insertPost.authorName,
      title: insertPost.title,
      contentType: insertPost.contentType,
      gameType: insertPost.gameType,
      content: insertPost.content,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.forumPosts.set(id, post);
    return post;
  }
  async getForumComment(id) {
    return this.forumComments.get(id);
  }
  async getForumCommentsByPost(postId) {
    return Array.from(this.forumComments.values()).filter((comment) => comment.postId === postId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  async createForumComment(insertComment) {
    const id = randomUUID();
    const comment = {
      id,
      postId: insertComment.postId,
      authorName: insertComment.authorName,
      comment: insertComment.comment,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.forumComments.set(id, comment);
    return comment;
  }
  async getContactInquiry(id) {
    return this.contactInquiries.get(id);
  }
  async getAllContactInquiries() {
    return Array.from(this.contactInquiries.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async createContactInquiry(insertInquiry) {
    const id = randomUUID();
    const inquiry = {
      id,
      name: insertInquiry.name,
      email: insertInquiry.email,
      phone: insertInquiry.phone ?? null,
      subject: insertInquiry.subject,
      message: insertInquiry.message,
      type: insertInquiry.type ?? "general",
      status: "new",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.contactInquiries.set(id, inquiry);
    return inquiry;
  }
};
function createStorage() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl) return new DatabaseStorage(databaseUrl);
  if (process.env.PUBLIC_PREVIEW_MODE === "true") {
    return new MemStorage();
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required in production; refusing to use volatile in-memory storage");
  }
  return new MemStorage();
}
var storage = createStorage();

// server/game-logic.ts
var GameLogic = class {
  config;
  dailyStats;
  payoutEvents;
  winningMetadata;
  constructor(config) {
    this.config = {
      houseEdgePercentage: config?.houseEdgePercentage ?? 15,
      maxDailyPayoutRatio: config?.maxDailyPayoutRatio ?? 0.75,
      maxSingleWinMultiplier: config?.maxSingleWinMultiplier ?? 1e3
    };
    this.dailyStats = /* @__PURE__ */ new Map();
    this.payoutEvents = [];
    this.winningMetadata = /* @__PURE__ */ new Map();
  }
  getTodayKey() {
    return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  }
  getDailyStats() {
    const today = this.getTodayKey();
    if (!this.dailyStats.has(today)) {
      this.dailyStats.set(today, {
        date: today,
        totalStakes: 0,
        totalPayouts: 0,
        netProfit: 0,
        cappedPayouts: 0,
        totalBets: 0,
        totalWinnings: 0
      });
    }
    return this.dailyStats.get(today);
  }
  recordStake(amount) {
    const stats = this.getDailyStats();
    stats.totalStakes += amount;
    stats.netProfit += amount;
    stats.totalBets += 1;
  }
  calculateWinningAmount(baseWinning, stakeAmount, betId) {
    const stats = this.getDailyStats();
    const maxSingleWin = stakeAmount * this.config.maxSingleWinMultiplier;
    const finalAmount = Math.min(baseWinning, maxSingleWin);
    const singleWinCapApplied = finalAmount < baseWinning;
    const roundedFinal = Math.floor(finalAmount * 100) / 100;
    const metadata = {
      houseEdgeApplied: false,
      singleWinCapApplied,
      dailyCapApplied: false,
      cappedFromSingleWin: singleWinCapApplied ? baseWinning : void 0
    };
    this.winningMetadata.set(betId, metadata);
    if (singleWinCapApplied) {
      const delta = baseWinning - roundedFinal;
      this.payoutEvents.push({
        timestamp: /* @__PURE__ */ new Date(),
        amount: roundedFinal,
        cappedFrom: baseWinning,
        limitType: "single_win_cap"
      });
      stats.cappedPayouts += delta;
    }
    return {
      finalAmount: roundedFinal,
      metadata
    };
  }
  getWinningMetadata(betId) {
    return this.winningMetadata.get(betId);
  }
  recordPayout(amount) {
    const stats = this.getDailyStats();
    stats.totalPayouts += amount;
    stats.netProfit -= amount;
    stats.totalWinnings += 1;
    this.payoutEvents.push({
      timestamp: /* @__PURE__ */ new Date(),
      amount
    });
  }
  getPayoutEvents() {
    return [...this.payoutEvents];
  }
  getDailyStatsForDate(date) {
    const key = date || this.getTodayKey();
    return this.dailyStats.get(key);
  }
  getAllDailyStats() {
    return Array.from(this.dailyStats.values());
  }
  getConfig() {
    return { ...this.config };
  }
  updateConfig(config) {
    this.config = { ...this.config, ...config };
  }
  calculateAdjustedOdds(baseOdds) {
    const houseEdgeMultiplier = (100 - this.config.houseEdgePercentage) / 100;
    return baseOdds.map((odd) => {
      const adjustedOdd = odd * Math.pow(houseEdgeMultiplier, 1 / baseOdds.length);
      return Math.max(1, Math.floor(adjustedOdd * 100) / 100);
    });
  }
};
var gameLogic = new GameLogic({
  houseEdgePercentage: Number(process.env.HOUSE_EDGE_PERCENTAGE ?? 15),
  maxDailyPayoutRatio: Number(process.env.MAX_DAILY_PAYOUT_RATIO ?? 0.75),
  maxSingleWinMultiplier: Number(process.env.MAX_SINGLE_WIN_MULTIPLIER ?? 1e3)
});

// server/security.ts
import { createHash, timingSafeEqual } from "node:crypto";
function hashesMatch(left, right) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}
function requireAdmin(req, res, next) {
  const configuredKey = process.env.ADMIN_API_KEY?.trim();
  if (!configuredKey) {
    if (process.env.NODE_ENV !== "production") {
      next();
      return;
    }
    res.status(503).json({ error: "Operator access is not configured" });
    return;
  }
  const authorization = req.get("authorization");
  const bearer = authorization?.startsWith("Bearer ") ? authorization.slice(7) : void 0;
  const suppliedKey = req.get("x-admin-key") ?? bearer;
  if (!suppliedKey || !hashesMatch(configuredKey, suppliedKey)) {
    res.setHeader("WWW-Authenticate", "Bearer");
    res.status(401).json({ error: "Operator authentication required" });
    return;
  }
  next();
}
function isSameOrigin(req, origin) {
  try {
    return new URL(origin).host === req.get("host");
  } catch {
    return false;
  }
}

// server/validation.ts
function unique(values) {
  return new Set(values).size === values.length;
}
function validateBetForGame(bet, game) {
  const errors = [];
  const maxStake = Number(process.env.MAX_STAKE_AMOUNT ?? 1e6);
  if (bet.selectedNumbers.length !== game.numbersToSelect) {
    errors.push(`Select exactly ${game.numbersToSelect} numbers`);
  }
  if (!unique(bet.selectedNumbers)) errors.push("Selected numbers must be unique");
  if (bet.selectedNumbers.some((number) => number < game.minNumber || number > game.maxNumber)) {
    errors.push(`Selected numbers must be between ${game.minNumber} and ${game.maxNumber}`);
  }
  if (bet.stakeAmount > maxStake) errors.push(`Stake cannot exceed ${maxStake}`);
  if (game.hasBonus) {
    if (bet.bonusNumber === void 0) errors.push("A bonus number is required");
    if (bet.bonusNumber !== void 0 && (bet.bonusNumber < game.minNumber || bet.bonusNumber > game.maxNumber || bet.selectedNumbers.includes(bet.bonusNumber))) {
      errors.push("Bonus number must be in range and different from selected numbers");
    }
  } else if (bet.bonusNumber !== void 0) {
    errors.push("This game does not use a bonus number");
  }
  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: { ...bet, stakeAmount: Math.round(bet.stakeAmount * 100) / 100 }
  };
}
function validateResultForGame(result, game) {
  const errors = [];
  if (result.winningNumbers.length !== game.numbersToSelect) {
    errors.push(`Result must contain exactly ${game.numbersToSelect} numbers`);
  }
  if (!unique(result.winningNumbers)) errors.push("Winning numbers must be unique");
  if (result.winningNumbers.some((number) => number < game.minNumber || number > game.maxNumber)) {
    errors.push(`Winning numbers must be between ${game.minNumber} and ${game.maxNumber}`);
  }
  if (result.odds.length !== result.winningNumbers.length) {
    errors.push("Each winning number must have one corresponding odd");
  }
  if (result.odds.some((odd) => odd < game.minOdds || odd > game.maxOdds)) {
    errors.push(`Odds must be between ${game.minOdds} and ${game.maxOdds}`);
  }
  if (game.hasBonus && result.bonusNumber === void 0) errors.push("A bonus number is required");
  if (!game.hasBonus && result.bonusNumber !== void 0) errors.push("This game does not use a bonus number");
  if (result.bonusNumber !== void 0 && (result.bonusNumber < game.minNumber || result.bonusNumber > game.maxNumber || result.winningNumbers.includes(result.bonusNumber))) {
    errors.push("Bonus number must be in range and different from winning numbers");
  }
  return errors.length > 0 ? { ok: false, errors } : { ok: true, value: result };
}

// server/routes.ts
async function registerRoutes(app) {
  const publicPreviewMode = process.env.PUBLIC_PREVIEW_MODE === "true";
  const bettingEnabled = process.env.BETTING_ENABLED === "true" || process.env.NODE_ENV !== "production";
  const demoDrawsEnabled = process.env.DEMO_DRAW_GENERATION_ENABLED === "true" && process.env.NODE_ENV !== "production";
  app.get("/api/capabilities", (_req, res) => {
    res.json({
      bettingEnabled,
      communityPostingEnabled: process.env.COMMUNITY_POSTING_ENABLED === "true" || process.env.NODE_ENV !== "production",
      contactSubmissionsEnabled: !publicPreviewMode,
      realMoneyPaymentsEnabled: false
    });
  });
  app.get("/api/games", async (_req, res) => {
    try {
      const games2 = await storage.getAllGames();
      res.json(games2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch games" });
    }
  });
  app.get("/api/games/:type", async (req, res) => {
    try {
      const game = await storage.getGameByType(req.params.type);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch game" });
    }
  });
  app.post("/api/bets", async (req, res) => {
    try {
      if (!bettingEnabled) {
        return res.status(503).json({ error: "Bet placement is disabled until production compliance checks are complete" });
      }
      const validatedBet = insertBetSchema.parse(req.body);
      const game = await storage.getGame(validatedBet.gameId);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      const gameValidation = validateBetForGame(validatedBet, game);
      if (!gameValidation.ok) {
        return res.status(400).json({ error: "Invalid bet", details: gameValidation.errors });
      }
      gameLogic.recordStake(gameValidation.value.stakeAmount);
      const baseMaxWinning = validatedBet.selectedNumbers.length === game.numbersToSelect ? Math.pow(game.maxOdds, game.minMatches) * gameValidation.value.stakeAmount : gameValidation.value.stakeAmount;
      const theoreticalMaxWinning = Math.min(
        baseMaxWinning,
        gameLogic.getConfig().maxSingleWinMultiplier * gameValidation.value.stakeAmount
      );
      const bet = await storage.createBet({
        ...gameValidation.value,
        potentialWinning: Math.round(theoreticalMaxWinning * 100) / 100
      });
      res.status(201).json(bet);
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        return res.status(400).json({ error: "Invalid bet data", details: error });
      }
      res.status(500).json({ error: "Failed to create bet" });
    }
  });
  app.get("/api/bets", requireAdmin, async (_req, res) => {
    try {
      const bets2 = await storage.getAllBets();
      res.json(bets2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bets" });
    }
  });
  app.get("/api/bets/:id", async (req, res) => {
    try {
      const bet = await storage.getBet(req.params.id);
      if (!bet) {
        return res.status(404).json({ error: "Bet not found" });
      }
      res.json(bet);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bet" });
    }
  });
  app.get("/api/bets/search/:code", async (req, res) => {
    try {
      const code = req.params.code.toLowerCase().trim();
      if (!/^[0-9a-f-]{36}$/.test(code)) {
        return res.status(400).json({ error: "Enter the complete 36-character ticket ID" });
      }
      const foundBet = await storage.getBet(code);
      if (!foundBet) {
        return res.status(404).json({ error: "Bet not found with that code" });
      }
      res.json({ betId: foundBet.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to search for bet" });
    }
  });
  app.post("/api/results", requireAdmin, async (req, res) => {
    try {
      const validatedResult = insertResultSchema.parse(req.body);
      const game = await storage.getGame(validatedResult.gameId);
      if (!game) return res.status(404).json({ error: "Game not found" });
      const gameValidation = validateResultForGame(validatedResult, game);
      if (!gameValidation.ok) {
        return res.status(400).json({ error: "Invalid result", details: gameValidation.errors });
      }
      const result = await storage.createResult(gameValidation.value);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        return res.status(400).json({ error: "Invalid result data", details: error });
      }
      res.status(500).json({ error: "Failed to create result" });
    }
  });
  app.get("/api/results", async (_req, res) => {
    try {
      const results2 = await storage.getAllResults();
      res.json(results2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });
  app.get("/api/results/game/:gameId", async (req, res) => {
    try {
      const results2 = await storage.getResultsByGame(req.params.gameId);
      res.json(results2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });
  app.get("/api/results/game/:gameId/latest", async (req, res) => {
    try {
      const result = await storage.getLatestResult(req.params.gameId);
      if (!result) {
        return res.status(404).json({ error: "No results found for this game" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest result" });
    }
  });
  app.post("/api/winnings/check/:betId", async (req, res) => {
    try {
      const bet = await storage.getBet(req.params.betId);
      if (!bet) {
        return res.status(404).json({ error: "Bet not found" });
      }
      const result = await storage.getFirstResultAfter(bet.gameId, new Date(bet.createdAt));
      if (!result) {
        return res.status(404).json({ error: "No results available for this game yet" });
      }
      const selectedNumbers = JSON.parse(bet.selectedNumbers);
      const winningNumbers = JSON.parse(result.winningNumbers);
      const odds = JSON.parse(result.odds);
      const uniqueSelectedNumbers = Array.from(new Set(selectedNumbers));
      const matchedNumbers = uniqueSelectedNumbers.filter((num) => winningNumbers.includes(num));
      const matchedCount = matchedNumbers.length;
      const bonusMatched = bet.bonusNumber !== null && bet.bonusNumber === result.bonusNumber;
      const game = await storage.getGame(bet.gameId);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      const existingWinning = await storage.getWinningByBet(bet.id);
      if (existingWinning && matchedCount >= game.minMatches) {
        const metadata = gameLogic.getWinningMetadata(bet.id);
        const houseEdgeApplied2 = metadata?.houseEdgeApplied ?? false;
        const singleWinCapApplied = metadata?.singleWinCapApplied ?? false;
        const dailyCapApplied = metadata?.dailyCapApplied ?? false;
        const limitApplied2 = singleWinCapApplied || dailyCapApplied;
        let message = void 0;
        if (singleWinCapApplied && dailyCapApplied) {
          if (existingWinning.winningAmount === 0) {
            message = "Congratulations! You matched the winning numbers, but both the maximum single win limit and today's daily payout limit have been reached.";
          } else {
            message = "Congratulations! Your winning has been capped by both the maximum single win limit and daily payout limits.";
          }
        } else if (dailyCapApplied) {
          if (existingWinning.winningAmount === 0) {
            message = "Congratulations! You matched the winning numbers, but today's daily payout limit has been reached. Please check back tomorrow.";
          } else {
            message = "Congratulations! Your winning has been capped due to daily payout limits.";
          }
        } else if (singleWinCapApplied) {
          message = "Congratulations! Your winning has been capped due to maximum single win limits.";
        } else if (houseEdgeApplied2) {
          message = "Congratulations! You won!";
        }
        return res.json({
          won: true,
          winning: existingWinning,
          bonusMatched,
          houseEdgeApplied: houseEdgeApplied2,
          limitApplied: limitApplied2,
          singleWinCapApplied,
          dailyCapApplied,
          message
        });
      }
      let winningAmount = 0;
      let houseEdgeApplied = false;
      let limitApplied = false;
      if (matchedCount >= game.minMatches) {
        const matchedOdds = matchedNumbers.map((num) => {
          const index2 = winningNumbers.indexOf(num);
          return odds[index2] || 1;
        });
        let baseWinning = matchedOdds.reduce((acc, odd) => acc * odd, 1) * bet.stakeAmount;
        if (bonusMatched && game.hasBonus) {
          baseWinning *= 1.5;
        }
        const winningResult = gameLogic.calculateWinningAmount(baseWinning, bet.stakeAmount, bet.id);
        winningAmount = winningResult.finalAmount;
        houseEdgeApplied = winningResult.metadata.houseEdgeApplied;
        const singleWinCapApplied = winningResult.metadata.singleWinCapApplied;
        const dailyCapApplied = winningResult.metadata.dailyCapApplied;
        limitApplied = singleWinCapApplied || dailyCapApplied;
        if (winningAmount > 0) {
          gameLogic.recordPayout(winningAmount);
        }
        const winning = await storage.createWinning({
          betId: bet.id,
          resultId: result.id,
          matchedNumbers,
          matchedCount,
          winningAmount
        });
        await storage.updateBetOutcome(bet.id, "won", winningAmount, result.id);
        let message = void 0;
        if (singleWinCapApplied && dailyCapApplied) {
          if (winningAmount === 0) {
            message = "Congratulations! You matched the winning numbers, but both the maximum single win limit and today's daily payout limit have been reached.";
          } else {
            message = "Congratulations! Your winning has been capped by both the maximum single win limit and daily payout limits.";
          }
        } else if (dailyCapApplied) {
          if (winningAmount === 0) {
            message = "Congratulations! You matched the winning numbers, but today's daily payout limit has been reached. Please check back tomorrow.";
          } else {
            message = "Congratulations! Your winning has been capped due to daily payout limits.";
          }
        } else if (singleWinCapApplied) {
          message = "Congratulations! Your winning has been capped due to maximum single win limits.";
        } else if (houseEdgeApplied) {
          message = "Congratulations! You won!";
        }
        return res.json({
          won: true,
          winning,
          bonusMatched,
          houseEdgeApplied,
          limitApplied,
          singleWinCapApplied,
          dailyCapApplied,
          message
        });
      }
      await storage.updateBetOutcome(bet.id, "lost", 0, result.id);
      res.json({
        won: false,
        matchedCount,
        matchedNumbers,
        bonusMatched,
        message: `Matched ${matchedCount} numbers, need at least ${game.minMatches} to win`
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check winning" });
    }
  });
  app.get("/api/winnings", requireAdmin, async (_req, res) => {
    try {
      const winnings2 = await storage.getAllWinnings();
      res.json(winnings2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch winnings" });
    }
  });
  app.post("/api/results/generate/:gameId", requireAdmin, async (req, res) => {
    try {
      if (!demoDrawsEnabled) {
        return res.status(403).json({ error: "Demo draw generation is disabled" });
      }
      const game = await storage.getGame(req.params.gameId);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      const winningNumbers = [];
      while (winningNumbers.length < game.numbersToSelect) {
        const randomNum = randomInt(game.minNumber, game.maxNumber + 1);
        if (!winningNumbers.includes(randomNum)) {
          winningNumbers.push(randomNum);
        }
      }
      const odds = winningNumbers.map(
        () => randomInt(Math.ceil(game.minOdds * 100), Math.floor(game.maxOdds * 100) + 1) / 100
      );
      let bonusNumber;
      if (game.hasBonus) {
        do {
          bonusNumber = randomInt(game.minNumber, game.maxNumber + 1);
        } while (winningNumbers.includes(bonusNumber));
      }
      const result = await storage.createResult({
        gameId: game.id,
        drawDate: /* @__PURE__ */ new Date(),
        winningNumbers,
        bonusNumber,
        odds
      });
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate result" });
    }
  });
  app.get("/api/stats/daily", requireAdmin, async (_req, res) => {
    try {
      const stats = gameLogic.getDailyStatsForDate();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily stats" });
    }
  });
  app.get("/api/stats/all", requireAdmin, async (_req, res) => {
    try {
      const stats = gameLogic.getAllDailyStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });
  app.get("/api/config", requireAdmin, async (_req, res) => {
    try {
      const config = gameLogic.getConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch config" });
    }
  });
  app.put("/api/config", requireAdmin, async (req, res) => {
    try {
      if (process.env.NODE_ENV === "production") {
        return res.status(405).json({ error: "Runtime configuration is immutable in production" });
      }
      const update = z2.object({
        houseEdgePercentage: z2.number().min(0).max(50).optional(),
        maxDailyPayoutRatio: z2.number().min(0).max(1).optional(),
        maxSingleWinMultiplier: z2.number().positive().max(1e6).optional()
      }).strict().parse(req.body);
      gameLogic.updateConfig(update);
      const config = gameLogic.getConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to update config" });
    }
  });
  app.get("/api/bets/:id/outcome", async (req, res) => {
    try {
      const bet = await storage.getBet(req.params.id);
      if (!bet) {
        return res.status(404).json({ error: "Bet not found" });
      }
      const game = await storage.getGame(bet.gameId);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      let result = null;
      let winning = null;
      let status = bet.status;
      let outcome = bet.status;
      if (bet.resultId) {
        result = await storage.getResult(bet.resultId);
        winning = await storage.getWinningByBet(bet.id);
        status = bet.status;
        outcome = bet.status;
      }
      res.json({
        bet,
        game,
        result,
        winning,
        outcome,
        status
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bet outcome" });
    }
  });
  app.get("/api/bets/:id/ticket", async (req, res) => {
    try {
      const bet = await storage.getBet(req.params.id);
      if (!bet) {
        return res.status(404).json({ error: "Bet not found" });
      }
      const game = await storage.getGame(bet.gameId);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      let result = null;
      let winning = null;
      if (bet.resultId) {
        result = await storage.getResult(bet.resultId);
        winning = await storage.getWinningByBet(bet.id);
      }
      const ticket = {
        ticketId: bet.id,
        gameName: game.name,
        gameType: game.type,
        selectedNumbers: JSON.parse(bet.selectedNumbers),
        bonusNumber: bet.bonusNumber,
        stakeAmount: bet.stakeAmount,
        potentialWinning: bet.potentialWinning,
        status: bet.status,
        payout: bet.payout,
        createdAt: bet.createdAt,
        result: result ? {
          winningNumbers: JSON.parse(result.winningNumbers),
          bonusNumber: result.bonusNumber,
          drawDate: result.drawDate
        } : null,
        winning: winning ? {
          matchedNumbers: JSON.parse(winning.matchedNumbers),
          matchedCount: winning.matchedCount,
          winningAmount: winning.winningAmount
        } : null
      };
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ticket" });
    }
  });
  app.post("/api/codes/redeem", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code || typeof code !== "string") {
        return res.status(400).json({ error: "Invalid code" });
      }
      const gameCode = await storage.getGameCode(code);
      if (!gameCode) {
        return res.status(404).json({ error: "Code not found" });
      }
      const success = await storage.useGameCode(code);
      if (!success) {
        return res.status(400).json({ error: "Code expired or no uses remaining" });
      }
      const game = gameCode.gameId ? await storage.getGame(gameCode.gameId) : null;
      res.json({
        success: true,
        message: "Code redeemed successfully",
        game,
        code: gameCode
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to redeem code" });
    }
  });
  app.post("/api/codes", requireAdmin, async (req, res) => {
    try {
      const validatedCode = insertGameCodeSchema.parse(req.body);
      const gameCode = await storage.createGameCode(validatedCode);
      res.status(201).json(gameCode);
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        return res.status(400).json({ error: "Invalid code data", details: error });
      }
      res.status(500).json({ error: "Failed to create code" });
    }
  });
  app.post("/api/aviator/session", requireAdmin, async (req, res) => {
    try {
      const validatedSession = insertAviatorSessionSchema.parse(req.body);
      const session = await storage.createAviatorSession(validatedSession);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        return res.status(400).json({ error: "Invalid session data", details: error });
      }
      res.status(500).json({ error: "Failed to create aviator session" });
    }
  });
  app.get("/api/aviator/session/:betId", async (req, res) => {
    try {
      const session = await storage.getAviatorSessionByBet(req.params.betId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch aviator session" });
    }
  });
  app.post("/api/aviator/cashout/:sessionId", async (req, res) => {
    try {
      const session = await storage.getAviatorSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      if (session.status !== "active") {
        return res.status(400).json({ error: "Session is not active" });
      }
      const multiplier = session.currentMultiplier;
      if (multiplier >= session.crashMultiplier) {
        return res.status(409).json({ error: "This session has already crashed" });
      }
      const bet = await storage.getBet(session.betId);
      if (!bet) {
        return res.status(404).json({ error: "Bet not found" });
      }
      const cashedOutAmount = bet.stakeAmount * multiplier;
      const updatedSession = await storage.updateAviatorSession(req.params.sessionId, {
        status: "cashed_out",
        cashedOutAt: multiplier,
        cashedOutAmount,
        completedAt: /* @__PURE__ */ new Date()
      });
      await storage.updateBetOutcome(session.betId, "won", cashedOutAmount, null);
      res.json({
        session: updatedSession,
        cashedOutAmount
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to cash out" });
    }
  });
  app.post("/api/aviator/crash/:sessionId", requireAdmin, async (req, res) => {
    try {
      const session = await storage.getAviatorSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      const updatedSession = await storage.updateAviatorSession(req.params.sessionId, {
        status: "crashed",
        completedAt: /* @__PURE__ */ new Date()
      });
      await storage.updateBetOutcome(session.betId, "lost", 0, null);
      res.json({ session: updatedSession });
    } catch (error) {
      res.status(500).json({ error: "Failed to complete aviator session" });
    }
  });
  app.get("/api/forum/posts", async (req, res) => {
    try {
      const { gameType } = req.query;
      const posts = gameType ? await storage.getForumPostsByGameType(gameType) : await storage.getAllForumPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch forum posts" });
    }
  });
  app.get("/api/forum/posts/:id", async (req, res) => {
    try {
      const post = await storage.getForumPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });
  app.post("/api/forum/posts", async (req, res) => {
    try {
      if (process.env.COMMUNITY_POSTING_ENABLED !== "true" && process.env.NODE_ENV === "production") {
        return res.status(503).json({ error: "Community posting is temporarily disabled" });
      }
      const validatedPost = insertForumPostSchema.parse(req.body);
      const post = await storage.createForumPost(validatedPost);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        return res.status(400).json({ error: "Invalid post data", details: error });
      }
      res.status(500).json({ error: "Failed to create post" });
    }
  });
  app.get("/api/forum/posts/:postId/comments", async (req, res) => {
    try {
      const comments = await storage.getForumCommentsByPost(req.params.postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });
  app.post("/api/forum/comments", async (req, res) => {
    try {
      if (process.env.COMMUNITY_POSTING_ENABLED !== "true" && process.env.NODE_ENV === "production") {
        return res.status(503).json({ error: "Community posting is temporarily disabled" });
      }
      const validatedComment = insertForumCommentSchema.parse(req.body);
      const comment = await storage.createForumComment(validatedComment);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        return res.status(400).json({ error: "Invalid comment data", details: error });
      }
      res.status(500).json({ error: "Failed to create comment" });
    }
  });
  app.post("/api/contact", async (req, res) => {
    try {
      if (publicPreviewMode) {
        return res.status(503).json({ error: "Contact submissions are unavailable in public preview mode" });
      }
      const validatedInquiry = insertContactInquirySchema.parse(req.body);
      const inquiry = await storage.createContactInquiry(validatedInquiry);
      res.status(202).json({ accepted: true, reference: inquiry.id });
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        return res.status(400).json({ error: "Invalid contact data", details: error });
      }
      res.status(500).json({ error: "Failed to submit contact inquiry" });
    }
  });
  app.get("/api/contact", requireAdmin, async (_req, res) => {
    try {
      const inquiries = await storage.getAllContactInquiries();
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contact inquiries" });
    }
  });
}

// server/app.ts
var FIFTEEN_MINUTES = 15 * 60 * 1e3;
function corsMiddleware() {
  const configuredOrigins = new Set(
    (process.env.ALLOWED_ORIGINS ?? "").split(",").map((origin) => origin.trim()).filter(Boolean)
  );
  return (req, res, next) => {
    const origin = req.get("origin");
    if (!origin) {
      next();
      return;
    }
    if (!configuredOrigins.has(origin) && !isSameOrigin(req, origin)) {
      res.status(403).json({ error: "Origin is not allowed" });
      return;
    }
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Admin-Key,X-Request-Id");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  };
}
async function createApplication() {
  const app = express();
  app.disable("x-powered-by");
  if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);
  app.use((req, res, next) => {
    const requestId = req.get("x-request-id")?.slice(0, 100) || randomUUID2();
    res.setHeader("X-Request-Id", requestId);
    next();
  });
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"]
      }
    },
    crossOriginResourcePolicy: { policy: "same-site" }
  }));
  app.use(compression());
  app.use(corsMiddleware());
  app.use(express.json({ limit: "32kb" }));
  app.use(express.urlencoded({ extended: false, limit: "16kb" }));
  app.use("/api", rateLimit({
    windowMs: FIFTEEN_MINUTES,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many requests; please try again later" }
  }));
  app.use(["/api/bets", "/api/winnings", "/api/contact"], (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store, private");
    next();
  });
  app.use("/api/bets", rateLimit({
    windowMs: FIFTEEN_MINUTES,
    limit: 30,
    skip: (req) => req.method !== "POST",
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many bet requests; please try again later" }
  }));
  app.use(["/api/contact", "/api/forum"], rateLimit({
    windowMs: 60 * 60 * 1e3,
    limit: 20,
    skip: (req) => req.method === "GET",
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many submissions; please try again later" }
  }));
  app.get("/api/health", async (_req, res) => {
    try {
      await storage.getAllGames();
      res.setHeader("Cache-Control", "no-store");
      res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    } catch {
      res.status(503).json({ status: "unavailable" });
    }
  });
  app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on("finish", () => {
      if (req.path.startsWith("/api") && process.env.NODE_ENV !== "test") {
        const entry = {
          method: req.method,
          path: req.path,
          status: res.statusCode,
          durationMs: Date.now() - startedAt,
          requestId: res.getHeader("X-Request-Id")
        };
        console.info(JSON.stringify(entry));
      }
    });
    next();
  });
  await registerRoutes(app);
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "API route not found" });
  });
  const errorHandler = (error, _req, res, _next) => {
    console.error(error);
    if (res.headersSent) return;
    res.status(500).json({ error: "Internal server error" });
  };
  app.use(errorHandler);
  return app;
}

// server/vercel-handler.ts
var application = createApplication();
async function handler(req, res) {
  const app = await application;
  return app(req, res);
}
export {
  handler as default
};
