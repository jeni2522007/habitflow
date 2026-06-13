const express = require('express');
const router  = express.Router();
const Habit   = require('../models/Habit');

// GET all habits
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.getAll();
    res.json({ success: true, data: habits });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE habit
router.post('/', async (req, res) => {
  try {
    const { name, emoji, category, time, message } = req.body;
    if (!name || !time) return res.status(400).json({ success: false, error: 'Name and time required' });
    const habit = await Habit.create({ name, emoji, category, time, message });
    res.status(201).json({ success: true, data: habit });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// TOGGLE done/undo
router.put('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;
    if (!date) return res.status(400).json({ success: false, error: 'Date required' });
    const result = await Habit.markDone(Number(id), date);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE habit
router.delete('/:id', async (req, res) => {
  try {
    await Habit.delete(Number(req.params.id));
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;