// Initialize database tables
const sqlite = require("sqlite");
const { Database } = require("sqlite3");
const path = require("path");

async function initializeDatabase() {
  try {
    console.log("Initializing database...");

    // Get database path from environment variable
    const dbPath = process.env.SQLITE_DB_PATH || "sqlite.db";
    console.log(`Opening database connection to: ${dbPath}`);

    // Create directory if it doesn't exist
    const dbDir = path.dirname(dbPath);
    if (dbDir !== "." && !require("fs").existsSync(dbDir)) {
      console.log(`Creating database directory: ${dbDir}`);
      require("fs").mkdirSync(dbDir, { recursive: true });
    }

    // Open the SQLite database
    const db = await sqlite.open({
      filename: dbPath,
      driver: Database,
    });

    console.log("Creating database tables...");

    // Create users table
    await db.exec(`
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

    // Create texts table
    await db.exec(`
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

    // Create sessions table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log("Database tables created successfully");
    console.log("Database initialization completed");

    // Close the database connection
    await db.close();

    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

initializeDatabase();
