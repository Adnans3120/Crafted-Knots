import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageCircle, MapPin, Truck, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI } from '../../services/api';
import { getWhatsAppUrl } from '../../utils/whatsapp';
import './CustomerAccount.css';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getById(id);
      setOrder(res.data.order);
    } catch (err) {
      console.error('Failed to load order', err);
      toast.error('Order not found');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await orderAPI.cancel(id, 'Cancelled by customer');
      toast.success('Order cancelled successfully');
      fetchOrderDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleWhatsAppQuery = () => {
    const message = `Hi Crafted Knots! I have a question regarding my Order #${order.orderNumber}.`;
    window.open(getWhatsAppUrl(message), '_blank');
  };

  if (loading || !order) {
    return (
      <div className="container page-loader-container">
        <div className="spinner" />
      </div>
    );
  }

  const steps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const ordStatus = order.orderStatus || order.status;
  const currentStepIndex = steps.indexOf(ordStatus);
  const isCancelled = ordStatus === 'Cancelled';

  return (
    <div className="account-page container">
      <Link to="/orders" className="back-link">
        <ChevronLeft size={16} /> Back to My Orders
      </Link>

      <div className="order-detail-header">
        <div>
          <h1>Order #{order.orderNumber}</h1>
          <p>
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <button className="btn whatsapp-btn btn-sm" onClick={handleWhatsAppQuery}>
          <MessageCircle size={16} /> Order Support on WhatsApp
        </button>
      </div>

      {/* Status Timeline */}
      {!isCancelled ? (
        <div className="timeline-card">
          <h3>Order Status</h3>
          <div className="timeline-tracker">
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step}
                  className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                >
                  <div className="step-circle">
                    {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                  </div>
                  <span className="step-label">{step === 'Processing' ? 'Handcrafting' : step}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="cancelled-banner">
          <XCircle size={24} />
          <div>
            <strong>This order has been cancelled</strong>
            {order.cancellationReason && <p>Reason: {order.cancellationReason}</p>}
          </div>
        </div>
      )}

      {/* Grid: Items vs Delivery & Summary */}
      <div className="order-detail-grid">
        <div className="order-items-block">
          <h3>Order Items ({order.items?.length})</h3>
          <div className="detail-items-list">
            {order.items?.map((item, idx) => (
              <div key={idx} className="detail-item-row">
                <img src={item.productImage || '/logo.jpg'} alt={item.name} />
                <div className="detail-item-info">
                  <strong>{item.name}</strong>
                  {item.variantName && <span>Size / Variant: {item.variantName}</span>}
                  <span>Price: ₹{item.price}</span>
                </div>
                <div className="detail-item-total">
                  <span>Qty: {item.quantity}</span>
                  <strong>₹{item.price * item.quantity}</strong>
                </div>
              </div>
            ))}
          </div>

          {(order.status === 'Pending' || order.status === 'Confirmed') && (
            <div className="cancel-action-bar">
              <button
                className="btn btn-outline btn-sm danger-btn"
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          )}
        </div>

        <div className="order-summary-sidebar">
          {/* Shipping Address */}
          <div className="info-box">
            <h3><MapPin size={18} /> Shipping Address</h3>
            <p><strong>{order.shippingAddress?.fullName}</strong></p>
            <p>{order.shippingAddress?.street}</p>
            {order.shippingAddress?.landmark && <p>Landmark: {order.shippingAddress?.landmark}</p>}
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
            <p>📞 {order.shippingAddress?.phone}</p>
          </div>

          {/* Payment Summary */}
          <div className="info-box">
            <h3>Payment Summary</h3>
            <div className="summary-row">
              <span>Items Subtotal</span>
              <span>₹{order.itemsPrice}</span>
            </div>
            <div className="summary-row">
              <span>Shipping Fee</span>
              <span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row grand-total-row">
              <span>Total Payable (COD)</span>
              <span>₹{order.totalAmount}</span>
            </div>
            <div className="cod-badge-small">
              💵 Payment: Cash on Delivery
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
