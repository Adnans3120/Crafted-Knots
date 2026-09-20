import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, MessageCircle, Truck, RefreshCw, ShieldCheck, ChevronRight, Plus, Minus, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI } from '../../services/api';
import useCartStore from '../../store/cartStore';
import { getWhatsAppUrl } from '../../utils/whatsapp';
import ProductCard from '../../components/product/ProductCard';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('care');

  useEffect(() => {
    fetchProductDetails();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getBySlug(slug);
      const prod = res.data.product;
      setProduct(prod);
      setRelatedProducts(res.data.related || []);

      // Select first variant if available
      if (prod.hasVariants && prod.variants?.length > 0) {
        setSelectedVariant(prod.variants[0]);
      } else {
        setSelectedVariant(null);
      }
    } catch (err) {
      console.error('Failed to load product details', err);
      toast.error('Product not found');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="container page-loader-container">
        <div className="spinner" />
      </div>
    );
  }

  // Determine active price and stock
  const currentPrice = selectedVariant ? selectedVariant.price : (product.discountPrice || product.price);
  const originalPrice = selectedVariant ? selectedVariant.originalPrice : (product.discountPrice ? product.price : null);
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isAvailable = currentStock > 0;

  const images = product.images && product.images.length > 0
    ? product.images.map(img => (typeof img === 'string' ? img : (img?.url || ''))).filter(Boolean)
    : ['/logo.jpg'];

  const handleAddToCart = () => {
    if (!isAvailable) {
      toast.error('Item is out of stock');
      return;
    }
    addToCart(product, selectedVariant, quantity);
    toast.success(`Added ${quantity} ${product.name} to cart!`);
  };

  const handleBuyNow = () => {
    if (!isAvailable) return;
    addToCart(product, selectedVariant, quantity);
    navigate('/checkout');
  };

  const handleWhatsAppInquiry = () => {
    const message = `Hi Crafted Knots! I'm interested in purchasing your product: "${product.name}"${
      selectedVariant ? ` (Variant: ${selectedVariant.name})` : ''
    }.\n\nProduct Link: ${window.location.href}`;
    window.open(getWhatsAppUrl(message), '_blank');
  };

  return (
    <div className="product-detail-page container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <Link to="/shop">Shop</Link>
        <ChevronRight size={14} />
        {product.category && (
          <>
            <Link to={`/shop?category=${product.category.slug}`}>{product.category.name}</Link>
            <ChevronRight size={14} />
          </>
        )}
        <span>{product.name}</span>
      </nav>

      <div className="product-detail-layout">
        {/* Left: Images Gallery */}
        <div className="gallery-section">
          <div className="main-image-wrap">
            <img src={images[activeImage]} alt={product.name} className="main-image" />
            {product.isMadeToOrder && <span className="made-badge">Made to Order</span>}
          </div>

          {images.length > 1 && (
            <div className="thumbnails-row">
              {images.map((img, index) => (
                <button
                  key={index}
                  className={`thumb-btn ${activeImage === index ? 'active' : ''}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={img} alt={`${product.name} view ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Purchase */}
        <div className="info-section">
          {product.category && <span className="category-tag">{product.category.name}</span>}
          <h1 className="product-title">{product.name}</h1>

          {/* Pricing */}
          <div className="price-container">
            <span className="current-price">₹{currentPrice}</span>
            {originalPrice && <span className="original-price">₹{originalPrice}</span>}
            {originalPrice && (
              <span className="discount-tag">
                {Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}% OFF
              </span>
            )}
          </div>

          <p className="product-short-desc">{product.description}</p>

          {/* Variants / Sizes */}
          {product.hasVariants && product.variants?.length > 0 && (
            <div className="option-group">
              <label className="option-label">Select Option / Size:</label>
              <div className="variant-chips">
                {product.variants.map((v) => (
                  <button
                    key={v._id || v.name}
                    className={`variant-chip ${selectedVariant?.name === v.name ? 'active' : ''}`}
                    onClick={() => setSelectedVariant(v)}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="option-group">
            <label className="option-label">Quantity:</label>
            <div className="quantity-control">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <Minus size={14} />
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(currentStock || 10, q + 1))}
                disabled={quantity >= (currentStock || 10)}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Stock Status */}
          <div className="stock-status">
            {isAvailable ? (
              <span className="in-stock"><Check size={16} /> In Stock ({currentStock} available)</span>
            ) : (
              <span className="out-of-stock">Currently Out of Stock (Custom Order via WhatsApp)</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="btn btn-primary btn-lg btn-block"
              onClick={handleAddToCart}
              disabled={!isAvailable}
            >
              <ShoppingBag size={18} /> Add to Cart
            </button>

            <button
              className="btn btn-secondary btn-lg btn-block"
              onClick={handleBuyNow}
              disabled={!isAvailable}
            >
              Buy Now (Cash on Delivery)
            </button>

            {/* WhatsApp Inquiry Direct */}
            <button
              className="btn whatsapp-btn btn-lg btn-block"
              onClick={handleWhatsAppInquiry}
            >
              <MessageCircle size={18} /> Ask / Custom Order via WhatsApp
            </button>
          </div>

          {/* Value Props */}
          <div className="value-props">
            <div className="prop-item">
              <Truck size={18} />
              <div>
                <strong>Free Shipping</strong>
                <p>On orders above ₹999 across India</p>
              </div>
            </div>
            <div className="prop-item">
              <ShieldCheck size={18} />
              <div>
                <strong>Cash on Delivery</strong>
                <p>Pay safely when your order arrives</p>
              </div>
            </div>
          </div>

          {/* Accordion Info */}
          <div className="accordion-tabs">
            <div className="tab-buttons">
              <button
                className={activeTab === 'care' ? 'active' : ''}
                onClick={() => setActiveTab('care')}
              >
                Handcrafted & Care
              </button>
              <button
                className={activeTab === 'shipping' ? 'active' : ''}
                onClick={() => setActiveTab('shipping')}
              >
                Shipping & Returns
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'care' && (
                <div className="care-info">
                  <p>✨ <strong>100% Handcrafted:</strong> Every single stitch is crocheted by hand using premium yarn, making each item uniquely special.</p>
                  <p>🧼 <strong>Washing Instructions:</strong> Gentle hand wash in cold water with mild detergent. Do not wring or twist. Dry flat in shade to maintain shape and color vibrancy.</p>
                </div>
              )}
              {activeTab === 'shipping' && (
                <div className="shipping-info">
                  <p>📦 <strong>Processing Time:</strong> Ready items ship within 1-2 business days. Made-to-order items take 4-7 days depending on size.</p>
                  <p>🚚 <strong>Delivery:</strong> Delivered in 3-6 business days across major Indian cities.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="related-section">
          <h2>You Might Also Love</h2>
          <div className="product-grid">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
