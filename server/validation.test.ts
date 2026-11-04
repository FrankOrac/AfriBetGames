import assert from "node:assert/strict";
import test from "node:test";
import type { Game } from "@shared/schema";
import { validateBetForGame, validateResultForGame } from "./validation";

const game: Game = {
  id: "fceca6e8-4fb8-4a68-a302-39924f2d7db0",
  type: "minor",
  name: "Minor",
  description: null,
  minNumber: 0,
  maxNumber: 40,
  minOdds: 1.01,
  maxOdds: 7,
  numbersToSelect: 5,
  minMatches: 3,
  hasBonus: false,
};

test("accepts a valid, unique bet and rounds its stake", () => {
  const result = validateBetForGame({
    gameId: game.id,
    selectedNumbers: [0, 4, 8, 12, 40],
    stakeAmount: 100.129,
  }, game);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value.stakeAmount, 100.13);
});

test("rejects duplicate, out-of-range, and extra numbers", () => {
  const result = validateBetForGame({
    gameId: game.id,
    selectedNumbers: [1, 1, 3, 41, 5, 6],
    stakeAmount: 100,
  }, game);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.errors.length, 3);
});

test("rejects results with mismatched odds", () => {
  const result = validateResultForGame({
    gameId: game.id,
    drawDate: new Date(),
    winningNumbers: [1, 2, 3, 4, 5],
    odds: [2, 3],
  }, game);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.errors.join(" "), /corresponding odd/);
});
