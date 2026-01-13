import express from 'express';
import { addAddress, deleteAddress, getAddresses, updateAddress } from '../controllers/address.controller.js';
import protect from '../middleware/auth.middleware.js';


const router = express.Router();

router.post('/newAddress', protect, addAddress);
router.patch('/update/:id', protect, updateAddress);
router.delete('/delete/:id', protect, deleteAddress);
router.get('/list', protect, getAddresses);

export default router;