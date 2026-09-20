import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, ShoppingBag, Package, AlertTriangle, Plus, ArrowUpRight, TrendingUp } from 'lucide-react';
import { orderAPI, productAPI } from '../../services/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        orderAPI.getStats(),
        orderAPI.getAll({ limit: 5 }),
        productAPI.getAdminAll({ limit: 50 }),
      ]);

      const s = statsRes.data.stats || {};
      setStats({
        totalRevenue: s.totalRevenue !== undefined ? s.totalRevenue : (s.revenue || 0),
        deliveredRevenue: s.deliveredRevenue || 0,
        totalOrders: s.totalOrders || 0,
        pendingOrders: s.pendingOrders || 0,
        processingOrders: s.processingOrders || 0,
        deliveredOrders: s.deliveredOrders || 0,
      });
      setRecentOrders(ordersRes.data.orders || []);

      const allProds = productsRes.data.products || [];
      const lowStock = allProds.filter(p => p.stock <= 3);
      setLowStockProducts(lowStock);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-loader-container"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dash-header-row">
        <div>
          <h1>Admin Overview</h1>
          <p>Real-time metrics & management for Crafted Knots</p>
        </div>
        <div className="dash-quick-actions">
          <Link to="/admin/products/new" className="btn btn-primary btn-sm">
            <Plus size={16} /> Add New Product
          </Link>
          <Link to="/admin/categories" className="btn btn-outline btn-sm">
            Manage Categories
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-revenue">
          <div className="stat-icon"><IndianRupee size={24} /></div>
          <div>
            <span className="stat-title">Total Order Value</span>
            <h2 className="stat-value">₹{stats.totalRevenue?.toLocaleString('en-IN') || 0}</h2>
          </div>
        </div>

        <div className="stat-card stat-orders">
          <div className="stat-icon"><ShoppingBag size={24} /></div>
          <div>
            <span className="stat-title">Total Customer Orders</span>
            <h2 className="stat-value">{stats.totalOrders || 0}</h2>
          </div>
        </div>

        <div className="stat-card stat-pending">
          <div className="stat-icon"><TrendingUp size={24} /></div>
          <div>
            <span className="stat-title">Pending Orders</span>
            <h2 className="stat-value">{stats.pendingOrders || 0}</h2>
          </div>
        </div>

        <div className="stat-card stat-processing">
          <div className="stat-icon"><Package size={24} /></div>
          <div>
            <span className="stat-title">Handcrafting / Processing</span>
            <h2 className="stat-value">{stats.processingOrders || 0}</h2>
          </div>
        </div>
      </div>

      <div className="dash-sections-grid">
        {/* Recent Orders */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3>Recent Orders</h3>
            <Link to="/admin/orders" className="view-all-link">
              View All <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td><strong>#{order.orderNumber}</strong></td>
                    <td>{order.user?.name || order.shippingAddress?.fullName}</td>
                    <td>₹{order.totalAmount}</td>
                    <td>
                      <span className={`status-badge badge-${(order.orderStatus || order.status || 'Pending').toLowerCase()}`}>
                        {order.orderStatus || order.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/orders/${order._id}`} className="btn btn-outline btn-xs">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warnings */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3><AlertTriangle size={18} color="#c75d4c" /> Low Stock Alerts</h3>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="no-data-text">All items have healthy inventory stock!</p>
          ) : (
            <div className="low-stock-list">
              {lowStockProducts.map((prod) => (
                <div key={prod._id} className="low-stock-item">
                  <img src={prod.images?.[0]?.url || '/placeholder-crochet.jpg'} alt={prod.name} />
                  <div className="low-stock-info">
                    <strong>{prod.name}</strong>
                    <span className="stock-count">Stock left: {prod.stock}</span>
                  </div>
                  <Link to={`/admin/products/${prod._id}/edit`} className="btn btn-outline btn-xs">
                    Edit Stock
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
