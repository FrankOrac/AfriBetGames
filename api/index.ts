import express from "express";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { registerRoutes } from "../server/routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let routesRegistered = false;

async function ensureRoutes() {
  if (!routesRegistered) {
    await registerRoutes(app);
    routesRegistered = true;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureRoutes();
  
  return new Promise((resolve, reject) => {
    app(req as any, res as any, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
}
