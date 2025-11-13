import { Route, Routes } from 'react-router-dom'
/**********   ADD PAGE ROUTE HERE   **********/
import PrivateStorage from './pages/Resource/PrivateStorage'
import ShoppingCart from './pages/CartPage'
import ShipperDetails from './pages/Shipper/ShipperDetails';
import SellerProductReport from './pages/Seller/SellerProductReport';
import HomePage from './pages/Home/HomePage';
import Promotion from './pages/promotion/Promotion';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage/>} />
      <Route path="/about" element={<h1>About Page</h1>} />
      <Route path="/cart" element={<ShoppingCart/>} />
      <Route path="/shipper-details" element={<ShipperDetails />} />
      <Route path="/seller-report" element={<SellerProductReport />} />
      <Route path="/promotion" element={<Promotion />} />
    </Routes>
  )
}

export default App
