import { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Fetch orders to deduce unique customer stats or fetch profile list
      const res = await api.get('/orders/admin/all');
      const orders = res.data.orders || [];

      // Extract customer info map
      const customerMap = {};
      orders.forEach(o => {
        const email = o.user?.email || o.shippingAddress?.fullName;
        if (email && !customerMap[email]) {
          customerMap[email] = {
            name: o.user?.name || o.shippingAddress?.fullName,
            email: o.user?.email || 'Guest / Checkout',
            phone: o.shippingAddress?.phone || o.user?.phone || 'N/A',
            ordersCount: 1,
            totalSpent: o.totalAmount,
            joinedAt: o.user?.createdAt || o.createdAt,
          };
        } else if (email) {
          customerMap[email].ordersCount += 1;
          customerMap[email].totalSpent += o.totalAmount;
        }
      });

      setCustomers(Object.values(customerMap));
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="dash-header-row">
        <div>
          <h1>Customer Base</h1>
          <p>Directory of registered shoppers and order history counts</p>
        </div>
      </div>

      <div className="dash-card" style={{ marginTop: '1.5rem' }}>
        {loading ? (
          <div className="page-loader-container"><div className="spinner" /></div>
        ) : customers.length === 0 ? (
          <p className="no-data-text">No customer records available yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Contact Email</th>
                  <th>Phone Number</th>
                  <th>Total Orders</th>
                  <th>Lifetime Value</th>
                  <th>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((cust, idx) => (
                  <tr key={idx}>
                    <td><strong>{cust.name}</strong></td>
                    <td>{cust.email}</td>
                    <td>📞 {cust.phone}</td>
                    <td><span className="status-badge badge-confirmed">{cust.ordersCount} orders</span></td>
                    <td><strong>₹{cust.totalSpent}</strong></td>
                    <td>
                      {new Date(cust.joinedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
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
