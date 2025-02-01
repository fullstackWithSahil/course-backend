import amqp from "amqplib";
const QUEUE_NAME = "videos";
import fs from 'fs';
import path from "path";
import Transcode from "../utils/transcode";
import uploadFiles from "./uplodeFile";
import { uploadThumbnail } from "../utils/ThumbnailUploder";
import setup from "./setup";


async function consumeMessages() {
    try {
        const connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();
        await setup();
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

            //uplode the thumbnail
            await uploadThumbnail(data.thumbnail.path,data.thumbnail.key);

            // //trascode the video, convert it to hls 
            await Transcode("1080",data.path);
            await Transcode("720",data.path);
            await Transcode("360",data.path);
            await Transcode("144",data.path);

            //upload it to the storage and deleting it from the folder
            await uploadFiles(data.key);

            //deleting the input and output videos
            const file1 = path.join(__dirname, 'output/i1080.mp4');
            const file2 = path.join(__dirname, 'output/i720.mp4');
            const file3 = path.join(__dirname, 'output/i360.mp4');
            const file4 = path.join(__dirname, 'output/i144.mp4');
            fs.unlinkSync(file1);
            fs.unlinkSync(file2);
            fs.unlinkSync(file3);
            fs.unlinkSync(file4);
            const file5 = path.join(__dirname,"uploads/videos",data.path)
            console.log({file5})
            fs.unlinkSync(file5);
            channel.ack(msg);
          },
          { noAck: false } // Require explicit acknowledgment
        );
    } catch (err) {
        console.error("Error in RabbitMQ consumer:", err);
    }
}

consumeMessages();