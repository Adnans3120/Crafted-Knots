import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import './AuthPages.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success(`Welcome back, ${res.user?.name || 'Customer'}!`);
        if (res.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(from, { replace: true });
        }
      } else {
        toast.error(res.message || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-circle">
            <LogIn size={28} />
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to track orders, manage addresses & save favorites</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block auth-btn">
            {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-link">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
