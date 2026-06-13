const db = require('../config/db');

const Habit = {

  getAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM habits ORDER BY time ASC', [], (err, habits) => {
        if (err) return reject(err);
        if (!habits || !habits.length) return resolve([]);

        let done = 0;
        const result = [];

        habits.forEach((habit, i) => {
          db.all(
            'SELECT done_date FROM habit_logs WHERE habit_id = ?',
            [habit.id],
            (err2, logs) => {
              result[i] = {
                ...habit,
                completedDays: (logs || []).map(l => l.done_date)
              };
              done++;
              if (done === habits.length) resolve(result);
            }
          );
        });
      });
    });
  },

  create({ name, emoji, category, time, message }) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO habits (name, emoji, category, time, message) VALUES (?, ?, ?, ?, ?)',
        [name, emoji || '🎯', category || 'other', time, message || ''],
        function(err) {
          if (err) return reject(err);
          db.get('SELECT * FROM habits WHERE id = ?', [this.lastID], (err2, row) => {
            if (err2) return reject(err2);
            resolve(row);
          });
        }
      );
    });
  },

  markDone(id, date) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM habit_logs WHERE habit_id = ? AND done_date = ?',
        [id, date],
        (err, row) => {
          if (err) return reject(err);
          if (row) {
            db.run('DELETE FROM habit_logs WHERE habit_id = ? AND done_date = ?', [id, date]);
            db.run('UPDATE habits SET streak = MAX(0, streak - 1) WHERE id = ?', [id]);
            resolve({ action: 'undone' });
          } else {
            db.run('INSERT INTO habit_logs (habit_id, done_date) VALUES (?, ?)', [id, date]);
            db.run('UPDATE habits SET streak = streak + 1, last_done = ? WHERE id = ?', [date, id]);
            resolve({ action: 'done' });
          }
        }
      );
    });
  },

  delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM habit_logs WHERE habit_id = ?', [id], () => {
        db.run('DELETE FROM habits WHERE id = ?', [id], (err) => {
          if (err) return reject(err);
          resolve({ deleted: true });
        });
      });
    });
  }

};

module.exports = Habit;