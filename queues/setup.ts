import fs from 'fs';
import path from 'path';

export function setup(){
    console.log("setting up output folders....")
    const dirPath = path.join(__dirname,'output');
    const resolutions = ["1080","720","360","144"];
    resolutions.forEach(resolution=>{
        const filePath = path.join(dirPath, resolution);
        fs.mkdirSync(filePath, { recursive: true })
    });
}