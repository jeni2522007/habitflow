const express = require('express');
const router  = express.Router();
const Habit   = require('../models/Habit');

router.get('/', (req, res) => {
  try {
    const habits = Habit.getAll();
    res.json({ success: true, data: habits });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, emoji, category, time, message } = req.body;
    if (!name || !time) return res.status(400).json({ success: false, error: 'Name and time required' });
    const habit = Habit.create({ name, emoji, category, time, message });
    res.status(201).json({ success: true, data: habit });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;
    if (!date) return res.status(400).json({ success: false, error: 'Date required' });
    const result = Habit.markDone(Number(id), date);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    Habit.delete(Number(req.params.id));
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;