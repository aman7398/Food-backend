import express from 'express';
import { loginUser, registerUser, logout } from '../controllers/auth.controller.js';
import { forgotPassword } from '../controllers/forgotpassword.js';
import { resetPassword } from '../controllers/resetpassword.js';
import { verifyOPT } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/verify-otp', verifyOPT);

export default router;