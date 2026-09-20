import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Grid, LayoutList } from 'lucide-react';
import { productAPI, categoryAPI } from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import './ShopPage.css';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [priceRange, setPriceRange] = useState(searchParams.get('maxPrice') || 5000);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    // Update URL query parameters
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (searchQuery) params.search = searchQuery;
    if (sortBy && sortBy !== 'newest') params.sort = sortBy;
    if (priceRange < 10000) params.maxPrice = priceRange;
    setSearchParams(params, { replace: true });
  }, [selectedCategory, searchQuery, sortBy, page, priceRange]);

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getAll({ isActive: true });
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sort: sortBy,
      };
      if (priceRange) params.maxPrice = priceRange;
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const res = await productAPI.getAll(params);
      setProducts(res.data.products || []);
      const pagination = res.data.pagination || {};
      setTotalPages(pagination.pages || res.data.pages || 1);
      setTotalProducts(pagination.total !== undefined ? pagination.total : (res.data.total || 0));
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleCategorySelect = (val) => {
    setSelectedCategory(val === selectedCategory ? '' : val);
    setPage(1);
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setSortBy('newest');
    setPriceRange(10000);
    setPage(1);
  };

  return (
    <div className="shop-page container">
      {/* Header Banner */}
      <div className="shop-header">
        <h1>Handcrafted Collection</h1>
        <p>Explore unique, lovingly crocheted fashion, accessories & home decor</p>
      </div>

      {/* Main Content Layout */}
      <div className="shop-layout">
        {/* Sidebar Filters - Desktop */}
        <aside className="filter-sidebar desktop-only">
          <div className="filter-header">
            <h3>Filters</h3>
            {(selectedCategory || searchQuery || sortBy !== 'newest') && (
              <button className="reset-btn" onClick={resetFilters}>Reset All</button>
            )}
          </div>

          {/* Search */}
          <form className="filter-section" onSubmit={handleSearchSubmit}>
            <label className="filter-label">Search</label>
            <div className="search-input-wrap">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-icon-btn"><Search size={16} /></button>
            </div>
          </form>

          {/* Categories */}
          <div className="filter-section">
            <label className="filter-label">Categories</label>
            <ul className="category-filter-list">
              <li
                className={selectedCategory === '' ? 'active' : ''}
                onClick={() => handleCategorySelect('')}
              >
                All Products
              </li>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.slug || selectedCategory === cat._id;
                return (
                  <li
                    key={cat._id}
                    className={isActive ? 'active' : ''}
                    onClick={() => handleCategorySelect(cat.slug || cat._id)}
                  >
                    {cat.name}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Price Range */}
          <div className="filter-section">
            <div className="filter-label-row">
              <label className="filter-label">Max Price</label>
              <span>₹{priceRange}</span>
            </div>
            <input
              type="range"
              min="200"
              max="10000"
              step="100"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="price-slider"
            />
          </div>
        </aside>

        {/* Mobile Filter Drawer Overlay */}
        {mobileFilterOpen && (
          <div className="mobile-filter-drawer">
            <div className="drawer-header">
              <h3>Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)}><X size={20} /></button>
            </div>
            <div className="drawer-content">
              {/* Categories */}
              <div className="filter-section">
                <label className="filter-label">Categories</label>
                <div className="chip-list">
                  <button
                    className={`chip ${selectedCategory === '' ? 'active' : ''}`}
                    onClick={() => handleCategorySelect('')}
                  >
                    All
                  </button>
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat.slug || selectedCategory === cat._id;
                    return (
                      <button
                        key={cat._id}
                        className={`chip ${isActive ? 'active' : ''}`}
                        onClick={() => handleCategorySelect(cat.slug || cat._id)}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price slider */}
              <div className="filter-section">
                <div className="filter-label-row">
                  <label className="filter-label">Max Price</label>
                  <span>₹{priceRange}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="10000"
                  step="100"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="price-slider"
                />
              </div>

              <button
                className="btn btn-primary btn-block"
                onClick={() => setMobileFilterOpen(false)}
              >
                Apply Filters ({totalProducts} items)
              </button>
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <main className="product-area">
          {/* Controls Bar */}
          <div className="shop-controls-bar">
            <button
              className="mobile-filter-trigger mobile-only btn btn-outline btn-sm"
              onClick={() => setMobileFilterOpen(true)}
            >
              <SlidersHorizontal size={16} /> Filters
            </button>

            <span className="results-count">
              Showing <strong>{products.length}</strong> of <strong>{totalProducts}</strong> handcrafted items
            </span>

            <div className="sort-wrap">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Grid Content */}
          {loading ? (
            <div className="product-grid">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="skeleton-card" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-shop">
              <h3>No products found</h3>
              <p>Try adjusting your search query or price filter to find what you are looking for.</p>
              <button className="btn btn-primary" onClick={resetFilters}>Clear All Filters</button>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className="btn btn-outline btn-sm"
                  >
                    Previous
                  </button>

                  <span className="page-indicator">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className="btn btn-outline btn-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
