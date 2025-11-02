// api/index.ts
import express from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var games = pgTable("games", {
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
  hasBonus: boolean("has_bonus").notNull().default(false)
});
var insertGameSchema = createInsertSchema(games).omit({ id: true });
var bets = pgTable("bets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull(),
  selectedNumbers: text("selected_numbers").notNull(),
  bonusNumber: integer("bonus_number"),
  stakeAmount: real("stake_amount").notNull(),
  potentialWinning: real("potential_winning"),
  status: text("status").notNull().default("pending"),
  payout: real("payout"),
  resultId: varchar("result_id"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  createdAt: true
}).extend({
  selectedNumbers: z.array(z.number()).min(1),
  bonusNumber: z.number().optional(),
  stakeAmount: z.number().min(1)
});
var results = pgTable("results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull(),
  drawDate: timestamp("draw_date").notNull(),
  winningNumbers: text("winning_numbers").notNull(),
  bonusNumber: integer("bonus_number"),
  odds: text("odds").notNull()
});
var insertResultSchema = createInsertSchema(results).omit({ id: true }).extend({
  winningNumbers: z.array(z.number()).min(1),
  bonusNumber: z.number().optional(),
  odds: z.array(z.number()).min(1)
});
var winnings = pgTable("winnings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  betId: varchar("bet_id").notNull(),
  resultId: varchar("result_id").notNull(),
  matchedNumbers: text("matched_numbers").notNull(),
  matchedCount: integer("matched_count").notNull(),
  winningAmount: real("winning_amount").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertWinningSchema = createInsertSchema(winnings).omit({
  id: true,
  createdAt: true
}).extend({
  matchedNumbers: z.array(z.number())
});
var gameCodes = pgTable("game_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  gameId: varchar("game_id").notNull(),
  expiresAt: timestamp("expires_at"),
  usesRemaining: integer("uses_remaining"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertGameCodeSchema = createInsertSchema(gameCodes).omit({
  id: true,
  createdAt: true
});
var aviatorSessions = pgTable("aviator_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  betId: varchar("bet_id").notNull(),
  startMultiplier: real("start_multiplier").notNull().default(1),
  currentMultiplier: real("current_multiplier").notNull(),
  crashMultiplier: real("crash_multiplier").notNull(),
  status: text("status").notNull().default("active"),
  autoCashOutAt: real("auto_cash_out_at"),
  cashedOutAt: real("cashed_out_at"),
  cashedOutAmount: real("cashed_out_amount"),
  multiplierHistory: text("multiplier_history").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at")
});
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
var insertForumPostSchema = createInsertSchema(forumPosts).omit({
  id: true,
  createdAt: true
});
var forumComments = pgTable("forum_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull(),
  authorName: text("author_name").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertForumCommentSchema = createInsertSchema(forumComments).omit({
  id: true,
  createdAt: true
});
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
var insertContactInquirySchema = createInsertSchema(contactInquiries).omit({
  id: true,
  createdAt: true,
  status: true
});

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
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
    this.users = /* @__PURE__ */ new Map();
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
    this.seedGameCodes();
    this.seedForumPosts();
  }
  seedGames() {
    const gamesToSeed = [
      {
        type: "virtual" /* VIRTUAL */,
        name: "Virtual Betting",
        description: "Weekly rounds with countdown timer. Runs for 35 virtual weeks with instant results!",
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
        description: "Main game category - Minor. Pick 5 numbers from 0-40 and match 3+ to win!",
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
        description: "Main game category - Major. Pick 7 numbers from 0-60 and match 3+ to win big!",
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
        description: "Main game category - Mega. Pick 10 numbers from 0-90 and match 5+ for mega wins!",
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
        description: "Daily noon draw at 12:00 PM. Pick 3 numbers plus bonus from 0-25!",
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
        description: "Daily night draw at 12:00 AM. Pick 3 numbers plus bonus from 0-25!",
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
        description: "Fast-paced number predictions with multiplier bonuses. Select 3 numbers and watch your winnings soar!",
        minNumber: 1,
        maxNumber: 36,
        minOdds: 3,
        maxOdds: 8,
        numbersToSelect: 3,
        minMatches: 2,
        hasBonus: false
      }
    ];
    gamesToSeed.forEach((game) => {
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
    const postsToSeed = [
      {
        post: {
          authorName: "Lucky_Winner_NG",
          title: "\u{1F389} Just won \u20A6250,000 on Mega Game!",
          contentType: "win_story",
          gameType: "mega" /* MEGA */,
          content: "Brothers and sisters! I picked these numbers on Mega: 12, 24, 36, 48, 60, 72, 84, 90, 18, 42. Got 7 matches and won big! God is good! \u{1F64F}"
        },
        comments: [
          "Congratulations! \u{1F389} What were your odds?",
          "This is inspiring! Going to try Mega game now",
          "Amazing win! Please share more winning numbers"
        ]
      },
      {
        post: {
          authorName: "GamerKE",
          title: "Virtual Betting Week 15 - Hot Numbers!",
          contentType: "lucky_numbers",
          gameType: "virtual" /* VIRTUAL */,
          content: "These numbers have been coming up frequently in Virtual this week: 7, 14, 21, 28, 35. Try combining them with your lucky numbers. Good luck!"
        },
        comments: [
          "Thank you! Will try this combination today",
          "I noticed 14 and 28 came up 3 times this week already",
          "Using these numbers now. Fingers crossed! \u{1F91E}"
        ]
      },
      {
        post: {
          authorName: "ProGamer_ZA",
          title: "Game Code for Minor: MEGA500",
          contentType: "game_code",
          gameType: "minor" /* MINOR */,
          content: "Use code MEGA500 for bonus on Minor game. Valid until midnight. Share with friends!"
        },
        comments: [
          "Code worked! Thanks so much",
          "Does this work in South Africa?",
          "Already used it. Amazing bonus!"
        ]
      },
      {
        post: {
          authorName: "NightOwl_GH",
          title: "Night Game Strategy - Consistent Wins",
          contentType: "suggestion",
          gameType: "night" /* NIGHT */,
          content: "I've been playing Night Game for 2 months. My strategy: Pick numbers divisible by 5 (5, 10, 15, 20, 25) and let the system generate the bonus. Won 15 out of 30 games! What's your strategy?"
        },
        comments: [
          "Interesting approach! I'll test this out",
          "I use consecutive numbers and it's working well",
          "Thanks for sharing! This community is the best \u{1F44D}",
          "Do you play every night or just certain days?"
        ]
      },
      {
        post: {
          authorName: "MajorWinner_TZ",
          title: "Major Game Winning Numbers - Today's Draw",
          contentType: "lucky_numbers",
          gameType: "major" /* MAJOR */,
          content: "Today's hot numbers for Major: 8, 16, 24, 32, 40, 48, 56. These have the best odds this week. Remember to pick 7 numbers total!"
        },
        comments: [
          "Perfect timing! About to place my bet",
          "These numbers look good. Going all in! \u{1F4AA}"
        ]
      },
      {
        post: {
          authorName: "SmartBetter_UG",
          title: "Noon Game Code: NOON123 - 50% Bonus",
          contentType: "game_code",
          gameType: "noon" /* NOON */,
          content: "Active code for Noon game: NOON123. Gives 50% bonus on your stake. Valid for today's draw only. Don't miss it!"
        },
        comments: [
          "Just used it! Works perfectly",
          "Is there a maximum stake for the bonus?",
          "Thank you! This will help me win big today"
        ]
      },
      {
        post: {
          authorName: "Aviator_Pro_RW",
          title: "Aviator Tips - How I Went from \u20A65k to \u20A6150k",
          contentType: "suggestion",
          gameType: "aviator" /* AVIATOR */,
          content: "Aviator Strategy: 1) Start small, 2) Cash out at 2x-3x multiplier (don't be greedy), 3) Pick numbers based on time (hour + minute), 4) Set auto cash out. This method has been working for me consistently. Stay disciplined!"
        },
        comments: [
          "This is gold! Thanks for sharing the strategy",
          "I've been too greedy. Will follow your 2x-3x rule",
          "What time of day gives best results?",
          "Tried this yesterday and made \u20A620k profit! \u{1F680}"
        ]
      },
      {
        post: {
          authorName: "VirtualKing_ET",
          title: "Virtual Week 22 Analysis - Top Patterns",
          contentType: "suggestion",
          gameType: "virtual" /* VIRTUAL */,
          content: "After analyzing week 22 draws, I noticed: Even numbers appearing 65% of the time, numbers ending in 0 or 5 appearing in 8 out of 10 draws. Adjust your picks accordingly!"
        },
        comments: [
          "Statistical approach! Love it \u{1F4CA}",
          "Can you share more analysis like this?",
          "This helped me understand the game better"
        ]
      },
      {
        post: {
          authorName: "DailyWinner_MA",
          title: "Minor Game Code: WIN200 - Limited Time!",
          contentType: "game_code",
          gameType: "minor" /* MINOR */,
          content: "Hurry! Use WIN200 for bonus on Minor game. Only 100 uses available. First come, first served!"
        },
        comments: [
          "Got it! Number 47 here \u{1F60A}",
          "Still working as of 2 minutes ago"
        ]
      },
      {
        post: {
          authorName: "BlessingFromAbove",
          title: "My Testimony - God Used AfriBet to Bless Me",
          contentType: "win_story",
          gameType: "mega" /* MEGA */,
          content: "I was struggling to pay my daughter's school fees. Played Mega with my last \u20A62,000. Picked numbers from her birth date and won \u20A6580,000! God is faithful. Never give up!"
        },
        comments: [
          "Glory to God! Congratulations \u{1F64F}",
          "This brought tears to my eyes. So happy for you!",
          "May God continue to bless you and your family",
          "Testimonies like this give me hope. Thank you for sharing"
        ]
      },
      {
        post: {
          authorName: "NoonGameExpert",
          title: "Noon Game - Best Time to Play",
          contentType: "suggestion",
          gameType: "noon" /* NOON */,
          content: "Pro tip: Submit your Noon game picks between 11:00-11:30 AM. The system generates fresh bonus numbers during this window. I've won 40% more using this timing!"
        },
        comments: [
          "Never knew timing matters! Thanks",
          "Will definitely try this tomorrow"
        ]
      },
      {
        post: {
          authorName: "AfricaUnite_CM",
          title: "Playing from Cameroon - We're Winning Too!",
          contentType: "win_story",
          gameType: "virtual" /* VIRTUAL */,
          content: "Shoutout to all Cameroon players! AfriBet Games is truly pan-African. Won \u20A685,000 on Virtual this week. The platform works perfectly across all African countries. Let's keep winning! \u{1F1E8}\u{1F1F2}"
        },
        comments: [
          "Representing from Ghana! \u{1F1EC}\u{1F1ED}",
          "Nigeria here! We're all one Africa \u{1F1F3}\u{1F1EC}",
          "Love this unity! Kenya player here \u{1F1F0}\u{1F1EA}"
        ]
      }
    ];
    postsToSeed.forEach(({ post, comments }) => {
      const postId = randomUUID();
      const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1e3);
      this.forumPosts.set(postId, {
        ...post,
        id: postId,
        createdAt
      });
      comments.forEach((commentText, index) => {
        const commentId = randomUUID();
        const commentCreatedAt = new Date(createdAt.getTime() + (index + 1) * 60 * 60 * 1e3);
        this.forumComments.set(commentId, {
          id: commentId,
          postId,
          authorName: `Player${Math.floor(Math.random() * 1e3)}`,
          comment: commentText,
          createdAt: commentCreatedAt
        });
      });
    });
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
    const codes = [
      {
        code: "WELCOME100",
        gameId: "",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
        usesRemaining: 100
      },
      {
        code: "VIP2024",
        gameId: "",
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1e3),
        usesRemaining: null
      }
    ];
    codes.forEach((code) => {
      const id = randomUUID();
      this.gameCodes.set(code.code, {
        id,
        code: code.code,
        gameId: code.gameId,
        expiresAt: code.expiresAt ?? null,
        usesRemaining: code.usesRemaining ?? null,
        createdAt: /* @__PURE__ */ new Date()
      });
    });
  }
  async getGameCode(code) {
    return this.gameCodes.get(code);
  }
  async createGameCode(insertGameCode) {
    const id = randomUUID();
    const gameCode = {
      id,
      code: insertGameCode.code,
      gameId: insertGameCode.gameId,
      expiresAt: insertGameCode.expiresAt ?? null,
      usesRemaining: insertGameCode.usesRemaining ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.gameCodes.set(insertGameCode.code, gameCode);
    return gameCode;
  }
  async useGameCode(code) {
    const gameCode = this.gameCodes.get(code);
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
      this.gameCodes.set(code, updatedCode);
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
var storage = new MemStorage();

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
    const houseEdgeMultiplier = (100 - this.config.houseEdgePercentage) / 100;
    const winningAfterHouseEdge = baseWinning * houseEdgeMultiplier;
    const houseEdgeApplied = winningAfterHouseEdge < baseWinning;
    const maxSingleWin = stakeAmount * this.config.maxSingleWinMultiplier;
    const cappedByMaxWin = Math.min(winningAfterHouseEdge, maxSingleWin);
    const singleWinCapApplied = cappedByMaxWin < winningAfterHouseEdge;
    const maxDailyPayout = stats.totalStakes * this.config.maxDailyPayoutRatio;
    const availablePayout = Math.max(0, maxDailyPayout - stats.totalPayouts);
    const finalAmount = Math.min(cappedByMaxWin, availablePayout);
    const dailyCapApplied = finalAmount < cappedByMaxWin;
    const roundedFinal = Math.floor(finalAmount * 100) / 100;
    const metadata = {
      houseEdgeApplied,
      singleWinCapApplied,
      dailyCapApplied,
      cappedFromHouseEdge: houseEdgeApplied ? baseWinning : void 0,
      cappedFromSingleWin: singleWinCapApplied ? winningAfterHouseEdge : void 0,
      cappedFromDaily: dailyCapApplied ? cappedByMaxWin : void 0
    };
    this.winningMetadata.set(betId, metadata);
    if (singleWinCapApplied && dailyCapApplied) {
      const singleWinDelta = winningAfterHouseEdge - cappedByMaxWin;
      const dailyDelta = cappedByMaxWin - roundedFinal;
      this.payoutEvents.push({
        timestamp: /* @__PURE__ */ new Date(),
        amount: roundedFinal,
        cappedFrom: winningAfterHouseEdge,
        limitType: "single_win_cap"
      });
      this.payoutEvents.push({
        timestamp: /* @__PURE__ */ new Date(),
        amount: roundedFinal,
        cappedFrom: cappedByMaxWin,
        limitType: "daily_cap"
      });
      console.log(`[GameLogic] Multiple caps applied: Single win -${singleWinDelta.toFixed(2)}, Daily -${dailyDelta.toFixed(2)}`);
      stats.cappedPayouts += singleWinDelta + dailyDelta;
    } else if (singleWinCapApplied) {
      const delta = winningAfterHouseEdge - roundedFinal;
      this.payoutEvents.push({
        timestamp: /* @__PURE__ */ new Date(),
        amount: roundedFinal,
        cappedFrom: winningAfterHouseEdge,
        limitType: "single_win_cap"
      });
      console.log(`[GameLogic] Single win cap applied: ${winningAfterHouseEdge.toFixed(2)} -> ${roundedFinal.toFixed(2)}`);
      stats.cappedPayouts += delta;
    } else if (dailyCapApplied) {
      const delta = cappedByMaxWin - roundedFinal;
      this.payoutEvents.push({
        timestamp: /* @__PURE__ */ new Date(),
        amount: roundedFinal,
        cappedFrom: cappedByMaxWin,
        limitType: "daily_cap"
      });
      console.log(`[GameLogic] Daily cap applied: ${cappedByMaxWin.toFixed(2)} -> ${roundedFinal.toFixed(2)}`);
      stats.cappedPayouts += delta;
    } else if (houseEdgeApplied) {
      this.payoutEvents.push({
        timestamp: /* @__PURE__ */ new Date(),
        amount: roundedFinal,
        cappedFrom: baseWinning,
        limitType: "house_edge"
      });
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
var gameLogic = new GameLogic();

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/games", async (_req, res) => {
    try {
      const games2 = await storage.getAllGames();
      res.json(games2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch games" });
    }
  });
  app2.get("/api/games/:type", async (req, res) => {
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
  app2.post("/api/bets", async (req, res) => {
    try {
      const validatedBet = insertBetSchema.parse(req.body);
      const game = await storage.getGame(validatedBet.gameId);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      gameLogic.recordStake(validatedBet.stakeAmount);
      const baseMaxWinning = validatedBet.selectedNumbers.length === game.numbersToSelect ? Math.pow(game.maxOdds, game.minMatches) * validatedBet.stakeAmount : validatedBet.stakeAmount;
      const houseEdgeMultiplier = (100 - gameLogic.getConfig().houseEdgePercentage) / 100;
      const theoreticalMaxWinning = baseMaxWinning * houseEdgeMultiplier;
      const bet = await storage.createBet({
        ...validatedBet,
        potentialWinning: theoreticalMaxWinning
      });
      res.status(201).json(bet);
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        return res.status(400).json({ error: "Invalid bet data", details: error });
      }
      res.status(500).json({ error: "Failed to create bet" });
    }
  });
  app2.get("/api/bets", async (_req, res) => {
    try {
      const bets2 = await storage.getAllBets();
      res.json(bets2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bets" });
    }
  });
  app2.get("/api/bets/:id", async (req, res) => {
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
  app2.get("/api/bets/search/:code", async (req, res) => {
    try {
      const code = req.params.code.toLowerCase();
      if (code.length !== 8) {
        return res.status(400).json({ error: "Short code must be 8 characters" });
      }
      const allBets = await storage.getAllBets();
      const foundBet = allBets.find((bet) => bet.id.toLowerCase().startsWith(code));
      if (!foundBet) {
        return res.status(404).json({ error: "Bet not found with that code" });
      }
      res.json({ betId: foundBet.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to search for bet" });
    }
  });
  app2.post("/api/results", async (req, res) => {
    try {
      const validatedResult = insertResultSchema.parse(req.body);
      const result = await storage.createResult(validatedResult);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        return res.status(400).json({ error: "Invalid result data", details: error });
      }
      res.status(500).json({ error: "Failed to create result" });
    }
  });
  app2.get("/api/results", async (_req, res) => {
    try {
      const results2 = await storage.getAllResults();
      res.json(results2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });
  app2.get("/api/results/game/:gameId", async (req, res) => {
    try {
      const results2 = await storage.getResultsByGame(req.params.gameId);
      res.json(results2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });
  app2.get("/api/results/game/:gameId/latest", async (req, res) => {
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
  app2.post("/api/winnings/check/:betId", async (req, res) => {
    try {
      const bet = await storage.getBet(req.params.betId);
      if (!bet) {
        return res.status(404).json({ error: "Bet not found" });
      }
      const result = await storage.getLatestResult(bet.gameId);
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
          const index = winningNumbers.indexOf(num);
          return odds[index] || 1;
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
  app2.get("/api/winnings", async (_req, res) => {
    try {
      const winnings2 = await storage.getAllWinnings();
      res.json(winnings2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch winnings" });
    }
  });
  app2.post("/api/results/generate/:gameId", async (req, res) => {
    try {
      const game = await storage.getGame(req.params.gameId);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      const winningNumbers = [];
      while (winningNumbers.length < game.numbersToSelect) {
        const randomNum = Math.floor(Math.random() * (game.maxNumber - game.minNumber + 1)) + game.minNumber;
        if (!winningNumbers.includes(randomNum)) {
          winningNumbers.push(randomNum);
        }
      }
      const odds = winningNumbers.map(
        () => Math.floor(Math.random() * (game.maxOdds - game.minOdds + 1)) + game.minOdds
      );
      let bonusNumber;
      if (game.hasBonus) {
        do {
          bonusNumber = Math.floor(Math.random() * (game.maxNumber - game.minNumber + 1)) + game.minNumber;
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
  app2.get("/api/stats/daily", async (_req, res) => {
    try {
      const stats = gameLogic.getDailyStatsForDate();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily stats" });
    }
  });
  app2.get("/api/stats/all", async (_req, res) => {
    try {
      const stats = gameLogic.getAllDailyStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });
  app2.get("/api/config", async (_req, res) => {
    try {
      const config = gameLogic.getConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch config" });
    }
  });
  app2.put("/api/config", async (req, res) => {
    try {
      gameLogic.updateConfig(req.body);
      const config = gameLogic.getConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to update config" });
    }
  });
  app2.get("/api/bets/:id/outcome", async (req, res) => {
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
  app2.get("/api/bets/:id/ticket", async (req, res) => {
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
  app2.post("/api/codes/redeem", async (req, res) => {
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
  app2.post("/api/codes", async (req, res) => {
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
  app2.post("/api/aviator/session", async (req, res) => {
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
  app2.get("/api/aviator/session/:betId", async (req, res) => {
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
  app2.post("/api/aviator/cashout/:sessionId", async (req, res) => {
    try {
      const { multiplier } = req.body;
      if (typeof multiplier !== "number" || multiplier <= 0) {
        return res.status(400).json({ error: "Invalid multiplier" });
      }
      const session = await storage.getAviatorSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      if (session.status !== "active") {
        return res.status(400).json({ error: "Session is not active" });
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
      await storage.updateBetOutcome(session.betId, "won", cashedOutAmount, "");
      res.json({
        session: updatedSession,
        cashedOutAmount
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to cash out" });
    }
  });
  app2.post("/api/aviator/crash/:sessionId", async (req, res) => {
    try {
      const session = await storage.getAviatorSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      const updatedSession = await storage.updateAviatorSession(req.params.sessionId, {
        status: "crashed",
        completedAt: /* @__PURE__ */ new Date()
      });
      await storage.updateBetOutcome(session.betId, "lost", 0, "");
      res.json({ session: updatedSession });
    } catch (error) {
      res.status(500).json({ error: "Failed to complete aviator session" });
    }
  });
  app2.get("/api/forum/posts", async (req, res) => {
    try {
      const { gameType } = req.query;
      const posts = gameType ? await storage.getForumPostsByGameType(gameType) : await storage.getAllForumPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch forum posts" });
    }
  });
  app2.get("/api/forum/posts/:id", async (req, res) => {
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
  app2.post("/api/forum/posts", async (req, res) => {
    try {
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
  app2.get("/api/forum/posts/:postId/comments", async (req, res) => {
    try {
      const comments = await storage.getForumCommentsByPost(req.params.postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });
  app2.post("/api/forum/comments", async (req, res) => {
    try {
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
  app2.post("/api/contact", async (req, res) => {
    try {
      const validatedInquiry = insertContactInquirySchema.parse(req.body);
      const inquiry = await storage.createContactInquiry(validatedInquiry);
      res.status(201).json(inquiry);
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        return res.status(400).json({ error: "Invalid contact data", details: error });
      }
      res.status(500).json({ error: "Failed to submit contact inquiry" });
    }
  });
  app2.get("/api/contact", async (_req, res) => {
    try {
      const inquiries = await storage.getAllContactInquiries();
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contact inquiries" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// api/index.ts
var app = express();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] ${req.method} ${req.url}`);
  next();
});
var routesRegistered = false;
async function ensureRoutes() {
  if (!routesRegistered) {
    try {
      console.log("Initializing routes...");
      const games2 = await storage.getAllGames();
      console.log(`Storage initialized with ${games2.length} games`);
      await registerRoutes(app);
      routesRegistered = true;
      console.log("Routes registered successfully");
    } catch (error) {
      console.error("Error registering routes:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace");
      throw error;
    }
  }
}
async function handler(req, res) {
  try {
    console.log(`Handling request: ${req.method} ${req.url}`);
    await ensureRoutes();
    return new Promise((resolve, reject) => {
      app(req, res, (err) => {
        if (err) {
          console.error("Express error:", err);
          console.error("Error stack:", err.stack);
          if (!res.headersSent) {
            res.status(500).json({
              error: "Internal server error",
              message: err.message,
              stack: process.env.NODE_ENV === "development" ? err.stack : void 0
            });
          }
          reject(err);
        } else {
          resolve(void 0);
        }
      });
    });
  } catch (error) {
    console.error("Handler error:", error);
    console.error("Error details:", error instanceof Error ? error.stack : String(error));
    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to initialize server",
        message: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : void 0
      });
    }
  }
}
export {
  handler as default
};
