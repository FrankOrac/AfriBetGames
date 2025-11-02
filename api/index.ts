import express from "express";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { registerRoutes } from "../server/routes";
import { storage } from "../server/storage";

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

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

let routesRegistered = false;

async function ensureRoutes() {
  if (!routesRegistered) {
    try {
      console.log("Initializing routes...");
      
      // Ensure storage is initialized
      const games = await storage.getAllGames();
      console.log(`Storage initialized with ${games.length} games`);
      
      await registerRoutes(app);
      routesRegistered = true;
      console.log("Routes registered successfully");
    } catch (error) {
      console.error("Error registering routes:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace");
      throw error;
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`Handling request: ${req.method} ${req.url}`);
    await ensureRoutes();
    
    return new Promise((resolve, reject) => {
      app(req as any, res as any, (err: any) => {
        if (err) {
          console.error("Express error:", err);
          console.error("Error stack:", err.stack);
          if (!res.headersSent) {
            res.status(500).json({ 
              error: "Internal server error", 
              message: err.message,
              stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
            });
          }
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    });
  } catch (error) {
    console.error("Handler error:", error);
    console.error("Error details:", error instanceof Error ? error.stack : String(error));
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Failed to initialize server", 
        message: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      });
    }
  }
}
