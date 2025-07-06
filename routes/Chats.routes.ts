//chat.routes.ts
import { Router} from "express";
import {
    createChat,
    addMember,
    banMember,
    unBanMember,
    deleteChat,
    getChatById,
    getChatsByMember,
    getChatsByTeacher,
    removeMember
} from "../controller/Chat.controller"; // Make sure this path and the exports are correct

const chatRouter = Router();

// Create a new chat
chatRouter.post("/create", createChat);

// Get a specific chat by ID
chatRouter.get("/:chatId", getChatById);

// Get all chats for a specific member
chatRouter.get("/member/:member", getChatsByMember);

// Get all chats created by a specific teacher
chatRouter.get("/teacher/:teacher", getChatsByTeacher);

// Add a member to a chat
chatRouter.post("/add-member", addMember);

// Remove a member from a chat (without banning)
chatRouter.post("/remove-member", removeMember);

// Ban a member from a chat
chatRouter.post("/ban-member", banMember);

// Unban a member from a chat
chatRouter.post("/unban-member", unBanMember);

// Delete a chat (soft delete)
chatRouter.delete("/:chatId", deleteChat);

// Alternative delete route using POST (for compatibility)
chatRouter.post("/delete", deleteChat);

export default chatRouter;