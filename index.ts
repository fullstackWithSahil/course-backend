import express, { type Request, type Response } from "express";
import cors from "cors";
import multer from "multer";
import amqp from "amqplib";
import path from "path";
import fs from "fs";
const http = require('http');
const app = express();
const server = http.createServer(app);
import { Server,Socket } from "socket.io";
import logger from "./utils/logging";
import MessagesRouter from "./src/routes/Messages.routes";
import mongoose from "mongoose";

const io = new Server(server,{
  cors:{
    origin:"http://localhost:3000"
  }
});

app.use(express.json());
app.use(cors());
app.use("/api/messages",MessagesRouter);

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

io.on('connection', (socket:Socket): void => {
  console.log('a user connected');
  
  socket.on('joinRoom', (room) => {
    socket.join(room);
  });

  socket.on("sendMessage",(message)=>{
    io.to(message.room).emit("receiveMessage",message);
  });

  socket.on("editMessage",(message)=>{
    io.to(message.room).emit("receiveEditMessage",message);
  });

  socket.on("deleteMessage",(message)=>{
    io.to(message.room).emit("receiveDeleteMessage",message.id);
  });
});


server.listen(8080, async() => {
  try {
    console.log('listening on *:3000');
    await mongoose.connect("mongodb://127.0.0.1:27017/buisnesstool");
    await connectRabbitMQ()
  } catch (error) {
    logger.error("Error starting server", error);
  }
});
