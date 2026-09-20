import Category from '../models/Category.js';
import generateSlug from '../utils/generateSlug.js';

// @route  GET /api/categories
// @access Public
export const getCategories = async (req, res, next) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, categories });
  } catch (err) { next(err); }
};

// @route  POST /api/categories
// @access Admin
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, sortOrder } = req.body;
    const slug = generateSlug(name);
    const image = req.file?.path || null;
    const category = await Category.create({ name, slug, description, image, sortOrder });
    res.status(201).json({ success: true, category });
  } catch (err) { next(err); }
};

// @route  PUT /api/categories/:id
// @access Admin
export const updateCategory = async (req, res, next) => {
  try {
    const { name, description, sortOrder, isActive } = req.body;
    const update = { description, sortOrder, isActive };
    if (name) { update.name = name; update.slug = generateSlug(name); }
    if (req.file?.path) update.image = req.file.path;
    const category = await Category.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (err) { next(err); }
};

// @route  DELETE /api/categories/:id
// @access Admin
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
};
