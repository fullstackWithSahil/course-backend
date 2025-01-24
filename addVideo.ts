import type { Request, Response } from 'express';
import { channel, type MulterFile } from './index';
import fileUploder from './utils/fileUploder';
import fs from "fs";
import path from 'path';
import { uploadThumbnail } from './utils/ThumbnailUploder';

export default async function addVideo(req: Request, res: Response): Promise<void>{
    try {
        //getting the files for video and thumbnail
        const videoFile = (req.files as { [fieldname: string]: MulterFile[] })['video']?.[0];
        const thumbnailFile = (req.files as { [fieldname: string]: MulterFile[] })['thumbnail']?.[0];

        //checking if both the video and thumbnail exists
        if (!videoFile || !thumbnailFile) {
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

        //uploding the thumbnail
        const thumbnailPath = path.join(__dirname,thumbnailFile.path);
        await uploadThumbnail(thumbnailPath,req.body.key);
        
        //adding the video to the queue
        channel.sendToQueue(
            "videos", 
            Buffer.from(JSON.stringify({
                path:videoFile.filename,
                key:req.body.key
            })), 
            { persistent: false }
        );

        res.json({message: 'Video and thumbnail uploaded successfully'});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            title: 'Error adding video',
            description: 'There was an error uploading the video. Please try again later.'
        });
    }
}