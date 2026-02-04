import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/user/userController.js';
import { addToCart, updateCartItem, removeFromCart, getCart, clearCart } from '../controllers/cart/cart.controller.js';
import protect from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.patch('/profile', protect, updateUserProfile);

router.get('/get-cart', protect, getCart);
router.post('/add-to-cart', protect, addToCart);
router.patch('/update-cart', protect, updateCartItem);
router.delete('/remove-cart-item/:foodId', protect, removeFromCart);
router.delete('/clear-cart', protect, clearCart);


export default router;