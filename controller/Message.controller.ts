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
		const { chat, sender, content, replyTo,profile,firstname } = req.body;
		const message = await MessageModel.addMessage(
			chat, content, sender,profile,firstname, replyTo
		);
		res.status(201).json(message);
	} catch (err) {
		res.status(400).json({ error: "Failed to create message", details: err });
	}
}

export async function editMessage(req: Request, res: Response) {
	try {
		const { messageId } = req.params;
		const { content } = req.body;
		console.log({messageId,content})

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

export async function uplodeFile(req:Request,res:Response){
	try {
		const {chat,sender,content,replyTo,type,profile} = req.body;
		console.log(req.body);
		const image = await MessageModel.addFileMessage(chat,content,sender,profile,type,replyTo);
		res.json(image)
	} catch (error) {
		res.status(400).json({error:"Error uploding the file"})
		console.log("error uploding the file")
	}
}
