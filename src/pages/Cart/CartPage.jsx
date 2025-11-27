import React, { useState, useEffect, useMemo } from 'react';
import { FiSearch } from 'react-icons/fi';

import cartService from '../../services/cartService';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import OrderSummary from "../../components/order/OrderSummary";
import CartItem from "../../components/cart/CartItem";

export default function ShoppingCart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  // --- Search Logic ---
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const lowerQuery = searchQuery.toLowerCase();
    return items.filter(item => 
      (item.name && item.name.toLowerCase().includes(lowerQuery)) ||
      (item.color && item.color.toLowerCase().includes(lowerQuery)) ||
      (item.barcode && item.barcode.toLowerCase().includes(lowerQuery))
    );
  }, [items, searchQuery]);

  // --- Handlers ---

  const handleRemoveItem = async (id) => {
    const itemToRemove = items.find(item => item.id === id);
    if (!itemToRemove) return;

    // Optimistic UI Update
    setItems(currentItems => currentItems.filter(item => item.id !== id));

    try {
      await cartService.removeItem(itemToRemove.barcode, itemToRemove.color);
    } catch (error) {
      console.error('Failed to remove item from DB', error);
      // Optional: Revert state if API fails
    }
  };

  // --- UPDATED: Immediate Update (No Debounce) ---
  const handleUpdateQuantity = async (id, delta) => {
    const itemToUpdate = items.find(i => i.id === id);
    if (!itemToUpdate) return;

    // 1. Calculate the new quantity
    const newQuantity = Math.max(1, itemToUpdate.quantity + delta);

    // 2. Optimistic UI Update (Update screen immediately)
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );

    // 3. Call API Immediately
    // This assumes you set up the 'updateItem' (PUT) service in the previous step
    try {
        await cartService.updateItem(itemToUpdate.barcode, itemToUpdate.color, newQuantity);
        // console.log('Synced:', newQuantity);
    } catch (error) {
        console.error('Failed to update quantity in DB', error);
        // Optional: Revert UI to previous quantity if specific error handling is needed
    }
  };

  // --- Calculations ---
  const subtotal = items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);

  return (
    <div>
        <Header />
        <div className="min-h-screen bg-white text-primary p-4 md:p-10">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-black mb-6">Your Shopping Cart</h1>

            {loading ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <p className="mt-4 text-gray-500">Loading your cart…</p>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row lg:gap-8">
                <div className="grow lg:w-2/3">
                  
                  {/* Search Bar */}
                  <div className="relative mb-6">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <FiSearch className="text-gray-500" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search cart items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-gray-700 text-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>

                  {/* Items List */}
                  <div className="space-y-4">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            {searchQuery ? "No items match your search." : "Your cart is empty."}
                        </div>
                    ) : (
                        filteredItems.map(item => (
                        <CartItem
                            key={item.id}
                            item={item}
                            onUpdateQuantity={handleUpdateQuantity}
                            onRemove={handleRemoveItem}
                        />
                        ))
                    )}
                  </div>
                </div>

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