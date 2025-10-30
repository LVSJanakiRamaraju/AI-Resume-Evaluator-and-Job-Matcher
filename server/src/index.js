import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './db.js';
import resumeRoutes from './routes/resumeRoutes.js';
import authRoutes from './routes/auth.js';
import authMiddleware from './middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
