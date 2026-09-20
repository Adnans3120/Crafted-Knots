import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Filter, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI } from '../../services/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getAll({ status: statusFilter || undefined });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load admin orders', err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus, `Status updated to ${newStatus} by admin`);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const filteredOrders = orders.filter(o =>
    o.orderNumber?.toString().includes(search) ||
    o.shippingAddress?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    o.shippingAddress?.phone?.includes(search)
  );

  return (
    <div className="admin-page">
      <div className="dash-header-row">
        <div>
          <h1>Customer Orders</h1>
          <p>Track cash-on-delivery orders, update crafting & shipping progress</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="dash-card" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="chip-list" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
              <button
                key={st}
                className={`chip ${statusFilter === st ? 'active' : ''}`}
                onClick={() => setStatusFilter(st)}
              >
                {st === '' ? 'All Orders' : st}
              </button>
            ))}
          </div>

          <div className="search-input-wrap" style={{ minWidth: '220px' }}>
            <input
              type="text"
              placeholder="Search Order # or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="dash-card">
        {loading ? (
          <div className="page-loader-container"><div className="spinner" /></div>
        ) : filteredOrders.length === 0 ? (
          <p className="no-data-text">No orders found matching your filter.</p>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Customer Name & Phone</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Change Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td><strong>#{order.orderNumber}</strong></td>
                    <td>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td>
                      <strong>{order.shippingAddress?.fullName}</strong>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        📞 {order.shippingAddress?.phone}
                      </span>
                    </td>
                    <td><strong>₹{order.totalAmount}</strong></td>
                    <td><span className="payment-tag">COD</span></td>
                    <td>
                      <span className={`status-badge badge-${(order.orderStatus || order.status || 'Pending').toLowerCase()}`}>
                        {order.orderStatus || order.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <select
                        value={order.orderStatus || order.status || 'Pending'}
                        onChange={(e) => handleQuickStatusChange(order._id, e.target.value)}
                        style={{ padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.8rem' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Handcrafting</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <Link to={`/admin/orders/${order._id}`} className="btn btn-outline btn-xs">
                        <Eye size={14} /> Full Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
