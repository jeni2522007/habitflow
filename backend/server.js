const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const path       = require('path');

const app  = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const habitRoutes = require('./routes/habits');
app.use('/api/habits', habitRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 HabitFlow server is running!');
  console.log(`🌐 Open in browser: http://localhost:${PORT}`);
  console.log('');
});