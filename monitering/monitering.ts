//this is the code in monitering.ts
import os from "os";
import { Database } from "bun:sqlite";
const db = new Database("../database.sqlite", { create: true });



function getCPUUsage() {
  return new Promise<number>((resolve) => {
    const start = os.cpus();
    setTimeout(() => {
      const end = os.cpus();
      let idleDiff = 0, totalDiff = 0;

      for (let i = 0; i < start.length; i++) {
        const startCpu = start[i].times;
        const endCpu = end[i].times;

        const idle = endCpu.idle - startCpu.idle;
        const total = Object.values(endCpu).reduce((acc, val) => acc + val, 0) - 
                      Object.values(startCpu).reduce((acc, val) => acc + val, 0);

        idleDiff += idle;
        totalDiff += total;
      }

      const cpuUsagePercent = (1 - idleDiff / totalDiff) * 100;
      resolve(cpuUsagePercent);
    }, 1000); // Measure over 1 second
  });
}

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

export default async function logSystemStats() {
  // Ensure the table is created when the app starts
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        cpu_usage INTEGER ,
        memory_usage_gb INTEGER 
    )
  `);
  const cpuUsage = await getCPUUsage();
  const memoryUsage = getMemoryUsage();
  const query = db.query(`INSERT INTO system_metrics (
    cpu_usage, memory_usage_gb
  ) VALUES (
    ${Number.isNaN(cpuUsage)?0:Number(cpuUsage)}, ${Number.isNaN(memoryUsage.usedMemoryGB)?0:Number(memoryUsage.usedMemoryGB)}
  )`);
  
  query.run();
}
