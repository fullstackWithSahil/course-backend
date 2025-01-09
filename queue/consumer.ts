import { createClient } from "@supabase/supabase-js";
import amqp from "amqplib";
import type { Database } from "../database.types";
const QUEUE_NAME = "videos";
import fs from 'fs';
import path from "path";
import Transcode from "../transcode";
import uploadFiles from "./uplodefiles";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

async function consumeMessages() {
    try {
        const connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        console.log(`Waiting for messages in ${QUEUE_NAME}. Press CTRL+C to exit.`);

        channel.consume(QUEUE_NAME,
            async (msg) => {
              if (msg == null) {
                return;
              }
            //pares the path
            const message = msg.content.toString();
            const data = JSON.parse(message);
            console.log(`Processed message: ${data.path}`);
            //download the video
            // const { data:file, error } = await supabase.storage
            //         .from('courses')
            //         .download(data.path);
            // if (error||!file) {
            //   return console.error("Error downloading file:", error);
            // }

            // const blob = file;
            // const buffer = Buffer.from( await blob.arrayBuffer());
            const inputPath = path.join(__dirname, 'downloads/input.mp4',);
            // await fs.promises.writeFile(inputPath, buffer as any);

            //trascode the video, convert it to hls 
            await Transcode("1080");
            await Transcode("720");
            await Transcode("360");
            await Transcode("144");

            //upload it to the storage and deleting it from the folder
            await uploadFiles(data.path);

            //deleting the input and output videos
            fs.unlinkSync(inputPath);
            const file1 = path.join(__dirname, 'output/i1080.mp4');
            const file2 = path.join(__dirname, 'output/i720.mp4');
            const file3 = path.join(__dirname, 'output/i360.mp4');
            const file4 = path.join(__dirname, 'output/i144.mp4');
            fs.unlinkSync(file1);
            fs.unlinkSync(file2);
            fs.unlinkSync(file3);
            fs.unlinkSync(file4);
            channel.ack(msg);
          },
          { noAck: false } // Require explicit acknowledgment
        );
    } catch (err) {
        console.error("Error in RabbitMQ consumer:", err);
    }
}

consumeMessages();