import mongoose from "mongoose";
import express, { type Request, type Response } from "express";
import chatRouter from "./routes/Chats.routes";
import messageRouter from "./routes/Message.routes";
const app = express();
import http from "http";
import path from "path";
import { connectRabbitMQ } from "./utils/connectTorabbitMq";
import type { Channel } from "amqplib";
import multer from "multer";
import fs from "fs";
const server = http.createServer(app);
import cors from "cors";
import { Server, Socket } from "socket.io";
import VideoRouter from "./routes/Video.router";
import { waitForFileReady } from "./utils/filechecker";

const io = new Server(server, {
	cors: {
		origin: "http://localhost:3000",
	},
});

let channel:Channel;
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

app.use(express.json());
app.use(cors());

app.use("/api/chats", chatRouter);
app.use("/api/messages", messageRouter);
app.use("/api/videos",VideoRouter);

app.post("/api/transcode", upload.single("video"), async (req: Request, res: Response) => {
    try {
      const { key } = req.body;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: "Video file is required." });
        return;
      }

      if (!channel) {
        res.status(500).json({ error: "RabbitMQ channel not available." });
        return;
      }

      const fullFilePath = path.join(inputFolder, file.filename);
      const relativeFilePath = path.join("input", file.filename);

      // Wait for file to be fully written to disk
      const fileReady = await waitForFileReady(fullFilePath);
      
      if (!fileReady) {
        // Clean up the potentially incomplete file
        try {
          fs.unlinkSync(fullFilePath);
        } catch (cleanupError) {
          console.error("Error cleaning up incomplete file:", cleanupError);
        }
        res.status(500).json({ error: "File upload incomplete or corrupted." });
        return;
      }

      const payload = {
        videoPath: relativeFilePath,
        key,
      };

      // Now safely enqueue the task since we've verified the file exists
      channel.sendToQueue("videos", Buffer.from(JSON.stringify(payload)), {
        persistent: true,
      });

      console.log(`Queued video for transcoding: ${relativeFilePath}`);
      res.status(200).json({ 
        message: "Video queued for transcoding.",
        filename: file.filename
      });
    } catch (error) {
      console.log("Error transcoding the video:", error);
      res.status(500).json({ error: "Error processing video for transcoding." });
    }
});

app.get("/", async(req, res) => {
	res.send("running....")
});

//server.ts
io.on("connection", (socket: Socket): void => {
	console.log("a user connected");

	socket.on("joinRoom", (chat) => {
		socket.join(chat);
	});

	socket.on("sendMessage", (message) => {
		io.to(message.chat).emit("receiveMessage", message);
	});

	socket.on("editMessage", (message) => {
		io.to(message.chat).emit("receiveEditMessage", message);
	});

	socket.on("deleteMessage", (message) => {
		io.to(message.chat).emit("receiveDeleteMessage", message.id);
	});
});

server.listen(8080, async () => {
	try {
		console.log("listening on *:8080");
		await mongoose.connect("mongodb://127.0.0.1:27017/buisnesstool");
		channel = await connectRabbitMQ()
	} catch (error) {
		console.log("error starting the server");
	}
});