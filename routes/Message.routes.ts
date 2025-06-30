import { Router } from "express";
import {
	getMessagesByChatId,
	createMessage,
	editMessage,
	deleteMessage,
	// uplodeImage,
	// uplodeVideo,
	// uplodeFile
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

// // Get presigned URL for image upload
// router.post("/upload/image", uplodeImage);

// // Get presigned URL for video upload
// router.post("/upload/video", uplodeVideo);

// // Get presigned URL for file upload
// router.post("/upload/file", uplodeFile);

export default router;