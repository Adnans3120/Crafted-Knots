import express from 'express';
import { register, login, getMe, updateProfile, changePassword, addAddress, deleteAddress } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/addresses', protect, addAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

export default router;
