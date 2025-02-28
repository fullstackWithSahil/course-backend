import express from "express";
import multer from "multer";
import type { FileFilterCallback } from "multer";
import fs from "fs";
import cors from "cors";
import path from "path";
import connectRabbitMQ from "./queues/ConnectQueue";
import type { Channel } from "amqplib";
import { addVideo } from "./routes/VideoTranscoding";
import logSystemStats from "./monitering/monitering";
import { Database } from "bun:sqlite";
const db = new Database("../database.sqlite", { create: true });

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

// Define multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.path === "/api/addThumbnail") {
      const uploadPath = "thumbnails";
      fs.mkdirSync(uploadPath, { recursive: true }); // Ensure the directory exists
      cb(null, uploadPath);
    } else {
      const uploadPath =
        file.fieldname === "video"
          ? "queues/uploads/videos"
          : "queues/uploads/thumbnails";
      fs.mkdirSync(uploadPath, { recursive: true }); // Ensure the directory exists
      cb(null, uploadPath);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Multer instance
const upload = multer({
  storage,
  fileFilter: (req, file, cb: FileFilterCallback) => {
    if (file.fieldname === "video" && !file.mimetype.startsWith("video/")) {
      return cb(new Error("Invalid video file type"));
    }
    if (file.fieldname === "thumbnail" && !file.mimetype.startsWith("image/")) {
      return cb(new Error("Invalid thumbnail file type"));
    }
    cb(null, true);
  },
});

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.use(cors());

export let channel: Channel | undefined;

// Define route for uploading video and thumbnail
app.post(
  "/api/video/transcode",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  addVideo
);

app.get("/api/test", async (req, res) => {
  res.send("<h1>Running...</h1>");
});

app.get("/api/metrics/data", (req, res) => {
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
});

// Serve the HTML page with charts
app.get("/metics", (req, res) => {
  res.sendFile(path.join(process.cwd(), "monitering/monitering.html"));
});

const port = process.env.PORT || 8080;
app.listen(port, async () => {
  console.log("listening on port", port);
  channel = await connectRabbitMQ();
  setInterval(logSystemStats, 5000);
});
