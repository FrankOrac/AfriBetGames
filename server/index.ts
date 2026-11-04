import { createServer } from "node:http";
import { createApplication } from "./app";
import { log, serveStatic, setupVite } from "./vite";

const app = await createApplication();
const server = createServer(app);

if (app.get("env") === "development") {
  await setupVite(app, server);
} else {
  serveStatic(app);
}

const port = Number.parseInt(process.env.PORT ?? "5000", 10);
server.listen({ port, host: "0.0.0.0" }, () => {
  log(`serving on port ${port}`);
});

function shutdown(signal: string) {
  log(`${signal} received; stopping gracefully`);
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
