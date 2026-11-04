import { neon } from "@neondatabase/serverless";
import { and, asc, desc, eq, gt, gte, isNull, or, sql } from "drizzle-orm";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import {
  aviatorSessions,
  bets,
  contactInquiries,
  forumComments,
  forumPosts,
  gameCodes,
  games,
  results,
  winnings,
  type AviatorSession,
  type Bet,
  type ContactInquiry,
  type ForumComment,
  type ForumPost,
  type Game,
  type GameCode,
  type InsertAviatorSession,
  type InsertContactInquiry,
  type InsertForumComment,
  type InsertForumPost,
  type InsertGame,
  type InsertGameCode,
  type InsertResult,
  type InsertWinning,
  type NewBet,
  type Result,
  type Winning,
} from "@shared/schema";
import { GAME_CATALOG } from "./game-catalog";
import type { IStorage } from "./storage";

const MAX_LIST_ROWS = 500;

export class DatabaseStorage implements IStorage {
  private readonly db: NeonHttpDatabase;
  private catalogReady: Promise<void> | undefined;

  constructor(connectionString: string) {
    this.db = drizzle(neon(connectionString));
  }

  private ensureCatalog(): Promise<void> {
    if (!this.catalogReady) {
      this.catalogReady = this.db
        .insert(games)
        .values([...GAME_CATALOG])
        .onConflictDoNothing({ target: games.type })
        .then(() => undefined)
        .catch((error) => {
          this.catalogReady = undefined;
          throw error;
        });
    }
    return this.catalogReady;
  }

  async getGame(id: string): Promise<Game | undefined> {
    await this.ensureCatalog();
    return (await this.db.select().from(games).where(eq(games.id, id)).limit(1))[0];
  }

  async getGameByType(type: string): Promise<Game | undefined> {
    await this.ensureCatalog();
    return (await this.db.select().from(games).where(eq(games.type, type)).limit(1))[0];
  }

  async getAllGames(): Promise<Game[]> {
    await this.ensureCatalog();
    return this.db.select().from(games).orderBy(games.name);
  }

  async createGame(game: InsertGame): Promise<Game> {
    return (await this.db.insert(games).values(game).returning())[0];
  }

  async getBet(id: string): Promise<Bet | undefined> {
    return (await this.db.select().from(bets).where(eq(bets.id, id)).limit(1))[0];
  }

  async getAllBets(): Promise<Bet[]> {
    return this.db.select().from(bets).orderBy(desc(bets.createdAt)).limit(MAX_LIST_ROWS);
  }

  async getBetsByGame(gameId: string): Promise<Bet[]> {
    return this.db
      .select()
      .from(bets)
      .where(eq(bets.gameId, gameId))
      .orderBy(desc(bets.createdAt))
      .limit(MAX_LIST_ROWS);
  }

  async createBet(bet: NewBet): Promise<Bet> {
    return (await this.db.insert(bets).values({
      gameId: bet.gameId,
      selectedNumbers: JSON.stringify(bet.selectedNumbers),
      bonusNumber: bet.bonusNumber ?? null,
      stakeAmount: bet.stakeAmount,
      potentialWinning: bet.potentialWinning ?? null,
      status: "pending",
    }).returning())[0];
  }

  async getResult(id: string): Promise<Result | undefined> {
    return (await this.db.select().from(results).where(eq(results.id, id)).limit(1))[0];
  }

  async getAllResults(): Promise<Result[]> {
    return this.db.select().from(results).orderBy(desc(results.drawDate)).limit(MAX_LIST_ROWS);
  }

  async getResultsByGame(gameId: string): Promise<Result[]> {
    return this.db
      .select()
      .from(results)
      .where(eq(results.gameId, gameId))
      .orderBy(desc(results.drawDate))
      .limit(MAX_LIST_ROWS);
  }

  async getLatestResult(gameId: string): Promise<Result | undefined> {
    return (await this.db
      .select()
      .from(results)
      .where(eq(results.gameId, gameId))
      .orderBy(desc(results.drawDate))
      .limit(1))[0];
  }

  async getFirstResultAfter(gameId: string, after: Date): Promise<Result | undefined> {
    return (await this.db
      .select()
      .from(results)
      .where(and(eq(results.gameId, gameId), gte(results.drawDate, after)))
      .orderBy(asc(results.drawDate))
      .limit(1))[0];
  }

  async createResult(result: InsertResult): Promise<Result> {
    return (await this.db.insert(results).values({
      ...result,
      winningNumbers: JSON.stringify(result.winningNumbers),
      bonusNumber: result.bonusNumber ?? null,
      odds: JSON.stringify(result.odds),
    }).returning())[0];
  }

  async getWinning(id: string): Promise<Winning | undefined> {
    return (await this.db.select().from(winnings).where(eq(winnings.id, id)).limit(1))[0];
  }

  async getWinningByBet(betId: string): Promise<Winning | undefined> {
    return (await this.db.select().from(winnings).where(eq(winnings.betId, betId)).limit(1))[0];
  }

  async getAllWinnings(): Promise<Winning[]> {
    return this.db.select().from(winnings).orderBy(desc(winnings.createdAt)).limit(MAX_LIST_ROWS);
  }

  async createWinning(winning: InsertWinning): Promise<Winning> {
    const inserted = await this.db.insert(winnings).values({
      ...winning,
      matchedNumbers: JSON.stringify(winning.matchedNumbers),
    }).onConflictDoNothing({ target: winnings.betId }).returning();
    return inserted[0] ?? (await this.getWinningByBet(winning.betId))!;
  }

  async updateBetOutcome(
    betId: string,
    status: string,
    payout: number | null,
    resultId: string | null,
  ): Promise<Bet | undefined> {
    return (await this.db
      .update(bets)
      .set({ status, payout, resultId })
      .where(eq(bets.id, betId))
      .returning())[0];
  }

  async getGameCode(code: string): Promise<GameCode | undefined> {
    return (await this.db
      .select()
      .from(gameCodes)
      .where(eq(gameCodes.code, code.toUpperCase()))
      .limit(1))[0];
  }

  async createGameCode(gameCode: InsertGameCode): Promise<GameCode> {
    return (await this.db.insert(gameCodes).values({
      ...gameCode,
      code: gameCode.code.toUpperCase(),
      gameId: gameCode.gameId ?? null,
      expiresAt: gameCode.expiresAt ?? null,
      usesRemaining: gameCode.usesRemaining ?? null,
    }).returning())[0];
  }

  async useGameCode(code: string): Promise<boolean> {
    const now = new Date();
    const updated = await this.db
      .update(gameCodes)
      .set({ usesRemaining: sql`${gameCodes.usesRemaining} - 1` })
      .where(and(
        eq(gameCodes.code, code.toUpperCase()),
        or(isNull(gameCodes.expiresAt), gt(gameCodes.expiresAt, now)),
        gt(gameCodes.usesRemaining, 0),
      ))
      .returning({ id: gameCodes.id });

    if (updated.length > 0) return true;

    const unlimited = await this.db
      .select({ id: gameCodes.id })
      .from(gameCodes)
      .where(and(
        eq(gameCodes.code, code.toUpperCase()),
        or(isNull(gameCodes.expiresAt), gt(gameCodes.expiresAt, now)),
        isNull(gameCodes.usesRemaining),
      ))
      .limit(1);
    return unlimited.length > 0;
  }

  async getAviatorSession(id: string): Promise<AviatorSession | undefined> {
    return (await this.db.select().from(aviatorSessions).where(eq(aviatorSessions.id, id)).limit(1))[0];
  }

  async getAviatorSessionByBet(betId: string): Promise<AviatorSession | undefined> {
    return (await this.db
      .select()
      .from(aviatorSessions)
      .where(eq(aviatorSessions.betId, betId))
      .limit(1))[0];
  }

  async createAviatorSession(session: InsertAviatorSession): Promise<AviatorSession> {
    return (await this.db.insert(aviatorSessions).values({
      ...session,
      multiplierHistory: JSON.stringify(session.multiplierHistory),
    }).returning())[0];
  }

  async updateAviatorSession(
    id: string,
    updates: Partial<AviatorSession>,
  ): Promise<AviatorSession | undefined> {
    const { id: _id, betId: _betId, createdAt: _createdAt, ...allowed } = updates;
    return (await this.db
      .update(aviatorSessions)
      .set(allowed)
      .where(eq(aviatorSessions.id, id))
      .returning())[0];
  }

  async getForumPost(id: string): Promise<ForumPost | undefined> {
    return (await this.db.select().from(forumPosts).where(eq(forumPosts.id, id)).limit(1))[0];
  }

  async getAllForumPosts(): Promise<ForumPost[]> {
    return this.db.select().from(forumPosts).orderBy(desc(forumPosts.createdAt)).limit(100);
  }

  async getForumPostsByGameType(gameType: string): Promise<ForumPost[]> {
    return this.db
      .select()
      .from(forumPosts)
      .where(eq(forumPosts.gameType, gameType))
      .orderBy(desc(forumPosts.createdAt))
      .limit(100);
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    return (await this.db.insert(forumPosts).values(post).returning())[0];
  }

  async getForumComment(id: string): Promise<ForumComment | undefined> {
    return (await this.db.select().from(forumComments).where(eq(forumComments.id, id)).limit(1))[0];
  }

  async getForumCommentsByPost(postId: string): Promise<ForumComment[]> {
    return this.db
      .select()
      .from(forumComments)
      .where(eq(forumComments.postId, postId))
      .orderBy(forumComments.createdAt)
      .limit(200);
  }

  async createForumComment(comment: InsertForumComment): Promise<ForumComment> {
    return (await this.db.insert(forumComments).values(comment).returning())[0];
  }

  async getContactInquiry(id: string): Promise<ContactInquiry | undefined> {
    return (await this.db
      .select()
      .from(contactInquiries)
      .where(eq(contactInquiries.id, id))
      .limit(1))[0];
  }

  async getAllContactInquiries(): Promise<ContactInquiry[]> {
    return this.db
      .select()
      .from(contactInquiries)
      .orderBy(desc(contactInquiries.createdAt))
      .limit(MAX_LIST_ROWS);
  }

  async createContactInquiry(inquiry: InsertContactInquiry): Promise<ContactInquiry> {
    return (await this.db.insert(contactInquiries).values({
      ...inquiry,
      phone: inquiry.phone ?? null,
      type: inquiry.type ?? "general",
      status: "new",
    }).returning())[0];
  }
}
