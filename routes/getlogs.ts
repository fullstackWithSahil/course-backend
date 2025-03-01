import { Database } from "bun:sqlite";
import logger from "../monitering/logging"; // Fixed typo in path
import type { Response, Request } from "express";

export const db = new Database("./database.sqlite", { create: true });

// Create the logs table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT,
  level TEXT,
  message TEXT
)`);

export async function getLogs(req: Request, res: Response) {
  try {
    console.log("start");
    const data = db.query(`SELECT * FROM logs`).all(); // Changed from .run() to .all()
    console.log({ data });
    res.json({ data });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error(String(error));
    }
    res.status(500).json({ error: "Failed to fetch logs" }); // Added response for error case
  }
}