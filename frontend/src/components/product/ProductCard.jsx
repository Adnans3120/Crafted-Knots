import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '../../store/cartStore';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const totalStock = product.hasVariants
    ? product.variants?.reduce((s, v) => s + v.stock, 0)
    : product.stock;
  const isOutOfStock = !product.isAvailable || totalStock === 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.hasVariants) {
      // Redirect to detail page if variants exist
      return;
    }
    if (isOutOfStock) return;
    addItem(product, 1, null);
    toast.success(`"${product.name}" added to cart 🧶`);
  };

  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      {/* Image */}
      <div className="product-img-wrap">
        <img
          src={product.images?.[0] || '/logo.jpg'}
          alt={product.name}
          className="product-img"
          loading="lazy"
        />
        {product.isFeatured && <span className="product-badge featured">Featured</span>}
        {isOutOfStock && <span className="product-badge out-of-stock">Sold Out</span>}
        {hasDiscount && !isOutOfStock && (
          <span className="product-badge sale">
            {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
          </span>
        )}
        <div className="product-overlay">
          {product.hasVariants ? (
            <span className="btn btn-primary btn-sm">Choose Size</span>
          ) : (
            <button
              className={`btn ${isOutOfStock ? 'btn-outline' : 'btn-primary'} btn-sm`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingBag size={15} />
              {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="product-info">
        {product.category && (
          <span className="product-category">{product.category.name}</span>
        )}
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price-row">
          <span className={`price ${hasDiscount ? 'price-sale' : ''}`}>
            ₹{displayPrice?.toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <span className="price-original">₹{product.price?.toLocaleString('en-IN')}</span>
          )}
        </div>
        {product.hasVariants && (
          <p className="product-variants-note">
            {product.variants?.length} size{product.variants?.length !== 1 ? 's' : ''} available
          </p>
        )}
      </div>
    </Link>
  );
}
