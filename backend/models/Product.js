import mongoose from 'mongoose';

// Size/Style variant schema — e.g. Small, Medium, Large, Pink, etc.
const variantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // e.g. "Small", "Medium", "Large"
  size: { type: String, trim: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
  price: { type: Number, default: 0 },
  priceModifier: { type: Number, default: 0 },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    images: [{ type: String }], // Cloudinary URLs or Data URIs — up to 5
    hasVariants: { type: Boolean, default: false },
    variants: [variantSchema],
    stock: {
      type: Number,
      min: 0,
      default: 0,
    },
    sku: { type: String, trim: true },
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isMadeToOrder: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    whatsappNumber: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Virtual: total stock across all variants
productSchema.virtual('totalStock').get(function () {
  if (!this.hasVariants) return this.stock;
  return this.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
});

productSchema.set('toJSON', { virtuals: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
