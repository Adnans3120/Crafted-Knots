import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit3, Trash2, Eye, Star, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI, categoryAPI } from '../../services/api';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedCat]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productAPI.getAdminAll({ category: selectedCat || undefined }),
        categoryAPI.getAll({}),
      ]);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data.categories || []);
    } catch (err) {
      console.error('Failed to load products', err);
      toast.error('Failed to load product inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await productAPI.delete(id);
      toast.success(`Deleted ${name}`);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="dash-header-row">
        <div>
          <h1>Products & Inventory</h1>
          <p>Manage catalog items, pricing, variants, and stock counts</p>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Filter controls */}
      <div className="dash-card" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="search-input-wrap" style={{ flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              placeholder="Search product title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="dash-card">
        {loading ? (
          <div className="page-loader-container"><div className="spinner" /></div>
        ) : filteredProducts.length === 0 ? (
          <p className="no-data-text">No products match your filter criteria.</p>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const img = product.images?.[0]?.url || '/placeholder-crochet.jpg';

                  return (
                    <tr key={product._id}>
                      <td>
                        <img
                          src={img}
                          alt={product.name}
                          style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                      </td>
                      <td>
                        <strong>{product.name}</strong>
                        {product.isFeatured && (
                          <span style={{ fontSize: '0.7rem', background: '#fff3e0', color: '#e65100', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.4rem' }}>
                            ★ Featured
                          </span>
                        )}
                      </td>
                      <td>{product.category?.name || 'Uncategorized'}</td>
                      <td>
                        <strong>₹{product.discountPrice || product.price}</strong>
                        {product.discountPrice && (
                          <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.3rem' }}>
                            ₹{product.price}
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ color: product.stock <= 3 ? '#c75d4c' : 'inherit', fontWeight: product.stock <= 3 ? 'bold' : 'normal' }}>
                          {product.stock} units
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${product.isActive ? 'badge-delivered' : 'badge-cancelled'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <Link to={`/products/${product.slug}`} target="_blank" className="btn btn-outline btn-xs" title="View product page">
                            <Eye size={14} />
                          </Link>
                          <Link to={`/admin/products/${product._id}/edit`} className="btn btn-outline btn-xs" title="Edit">
                            <Edit3 size={14} />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product._id, product.name)}
                            className="btn btn-outline btn-xs danger-btn"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
