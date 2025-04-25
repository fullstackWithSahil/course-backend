import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const MessageSchema = new mongoose.Schema({
    group:Boolean,
    message:String,
    sender:String,
    to:String,
    course:Number,
    profile:String,
    firstname:String,
    id:{type:String,default:()=>uuidv4()},
},{timestamps: true});

const Messages = mongoose.models.messages|| mongoose.model("messages", MessageSchema);

export default Messages;