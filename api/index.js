// server/app.ts
import compression from "compression";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { randomUUID as randomUUID2 } from "node:crypto";

// server/routes.ts
import { randomInt as randomInt2 } from "node:crypto";
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
  isDemo: boolean("is_demo").notNull().default(false),
  demoSessionId: varchar("demo_session_id"),
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
  odds: text("odds").notNull(),
  isDemo: boolean("is_demo").notNull().default(false)
}, (table) => [
  index("results_game_draw_idx").on(table.gameId, table.drawDate)
]);
var insertResultSchema = z.object({
  gameId: z.string().uuid(),
  drawDate: z.coerce.date(),
  winningNumbers: z.array(z.number().int()).min(1).max(10),
  bonusNumber: z.number().int().optional(),
  odds: z.array(z.number().finite().positive()).min(1).max(10),
  isDemo: z.boolean().optional()
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
var platformSettings = pgTable("platform_settings", {
  id: text("id").primaryKey(),
  bettingEnabled: boolean("betting_enabled").notNull().default(false),
  communityPostingEnabled: boolean("community_posting_enabled").notNull().default(false),
  contactSubmissionsEnabled: boolean("contact_submissions_enabled").notNull().default(false),
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  demoModeEnabled: boolean("demo_mode_enabled").notNull().default(false),
  houseEdgePercentage: numeric("house_edge_percentage", { precision: 5, scale: 2, mode: "number" }).notNull().default(15),
  maxDailyPayoutRatio: numeric("max_daily_payout_ratio", { precision: 5, scale: 4, mode: "number" }).notNull().default(0.75),
  maxSingleWinMultiplier: numeric("max_single_win_multiplier", { precision: 12, scale: 2, mode: "number" }).notNull().default(1e3),
  updatedBy: text("updated_by").notNull().default("system"),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var insertPlatformSettingsSchema = createInsertSchema(platformSettings);
var complianceGates = pgTable("compliance_gates", {
  key: text("key").primaryKey(),
  category: text("category").notNull(),
  label: text("label").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  evidence: text("evidence"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var insertComplianceGateSchema = createInsertSchema(complianceGates);
var operatorAuditLogs = pgTable("operator_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  target: text("target").notNull(),
  details: text("details").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (table) => [
  index("operator_audit_logs_created_at_idx").on(table.createdAt)
]);
var insertOperatorAuditLogSchema = createInsertSchema(operatorAuditLogs).omit({
  id: true,
  createdAt: true
});
var demoWallets = pgTable("demo_wallets", {
  sessionId: varchar("session_id").primaryKey(),
  balance: numeric("balance", { precision: 14, scale: 2, mode: "number" }).notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var demoLedger = pgTable("demo_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => demoWallets.sessionId, { onDelete: "cascade" }),
  type: text("type").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2, mode: "number" }).notNull(),
  balanceAfter: numeric("balance_after", { precision: 14, scale: 2, mode: "number" }).notNull(),
  reference: text("reference"),
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (table) => [
  index("demo_ledger_session_created_idx").on(table.sessionId, table.createdAt)
]);

// server/control-plane.ts
var PLATFORM_SETTINGS_ID = "global";
var COMPLIANCE_GATE_DEFINITIONS = [
  {
    key: "licensing",
    category: "Legal",
    label: "Gambling licences and legal opinions",
    description: "Applicable licences and jurisdiction-by-jurisdiction legal approvals are current and documented."
  },
  {
    key: "kyc_aml",
    category: "Compliance",
    label: "KYC, age verification, sanctions and AML",
    description: "Identity, age, sanctions, AML, source-of-funds and regulatory-reporting controls are integrated and tested."
  },
  {
    key: "geofencing",
    category: "Compliance",
    label: "Geolocation and geofencing",
    description: "Jurisdiction controls, VPN/proxy policy and location evidence have been approved and verified."
  },
  {
    key: "payments_ledger",
    category: "Finance",
    label: "Payments, player funds and ledger",
    description: "Payment provider, withdrawals, reconciliation, chargebacks and audited segregated-funds accounting are operational."
  },
  {
    key: "rng_draws",
    category: "Games",
    label: "Certified RNG and draw publication",
    description: "Independent game certification and a signed, immutable draw-publication process are in place."
  },
  {
    key: "responsible_gaming",
    category: "Player safety",
    label: "Responsible-gaming controls",
    description: "Limits, cooling-off, self-exclusion, reality checks, affordability interventions and support escalation are tested."
  },
  {
    key: "player_identity",
    category: "Security",
    label: "Player accounts and session security",
    description: "Authenticated player ownership, MFA/recovery, device controls and consent workflows are production-ready."
  },
  {
    key: "legal_content",
    category: "Legal",
    label: "Terms, privacy and complaints",
    description: "Counsel-approved terms, rules, payout policy, privacy/cookies, complaints/ADR and retention policies are published."
  },
  {
    key: "security_assurance",
    category: "Security",
    label: "Independent security assurance",
    description: "Penetration testing, threat model, dependency review, backups, incident exercises and operational monitoring are signed off."
  },
  {
    key: "community_safety",
    category: "Community",
    label: "Community moderation and abuse handling",
    description: "Authenticated identities, reporting, blocking, moderation and escalation processes are operational."
  },
  {
    key: "resilience",
    category: "Operations",
    label: "Load, failover and settlement integrity",
    description: "Load, failover, concurrency and settlement-idempotency tests pass against the selected providers and database."
  }
];
function initialPlatformSettings() {
  return {
    id: PLATFORM_SETTINGS_ID,
    bettingEnabled: process.env.BETTING_ENABLED === "true" && process.env.NODE_ENV !== "production",
    communityPostingEnabled: process.env.COMMUNITY_POSTING_ENABLED === "true" && process.env.NODE_ENV !== "production",
    contactSubmissionsEnabled: process.env.PUBLIC_PREVIEW_MODE !== "true" && process.env.NODE_ENV !== "production",
    maintenanceMode: false,
    demoModeEnabled: process.env.DEMO_MODE_ENABLED === "true",
    houseEdgePercentage: Number(process.env.HOUSE_EDGE_PERCENTAGE ?? 15),
    maxDailyPayoutRatio: Number(process.env.MAX_DAILY_PAYOUT_RATIO ?? 0.75),
    maxSingleWinMultiplier: Number(process.env.MAX_SINGLE_WIN_MULTIPLIER ?? 1e3),
    updatedBy: "system",
    updatedAt: /* @__PURE__ */ new Date()
  };
}
function initialComplianceGates() {
  return COMPLIANCE_GATE_DEFINITIONS.map((gate) => ({
    ...gate,
    status: "pending",
    evidence: null,
    reviewedBy: null,
    reviewedAt: null,
    updatedAt: /* @__PURE__ */ new Date()
  }));
}
function infrastructureReadiness() {
  return {
    persistentDatabase: Boolean(process.env.DATABASE_URL?.trim()),
    operatorAuthentication: Boolean(process.env.ADMIN_API_KEY?.trim()) || process.env.NODE_ENV !== "production",
    publicPreviewMode: process.env.PUBLIC_PREVIEW_MODE === "true"
  };
}
function incompleteLaunchGates(gates) {
  const statusByKey = new Map(gates.map((gate) => [gate.key, gate.status]));
  return COMPLIANCE_GATE_DEFINITIONS.filter((gate) => statusByKey.get(gate.key) !== "complete").map((gate) => gate.key);
}
function launchBlockers(gates, infrastructure) {
  const blockers = incompleteLaunchGates(gates);
  if (!infrastructure.persistentDatabase) blockers.unshift("persistent_database");
  if (!infrastructure.operatorAuthentication) blockers.unshift("operator_authentication");
  if (infrastructure.publicPreviewMode) blockers.unshift("public_preview_mode");
  return blockers;
}
function operationalCapabilities(settings, gates, infrastructure) {
  const maintenanceMode = settings.maintenanceMode;
  const allLaunchGatesComplete = launchBlockers(gates, infrastructure).length === 0;
  const communityReady = gates.some((gate) => gate.key === "community_safety" && gate.status === "complete") && gates.some((gate) => gate.key === "player_identity" && gate.status === "complete");
  return {
    bettingEnabled: !maintenanceMode && allLaunchGatesComplete && settings.bettingEnabled,
    demoModeEnabled: !maintenanceMode && settings.demoModeEnabled,
    communityPostingEnabled: !maintenanceMode && !infrastructure.publicPreviewMode && communityReady && settings.communityPostingEnabled,
    contactSubmissionsEnabled: !maintenanceMode && !infrastructure.publicPreviewMode && settings.contactSubmissionsEnabled,
    // This codebase does not yet contain a payment-provider or audited-ledger implementation.
    realMoneyPaymentsEnabled: false,
    maintenanceMode
  };
}

// server/database-storage.ts
var MAX_LIST_ROWS = 500;
var DatabaseStorage = class {
  db;
  catalogReady;
  controlPlaneReady;
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
  ensureControlPlane() {
    if (!this.controlPlaneReady) {
      this.controlPlaneReady = Promise.all([
        this.db.insert(platformSettings).values(initialPlatformSettings()).onConflictDoNothing({ target: platformSettings.id }),
        this.db.insert(complianceGates).values(initialComplianceGates()).onConflictDoNothing({ target: complianceGates.key })
      ]).then(() => void 0).catch((error) => {
        this.controlPlaneReady = void 0;
        throw error;
      });
    }
    return this.controlPlaneReady;
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
      status: "pending",
      isDemo: bet.isDemo ?? false,
      demoSessionId: bet.demoSessionId ?? null
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
  async getFirstResultAfter(gameId, after, isDemo = false) {
    return (await this.db.select().from(results).where(and(eq(results.gameId, gameId), eq(results.isDemo, isDemo), gte(results.drawDate, after))).orderBy(asc(results.drawDate)).limit(1))[0];
  }
  async createResult(result) {
    return (await this.db.insert(results).values({
      ...result,
      winningNumbers: JSON.stringify(result.winningNumbers),
      bonusNumber: result.bonusNumber ?? null,
      odds: JSON.stringify(result.odds),
      isDemo: result.isDemo ?? false
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
  async getPlatformSettings() {
    await this.ensureControlPlane();
    return (await this.db.select().from(platformSettings).where(eq(platformSettings.id, PLATFORM_SETTINGS_ID)).limit(1))[0];
  }
  async updatePlatformSettings(update) {
    await this.ensureControlPlane();
    const { id: _id, ...allowed } = update;
    return (await this.db.update(platformSettings).set({ ...allowed, updatedAt: /* @__PURE__ */ new Date() }).where(eq(platformSettings.id, PLATFORM_SETTINGS_ID)).returning())[0];
  }
  async getComplianceGates() {
    await this.ensureControlPlane();
    return this.db.select().from(complianceGates).orderBy(complianceGates.category, complianceGates.label);
  }
  async updateComplianceGate(key, update) {
    await this.ensureControlPlane();
    const { key: _key, ...allowed } = update;
    return (await this.db.update(complianceGates).set({ ...allowed, updatedAt: /* @__PURE__ */ new Date() }).where(eq(complianceGates.key, key)).returning())[0];
  }
  async getOperatorAuditLogs() {
    await this.ensureControlPlane();
    return this.db.select().from(operatorAuditLogs).orderBy(desc(operatorAuditLogs.createdAt)).limit(100);
  }
  async createOperatorAuditLog(log) {
    await this.ensureControlPlane();
    return (await this.db.insert(operatorAuditLogs).values(log).returning())[0];
  }
  async getDemoWallet(sessionId) {
    await this.db.insert(demoWallets).values({ sessionId, balance: 0 }).onConflictDoNothing({ target: demoWallets.sessionId });
    return (await this.db.select().from(demoWallets).where(eq(demoWallets.sessionId, sessionId)).limit(1))[0];
  }
  async adjustDemoWallet(sessionId, amount, type, reference) {
    const wallet = await this.getDemoWallet(sessionId);
    const balance = Math.round((wallet.balance + amount) * 100) / 100;
    if (balance < 0 || balance > 1e6) return void 0;
    const updated = (await this.db.update(demoWallets).set({ balance, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(demoWallets.sessionId, sessionId), eq(demoWallets.balance, wallet.balance))).returning())[0];
    if (!updated) return void 0;
    await this.db.insert(demoLedger).values({
      sessionId,
      type,
      amount,
      balanceAfter: balance,
      reference: reference ?? null
    });
    return updated;
  }
  async getDemoLedger(sessionId) {
    return this.db.select().from(demoLedger).where(eq(demoLedger.sessionId, sessionId)).orderBy(desc(demoLedger.createdAt)).limit(50);
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
  platformSettings;
  complianceGates;
  operatorAuditLogs;
  demoWallets;
  demoLedger;
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
    this.platformSettings = initialPlatformSettings();
    this.complianceGates = new Map(initialComplianceGates().map((gate) => [gate.key, gate]));
    this.operatorAuditLogs = [];
    this.demoWallets = /* @__PURE__ */ new Map();
    this.demoLedger = [];
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
      isDemo: insertBet.isDemo ?? false,
      demoSessionId: insertBet.demoSessionId ?? null,
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
  async getFirstResultAfter(gameId, after, isDemo = false) {
    return Array.from(this.results.values()).filter((result) => result.gameId === gameId && result.isDemo === isDemo && new Date(result.drawDate).getTime() >= after.getTime()).sort((left, right) => new Date(left.drawDate).getTime() - new Date(right.drawDate).getTime())[0];
  }
  async createResult(insertResult) {
    const id = randomUUID();
    const result = {
      id,
      gameId: insertResult.gameId,
      drawDate: insertResult.drawDate,
      winningNumbers: JSON.stringify(insertResult.winningNumbers),
      bonusNumber: insertResult.bonusNumber ?? null,
      odds: JSON.stringify(insertResult.odds),
      isDemo: insertResult.isDemo ?? false
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
  async getPlatformSettings() {
    return { ...this.platformSettings };
  }
  async updatePlatformSettings(update) {
    this.platformSettings = {
      ...this.platformSettings,
      ...update,
      id: PLATFORM_SETTINGS_ID,
      updatedAt: /* @__PURE__ */ new Date()
    };
    return { ...this.platformSettings };
  }
  async getComplianceGates() {
    return Array.from(this.complianceGates.values()).sort((a, b) => a.category.localeCompare(b.category));
  }
  async updateComplianceGate(key, update) {
    const gate = this.complianceGates.get(key);
    if (!gate) return void 0;
    const updated = { ...gate, ...update, key, updatedAt: /* @__PURE__ */ new Date() };
    this.complianceGates.set(key, updated);
    return updated;
  }
  async getOperatorAuditLogs() {
    return this.operatorAuditLogs.slice(0, 100);
  }
  async createOperatorAuditLog(log) {
    const entry = { id: randomUUID(), ...log, createdAt: /* @__PURE__ */ new Date() };
    this.operatorAuditLogs.unshift(entry);
    return entry;
  }
  async getDemoWallet(sessionId) {
    const existing = this.demoWallets.get(sessionId);
    if (existing) return { ...existing };
    const wallet = { sessionId, balance: 0, createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() };
    this.demoWallets.set(sessionId, wallet);
    return { ...wallet };
  }
  async adjustDemoWallet(sessionId, amount, type, reference) {
    const wallet = await this.getDemoWallet(sessionId);
    const balance = Math.round((wallet.balance + amount) * 100) / 100;
    if (balance < 0 || balance > 1e6) return void 0;
    const updated = { ...wallet, balance, updatedAt: /* @__PURE__ */ new Date() };
    this.demoWallets.set(sessionId, updated);
    this.demoLedger.unshift({
      id: randomUUID(),
      sessionId,
      type,
      amount,
      balanceAfter: balance,
      reference: reference ?? null,
      createdAt: /* @__PURE__ */ new Date()
    });
    return { ...updated };
  }
  async getDemoLedger(sessionId) {
    return this.demoLedger.filter((entry) => entry.sessionId === sessionId).slice(0, 50);
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

// server/demo-betting.ts
import { randomInt } from "node:crypto";
var DEMO_WALLET_LIMIT = 1e6;
function takeRandom(values, count) {
  const pool = [...values];
  const picked = [];
  while (picked.length < count && pool.length > 0) {
    picked.push(pool.splice(randomInt(0, pool.length), 1)[0]);
  }
  return picked;
}
function createAutomatedDemoResult(game, bet, forceWin) {
  if (!bet.isDemo) throw new Error("Automated demo results require a demo ticket");
  if (bet.gameId !== game.id) throw new Error("Ticket and game do not match");
  const selectedNumbers = JSON.parse(bet.selectedNumbers);
  const shouldWin = forceWin ?? randomInt(0, 2) === 1;
  const selectedMatches = shouldWin ? game.minMatches : Math.max(0, game.minMatches - 1);
  const winningNumbers = takeRandom(selectedNumbers, selectedMatches);
  const selectedSet = new Set(selectedNumbers);
  const availableNumbers = Array.from(
    { length: game.maxNumber - game.minNumber + 1 },
    (_, index2) => game.minNumber + index2
  ).filter((number) => !selectedSet.has(number));
  winningNumbers.push(...takeRandom(availableNumbers, game.numbersToSelect - winningNumbers.length));
  const odds = winningNumbers.map(
    () => randomInt(Math.ceil(game.minOdds * 100), Math.floor(game.maxOdds * 100) + 1) / 100
  );
  let bonusNumber;
  if (game.hasBonus) {
    const ticketBonus = bet.bonusNumber ?? void 0;
    const matchBonus = ticketBonus !== void 0 && randomInt(0, 2) === 1;
    if (matchBonus && !winningNumbers.includes(ticketBonus)) {
      bonusNumber = ticketBonus;
    } else {
      const bonusPool = Array.from(
        { length: game.maxNumber - game.minNumber + 1 },
        (_, index2) => game.minNumber + index2
      ).filter((number) => !winningNumbers.includes(number) && number !== ticketBonus);
      bonusNumber = takeRandom(bonusPool, 1)[0];
    }
  }
  return {
    gameId: game.id,
    drawDate: new Date(Date.now() + 1),
    winningNumbers,
    bonusNumber,
    odds,
    isDemo: true
  };
}
async function settleBetAgainstResult(storage2, logic, bet, game, result) {
  if (bet.gameId !== game.id || result.gameId !== game.id) {
    throw new Error("Ticket, game and result do not match");
  }
  if (bet.isDemo !== result.isDemo) {
    throw new Error("Demo and official settlement modes cannot be mixed");
  }
  const selectedNumbers = JSON.parse(bet.selectedNumbers);
  const winningNumbers = JSON.parse(result.winningNumbers);
  const odds = JSON.parse(result.odds);
  const matchedNumbers = Array.from(new Set(selectedNumbers)).filter((number) => winningNumbers.includes(number));
  const matchedCount = matchedNumbers.length;
  const bonusMatched = bet.bonusNumber !== null && bet.bonusNumber === result.bonusNumber;
  const existingWinning = await storage2.getWinningByBet(bet.id);
  if (existingWinning && matchedCount >= game.minMatches) {
    const metadata = logic.getWinningMetadata(bet.id);
    return {
      won: true,
      winning: existingWinning,
      matchedCount,
      matchedNumbers,
      bonusMatched,
      houseEdgeApplied: metadata?.houseEdgeApplied ?? false,
      limitApplied: (metadata?.singleWinCapApplied ?? false) || (metadata?.dailyCapApplied ?? false),
      singleWinCapApplied: metadata?.singleWinCapApplied ?? false,
      dailyCapApplied: metadata?.dailyCapApplied ?? false,
      demoWalletCapApplied: false,
      message: bet.isDemo ? "Demo win settled automatically." : "Congratulations! You won!",
      wallet: bet.isDemo && bet.demoSessionId ? await storage2.getDemoWallet(bet.demoSessionId) : void 0
    };
  }
  if (matchedCount < game.minMatches) {
    await storage2.updateBetOutcome(bet.id, "lost", 0, result.id);
    return {
      won: false,
      matchedCount,
      matchedNumbers,
      bonusMatched,
      houseEdgeApplied: false,
      limitApplied: false,
      singleWinCapApplied: false,
      dailyCapApplied: false,
      demoWalletCapApplied: false,
      message: bet.isDemo ? `Demo draw complete. Matched ${matchedCount}; ${game.minMatches} required to win.` : `Matched ${matchedCount} numbers; ${game.minMatches} required to win.`,
      wallet: bet.isDemo && bet.demoSessionId ? await storage2.getDemoWallet(bet.demoSessionId) : void 0
    };
  }
  const matchedOdds = matchedNumbers.map((number) => {
    const index2 = winningNumbers.indexOf(number);
    return odds[index2] || 1;
  });
  let baseWinning = matchedOdds.reduce((total, odd) => total * odd, 1) * bet.stakeAmount;
  if (bonusMatched && game.hasBonus) baseWinning *= 1.5;
  const winningResult = logic.calculateWinningAmount(baseWinning, bet.stakeAmount, bet.id);
  let winningAmount = winningResult.finalAmount;
  let demoWalletCapApplied = false;
  let wallet;
  if (bet.isDemo && bet.demoSessionId) {
    wallet = await storage2.getDemoWallet(bet.demoSessionId);
    const availableWalletCapacity = Math.max(0, DEMO_WALLET_LIMIT - wallet.balance);
    if (winningAmount > availableWalletCapacity) {
      winningAmount = availableWalletCapacity;
      demoWalletCapApplied = true;
    }
  }
  const winning = await storage2.createWinning({
    betId: bet.id,
    resultId: result.id,
    matchedNumbers,
    matchedCount,
    winningAmount
  });
  if (bet.isDemo && bet.demoSessionId && winningAmount > 0) {
    wallet = await storage2.adjustDemoWallet(bet.demoSessionId, winningAmount, "winning", bet.id);
    if (!wallet) throw new Error("Unable to credit the demo payout");
  } else if (!bet.isDemo && winningAmount > 0) {
    logic.recordPayout(winningAmount);
  }
  await storage2.updateBetOutcome(bet.id, "won", winningAmount, result.id);
  const singleWinCapApplied = winningResult.metadata.singleWinCapApplied;
  const dailyCapApplied = winningResult.metadata.dailyCapApplied;
  let message = bet.isDemo ? "Demo win settled automatically." : "Congratulations! You won!";
  if (demoWalletCapApplied) message = "Demo win settled at the \u20A61,000,000 demo-wallet limit.";
  else if (singleWinCapApplied) message = "Win settled at the maximum single-ticket payout.";
  return {
    won: true,
    winning,
    matchedCount,
    matchedNumbers,
    bonusMatched,
    houseEdgeApplied: winningResult.metadata.houseEdgeApplied,
    limitApplied: singleWinCapApplied || dailyCapApplied || demoWalletCapApplied,
    singleWinCapApplied,
    dailyCapApplied,
    demoWalletCapApplied,
    message,
    wallet
  };
}

// server/routes.ts
async function registerRoutes(app) {
  const publicPreviewMode = process.env.PUBLIC_PREVIEW_MODE === "true";
  const demoDrawsEnabled = process.env.DEMO_DRAW_GENERATION_ENABLED === "true" && process.env.NODE_ENV !== "production";
  const getControlState = async () => {
    const [settings, complianceGates2] = await Promise.all([
      storage.getPlatformSettings(),
      storage.getComplianceGates()
    ]);
    const infrastructure = infrastructureReadiness();
    const capabilities = operationalCapabilities(settings, complianceGates2, infrastructure);
    gameLogic.updateConfig({
      houseEdgePercentage: settings.houseEdgePercentage,
      maxDailyPayoutRatio: settings.maxDailyPayoutRatio,
      maxSingleWinMultiplier: settings.maxSingleWinMultiplier
    });
    return {
      settings,
      complianceGates: complianceGates2,
      infrastructure,
      capabilities,
      launchBlockers: launchBlockers(complianceGates2, infrastructure)
    };
  };
  const adminActor = (req) => req.get("x-admin-actor")?.trim().slice(0, 100) || "operator";
  const requirePersistentControlPlane = (res) => {
    if (publicPreviewMode || !process.env.DATABASE_URL?.trim()) {
      res.status(409).json({
        error: "Persistent operator controls require DATABASE_URL and PUBLIC_PREVIEW_MODE=false"
      });
      return false;
    }
    return true;
  };
  const getDemoSessionId = (req) => {
    const value = req.get("x-demo-session-id")?.trim();
    return value && z2.string().uuid().safeParse(value).success ? value : void 0;
  };
  app.get("/api/capabilities", async (_req, res) => {
    try {
      const { capabilities } = await getControlState();
      res.json(capabilities);
    } catch {
      res.status(503).json({ error: "Platform controls are unavailable" });
    }
  });
  app.get("/api/demo/wallet", async (req, res) => {
    try {
      const { capabilities } = await getControlState();
      if (!capabilities.demoModeEnabled) return res.status(404).json({ error: "Demo mode is disabled" });
      const sessionId = getDemoSessionId(req);
      if (!sessionId) return res.status(400).json({ error: "A valid demo session is required" });
      const [wallet, ledger] = await Promise.all([storage.getDemoWallet(sessionId), storage.getDemoLedger(sessionId)]);
      res.setHeader("Cache-Control", "no-store, private");
      res.json({ wallet, ledger, currency: "DEMO NGN", withdrawable: false });
    } catch {
      res.status(500).json({ error: "Failed to load demo wallet" });
    }
  });
  app.post("/api/demo/wallet/top-up", async (req, res) => {
    try {
      const { capabilities } = await getControlState();
      if (!capabilities.demoModeEnabled) return res.status(404).json({ error: "Demo mode is disabled" });
      const sessionId = getDemoSessionId(req);
      if (!sessionId) return res.status(400).json({ error: "A valid demo session is required" });
      const { amount } = z2.object({ amount: z2.number().int().min(1e3).max(1e5) }).strict().parse(req.body);
      const wallet = await storage.adjustDemoWallet(sessionId, amount, "top_up");
      if (!wallet) return res.status(409).json({ error: "Demo balance cannot exceed \u20A61,000,000" });
      res.json({ wallet, currency: "DEMO NGN", withdrawable: false });
    } catch (error) {
      if (error instanceof z2.ZodError) return res.status(400).json({ error: "Invalid demo top-up", details: error.issues });
      res.status(500).json({ error: "Failed to add demo funds" });
    }
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
      const { capabilities } = await getControlState();
      const isDemo = !capabilities.bettingEnabled && capabilities.demoModeEnabled;
      if (!capabilities.bettingEnabled && !isDemo) {
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
      const demoSessionId = isDemo ? getDemoSessionId(req) : void 0;
      if (isDemo && !demoSessionId) return res.status(400).json({ error: "A valid demo session is required" });
      if (!isDemo) gameLogic.recordStake(gameValidation.value.stakeAmount);
      const baseMaxWinning = validatedBet.selectedNumbers.length === game.numbersToSelect ? Math.pow(game.maxOdds, game.minMatches) * gameValidation.value.stakeAmount : gameValidation.value.stakeAmount;
      const theoreticalMaxWinning = Math.min(
        baseMaxWinning,
        gameLogic.getConfig().maxSingleWinMultiplier * gameValidation.value.stakeAmount
      );
      let demoWallet;
      if (isDemo) {
        demoWallet = await storage.adjustDemoWallet(demoSessionId, -gameValidation.value.stakeAmount, "stake");
        if (!demoWallet) return res.status(409).json({ error: "Insufficient demo balance. Add demo funds and try again." });
      }
      let bet;
      try {
        bet = await storage.createBet({
          ...gameValidation.value,
          potentialWinning: Math.round(theoreticalMaxWinning * 100) / 100,
          isDemo,
          demoSessionId: demoSessionId ?? null
        });
      } catch (error) {
        if (isDemo) await storage.adjustDemoWallet(demoSessionId, gameValidation.value.stakeAmount, "refund");
        throw error;
      }
      if (isDemo) {
        try {
          const demoResult = await storage.createResult(createAutomatedDemoResult(game, bet));
          const demoOutcome = await settleBetAgainstResult(storage, gameLogic, bet, game, demoResult);
          demoWallet = demoOutcome.wallet ?? await storage.getDemoWallet(demoSessionId);
          const settledBet = await storage.getBet(bet.id) ?? bet;
          return res.status(201).json({ ...settledBet, demoResult, demoOutcome, demoWallet });
        } catch (error) {
          const currentBet = await storage.getBet(bet.id);
          if (currentBet?.status === "pending") {
            await storage.adjustDemoWallet(demoSessionId, gameValidation.value.stakeAmount, "refund", bet.id);
            await storage.updateBetOutcome(bet.id, "voided", 0, null);
          }
          throw error;
        }
      }
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
      res.json(results2.filter((result) => !result.isDemo));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });
  app.get("/api/results/game/:gameId", async (req, res) => {
    try {
      const results2 = await storage.getResultsByGame(req.params.gameId);
      res.json(results2.filter((result) => !result.isDemo));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });
  app.get("/api/results/game/:gameId/latest", async (req, res) => {
    try {
      const result = (await storage.getResultsByGame(req.params.gameId)).find((item) => !item.isDemo);
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
      const result = await storage.getFirstResultAfter(bet.gameId, new Date(bet.createdAt), bet.isDemo);
      if (!result) {
        return res.status(404).json({ error: "No results available for this game yet" });
      }
      const game = await storage.getGame(bet.gameId);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      res.json(await settleBetAgainstResult(storage, gameLogic, bet, game, result));
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
      const { capabilities } = await getControlState();
      if (!demoDrawsEnabled && !capabilities.demoModeEnabled) {
        return res.status(403).json({ error: "Demo draw generation is disabled" });
      }
      const game = await storage.getGame(req.params.gameId);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      const winningNumbers = [];
      while (winningNumbers.length < game.numbersToSelect) {
        const randomNum = randomInt2(game.minNumber, game.maxNumber + 1);
        if (!winningNumbers.includes(randomNum)) {
          winningNumbers.push(randomNum);
        }
      }
      const odds = winningNumbers.map(
        () => randomInt2(Math.ceil(game.minOdds * 100), Math.floor(game.maxOdds * 100) + 1) / 100
      );
      let bonusNumber;
      if (game.hasBonus) {
        do {
          bonusNumber = randomInt2(game.minNumber, game.maxNumber + 1);
        } while (winningNumbers.includes(bonusNumber));
      }
      const result = await storage.createResult({
        gameId: game.id,
        drawDate: /* @__PURE__ */ new Date(),
        winningNumbers,
        bonusNumber,
        odds,
        isDemo: true
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
      const { settings } = await getControlState();
      res.json({
        houseEdgePercentage: settings.houseEdgePercentage,
        maxDailyPayoutRatio: settings.maxDailyPayoutRatio,
        maxSingleWinMultiplier: settings.maxSingleWinMultiplier
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch config" });
    }
  });
  app.put("/api/config", requireAdmin, async (req, res) => {
    try {
      if (!requirePersistentControlPlane(res)) return;
      const update = z2.object({
        houseEdgePercentage: z2.number().min(0).max(50).optional(),
        maxDailyPayoutRatio: z2.number().min(0).max(1).optional(),
        maxSingleWinMultiplier: z2.number().positive().max(1e6).optional()
      }).strict().parse(req.body);
      const before = await storage.getPlatformSettings();
      const settings = await storage.updatePlatformSettings({
        ...update,
        updatedBy: adminActor(req)
      });
      await storage.createOperatorAuditLog({
        actor: adminActor(req),
        action: "risk_config.updated",
        target: "platform_settings",
        details: JSON.stringify({ before, update })
      });
      gameLogic.updateConfig(update);
      res.json({
        houseEdgePercentage: settings.houseEdgePercentage,
        maxDailyPayoutRatio: settings.maxDailyPayoutRatio,
        maxSingleWinMultiplier: settings.maxSingleWinMultiplier
      });
    } catch (error) {
      if (error instanceof z2.ZodError) return res.status(400).json({ error: "Invalid risk configuration", details: error.issues });
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
        isDemo: bet.isDemo,
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
      const { capabilities } = await getControlState();
      if (!capabilities.communityPostingEnabled) {
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
      const { capabilities } = await getControlState();
      if (!capabilities.communityPostingEnabled) {
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
      const { capabilities } = await getControlState();
      if (!capabilities.contactSubmissionsEnabled) {
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
  app.get("/api/admin/control-plane", requireAdmin, async (_req, res) => {
    try {
      const [control, bets2, winnings2, results2, inquiries, games2, auditLogs] = await Promise.all([
        getControlState(),
        storage.getAllBets(),
        storage.getAllWinnings(),
        storage.getAllResults(),
        storage.getAllContactInquiries(),
        storage.getAllGames(),
        storage.getOperatorAuditLogs()
      ]);
      const realBets = bets2.filter((bet) => !bet.isDemo);
      const demoBets = bets2.filter((bet) => bet.isDemo);
      const realBetIds = new Set(realBets.map((bet) => bet.id));
      const demoBetIds = new Set(demoBets.map((bet) => bet.id));
      res.setHeader("Cache-Control", "no-store, private");
      res.json({
        ...control,
        metrics: {
          totalBets: realBets.length,
          pendingBets: realBets.filter((bet) => bet.status === "pending").length,
          totalStaked: realBets.reduce((sum, bet) => sum + bet.stakeAmount, 0),
          totalPaid: winnings2.filter((winning) => realBetIds.has(winning.betId)).reduce((sum, winning) => sum + winning.winningAmount, 0),
          publishedResults: results2.filter((result) => !result.isDemo).length,
          openInquiries: inquiries.filter((inquiry) => inquiry.status === "new").length,
          demoBets: demoBets.length,
          demoStaked: demoBets.reduce((sum, bet) => sum + bet.stakeAmount, 0),
          demoPaid: winnings2.filter((winning) => demoBetIds.has(winning.betId)).reduce((sum, winning) => sum + winning.winningAmount, 0)
        },
        games: games2,
        recentBets: bets2.slice(0, 10),
        recentResults: results2.slice(0, 10),
        recentInquiries: inquiries.slice(0, 10),
        auditLogs
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to load the operator control plane" });
    }
  });
  app.put("/api/admin/features", requireAdmin, async (req, res) => {
    try {
      if (!requirePersistentControlPlane(res)) return;
      const update = z2.object({
        bettingEnabled: z2.boolean().optional(),
        communityPostingEnabled: z2.boolean().optional(),
        contactSubmissionsEnabled: z2.boolean().optional(),
        maintenanceMode: z2.boolean().optional(),
        demoModeEnabled: z2.boolean().optional()
      }).strict().refine((value) => Object.keys(value).length > 0, "At least one feature must be supplied").parse(req.body);
      const control = await getControlState();
      if (update.bettingEnabled === true && control.launchBlockers.length > 0) {
        return res.status(409).json({
          error: "Betting cannot be enabled until every launch gate is complete",
          blockers: control.launchBlockers
        });
      }
      if (update.bettingEnabled === true && control.settings.demoModeEnabled) {
        return res.status(409).json({ error: "Disable demo mode before enabling real-money betting" });
      }
      if (update.demoModeEnabled === true && control.settings.bettingEnabled) {
        return res.status(409).json({ error: "Disable real-money betting before enabling demo mode" });
      }
      if (update.communityPostingEnabled === true) {
        const required = ["community_safety", "player_identity"];
        const incomplete = required.filter((key) => !control.complianceGates.some((gate) => gate.key === key && gate.status === "complete"));
        if (incomplete.length > 0) {
          return res.status(409).json({ error: "Community posting requires identity and moderation controls", blockers: incomplete });
        }
      }
      const settings = await storage.updatePlatformSettings({ ...update, updatedBy: adminActor(req) });
      await storage.createOperatorAuditLog({
        actor: adminActor(req),
        action: "feature_flags.updated",
        target: "platform_settings",
        details: JSON.stringify({ before: control.settings, update })
      });
      const refreshed = await getControlState();
      res.json({ settings, capabilities: refreshed.capabilities, launchBlockers: refreshed.launchBlockers });
    } catch (error) {
      if (error instanceof z2.ZodError) return res.status(400).json({ error: "Invalid feature configuration", details: error.issues });
      res.status(500).json({ error: "Failed to update feature controls" });
    }
  });
  app.put("/api/admin/compliance/:key", requireAdmin, async (req, res) => {
    try {
      if (!requirePersistentControlPlane(res)) return;
      const update = z2.object({
        status: z2.enum(["pending", "complete", "blocked"]),
        evidence: z2.string().trim().max(2e3).nullable().optional(),
        reviewedBy: z2.string().trim().max(100).nullable().optional()
      }).strict().parse(req.body);
      if (update.status === "complete" && (!update.evidence || update.evidence.length < 10 || !update.reviewedBy || update.reviewedBy.length < 2)) {
        return res.status(400).json({ error: "Completed gates require evidence and a reviewer" });
      }
      const before = (await storage.getComplianceGates()).find((gate2) => gate2.key === req.params.key);
      if (!before) return res.status(404).json({ error: "Compliance gate not found" });
      const gate = await storage.updateComplianceGate(req.params.key, {
        status: update.status,
        evidence: update.evidence ?? null,
        reviewedBy: update.reviewedBy ?? null,
        reviewedAt: update.status === "complete" ? /* @__PURE__ */ new Date() : null
      });
      await storage.createOperatorAuditLog({
        actor: adminActor(req),
        action: "compliance_gate.updated",
        target: req.params.key,
        details: JSON.stringify({ before, after: gate })
      });
      const control = await getControlState();
      res.json({ gate, launchBlockers: control.launchBlockers, capabilities: control.capabilities });
    } catch (error) {
      if (error instanceof z2.ZodError) return res.status(400).json({ error: "Invalid compliance update", details: error.issues });
      res.status(500).json({ error: "Failed to update compliance gate" });
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
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Admin-Key,X-Admin-Actor,X-Demo-Session-Id,X-Request-Id");
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
  app.use(["/api/bets", "/api/winnings", "/api/contact", "/api/admin"], (_req, res, next) => {
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
