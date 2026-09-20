import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import './CartPage.css';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, getSubtotal } = useCartStore();

  const subtotal = getSubtotal();
  const freeShippingThreshold = 999;
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = freeShippingThreshold - subtotal;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const grandTotal = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="cart-page container">
        <div className="empty-cart-card">
          <div className="icon-circle">
            <ShoppingBag size={48} />
          </div>
          <h2>Your Shopping Bag is Empty</h2>
          <p>Discover our beautiful handcrafted crochet pieces and fill your bag with warmth.</p>
          <Link to="/shop" className="btn btn-primary btn-lg">
            Explore Handcrafted Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <h1 className="page-title">Shopping Bag ({items.reduce((acc, i) => acc + i.quantity, 0)} items)</h1>

      {/* Free Shipping Progress */}
      <div className="free-shipping-card">
        <div className="shipping-info-row">
          <Truck size={20} />
          <span>
            {remainingForFreeShipping > 0
              ? `Add ₹${remainingForFreeShipping} more to get FREE Delivery!`
              : '🎉 You have unlocked FREE Delivery!'}
          </span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar" style={{ width: `${freeShippingProgress}%` }} />
        </div>
      </div>

      <div className="cart-grid">
        {/* Left: Cart Items */}
        <div className="cart-items-section">
          <div className="cart-header-row desktop-only">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
            <span></span>
          </div>
          <div className="items-list">
            {items.map((item) => {
              const product = item.product || item;
              const name = product.name || 'Handcrafted Crochet Item';
              const slug = product.slug || '';
              const itemPrice = item.selectedVariant
                ? item.selectedVariant.price
                : (product.discountPrice || product.price || item.price || 0);
              const itemTotal = itemPrice * item.quantity;
              
              const rawImage = Array.isArray(product.images) ? product.images[0] : product.image;
              const image = typeof rawImage === 'string' ? rawImage : (rawImage?.url || '/logo.jpg');

              return (
                <div key={item.cartItemId || item._id} className="cart-item">
                  <div className="item-info">
                    <img src={image} alt={name} className="item-thumb" />
                    <div>
                      <Link to={`/products/${slug}`} className="item-name">
                        {name}
                      </Link>
                      {item.selectedVariant && (
                        <span className="item-variant">Variant: {item.selectedVariant.name}</span>
                      )}
                    </div>
                  </div>

                  <div className="item-price">
                    ₹{itemPrice}
                  </div>

                  <div className="item-qty">
                    <div className="quantity-control">
                      <button onClick={() => updateQuantity(item.cartItemId || item._id, item.quantity - 1)}>
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartItemId || item._id, item.quantity + 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="item-total">
                    ₹{itemTotal}
                  </div>

                  <div className="item-action">
                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.cartItemId || item._id)}
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-actions-bar">
            <Link to="/shop" className="btn btn-outline btn-sm">
              ← Continue Shopping
            </Link>
            <button className="btn btn-outline btn-sm danger-btn" onClick={clearCart}>
              Clear Bag
            </button>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="order-summary-card">
          <h3>Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span>{shippingFee === 0 ? <strong className="free-tag">FREE</strong> : `₹${shippingFee}`}</span>
          </div>

          <div className="summary-row cod-notice">
            <span>Payment Method</span>
            <strong>Cash on Delivery (COD)</strong>
          </div>

          <div className="summary-divider" />

          <div className="summary-row total-row">
            <span>Total Payable</span>
            <span className="total-amount">₹{grandTotal}</span>
          </div>

          <button
            className="btn btn-primary btn-lg btn-block checkout-btn"
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
