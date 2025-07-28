import mongoose, { Document } from "mongoose";

interface IChat extends Document{
    name: string;
    teacher: string;
    members: string[];
    bannedMembers: string[];
    group: boolean;
    deleted: boolean;
}

const ChatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    teacher:{
        type:String,
        required:true,
    },
    members:[String],
    bannedMembers: [String],
    group: {
        type: Boolean,
        default: true,
    },
    deleted: {
        type: Boolean,
        default: false,
    }
}, {
  timestamps: true,
});

const Chat = mongoose.model<IChat>("chats", ChatSchema);

const ChatModel = {
    createChat: async (teacher: string,name:string,student:string,group?:boolean)=>{
        try {
            const chat = new Chat({
                teacher,
                name,
                members: teacher==student?[teacher]:[teacher,student],
                group: group || true,
            });
            await chat.save();
            return chat;
        } catch (error) {
            console.error("Error creating chat:", error);
            throw error;
        }
    },
    checkChatExists: async (teacher: string, name: string) => {
        try {
            const chat = await Chat.findOne({ teacher, name, deleted: false });
            if (chat) {
                return true; // Chat exists
            }
            return false; // Chat does not exist
        } catch (error) {
            console.error("Error checking chat existence:", error);
            throw error;
        }
    },
    getChatById: async (chatId: string) => {
        try {
            const chat = await Chat.findById(chatId);
            if (!chat) {
                throw new Error("Chat not found");
            }
            return chat;
        } catch (error) {
            console.error("Error fetching chat:", error);
            throw error;
        }
    },
    getChatByMember: async (member: string) => {
        try {
            const chats = await Chat.find({
                members: { $in: [member] },
                deleted: false
            });
            return chats;
        } catch (error) {
            console.error("Error fetching chats by member:", error);
            throw error;
        }
    },
    addMemberToChat: async (chatId: string, member: string) => {
        try {
            const chat = await Chat.findById(chatId);
            if (!chat) {
                throw new Error("Chat not found");
            }
            if (chat.members.includes(member)) {
                throw new Error("Member already exists in the chat");
            }
            if (chat.bannedMembers.includes(member)) {
                throw new Error("Member is banned from this chat");
            }
            const updatedList = [...chat.members, member];
            const updatedChat = await Chat.findByIdAndUpdate(chatId, {members:updatedList},{new:true});
            return updatedChat;
        } catch (error) {
            console.log("Error adding member to chat:", error);
            throw error;
        }
    },
    banMemberFromChat: async (chatId: string, member: string) => {
        try {
            const chat = await Chat.findById(chatId);
            if (!chat) {
                throw new Error("Chat not found");
            }
            if (chat.teacher === member) {
                throw new Error("Cannot ban the teacher from the chat");
            }
            if (chat.bannedMembers.includes(member)) {
                throw new Error("Member is already banned");
            }
            
            // Remove from members if present and add to banned list
            const updatedMembers = chat.members.filter(m => m !== member);
            const updatedBannedMembers = [...chat.bannedMembers, member];
            
            const updatedChat = await Chat.findByIdAndUpdate(
                chatId, 
                { 
                    members: updatedMembers,
                    bannedMembers: updatedBannedMembers 
                },
                { new: true }
            );
            return updatedChat;
        } catch (error) {
            console.error("Error banning member from chat:", error);
            throw error;
        }
    },
    unbanMemberFromChat: async (chatId: string, member: string) => {
        try {
            const chat = await Chat.findById(chatId);
            if (!chat) {
                throw new Error("Chat not found");
            }
            if (!chat.bannedMembers.includes(member)) {
                throw new Error("Member is not banned");
            }
            
            const updatedBannedMembers = chat.bannedMembers.filter(m => m !== member);
            
            const updatedChat = await Chat.findByIdAndUpdate(
                chatId, 
                { bannedMembers: updatedBannedMembers },
                { new: true }
            );
            return updatedChat;
        } catch (error) {
            console.error("Error unbanning member from chat:", error);
            throw error;
        }
    },
    deleteChat: async (chatId: string) => {
        try {
            const chat = await Chat.findById(chatId);
            if (!chat) {
                throw new Error("Chat not found");
            }
            
            // Soft delete - mark as deleted instead of removing from database
            const updatedChat = await Chat.findByIdAndUpdate(
                chatId,
                { deleted: true },
                { new: true }
            );
            return updatedChat;
        } catch (error) {
            console.error("Error deleting chat:", error);
            throw error;
        }
    },
    
    // Additional useful methods
    removeMemberFromChat: async (chatId: string, member: string) => {
        try {
            const chat = await Chat.findById(chatId);
            if (!chat) {
                throw new Error("Chat not found");
            }
            if (chat.teacher === member) {
                throw new Error("Cannot remove the teacher from the chat");
            }
            if (!chat.members.includes(member)) {
                throw new Error("Member is not in the chat");
            }
            
            const updatedMembers = chat.members.filter(m => m !== member);
            
            const updatedChat = await Chat.findByIdAndUpdate(
                chatId,
                { members: updatedMembers },
                { new: true }
            );
            return updatedChat;
        } catch (error) {
            console.error("Error removing member from chat:", error);
            throw error;
        }
    },
    
    getChatsByTeacher: async (teacher: string) => {
        try {
            const chats = await Chat.find({
                teacher: teacher,
                deleted: false
            });
            return chats;
        } catch (error) {
            console.error("Error fetching chats by teacher:", error);
            throw error;
        }
    }
}

export default ChatModel;