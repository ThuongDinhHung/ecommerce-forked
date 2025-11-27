// Payment-related API calls

const safeJson = async (res) => {
  try { return await res.json(); } catch { return {}; }
};

export async function createOrder(payload) {
  const res = await fetch('/api/orders', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await safeJson(res);
  if (!res.ok) {
    const msg = data?.message || 'Failed to create order';
    throw new Error(msg);
  }
  return data;
}

export default {
  createOrder,
};
