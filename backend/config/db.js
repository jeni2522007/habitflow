const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const dbPath = path.join(__dirname, '../../database/habitflow.json');
const adapter = new FileSync(dbPath);
const db = low(adapter);

db.defaults({ habits: [], logs: [], nextId: 1 }).write();

console.log('✅ Database connected!');
module.exports = db;