const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}
const db = new Database(path.join(dataDir, 'auction.db'), { verbose: console.log });

// Create tables
const createTables = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      budget INTEGER NOT NULL,
      remainingBudget INTEGER NOT NULL,
      logo TEXT
    );

    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      style TEXT,
      basePrice REAL NOT NULL,
      image TEXT,
      status TEXT DEFAULT 'Unsold',
      soldPrice REAL DEFAULT 0,
      soldToTeamId INTEGER,
      FOREIGN KEY (soldToTeamId) REFERENCES teams (id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin'
    );
  `);
};

createTables();

module.exports = db;
