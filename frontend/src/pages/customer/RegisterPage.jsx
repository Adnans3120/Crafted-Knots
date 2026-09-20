import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowRight, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import './AuthPages.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      if (res.success) {
        toast.success(`Welcome to Crafted Knots, ${res.user?.name || formData.name}!`);
        navigate('/');
      } else {
        toast.error(res.message || 'Failed to create account');
      }
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-circle">
            <UserPlus size={28} />
          </div>
          <h2>Join Crafted Knots</h2>
          <p>Create an account to track orders and save your details</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name *</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                name="name"
                required
                placeholder="Priya Sharma"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Phone Number (for order updates) *</label>
            <div className="input-with-icon">
              <Phone size={18} className="input-icon" />
              <input
                type="tel"
                name="phone"
                required
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password *</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                name="password"
                required
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password *</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block auth-btn">
            {loading ? 'Creating Account...' : 'Register Account'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
