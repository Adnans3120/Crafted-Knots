import { Link } from 'react-router-dom';
import { Mail, Phone, Heart, MessageCircle } from 'lucide-react';
import { getWhatsAppUrl } from '../../utils/whatsapp';
import './Footer.css';

const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function Footer() {
  const whatsappUrl = getWhatsAppUrl("Hi Crafted Knots! I'd like to get in touch.");

  return (
    <footer className="footer" id="contact">
      {/* Newsletter */}
      <div className="footer-newsletter">
        <div className="container">
          <div className="newsletter-inner">
            <div>
              <div className="section-tag">Stay Connected</div>
              <h3>Never miss a new creation</h3>
              <p>Get updates on new products, seasonal collections, and exclusive offers.</p>
            </div>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email address" className="newsletter-input" />
              <button type="submit" className="btn btn-accent">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <img src="/logo.jpg" alt="Crafted Knots" />
                <span>Crafted Knots</span>
              </Link>
              <p className="footer-tagline">✦ Hand Made With Love ✦</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.75rem' }}>
                Every piece is lovingly handcrafted with premium yarn and
                attention to detail — made to bring warmth and joy to your life.
              </p>
              <div className="social-links">
                <a href={import.meta.env.VITE_INSTAGRAM_URL || "https://www.instagram.com/_crafted.knots_/"} target="_blank" rel="noreferrer" className="social-btn" aria-label="Instagram">
                  <InstagramIcon size={18} />
                </a>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="social-btn whatsapp" aria-label="WhatsApp">
                  <MessageCircle size={18} />
                </a>
              </div>
            </div>

            {/* Shop */}
            <div className="footer-col">
              <h4>Shop</h4>
              <Link to="/shop">All Products</Link>
              <Link to="/shop?featured=true">Featured</Link>
              <Link to="/shop?category=flowers">Flowers</Link>
              <Link to="/shop?category=bags">Bags</Link>
              <Link to="/shop?category=toys">Toys</Link>
              <Link to="/shop?category=keychains">Keychains</Link>
            </div>

            {/* Account */}
            <div className="footer-col">
              <h4>Account</h4>
              <Link to="/login">Sign In</Link>
              <Link to="/register">Register</Link>
              <Link to="/orders">My Orders</Link>
              <Link to="/profile">My Profile</Link>
              <Link to="/cart">Cart</Link>
            </div>

            {/* Contact */}
            <div className="footer-col" id="about">
              <h4>Get In Touch</h4>
              <a href={`mailto:craftedknots25@gmail.com`} className="contact-link">
                <Mail size={15} /> craftedknots25@gmail.com
              </a>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="contact-link">
                <MessageCircle size={15} /> WhatsApp Us
              </a>
              {/* <div className="shipping-note">
                <span>🚚</span>
                {/* <span>Free shipping on orders above ₹999</span> */}
              {/* </div> */} 
              <div className="shipping-note">
                <span>🧶</span>
                <span>Handmade with premium yarn</span>
              </div>
              <div className="shipping-note">
                <span>❤️</span>
                <span>Cash on Delivery available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} Crafted Knots. All rights reserved.</p>
          <p>Made with <Heart size={13} fill="currentColor" /> for crochet lovers</p>
        </div>
      </div>
    </footer>
  );
}
