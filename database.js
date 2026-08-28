const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./tasks.db", (err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // Tasks table
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'Pending',
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Add user_id to existing databases if it doesn't exist
  db.run(
    `ALTER TABLE tasks ADD COLUMN user_id INTEGER`,
    (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.log("user_id column already exists.");
      }
    }
  );
});

module.exports = db;