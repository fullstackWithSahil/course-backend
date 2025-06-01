import type { Request, Response } from "express";
import logger from "../../utils/logging";
import { deleteFiles, listFiles } from "../../utils/deleteFiles";

export async function DeleteVideo(req:Request,res:Response){
    try {
        const thumbnail:string = req.body.thumbnail;
        const videoFloder = req.body.url;
        const thumbnailKey = thumbnail.replace("https://buisnesstools-course.b-cdn.net/","")
        const videoKey = videoFloder.replace("https://buisnesstools-course.b-cdn.net/","")
        const filesToDelete =await listFiles(videoKey);
        filesToDelete.push(`https://syd.storage.bunnycdn.com/buisnesstool-course/${thumbnailKey}`);
        const ok =await deleteFiles(filesToDelete);
        res.json({ok});
    } catch (error) {
        logger.error("There was an error deleting video "+error)
    }
}