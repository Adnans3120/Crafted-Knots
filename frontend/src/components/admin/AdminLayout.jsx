import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Store, LogOut, Menu, X, ShieldAlert } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import './AdminLayout.css';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/admin" className="admin-brand">
            <img src="/logo.jpg" alt="Crafted Knots" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
            <span>Crafted Knots</span> <span className="admin-badge">Admin</span>
          </Link>
          <button className="close-sidebar-btn mobile-only" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'active' : '')}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => (isActive ? 'active' : '')}>
            <Package size={18} /> Products & Inventory
          </NavLink>
          <NavLink to="/admin/categories" className={({ isActive }) => (isActive ? 'active' : '')}>
            <FolderTree size={18} /> Categories
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'active' : '')}>
            <ShoppingCart size={18} /> Customer Orders
          </NavLink>
          <NavLink to="/admin/customers" className={({ isActive }) => (isActive ? 'active' : '')}>
            <Users size={18} /> Customers
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="storefront-link">
            <Store size={18} /> Visit Storefront
          </Link>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="menu-btn mobile-only" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="topbar-right">
            <span className="admin-user-info">Logged in as <strong>{user?.name}</strong></span>
          </div>
        </header>

        <div className="admin-content-wrap container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
