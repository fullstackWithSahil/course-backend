import type { Response,Request } from "express";
import { Database } from "bun:sqlite";
const db = new Database("../database.sqlite", { create: true });

export default async function getMetrics(req:Request, res:Response){
    try {
      const timeRange = req.query.range || "1h"; // Default to 1 hour
      let limit, timeFilter;
  
      // Set query parameters based on requested time range
      switch (timeRange) {
        case "3d": // 3 days
          // Assuming data is collected every 5 seconds
          // 3 days = 72 hours = 4320 minutes = 51840 seconds
          // 51840 / 5 = 10368 records
          // Reduce resolution to avoid returning too many points
          timeFilter = "AND timestamp >= datetime('now', '-3 days')";
          limit = "AND (rowid % 180) = 0"; // Sample every ~15 minutes (180 * 5 seconds)
          break;
  
        case "24h": // 24 hours
          // 24 hours = 1440 minutes = 86400 seconds
          // 86400 / 5 = 17280 records
          timeFilter = "AND timestamp >= datetime('now', '-24 hours')";
          limit = "AND (rowid % 36) = 0"; // Sample every ~3 minutes (36 * 5 seconds)
          break;
  
        case "1h": // 1 hour (default)
        default:
          // 1 hour = 60 minutes = 3600 seconds
          // 3600 / 5 = 720 records
          timeFilter = "AND timestamp >= datetime('now', '-1 hour')";
          limit = ""; // Return all points for 1 hour
          break;
      }
  
      // Query with time range filter and appropriate sampling
      const query = db.query(`
          SELECT timestamp, cpu_usage, memory_usage_gb 
          FROM system_metrics 
          WHERE 1=1 ${timeFilter} ${limit}
          ORDER BY timestamp ASC
        `);
  
      const results = query.all();
      res.json(results);
      console.log(`Fetched ${results.length} records for ${timeRange} range`);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ error: "Failed to fetch metrics data" });
    }
  }