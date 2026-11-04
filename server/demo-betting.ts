import { randomInt } from "node:crypto";
import type { Bet, DemoWallet, Game, InsertResult, Result, Winning } from "@shared/schema";
import type { GameLogic } from "./game-logic";
import type { IStorage } from "./storage";

const DEMO_WALLET_LIMIT = 1_000_000;

export type BetSettlement = {
  won: boolean;
  winning?: Winning;
  matchedCount: number;
  matchedNumbers: number[];
  bonusMatched: boolean;
  houseEdgeApplied: boolean;
  limitApplied: boolean;
  singleWinCapApplied: boolean;
  dailyCapApplied: boolean;
  demoWalletCapApplied: boolean;
  message: string;
  wallet?: DemoWallet;
};

function takeRandom<T>(values: T[], count: number): T[] {
  const pool = [...values];
  const picked: T[] = [];
  while (picked.length < count && pool.length > 0) {
    picked.push(pool.splice(randomInt(0, pool.length), 1)[0]);
  }
  return picked;
}

export function createAutomatedDemoResult(
  game: Game,
  bet: Bet,
  forceWin?: boolean,
): InsertResult {
  if (!bet.isDemo) throw new Error("Automated demo results require a demo ticket");
  if (bet.gameId !== game.id) throw new Error("Ticket and game do not match");

  const selectedNumbers = JSON.parse(bet.selectedNumbers) as number[];
  const shouldWin = forceWin ?? randomInt(0, 2) === 1;
  const selectedMatches = shouldWin ? game.minMatches : Math.max(0, game.minMatches - 1);
  const winningNumbers = takeRandom(selectedNumbers, selectedMatches);
  const selectedSet = new Set(selectedNumbers);
  const availableNumbers = Array.from(
    { length: game.maxNumber - game.minNumber + 1 },
    (_, index) => game.minNumber + index,
  ).filter((number) => !selectedSet.has(number));

  winningNumbers.push(...takeRandom(availableNumbers, game.numbersToSelect - winningNumbers.length));

  const odds = winningNumbers.map(() =>
    randomInt(Math.ceil(game.minOdds * 100), Math.floor(game.maxOdds * 100) + 1) / 100,
  );

  let bonusNumber: number | undefined;
  if (game.hasBonus) {
    const ticketBonus = bet.bonusNumber ?? undefined;
    const matchBonus = ticketBonus !== undefined && randomInt(0, 2) === 1;
    if (matchBonus && !winningNumbers.includes(ticketBonus)) {
      bonusNumber = ticketBonus;
    } else {
      const bonusPool = Array.from(
        { length: game.maxNumber - game.minNumber + 1 },
        (_, index) => game.minNumber + index,
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
    isDemo: true,
  };
}

export async function settleBetAgainstResult(
  storage: IStorage,
  logic: GameLogic,
  bet: Bet,
  game: Game,
  result: Result,
): Promise<BetSettlement> {
  if (bet.gameId !== game.id || result.gameId !== game.id) {
    throw new Error("Ticket, game and result do not match");
  }
  if (bet.isDemo !== result.isDemo) {
    throw new Error("Demo and official settlement modes cannot be mixed");
  }

  const selectedNumbers = JSON.parse(bet.selectedNumbers) as number[];
  const winningNumbers = JSON.parse(result.winningNumbers) as number[];
  const odds = JSON.parse(result.odds) as number[];
  const matchedNumbers = Array.from(new Set(selectedNumbers)).filter((number) => winningNumbers.includes(number));
  const matchedCount = matchedNumbers.length;
  const bonusMatched = bet.bonusNumber !== null && bet.bonusNumber === result.bonusNumber;
  const existingWinning = await storage.getWinningByBet(bet.id);

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
      wallet: bet.isDemo && bet.demoSessionId ? await storage.getDemoWallet(bet.demoSessionId) : undefined,
    };
  }

  if (matchedCount < game.minMatches) {
    await storage.updateBetOutcome(bet.id, "lost", 0, result.id);
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
      message: bet.isDemo
        ? `Demo draw complete. Matched ${matchedCount}; ${game.minMatches} required to win.`
        : `Matched ${matchedCount} numbers; ${game.minMatches} required to win.`,
      wallet: bet.isDemo && bet.demoSessionId ? await storage.getDemoWallet(bet.demoSessionId) : undefined,
    };
  }

  const matchedOdds = matchedNumbers.map((number) => {
    const index = winningNumbers.indexOf(number);
    return odds[index] || 1;
  });
  let baseWinning = matchedOdds.reduce((total, odd) => total * odd, 1) * bet.stakeAmount;
  if (bonusMatched && game.hasBonus) baseWinning *= 1.5;

  const winningResult = logic.calculateWinningAmount(baseWinning, bet.stakeAmount, bet.id);
  let winningAmount = winningResult.finalAmount;
  let demoWalletCapApplied = false;
  let wallet: DemoWallet | undefined;

  if (bet.isDemo && bet.demoSessionId) {
    wallet = await storage.getDemoWallet(bet.demoSessionId);
    const availableWalletCapacity = Math.max(0, DEMO_WALLET_LIMIT - wallet.balance);
    if (winningAmount > availableWalletCapacity) {
      winningAmount = availableWalletCapacity;
      demoWalletCapApplied = true;
    }
  }

  const winning = await storage.createWinning({
    betId: bet.id,
    resultId: result.id,
    matchedNumbers,
    matchedCount,
    winningAmount,
  });

  if (bet.isDemo && bet.demoSessionId && winningAmount > 0) {
    wallet = await storage.adjustDemoWallet(bet.demoSessionId, winningAmount, "winning", bet.id);
    if (!wallet) throw new Error("Unable to credit the demo payout");
  } else if (!bet.isDemo && winningAmount > 0) {
    logic.recordPayout(winningAmount);
  }

  await storage.updateBetOutcome(bet.id, "won", winningAmount, result.id);

  const singleWinCapApplied = winningResult.metadata.singleWinCapApplied;
  const dailyCapApplied = winningResult.metadata.dailyCapApplied;
  let message = bet.isDemo ? "Demo win settled automatically." : "Congratulations! You won!";
  if (demoWalletCapApplied) message = "Demo win settled at the ₦1,000,000 demo-wallet limit.";
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
    wallet,
  };
}
