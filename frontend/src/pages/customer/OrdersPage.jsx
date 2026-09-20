import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, ChevronRight, AlertCircle } from 'lucide-react';
import { orderAPI } from '../../services/api';
import './CustomerAccount.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await orderAPI.getMyOrders();
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="status-badge badge-pending">Order Placed</span>;
      case 'Confirmed':
        return <span className="status-badge badge-confirmed">Confirmed</span>;
      case 'Processing':
        return <span className="status-badge badge-processing">Handcrafting in Progress</span>;
      case 'Shipped':
        return <span className="status-badge badge-shipped">Shipped</span>;
      case 'Delivered':
        return <span className="status-badge badge-delivered">Delivered</span>;
      case 'Cancelled':
        return <span className="status-badge badge-cancelled">Cancelled</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container page-loader-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="account-page container">
      <h1 className="page-title">My Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-account-card">
          <Package size={48} />
          <h2>No Orders Yet</h2>
          <p>You haven't placed any handcrafted orders with us so far.</p>
          <Link to="/shop" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-card-header">
                <div>
                  <span className="order-number">Order #{order.orderNumber}</span>
                  <span className="order-date">
                    Plated on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {getStatusBadge(order.orderStatus || order.status)}
              </div>

              <div className="order-card-items">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="order-item-mini">
                    <img src={item.image || item.productImage || '/logo.jpg'} alt={item.name} />
                    <div className="item-detail">
                      <strong>{item.name}</strong>
                      {item.variantName && <span>Size: {item.variantName}</span>}
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <div className="order-total-info">
                  <span>Total Amount:</span>
                  <strong>₹{order.totalAmount}</strong>
                  <span className="payment-tag">Cash on Delivery</span>
                </div>
                <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">
                  View Details <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
