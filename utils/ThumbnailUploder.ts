import fs from 'fs';
import fileUploder from "./fileUploder";

export async function uploadThumbnail(path:string,key:string){
    let filUploded = false;
    while(!filUploded){
        try {
            console.log("uploding thumbnail:",path);
            await fileUploder(path,key)
            fs.unlinkSync(path);
            filUploded = true
        } catch (error) {
            console.log("retrying..");
            continue;
        }
    }
}