import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Upload, Plus, Trash2, Image, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI, categoryAPI } from '../../services/api';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isMadeToOrder, setIsMadeToOrder] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Images
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // Variants
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([
    { name: 'Small', price: '', stock: '5' },
    { name: 'Medium', price: '', stock: '5' },
  ]);

  useEffect(() => {
    fetchCategories();
    if (isEdit) fetchProductData();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getAll({});
      setCategories(res.data.categories || []);
      if (!isEdit && res.data.categories?.length > 0) {
        setCategory(res.data.categories[0]._id);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchProductData = async () => {
    try {
      // Find product
      const res = await productAPI.getAdminAll({});
      const prod = res.data.products?.find(p => p._id === id);
      if (prod) {
        setName(prod.name);
        setCategory(prod.category?._id || prod.category || '');
        setDescription(prod.description || '');
        setPrice(prod.price || '');
        setDiscountPrice(prod.discountPrice || '');
        setStock(prod.stock || '0');
        setIsFeatured(prod.isFeatured || false);
        setIsMadeToOrder(prod.isMadeToOrder || false);
        setIsActive(prod.isActive !== false);
        setExistingImages(prod.images || []);

        if (prod.hasVariants && prod.variants?.length > 0) {
          setHasVariants(true);
          setVariants(prod.variants);
        }
      }
    } catch (err) {
      toast.error('Failed to load product details');
    } finally {
      setFetching(false);
    }
  };

  // Image File Handling
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeNewImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  // Variant Handling
  const addVariantRow = () => {
    setVariants([...variants, { name: '', price: price || '', stock: '5' }]);
  };

  const removeVariantRow = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariantField = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !price || !category) {
      toast.error('Please fill in title, base price, and category');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('price', price);
      if (discountPrice) formData.append('discountPrice', discountPrice);
      formData.append('stock', stock);
      formData.append('isFeatured', isFeatured);
      formData.append('isMadeToOrder', isMadeToOrder);
      formData.append('isActive', isActive);
      formData.append('hasVariants', hasVariants);

      if (hasVariants) {
        formData.append('variants', JSON.stringify(variants));
      }

      // Attach new image files
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      if (isEdit) {
        await productAPI.update(id, formData);
        toast.success('Product updated successfully!');
      } else {
        await productAPI.create(formData);
        toast.success('Product created successfully!');
      }

      navigate('/admin/products');
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="page-loader-container"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-page">
      <Link to="/admin/products" className="back-link">
        <ChevronLeft size={16} /> Back to Products List
      </Link>

      <h1 className="page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

      <form onSubmit={handleSubmit} className="admin-form-card">
        <div className="form-group">
          <label>Product Name / Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. Handmade Floral Crochet Bucket Hat"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Category *</label>
              <Link to="/admin/categories" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'underline' }}>
                + Add / Manage Categories
              </Link>
            </div>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            {categories.length === 0 && (
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--accent)', marginTop: '0.3rem' }}>
                ⚠️ No categories found. Please <Link to="/admin/categories" style={{ fontWeight: 'bold', textDecoration: 'underline' }}>create a category first</Link> or ensure backend is running!
              </span>
            )}
          </div>

          <div className="form-group">
            <label>Base Price (₹) *</label>
            <input
              type="number"
              required
              placeholder="e.g. 799"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label>Discount Price (₹) (Optional)</label>
            <input
              type="number"
              placeholder="e.g. 649"
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Stock Count *</label>
            <input
              type="number"
              required
              placeholder="10"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Product Description & Care Details</label>
          <textarea
            rows={4}
            placeholder="Describe yarn material, dimensions, style, handcrafting details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Toggles */}
        <div className="form-toggles-row" style={{ display: 'flex', gap: '2rem', margin: '1.5rem 0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            <span>Feature on Homepage Hero</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isMadeToOrder}
              onChange={(e) => setIsMadeToOrder(e.target.checked)}
            />
            <span>Made to Order Item</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span>Visible / Active in Store</span>
          </label>
        </div>

        {/* Images Upload Section */}
        <div className="form-section-box" style={{ background: 'var(--surface-muted)', padding: '1.25rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>
          <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>Product Images</label>

          {/* Existing images view if edit */}
          {existingImages.length > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {existingImages.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt={`Existing ${i}`}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }}
                />
              ))}
            </div>
          )}

          {/* New Image Previews */}
          {imagePreviews.length > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {imagePreviews.map((src, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <img
                    src={src}
                    alt={`New preview ${idx}`}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '2px solid var(--primary)' }}
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            type="file"
            id="product-images-input"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />

          <label
            htmlFor="product-images-input"
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
          >
            <Upload size={16} /> Choose Image Files
          </label>
        </div>

        {/* Variants Section */}
        <div className="form-section-box" style={{ background: 'var(--surface-muted)', padding: '1.25rem', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={(e) => setHasVariants(e.target.checked)}
              />
              <span>Enable Size / Style Variants (e.g. S, M, L, Small Flower, Large Top)</span>
            </label>
          </div>

          {hasVariants && (
            <div>
              {variants.map((v, index) => (
                <div key={index} className="grid-3" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Variant Name (e.g. Medium / Pink)"
                    value={v.name}
                    onChange={(e) => updateVariantField(index, 'name', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={v.price}
                    onChange={(e) => updateVariantField(index, 'price', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={v.stock}
                    onChange={(e) => updateVariantField(index, 'stock', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeVariantRow(index)}
                    className="danger-btn"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addVariantRow}
                className="btn btn-outline btn-xs"
                style={{ marginTop: '0.5rem' }}
              >
                <Plus size={14} /> Add Variant Option
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg btn-block"
        >
          {loading ? 'Saving Product...' : isEdit ? 'Update Product Details' : 'Create & Publish Product'}
        </button>
      </form>
    </div>
  );
}
