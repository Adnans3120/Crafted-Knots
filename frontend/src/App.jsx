import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AdminLayout from './components/admin/AdminLayout';

// ─── Lazy Pages: Customer ─────────────────────────────────────────
const HomePage        = lazy(() => import('./pages/customer/HomePage'));
const ShopPage        = lazy(() => import('./pages/customer/ShopPage'));
const ProductDetail   = lazy(() => import('./pages/customer/ProductDetailPage'));
const CartPage        = lazy(() => import('./pages/customer/CartPage'));
const CheckoutPage    = lazy(() => import('./pages/customer/CheckoutPage'));
const LoginPage       = lazy(() => import('./pages/customer/LoginPage'));
const RegisterPage    = lazy(() => import('./pages/customer/RegisterPage'));
const OrdersPage      = lazy(() => import('./pages/customer/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/customer/OrderDetailPage'));
const ProfilePage     = lazy(() => import('./pages/customer/ProfilePage'));

// ─── Lazy Pages: Admin ────────────────────────────────────────────
const AdminDashboard   = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts    = lazy(() => import('./pages/admin/AdminProducts'));
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'));
const AdminCategories  = lazy(() => import('./pages/admin/AdminCategories'));
const AdminOrders      = lazy(() => import('./pages/admin/AdminOrders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'));
const AdminCustomers   = lazy(() => import('./pages/admin/AdminCustomers'));

const Loader = () => (
  <div className="page-loader"><div className="spinner" /></div>
);

// ─── Route Guards ─────────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useAuthStore();
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuthStore();
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isLoggedIn } = useAuthStore();
  return !isLoggedIn() ? children : <Navigate to="/" replace />;
};

// ─── Customer Layout ──────────────────────────────────────────────
const CustomerLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ minHeight: 'calc(100vh - 70px)', paddingTop: '70px' }}>
      {children}
    </main>
    <Footer />
  </>
);

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* ─ Customer Routes ─ */}
        <Route path="/" element={<CustomerLayout><HomePage /></CustomerLayout>} />
        <Route path="/shop" element={<CustomerLayout><ShopPage /></CustomerLayout>} />
        <Route path="/products/:slug" element={<CustomerLayout><ProductDetail /></CustomerLayout>} />
        <Route path="/cart" element={<CustomerLayout><CartPage /></CustomerLayout>} />

        <Route path="/checkout" element={
          <PrivateRoute><CustomerLayout><CheckoutPage /></CustomerLayout></PrivateRoute>
        } />
        <Route path="/orders" element={
          <PrivateRoute><CustomerLayout><OrdersPage /></CustomerLayout></PrivateRoute>
        } />
        <Route path="/orders/:id" element={
          <PrivateRoute><CustomerLayout><OrderDetailPage /></CustomerLayout></PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute><CustomerLayout><ProfilePage /></CustomerLayout></PrivateRoute>
        } />

        {/* ─ Auth Routes (guests only) ─ */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* ─ Admin Routes ─ */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="customers" element={<AdminCustomers />} />
        </Route>

        {/* ─ Catch-all ─ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
