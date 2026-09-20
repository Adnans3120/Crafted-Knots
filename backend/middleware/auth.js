import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes — verifies JWT and attaches req.user
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated' });
    }
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
  }
};

// Admin-only guard — must be used after protect
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied: Admins only' });
  }
  next();
};
