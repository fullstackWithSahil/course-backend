import os from "os";
import { join } from "path";
import { Database } from "bun:sqlite";

const db = new Database(join(import.meta.dir, "../database.sqlite"), { create: true });

// Previous CPU usage values for smoothing
const cpuReadings: number[] = [];
const MAX_READINGS = 3; // Number of readings to keep for rolling average

/**
 * Gets CPU usage with Task Manager-like behavior
 * @param intervalMs Time interval for measurement in milliseconds
 * @returns Promise resolving to CPU usage percentage
 */
function getCPUUsage(intervalMs = 1000): Promise<number> {
  return new Promise<number>((resolve) => {
    const startCpus = os.cpus();
    
    setTimeout(() => {
      const endCpus = os.cpus();
      let totalIdle = 0;
      let totalTick = 0;
      
      // Loop through each CPU core
      for (let i = 0; i < startCpus.length; i++) {
        const startTimes = startCpus[i].times;
        const endTimes = endCpus[i].times;
        
        // Calculate all time differences
        const idle = endTimes.idle - startTimes.idle;
        const user = endTimes.user - startTimes.user;
        const nice = endTimes.nice - startTimes.nice;
        const sys = endTimes.sys - startTimes.sys;
        const irq = endTimes.irq - startTimes.irq;
        
        // Calculate total time
        const total = idle + user + nice + sys + irq;
        
        totalIdle += idle;
        totalTick += total;
      }
      
      // Calculate the CPU usage percentage with Task Manager limits
      const cpuFree = totalIdle / totalTick;
      let cpuUsagePercent = Math.min(99.9, Math.max(0, (1 - cpuFree) * 100));
      
      // Apply rolling average for smoothing
      cpuReadings.push(cpuUsagePercent);
      if (cpuReadings.length > MAX_READINGS) {
        cpuReadings.shift(); // Remove oldest reading
      }
      
      // Calculate the average if we have enough readings
      if (cpuReadings.length > 1) {
        cpuUsagePercent = cpuReadings.reduce((sum, value) => sum + value, 0) / cpuReadings.length;
      }
      
      resolve(cpuUsagePercent);
    }, intervalMs);
  });
}

/**
 * Gets memory usage information in GB
 * @returns Object with memory usage details
 */
function getMemoryUsage() {
  const totalMemoryGB = os.totalmem() / (1024 ** 3); // Convert bytes to GB
  const freeMemoryGB = os.freemem() / (1024 ** 3);
  const usedMemoryGB = totalMemoryGB - freeMemoryGB;
  
  return {
    totalMemoryGB: totalMemoryGB.toFixed(2),
    freeMemoryGB: freeMemoryGB.toFixed(2),
    usedMemoryGB: usedMemoryGB.toFixed(2),
    memoryUsagePercent: ((usedMemoryGB / totalMemoryGB) * 100).toFixed(2)
  };
}

/**
 * Logs system statistics to the database
 */
export default async function logSystemStats() {
  // Ensure the table is created when the app starts
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        cpu_usage REAL,
        memory_usage_gb REAL
    )
  `);
  
  const cpuUsage = await getCPUUsage();
  const memoryUsage = getMemoryUsage();
  
  const query = db.query(`INSERT INTO system_metrics (
    cpu_usage, memory_usage_gb
  ) VALUES (
    ${Number.isNaN(cpuUsage) || cpuUsage < 0 ? 0 : cpuUsage.toFixed(1)}, 
    ${Number.isNaN(memoryUsage.usedMemoryGB) ? 0 : Number(memoryUsage.usedMemoryGB)}
  )`);
  
  query.run();
}