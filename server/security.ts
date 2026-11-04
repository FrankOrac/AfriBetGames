import { createHash, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

function hashesMatch(left: string, right: string): boolean {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const configuredKey = process.env.ADMIN_API_KEY?.trim();

  if (!configuredKey) {
    if (process.env.NODE_ENV !== "production") {
      next();
      return;
    }
    res.status(503).json({ error: "Operator access is not configured" });
    return;
  }

  const authorization = req.get("authorization");
  const bearer = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;
  const suppliedKey = req.get("x-admin-key") ?? bearer;

  if (!suppliedKey || !hashesMatch(configuredKey, suppliedKey)) {
    res.setHeader("WWW-Authenticate", "Bearer");
    res.status(401).json({ error: "Operator authentication required" });
    return;
  }

  next();
}

export function isSameOrigin(req: Request, origin: string): boolean {
  try {
    return new URL(origin).host === req.get("host");
  } catch {
    return false;
  }
}
