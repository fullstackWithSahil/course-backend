import type { Response,Request } from "express";
import {channel,type MulterFile} from "../index"
import deleteFolderInCDN from "../utils/deleteFile";

export async function addVideo(req:Request,res:Response){
    try {
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
                update:req.body.update
            })), 
            { persistent: false }
        );
        //delete the videos from bunn CDN if they already exist
        if (req.body.update) {
            const promises =[
                deleteFolderInCDN(`${req.body.key}/1080`),
                deleteFolderInCDN(`${req.body.key}/720`),
                deleteFolderInCDN(`${req.body.key}/360`),
                deleteFolderInCDN(`${req.body.key}/144`),
            ];
            await Promise.all(promises).then(() =>{
                console.log("videos deleted successfully");
            })
        }
        
        res.json({message: 'Video uploaded successfully'});
    } catch (error) {
        console.log("Error adding video to queue",error);
    }
}