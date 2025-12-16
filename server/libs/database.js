const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

let dbInstance = null;

async function getDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  // const path = require("path");
  // // ...
  // storage: path.join(__dirname, "data", "database.sqlite"); // Saves to data folder (will persist)

  // Open the database file
  const db = await open({
    filename: "./data/my-database.db", // This file will be created automatically
    driver: sqlite3.Database,
  });

  // Create a table if it doesn't exist
  await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            score INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

  dbInstance = db;
  return dbInstance;
}

module.exports = getDatabase;
