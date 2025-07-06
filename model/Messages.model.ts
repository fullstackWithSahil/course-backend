//Message.model.ts
import mongoose, { Document } from "mongoose";

interface IMessage extends Document{
    chat: string;
    sender: string;
    content: string;
    type:"text"|"image"|"video"|"file";
    replyTo?: string;
    deleted?: boolean;
    profile:string;
}

const MessageSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "chats",
        required: true,
    },
    sender: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["text", "image", "video", "file"],
        default: "text",
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "messages",
        default: null,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    profile:{
        type:String,
    },
    firstname:String,
}, {
  timestamps: true,
});

const Message = mongoose.model<IMessage>("messages", MessageSchema);

const MessageModel = {
    addMessage: async (
        chat: string, 
        content: string, 
        sender: string,
        profile:string, 
        firstname:string,
        replyTo?: string,
    ) => {
        try {
            if (!content.trim()) {
                throw new Error("Message content cannot be empty");
            }
            
            const message = new Message({
                chat,
                sender,
                content: content.trim(),
                type: "text",
                replyTo: replyTo || null,
                profile,
                firstname,
            });
            
            await message.save();
            await message.populate('replyTo');
            return message;
        } catch (error) {
            console.error("Error adding message:", error);
            throw error;
        }
    },

    editMessage: async (messageId: string, content: string) => {
        try {
            if (!content.trim()) {
                throw new Error("Message content cannot be empty");
            }
            
            const message = await Message.findById(messageId);
            if (!message) {
                throw new Error("Message not found");
            }
            
            if (message.deleted) {
                throw new Error("Cannot edit deleted message");
            }
            
            const updatedMessage = await Message.findByIdAndUpdate(
                messageId,
                { content: content.trim() }
            )
            
            return updatedMessage;
        } catch (error) {
            console.error("Error editing message:", error);
            throw error;
        }
    },

    deleteMessage: async (messageId: string) => {
        try {
            const message = await Message.findById(messageId);
            if (!message) {
                throw new Error("Message not found");
            }
            
            if (message.deleted) {
                throw new Error("Message is already deleted");
            }
            
            // Soft delete - mark as deleted instead of removing from database
            const deletedMessage = await Message.findByIdAndUpdate(
                messageId,
                { deleted: true },
            );
            
            return deletedMessage;
        } catch (error) {
            console.error("Error deleting message:", error);
            throw error;
        }
    },

    getMessagesByChat: async (chatId: string, limit: number = 50, offset: number = 0) => {
        try {
            const messages = await Message.find({
                chat: chatId,
                deleted: false
            })
            .populate('replyTo')
            .sort({ createdAt: -1 }) // Most recent first
            .skip(offset*limit)
            .limit(limit);
            
            return messages.reverse(); // Return in chronological order
        } catch (error) {
            console.error("Error fetching messages by chat:", error);
            throw error;
        }
    },

    // Additional useful methods
    addFileMessage: async (
        chat: string, 
        content: string, 
        sender: string,
        profile:string,
        type:"image"|"video"|"file",
        replyTo?: string
    ) => {
        try {
            if (!content.trim()) {
                throw new Error("File URL cannot be empty");
            }
            
            const message = new Message({
                chat,
                sender,
                content: content.trim(),
                type,
                replyTo: replyTo || null,
                profile,
            });
            
            await message.save();
            await message.populate('replyTo');
            return message;
        } catch (error) {
            console.error("Error adding file message:", error);
            throw error;
        }
    },
    getMessagesBySender: async (sender: string, limit: number = 50, offset: number = 0) => {
        try {
            const messages = await Message.find({
                sender: sender,
                deleted: false
            })
            .populate('replyTo')
            .populate('chat')
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit);
            
            return messages;
        } catch (error) {
            console.error("Error fetching messages by sender:", error);
            throw error;
        }
    },

    searchMessages: async (chatId: string, searchTerm: string, limit: number = 20) => {
        try {
            const messages = await Message.find({
                chat: chatId,
                content: { $regex: searchTerm, $options: 'i' },
                deleted: false
            })
            .populate('replyTo')
            .sort({ createdAt: -1 })
            .limit(limit);
            
            return messages;
        } catch (error) {
            console.error("Error searching messages:", error);
            throw error;
        }
    },

    getMessageCount: async (chatId: string) => {
        try {
            const count = await Message.countDocuments({
                chat: chatId,
                deleted: false
            });
            
            return count;
        } catch (error) {
            console.error("Error getting message count:", error);
            throw error;
        }
    },

    getRecentMessages: async (chatId: string, minutes: number = 60) => {
        try {
            const timeAgo = new Date(Date.now() - minutes * 60 * 1000);
            
            const messages = await Message.find({
                chat: chatId,
                createdAt: { $gte: timeAgo },
                deleted: false
            })
            .populate('replyTo')
            .sort({ createdAt: -1 });
            
            return messages;
        } catch (error) {
            console.error("Error fetching recent messages:", error);
            throw error;
        }
    },

    replyToMessage: async (originalMessageId: string, chat: string, content: string, sender: string, type: "text" | "image" | "video" | "file" = "text") => {
        try {
            // Validate the original message exists
            const originalMessage = await Message.findById(originalMessageId);
            if (!originalMessage) {
                throw new Error("Original message not found");
            }
            
            if (originalMessage.deleted) {
                throw new Error("Cannot reply to a deleted message");
            }
            
            // Ensure the original message belongs to the same chat
            if (originalMessage.chat.toString() !== chat) {
                throw new Error("Cannot reply to a message from a different chat");
            }
            
            if (!content.trim()) {
                throw new Error("Reply content cannot be empty");
            }
            
            const replyMessage = new Message({
                chat,
                sender,
                content: content.trim(),
                type,
                replyTo: originalMessageId,
            });
            
            await replyMessage.save();
            await replyMessage.populate('replyTo');
            return replyMessage;
        } catch (error) {
            console.error("Error replying to message:", error);
            throw error;
        }
    },

    getRepliesTo: async (messageId: string) => {
        try {
            const replies = await Message.find({
                replyTo: messageId,
                deleted: false
            })
            .populate('replyTo')
            .sort({ createdAt: 1 }); // Chronological order for replies
            
            return replies;
        } catch (error) {
            console.error("Error fetching replies:", error);
            throw error;
        }
    }
}

export default MessageModel;