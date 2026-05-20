import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { UnauthorizedError } from '../utils/errors';

interface JwtPayload {
  id: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as JwtPayload;

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new UnauthorizedError('Not authorized, user profile not found'));
      }
      
      (req as any).user = user;
      next();
    } catch (error) {
      next(new UnauthorizedError('Not authorized, JWT signature validation failed'));
    }
  } else {
    next(new UnauthorizedError('Not authorized, missing Bearer token header'));
  }
};
