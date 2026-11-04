import assert from "node:assert/strict";
import test from "node:test";
import { createAutomatedDemoResult } from "./demo-betting";
import { MemStorage } from "./storage";

test("builds controlled demo draws that exercise both win and loss paths", async () => {
  const storage = new MemStorage();
  const game = (await storage.getAllGames()).find((item) => !item.hasBonus)!;
  const selectedNumbers = Array.from(
    { length: game.numbersToSelect },
    (_, index) => game.minNumber + index,
  );
  const bet = await storage.createBet({
    gameId: game.id,
    selectedNumbers,
    stakeAmount: 1_000,
    isDemo: true,
    demoSessionId: "5bdfcb7c-b36a-4528-9133-0affbd3e1664",
  });

  const winningDraw = createAutomatedDemoResult(game, bet, true);
  const losingDraw = createAutomatedDemoResult(game, bet, false);
  const winMatches = winningDraw.winningNumbers.filter((number) => selectedNumbers.includes(number));
  const lossMatches = losingDraw.winningNumbers.filter((number) => selectedNumbers.includes(number));

  assert.equal(winMatches.length, game.minMatches);
  assert.equal(lossMatches.length, Math.max(0, game.minMatches - 1));
  assert.equal(new Set(winningDraw.winningNumbers).size, game.numbersToSelect);
  assert.equal(new Set(losingDraw.winningNumbers).size, game.numbersToSelect);
});

test("placing a demo bet automatically creates and settles its draw", async (context) => {
  process.env.NODE_ENV = "test";
  process.env.PUBLIC_PREVIEW_MODE = "false";
  delete process.env.DATABASE_URL;

  const [{ createApplication }, { storage }] = await Promise.all([
    import("./app"),
    import("./storage"),
  ]);
  await storage.updatePlatformSettings({ demoModeEnabled: true });

  const app = await createApplication();
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  context.after(() => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not bind to a TCP port");
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const sessionId = "b74dfdac-b541-467c-bc32-1e80f208cc21";
  const demoHeaders = { "Content-Type": "application/json", "X-Demo-Session-Id": sessionId };

  const topUpResponse = await fetch(`${baseUrl}/api/demo/wallet/top-up`, {
    method: "POST",
    headers: demoHeaders,
    body: JSON.stringify({ amount: 10_000 }),
  });
  assert.equal(topUpResponse.status, 200);

  const games = await fetch(`${baseUrl}/api/games`).then((response) => response.json()) as Array<{
    id: string;
    minNumber: number;
    numbersToSelect: number;
    hasBonus: boolean;
  }>;
  const game = games.find((item) => !item.hasBonus)!;
  const selectedNumbers = Array.from({ length: game.numbersToSelect }, (_, index) => game.minNumber + index);
  const betResponse = await fetch(`${baseUrl}/api/bets`, {
    method: "POST",
    headers: demoHeaders,
    body: JSON.stringify({ gameId: game.id, selectedNumbers, stakeAmount: 1_000 }),
  });
  const payload = await betResponse.json() as {
    id: string;
    isDemo: boolean;
    status: string;
    resultId: string | null;
    demoResult?: { id: string; isDemo: boolean };
    demoOutcome?: { won: boolean; message: string };
    demoWallet?: { balance: number };
  };

  assert.equal(betResponse.status, 201);
  assert.equal(payload.isDemo, true);
  assert.ok(payload.status === "won" || payload.status === "lost");
  assert.equal(payload.demoResult?.isDemo, true);
  assert.equal(payload.resultId, payload.demoResult?.id);
  assert.equal(typeof payload.demoOutcome?.won, "boolean");
  assert.match(payload.demoOutcome?.message ?? "", /Demo/);
  assert.ok((payload.demoWallet?.balance ?? 0) >= 0);

  const ticket = await fetch(`${baseUrl}/api/bets/${payload.id}`).then((response) => response.json()) as {
    status: string;
    resultId: string | null;
  };
  assert.ok(ticket.status === "won" || ticket.status === "lost");
  assert.equal(ticket.resultId, payload.demoResult?.id);

  const printableTicket = await fetch(`${baseUrl}/api/bets/${payload.id}/ticket`).then((response) => response.json()) as {
    winCriteria?: { numbersToSelect: number; minMatches: number; minNumber: number; maxNumber: number };
  };
  assert.equal(printableTicket.winCriteria?.numbersToSelect, game.numbersToSelect);
  assert.equal(printableTicket.winCriteria?.minNumber, game.minNumber);
  assert.ok((printableTicket.winCriteria?.minMatches ?? 0) > 0);
  assert.ok((printableTicket.winCriteria?.maxNumber ?? 0) >= game.minNumber);
});
