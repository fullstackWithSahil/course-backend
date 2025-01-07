// import { createClient } from "@supabase/supabase-js";
// import express from "express";
import path from "path";
import fs from "fs"
// const app = express();

// app.use(express.json());
// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);


// async function startContainers(){
    
// }



// app.post('/api/transcode', async(req, res) => {
//     try {
//          // File path and bucket name
//         const bucketName = "courses";
//         const fileName = "sahil3.mp4";
//         const localFilePath = path.resolve("downloads", fileName);

//         // Fetch video from Supabase
//         const { data, error } = await supabase.storage
//             .from(bucketName)
//             .download(fileName);

//         if (error) {
//             console.error("Error fetching video:", error);
//             return res.status(400).json({ message: "Failed to fetch video", error });
//         }

//         // Ensure the "downloads" directory exists
//         if (!fs.existsSync("downloads")) {
//             fs.mkdirSync("downloads");
//         }

//         // Write the file to the local file system
//         fs.writeFileSync(localFilePath, Buffer.from(await data.arrayBuffer()));
//         res.json({ message: "video successfully downloaded"});
//     } catch (error) {
//         console.log("There was an error trasnscoding the video: ", error);
//         res.json({
//             title:"Error trasnscoding the video",
//             description:"Error trasnscoding the video node server issue"
//         })
//     }
// });


// const port = process.env.PORT || 8080;
// app.listen(port,()=>{
//     console.log("listening on port " + port);
// });

const Docker = require("dockerode");
const docker = new Docker({ host: 'localhost', port: 2375 });

async function startContainers(resolution:string) {
    try {
        // Create the container with proper volume mapping and environment variables
        let auxContainer = await docker.createContainer({
            Image: 'my-app', // Ensure this image exists locally
            Env: [
                `RESOLUTION=${resolution}`
            ],
            HostConfig: {
                Binds: [
                    // Map host directories to container paths
                    "C:/Users/Sahil Pramod nayak/Desktop/project/freshBackend/download:/app/download"
                ]
            }
        });

        console.log("Container created with ID:", auxContainer.id);

        // Start the container
        await auxContainer.start();
        // console.log("Container started.");

        // // Stop the container
        // await auxContainer.stop();
        // console.log("Container stopped.");

        // // Remove the container
        // await auxContainer.remove();
        // console.log("Container removed.");
    } catch (error) {
        console.error("Error starting containers:", error);
    }
}

startContainers("1080");