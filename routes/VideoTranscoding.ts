import type { Response,Request } from "express";
import {channel,type MulterFile} from "../index"

export async function addVideo(req:Request,res:Response){
    try {
        console.log({key:req.body.key})
        //getting the files for video and thumbnail
        const videoFile = (req.files as { [fieldname: string]: MulterFile[] })['video']?.[0];
        
        //checking if both the video and thumbnail exists
        if (!videoFile) {
            res.status(400).json({
                title: 'Invalid Upload',
                description: 'Both video and thumbnail are required.'
            });
            return;
        }
        
        //checking if rabbit mq is working proprely
        if(!channel){
            res.json({
                title:"There was an error uploading the video",
                description:"There was an error uploading the video try again later"
            })
            return
        }

        //adding the video to the queue
        console.log("enquing to queue.....",videoFile.fieldname);
        console.log({path:videoFile.filename})
        channel.sendToQueue(
            "videos", 
            Buffer.from(JSON.stringify({
                path: videoFile.filename,
                key:req.body.key,
            })), 
            { persistent: false }
        );
        
        res.json({message: 'Video uploaded successfully'});
    } catch (error) {
        console.log("Error adding video to queue",error);
    }
}