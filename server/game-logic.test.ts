import assert from "node:assert/strict";
import test from "node:test";
import { GameLogic } from "./game-logic";

test("pays the amount implied by published odds without a hidden deduction", () => {
  const logic = new GameLogic({ houseEdgePercentage: 25, maxSingleWinMultiplier: 1_000 });
  const result = logic.calculateWinningAmount(12_500, 100, "bet-1");
  assert.equal(result.finalAmount, 12_500);
  assert.equal(result.metadata.houseEdgeApplied, false);
  assert.equal(result.metadata.dailyCapApplied, false);
});

test("applies the disclosed single-ticket multiplier cap deterministically", () => {
  const logic = new GameLogic({ maxSingleWinMultiplier: 10 });
  const result = logic.calculateWinningAmount(50_000, 1_000, "bet-2");
  assert.equal(result.finalAmount, 10_000);
  assert.equal(result.metadata.singleWinCapApplied, true);
});
