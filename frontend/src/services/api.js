import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ck_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — clear session and redirect
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ck_token');
      localStorage.removeItem('ck_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  addAddress: (data) => api.post('/auth/addresses', data),
  deleteAddress: (id) => api.delete(`/auth/addresses/${id}`),
};

// ─── Categories ──────────────────────────────────────────────────
export const categoryAPI = {
  getAll: (params) => api.get('/categories', { params }),
  create: (data) => api.post('/categories', data),       // FormData
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ─── Products ────────────────────────────────────────────────────
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  getAdminAll: (params) => api.get('/products/admin/all', { params }),
  create: (data) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/products/${id}`),
};

// ─── Orders ──────────────────────────────────────────────────────
export const orderAPI = {
  place: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id, reason) => api.patch(`/orders/${id}/cancel`, { reason }),
  // Admin
  getAll: (params) => api.get('/orders/admin/all', { params }),
  getStats: () => api.get('/orders/admin/stats'),
  updateStatus: (id, status, adminNote) => api.patch(`/orders/admin/${id}/status`, { status, adminNote }),
};

export default api;
