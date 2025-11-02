import { 
  type User, 
  type InsertUser, 
  type Game, 
  type InsertGame,
  type Bet,
  type InsertBet,
  type Result,
  type InsertResult,
  type Winning,
  type InsertWinning,
  type GameCode,
  type InsertGameCode,
  type AviatorSession,
  type InsertAviatorSession,
  type ForumPost,
  type InsertForumPost,
  type ForumComment,
  type InsertForumComment,
  type ContactInquiry,
  type InsertContactInquiry,
  GameType
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getGame(id: string): Promise<Game | undefined>;
  getGameByType(type: string): Promise<Game | undefined>;
  getAllGames(): Promise<Game[]>;
  createGame(game: InsertGame): Promise<Game>;
  
  getBet(id: string): Promise<Bet | undefined>;
  getAllBets(): Promise<Bet[]>;
  getBetsByGame(gameId: string): Promise<Bet[]>;
  createBet(bet: InsertBet): Promise<Bet>;
  
  getResult(id: string): Promise<Result | undefined>;
  getAllResults(): Promise<Result[]>;
  getResultsByGame(gameId: string): Promise<Result[]>;
  getLatestResult(gameId: string): Promise<Result | undefined>;
  createResult(result: InsertResult): Promise<Result>;
  
  getWinning(id: string): Promise<Winning | undefined>;
  getWinningByBet(betId: string): Promise<Winning | undefined>;
  getAllWinnings(): Promise<Winning[]>;
  createWinning(winning: InsertWinning): Promise<Winning>;

  updateBetOutcome(betId: string, status: string, payout: number | null, resultId: string): Promise<Bet | undefined>;
  
  getGameCode(code: string): Promise<GameCode | undefined>;
  createGameCode(gameCode: InsertGameCode): Promise<GameCode>;
  useGameCode(code: string): Promise<boolean>;
  
  getAviatorSession(id: string): Promise<AviatorSession | undefined>;
  getAviatorSessionByBet(betId: string): Promise<AviatorSession | undefined>;
  createAviatorSession(session: InsertAviatorSession): Promise<AviatorSession>;
  updateAviatorSession(id: string, updates: Partial<AviatorSession>): Promise<AviatorSession | undefined>;
  
  getForumPost(id: string): Promise<ForumPost | undefined>;
  getAllForumPosts(): Promise<ForumPost[]>;
  getForumPostsByGameType(gameType: string): Promise<ForumPost[]>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  
  getForumComment(id: string): Promise<ForumComment | undefined>;
  getForumCommentsByPost(postId: string): Promise<ForumComment[]>;
  createForumComment(comment: InsertForumComment): Promise<ForumComment>;
  
  getContactInquiry(id: string): Promise<ContactInquiry | undefined>;
  getAllContactInquiries(): Promise<ContactInquiry[]>;
  createContactInquiry(inquiry: InsertContactInquiry): Promise<ContactInquiry>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private games: Map<string, Game>;
  private bets: Map<string, Bet>;
  private results: Map<string, Result>;
  private winnings: Map<string, Winning>;
  private gameCodes: Map<string, GameCode>;
  private aviatorSessions: Map<string, AviatorSession>;
  private forumPosts: Map<string, ForumPost>;
  private forumComments: Map<string, ForumComment>;
  private contactInquiries: Map<string, ContactInquiry>;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.bets = new Map();
    this.results = new Map();
    this.winnings = new Map();
    this.gameCodes = new Map();
    this.aviatorSessions = new Map();
    this.forumPosts = new Map();
    this.forumComments = new Map();
    this.contactInquiries = new Map();
    
    this.seedGames();
    this.seedGameCodes();
    this.seedForumPosts();
  }

  private seedGames() {
    const gamesToSeed: InsertGame[] = [
      {
        type: GameType.VIRTUAL,
        name: 'Virtual Betting',
        description: 'Weekly rounds with countdown timer. Runs for 35 virtual weeks with instant results!',
        minNumber: 0,
        maxNumber: 40,
        minOdds: 1.01,
        maxOdds: 7.00,
        numbersToSelect: 5,
        minMatches: 3,
        hasBonus: false,
      },
      {
        type: GameType.MINOR,
        name: 'Minor Game',
        description: 'Main game category - Minor. Pick 5 numbers from 0-40 and match 3+ to win!',
        minNumber: 0,
        maxNumber: 40,
        minOdds: 1.01,
        maxOdds: 7.00,
        numbersToSelect: 5,
        minMatches: 3,
        hasBonus: false,
      },
      {
        type: GameType.MAJOR,
        name: 'Major Game',
        description: 'Main game category - Major. Pick 7 numbers from 0-60 and match 3+ to win big!',
        minNumber: 0,
        maxNumber: 60,
        minOdds: 1.01,
        maxOdds: 13.00,
        numbersToSelect: 7,
        minMatches: 3,
        hasBonus: false,
      },
      {
        type: GameType.MEGA,
        name: 'Mega Game',
        description: 'Main game category - Mega. Pick 10 numbers from 0-90 and match 5+ for mega wins!',
        minNumber: 0,
        maxNumber: 90,
        minOdds: 1.01,
        maxOdds: 17.00,
        numbersToSelect: 10,
        minMatches: 5,
        hasBonus: false,
      },
      {
        type: GameType.NOON,
        name: 'Noon Game',
        description: 'Daily noon draw at 12:00 PM. Pick 3 numbers plus bonus from 0-25!',
        minNumber: 0,
        maxNumber: 25,
        minOdds: 1.01,
        maxOdds: 12.00,
        numbersToSelect: 3,
        minMatches: 2,
        hasBonus: true,
      },
      {
        type: GameType.NIGHT,
        name: 'Night Game',
        description: 'Daily night draw at 12:00 AM. Pick 3 numbers plus bonus from 0-25!',
        minNumber: 0,
        maxNumber: 25,
        minOdds: 1.01,
        maxOdds: 12.00,
        numbersToSelect: 3,
        minMatches: 2,
        hasBonus: true,
      },
      {
        type: GameType.AVIATOR,
        name: 'Number Aviator',
        description: 'Fast-paced number predictions with multiplier bonuses. Select 3 numbers and watch your winnings soar!',
        minNumber: 1,
        maxNumber: 36,
        minOdds: 3,
        maxOdds: 8,
        numbersToSelect: 3,
        minMatches: 2,
        hasBonus: false,
      },
    ];

    gamesToSeed.forEach(game => {
      const id = randomUUID();
      this.games.set(id, { 
        ...game, 
        id,
        description: game.description ?? null,
        hasBonus: game.hasBonus ?? false,
      });
    });
  }

  private seedForumPosts() {
    const postsToSeed: Array<{ post: InsertForumPost; comments: string[] }> = [
      {
        post: {
          authorName: "Lucky_Winner_NG",
          title: "🎉 Just won ₦250,000 on Mega Game!",
          contentType: "win_story",
          gameType: GameType.MEGA,
          content: "Brothers and sisters! I picked these numbers on Mega: 12, 24, 36, 48, 60, 72, 84, 90, 18, 42. Got 7 matches and won big! God is good! 🙏",
        },
        comments: [
          "Congratulations! 🎉 What were your odds?",
          "This is inspiring! Going to try Mega game now",
          "Amazing win! Please share more winning numbers",
        ],
      },
      {
        post: {
          authorName: "GamerKE",
          title: "Virtual Betting Week 15 - Hot Numbers!",
          contentType: "lucky_numbers",
          gameType: GameType.VIRTUAL,
          content: "These numbers have been coming up frequently in Virtual this week: 7, 14, 21, 28, 35. Try combining them with your lucky numbers. Good luck!",
        },
        comments: [
          "Thank you! Will try this combination today",
          "I noticed 14 and 28 came up 3 times this week already",
          "Using these numbers now. Fingers crossed! 🤞",
        ],
      },
      {
        post: {
          authorName: "ProGamer_ZA",
          title: "Game Code for Minor: MEGA500",
          contentType: "game_code",
          gameType: GameType.MINOR,
          content: "Use code MEGA500 for bonus on Minor game. Valid until midnight. Share with friends!",
        },
        comments: [
          "Code worked! Thanks so much",
          "Does this work in South Africa?",
          "Already used it. Amazing bonus!",
        ],
      },
      {
        post: {
          authorName: "NightOwl_GH",
          title: "Night Game Strategy - Consistent Wins",
          contentType: "suggestion",
          gameType: GameType.NIGHT,
          content: "I've been playing Night Game for 2 months. My strategy: Pick numbers divisible by 5 (5, 10, 15, 20, 25) and let the system generate the bonus. Won 15 out of 30 games! What's your strategy?",
        },
        comments: [
          "Interesting approach! I'll test this out",
          "I use consecutive numbers and it's working well",
          "Thanks for sharing! This community is the best 👍",
          "Do you play every night or just certain days?",
        ],
      },
      {
        post: {
          authorName: "MajorWinner_TZ",
          title: "Major Game Winning Numbers - Today's Draw",
          contentType: "lucky_numbers",
          gameType: GameType.MAJOR,
          content: "Today's hot numbers for Major: 8, 16, 24, 32, 40, 48, 56. These have the best odds this week. Remember to pick 7 numbers total!",
        },
        comments: [
          "Perfect timing! About to place my bet",
          "These numbers look good. Going all in! 💪",
        ],
      },
      {
        post: {
          authorName: "SmartBetter_UG",
          title: "Noon Game Code: NOON123 - 50% Bonus",
          contentType: "game_code",
          gameType: GameType.NOON,
          content: "Active code for Noon game: NOON123. Gives 50% bonus on your stake. Valid for today's draw only. Don't miss it!",
        },
        comments: [
          "Just used it! Works perfectly",
          "Is there a maximum stake for the bonus?",
          "Thank you! This will help me win big today",
        ],
      },
      {
        post: {
          authorName: "Aviator_Pro_RW",
          title: "Aviator Tips - How I Went from ₦5k to ₦150k",
          contentType: "suggestion",
          gameType: GameType.AVIATOR,
          content: "Aviator Strategy: 1) Start small, 2) Cash out at 2x-3x multiplier (don't be greedy), 3) Pick numbers based on time (hour + minute), 4) Set auto cash out. This method has been working for me consistently. Stay disciplined!",
        },
        comments: [
          "This is gold! Thanks for sharing the strategy",
          "I've been too greedy. Will follow your 2x-3x rule",
          "What time of day gives best results?",
          "Tried this yesterday and made ₦20k profit! 🚀",
        ],
      },
      {
        post: {
          authorName: "VirtualKing_ET",
          title: "Virtual Week 22 Analysis - Top Patterns",
          contentType: "suggestion",
          gameType: GameType.VIRTUAL,
          content: "After analyzing week 22 draws, I noticed: Even numbers appearing 65% of the time, numbers ending in 0 or 5 appearing in 8 out of 10 draws. Adjust your picks accordingly!",
        },
        comments: [
          "Statistical approach! Love it 📊",
          "Can you share more analysis like this?",
          "This helped me understand the game better",
        ],
      },
      {
        post: {
          authorName: "DailyWinner_MA",
          title: "Minor Game Code: WIN200 - Limited Time!",
          contentType: "game_code",
          gameType: GameType.MINOR,
          content: "Hurry! Use WIN200 for bonus on Minor game. Only 100 uses available. First come, first served!",
        },
        comments: [
          "Got it! Number 47 here 😊",
          "Still working as of 2 minutes ago",
        ],
      },
      {
        post: {
          authorName: "BlessingFromAbove",
          title: "My Testimony - God Used AfriBet to Bless Me",
          contentType: "win_story",
          gameType: GameType.MEGA,
          content: "I was struggling to pay my daughter's school fees. Played Mega with my last ₦2,000. Picked numbers from her birth date and won ₦580,000! God is faithful. Never give up!",
        },
        comments: [
          "Glory to God! Congratulations 🙏",
          "This brought tears to my eyes. So happy for you!",
          "May God continue to bless you and your family",
          "Testimonies like this give me hope. Thank you for sharing",
        ],
      },
      {
        post: {
          authorName: "NoonGameExpert",
          title: "Noon Game - Best Time to Play",
          contentType: "suggestion",
          gameType: GameType.NOON,
          content: "Pro tip: Submit your Noon game picks between 11:00-11:30 AM. The system generates fresh bonus numbers during this window. I've won 40% more using this timing!",
        },
        comments: [
          "Never knew timing matters! Thanks",
          "Will definitely try this tomorrow",
        ],
      },
      {
        post: {
          authorName: "AfricaUnite_CM",
          title: "Playing from Cameroon - We're Winning Too!",
          contentType: "win_story",
          gameType: GameType.VIRTUAL,
          content: "Shoutout to all Cameroon players! AfriBet Games is truly pan-African. Won ₦85,000 on Virtual this week. The platform works perfectly across all African countries. Let's keep winning! 🇨🇲",
        },
        comments: [
          "Representing from Ghana! 🇬🇭",
          "Nigeria here! We're all one Africa 🇳🇬",
          "Love this unity! Kenya player here 🇰🇪",
        ],
      },
    ];

    postsToSeed.forEach(({ post, comments }) => {
      const postId = randomUUID();
      const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      
      this.forumPosts.set(postId, {
        ...post,
        id: postId,
        createdAt,
      });

      comments.forEach((commentText, index) => {
        const commentId = randomUUID();
        const commentCreatedAt = new Date(createdAt.getTime() + (index + 1) * 60 * 60 * 1000);
        
        this.forumComments.set(commentId, {
          id: commentId,
          postId,
          authorName: `Player${Math.floor(Math.random() * 1000)}`,
          comment: commentText,
          createdAt: commentCreatedAt,
        });
      });
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getGame(id: string): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async getGameByType(type: string): Promise<Game | undefined> {
    return Array.from(this.games.values()).find(
      (game) => game.type === type,
    );
  }

  async getAllGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = randomUUID();
    const game: Game = { 
      ...insertGame, 
      id,
      description: insertGame.description ?? null,
      hasBonus: insertGame.hasBonus ?? false,
    };
    this.games.set(id, game);
    return game;
  }

  async getBet(id: string): Promise<Bet | undefined> {
    return this.bets.get(id);
  }

  async getAllBets(): Promise<Bet[]> {
    return Array.from(this.bets.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getBetsByGame(gameId: string): Promise<Bet[]> {
    return Array.from(this.bets.values())
      .filter(bet => bet.gameId === gameId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createBet(insertBet: InsertBet): Promise<Bet> {
    const id = randomUUID();
    const bet: Bet = {
      id,
      gameId: insertBet.gameId,
      selectedNumbers: JSON.stringify(insertBet.selectedNumbers),
      bonusNumber: insertBet.bonusNumber ?? null,
      stakeAmount: insertBet.stakeAmount,
      potentialWinning: insertBet.potentialWinning ?? null,
      status: 'pending',
      payout: null,
      resultId: null,
      createdAt: new Date(),
    };
    this.bets.set(id, bet);
    return bet;
  }

  async getResult(id: string): Promise<Result | undefined> {
    return this.results.get(id);
  }

  async getAllResults(): Promise<Result[]> {
    return Array.from(this.results.values()).sort((a, b) => 
      new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime()
    );
  }

  async getResultsByGame(gameId: string): Promise<Result[]> {
    return Array.from(this.results.values())
      .filter(result => result.gameId === gameId)
      .sort((a, b) => new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime());
  }

  async getLatestResult(gameId: string): Promise<Result | undefined> {
    const results = await this.getResultsByGame(gameId);
    return results[0];
  }

  async createResult(insertResult: InsertResult): Promise<Result> {
    const id = randomUUID();
    const result: Result = {
      id,
      gameId: insertResult.gameId,
      drawDate: insertResult.drawDate,
      winningNumbers: JSON.stringify(insertResult.winningNumbers),
      bonusNumber: insertResult.bonusNumber ?? null,
      odds: JSON.stringify(insertResult.odds),
    };
    this.results.set(id, result);
    return result;
  }

  async getWinning(id: string): Promise<Winning | undefined> {
    return this.winnings.get(id);
  }

  async getWinningByBet(betId: string): Promise<Winning | undefined> {
    return Array.from(this.winnings.values()).find(
      (winning) => winning.betId === betId,
    );
  }

  async getAllWinnings(): Promise<Winning[]> {
    return Array.from(this.winnings.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createWinning(insertWinning: InsertWinning): Promise<Winning> {
    const id = randomUUID();
    const winning: Winning = {
      id,
      betId: insertWinning.betId,
      resultId: insertWinning.resultId,
      matchedNumbers: JSON.stringify(insertWinning.matchedNumbers),
      matchedCount: insertWinning.matchedCount,
      winningAmount: insertWinning.winningAmount,
      createdAt: new Date(),
    };
    this.winnings.set(id, winning);
    return winning;
  }

  async updateBetOutcome(betId: string, status: string, payout: number | null, resultId: string): Promise<Bet | undefined> {
    const bet = this.bets.get(betId);
    if (!bet) return undefined;
    
    const updatedBet: Bet = {
      ...bet,
      status,
      payout,
      resultId,
    };
    this.bets.set(betId, updatedBet);
    return updatedBet;
  }

  private seedGameCodes() {
    const codes: InsertGameCode[] = [
      {
        code: 'WELCOME100',
        gameId: '',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usesRemaining: 100,
      },
      {
        code: 'VIP2024',
        gameId: '',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        usesRemaining: null,
      },
    ];

    codes.forEach(code => {
      const id = randomUUID();
      this.gameCodes.set(code.code, {
        id,
        code: code.code,
        gameId: code.gameId,
        expiresAt: code.expiresAt ?? null,
        usesRemaining: code.usesRemaining ?? null,
        createdAt: new Date(),
      });
    });
  }

  async getGameCode(code: string): Promise<GameCode | undefined> {
    return this.gameCodes.get(code);
  }

  async createGameCode(insertGameCode: InsertGameCode): Promise<GameCode> {
    const id = randomUUID();
    const gameCode: GameCode = {
      id,
      code: insertGameCode.code,
      gameId: insertGameCode.gameId,
      expiresAt: insertGameCode.expiresAt ?? null,
      usesRemaining: insertGameCode.usesRemaining ?? null,
      createdAt: new Date(),
    };
    this.gameCodes.set(insertGameCode.code, gameCode);
    return gameCode;
  }

  async useGameCode(code: string): Promise<boolean> {
    const gameCode = this.gameCodes.get(code);
    if (!gameCode) return false;
    
    if (gameCode.expiresAt && new Date(gameCode.expiresAt) < new Date()) {
      return false;
    }
    
    if (gameCode.usesRemaining !== null) {
      if (gameCode.usesRemaining <= 0) return false;
      
      const updatedCode: GameCode = {
        ...gameCode,
        usesRemaining: gameCode.usesRemaining - 1,
      };
      this.gameCodes.set(code, updatedCode);
    }
    
    return true;
  }

  async getAviatorSession(id: string): Promise<AviatorSession | undefined> {
    return this.aviatorSessions.get(id);
  }

  async getAviatorSessionByBet(betId: string): Promise<AviatorSession | undefined> {
    return Array.from(this.aviatorSessions.values()).find(
      (session) => session.betId === betId,
    );
  }

  async createAviatorSession(insertSession: InsertAviatorSession): Promise<AviatorSession> {
    const id = randomUUID();
    const session: AviatorSession = {
      id,
      betId: insertSession.betId,
      startMultiplier: insertSession.startMultiplier ?? 1.0,
      currentMultiplier: insertSession.currentMultiplier,
      crashMultiplier: insertSession.crashMultiplier,
      status: insertSession.status ?? 'active',
      autoCashOutAt: insertSession.autoCashOutAt ?? null,
      cashedOutAt: insertSession.cashedOutAt ?? null,
      cashedOutAmount: insertSession.cashedOutAmount ?? null,
      multiplierHistory: JSON.stringify(insertSession.multiplierHistory),
      createdAt: new Date(),
      completedAt: null,
    };
    this.aviatorSessions.set(id, session);
    return session;
  }

  async updateAviatorSession(id: string, updates: Partial<AviatorSession>): Promise<AviatorSession | undefined> {
    const session = this.aviatorSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession: AviatorSession = {
      ...session,
      ...updates,
    };
    this.aviatorSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getForumPost(id: string): Promise<ForumPost | undefined> {
    return this.forumPosts.get(id);
  }

  async getAllForumPosts(): Promise<ForumPost[]> {
    return Array.from(this.forumPosts.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getForumPostsByGameType(gameType: string): Promise<ForumPost[]> {
    return Array.from(this.forumPosts.values())
      .filter(post => post.gameType === gameType)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createForumPost(insertPost: InsertForumPost): Promise<ForumPost> {
    const id = randomUUID();
    const post: ForumPost = {
      id,
      authorName: insertPost.authorName,
      title: insertPost.title,
      contentType: insertPost.contentType,
      gameType: insertPost.gameType,
      content: insertPost.content,
      createdAt: new Date(),
    };
    this.forumPosts.set(id, post);
    return post;
  }

  async getForumComment(id: string): Promise<ForumComment | undefined> {
    return this.forumComments.get(id);
  }

  async getForumCommentsByPost(postId: string): Promise<ForumComment[]> {
    return Array.from(this.forumComments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createForumComment(insertComment: InsertForumComment): Promise<ForumComment> {
    const id = randomUUID();
    const comment: ForumComment = {
      id,
      postId: insertComment.postId,
      authorName: insertComment.authorName,
      comment: insertComment.comment,
      createdAt: new Date(),
    };
    this.forumComments.set(id, comment);
    return comment;
  }

  async getContactInquiry(id: string): Promise<ContactInquiry | undefined> {
    return this.contactInquiries.get(id);
  }

  async getAllContactInquiries(): Promise<ContactInquiry[]> {
    return Array.from(this.contactInquiries.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createContactInquiry(insertInquiry: InsertContactInquiry): Promise<ContactInquiry> {
    const id = randomUUID();
    const inquiry: ContactInquiry = {
      id,
      name: insertInquiry.name,
      email: insertInquiry.email,
      phone: insertInquiry.phone ?? null,
      subject: insertInquiry.subject,
      message: insertInquiry.message,
      type: insertInquiry.type ?? 'general',
      status: 'new',
      createdAt: new Date(),
    };
    this.contactInquiries.set(id, inquiry);
    return inquiry;
  }
}

export const storage = new MemStorage();
