import express from 'express';
import { getAdminProfile, updateAdminProfile } from '../controllers/adminController.js';
import isAdmin from '../middleware/admin.middleware.js';
import protect from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/admin/profile', protect, isAdmin, getAdminProfile);
router.patch('/admin/profile', protect, isAdmin, updateAdminProfile);

export default router;