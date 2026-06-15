const db = require('../config/db');

const Habit = {

  getAll() {
    const habits = db.prepare('SELECT * FROM habits ORDER BY time ASC').all();
    return habits.map(habit => {
      const logs = db.prepare(
        'SELECT done_date FROM habit_logs WHERE habit_id = ?'
      ).all(habit.id);
      return { ...habit, completedDays: logs.map(l => l.done_date) };
    });
  },

  create({ name, emoji, category, time, message }) {
    const result = db.prepare(
      'INSERT INTO habits (name, emoji, category, time, message) VALUES (?, ?, ?, ?, ?)'
    ).run(name, emoji || '🎯', category || 'other', time, message || '');
    return db.prepare('SELECT * FROM habits WHERE id = ?').get(result.lastInsertRowid);
  },

  markDone(id, date) {
    const exists = db.prepare(
      'SELECT id FROM habit_logs WHERE habit_id = ? AND done_date = ?'
    ).get(id, date);
    if (exists) {
      db.prepare('DELETE FROM habit_logs WHERE habit_id = ? AND done_date = ?').run(id, date);
      db.prepare('UPDATE habits SET streak = MAX(0, streak - 1) WHERE id = ?').run(id);
      return { action: 'undone' };
    } else {
      db.prepare('INSERT INTO habit_logs (habit_id, done_date) VALUES (?, ?)').run(id, date);
      db.prepare('UPDATE habits SET streak = streak + 1, last_done = ? WHERE id = ?').run(date, id);
      return { action: 'done' };
    }
  },

  delete(id) {
    db.prepare('DELETE FROM habit_logs WHERE habit_id = ?').run(id);
    db.prepare('DELETE FROM habits WHERE id = ?').run(id);
    return { deleted: true };
  }
};

module.exports = Habit;