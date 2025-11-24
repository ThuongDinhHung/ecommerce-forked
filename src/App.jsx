
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import ShoppingCart from './pages/CartPage';
import ShipperDetails from './pages/Shipper/ShipperDetails';
import SellerProductReport from './pages/Seller/SellerProductReport';
import LandingPage from './pages/Home/LandingPage';
import Promotion from './pages/promotion/Promotion';
import UserDetails from './pages/User/UserDetails';
import LoginPage from './pages/Login/LoginPage';
import ProductListingPage from './pages/Products/ProductListingPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>} />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <LandingPage />
        </ProtectedRoute>} />
      <Route path="/cart" element={
        <ProtectedRoute>
          <ShoppingCart />
        </ProtectedRoute>
      } />
      <Route path="/shipper-details" element={
        <ProtectedRoute>
          <ShipperDetails />
        </ProtectedRoute>
      } />
      <Route path="/seller-report" element={
        <ProtectedRoute>
          <SellerProductReport />
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
      <Route path="/products" element={
        <ProtectedRoute>
          <ProductListingPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App
