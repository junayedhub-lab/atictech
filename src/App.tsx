import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { SettingsProvider } from '@/contexts/SettingsContext'

// Layouts
import CustomerLayout from '@/components/layout/CustomerLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import { ProtectedRoute, AdminRoute, GuestRoute } from '@/components/layout/ProtectedRoute'
import ScrollToTop from '@/components/layout/ScrollToTop'

// Customer Pages
import HomePage from '@/pages/customer/HomePage'
import ProductsPage from '@/pages/customer/ProductsPage'
import ProductDetailPage from '@/pages/customer/ProductDetailPage'
import CartPage from '@/pages/customer/CartPage'
import CheckoutPage from '@/pages/customer/CheckoutPage'
import OrderSuccessPage from '@/pages/customer/OrderSuccessPage'
import OrdersPage from '@/pages/customer/OrdersPage'
import AccountPage from '@/pages/customer/AccountPage'
import SearchPage from '@/pages/customer/SearchPage'
import DynamicPage from '@/pages/customer/DynamicPage'
import OrderDetailPage from '@/pages/customer/OrderDetailPage'
import CategoriesPage from '@/pages/customer/CategoriesPage'
import OrderTrackingPage from '@/pages/customer/OrderTrackingPage'

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminProducts from '@/pages/admin/AdminProducts'
import AdminCategories from '@/pages/admin/AdminCategories'
import AdminOrders from '@/pages/admin/AdminOrders'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminBanners from '@/pages/admin/AdminBanners'
import AdminPayments from '@/pages/admin/AdminPayments'
import AdminSettings from '@/pages/admin/AdminSettings'

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <p className="text-8xl font-black text-slate-700 mb-4">404</p>
        <h1 className="text-2xl font-display font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-slate-400 mb-6">The page you're looking for doesn't exist.</p>
        <a href="/" className="text-blue-400 hover:underline">← Go Home</a>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <SettingsProvider>
            <CartProvider>
              <Toaster
              position="top-right"
              toastOptions={{
                style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
                success: { iconTheme: { primary: '#22c55e', secondary: '#1e293b' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
              }}
            />

            <ScrollToTop />

            <Routes>
              {/* Customer routes */}
              <Route element={<CustomerLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/categories" element={<CategoriesPage />} />

                {/* Public routes (guests allowed) */}
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:id" element={<OrderSuccessPage />} />
                <Route path="/track-order" element={<OrderTrackingPage />} />

                {/* Protected customer routes */}
                <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                <Route path="/account/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/account/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                <Route path="/p/:slug" element={<DynamicPage />} />
              </Route>

              {/* Auth routes */}
              <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
              <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />

              {/* Admin routes */}
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  )
}
