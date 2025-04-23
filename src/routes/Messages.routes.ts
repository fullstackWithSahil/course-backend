import { Router } from "express";
import { deleteMessages, editMessages, getMessages, postMessages } from "../controllers/Messages.controller";

const MessagesRouter = Router();

MessagesRouter.post("/addmessage",postMessages);

MessagesRouter.get("/getMessages",getMessages);

MessagesRouter.patch("/editmessage",editMessages);

MessagesRouter.delete("/deletemessage",deleteMessages);

export default MessagesRouter;