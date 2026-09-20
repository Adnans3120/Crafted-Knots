import express from 'express';
import { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, getAdminProducts } from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public
router.get('/', getProducts);
router.get('/admin/all', protect, adminOnly, getAdminProducts);
router.get('/:slug', getProductBySlug);

// Admin
router.post('/', protect, adminOnly, upload.array('images', 5), createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
