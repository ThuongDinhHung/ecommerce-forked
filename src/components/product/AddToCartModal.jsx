import React, { useState, useEffect } from 'react';
import StockStatus from '../cart/StockStatus'; // Assuming this component exists

const AddToCartModal = ({ product, isOpen, onClose, onAddToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Reset state when product changes
  useEffect(() => {
    if (product?.variants?.length > 0) {
      const firstVariant = product.variants[0];
      setSelectedVariant(firstVariant);
      setSelectedColor(firstVariant.color);
      setSelectedSize(firstVariant.size);
      setQuantity(1);
    } else {
      setSelectedVariant(null);
      setSelectedColor(null);
      setSelectedSize(null);
      setQuantity(1);
    }
  }, [product]);

  // Update selected variant when color or size changes
  useEffect(() => {
    if (product && selectedColor && selectedSize) {
      const variant = product.variants.find(
        v => v.color === selectedColor && v.size === selectedSize
      );
      setSelectedVariant(variant || null);
      setQuantity(1); // Reset quantity
    }
  }, [selectedColor, selectedSize, product]);

  if (!isOpen || !product) {
    return null;
  }

  const availableColors = [...new Set(product.variants.map(v => v.color).filter(Boolean))];
  const availableSizes = [...new Set(product.variants.map(v => v.size).filter(Boolean))];

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    const stock = selectedVariant ? selectedVariant.stock : product.stock;
    if (newQuantity >= 1 && newQuantity <= stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      ...selectedVariant,
      quantity,
    };
    onAddToCart(cartItem);
    onClose();
  };

  const price = selectedVariant ? selectedVariant.price : product.price_per_day;
  const stock = selectedVariant ? selectedVariant.stock : product.stock;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center p-4 sm:p-0 z-50">
      <div className="modal-content bg-background-light dark:bg-zinc-900 rounded-t-lg sm:rounded-lg w-full max-w-lg shadow-xl flex flex-col overflow-hidden" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add to Cart</h2>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-4">
          {/* Product Info */}
          <div className="flex items-start space-x-4">
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
              <img alt={product.name} className="w-full h-full object-cover" src={product.images[0]} />
            </div>
            <div className="pt-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{product.name}</h3>
              <div className="flex items-baseline space-x-3 mt-1">
                <span className="text-xl font-bold text-primary">${price}</span>
              </div>
              <StockStatus stock={stock} />
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-zinc-700"></div>

          {/* Color Options */}
          {availableColors.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">Color</h3>
              <div className="flex flex-wrap gap-3">
                {availableColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full ring-2 ring-offset-2 dark:ring-offset-zinc-900 transition ${selectedColor === color ? 'ring-primary' : 'ring-transparent'}`}
                    style={{ backgroundColor: color.toLowerCase() }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Options */}
          {availableSizes.length > 0 && (
            <div className="border-t border-gray-200 dark:border-zinc-700 pt-4 mt-4">
              <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-sm rounded border ${selectedSize === size ? 'border-primary text-primary bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-zinc-600 hover:border-primary hover:text-primary dark:hover:border-primary'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 bg-white dark:bg-zinc-900/50 border-t border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Quantity</h3>
            <div className="flex items-center border border-gray-200 dark:border-zinc-700 rounded">
              <button onClick={() => handleQuantityChange(-1)} className="px-3 py-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800">
                <span className="material-icons text-xl">remove</span>
              </button>
              <span className="px-4 py-1 text-lg font-medium text-gray-900 dark:text-gray-100">{quantity}</span>
              <button onClick={() => handleQuantityChange(1)} className="px-3 py-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800">
                <span className="material-icons text-xl">add</span>
              </button>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock < 1}
            className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;
