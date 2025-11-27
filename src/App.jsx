import { Route, Routes, Navigate } from 'react-router-dom'; // Thêm Navigate vào đây
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import ShoppingCart from './pages/Cart/CartPage';
import CheckoutPage from './pages/Cart/CheckoutPage';
import PaymentPage from './pages/Payment/PaymentPage';
import ShipperDetails from './pages/Shipper/ShipperDetails';
import ShipperOrders from './pages/Shipper/ShipperOrders';
import SellerProductReport from './pages/Seller/SellerProductReport';
import LandingPage from './pages/Home/LandingPage';
import Promotion from './pages/promotion/Promotion';
import UserDetails from './pages/User/UserDetails';
import HomePage from './pages/Home/HomePage';
import ProductReviews from './pages/Review/ProductReviews';
import SellerDashboardPage from './pages/Seller/SellerDashboardPage';
import AddProductPage from './pages/Seller/AddProductPage';
import ProfilePage from './pages/Login/ProfilePage';
import WriteReview from './pages/Review/WriteReview';
import LoginPage from './pages/Login/LoginPage';
import ProductListingPage from './pages/Products/ProductListingPage';
import OrderDashboardPage from './pages/Seller/OrderDashboardPage';
function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>} 
      />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <LandingPage />
        </ProtectedRoute>} 
      />
      
      <Route path="/home" element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>} 
      />

      <Route path="/cart" element={
        <ProtectedRoute>
          <ShoppingCart />
        </ProtectedRoute>
      } />

      <Route path="/checkout" element={
        <ProtectedRoute>
          <CheckoutPage />
        </ProtectedRoute>
      } />

      <Route path="/payment" element={
        <ProtectedRoute>
          <PaymentPage />
        </ProtectedRoute>
      } />

      <Route path="/shipper-details" element={
        <ProtectedRoute>
          <ShipperDetails />
        </ProtectedRoute>
      } />
      <Route path="/shipper/orders" element={
        <ProtectedRoute>
          <ShipperOrders />
        </ProtectedRoute>
      } />

      <Route path="/seller-report" element={
        <ProtectedRoute>
          <SellerProductReport />
        </ProtectedRoute>
      } />

      <Route path="/seller/seller-dashboard" element={
        <ProtectedRoute>
          <SellerDashboardPage />
        </ProtectedRoute>
      } />

      <Route path="/seller" element={<Navigate to="/seller/seller-dashboard" replace />} />

      <Route path="/seller/orders" element={
        <ProtectedRoute>
          <OrderDashboardPage />
        </ProtectedRoute>
      } />

      <Route path="/seller/add-product" element={
        <ProtectedRoute>
          <AddProductPage />
        </ProtectedRoute>
      } />

      <Route path="/promotion" element={
        <ProtectedRoute>
          <Promotion />
        </ProtectedRoute>
      } />

      <Route path="/user" element={
        <ProtectedRoute>
          <UserDetails />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      
      <Route path="/product/:barcode" element={
        <ProtectedRoute>
          <ProductListingPage />
        </ProtectedRoute>
      } />

      {/* Reviews Routes */}
      <Route path="/product/:productId/reviews" element={
        <ProtectedRoute>
          <ProductReviews />
        </ProtectedRoute>
      } />

      <Route path="/write-review" element={
        <ProtectedRoute>
          <WriteReview />
        </ProtectedRoute>
      } />

      <Route path="product/review" element={
        <ProtectedRoute>
          <ProductReviews />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;