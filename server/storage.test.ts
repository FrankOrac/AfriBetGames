import assert from "node:assert/strict";
import test from "node:test";
import { MemStorage } from "./storage";

test("settles a bet against the first draw after it was accepted", async () => {
  const storage = new MemStorage();
  const game = (await storage.getAllGames())[0];
  const acceptedAt = new Date("2026-01-01T12:00:00Z");

  await storage.createResult({
    gameId: game.id,
    drawDate: new Date("2026-01-01T14:00:00Z"),
    winningNumbers: Array.from({ length: game.numbersToSelect }, (_, index) => game.minNumber + index),
    odds: Array.from({ length: game.numbersToSelect }, () => game.minOdds),
  });
  const first = await storage.createResult({
    gameId: game.id,
    drawDate: new Date("2026-01-01T13:00:00Z"),
    winningNumbers: Array.from({ length: game.numbersToSelect }, (_, index) => game.minNumber + index + 1),
    odds: Array.from({ length: game.numbersToSelect }, () => game.minOdds),
  });

  const selected = await storage.getFirstResultAfter(game.id, acceptedAt);
  assert.equal(selected?.id, first.id);
});
