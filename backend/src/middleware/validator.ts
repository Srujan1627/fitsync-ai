import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';

export const validateSignup = (req: Request, res: Response, next: NextFunction): void => {
  const { name, email, password, weight, height } = req.body;

  if (!name || name.trim().length < 2) {
    return next(new ValidationError('Name must be at least 2 characters long'));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return next(new ValidationError('Please provide a valid email address'));
  }

  if (!password || password.length < 6) {
    return next(new ValidationError('Password must be at least 6 characters long'));
  }

  if (weight !== undefined && (isNaN(Number(weight)) || Number(weight) <= 0)) {
    return next(new ValidationError('Weight must be a positive number in kg'));
  }

  if (height !== undefined && (isNaN(Number(height)) || Number(height) <= 0)) {
    return next(new ValidationError('Height must be a positive number in cm'));
  }

  next();
};


export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return next(new ValidationError('Please provide a valid email address'));
  }

  if (!password) {
    return next(new ValidationError('Password must be provided'));
  }

  next();
};

export const validateWorkout = (req: Request, res: Response, next: NextFunction): void => {
  const { type, duration, caloriesBurned, steps } = req.body;

  if (!type || type.trim().length === 0) {
    return next(new ValidationError('Workout type is required'));
  }

  if (duration === undefined || isNaN(Number(duration)) || Number(duration) <= 0) {
    return next(new ValidationError('Duration must be a positive number of minutes'));
  }

  if (caloriesBurned === undefined || isNaN(Number(caloriesBurned)) || Number(caloriesBurned) <= 0) {
    return next(new ValidationError('Calories burned must be a positive number'));
  }

  if (steps !== undefined && (isNaN(Number(steps)) || Number(steps) < 0)) {
    return next(new ValidationError('Steps must be a non-negative number'));
  }

  next();
};

