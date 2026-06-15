const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database/habitflow.db');
const db = new Database(DB_PATH);

db.exec(`
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
  );
  CREATE TABLE IF NOT EXISTS habit_logs (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id  INTEGER NOT NULL,
    done_date TEXT    NOT NULL
  );
`);

console.log('✅ Database connected!');
module.exports = db;