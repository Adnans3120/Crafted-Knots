import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Package, Heart, Truck } from 'lucide-react';
import { productAPI, categoryAPI } from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import './HomePage.css';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Crafted Knots — Handmade Crochet with Love';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = 'Shop handmade crochet products — flowers, bags, toys, keychains and more. Each piece crafted with love.';

    const load = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productAPI.getAll({ featured: true, limit: 8 }),
          categoryAPI.getAll(),
        ]);
        setFeaturedProducts(prodRes.data.products);
        setCategories(catRes.data.categories.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="home-page">
      {/* ─── Hero ─── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-tag">✦ Hand Made With Love ✦</div>
            <h1>Where Every Stitch Tells a Story</h1>
            <p>
              Discover our collection of lovingly handcrafted crochet creations —
              from blooming flowers and charming toys to stylish bags and adorable keychains.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary btn-lg">
                Shop Now <ArrowRight size={18} />
              </Link>
              <a href="#about" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>
                Our Story
              </a>
            </div>
          </div>
          <div className="hero-image-wrap">
            <div className="hero-image-circle">
              <img src="/logo.jpg" alt="Crafted Knots — Handmade with Love" />
            </div>
            <div className="hero-float hero-float-1">🌸</div>
            <div className="hero-float hero-float-2">🧶</div>
            <div className="hero-float hero-float-3">🌼</div>
          </div>
        </div>
        <div className="hero-wave">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#fdf6f0"/>
          </svg>
        </div>
      </section>

      {/* ─── Trust Badges ─── */}
      <section className="trust-section section-sm">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon"><Heart size={28} /></div>
              <div><h4>Handcrafted with Love</h4><p>Every piece made with care</p></div>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><Package size={28} /></div>
              <div><h4>Carefully Packaged</h4><p>Safe & beautiful delivery</p></div>
            </div>
            {/* <div className="trust-item">
              <div className="trust-icon"><Truck size={28} /></div>
              <div><h4>Free Shipping ₹999+</h4><p>Pan India delivery</p></div>
            </div> */}
            <div className="trust-item">
              <div className="trust-icon"><Sparkles size={28} /></div>
              <div><h4>Premium Yarn</h4><p>Soft, durable & colorfast</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Categories ─── */}
      {categories.length > 0 && (
        <section className="section" style={{ background: 'var(--bg-alt)' }}>
          <div className="container">
            <div className="section-header">
              <div className="section-tag">Browse by Type</div>
              <h2>Our Collections</h2>
              <p>From sweet floral arrangements to functional accessories, find the perfect handcrafted piece.</p>
            </div>
            <div className="categories-grid">
              {categories.map((cat) => (
                <Link key={cat._id} to={`/shop?category=${cat._id}`} className="category-card">
                  <div className="category-img">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} />
                    ) : (
                      <span className="category-emoji">🧶</span>
                    )}
                  </div>
                  <span className="category-name">{cat.name}</span>
                </Link>
              ))}
            </div>
            <div className="text-center mt-4">
              <Link to="/shop" className="btn btn-outline">View All Products <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── Featured Products ─── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Handpicked for You</div>
            <h2>Featured Creations</h2>
            <p>Our most-loved pieces, each one unique and made to order.</p>
          </div>
          {loading ? (
            <div className="grid-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 0 }} />
                  <div className="card-body">
                    <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 18, width: '90%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 16, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid-4">
              {featuredProducts.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className="empty-state">
              <p>No featured products yet. Check back soon! 🧶</p>
            </div>
          )}
          <div className="text-center mt-4">
            <Link to="/shop" className="btn btn-primary">
              Shop All Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── About ─── */}
      <section className="about-section section" id="about">
        <div className="container">
          <div className="about-grid">
            <div className="about-image">
              <img src="/logo.jpg" alt="About Crafted Knots" />
              <div className="about-badge">✦ Since 2024 ✦</div>
            </div>
            <div className="about-text">
              <div className="section-tag">Our Story</div>
              <h2>Made with Patience, Stitched with Love</h2>
              <p>
                Crafted Knots was born from a passion for the art of crochet — a craft that transforms
                simple yarn into beautiful, meaningful objects. Each product is made by hand,
                with love and attention to every single stitch.
              </p>
              <p style={{ marginTop: '1rem' }}>
                Whether it's a bouquet that stays forever, a bag you'll use every day,
                or a toy that brings a child joy — everything we create is made to last
                and to be cherished.
              </p>
              <div className="about-stats">
                <div className="about-stat"><span className="stat-num">100%</span><span>Handmade</span></div>
                <div className="about-stat"><span className="stat-num">Premium</span><span>Yarn Quality</span></div>
                <div className="about-stat"><span className="stat-num">♥</span><span>Made with Love</span></div>
              </div>
              <Link to="/shop" className="btn btn-primary mt-3">Explore Our Shop</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
