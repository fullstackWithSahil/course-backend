import type { Request, Response } from "express";
import ChatModel from "../model/Chat.model" // Adjust path as needed

export async function createChat(req: Request, res: Response) {
    try {
        const { teacher,name,student } = req.body;
        
        // Validation
        if (!teacher) {
            res.status(400).json({
                success: false,
                message: "Teacher is required"
            });
            return; 
        }
        
        if (typeof teacher !== 'string' || teacher.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: "Teacher must be a valid string"
            });
            return; 
        }

        //check if the chat already exists
        const chatExists = await ChatModel.checkChatExists(teacher.trim(), name.trim());
        if (chatExists) {
            res.status(409).json({
                success: false,
                message: "Chat with this name already exists for this teacher"
            });
            return; 
        }
        
        const chat = await ChatModel.createChat(teacher.trim(),name,student.trim(),true);
        
        res.status(201).json({
            success: true,
            message: "Chat created successfully",
            data: chat
        });
        
    } catch (error) {
        console.error("Error in createChat controller:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

export async function addMember(req: Request, res: Response) {
    try {
        const { chatId, member } = req.body;
        
        // Validation
        if (!chatId || !member) {
            res.status(400).json({
                success: false,
                message: "Chat ID and member are required"
            });
            return 
        }
        
        if (typeof chatId !== 'string' || typeof member !== 'string') {
            res.status(400).json({
                success: false,
                message: "Chat ID and member must be valid strings"
            });
            return 
        }
        
        if (chatId.trim().length === 0 || member.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: "Chat ID and member cannot be empty"
            });
            return
        }
        
        const updatedChat = await ChatModel.addMemberToChat(chatId.trim(), member.trim());
        
        res.status(200).json({
            success: true,
            message: "Member added successfully",
            data: updatedChat
        });
        
    } catch (error) {
        console.error("Error in addMember controller:", error);
        
        // Handle specific error cases
        if (error instanceof Error) {
            if (error.message === "Chat not found") {
                res.status(404).json({
                    success: false,
                    message: "Chat not found"
                });
                return 
            }
            
            if (error.message === "Member already exists in the chat") {
                res.status(409).json({
                    success: false,
                    message: "Member already exists in the chat"
                });
                return 
            }
            
            if (error.message === "Member is banned from this chat") {
                res.status(403).json({
                    success: false,
                    message: "Member is banned from this chat"
                });
                return 
            }
        }
        
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

export async function banMember(req: Request, res: Response) {
    try {
        const { chatId, member } = req.body;
        
        // Validation
        if (!chatId || !member) {
            res.status(400).json({
                success: false,
                message: "Chat ID and member are required"
            });
            return 
        }
        
        if (typeof chatId !== 'string' || typeof member !== 'string') {
            res.status(400).json({
                success: false,
                message: "Chat ID and member must be valid strings"
            });
            return 
        }
        
        if (chatId.trim().length === 0 || member.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: "Chat ID and member cannot be empty"
            });
            return 
        }
        
        const updatedChat = await ChatModel.banMemberFromChat(chatId.trim(), member.trim());
        
        res.status(200).json({
            success: true,
            message: "Member banned successfully",
            data: updatedChat
        });
        
    } catch (error) {
        console.error("Error in banMember controller:", error);
        
        // Handle specific error cases
        if (error instanceof Error) {
            if (error.message === "Chat not found") {
                res.status(404).json({
                    success: false,
                    message: "Chat not found"
                });
                return 
            }
            
            if (error.message === "Cannot ban the teacher from the chat") {
                res.status(403).json({
                    success: false,
                    message: "Cannot ban the teacher from the chat"
                });
                return 
            }
            
            if (error.message === "Member is already banned") {
                res.status(409).json({
                    success: false,
                    message: "Member is already banned"
                });
                return 
            }
        }
        
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

export async function unBanMember(req: Request, res: Response) {
    try {
        const { chatId, member } = req.body;
        
        // Validation
        if (!chatId || !member) {
            res.status(400).json({
                success: false,
                message: "Chat ID and member are required"
            });
            return 
        }
        
        if (typeof chatId !== 'string' || typeof member !== 'string') {
            res.status(400).json({
                success: false,
                message: "Chat ID and member must be valid strings"
            });
            return 
        }
        
        if (chatId.trim().length === 0 || member.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: "Chat ID and member cannot be empty"
            });
            return 
        }
        
        const updatedChat = await ChatModel.unbanMemberFromChat(chatId.trim(), member.trim());
        const chatWithoutBannedMembers = await ChatModel.addMemberToChat(chatId.trim(), member.trim());
        
        res.status(200).json({
            success: true,
            message: "Member unbanned successfully",
            data: chatWithoutBannedMembers
        });
        
    } catch (error) {
        console.error("Error in unBanMember controller:", error);
        
        // Handle specific error cases
        if (error instanceof Error) {
            if (error.message === "Chat not found") {
                res.status(404).json({
                    success: false,
                    message: "Chat not found"
                });
                return 
            }
            
            if (error.message === "Member is not banned") {
                res.status(400).json({
                    success: false,
                    message: "Member is not banned"
                });
                return 
            }
        }
        
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

export async function deleteChat(req: Request, res: Response) {
    try {
        const { chatId } = req.body;
        
        // Also support chatId from URL params
        const id = chatId || req.params.chatId;
        
        // Validation
        if (!id) {
            res.status(400).json({
                success: false,
                message: "Chat ID is required"
            });
            return 
        }
        
        if (typeof id !== 'string' || id.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: "Chat ID must be a valid string"
            });
            return
        }
        
        const deletedChat = await ChatModel.deleteChat(id.trim());
        
        res.status(200).json({
            success: true,
            message: "Chat deleted successfully",
            data: deletedChat
        });
        
    } catch (error) {
        console.error("Error in deleteChat controller:", error);
        
        // Handle specific error cases
        if (error instanceof Error) {
            if (error.message === "Chat not found") {
                res.status(404).json({
                    success: false,
                    message: "Chat not found"
                });
                return 
            }
        }
        
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

// Additional controller methods for extra functionality

export async function getChatById(req: Request, res: Response) {
    try {
        const { chatId } = req.params;
        
        if (!chatId) {
            res.status(400).json({
                success: false,
                message: "Chat ID is required"
            });
            return 
        }
        
        if (typeof chatId !== 'string' || chatId.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: "Chat ID must be a valid string"
            });
            return 
        }
        
        const chat = await ChatModel.getChatById(chatId.trim());
        
        res.status(200).json({
            success: true,
            message: "Chat retrieved successfully",
            data: chat
        });
        
    } catch (error) {
        console.error("Error in getChatById controller:", error);
        
        if (error instanceof Error && error.message === "Chat not found") {
            res.status(404).json({
                success: false,
                message: "Chat not found"
            });
            return 
        }
        
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

export async function getChatsByMember(req: Request, res: Response) {
    try {
        const { member } = req.params;
        
        if (!member) {
            res.status(400).json({
                success: false,
                message: "Member is required"
            });
            return 
        }
        
        if (typeof member !== 'string' || member.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: "Member must be a valid string"
            });
            return 
        }
        
        const chats = await ChatModel.getChatByMember(member.trim());
        
        res.status(200).json({
            success: true,
            message: "Chats retrieved successfully",
            data: chats,
            count: chats.length
        });        
    } catch (error) {
        console.error("Error in getChatsByMember controller:", error);
        
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

export async function getChatsByTeacher(req: Request, res: Response) {
    try {
        const { teacher } = req.params;
        
        if (!teacher) {
            res.status(400).json({
                success: false,
                message: "Teacher is required"
            });
            return 
        }
        
        if (typeof teacher !== 'string' || teacher.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: "Teacher must be a valid string"
            });
            return 
        }
        
        const chats = await ChatModel.getChatsByTeacher(teacher.trim());
        
        res.status(200).json({
            success: true,
            message: "Chats retrieved successfully",
            data: chats,
            count: chats.length
        });
        
    } catch (error) {
        console.error("Error in getChatsByTeacher controller:", error);
        
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

export async function removeMember(req: Request, res: Response) {
    try {
        const { chatId, member } = req.body;
        
        // Validation
        if (!chatId || !member) {
            res.status(400).json({
                success: false,
                message: "Chat ID and member are required"
            });
            return 
        }
        
        if (typeof chatId !== 'string' || typeof member !== 'string') {
            res.status(400).json({
                success: false,
                message: "Chat ID and member must be valid strings"
            });
            return 
        }
        
        if (chatId.trim().length === 0 || member.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: "Chat ID and member cannot be empty"
            });
            return 
        }
        
        const updatedChat = await ChatModel.removeMemberFromChat(chatId.trim(), member.trim());
        
        res.status(200).json({
            success: true,
            message: "Member removed successfully",
            data: updatedChat
        });
        
    } catch (error) {
        console.error("Error in removeMember controller:", error);
        
        // Handle specific error cases
        if (error instanceof Error) {
            if (error.message === "Chat not found") {
                res.status(404).json({
                    success: false,
                    message: "Chat not found"
                });
                return 
            }
            
            if (error.message === "Cannot remove the teacher from the chat") {
                res.status(403).json({
                    success: false,
                    message: "Cannot remove the teacher from the chat"
                });
                return 
            }
            
            if (error.message === "Member is not in the chat") {
                res.status(400).json({
                    success: false,
                    message: "Member is not in the chat"
                });
                return 
            }
        }
        
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}