// src/services/sellerOrderService.js
// Service layer for seller order operations

const API_BASE = '/api/orders';

/**
 * List orders for the authenticated seller (only orders containing seller's products)
 * @param {object} params - Query parameters (limit, offset, status, search)
 * @returns {Promise<object>} Response with orders array
 */
export async function listSellerOrders(params = {}) {
  const { limit = 20, offset = 0, status, search, signal } = params;
  
  const queryParams = new URLSearchParams();
  queryParams.append('limit', limit);
  queryParams.append('offset', offset);
  if (status) queryParams.append('status', status);
  if (search) queryParams.append('search', search);

  const response = await fetch(`${API_BASE}/seller?${queryParams.toString()}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch orders' }));
    throw new Error(error.message || 'Failed to fetch seller orders');
  }

  return response.json();
}

/**
 * Update order status
 * @param {string} orderId - Order ID to update
 * @param {string} status - New status value
 * @returns {Promise<object>} Response with updated order
 */
export async function updateOrderStatus(orderId, status) {
  const response = await fetch(`${API_BASE}/${orderId}/status`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update order status' }));
    throw new Error(error.message || 'Failed to update order status');
  }

  return response.json();
}

/**
 * Get order details by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<object>} Order details
 */
export async function getOrderById(orderId) {
  const response = await fetch(`${API_BASE}/${orderId}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch order' }));
    throw new Error(error.message || 'Failed to fetch order');
  }

  return response.json();
}

export default {
  listSellerOrders,
  updateOrderStatus,
  getOrderById,
};
