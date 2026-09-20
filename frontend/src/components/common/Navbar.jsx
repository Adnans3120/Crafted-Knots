import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Heart, Package } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isLoggedIn, isAdmin, logout } = useAuthStore();
  const cartItems = useCartStore((s) => s.items);
  const navigate = useNavigate();

  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <img src="/logo.jpg" alt="Crafted Knots" />
          <span>Crafted Knots</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar-links">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>Home</NavLink>
          <NavLink to="/shop" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Shop</NavLink>
          <a href="/#about" className="nav-link">About</a>
          <a href="/#contact" className="nav-link">Contact</a>
          {isAdmin() && <NavLink to="/admin" className="nav-link admin-link">Dashboard</NavLink>}
        </nav>

        {/* Actions */}
        <div className="navbar-actions">
          {/* Cart */}
          <Link to="/cart" className="icon-btn" aria-label="Cart">
            <ShoppingBag size={22} />
            {itemCount > 0 && <span className="badge-count">{itemCount}</span>}
          </Link>

          {/* Auth */}
          {isLoggedIn() ? (
            <div className="user-menu">
              <button className="icon-btn user-btn" aria-label="User menu">
                <User size={22} />
                <span className="user-name">{user?.name?.split(' ')[0]}</span>
              </button>
              <div className="user-dropdown">
                <Link to="/profile" className="dropdown-item"><User size={15} /> My Profile</Link>
                <Link to="/orders" className="dropdown-item"><Package size={15} /> My Orders</Link>
                {isAdmin() && <Link to="/admin" className="dropdown-item admin-link-item">⚙️ Admin</Link>}
                <div className="dropdown-divider" />
                <button onClick={handleLogout} className="dropdown-item text-error">Sign Out</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
          )}

          {/* Mobile Hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <NavLink to="/" className="mobile-link" onClick={() => setMenuOpen(false)} end>Home</NavLink>
        <NavLink to="/shop" className="mobile-link" onClick={() => setMenuOpen(false)}>Shop</NavLink>
        <a href="/#about" className="mobile-link" onClick={() => setMenuOpen(false)}>About</a>
        <a href="/#contact" className="mobile-link" onClick={() => setMenuOpen(false)}>Contact</a>
        {isLoggedIn() ? (
          <>
            <NavLink to="/orders" className="mobile-link" onClick={() => setMenuOpen(false)}>My Orders</NavLink>
            <NavLink to="/profile" className="mobile-link" onClick={() => setMenuOpen(false)}>Profile</NavLink>
            {isAdmin() && <NavLink to="/admin" className="mobile-link" onClick={() => setMenuOpen(false)}>Admin</NavLink>}
            <button onClick={handleLogout} className="mobile-link text-error" style={{ textAlign: 'left', width: '100%' }}>Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
            <Link to="/register" className="mobile-link" onClick={() => setMenuOpen(false)}>Register</Link>
          </>
        )}
      </div>
    </header>
  );
}
