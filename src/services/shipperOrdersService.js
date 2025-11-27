// Service – use GET /api/orders/details with status filter (ignore minItems per requirement)

const json = async (res) => { try { return await res.json(); } catch { return {}; } };

export async function getOrdersByStatus(status) {
  const url = status ? `/api/orders/details?status=${encodeURIComponent(status)}` : '/api/orders/details';
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await json(res);
  if (!res.ok) throw new Error(data?.message || 'Failed to load orders');
  return Array.isArray(data) ? data : (data.data || data.orders || []);
}

export async function getOrdersByStatuses(statuses = []) {
  if (!Array.isArray(statuses) || statuses.length === 0) return [];
  const results = await Promise.all(statuses.map(s => getOrdersByStatus(s).catch(() => [])));
  return results.flat();
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
  getOrdersByStatus,
  getOrdersByStatuses,
  claimOrder,
  updateOrderStatus,
};
