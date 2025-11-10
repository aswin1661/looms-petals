'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Dashboard.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category: '',
    brand: '',
    image_url: [],
    stock: '',
    status: 'normal',
    type: 'clothing',
    is_featured: false,
  });
  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    checkAuth();
    fetchProducts();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      if (!response.ok) {
        router.push('/admin/login');
        return;
      }
      const data = await response.json();
      setUser(data.data.user);
    } catch (error) {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingProduct
      ? `/api/admin/products?id=${editingProduct.id}`
      : '/api/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingProduct(null);
        resetForm();
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    // Parse image_url - it might be a JSON array string or a single URL
    let images = [];
    if (product.image_url) {
      try {
        images = JSON.parse(product.image_url);
        if (!Array.isArray(images)) {
          images = [product.image_url];
        }
      } catch {
        images = [product.image_url];
      }
    }
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      discount_price: product.discount_price || '',
      category: product.category,
      brand: product.brand || '',
      image_url: images,
      stock: product.stock,
      status: product.status || 'normal',
      type: product.type || 'clothing',
      is_featured: product.is_featured,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discount_price: '',
      category: '',
      brand: '',
      image_url: [],
      stock: '',
      status: 'normal',
      type: 'clothing',
      is_featured: false,
    });
    setImageInput('');
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const addImageUrl = () => {
    if (imageInput.trim()) {
      setFormData({
        ...formData,
        image_url: [...formData.image_url, imageInput.trim()]
      });
      setImageInput('');
    }
  };

  const removeImageUrl = (index) => {
    setFormData({
      ...formData,
      image_url: formData.image_url.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.logo}>Looms & Petals</h1>
            <p className={styles.subtitle}>Admin Dashboard</p>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.welcomeText}>Welcome, {user?.name}</span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.toolbar}>
          <h2 className={styles.pageTitle}>Product Management</h2>
          <button
            onClick={() => {
              resetForm();
              setEditingProduct(null);
              setShowModal(true);
            }}
            className={styles.addBtn}
          >
            + Add Product
          </button>
        </div>

        {/* Products Grid */}
        <div className={styles.grid}>
          {products.map((product) => {
            // Parse image_url to get first image
            let imageUrl = 'https://picsum.photos/400/600';
            if (product.image_url) {
              try {
                const images = JSON.parse(product.image_url);
                imageUrl = Array.isArray(images) && images.length > 0 ? images[0] : product.image_url;
              } catch {
                imageUrl = product.image_url;
              }
            }
            
            return (
            <div key={product.id} className={styles.card}>
              <div className={styles.cardImage}>
                <img
                  src={imageUrl}
                  alt={product.name}
                />
                {product.is_featured && (
                  <span className={styles.featuredBadge}>Featured</span>
                )}
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{product.name}</h3>
                <p className={styles.cardCategory}>{product.category}</p>
                <div className={styles.cardMeta}>
                  <span className={styles.metaItem}>
                    <strong>Type:</strong> {product.type || 'clothing'}
                  </span>
                  <span className={`${styles.statusBadge} ${styles[product.status || 'normal']}`}>
                    {(product.status || 'normal').replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className={styles.cardPrice}>
                  <span className={styles.price}>₹{product.price}</span>
                  {product.discount_price && (
                    <span className={styles.discountPrice}>
                      ₹{product.discount_price}
                    </span>
                  )}
                </div>
                <p className={styles.cardStock}>Stock: {product.stock}</p>
                <div className={styles.cardActions}>
                  <button
                    onClick={() => handleEdit(product)}
                    className={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {products.length === 0 && (
          <div className={styles.emptyState}>
            <p>No products found. Add your first product!</p>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button
                onClick={() => setShowModal(false)}
                className={styles.closeBtn}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter product name"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Sarees">Sarees</option>
                    <option value="Lehengas">Lehengas</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="clothing">Clothing</option>
                    <option value="jewelry">Jewelry</option>
                    <option value="accessories">Accessories</option>
                    <option value="footwear">Footwear</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="normal">Normal</option>
                    <option value="trending">Trending</option>
                    <option value="featured">Featured</option>
                    <option value="most_bought">Most Bought</option>
                    <option value="new_arrival">New Arrival</option>
                    <option value="sale">Sale</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Enter brand name"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Discount Price</label>
                  <input
                    type="number"
                    name="discount_price"
                    value={formData.discount_price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Image URLs</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="url"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                    placeholder="https://example.com/image.jpg"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className={styles.addBtn}
                    style={{
                      padding: '8px 16px',
                      background: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Add
                  </button>
                </div>
                {formData.image_url.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {formData.image_url.map((url, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                        <img 
                          src={url} 
                          alt={`Preview ${index + 1}`} 
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                        <span style={{ flex: 1, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {url}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeImageUrl(index)}
                          style={{
                            padding: '4px 8px',
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter product description"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                  />
                  <span>Mark as Featured</span>
                </label>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editingProduct ? 'Update' : 'Create'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
