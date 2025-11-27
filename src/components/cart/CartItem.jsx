import React from 'react';
import { FiPlus, FiMinus, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import StockStatus from "./StockStatus";

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();

  // Helper to format currency to Vietnamese Dong (e.g., 10.000 đ)
  const formatPrice = (val) => {
    const n = Math.round(Number(val) || 0);
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded-lg shadow-md gap-4 md:gap-6">
      
      {/* --- Column 1: Product Info --- */}
      <div className="flex items-center w-full md:grow">
        <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover mr-4 shrink-0" />
        <div className="grow">
          <h3 className="text-black font-semibold">{item.name}</h3>
          
          {/* Currency Change: Use formatPrice */}
          <p className="text-gray-500 text-sm">Price: {formatPrice(item.price)}</p>
          
          <StockStatus status={isExpired ? 'expired' : item.stockStatus} count={item.stockCount} />
          
          {/* Mobile View: Variant Display */}
          <p className="text-gray-500 text-sm md:hidden mt-1">
            Variant: {item.color}
          </p>
        </div>
      </div>

      {/* --- Column 2: Details (Desktop) --- */}
      <div className="hidden md:block text-sm text-gray-500 shrink-0 md:w-36">
        {/* Variant Field Merge: Replaced Size & Color with just 'Variant' */}
        <p>Variant: {item.color}</p>
        
        {item.expiryDate && !isExpired && <p>Exp. Date: {item.expiryDate}</p>}
      </div>
      
      {/* --- Column 3: Price, Quantity, & Actions --- */}
      <div className="flex items-center justify-between md:justify-end w-full md:w-auto shrink-0 md:gap-6">
        
        {/* Total Price: Formatted with đ */}
        <p className="text-black font-semibold text-lg md:w-24 md:text-right">
          {formatPrice(item.price * item.quantity)}
        </p>
        
        {/* Quantity Selector */}
        <div className="flex items-center bg-white border-2 border-border-primary rounded-full shrink-0">
          <button
            onClick={() => onUpdateQuantity(item.id, -1)}
            disabled={item.quantity === 1}
            className="p-1.5 rounded-full text-black hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiMinus size={16} />
          </button>
          <span className="px-4 text-black font-medium">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, 1)}
            className="p-1.5 rounded-full text-black hover:bg-primary-light"
          >
            <FiPlus size={16} />
          </button>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2 md:w-16 justify-end">
          <button onClick={() => onRemove(item.id)} className="text-red-500 hover:text-red-400">
            <FiTrash2 size={20} />
          </button>
          <button className="text-gray-500 hover:text-gray-300">
            <FiMoreVertical size={20} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default CartItem;