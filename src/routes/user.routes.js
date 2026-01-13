import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import protect from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.patch('/profile', protect, updateUserProfile);


export default router;