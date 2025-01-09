import { createClient } from "@supabase/supabase-js";
import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import type { Database } from "../database.types";
import { Queue } from 'bullmq';
export const myQueue = new Queue('videos');


const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default async function controller(req: Request, res: Response) {
  try {
    // Validate input
    if (!req.body.course) {
      return res.status(400).json({ message: "Course is required" });
    }

    // Fetch videos
    const { data: videos, error: fetchError } = await supabase
      .from("videos")
      .select("*")
      .eq("course", req.body.course);

    if (fetchError || !videos) {
      console.error("Error fetching videos:", fetchError);
      return res.status(400).json({ message: "Failed to fetch videos" });
    }

    // Download videos
    const promises = videos.map(async (video) => {
      if (!video.url) {
        throw new Error("Invalid video URL");
      }

      const { data, error } = await supabase.storage
        .from("courses")
        .download(video.url);

      if (error || !data) {
        console.error("Error downloading video:", error);
        throw new Error("Failed to download video");
      }

      // Ensure the "downloads" directory exists
      const downloadsDir = path.resolve("downloads");
      if (!video.teacher || !video.module) {
        throw new Error("Missing teacher or module information");
      }

      const createDir = path.join(downloadsDir, video.teacher, video.module);
      if (!fs.existsSync(createDir)) {
        fs.mkdirSync(createDir, { recursive: true });
      }

      // Ensure the file is in MP4 format
      let fileName = path.basename(video.url);
      if (!fileName.endsWith(".mp4")) {
        fileName = `${fileName}.mp4`;
      }

      const localFilePath = path.join(createDir, fileName);

      // Write file to disk
      await fs.promises.writeFile(localFilePath, Buffer.from(await data.arrayBuffer()) as any);
      await myQueue.add(fileName,{path:localFilePath})

      return `Downloaded: ${fileName}`;
    });

    const results = await Promise.allSettled(promises);

    const successes = results.filter((result) => result.status === "fulfilled");
    const failures = results.filter((result) => result.status === "rejected");

    res.json({
      message: "Video processing complete",
      successes: successes.length,
      failures: failures.length,
      errors: failures.map((f) => (f as PromiseRejectedResult).reason),
    });
  } catch (error) {
    console.error("Error in video controller:", error);
    res.status(500).json({
      message: "Error processing videos",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}