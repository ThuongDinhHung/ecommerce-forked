/*
File: src/pages/Seller/SellerProductReport.jsx
This file is updated to use 'react-icons' instead of '@heroicons'.
*/

import React, { useState } from 'react';
// OLD IMPORT: import { ChartBarIcon } from "@heroicons/react/24/outline";
// NEW IMPORT: Use FaChartBar from react-icons/fa
import { FaChartBar } from 'react-icons/fa';

export default function SellerProductReport() {
  // State for the input field and the report data
  const [sellerId, setSellerId] = useState('');
  const [products, setProducts] = useState([]); // This will hold the report data

  // This function calls the database (Function 2)
  const handleRunReport = () => {
    // In a real app, you would fetch this from your API:
    // fetch(`/api/reports/seller-products?sellerId=${sellerId}`)
    // For this demo, we use mock data based on our Function 2 logic.
    const mockData = [
      { barcode: 'SKU_BOOK_DB', name: 'Database Systems Book', price: 120000, category: 'Standard' },
      { barcode: 'SKU_TECH_LAP', name: 'Laptop 16in', price: 15000000, category: 'Premium' },
      { barcode: 'SKU_FOOD_COFFEE', name: 'Organic Coffee 1kg', price: 85000, category: 'Budget' },
      { barcode: 'SKU_TOOL_HAMMER', name: 'Hammer', price: 25000, category: 'Budget' },
      { barcode: 'SKU_FASH_SHOE_W', name: 'Running Shoes', price: 550000, category: 'Standard' },
    ];
    setProducts(mockData);
  };

  // Clear the input and the table
  const handleClear = () => {
    setSellerId('');
    setProducts([]);
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      
      {/* 1. Header Card (from image) */}
      <div className="p-6 bg-white shadow rounded-lg mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Seller Product Report</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and categorize all products listed by a specific seller.
          </p>
        </div>
        <div className="p-4 bg-blue-100 rounded-lg">
          {/* COMPONENT CHANGE: Use FaChartBar instead of ChartBarIcon */}
          <FaChartBar className="h-12 w-12 text-[var(--color-primary)]" />
        </div>
      </div>

      {/* 2. Search Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Seller</h2>
        <div className="flex space-x-3">
          <input
            type="text"
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            className="flex-grow block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
            placeholder="e.g., U_SEL001"
          />
          <button
            type="button"
            onClick={handleRunReport}
            className="px-4 py-2 bg-[var(--color-primary)] border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[var(--color-secondary)] focus:outline-none"
          >
            Run Report
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            Clear
          </button>
        </div>
      </div>

      {/* 3. Results Table (Data Grid) */}
      {products.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Products by Category</h2>
          </div>
          
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Category</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.barcode}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.barcode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.price.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {/* Conditional styling for the category tag */}
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.category === 'Premium' ? 'bg-purple-100 text-purple-800' :
                      product.category === 'Standard' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {product.category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}