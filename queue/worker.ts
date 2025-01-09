import { Worker } from "bullmq";
import Redis from "ioredis";

const connection = new Redis({
  host: "127.0.0.1", // Replace with your Redis host
  port: 6379,        // Replace with your Redis port
  maxRetriesPerRequest: null, // Required for blocking connections
});


const worker = new Worker(
  "videos",
  async (job) => {
    try {
      console.log("Processing job:", JSON.stringify(job, null, 2));
      // Add your actual job processing logic here, if needed
    } catch (error) {
      console.error("Error processing job:", error);
      throw error; // Ensure the error is propagated to mark the job as failed
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} has been completed successfully.`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed with error:`, error);
});
