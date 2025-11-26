import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiMinus, FiTrash2, FiMoreVertical } from 'react-icons/fi';

import cartService from '../../services/cartService';

import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import OrderSummary from "../../components/order/OrderSummary";
import CartItem from "../../components/cart/CartItem";


export default function ShoppingCart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  // --- Load Cart Items ---

  useEffect(() => {
    setLoading(true);
    const loadCartItems = async () => {
      try {
        const cartItems = await cartService.getCartItems();
        setItems(Array.isArray(cartItems) ? cartItems : (cartItems?.items || []));
      } catch (e) {
        console.error('Failed to load cart items:', e);
      } finally {
        setLoading(false);
      }
    };
    loadCartItems();
  }, []);
  
  // --- State Handlers ---
  const handleUpdateQuantity = (id, delta) => {
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const handleRemoveItem = (id) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  // --- Calculations ---
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div>
        <Header />
        <div className="min-h-screen bg-white text-primary p-4 md:p-10">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-black mb-6">Your Shopping Cart</h1>

            {loading ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="animate-pulse space-y-4">
                  <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
                <p className="mt-4 text-gray-500">Loading your cart…</p>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row lg:gap-8">
                {/* Left Column: Cart Items */}
                <div className="grow lg:w-2/3">
                  {/* Search Bar */}
                  <div className="relative mb-6">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <FiSearch className="text-gray-500" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search cart items by name, color, or size..."
                      className="w-full bg-white border border-gray-700 text-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>

                  {/* Items List */}
                  <div className="space-y-4">
                    {items.map(item => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemove={handleRemoveItem}
                      />
                    ))}
                  </div>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:w-1/3 mt-8 lg:mt-0">
                  <OrderSummary subtotal={subtotal} />
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
    </div>
  );
}