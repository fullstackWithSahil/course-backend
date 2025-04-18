import express, { type Request, type Response } from "express";
import cors from "cors";
import multer from "multer";
import amqp from "amqplib";
import path from "path";
import fs from "fs";
import logger from "./utils/logging";

const app = express();
app.use(express.json());
app.use(cors());

// Ensure /queue/input exists
const inputFolder = path.join(__dirname, "input");
fs.mkdirSync(inputFolder, { recursive: true });

// Setup Multer to store uploaded videos in /queue/input
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, inputFolder);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" +"video.mp4";
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// RabbitMQ connection
let channel: amqp.Channel;
export const queueName = "Videos";

async function connectRabbitMQ() {
  const connection = await amqp.connect("amqp://localhost"); // or your RabbitMQ URL
  channel = await connection.createChannel();
  await channel.assertQueue(queueName, { durable: true });
  logger.info("Connected to RabbitMQ");
}

connectRabbitMQ().catch((err) => logger.error("RabbitMQ connection error", err));

// Route to upload and queue video
app.post("/api/transcode", upload.single("video"), (req: Request, res: Response): void => {
  (async () => {
    try {
      const { key } = req.body;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: "Video file is required." });
        return;
      }

      const filePath = path.join("input", file.filename);

      const payload = {
        videoPath: filePath,
        key,
      };

      channel.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), {
        persistent: true,
      });

      logger.info(`Queued video for transcoding: ${filePath}`);
      res.status(200).json({ message: "Video queued for transcoding." });
    } catch (error) {
      logger.error("Error adding transcoding the video", error);
      res.status(500).json({ error: "Error adding transcoding the video" });
    }
  })();
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`Server is running on port ${process.env.PORT || 8080}`);
});
