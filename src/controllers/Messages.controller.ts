import type { Request, Response } from "express";
import Messages from "../models/Message.model";


export async function getMessages(req: Request, res: Response) {
    try {
        const {course,chat}= req.query;
        if (course){
            const data = await Messages.find({ course }).sort({ createdAt:1 }).limit(150).exec();
            res.status(200).json(data);
            return;
        }
        if (chat){
            const data = await Messages.find({ 
                group: false, 
                $or: [
                    { sender: chat },
                    { to: chat }
                ]
            }).sort({ createdAt: 1 }).limit(150).exec();
            res.status(200).json(data);
            return;
        }
    } catch (error) {
        console.log("Error fetching messages", error);
        res.status(500).json({ error: "Error fetching messages" });
    }
}

export async function postMessages(req: Request, res: Response) {
    try {
        const { message, sender, to,course, profile, firstname,id,group } = req.body;
        const newMessage = new Messages({ id,message, sender, to, course,group, profile, firstname });
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