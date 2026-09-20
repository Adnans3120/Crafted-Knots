import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, FolderTree, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoryAPI } from '../../services/api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryAPI.getAll({});
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Failed to load categories', err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImageFile(null);
    setImagePreview('');
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImageFile(null);
    setImagePreview(cat.image?.url || '');
    setIsActive(cat.isActive !== false);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.error('Category name is required');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('isActive', isActive);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingCategory) {
        await categoryAPI.update(editingCategory._id, formData);
        toast.success('Category updated!');
      } else {
        await categoryAPI.create(formData);
        toast.success('Category created!');
      }

      setShowModal(false);
      fetchCategories();
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;
    try {
      await categoryAPI.delete(cat._id);
      toast.success(`Deleted ${cat.name}`);
      setCategories(categories.filter(c => c._id !== cat._id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="admin-page">
      <div className="dash-header-row">
        <div>
          <h1>Product Categories</h1>
          <p>Organize products into wearable, accessories, or home decor collections</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} /> Add New Category
        </button>
      </div>

      <div className="dash-card" style={{ marginTop: '1.5rem' }}>
        {loading ? (
          <div className="page-loader-container"><div className="spinner" /></div>
        ) : categories.length === 0 ? (
          <p className="no-data-text">No categories created yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Category Name</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id}>
                    <td>
                      <img
                        src={cat.image?.url || '/placeholder-crochet.jpg'}
                        alt={cat.name}
                        style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    </td>
                    <td>
                      <strong>{cat.name}</strong>
                      {cat.description && <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cat.description}</span>}
                    </td>
                    <td><code>{cat.slug}</code></td>
                    <td>
                      <span className={`status-badge ${cat.isActive ? 'badge-delivered' : 'badge-cancelled'}`}>
                        {cat.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => openEditModal(cat)} className="btn btn-outline btn-xs">
                          <Edit3 size={14} /> Edit
                        </button>
                        <button onClick={() => handleDelete(cat)} className="btn btn-outline btn-xs danger-btn">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>{editingCategory ? 'Edit Category' : 'Create Category'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crochet Tops & Wearables"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Short tagline for category page..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Category Image</label>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px', marginBottom: '0.5rem', display: 'block' }}
                  />
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: '1rem 0' }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span>Active in storefront navigation</span>
              </label>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
