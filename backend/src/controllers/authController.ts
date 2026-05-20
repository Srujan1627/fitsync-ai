import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../utils/errors';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, weight, height } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return next(new BadRequestError('User already exists with this email address'));
    }

    const user = await User.create({
      name,
      email,
      password,
      weight: Number(weight) || 70, // Fallback default weight in kg
      height: Number(height) || 170, // Fallback default height in cm
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      weight: user.weight,
      height: user.height,
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    next(error);
  }
};


export const authUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await (user as any).matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        weight: user.weight,
        height: user.height,
        token: generateToken(user._id.toString()),
      });
    } else {
      next(new UnauthorizedError('Invalid email or password credentials'));
    }
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      next(new NotFoundError('User profile not found in active database'));
    }
  } catch (error) {
    next(error);
  }
};
