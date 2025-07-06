import amqp from "amqplib";
import fs from "fs";
import path from "path";
import Transcode from "./consumer/transcode";
import fileUploder from "./utils/fileUploder";
import createFolders from "./utils/createFolders";

async function startConsumer() {
	try {
        await createFolders();
		const connection = await amqp.connect("amqp://localhost"); // or your actual URL
		const channel = await connection.createChannel();

		await channel.assertQueue("videos", { durable: true });

		// Prefetch 1 so it only processes one message at a time
		channel.prefetch(1);

		console.log("Waiting for messages in queue...");

		channel.consume("videos", async (msg) => {
			if (msg !== null) {
				try {
					const payload = JSON.parse(msg.content.toString());
					console.log("Received message:", payload);

					//Transcoding the video to different resolutions
					await Transcode("1080", payload.videoPath);
					await Transcode("720", payload.videoPath);
					await Transcode("360", payload.videoPath);
					await Transcode("144", payload.videoPath);

					console.log("Finished processing:", payload.videoPath);

					//creating a list of all the files to uplode
					let filesToUpload: { path: string; key: string }[] = [];
					const resolutions = ["1080", "720", "360", "144"];
					for (const res of resolutions) {
						const folderPath = path.join("output", res);
						const files = fs.readdirSync(folderPath);
						for (const file of files) {
							const key = `${payload.key}/${res}/${file}`;
							const localFilePath = path.join(folderPath, file);
							filesToUpload.push({ path: localFilePath, key });
						}
					}

					while (filesToUpload.length != 0) {
						//bunny has an API limit of 100 requests that is why i uplode files in batches of 95 just to be safe
						let currentBatch = [];
						if (filesToUpload.length >= 95) {
							currentBatch = filesToUpload.slice(0, 95);
						} else {
							currentBatch = filesToUpload;
						}

						//uploding the current batch of files
						const uploadPromises = currentBatch.map(
							async (file) => {
								try {
									const url = await fileUploder(
										file.path,
										file.key
									);
									fs.unlinkSync(file.path);
									//removing the files that were uploded successfully from the array of files
									filesToUpload = filesToUpload.filter(
										(f) => f.key !== file.key
									);
								} catch (error) {
									console.log("error uploding file" + file);
								}
							}
						);

						//delete the initial resolution files
						const filesToDelete = [
							path.join(__dirname, "output/i1080.mp4"),
							path.join(__dirname, "output/i720.mp4"),
							path.join(__dirname, "output/i360.mp4"),
							path.join(__dirname, "output/i144.mp4"),
							path.join(__dirname, payload.videoPath),
						];

						for (const file of filesToDelete) {
							try {
								await fs.promises.unlink(file);
								console.log(`Deleted: ${file}`);
							} catch (error: any) {
								console.log(
									`Failed to delete ${file}:`,
									error.message
								);
							}
						}
						await Promise.all(uploadPromises);
					}

					// Acknowledge that the message has been processed
					channel.ack(msg);
				} catch (error) {
					console.log("Error processing message:", error);
					channel.nack(msg, false, false); // false = don't requeue
				}
			}
		});
	} catch (error) {
		console.log("Consumer error:", error);
	}
}

startConsumer();