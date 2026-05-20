import express from 'express';
import { registerUser, authUser, getUserProfile } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { validateSignup, validateLogin } from '../middleware/validator';

const router = express.Router();

router.post('/signup', validateSignup, registerUser);
router.post('/login', validateLogin, authUser);
router.get('/profile', protect, getUserProfile);

export default router;
