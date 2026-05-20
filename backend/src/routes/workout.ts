import express from 'express';
import { addWorkout, getWorkouts, getDashboardStats, updateWorkout } from '../controllers/workoutController';
import { protect } from '../middleware/authMiddleware';
import { validateWorkout } from '../middleware/validator';

const router = express.Router();

router.route('/')
  .post(protect, validateWorkout, addWorkout)
  .get(protect, getWorkouts);

router.get('/dashboard', protect, getDashboardStats);

router.route('/:id')
  .put(protect, validateWorkout, updateWorkout);


export default router;
