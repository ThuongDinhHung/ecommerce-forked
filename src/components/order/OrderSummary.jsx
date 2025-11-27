import React from 'react';
import { useNavigate } from "react-router-dom";

const OrderSummary = ({ subtotal }) => {
  const navigate = useNavigate();
  const shipping = 0; // Assuming free shipping for now, or calculate dynamically
  const taxRate = 0.08; // 8%
  const tax = subtotal * taxRate;
  const total = subtotal + shipping + tax;

  const formatPrice = (val) => {
    const n = Math.round(Number(val) || 0);
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md lg:sticky lg:top-10">
      <h2 className="text-xl font-semibold text-black mb-4">Order Summary</h2>
      
      <div className="space-y-3 text-gray-500">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="text-black">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span className="text-black">{formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
          <span className="text-black">{formatPrice(tax)}</span>
        </div>
      </div>
      
      <hr className="border-gray-700 my-4" />
      
      <div className="flex justify-between items-center text-lg font-bold text-black mb-6">
        <span>Total</span>
        <span className="text-red-600">{formatPrice(total)}</span>
      </div>
      
      <button className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => navigate('/checkout')}>
        Proceed to Checkout
      </button>
    </div>
  );
};

export default OrderSummary;