import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import workoutRoutes from './routes/workout';
import aiRoutes from './routes/ai';
import errorHandler from './middleware/errorHandler';

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('FitSync AI API is running...');
});

// Centralized error handling boundary (Must be defined AFTER all routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 FitSync AI Server running on port ${PORT}`);
});
