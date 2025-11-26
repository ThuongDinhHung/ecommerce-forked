// Service – now only fetches all orders and client-side filters by status.
// Backend only exposes GET /api/orders (no query params for status).

const json = async (res) => { try { return await res.json(); } catch { return {}; } };

export async function getAllOrders() {
  const res = await fetch('/api/orders', {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await json(res);
  if (!res.ok) throw new Error(data?.message || 'Failed to load orders');
  return Array.isArray(data) ? data : (data.data || data.orders || []);
}

export async function claimOrder(orderId) {
  const res = await fetch(`/api/shipper/orders/${orderId}/claim`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await json(res);
  if (!res.ok) throw new Error(data?.message || 'Failed to claim order');
  return data;
}

export async function updateOrderStatus(orderId, status) {
  const res = await fetch(`/api/shipper/orders/${orderId}/status`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await json(res);
  if (!res.ok) throw new Error(data?.message || 'Failed to update status');
  return data;
}

export default {
  getAllOrders,
  claimOrder,
  updateOrderStatus,
};
