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
import getMetrics from "./routes/metrics";


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

app.get("/api/metrics/data",getMetrics);

const port = process.env.PORT || 8080;
app.listen(port, async () => {
  console.log("listening on port", port);
  channel = await connectRabbitMQ();
  setInterval(logSystemStats, 5000);
});