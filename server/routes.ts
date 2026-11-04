import type { Express, Request, Response } from "express";
import { randomInt } from "node:crypto";
import { z } from "zod";
import { storage } from "./storage";
import { insertBetSchema, insertResultSchema, insertWinningSchema, insertGameCodeSchema, insertAviatorSessionSchema, insertForumPostSchema, insertForumCommentSchema, insertContactInquirySchema } from "@shared/schema";
import { gameLogic } from "./game-logic";
import { requireAdmin } from "./security";
import { validateBetForGame, validateResultForGame } from "./validation";
import { createAutomatedDemoResult, settleBetAgainstResult } from "./demo-betting";
import {
  infrastructureReadiness,
  launchBlockers,
  operationalCapabilities,
} from "./control-plane";

export async function registerRoutes(app: Express): Promise<void> {
  const publicPreviewMode = process.env.PUBLIC_PREVIEW_MODE === "true";
  const demoDrawsEnabled = process.env.DEMO_DRAW_GENERATION_ENABLED === "true" && process.env.NODE_ENV !== "production";

  const getControlState = async () => {
    const [settings, complianceGates] = await Promise.all([
      storage.getPlatformSettings(),
      storage.getComplianceGates(),
    ]);
    const infrastructure = infrastructureReadiness();
    const capabilities = operationalCapabilities(settings, complianceGates, infrastructure);
    gameLogic.updateConfig({
      houseEdgePercentage: settings.houseEdgePercentage,
      maxDailyPayoutRatio: settings.maxDailyPayoutRatio,
      maxSingleWinMultiplier: settings.maxSingleWinMultiplier,
    });
    return {
      settings,
      complianceGates,
      infrastructure,
      capabilities,
      launchBlockers: launchBlockers(complianceGates, infrastructure),
    };
  };

  const adminActor = (req: Request) =>
    (req.get("x-admin-actor")?.trim().slice(0, 100) || "operator");

  const requirePersistentControlPlane = (res: Response) => {
    if (publicPreviewMode || !process.env.DATABASE_URL?.trim()) {
      res.status(409).json({
        error: "Persistent operator controls require DATABASE_URL and PUBLIC_PREVIEW_MODE=false",
      });
      return false;
    }
    return true;
  };

  const getDemoSessionId = (req: Request): string | undefined => {
    const value = req.get("x-demo-session-id")?.trim();
    return value && z.string().uuid().safeParse(value).success ? value : undefined;
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
      const { amount } = z.object({ amount: z.number().int().min(1_000).max(100_000) }).strict().parse(req.body);
      const wallet = await storage.adjustDemoWallet(sessionId, amount, "top_up");
      if (!wallet) return res.status(409).json({ error: "Demo balance cannot exceed ₦1,000,000" });
      res.json({ wallet, currency: "DEMO NGN", withdrawable: false });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: "Invalid demo top-up", details: error.issues });
      res.status(500).json({ error: "Failed to add demo funds" });
    }
  });
  
  // Get all games
  app.get("/api/games", async (_req, res) => {
    try {
      const games = await storage.getAllGames();
      res.json(games);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch games" });
    }
  });

  // Get game by type
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

  // Place a bet
  app.post("/api/bets", async (req, res) => {
    try {
      const { capabilities } = await getControlState();
      const isDemo = !capabilities.bettingEnabled && capabilities.demoModeEnabled;
      if (!capabilities.bettingEnabled && !isDemo) {
        return res.status(503).json({ error: "Bet placement is disabled until production compliance checks are complete" });
      }
      const validatedBet = insertBetSchema.parse(req.body);
      
      // Get the game to calculate potential winnings
      const game = await storage.getGame(validatedBet.gameId);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }

      const gameValidation = validateBetForGame(validatedBet, game);
      if (!gameValidation.ok) {
        return res.status(400).json({ error: "Invalid bet", details: gameValidation.errors });
      }

      const demoSessionId = isDemo ? getDemoSessionId(req) : undefined;
      if (isDemo && !demoSessionId) return res.status(400).json({ error: "A valid demo session is required" });

      if (!isDemo) gameLogic.recordStake(gameValidation.value.stakeAmount);

      // Calculate theoretical maximum winning with house edge (independent of daily limits)
      const baseMaxWinning = validatedBet.selectedNumbers.length === game.numbersToSelect
        ? Math.pow(game.maxOdds, game.minMatches) * gameValidation.value.stakeAmount
        : gameValidation.value.stakeAmount;

      const theoreticalMaxWinning = Math.min(
        baseMaxWinning,
        gameLogic.getConfig().maxSingleWinMultiplier * gameValidation.value.stakeAmount,
      );

      let demoWallet;
      if (isDemo) {
        demoWallet = await storage.adjustDemoWallet(demoSessionId!, -gameValidation.value.stakeAmount, "stake");
        if (!demoWallet) return res.status(409).json({ error: "Insufficient demo balance. Add demo funds and try again." });
      }

      let bet;
      try {
        bet = await storage.createBet({
          ...gameValidation.value,
          potentialWinning: Math.round(theoreticalMaxWinning * 100) / 100,
          isDemo,
          demoSessionId: demoSessionId ?? null,
        });
      } catch (error) {
        if (isDemo) await storage.adjustDemoWallet(demoSessionId!, gameValidation.value.stakeAmount, "refund");
        throw error;
      }
      
      if (isDemo) {
        try {
          const demoResult = await storage.createResult(createAutomatedDemoResult(game, bet));
          const demoOutcome = await settleBetAgainstResult(storage, gameLogic, bet, game, demoResult);
          demoWallet = demoOutcome.wallet ?? await storage.getDemoWallet(demoSessionId!);
          const settledBet = await storage.getBet(bet.id) ?? bet;
          return res.status(201).json({ ...settledBet, demoResult, demoOutcome, demoWallet });
        } catch (error) {
          const currentBet = await storage.getBet(bet.id);
          if (currentBet?.status === "pending") {
            await storage.adjustDemoWallet(demoSessionId!, gameValidation.value.stakeAmount, "refund", bet.id);
            await storage.updateBetOutcome(bet.id, "voided", 0, null);
          }
          throw error;
        }
      }

      res.status(201).json(bet);
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ error: "Invalid bet data", details: error });
      }
      res.status(500).json({ error: "Failed to create bet" });
    }
  });

  // Get all bets
  app.get("/api/bets", requireAdmin, async (_req, res) => {
    try {
      const bets = await storage.getAllBets();
      res.json(bets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bets" });
    }
  });

  // Get bet by id
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

  // Resolve a ticket only from its full high-entropy ID.
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

  // Create a result
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
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ error: "Invalid result data", details: error });
      }
      res.status(500).json({ error: "Failed to create result" });
    }
  });

  // Get all results
  app.get("/api/results", async (_req, res) => {
    try {
      const results = await storage.getAllResults();
      res.json(results.filter((result) => !result.isDemo));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  // Get results by game
  app.get("/api/results/game/:gameId", async (req, res) => {
    try {
      const results = await storage.getResultsByGame(req.params.gameId);
      res.json(results.filter((result) => !result.isDemo));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  // Get latest result for a game
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

  // Check winning for a bet
  app.post("/api/winnings/check/:betId", async (req, res) => {
    try {
      const bet = await storage.getBet(req.params.betId);
      if (!bet) {
        return res.status(404).json({ error: "Bet not found" });
      }

      // Only a draw published after the bet was accepted can settle it.
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

  // Get all winnings
  app.get("/api/winnings", requireAdmin, async (_req, res) => {
    try {
      const winnings = await storage.getAllWinnings();
      res.json(winnings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch winnings" });
    }
  });

  // Generate random result for a game (for demo purposes)
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

      // Generate random winning numbers
      const winningNumbers: number[] = [];
      while (winningNumbers.length < game.numbersToSelect) {
        const randomNum = randomInt(game.minNumber, game.maxNumber + 1);
        if (!winningNumbers.includes(randomNum)) {
          winningNumbers.push(randomNum);
        }
      }

      // Generate random odds for each number
      const odds = winningNumbers.map(() =>
        randomInt(Math.ceil(game.minOdds * 100), Math.floor(game.maxOdds * 100) + 1) / 100
      );

      // Generate bonus number if applicable
      let bonusNumber: number | undefined;
      if (game.hasBonus) {
        do {
          bonusNumber = randomInt(game.minNumber, game.maxNumber + 1);
        } while (winningNumbers.includes(bonusNumber));
      }

      const result = await storage.createResult({
        gameId: game.id,
        drawDate: new Date(),
        winningNumbers,
        bonusNumber,
        odds,
        isDemo: true,
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate result" });
    }
  });

  // Get daily statistics
  app.get("/api/stats/daily", requireAdmin, async (_req, res) => {
    try {
      const stats = gameLogic.getDailyStatsForDate();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily stats" });
    }
  });

  // Get all daily statistics
  app.get("/api/stats/all", requireAdmin, async (_req, res) => {
    try {
      const stats = gameLogic.getAllDailyStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Get house edge configuration
  app.get("/api/config", requireAdmin, async (_req, res) => {
    try {
      const { settings } = await getControlState();
      res.json({
        houseEdgePercentage: settings.houseEdgePercentage,
        maxDailyPayoutRatio: settings.maxDailyPayoutRatio,
        maxSingleWinMultiplier: settings.maxSingleWinMultiplier,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch config" });
    }
  });

  // Update house edge configuration (admin only in production)
  app.put("/api/config", requireAdmin, async (req, res) => {
    try {
      if (!requirePersistentControlPlane(res)) return;
      const update = z.object({
        houseEdgePercentage: z.number().min(0).max(50).optional(),
        maxDailyPayoutRatio: z.number().min(0).max(1).optional(),
        maxSingleWinMultiplier: z.number().positive().max(1_000_000).optional(),
      }).strict().parse(req.body);
      const before = await storage.getPlatformSettings();
      const settings = await storage.updatePlatformSettings({
        ...update,
        updatedBy: adminActor(req),
      });
      await storage.createOperatorAuditLog({
        actor: adminActor(req),
        action: "risk_config.updated",
        target: "platform_settings",
        details: JSON.stringify({ before, update }),
      });
      gameLogic.updateConfig(update);
      res.json({
        houseEdgePercentage: settings.houseEdgePercentage,
        maxDailyPayoutRatio: settings.maxDailyPayoutRatio,
        maxSingleWinMultiplier: settings.maxSingleWinMultiplier,
      });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: "Invalid risk configuration", details: error.issues });
      res.status(500).json({ error: "Failed to update config" });
    }
  });

  // Get bet outcome (with win/loss status and ticket info)
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
        
        // Use the stored bet status which was set by winnings check
        // A winning record exists means the user matched enough numbers (even if payout was capped to 0)
        status = bet.status;
        outcome = bet.status;
      }

      res.json({
        bet,
        game,
        result,
        winning,
        outcome,
        status,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bet outcome" });
    }
  });

  // Get ticket info for printing
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
          drawDate: result.drawDate,
        } : null,
        winning: winning ? {
          matchedNumbers: JSON.parse(winning.matchedNumbers),
          matchedCount: winning.matchedCount,
          winningAmount: winning.winningAmount,
        } : null,
      };

      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ticket" });
    }
  });

  // Redeem game code
  app.post("/api/codes/redeem", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code || typeof code !== 'string') {
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

  // Create game code
  app.post("/api/codes", requireAdmin, async (req, res) => {
    try {
      const validatedCode = insertGameCodeSchema.parse(req.body);
      const gameCode = await storage.createGameCode(validatedCode);
      res.status(201).json(gameCode);
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ error: "Invalid code data", details: error });
      }
      res.status(500).json({ error: "Failed to create code" });
    }
  });

  // Create aviator session
  app.post("/api/aviator/session", requireAdmin, async (req, res) => {
    try {
      const validatedSession = insertAviatorSessionSchema.parse(req.body);
      const session = await storage.createAviatorSession(validatedSession);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ error: "Invalid session data", details: error });
      }
      res.status(500).json({ error: "Failed to create aviator session" });
    }
  });

  // Get aviator session by bet ID
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

  // Cash out from aviator
  app.post("/api/aviator/cashout/:sessionId", async (req, res) => {
    try {
      const session = await storage.getAviatorSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (session.status !== 'active') {
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
        status: 'cashed_out',
        cashedOutAt: multiplier,
        cashedOutAmount,
        completedAt: new Date(),
      });

      await storage.updateBetOutcome(session.betId, 'won', cashedOutAmount, null);

      res.json({
        session: updatedSession,
        cashedOutAmount,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to cash out" });
    }
  });

  // Complete aviator session (crashed)
  app.post("/api/aviator/crash/:sessionId", requireAdmin, async (req, res) => {
    try {
      const session = await storage.getAviatorSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const updatedSession = await storage.updateAviatorSession(req.params.sessionId, {
        status: 'crashed',
        completedAt: new Date(),
      });

      await storage.updateBetOutcome(session.betId, 'lost', 0, null);

      res.json({ session: updatedSession });
    } catch (error) {
      res.status(500).json({ error: "Failed to complete aviator session" });
    }
  });

  // Get all forum posts
  app.get("/api/forum/posts", async (req, res) => {
    try {
      const { gameType } = req.query;
      const posts = gameType 
        ? await storage.getForumPostsByGameType(gameType as string)
        : await storage.getAllForumPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch forum posts" });
    }
  });

  // Get forum post by id
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

  // Create forum post
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
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ error: "Invalid post data", details: error });
      }
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  // Get comments for a post
  app.get("/api/forum/posts/:postId/comments", async (req, res) => {
    try {
      const comments = await storage.getForumCommentsByPost(req.params.postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  // Create comment
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
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ error: "Invalid comment data", details: error });
      }
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  // Create contact inquiry
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
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ error: "Invalid contact data", details: error });
      }
      res.status(500).json({ error: "Failed to submit contact inquiry" });
    }
  });

  // Get all contact inquiries
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
      const [control, bets, winnings, results, inquiries, games, auditLogs] = await Promise.all([
        getControlState(),
        storage.getAllBets(),
        storage.getAllWinnings(),
        storage.getAllResults(),
        storage.getAllContactInquiries(),
        storage.getAllGames(),
        storage.getOperatorAuditLogs(),
      ]);
      const realBets = bets.filter((bet) => !bet.isDemo);
      const demoBets = bets.filter((bet) => bet.isDemo);
      const realBetIds = new Set(realBets.map((bet) => bet.id));
      const demoBetIds = new Set(demoBets.map((bet) => bet.id));
      res.setHeader("Cache-Control", "no-store, private");
      res.json({
        ...control,
        metrics: {
          totalBets: realBets.length,
          pendingBets: realBets.filter((bet) => bet.status === "pending").length,
          totalStaked: realBets.reduce((sum, bet) => sum + bet.stakeAmount, 0),
          totalPaid: winnings.filter((winning) => realBetIds.has(winning.betId)).reduce((sum, winning) => sum + winning.winningAmount, 0),
          publishedResults: results.filter((result) => !result.isDemo).length,
          openInquiries: inquiries.filter((inquiry) => inquiry.status === "new").length,
          demoBets: demoBets.length,
          demoStaked: demoBets.reduce((sum, bet) => sum + bet.stakeAmount, 0),
          demoPaid: winnings.filter((winning) => demoBetIds.has(winning.betId)).reduce((sum, winning) => sum + winning.winningAmount, 0),
        },
        games,
        recentBets: bets.slice(0, 10),
        recentResults: results.slice(0, 10),
        recentInquiries: inquiries.slice(0, 10),
        auditLogs,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to load the operator control plane" });
    }
  });

  app.put("/api/admin/features", requireAdmin, async (req, res) => {
    try {
      if (!requirePersistentControlPlane(res)) return;
      const update = z.object({
        bettingEnabled: z.boolean().optional(),
        communityPostingEnabled: z.boolean().optional(),
        contactSubmissionsEnabled: z.boolean().optional(),
        maintenanceMode: z.boolean().optional(),
        demoModeEnabled: z.boolean().optional(),
      }).strict().refine((value) => Object.keys(value).length > 0, "At least one feature must be supplied").parse(req.body);

      const control = await getControlState();
      if (update.bettingEnabled === true && control.launchBlockers.length > 0) {
        return res.status(409).json({
          error: "Betting cannot be enabled until every launch gate is complete",
          blockers: control.launchBlockers,
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
        details: JSON.stringify({ before: control.settings, update }),
      });
      const refreshed = await getControlState();
      res.json({ settings, capabilities: refreshed.capabilities, launchBlockers: refreshed.launchBlockers });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: "Invalid feature configuration", details: error.issues });
      res.status(500).json({ error: "Failed to update feature controls" });
    }
  });

  app.put("/api/admin/compliance/:key", requireAdmin, async (req, res) => {
    try {
      if (!requirePersistentControlPlane(res)) return;
      const update = z.object({
        status: z.enum(["pending", "complete", "blocked"]),
        evidence: z.string().trim().max(2_000).nullable().optional(),
        reviewedBy: z.string().trim().max(100).nullable().optional(),
      }).strict().parse(req.body);
      if (update.status === "complete" && (!update.evidence || update.evidence.length < 10 || !update.reviewedBy || update.reviewedBy.length < 2)) {
        return res.status(400).json({ error: "Completed gates require evidence and a reviewer" });
      }

      const before = (await storage.getComplianceGates()).find((gate) => gate.key === req.params.key);
      if (!before) return res.status(404).json({ error: "Compliance gate not found" });
      const gate = await storage.updateComplianceGate(req.params.key, {
        status: update.status,
        evidence: update.evidence ?? null,
        reviewedBy: update.reviewedBy ?? null,
        reviewedAt: update.status === "complete" ? new Date() : null,
      });
      await storage.createOperatorAuditLog({
        actor: adminActor(req),
        action: "compliance_gate.updated",
        target: req.params.key,
        details: JSON.stringify({ before, after: gate }),
      });
      const control = await getControlState();
      res.json({ gate, launchBlockers: control.launchBlockers, capabilities: control.capabilities });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: "Invalid compliance update", details: error.issues });
      res.status(500).json({ error: "Failed to update compliance gate" });
    }
  });

}
