import path from "path";
import fs from "fs";
import fileUploder from "../utils/fileUploder";
import logger from "../monitering/logging";


export default async function uploadFiles(key:string) {
    try {
        //preparing a list of all the file to uplode
        const resolutions = ["1080", "720", "360", "144"];
        let filesToUpload: string[] = [];
        resolutions.forEach((resolution) => {
            const dirpath = path.join(__dirname, `output/${resolution}`);
            const fileList = fs.readdirSync(dirpath);
            fileList.forEach((file) => {
                filesToUpload.push(path.join(dirpath, file));
            })
        });

        //uploding to bunny sometimes leads to errors that is why i create an array of all the files and upload them again and again until the array is empty
        while (filesToUpload.length!=0) {
            //bunny has an API limit of 100 requests that is why i uplode files in batches of 95 just to be safe
            let currentBatch = [""];
            if(filesToUpload.length>=95){
                currentBatch = filesToUpload.slice(0,95);
            }else{
                currentBatch = filesToUpload;
            }

            //uploding the current batch of files
            const uploadPromises = currentBatch.map(async (file) => {
                try {
                    logger.warning("Uploading file", file);
                    const genkey = generateKey(key, file);
                    const url = await fileUploder(file,genkey);
                    fs.unlinkSync(file);
                    //removing the files that were uploded successfully from the array of files
                    filesToUpload = filesToUpload.filter((f) => f !== file);
                } catch (error) {
                    logger.error("error uploding file" + file);
                }
            });
    
            const uploadedUrls = await Promise.all(uploadPromises);
        }
    } catch (error) {
        logger.error("Error in uploading files", error);
    }
}

function generateKey(tempKey: string, file: string) {
    let returnKey = tempKey;
    const key = file.split("\\");
    const fileName = key[key.length - 1];
    key.pop();

    const key2 = key.join("\\")
    if (key2.includes("1080")) {
        returnKey = returnKey + "/1080/" + fileName;
    } else if (key2.includes("720")) {
        returnKey = returnKey + "/720/" + fileName;
    } else if (key2.includes("360")) {
        returnKey = returnKey + "/360/" + fileName;
    } else {
        returnKey = returnKey + "/144/" + fileName;
    }
    return returnKey;
}