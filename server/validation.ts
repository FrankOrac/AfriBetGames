import type { Game, InsertBet, InsertResult } from "@shared/schema";

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] };

function unique(values: number[]): boolean {
  return new Set(values).size === values.length;
}

export function validateBetForGame(bet: InsertBet, game: Game): ValidationResult<InsertBet> {
  const errors: string[] = [];
  const maxStake = Number(process.env.MAX_STAKE_AMOUNT ?? 1_000_000);

  if (bet.selectedNumbers.length !== game.numbersToSelect) {
    errors.push(`Select exactly ${game.numbersToSelect} numbers`);
  }
  if (!unique(bet.selectedNumbers)) errors.push("Selected numbers must be unique");
  if (bet.selectedNumbers.some((number) => number < game.minNumber || number > game.maxNumber)) {
    errors.push(`Selected numbers must be between ${game.minNumber} and ${game.maxNumber}`);
  }
  if (bet.stakeAmount > maxStake) errors.push(`Stake cannot exceed ${maxStake}`);

  if (game.hasBonus) {
    if (bet.bonusNumber === undefined) errors.push("A bonus number is required");
    if (bet.bonusNumber !== undefined && (
      bet.bonusNumber < game.minNumber ||
      bet.bonusNumber > game.maxNumber ||
      bet.selectedNumbers.includes(bet.bonusNumber)
    )) {
      errors.push("Bonus number must be in range and different from selected numbers");
    }
  } else if (bet.bonusNumber !== undefined) {
    errors.push("This game does not use a bonus number");
  }

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: { ...bet, stakeAmount: Math.round(bet.stakeAmount * 100) / 100 },
  };
}

export function validateResultForGame(
  result: InsertResult,
  game: Game,
): ValidationResult<InsertResult> {
  const errors: string[] = [];
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
  if (game.hasBonus && result.bonusNumber === undefined) errors.push("A bonus number is required");
  if (!game.hasBonus && result.bonusNumber !== undefined) errors.push("This game does not use a bonus number");
  if (result.bonusNumber !== undefined && (
    result.bonusNumber < game.minNumber ||
    result.bonusNumber > game.maxNumber ||
    result.winningNumbers.includes(result.bonusNumber)
  )) {
    errors.push("Bonus number must be in range and different from winning numbers");
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true, value: result };
}
