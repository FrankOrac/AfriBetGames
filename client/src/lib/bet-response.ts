import type { Bet, DemoWallet, Result, Winning } from '@shared/schema';

export type AutomatedBetOutcome = {
  won: boolean;
  winning?: Winning;
  matchedCount: number;
  matchedNumbers: number[];
  bonusMatched: boolean;
  message: string;
};

export type BetPlacementResponse = Bet & {
  demoResult?: Result;
  demoOutcome?: AutomatedBetOutcome;
  demoWallet?: DemoWallet;
};

export function demoSettlementMessage(response: BetPlacementResponse): string {
  const outcome = response.demoOutcome;
  if (!outcome) return 'Ticket saved. Results will be settled after the official draw.';
  if (outcome.won && outcome.winning) {
    return `Demo draw complete. Payout: ₦${outcome.winning.winningAmount.toLocaleString()}.`;
  }
  return `Demo draw complete. Matched ${outcome.matchedCount} number${outcome.matchedCount === 1 ? '' : 's'}.`;
}
