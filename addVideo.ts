import type { Request, Response } from 'express';
import { channel, type MulterFile } from './index';
import path from 'path';

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
        const thumbnailKey = req.body.key + "thumbnail";
        
        //adding the video to the queue
        console.log("enquing to queue.....",videoFile.fieldname);
        channel.sendToQueue(
            "videos", 
            Buffer.from(JSON.stringify({
                path:videoFile.filename,
                key:req.body.key,
                thumbnail:{
                    path:thumbnailPath,
                    key:thumbnailKey
                }
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