import express from "express";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { registerRoutes } from "../server/routes";

const app = express();

// CORS middleware for Vercel deployment
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let routesRegistered = false;

async function ensureRoutes() {
  if (!routesRegistered) {
    try {
      await registerRoutes(app);
      routesRegistered = true;
    } catch (error) {
      console.error("Error registering routes:", error);
      throw error;
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureRoutes();
    
    return new Promise((resolve, reject) => {
      app(req as any, res as any, (err: any) => {
        if (err) {
          console.error("Express error:", err);
          res.status(500).json({ error: "Internal server error", message: err.message });
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    });
  } catch (error) {
    console.error("Handler error:", error);
    res.status(500).json({ 
      error: "Failed to initialize server", 
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
