//messages.routes.ts
import { Router } from "express";
import {
	getMessagesByChatId,
	createMessage,
	editMessage,
	deleteMessage,
	uplodeFile
} from "../controller/Message.controller";

const router = Router();

// Get messages from a chat
router.get("/chat/:chatId", getMessagesByChatId);

// Create a text message
router.post("/create", createMessage);

// Edit a message
router.put("/:messageId", editMessage);

// Soft delete a message
router.delete("/:messageId", deleteMessage);

//save message that contain image.video or file
router.post("/upload/file", uplodeFile);

export default router;