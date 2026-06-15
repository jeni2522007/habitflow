const db = require('../config/db');

const Habit = {

  getAll() {
    const habits = db.get('habits').value();
    const logs   = db.get('logs').value();
    return habits.map(h => ({
      ...h,
      completedDays: logs
        .filter(l => l.habit_id === h.id)
        .map(l => l.done_date)
    }));
  },

  create({ name, emoji, category, time, message }) {
    const id = db.get('nextId').value();
    const habit = {
      id, name,
      emoji:     emoji    || '🎯',
      category:  category || 'other',
      time,
      message:   message  || '',
      streak:    0,
      last_done: '',
      created_at: new Date().toISOString()
    };
    db.get('habits').push(habit).write();
    db.update('nextId', n => n + 1).write();
    return habit;
  },

  markDone(id, date) {
    const exists = db.get('logs')
      .find({ habit_id: id, done_date: date }).value();

    if (exists) {
      db.get('logs')
        .remove({ habit_id: id, done_date: date }).write();
      const habit = db.get('habits').find({ id }).value();
      db.get('habits').find({ id })
        .assign({ streak: Math.max(0, habit.streak - 1) }).write();
      return { action: 'undone' };
    } else {
      db.get('logs')
        .push({ habit_id: id, done_date: date }).write();
      const habit = db.get('habits').find({ id }).value();
      db.get('habits').find({ id })
        .assign({ streak: habit.streak + 1, last_done: date }).write();
      return { action: 'done' };
    }
  },

  delete(id) {
    db.get('habits').remove({ id }).write();
    db.get('logs').remove({ habit_id: id }).write();
    return { deleted: true };
  }

};

module.exports = Habit;