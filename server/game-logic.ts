export interface GameConfig {
  houseEdgePercentage: number;
  maxDailyPayoutRatio: number;
  maxSingleWinMultiplier: number;
}

export interface DailyStats {
  date: string;
  totalStakes: number;
  totalPayouts: number;
  netProfit: number;
  cappedPayouts: number;
  totalBets: number;
  totalWinnings: number;
}

export interface PayoutEvent {
  timestamp: Date;
  amount: number;
  cappedFrom?: number;
  limitType?: 'house_edge' | 'daily_cap' | 'single_win_cap';
}

export interface WinningMetadata {
  houseEdgeApplied: boolean;
  singleWinCapApplied: boolean;
  dailyCapApplied: boolean;
  cappedFromHouseEdge?: number;
  cappedFromSingleWin?: number;
  cappedFromDaily?: number;
}

export class GameLogic {
  private config: GameConfig;
  private dailyStats: Map<string, DailyStats>;
  private payoutEvents: PayoutEvent[];
  private winningMetadata: Map<string, WinningMetadata>;

  constructor(config?: Partial<GameConfig>) {
    this.config = {
      houseEdgePercentage: config?.houseEdgePercentage ?? 15,
      maxDailyPayoutRatio: config?.maxDailyPayoutRatio ?? 0.75,
      maxSingleWinMultiplier: config?.maxSingleWinMultiplier ?? 1000,
    };
    this.dailyStats = new Map();
    this.payoutEvents = [];
    this.winningMetadata = new Map();
  }

  private getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getDailyStats(): DailyStats {
    const today = this.getTodayKey();
    if (!this.dailyStats.has(today)) {
      this.dailyStats.set(today, {
        date: today,
        totalStakes: 0,
        totalPayouts: 0,
        netProfit: 0,
        cappedPayouts: 0,
        totalBets: 0,
        totalWinnings: 0,
      });
    }
    return this.dailyStats.get(today)!;
  }

  recordStake(amount: number): void {
    const stats = this.getDailyStats();
    stats.totalStakes += amount;
    stats.netProfit += amount;
    stats.totalBets += 1;
  }

  calculateWinningAmount(
    baseWinning: number,
    stakeAmount: number,
    betId: string
  ): { finalAmount: number; metadata: WinningMetadata } {
    const stats = this.getDailyStats();

    // Published odds are the contract with the player. Any house margin must
    // already be represented in those odds, never deducted after a win.
    const maxSingleWin = stakeAmount * this.config.maxSingleWinMultiplier;
    const finalAmount = Math.min(baseWinning, maxSingleWin);
    const singleWinCapApplied = finalAmount < baseWinning;
    const roundedFinal = Math.floor(finalAmount * 100) / 100;

    // Store metadata for this winning (immutable) - track ALL caps separately
    const metadata: WinningMetadata = {
      houseEdgeApplied: false,
      singleWinCapApplied,
      dailyCapApplied: false,
      cappedFromSingleWin: singleWinCapApplied ? baseWinning : undefined,
    };
    this.winningMetadata.set(betId, metadata);

    if (singleWinCapApplied) {
      const delta = baseWinning - roundedFinal;
      this.payoutEvents.push({
        timestamp: new Date(),
        amount: roundedFinal,
        cappedFrom: baseWinning,
        limitType: 'single_win_cap',
      });
      stats.cappedPayouts += delta;
    }
    
    return {
      finalAmount: roundedFinal,
      metadata,
    };
  }

  getWinningMetadata(betId: string): WinningMetadata | undefined {
    return this.winningMetadata.get(betId);
  }

  recordPayout(amount: number): void {
    const stats = this.getDailyStats();
    stats.totalPayouts += amount;
    stats.netProfit -= amount;
    stats.totalWinnings += 1;

    this.payoutEvents.push({
      timestamp: new Date(),
      amount,
    });
  }

  getPayoutEvents(): PayoutEvent[] {
    return [...this.payoutEvents];
  }

  getDailyStatsForDate(date?: string): DailyStats | undefined {
    const key = date || this.getTodayKey();
    return this.dailyStats.get(key);
  }

  getAllDailyStats(): DailyStats[] {
    return Array.from(this.dailyStats.values());
  }

  getConfig(): GameConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<GameConfig>): void {
    this.config = { ...this.config, ...config };
  }

  calculateAdjustedOdds(baseOdds: number[]): number[] {
    const houseEdgeMultiplier = (100 - this.config.houseEdgePercentage) / 100;
    return baseOdds.map(odd => {
      const adjustedOdd = odd * Math.pow(houseEdgeMultiplier, 1 / baseOdds.length);
      return Math.max(1, Math.floor(adjustedOdd * 100) / 100);
    });
  }
}

export const gameLogic = new GameLogic({
  houseEdgePercentage: Number(process.env.HOUSE_EDGE_PERCENTAGE ?? 15),
  maxDailyPayoutRatio: Number(process.env.MAX_DAILY_PAYOUT_RATIO ?? 0.75),
  maxSingleWinMultiplier: Number(process.env.MAX_SINGLE_WIN_MULTIPLIER ?? 1000),
});
