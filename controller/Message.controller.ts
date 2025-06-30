import type { Request, Response } from "express";
import MessageModel from "../model/Messages.model";


export async function getMessagesByChatId(req: Request, res: Response) {
	try {
		const { limit = 50, offset = 0 } = req.query;
        const { chatId } = req.params;

		const messages = await MessageModel.getMessagesByChat(
			chatId||"",
			Number(limit),
			Number(offset)
		);
		res.json(messages);
	} catch (err) {
		res.status(500).json({ error: "Failed to get messages", details: err });
	}
}

export async function createMessage(req: Request, res: Response) {
	try {
		const { chat, sender, content, replyTo } = req.body;
		const message = await MessageModel.addMessage(chat, content, sender, replyTo);
		res.status(201).json(message);
	} catch (err) {
		res.status(400).json({ error: "Failed to create message", details: err });
	}
}

export async function editMessage(req: Request, res: Response) {
	try {
		const { messageId } = req.params;
		const { content } = req.body;

		const updated = await MessageModel.editMessage(messageId||"", content);
		res.json(updated);
	} catch (err) {
		res.status(400).json({ error: "Failed to edit message", details: err });
	}
}

export async function deleteMessage(req: Request, res: Response) {
	try {
		const { messageId } = req.params;

		const deleted = await MessageModel.deleteMessage(messageId||"");
		res.json(deleted);
	} catch (err) {
		res.status(400).json({ error: "Failed to delete message", details: err });
	}
}

// 👇 Shared utility to create signed URL
// async function generatePresignedUrl(fileName: string, contentType: string) {
// 	const key = `uploads/${Date.now()}-${fileName}`;
// 	const command = new PutObjectCommand({
// 		Bucket: r2BucketName,
// 		Key: key,
// 		ContentType: contentType,
// 	});

// 	const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 60 * 5 });

// 	return { uploadUrl, key };
// }

// // 👇 Image Upload Handler
// export async function uplodeImage(req: Request, res: Response) {
// 	try {
// 		const { fileName, contentType } = req.body;
// 		const { uploadUrl, key } = await generatePresignedUrl(fileName, contentType);
// 		res.json({ uploadUrl, key });
// 	} catch (err) {
// 		res.status(500).json({ error: "Failed to get upload URL for image", details: err });
// 	}
// }

// // 👇 Video Upload Handler
// export async function uplodeVideo(req: Request, res: Response) {
// 	try {
// 		const { fileName, contentType } = req.body;
// 		const { uploadUrl, key } = await generatePresignedUrl(fileName, contentType);
// 		res.json({ uploadUrl, key });
// 	} catch (err) {
// 		res.status(500).json({ error: "Failed to get upload URL for video", details: err });
// 	}
// }

// // 👇 File Upload Handler
// export async function uplodeFile(req: Request, res: Response) {
// 	try {
// 		const { fileName, contentType } = req.body;
// 		const { uploadUrl, key } = await generatePresignedUrl(fileName, contentType);
// 		res.json({ uploadUrl, key });
// 	} catch (err) {
// 		res.status(500).json({ error: "Failed to get upload URL for file", details: err });
// 	}
// }
