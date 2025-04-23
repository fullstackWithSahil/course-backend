import type { Request, Response } from "express";
import Messages from "../models/Message.model";
import { v4 as uuidv4 } from 'uuid';


export async function getMessages(req: Request, res: Response) {
    try {
        const {course}= req.query;
        const data = await Messages.find({course}).sort({ createdAt: -1 }).limit(150).exec();
        res.status(200).json(data);
    } catch (error) {
        console.log("Error fetching messages", error);
        res.status(500).json({ error: "Error fetching messages" });
    }
}

export async function postMessages(req: Request, res: Response) {
    try {
        const id = uuidv4();
        const { message, sender, to, group, course, profile, firstname } = req.body;
        const newMessage = new Messages({ id,message, sender, to, group, course, profile, firstname });
        await newMessage.save();
        res.status(200).json(newMessage);
    } catch (error) {
        console.log("Error posting messages", error);
        res.status(500).json({ error: "Error posting messages" });
    }
}

export async function deleteMessages(req: Request, res: Response) {
    try {
        const { id } = req.body;
        await Messages.deleteOne({ id });
        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.log("Error deleting messages", error);
        res.status(500).json({ error: "Error deleting messages" });
    }
}

export async function editMessages(req: Request, res: Response) {
    try {
        const { id, message } = req.body;
        await Messages.findOneAndUpdate({ id }, { message });
        res.status(200).json({ message: "Message updated successfully" });
    }
    catch (error) {
        console.log("Error updating messages", error);
        res.status(500).json({ error: "Error updating messages" });
    }   
}