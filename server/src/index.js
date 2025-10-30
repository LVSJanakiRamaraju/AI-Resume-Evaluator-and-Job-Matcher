require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const resumeRoutes = require('./routes/resumeRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'AI Resume Evaluator backend running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);

app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'You reached a protected route',
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});


app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ db_status: 'connected', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
