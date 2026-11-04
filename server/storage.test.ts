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

test("keeps demo draws isolated from official settlement", async () => {
  const storage = new MemStorage();
  const game = (await storage.getAllGames())[0];
  const acceptedAt = new Date("2026-01-01T12:00:00Z");
  const demo = await storage.createResult({
    gameId: game.id,
    drawDate: new Date("2026-01-01T13:00:00Z"),
    winningNumbers: Array.from({ length: game.numbersToSelect }, (_, index) => game.minNumber + index),
    odds: Array.from({ length: game.numbersToSelect }, () => game.minOdds),
    isDemo: true,
  });

  assert.equal(await storage.getFirstResultAfter(game.id, acceptedAt), undefined);
  assert.equal((await storage.getFirstResultAfter(game.id, acceptedAt, true))?.id, demo.id);
});

test("maintains a capped, auditable demo balance", async () => {
  const storage = new MemStorage();
  const sessionId = "5bdfcb7c-b36a-4528-9133-0affbd3e1664";

  assert.equal((await storage.getDemoWallet(sessionId)).balance, 0);
  assert.equal((await storage.adjustDemoWallet(sessionId, 10_000, "top_up"))?.balance, 10_000);
  assert.equal((await storage.adjustDemoWallet(sessionId, -1_500, "stake"))?.balance, 8_500);
  assert.equal(await storage.adjustDemoWallet(sessionId, -9_000, "stake"), undefined);
  assert.deepEqual((await storage.getDemoLedger(sessionId)).map((entry) => entry.type), ["stake", "top_up"]);
});
