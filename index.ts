import mongoose from "mongoose";
import express from "express";
import chatRouter from "./routes/Chats.routes";
import messageRouter from "./routes/Message.routes";
const app = express();
import http from "http";
const server = http.createServer(app);
import cors from "cors";
import { Server, Socket } from "socket.io";
import { fetch } from "bun";

const io = new Server(server, {
	cors: {
		origin: "http://localhost:3000",
	},
});

app.use(express.json());
app.use(cors());

app.use("/api/chats", chatRouter);
app.use("/api/messages", messageRouter);

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
	} catch (error) {
		console.log("error starting the server");
	}
});
