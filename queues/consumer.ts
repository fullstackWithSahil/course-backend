import amqp from "amqplib";
import fs from 'fs';
import path from "path";
import Transcode from "./transcode";
import uploadFiles from "./uplodeFile";
import setup from "./setup";
import logger from "../monitering/logging";

const QUEUE_NAME = "videos";

async function consumeMessages() {
    try {
        const connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();
        const resolutions:['1080', '720', '360', '144'] = ['1080', '720', '360', '144'];
        
        // Set prefetch to 1 to ensure we process one message at a time
        await channel.prefetch(1);
        
        await setup();
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        
        logger.info(`Waiting for messages in ${QUEUE_NAME}. Press CTRL+C to exit.`);
        
        channel.consume(
            QUEUE_NAME,
            async (msg) => {
                if (msg == null) return;
                
                try {
                    const message = msg.content.toString();
                    const data = JSON.parse(message);
                    logger.info(`Processing message: ${data.path}`);
                    
                    // Process transcoding sequentially
                    for (const resolution of resolutions) {
                        logger.info(`Transcoding ${resolution}p version...`);
                        await Transcode(resolution, data.path);
                    }
                    
                    // Upload all transcoded files
                    await uploadFiles(data.key);
                    
                    // Clean up files
                    const filesToDelete = [
                        path.join(__dirname, 'output/i1080.mp4'),
                        path.join(__dirname, 'output/i720.mp4'),
                        path.join(__dirname, 'output/i360.mp4'),
                        path.join(__dirname, 'output/i144.mp4'),
                        path.join(__dirname, "uploads/videos", data.path)
                    ];
                    
                    for (const file of filesToDelete) {
                        try {
                            await fs.promises.unlink(file);
                            logger.warning(`Deleted: ${file}`);
                        } catch (error:any) {
                            logger.warning(`Failed to delete ${file}:`, error.message);
                        }
                    }
                    
                    // Acknowledge the message only after all processing is complete
                    channel.ack(msg);
                    logger.info(`Successfully processed message for: ${data.path}`);
                } catch (err) {
                    logger.error("Error processing message:", err);
                    // Reject the message without requeuing
                    channel.nack(msg, false, false);
                }
            },
            { noAck: false }
        );
        
        // Handle connection closure
        connection.on('close', (err) => {
            logger.error('RabbitMQ connection closed:', err);
            // Attempt to reconnect after a delay
            setTimeout(() => consumeMessages(), 5000);
        });
        
    } catch (err) {
        logger.error("Error in RabbitMQ consumer:", err);
        // Attempt to reconnect after a delay
        setTimeout(() => consumeMessages(), 5000);
    }
}

consumeMessages();