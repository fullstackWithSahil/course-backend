import fs from "fs";
import { promisify } from "util";

// Promisify fs functions for better async handling
const fsAccess = promisify(fs.access);
const fsStat = promisify(fs.stat);

// Helper function to verify file exists and is accessible
async function verifyFileExists(filePath: string): Promise<boolean> {
  try {
    await fsAccess(filePath, fs.constants.F_OK | fs.constants.R_OK);
    const stats = await fsStat(filePath);
    return stats.size > 0; // Ensure file has content
  } catch (error) {
    return false;
  }
}

// Helper function to wait for file to be fully written
export async function waitForFileReady(filePath: string, maxAttempts: number = 10, delay: number = 100): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (await verifyFileExists(filePath)) {
      // Additional check: wait a bit more to ensure file writing is complete
      await new Promise(resolve => setTimeout(resolve, 50));
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  return false;
}