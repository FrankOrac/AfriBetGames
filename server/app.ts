import compression from "compression";
import express, { type ErrorRequestHandler, type RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { randomUUID } from "node:crypto";
import { registerRoutes } from "./routes";
import { isSameOrigin } from "./security";
import { storage } from "./storage";

const FIFTEEN_MINUTES = 15 * 60 * 1_000;

function corsMiddleware(): RequestHandler {
  const configuredOrigins = new Set(
    (process.env.ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

  return (req, res, next) => {
    const origin = req.get("origin");
    if (!origin) {
      next();
      return;
    }

    if (!configuredOrigins.has(origin) && !isSameOrigin(req, origin)) {
      res.status(403).json({ error: "Origin is not allowed" });
      return;
    }

    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Admin-Key,X-Request-Id");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  };
}

export async function createApplication() {
  const app = express();
  app.disable("x-powered-by");
  if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

  app.use((req, res, next) => {
    const requestId = req.get("x-request-id")?.slice(0, 100) || randomUUID();
    res.setHeader("X-Request-Id", requestId);
    next();
  });
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: "same-site" },
  }));
  app.use(compression());
  app.use(corsMiddleware());
  app.use(express.json({ limit: "32kb" }));
  app.use(express.urlencoded({ extended: false, limit: "16kb" }));

  app.use("/api", rateLimit({
    windowMs: FIFTEEN_MINUTES,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many requests; please try again later" },
  }));
  app.use(["/api/bets", "/api/winnings", "/api/contact"], (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store, private");
    next();
  });
  app.use("/api/bets", rateLimit({
    windowMs: FIFTEEN_MINUTES,
    limit: 30,
    skip: (req) => req.method !== "POST",
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many bet requests; please try again later" },
  }));
  app.use(["/api/contact", "/api/forum"], rateLimit({
    windowMs: 60 * 60 * 1_000,
    limit: 20,
    skip: (req) => req.method === "GET",
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many submissions; please try again later" },
  }));

  app.get("/api/health", async (_req, res) => {
    try {
      await storage.getAllGames();
      res.setHeader("Cache-Control", "no-store");
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    } catch {
      res.status(503).json({ status: "unavailable" });
    }
  });

  app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on("finish", () => {
      if (req.path.startsWith("/api") && process.env.NODE_ENV !== "test") {
        const entry = {
          method: req.method,
          path: req.path,
          status: res.statusCode,
          durationMs: Date.now() - startedAt,
          requestId: res.getHeader("X-Request-Id"),
        };
        console.info(JSON.stringify(entry));
      }
    });
    next();
  });

  await registerRoutes(app);

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "API route not found" });
  });

  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    console.error(error);
    if (res.headersSent) return;
    res.status(500).json({ error: "Internal server error" });
  };
  app.use(errorHandler);

  return app;
}
