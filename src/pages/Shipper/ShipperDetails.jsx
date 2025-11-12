/*
File: src/pages/Shipper/ShipperDetails.jsx
This file is updated to use 'react-icons' instead of '@heroicons'.
*/

import React, { useState } from 'react';
// OLD IMPORT: import { TruckIcon } from "@heroicons/react/24/outline";
// NEW IMPORT: Use FaTruck from react-icons/fa
import { FaTruck } from 'react-icons/fa';

export default function ShipperDetails() {
  // Use React Hooks (useState) to manage form data
  const [shipperId, setShipperId] = useState('SHP001');
  const [licensePlate, setLicensePlate] = useState('51F-11345');
  const [companyName, setCompanyName] = useState('Giaohangnhanh');

  const handleSave = () => {
    // Logic to call sp_InsertShipper or sp_UpdateShipper
    // This is where you connect to your API/backend
    console.log('Saving:', { shipperId, licensePlate, companyName });
  };

  const handleDelete = () => {
    // Logic to call sp_DeleteShipper
    console.log('Deleting:', shipperId);
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      
      {/* 1. Header Card (from image) */}
      <div className="p-6 bg-white shadow rounded-lg mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Shipper Details</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage shipper information, vehicle data, and delivery company.
          </p>
        </div>
        <div className="p-4 bg-blue-100 rounded-lg">
          {/* COMPONENT CHANGE: Use FaTruck instead of TruckIcon */}
          <FaTruck className="h-12 w-12 text-[var(--color-primary)]" />
        </div>
      </div>

      {/* 2. Form (Corrected from image 1.jpg) */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Shipper Information</h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* UserID Field */}
          <div>
            <label htmlFor="shipperId" className="block text-sm font-medium text-gray-700">
              Shipper ID
            </label>
            <input
              type="text"
              id="shipperId"
              value={shipperId}
              onChange={(e) => setShipperId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm text-gray-900"
              placeholder="e.g., SHP001"
            />
          </div>

          {/* License Plate Field */}
          <div>
            <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">
              License Plate
            </label>
            <input
              type="text"
              id="licensePlate"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm text-gray-900"
              placeholder="e.g., 51F-11345"
            />
          </div>

          {/* Company Name Field */}
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm text-gray-900"
              placeholder="e.g., Giaohangnhanh"
            />
          </div>
        </div>

        {/* 3. Action Buttons (Footer of the form) */}
        <div className="p-6 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
          >
            Delete Shipper
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-[var(--color-primary)] border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[var(--color-secondary)] focus:outline-none"
          >
            Save Shipper
          </button>
        </div>
      </div>
    </div>
  );
}