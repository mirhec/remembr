import { Database } from "sqlite3";
import { open } from "sqlite";
import * as schema from "./schema";

// Implementation with sqlite and sqlite3 packages
let dbInstance: any = null;

export async function initializeDb() {
    if (!dbInstance) {
        // Use environment variable for DB path or default path
        const dbPath = process.env.SQLITE_DB_PATH || 'sqlite.db';
        console.log(`Connecting to SQLite database at: ${dbPath}`);

        // Open the SQLite database with the configured path
        dbInstance = await open({
            filename: dbPath,
            driver: Database
        });
    }
    return dbInstance;
}

// For compatibility with existing code
// Actual implementation uses direct SQL instead of these placeholder functions
export const db = {
    // These functions serve only as placeholders and should no longer be used
    select: () => ({
        from: () => ({
            where: () => ({
                limit: () => Promise.resolve([]),
                orderBy: () => Promise.resolve([]),
                all: () => Promise.resolve([])
            }),
            orderBy: () => ({
                orderBy: () => Promise.resolve([]),
            }),
            limit: () => Promise.resolve([]),
            all: () => Promise.resolve([])
        })
    }),
    insert: () => ({
        values: () => ({
            returning: () => Promise.resolve([])
        })
    }),
    update: () => ({
        set: () => ({
            where: () => ({
                returning: () => Promise.resolve([])
            })
        })
    }),
    delete: () => ({
        where: () => Promise.resolve()
    })
};

// Apply migrations if needed (in production, you'd typically do this separately)
export async function applyMigrations() {
    try {
        // Here we would apply migrations, but since we're not using Drizzle-orm/sqlite-migrator,
        // we need to use a different approach or manually create tables
        const dbConnection = await initializeDb();

        // Create users table if it doesn't exist
        await dbConnection.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        email_verified INTEGER,
        password TEXT,
        image TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);

        // Create texts table if it doesn't exist
        await dbConnection.exec(`
      CREATE TABLE IF NOT EXISTS texts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT,
        user_id TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        last_practiced_at INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

        // Create sessions table if it doesn't exist
        await dbConnection.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
    }
}

// Helper function to convert Unix timestamp to Date
export function toDate(timestamp: number | null): Date | null {
    return timestamp ? new Date(timestamp * 1000) : null;
}

// Helper function to convert Date to Unix timestamp (seconds)
export function toTimestamp(date: Date | null): number | null {
    return date ? Math.floor(date.getTime() / 1000) : null;
}
