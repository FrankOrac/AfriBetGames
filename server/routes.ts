import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBetSchema, insertResultSchema, insertWinningSchema, insertGameCodeSchema, insertAviatorSessionSchema, insertForumPostSchema, insertForumCommentSchema, insertContactInquirySchema } from "@shared/schema";
import { gameLogic } from "./game-logic";

export async function registerRoutes(app: Express): Promise<Server> {
  
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
      const validatedBet = insertBetSchema.parse(req.body);
      
      // Get the game to calculate potential winnings
      const game = await storage.getGame(validatedBet.gameId);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }

      // Record stake for daily tracking
      gameLogic.recordStake(validatedBet.stakeAmount);

      // Calculate theoretical maximum winning with house edge (independent of daily limits)
      const baseMaxWinning = validatedBet.selectedNumbers.length === game.numbersToSelect
        ? Math.pow(game.maxOdds, game.minMatches) * validatedBet.stakeAmount
        : validatedBet.stakeAmount;

      // Apply only house edge to show theoretical maximum (don't apply daily limits yet)
      const houseEdgeMultiplier = (100 - gameLogic.getConfig().houseEdgePercentage) / 100;
      const theoreticalMaxWinning = baseMaxWinning * houseEdgeMultiplier;

      const bet = await storage.createBet({
        ...validatedBet,
        potentialWinning: theoreticalMaxWinning,
      });
      
      res.status(201).json(bet);
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ error: "Invalid bet data", details: error });
      }
      res.status(500).json({ error: "Failed to create bet" });
    }
  });

  // Get all bets
  app.get("/api/bets", async (_req, res) => {
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

  // Search bet by short code (first 8 characters of ID)
  app.get("/api/bets/search/:code", async (req, res) => {
    try {
      const code = req.params.code.toLowerCase();
      if (code.length !== 8) {
        return res.status(400).json({ error: "Short code must be 8 characters" });
      }

      const allBets = await storage.getAllBets();
      const foundBet = allBets.find(bet => bet.id.toLowerCase().startsWith(code));

      if (!foundBet) {
        return res.status(404).json({ error: "Bet not found with that code" });
      }

      res.json({ betId: foundBet.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to search for bet" });
    }
  });

  // Create a result
  app.post("/api/results", async (req, res) => {
    try {
      const validatedResult = insertResultSchema.parse(req.body);
      const result = await storage.createResult(validatedResult);
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
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  // Get results by game
  app.get("/api/results/game/:gameId", async (req, res) => {
    try {
      const results = await storage.getResultsByGame(req.params.gameId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  // Get latest result for a game
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

  // Check winning for a bet
  app.post("/api/winnings/check/:betId", async (req, res) => {
    try {
      const bet = await storage.getBet(req.params.betId);
      if (!bet) {
        return res.status(404).json({ error: "Bet not found" });
      }

      // Get the latest result for the game
      const result = await storage.getLatestResult(bet.gameId);
      if (!result) {
        return res.status(404).json({ error: "No results available for this game yet" });
      }

      const selectedNumbers = JSON.parse(bet.selectedNumbers) as number[];
      const winningNumbers = JSON.parse(result.winningNumbers) as number[];
      const odds = JSON.parse(result.odds) as number[];

      // Find matched numbers - ensure duplicates are only counted once
      // Create a Set of unique selected numbers first
      const uniqueSelectedNumbers = Array.from(new Set(selectedNumbers));
      const matchedNumbers = uniqueSelectedNumbers.filter(num => winningNumbers.includes(num));
      const matchedCount = matchedNumbers.length;

      // Check if bonus number matched (for games with bonus)
      const bonusMatched = bet.bonusNumber !== null && 
                          bet.bonusNumber === result.bonusNumber;

      // Get game to check minimum matches
      const game = await storage.getGame(bet.gameId);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }

      // Check if winning already exists (avoid recalculation and side effects)
      const existingWinning = await storage.getWinningByBet(bet.id);
      
      if (existingWinning && matchedCount >= game.minMatches) {
        // Retrieve stored metadata for existing winning
        const metadata = gameLogic.getWinningMetadata(bet.id);
        const houseEdgeApplied = metadata?.houseEdgeApplied ?? false;
        const singleWinCapApplied = metadata?.singleWinCapApplied ?? false;
        const dailyCapApplied = metadata?.dailyCapApplied ?? false;
        const limitApplied = singleWinCapApplied || dailyCapApplied;
        
        // Provide clear messaging based on which caps apply
        let message = undefined;
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
        } else if (houseEdgeApplied) {
          message = "Congratulations! You won!";
        }
        
        return res.json({ 
          won: true, 
          winning: existingWinning,
          bonusMatched,
          houseEdgeApplied,
          limitApplied,
          singleWinCapApplied,
          dailyCapApplied,
          message,
        });
      }

      // Calculate winnings (first time only)
      let winningAmount = 0;
      let houseEdgeApplied = false;
      let limitApplied = false;
      
      if (matchedCount >= game.minMatches) {
        // Get odds for matched numbers
        const matchedOdds = matchedNumbers.map(num => {
          const index = winningNumbers.indexOf(num);
          return odds[index] || 1;
        });

        // Multiply all matched odds together, then multiply by stake
        let baseWinning = matchedOdds.reduce((acc, odd) => acc * odd, 1) * bet.stakeAmount;

        // Apply bonus multiplier if applicable
        if (bonusMatched && game.hasBonus) {
          baseWinning *= 1.5; // 50% bonus multiplier
        }

        // Apply house edge and daily limits (ONLY ONCE - metadata is stored)
        const winningResult = gameLogic.calculateWinningAmount(baseWinning, bet.stakeAmount, bet.id);
        winningAmount = winningResult.finalAmount;
        houseEdgeApplied = winningResult.metadata.houseEdgeApplied;
        const singleWinCapApplied = winningResult.metadata.singleWinCapApplied;
        const dailyCapApplied = winningResult.metadata.dailyCapApplied;
        limitApplied = singleWinCapApplied || dailyCapApplied;

        // Record payout for daily tracking (even if zero)
        if (winningAmount > 0) {
          gameLogic.recordPayout(winningAmount);
        }

        const winning = await storage.createWinning({
          betId: bet.id,
          resultId: result.id,
          matchedNumbers,
          matchedCount,
          winningAmount,
        });

        // Update bet outcome with win status and payout
        await storage.updateBetOutcome(bet.id, 'won', winningAmount, result.id);

        // Provide clear messaging based on which caps apply
        let message = undefined;
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
          message,
        });
      }

      // Update bet outcome with lost status
      await storage.updateBetOutcome(bet.id, 'lost', 0, result.id);

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

  // Get all winnings
  app.get("/api/winnings", async (_req, res) => {
    try {
      const winnings = await storage.getAllWinnings();
      res.json(winnings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch winnings" });
    }
  });

  // Generate random result for a game (for demo purposes)
  app.post("/api/results/generate/:gameId", async (req, res) => {
    try {
      const game = await storage.getGame(req.params.gameId);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }

      // Generate random winning numbers
      const winningNumbers: number[] = [];
      while (winningNumbers.length < game.numbersToSelect) {
        const randomNum = Math.floor(Math.random() * (game.maxNumber - game.minNumber + 1)) + game.minNumber;
        if (!winningNumbers.includes(randomNum)) {
          winningNumbers.push(randomNum);
        }
      }

      // Generate random odds for each number
      const odds = winningNumbers.map(() => 
        Math.floor(Math.random() * (game.maxOdds - game.minOdds + 1)) + game.minOdds
      );

      // Generate bonus number if applicable
      let bonusNumber: number | undefined;
      if (game.hasBonus) {
        do {
          bonusNumber = Math.floor(Math.random() * (game.maxNumber - game.minNumber + 1)) + game.minNumber;
        } while (winningNumbers.includes(bonusNumber));
      }

      const result = await storage.createResult({
        gameId: game.id,
        drawDate: new Date(),
        winningNumbers,
        bonusNumber,
        odds,
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate result" });
    }
  });

  // Get daily statistics
  app.get("/api/stats/daily", async (_req, res) => {
    try {
      const stats = gameLogic.getDailyStatsForDate();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily stats" });
    }
  });

  // Get all daily statistics
  app.get("/api/stats/all", async (_req, res) => {
    try {
      const stats = gameLogic.getAllDailyStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Get house edge configuration
  app.get("/api/config", async (_req, res) => {
    try {
      const config = gameLogic.getConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch config" });
    }
  });

  // Update house edge configuration (admin only in production)
  app.put("/api/config", async (req, res) => {
    try {
      gameLogic.updateConfig(req.body);
      const config = gameLogic.getConfig();
      res.json(config);
    } catch (error) {
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
  app.post("/api/codes", async (req, res) => {
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
  app.post("/api/aviator/session", async (req, res) => {
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
      const { multiplier } = req.body;
      if (typeof multiplier !== 'number' || multiplier <= 0) {
        return res.status(400).json({ error: "Invalid multiplier" });
      }

      const session = await storage.getAviatorSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (session.status !== 'active') {
        return res.status(400).json({ error: "Session is not active" });
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

      await storage.updateBetOutcome(session.betId, 'won', cashedOutAmount, '');

      res.json({
        session: updatedSession,
        cashedOutAmount,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to cash out" });
    }
  });

  // Complete aviator session (crashed)
  app.post("/api/aviator/crash/:sessionId", async (req, res) => {
    try {
      const session = await storage.getAviatorSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const updatedSession = await storage.updateAviatorSession(req.params.sessionId, {
        status: 'crashed',
        completedAt: new Date(),
      });

      await storage.updateBetOutcome(session.betId, 'lost', 0, '');

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
      const validatedInquiry = insertContactInquirySchema.parse(req.body);
      const inquiry = await storage.createContactInquiry(validatedInquiry);
      res.status(201).json(inquiry);
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        return res.status(400).json({ error: "Invalid contact data", details: error });
      }
      res.status(500).json({ error: "Failed to submit contact inquiry" });
    }
  });

  // Get all contact inquiries
  app.get("/api/contact", async (_req, res) => {
    try {
      const inquiries = await storage.getAllContactInquiries();
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contact inquiries" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
