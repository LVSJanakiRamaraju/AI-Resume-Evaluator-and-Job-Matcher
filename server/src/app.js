import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import resumeRoutes from './routes/resumeRoutes.js';
import authRoutes from './routes/auth.js';
import matchJobRoutes from './routes/matchJobRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'AI Resume Evaluator backend running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/get', matchJobRoutes);

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

export default app;
