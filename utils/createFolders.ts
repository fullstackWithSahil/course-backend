import path from "path";
import { mkdir } from "node:fs/promises";

export default async function createFolders() {
    try {
        const resolutions = ["1080","720","360","144"];
        resolutions.forEach(async(res)=>{
            const newDirPath = path.join(__dirname,`../output/${res}`)
            await mkdir(newDirPath, { recursive: true });
        })
    } catch (error) {
        console.log("error creating folders");
    }
}
