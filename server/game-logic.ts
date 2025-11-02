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

    // Store metadata for this winning (immutable) - track ALL caps separately
    const metadata: WinningMetadata = {
      houseEdgeApplied,
      singleWinCapApplied,
      dailyCapApplied,
      cappedFromHouseEdge: houseEdgeApplied ? baseWinning : undefined,
      cappedFromSingleWin: singleWinCapApplied ? winningAfterHouseEdge : undefined,
      cappedFromDaily: dailyCapApplied ? cappedByMaxWin : undefined,
    };
    this.winningMetadata.set(betId, metadata);

    // Log when caps are applied for audit trail
    if (singleWinCapApplied && dailyCapApplied) {
      // Both caps applied
      const singleWinDelta = winningAfterHouseEdge - cappedByMaxWin;
      const dailyDelta = cappedByMaxWin - roundedFinal;
      
      this.payoutEvents.push({
        timestamp: new Date(),
        amount: roundedFinal,
        cappedFrom: winningAfterHouseEdge,
        limitType: 'single_win_cap',
      });
      
      this.payoutEvents.push({
        timestamp: new Date(),
        amount: roundedFinal,
        cappedFrom: cappedByMaxWin,
        limitType: 'daily_cap',
      });

      console.log(`[GameLogic] Multiple caps applied: Single win -${singleWinDelta.toFixed(2)}, Daily -${dailyDelta.toFixed(2)}`);
      stats.cappedPayouts += (singleWinDelta + dailyDelta);
    } else if (singleWinCapApplied) {
      // Only single win cap applied
      const delta = winningAfterHouseEdge - roundedFinal;
      this.payoutEvents.push({
        timestamp: new Date(),
        amount: roundedFinal,
        cappedFrom: winningAfterHouseEdge,
        limitType: 'single_win_cap',
      });

      console.log(`[GameLogic] Single win cap applied: ${winningAfterHouseEdge.toFixed(2)} -> ${roundedFinal.toFixed(2)}`);
      stats.cappedPayouts += delta;
    } else if (dailyCapApplied) {
      // Only daily cap applied
      const delta = cappedByMaxWin - roundedFinal;
      this.payoutEvents.push({
        timestamp: new Date(),
        amount: roundedFinal,
        cappedFrom: cappedByMaxWin,
        limitType: 'daily_cap',
      });

      console.log(`[GameLogic] Daily cap applied: ${cappedByMaxWin.toFixed(2)} -> ${roundedFinal.toFixed(2)}`);
      stats.cappedPayouts += delta;
    } else if (houseEdgeApplied) {
      // Only house edge applied (for audit only, not counted as "capped")
      this.payoutEvents.push({
        timestamp: new Date(),
        amount: roundedFinal,
        cappedFrom: baseWinning,
        limitType: 'house_edge',
      });
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

export const gameLogic = new GameLogic();
