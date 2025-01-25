import path from "path";
import fs from "fs";
import fileUploder from "../utils/fileUploder";


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


        while (filesToUpload.length!=0) {
            const uploadPromises = filesToUpload.map(async (file) => {
                try {
                    // console.log("Uploading file", file);
                    const genkey = generateKey(key, file);
                    const url = await fileUploder(file,genkey);
                    fs.unlinkSync(file);
                    console.log(url);
                    filesToUpload = filesToUpload.filter((f) => f !== file);
                } catch (error) {
                    // console.log("error uploding file" + file);
                }
            });
    
            const uploadedUrls = await Promise.all(uploadPromises);
            console.log(uploadedUrls);
        }
        return "OK"
    } catch (error) {
        console.log("Error in uploading files", error);
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