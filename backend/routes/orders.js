import express from 'express';
import { placeOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus, getDashboardStats } from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Customer
router.post('/', protect, placeOrder);
router.get('/my-orders', protect, getMyOrders);
router.patch('/:id/cancel', protect, cancelOrder);

// Admin
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.get('/admin/stats', protect, adminOnly, getDashboardStats);
router.patch('/admin/:id/status', protect, adminOnly, updateOrderStatus);

// Shared (customer own OR admin)
router.get('/:id', protect, getOrderById);

export default router;
