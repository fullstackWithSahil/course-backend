import { Database } from "bun:sqlite";
const db = new Database("../database.sqlite", { create: true });

// db.exec(`
//     CREATE TABLE IF NOT EXISTS system_metrics (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
//       cpu_usage INTEGER,
//       memory_usage_gb INTEGER
//     )
// `);

// const stmt = db.query("INSERT INTO system_metrics (cpu_usage, memory_usage_gb) VALUES (10, 11)");
// const data = stmt.run();
// console.log(data);

const query = db.query("SELECT * FROM system_metrics");
let result = query.values();
console.log(result)
// const query =db.query("SELECT  * FROM  system_metrics")
// for (const row of query.iterate()) {
//     console.log(row);
// }
