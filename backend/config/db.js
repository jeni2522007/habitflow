const sqlite3 = require('sqlite3').verbose();
const path    = require('path');

const DB_PATH = path.join(__dirname, '../../database/habitflow.db');
const db      = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS habits (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      emoji      TEXT    DEFAULT '🎯',
      category   TEXT    DEFAULT 'other',
      time       TEXT    NOT NULL,
      message    TEXT    DEFAULT '',
      streak     INTEGER DEFAULT 0,
      last_done  TEXT    DEFAULT '',
      created_at TEXT    DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS habit_logs (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id  INTEGER NOT NULL,
      done_date TEXT    NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits(id)
    )
  `);
});

console.log('✅ Database connected!');
module.exports = db;