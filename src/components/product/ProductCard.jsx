import React from 'react';
import { useNavigate } from 'react-router-dom';
import StarRating from '../review/StarRating';

const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const priceAsNumber = parseFloat(product.price_per_day);
  const finalPriceAsNumber = product.sale_percentage
    ? priceAsNumber * (1 - product.sale_percentage / 100)
    : priceAsNumber;

  const handleCardClick = () => {
    navigate(`/product/${product.product_id}`);
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation(); // Prevent navigation when clicking the button
    onAddToCart(product);
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md overflow-hidden group transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
      <div onClick={handleCardClick} className="cursor-pointer">
        <div className="aspect-square bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
          <img
            alt={product.name}
            className="h-full w-full object-cover"
            src={product.images[0] || 'https://via.placeholder.com/300'}
          />
        </div>
        <div className="p-4">
          <h3 className="font-medium text-zinc-800 dark:text-zinc-100 truncate">{product.name}</h3>
           <div className="py-1"><StarRating /></div>
          <p className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
            ${finalPriceAsNumber.toFixed(2)}
            {product.sale_percentage > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through ml-2">
                ${priceAsNumber.toFixed(2)}
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="p-4 pt-0 mt-auto">
        <button
          onClick={handleAddToCartClick}
          className="w-full bg-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;