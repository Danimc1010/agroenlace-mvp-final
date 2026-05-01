import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Public pages
import LandingPage from './pages/LandingPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import TraceabilityPage from './pages/TraceabilityPage';
import { CatalogPage, ProductDetailPage } from './pages/CatalogPages';

// Dashboard
import { DashboardPage } from './pages/DashboardPage';

// Buyer pages
import { CartPage, CheckoutPage, PaymentPage } from './pages/CartPages';
import { MyOrdersPage, OrderDetailPage } from './pages/OrderPages';

// Producer pages
import { MyProductsPage, CreateProductPage, EditProductPage, OfflineProductsPage } from './pages/ProducerPages';
import ProducerOrdersPage from './pages/ProducerOrdersPage';

// Admin pages
import { PendingOrdersPage, GenerateRoutePage, RoutesListPage, RouteDetailPage } from './pages/AdminPages';

// Route guards
import { ProtectedRoute, RoleRoute } from './components/ProtectedRoute';

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <DashboardPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/traceability" element={<TraceabilityPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/catalog/:id" element={<ProductDetailPage />} />

            {/* Dashboard (role-aware) */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

            {/* Buyer routes */}
            <Route path="/cart" element={<RoleRoute roles={['COMPRADOR']}><CartPage /></RoleRoute>} />
            <Route path="/checkout" element={<RoleRoute roles={['COMPRADOR']}><CheckoutPage /></RoleRoute>} />
            <Route path="/payment/:id" element={<RoleRoute roles={['COMPRADOR']}><PaymentPage /></RoleRoute>} />
            <Route path="/buyer/orders" element={<RoleRoute roles={['COMPRADOR']}><MyOrdersPage /></RoleRoute>} />
            <Route path="/buyer/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />

            {/* Producer routes */}
            <Route path="/producer/products" element={<RoleRoute roles={['PRODUCTOR']}><MyProductsPage /></RoleRoute>} />
            <Route path="/producer/create-product" element={<RoleRoute roles={['PRODUCTOR']}><CreateProductPage /></RoleRoute>} />
            <Route path="/producer/edit-product/:id" element={<RoleRoute roles={['PRODUCTOR']}><EditProductPage /></RoleRoute>} />
            <Route path="/producer/offline" element={<RoleRoute roles={['PRODUCTOR']}><OfflineProductsPage /></RoleRoute>} />
            <Route path="/producer/orders" element={<RoleRoute roles={['PRODUCTOR']}><ProducerOrdersPage /></RoleRoute>} />

            {/* Admin routes */}
            <Route path="/admin/pending-orders" element={<RoleRoute roles={['ADMIN_LOGISTICO']}><PendingOrdersPage /></RoleRoute>} />
            <Route path="/admin/generate-route" element={<RoleRoute roles={['ADMIN_LOGISTICO']}><GenerateRoutePage /></RoleRoute>} />
            <Route path="/admin/routes" element={<RoleRoute roles={['ADMIN_LOGISTICO']}><RoutesListPage /></RoleRoute>} />
            <Route path="/admin/routes/:id" element={<RoleRoute roles={['ADMIN_LOGISTICO']}><RouteDetailPage /></RoleRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
