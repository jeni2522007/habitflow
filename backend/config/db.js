const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const fs = require('fs');

// Create database folder if it doesn't exist
const dbDir = path.join(__dirname, '../../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'habitflow.json');
const adapter = new FileSync(dbPath);
const db = low(adapter);

db.defaults({ habits: [], logs: [], nextId: 1 }).write();

console.log('✅ Database connected!');
module.exports = db;