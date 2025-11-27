import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { FiChevronDown } from 'react-icons/fi';

import getCurrentUser from '../../services/userService';
import cartService from '../../services/cartService';
import paymentService from '../../services/paymentService';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  // We now show all cart items similar to cart page; no single selection
  const [selectedItemId, setSelectedItemId] = useState(null); // retained if future selection needed
  const [User, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState({});
  const [address, setAddress] = useState('');
  const [shippingMethod] = useState({ id: 'fast', name: 'Express (Fast)', cost: 16.5 });
  const [note, setNote] = useState('');
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const userData = await getCurrentUser();
        if (mounted && userData?.user) {
          setUser(userData.user);
          setUserInfo({ role: userData.userRole, phoneNumber: userData.phoneNumber });
          setAddress(userData.user.Address || '');
        }
        const cartData = await cartService.getCartItems();
        const itemsArr = Array.isArray(cartData) ? cartData : (cartData?.items || []);
        if (mounted) {
          setCartItems(itemsArr);
          if (itemsArr.length) setSelectedItemId(itemsArr[0].id);
        }
      } catch (e) {
        console.error('Checkout init error:', e);
        if (mounted) setErrorMsg('Failed to load user or cart data');
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Subtotal across all cart items
  const subtotal = cartItems.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0);
  const total = subtotal + shippingMethod.cost;

  const handlePlaceOrder = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!address) {
      setErrorMsg('Address is required.');
      return;
    }
    setCreating(true);
    try {
      if (!cartItems.length) {
        setErrorMsg('Cart is empty.');
        return;
      }
      // Filter items lacking required fields
      const validItems = cartItems.filter(it => it.barcode && it.color && Number.isFinite(Number(it.price)) && Number.isFinite(Number(it.quantity)));
      if (!validItems.length) {
        setErrorMsg('No valid items to create orders (missing barcode/color/price/quantity).');
        return;
      }
      const results = [];
      for (const it of validItems) {
        const payload = {
          address,
          status: 'Pending',
          quantity: parseInt(it.quantity, 10),
          price: Number(it.price),
          barcode: it.barcode,
          variationname: it.color
        };
        console.log('Creating order payload:', payload);
        try {
          const res = await paymentService.createOrder(payload);
          // Collect order ID from response (adjust field name if backend returns different key)
          const orderId = res?.order?.id || res?.id || null;
          results.push({ id: it.id, ok: true, orderId, message: res?.message || 'Created' });
        } catch (err) {
          console.error(`Order item failed: ${it.id} (${it.color})`, err);
          results.push({ id: it.id, ok: false, orderId: null, message: err.message || 'Failed' });
        }
      }
      const failures = results.filter(r => !r.ok);
      if (!failures.length) {
        setSuccessMsg(`Created ${results.length} order${results.length>1?'s':''}. Redirecting to payment...`);
        const orderIds = results.map(r => r.orderId).filter(Boolean);
        setTimeout(() => navigate('/payment', { state: { orderIds, total } }), 1200);
      } else if (failures.length === results.length) {
        setErrorMsg('All orders failed. Check item data or permissions.');
      } else {
        const orderIds = results.filter(r => r.ok).map(r => r.orderId).filter(Boolean);
        setErrorMsg(`Partial success: ${results.length - failures.length}/${results.length}. Failed IDs: ${failures.map(f=>f.id).join(', ')}. Redirecting with successful orders...`);
        setTimeout(() => navigate('/payment', { state: { orderIds, total } }), 1500);
      }
    } catch (e) {
      console.error('Create order failed:', e);
      setErrorMsg(e.message || 'Failed to create order');
    } finally {
      setCreating(false);
    }
  };

  console.log('CheckoutPage - User data:', User);
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto p-6 text-black">
        <h1 className="text-2xl font-bold mb-6 text-black">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Main column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Feedback banners */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded p-3 text-sm">
                {successMsg}
              </div>
            )}

            {/* Shipping address card */}
            <section className="bg-white rounded-md shadow p-4 text-black">
              <h2 className="font-semibold mb-3">Shipping Address</h2>
              <div className="space-y-2 text-sm">
                <div>Username: {User ? User.Username : ''}</div>
                <div>Phone: {userInfo ? userInfo.phoneNumber : ''}</div>
                <div>
                  <label className="block mb-1 font-medium">Address</label>
                  <input
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Enter delivery address"
                    className="w-full border rounded px-3 py-2 text-black text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Items list (all cart items with images) */}
            <section className="bg-white rounded-md shadow p-4">
              <h2 className="font-semibold mb-4">Cart Items</h2>
              <div className="space-y-4">
                {cartItems.length === 0 && (
                  <div className="text-sm text-gray-500">Cart is empty.</div>
                )}
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-4 items-center border rounded p-3">
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded object-cover" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-sm font-semibold">{(item.price || 0).toFixed(3)}₫</div>
                      </div>
                      <div className="text-xs text-black mt-1">Variation: {item.color || 'N/A'}</div>
                      <div className="text-xs text-black">Qty: {item.quantity}</div>
                      <div className="text-xs text-gray-500">Barcode: {item.barcode}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Shipping method */}
            <section className="bg-white rounded-md shadow p-4">
                <div className="flex items-center justify-between">
                <h2 className="font-semibold">Shipping Method</h2>
                <div className="text-sm text-black">Delivery estimate: <span className="font-medium">2-3 days</span></div>
              </div>
              <div className="mt-3">
                <label className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <div className="font-medium">{shippingMethod.name}</div>
                    <div className="text-xs text-black">Fast delivery to your address</div>
                  </div>
                  <div className="text-sm font-semibold">{shippingMethod.cost.toFixed(3)}₫</div>
                </label>
              </div>
            </section>

            {/* Note to seller */}
            <section className="bg-white rounded-md shadow p-4">
              <h2 className="font-semibold mb-2">Notes</h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note to the seller (optional)"
                className="w-full border rounded-md p-2 text-sm"
                rows={3}
              />
            </section>

          </div>

          {/* Right / Summary column */}
          <aside className="space-y-4">
            <div className="bg-white rounded-md shadow p-4">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="text-sm text-black space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">{subtotal.toFixed(3)}₫</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium">{shippingMethod.cost.toFixed(3)}₫</span>
                </div>
                <div className="flex justify-between border-t pt-3 mt-3">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg text-red-600">{total.toFixed(3)}₫</span>
                </div>
              </div>
              <button 
                onClick={handlePlaceOrder}
                disabled={creating}
                className={`mt-4 w-full bg-primary hover:bg-secondary text-white py-3 rounded-md font-semibold ${creating ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {creating ? 'Creating Order...' : 'Place Order'}
              </button>
            </div>

            <div className="bg-white rounded-md shadow p-4">
              <h4 className="font-semibold mb-2">Payment</h4>
              <div className="flex items-center justify-between text-sm text-black">
                <div>Card (charged after confirmation)</div>
                <FiChevronDown />
              </div>
            </div>
          </aside>

        </div>
      </main>

      <Footer />
    </div>
  );
}
