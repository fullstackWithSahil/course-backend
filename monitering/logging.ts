import { Database } from "bun:sqlite";
import { join } from "path";

// Types of log levels
type LogLevel = 'info' | 'warning' | 'error';

class Logger {
    private db!: Database;
    
    constructor() {
        try {
            // Create the database connection inside the constructor
            this.db = new Database(join(import.meta.dir, "../database.sqlite"), { create: true });
            
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS logs (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
                  message TEXT,
                  level TEXT
                )
            `);
        } catch (error) {
            console.error("Error initializing logger database:", error);
        }
    }

    info(message: string) {
        this.log(message, 'info');
    }

    warning(message: string) {
        this.log(message, 'warning');
    }

    error(message: string) {
        this.log(message, 'error');
    }

    private log(message: string, level: LogLevel) {
        try {
            if (process.env.ENV === "developmdddent") {
                console.log(`[${level.toUpperCase()}]`, message);
            } else {
                const query = this.db.prepare(`
                    INSERT INTO logs (message, level)
                    VALUES (?, ?)
                `);
                query.run(message, level);
            }
        } catch (error) {
            console.error(`Error logging ${level} message:`, error);
        }
    }

    debug() {
        try {
            const data = this.db.query(`SELECT * FROM logs`).all();
            console.log({ data });
        } catch (error) {
            console.error("Error retrieving logs:", error);
        }
    }

    close() {
        // Close the database connection
        try {
            this.db.close();
        } catch (error) {
            console.error("Error closing database connection:", error);
        }
    }
}

// Create logger instance
const logger = new Logger();

// Export before using
export default logger;