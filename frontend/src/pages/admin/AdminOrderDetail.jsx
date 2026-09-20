import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageCircle, MapPin, Package, CheckCircle, Truck, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI } from '../../services/api';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getById(id);
      const ord = res.data.order;
      setOrder(ord);
      setStatus(ord.orderStatus || ord.status || 'Pending');
      setAdminNote(ord.adminNote || '');
    } catch (err) {
      console.error('Failed to load order', err);
      toast.error('Order not found');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await orderAPI.updateStatus(id, status, adminNote);
      toast.success(`Order status updated to ${status}!`);
      fetchOrderDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleNotifyCustomerWhatsApp = () => {
    if (!order?.shippingAddress?.phone) return;
    const phone = order.shippingAddress.phone.replace(/\D/g, '');
    const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`;

    const message = encodeURIComponent(
      `Hi ${order.shippingAddress.fullName}! Here is an update on your Crafted Knots Order #${order.orderNumber}:\n\n` +
      `Current Status: ${status}\n` +
      (adminNote ? `Note: ${adminNote}\n` : '') +
      `Total Payable (COD): ₹${order.totalAmount}\n\n` +
      `Thank you for supporting handcrafting!`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  if (loading || !order) {
    return <div className="page-loader-container"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-page">
      <Link to="/admin/orders" className="back-link">
        <ChevronLeft size={16} /> Back to Orders List
      </Link>

      <div className="dash-header-row" style={{ marginBottom: '1.5rem' }}>
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
        <button className="btn whatsapp-btn btn-sm" onClick={handleNotifyCustomerWhatsApp}>
          <MessageCircle size={16} /> Notify Customer on WhatsApp
        </button>
      </div>

      <div className="order-detail-grid">
        {/* Left: Items */}
        <div className="dash-card">
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: '1rem' }}>
            Order Items ({order.items?.length})
          </h3>
          <div className="detail-items-list">
            {order.items?.map((item, idx) => (
              <div key={idx} className="detail-item-row">
                <img src={item.productImage || '/placeholder-crochet.jpg'} alt={item.name} />
                <div className="detail-item-info">
                  <strong>{item.name}</strong>
                  {item.variantName && <span>Size: {item.variantName}</span>}
                  <span>Unit Price: ₹{item.price}</span>
                </div>
                <div className="detail-item-total">
                  <span>Qty: {item.quantity}</span>
                  <strong>₹{item.price * item.quantity}</strong>
                </div>
              </div>
            ))}
          </div>

          {order.customerNotes && (
            <div style={{ marginTop: '1.5rem', background: 'var(--surface-muted)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <strong>Customer Instructions:</strong>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {order.customerNotes}
              </p>
            </div>
          )}
        </div>

        {/* Right: Status Control & Address */}
        <div>
          {/* Status Updater */}
          <div className="dash-card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: '1rem' }}>
              Update Order Status
            </h3>
            <form onSubmit={handleUpdateStatus}>
              <div className="form-group">
                <label>Status Lifecycle</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                >
                  <option value="Pending">Pending (Order Received)</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing (Handcrafting)</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label>Admin Note / Tracking ID</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Courier: BlueDart, Tracking #12345678"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>

              <button type="submit" disabled={updating} className="btn btn-primary btn-sm btn-block">
                {updating ? 'Updating Status...' : 'Save Status Update'}
              </button>
            </form>
          </div>

          {/* Shipping Info */}
          <div className="dash-card">
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: '1rem' }}>
              Shipping Details
            </h3>
            <p><strong>{order.shippingAddress?.fullName}</strong></p>
            <p>{order.shippingAddress?.street}</p>
            {order.shippingAddress?.landmark && <p>Landmark: {order.shippingAddress?.landmark}</p>}
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
            <p>📞 <strong>{order.shippingAddress?.phone}</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
