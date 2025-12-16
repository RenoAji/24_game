// libs/database.js
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const path = require("path");
const fs = require("fs");

// Ensure folder exists (Crash prevention)
const dbFolder = path.resolve("./data");
if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true });
}

let dbPromise = null;

function getDatabase() {
  if (dbPromise) {
    return dbPromise;
  }

  // Assign the PROMISE immediately to the variable
  dbPromise = (async () => {
    const db = await open({
      filename: path.join(dbFolder, "my-database.db"),
      driver: sqlite3.Database,
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            score INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    return db;
  })();

  return dbPromise;
}

module.exports = getDatabase;
