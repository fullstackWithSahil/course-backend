import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec)

export default async function Transcode(resolution: "1080" | "720" | "360" | "144",input:string) {
    const scale = getRatio(resolution);
    try {
        console.log({command:`ffmpeg -i uploads/videos/${input} -c:v libx264 -c:a aac -vf scale=${scale} -f mp4 output/i${resolution}.mp4`})

        // Step 1: Transcode video
        await execPromise(`ffmpeg -i uploads/videos/${input} -c:v libx264 -c:a aac -vf scale=${scale} -f mp4 output/i${resolution}.mp4`);

        // Step 2: Generate HLS files
        await execPromise(
            `ffmpeg -i output/i${resolution}.mp4 -c:v libx264 -c:a aac -hls_time 10 -hls_list_size 0 -hls_segment_filename "output/${resolution}/segment_%03d.ts" -f hls output/${resolution}/index.m3u8`
        );

    } catch (error) {
        console.log("there was an error transcoding the video", error);
    }
};


function getRatio(resolution: string) {
    switch (resolution) {
        case "1080":
            return "1920:1080";
        case "720":
            return "1280:720";
        case "360":
            return "640:360";
        case "144":
            return "256:144";
        default:
            throw new Error("Invalid resolution");
    }
}
//build command: docker build -t my-app .