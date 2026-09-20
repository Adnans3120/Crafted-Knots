import Product from '../models/Product.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';
import generateSlug from '../utils/generateSlug.js';


const extractImagesFromFiles = (files) => {
  if (!files || !Array.isArray(files)) return [];
  return files.map((f) => {
    if (f.path) return f.path; // Cloudinary URL
    if (f.buffer) {
      // Memory storage fallback — convert to Data URI
      return `data:${f.mimetype};base64,${f.buffer.toString('base64')}`;
    }
    return '';
  }).filter(Boolean);
};


export const getProducts = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, available, featured, sort, page = 1, limit = 12 } = req.query;
    const filter = {};

    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];

    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = category;
      } else {
        const catDoc = await Category.findOne({ slug: category });
        if (catDoc) {
          filter.category = catDoc._id;
        } else {
          // If category slug not found, filter by non-existent ID so empty array returned
          filter.category = new mongoose.Types.ObjectId();
        }
      }
    }

    if (available === 'true') filter.isAvailable = true;
    if (featured === 'true') filter.isFeatured = true;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      price_low: { price: 1 },
      price_high: { price: -1 },
      popular: { isFeatured: -1, createdAt: -1 },
      name: { name: 1 },
    };
    const sortObj = sortMap[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).populate('category', 'name slug').sort(sortObj).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      products,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) || 1, limit: Number(limit) },
    });
  } catch (err) { next(err); }
};


export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    
    const related = await Product.find({
      category: product.category?._id,
      _id: { $ne: product._id },
    }).limit(4);

    res.json({ success: true, product, related });
  } catch (err) { next(err); }
};

// Admin
export const createProduct = async (req, res, next) => {
  try {
    const {
      name, description, price, discountPrice, category, sku,
      isAvailable, isFeatured, isMadeToOrder, isActive,
      hasVariants, variants, stock, tags
    } = req.body;

    const slug = generateSlug(name || 'product');
    const images = extractImagesFromFiles(req.files);

    let parsedVariants = [];
    if (hasVariants === 'true' || hasVariants === true) {
      parsedVariants = typeof variants === 'string' ? JSON.parse(variants || '[]') : (variants || []);
    }

    let parsedTags = [];
    if (tags) {
      parsedTags = typeof tags === 'string' ? JSON.parse(tags || '[]') : tags;
    }

    const product = await Product.create({
      name,
      slug,
      description: description || '',
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      category,
      images,
      sku,
      isAvailable: isAvailable !== 'false' && isAvailable !== false,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isMadeToOrder: isMadeToOrder === 'true' || isMadeToOrder === true,
      isActive: isActive !== 'false' && isActive !== false,
      hasVariants: hasVariants === 'true' || hasVariants === true,
      variants: parsedVariants,
      stock: (hasVariants === 'true' || hasVariants === true) ? 0 : Number(stock || 0),
      tags: parsedTags,
    });

    await product.populate('category', 'name slug');
    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error('Error creating product:', err);
    next(err);
  }
};


export const updateProduct = async (req, res, next) => {
  try {
    const {
      name, description, price, discountPrice, category, sku,
      isAvailable, isFeatured, isMadeToOrder, isActive,
      hasVariants, variants, stock, tags, existingImages
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    
    const kept = existingImages ? (Array.isArray(existingImages) ? existingImages : [existingImages]) : [];
    const newUploads = extractImagesFromFiles(req.files);
    const images = [...kept, ...newUploads].slice(0, 5);

    if (name) {
      product.name = name;
      product.slug = generateSlug(name);
    }
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    product.discountPrice = discountPrice ? Number(discountPrice) : undefined;
    if (category) product.category = category;
    if (sku !== undefined) product.sku = sku;
    if (isAvailable !== undefined) product.isAvailable = isAvailable !== 'false' && isAvailable !== false;
    if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (isMadeToOrder !== undefined) product.isMadeToOrder = isMadeToOrder === 'true' || isMadeToOrder === true;
    if (isActive !== undefined) product.isActive = isActive !== 'false' && isActive !== false;

    if (hasVariants !== undefined) product.hasVariants = hasVariants === 'true' || hasVariants === true;
    if (variants) {
      product.variants = typeof variants === 'string' ? JSON.parse(variants) : variants;
    }
    if (stock !== undefined) product.stock = Number(stock);
    if (tags) {
      product.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }
    if (images.length > 0) product.images = images;

    await product.save();
    await product.populate('category', 'name slug');
    res.json({ success: true, product });
  } catch (err) {
    console.error('Error updating product:', err);
    next(err);
  }
};


export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    
    if (product.images && Array.isArray(product.images)) {
      for (const imgUrl of product.images) {
        if (imgUrl.includes('res.cloudinary.com')) {
          const publicId = imgUrl.split('/').slice(-2).join('/').split('.')[0];
          await cloudinary.uploader.destroy(publicId).catch(() => {});
        }
      }
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { next(err); }
};


export const getAdminProducts = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (category) filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).populate('category', 'name slug').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);
    res.json({ success: true, products, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) { next(err); }
};
