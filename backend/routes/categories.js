import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, adminOnly, upload.single('image'), createCategory);
router.put('/:id', protect, adminOnly, upload.single('image'), updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;
