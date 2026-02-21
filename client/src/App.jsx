import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import BrowsePage from "./pages/BrowsePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminRoute from "./components/AdminRoute";
import VendorLayout from "./layouts/VendorLayout";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorProducts from "./pages/vendor/VendorProducts";
import VendorRoute from "./components/VendorRoute";
import UserRoute from "./components/UserRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <UserRoute>
              <HomePage />
            </UserRoute>
          }
        />
        <Route
          path="/browse/:section"
          element={
            <UserRoute>
              <BrowsePage />
            </UserRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <UserRoute>
              <ProductDetailPage />
            </UserRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <UserRoute>
              <CartPage />
            </UserRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <UserRoute>
              <CheckoutPage />
            </UserRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <UserRoute>
              <OrdersPage />
            </UserRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="brands" element={<AdminBrands />} />
        </Route>
        <Route
          path="/vendor"
          element={
            <VendorRoute>
              <VendorLayout />
            </VendorRoute>
          }
        >
          <Route index element={<VendorDashboard />} />
          <Route path="products" element={<VendorProducts />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
