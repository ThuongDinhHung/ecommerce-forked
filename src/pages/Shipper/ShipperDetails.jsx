/*
File: src/pages/Shipper/ShipperDetails.jsx
This file is updated to use 'react-icons' instead of '@heroicons'.
*/

import React, { useState, useEffect } from 'react';
// OLD IMPORT: import { TruckIcon } from "@heroicons/react/24/outline";
// NEW IMPORT: Use FaTruck from react-icons/fa
import { FaTruck } from 'react-icons/fa';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';

export default function ShipperDetails() {
  // Use React Hooks (useState) to manage form data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [shipperDetails, setShipperDetails] = useState(null);
  const [license, setLicense] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Fetch shipper details on mount
  useEffect(() => {
    let mounted = true;
    const fetchShipperDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/shipper/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch shipper details');
        }

        const data = await response.json();
        console.log('Shipper API Response:', data);
        
        if (mounted && data.success) {
          setUser(data.data.user);
          setShipperDetails(data.data.shipperDetails);
          console.log('License from API:', data.data.shipperDetails?.LicensePlate);
          setLicense(data.data.shipperDetails?.LicensePlate || '');
          setCompanyName(data.data.shipperDetails?.Company || '');
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Error loading shipper details');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchShipperDetails();
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    try {
      const response = await fetch('/api/shipper/me', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          license: license,
          company: companyName,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data?.message || data?.error || 'Failed to update shipper details';
        throw new Error(errorMsg);
      }

      if (data.success) {
        alert('Shipper details updated successfully');
        if (data.data && data.data.shipperDetails) {
          setShipperDetails(data.data.shipperDetails);
          setLicense(data.data.shipperDetails?.License || license);
          setCompanyName(data.data.shipperDetails?.Company || companyName);
        }
      }
    } catch (err) {
      console.error('Save error:', err);
      alert(err.message || 'Failed to save');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your shipper account?')) return;
    
    try {
      const response = await fetch('/api/shipper/me', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete shipper');
      }

      alert('Shipper deleted successfully');
      window.location.href = '/';
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto p-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading shipper details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto p-8">
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto p-8">
      
      {/* 1. Header Card (from image) */}
      <div className="p-6 bg-white shadow rounded-lg mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Shipper Details</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage shipper information, vehicle data, and delivery company.
          </p>
          {user && (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-500">
                User: {user.Username} ({user.Email})
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="p-4 bg-blue-100 rounded-lg">
            {/* COMPONENT CHANGE: Use FaTruck instead of TruckIcon */}
            <FaTruck className="h-12 w-12 text-primary" />
          </div>
          <button
            type="button"
            onClick={() => setIsEditing((prev) => !prev)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            {isEditing ? 'Close Edit' : 'Edit'}
          </button>
        </div>
      </div>

      {/* 2. Form (Corrected from image 1.jpg) */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Shipper Information</h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Shipper ID Field (Read-only) */}
          <div>
            <label htmlFor="shipperId" className="block text-sm font-medium text-gray-700">
              User ID
            </label>
            <input
              type="text"
              id="shipperId"
              value={user?.Id || ''}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm text-gray-900"
            />
          </div>

          {/* License Number Field */}
          <div>
            <label htmlFor="license" className="block text-sm font-medium text-gray-700">
              License Number
            </label>
            <input
              type="text"
              id="license"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              disabled={!isEditing}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm text-gray-900 ${
                isEditing ? 'border-gray-300 focus:outline-none focus:ring-primary focus:border-primary' : 'bg-gray-50 border-gray-200'
              }`}
            />
          </div>

          {/* Company Name Field */}
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <select
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={!isEditing}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm text-gray-900 ${
                isEditing ? 'border-gray-300 focus:outline-none focus:ring-primary focus:border-primary' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <option value="">Select Company</option>
              <option value="GRAB">GRAB</option>
              <option value="SHOPEE">SHOPEE</option>
              <option value="GIAOHANGNHANH">GIAOHANGNHANH</option>
              <option value="GIAOHANGTIETKIEM">GIAOHANGTIETKIEM</option>
            </select>
          </div>
        </div>

        {/* 3. Action Buttons (Footer of the form) */}
        <div className="p-6 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  // Reset values back to loaded shipperDetails
                  setLicense(shipperDetails?.License || shipperDetails?.LicensePlate || '');
                  setCompanyName(shipperDetails?.Company || '');
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleSave();
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-primary border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-secondary focus:outline-none"
              >
                Save Changes
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
    <Footer />
  </div>
  );
}