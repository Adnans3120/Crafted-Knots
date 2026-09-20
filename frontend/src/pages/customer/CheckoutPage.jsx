import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, MapPin, Truck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import { orderAPI, authAPI } from '../../services/api';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { items, getSubtotal, clearCart } = useCartStore();

  const [loading, setLoading] = useState(false);

  // Address Form State
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });

  const [customerNotes, setCustomerNotes] = useState('');
  const [selectedSavedAddressIndex, setSelectedSavedAddressIndex] = useState(null);

  const subtotal = getSubtotal();
  const shippingFee = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const grandTotal = subtotal + shippingFee;

  useEffect(() => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/shop');
    }
  }, [items]);

  // Fill address when selecting from user saved addresses
  const handleSelectSavedAddress = (index) => {
    const saved = user.addresses[index];
    if (saved) {
      setSelectedSavedAddressIndex(index);
      setAddress({
        fullName: saved.fullName || user.name,
        phone: saved.phone || user.phone,
        street: saved.street,
        city: saved.city,
        state: saved.state,
        pincode: saved.pincode,
        landmark: saved.landmark || '',
      });
    }
  };

  const handleInputChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
    setSelectedSavedAddressIndex(null);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!address.fullName || !address.phone || !address.street || !address.city || !address.state || !address.pincode) {
      toast.error('Please complete all required shipping fields');
      return;
    }

    setLoading(true);

    try {
      // Prepare payload
      const orderPayload = {
        items: items.map((item) => ({
          productId: item.product?._id || item._id,
          product: item.product?._id || item._id,
          variantName: item.selectedVariant?.name || item.selectedSize || '',
          size: item.selectedVariant?.name || item.selectedSize || '',
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          line1: address.street,
          street: address.street,
          line2: address.landmark || '',
          landmark: address.landmark || '',
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        },
        customerNote: customerNotes,
        customerNotes,
        paymentMethod: 'COD',
      };

      const res = await orderAPI.place(orderPayload);
      const createdOrder = res.data.order;

      toast.success('🎉 Order Placed Successfully!');
      clearCart();
      navigate(`/orders/${createdOrder._id}`);
    } catch (err) {
      console.error('Order error:', err);
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page container">
      <h1 className="page-title">Checkout</h1>

      <div className="checkout-grid">
        {/* Left: Address Form */}
        <div className="checkout-form-section">
          {/* Saved Addresses Selector */}
          {user?.addresses && user.addresses.length > 0 && (
            <div className="saved-addresses-block">
              <h3><MapPin size={18} /> Choose Saved Address</h3>
              <div className="saved-addresses-grid">
                {user.addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    className={`saved-addr-card ${selectedSavedAddressIndex === idx ? 'selected' : ''}`}
                    onClick={() => handleSelectSavedAddress(idx)}
                  >
                    <strong>{addr.fullName || user.name}</strong>
                    <p>{addr.street}, {addr.city}</p>
                    <p>{addr.state} - {addr.pincode}</p>
                    <span className="phone-num">📞 {addr.phone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitOrder} className="shipping-form">
            <h3>Delivery Address</h3>

            <div className="form-row grid-2">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={address.fullName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Phone Number (for COD delivery) *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. 9876543210"
                  value={address.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Flat / House No / Street Address *</label>
              <input
                type="text"
                name="street"
                required
                placeholder="House No, Apartment, Street Name"
                value={address.street}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row grid-2">
              <div className="form-group">
                <label>Landmark (Optional)</label>
                <input
                  type="text"
                  name="landmark"
                  placeholder="Near Park, Behind School, etc."
                  value={address.landmark}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  maxLength={6}
                  placeholder="e.g. 400001"
                  value={address.pincode}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row grid-2">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="e.g. Mumbai"
                  value={address.city}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  required
                  placeholder="e.g. Maharashtra"
                  value={address.state}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Special Instructions / Customization Request</label>
              <textarea
                rows={3}
                placeholder="Mention yarn color preference, gift message, or delivery instructions..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
              />
            </div>

            {/* Payment Method Notice */}
            <div className="payment-method-box">
              <div className="payment-header">
                <CheckCircle2 size={20} color="#2e7d32" />
                <div>
                  <strong>Cash on Delivery (COD) Selected</strong>
                  <p>Pay cash directly to the courier agent when your handcrafted items arrive at your door.</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg btn-block place-order-btn"
            >
              {loading ? 'Confirming Order...' : `Place COD Order (Total: ₹${grandTotal})`}
            </button>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="checkout-summary-section">
          <div className="summary-box">
            <h3>Items in your order ({items.length})</h3>

            <div className="mini-item-list">
              {items.map((item) => {
                const product = item.product || item;
                const name = product.name || 'Handcrafted Crochet Item';
                const itemPrice = item.selectedVariant
                  ? item.selectedVariant.price
                  : (product.discountPrice || product.price || item.price || 0);

                const rawImage = Array.isArray(product.images) ? product.images[0] : product.image;
                const image = typeof rawImage === 'string' ? rawImage : (rawImage?.url || '/logo.jpg');

                return (
                  <div key={item.cartItemId || item._id} className="mini-item">
                    <img src={image} alt={name} />
                    <div className="mini-item-details">
                      <strong>{name}</strong>
                      {item.selectedVariant && <span className="variant-tag">Size: {item.selectedVariant.name}</span>}
                      <span>Qty: {item.quantity} × ₹{itemPrice}</span>
                    </div>
                    <div className="mini-item-price">
                      ₹{itemPrice * item.quantity}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="summary-divider" />

            <div className="summary-row">
              <span>Items Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="summary-row">
              <span>Shipping Fee</span>
              <span>{shippingFee === 0 ? <strong className="free-tag">FREE</strong> : `₹${shippingFee}`}</span>
            </div>

            <div className="summary-divider" />

            <div className="summary-row grand-total-row">
              <span>Total Payable</span>
              <span>₹{grandTotal}</span>
            </div>

            <div className="trust-badge-row">
              <ShieldCheck size={18} /> 100% Genuine Handcrafted Guarantee
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
