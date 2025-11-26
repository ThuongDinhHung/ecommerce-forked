// reviewService.js
// Centralized API calls for the Review module

const handleResponse = async (res) => {
  const text = await res.text().catch(() => '');
  try {
    const json = text ? JSON.parse(text) : null;
    return { ok: res.ok, status: res.status, body: json };
  } catch {
    return { ok: res.ok, status: res.status, body: text };
  }
};

// Helper chuẩn hóa dữ liệu Review
const normalizeReview = (r) => ({
  id: r.id ?? r._id ?? r.ReviewID ?? r.ID ?? null,
  rating: Number(r.rating ?? r.Rating ?? r.Rate ?? 5),
  content: r.content ?? r.Content ?? r.Description ?? r.text ?? '', // Ưu tiên Content/Description
  username: r.username ?? r.AuthorName ?? r.author ?? r.user ?? 'Người dùng',
  avatar: r.avatar ?? null, // Nếu API trả về avatar
  date: r.createdAt ?? r.ReviewDate ?? r.date ?? r.Time ?? null,
  helpfulCount: Number(r.helpfulCount ?? r.helpful ?? r.TotalReactions ?? 0),
  // Map replies nếu có (quan trọng cho UI lồng nhau)
  replies: Array.isArray(r.replies) ? r.replies.map(reply => ({
      id: reply.id ?? reply.ReviewID,
      username: reply.username ?? reply.AuthorName,
      content: reply.content ?? reply.Description,
      date: reply.date ?? reply.Time,
      avatar: reply.avatar ?? null
  })) : [],
  media: Array.isArray(r.media) ? r.media : (r.images ?? r.photos ?? []),
  myReaction: r.myReaction ?? null, // Reaction của user hiện tại (nếu có)
  raw: r,
});

// 1. Lấy danh sách Review theo Product ID
export async function getReviews(productId) {
  // Gọi endpoint: /api/reviews/:barcode
  const url = `/api/reviews/${encodeURIComponent(productId)}`;
  const res = await fetch(url, { credentials: 'include', cache: 'no-cache' });
  const out = await handleResponse(res);
  if (!out.ok) throw new Error(out.body?.message || `Failed to load reviews (${out.status})`);
  
  // Xử lý format { success: true, data: [...] } hoặc mảng trực tiếp
  const data = Array.isArray(out.body) ? out.body : (out.body?.data ?? out.body?.reviews ?? []);
  return data.map(normalizeReview);
}

// 2. Tạo Review mới
export async function createReview({ orderId, orderItemId, rating, content }) {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, orderItemId, rating, content }),
  });
  const out = await handleResponse(res);
  if (!out.ok) throw new Error(out.body?.message || `Failed to create review (${out.status})`);
  const created = out.body?.data || out.body;
  return normalizeReview(created);
}

// 3. (Optional) Mark Helpful - Có thể bỏ qua nếu dùng upsertReaction
export async function markHelpful(reviewId) {
  // ... giữ nguyên nếu cần backward compatibility
  return upsertReaction(reviewId, 'like');
}

// 4. Thả cảm xúc (Like, Love, Haha...)
export async function upsertReaction(reviewId, type) {
  // Endpoint chuẩn: /api/reviews/:id/reactions
  const res = await fetch(`/api/reviews/${encodeURIComponent(reviewId)}/reactions`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type }),
  });
  const out = await handleResponse(res);
  if (!out.ok) throw new Error(out.body?.message || `Failed to upsert reaction (${out.status})`);
  
  // Trả về review đã update để UI render lại
  const body = out.body;
  if (body && body.data) return normalizeReview(body.data); // Format chuẩn
  if (body && body.review) return normalizeReview(body.review);
  return null;
}

// 5. Lấy danh sách hàng chờ đánh giá (My Purchases)
export async function getPurchasesForReview() {
  const endpoints = ['/api/reviews/me/purchased', '/api/reviews/purchased'];
  
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, { credentials: 'include', cache: 'no-cache' });
      if (!res.ok) continue;
      const out = await handleResponse(res);
      const list = Array.isArray(out.body) ? out.body : (out.body?.data ?? out.body?.items ?? []);
      
      return list.map((it) => ({
        id: String(it.orderItemId ?? it.Order_ItemID ?? `item-${it.productId}`),
        orderId: String(it.orderId ?? it.OrderID ?? ''),
        orderItemId: String(it.orderItemId ?? it.Order_ItemID ?? ''),
        productId: String(it.productId ?? it.ProductID ?? ''),
        name: it.productName ?? it.ProductName ?? it.name,
        image: it.productImage ?? it.ProductImage ?? null,
        variant: it.variationName ?? it.VariationName ?? ''
      }));
    } catch { /* try next */ }
  }
  return [];
}

// 6. [UPDATED] Lấy danh sách tất cả sản phẩm (Gọi qua Review Module)
export async function getAllProducts() {
    // Đổi endpoint trỏ về Review Module
    const endpoints = ['/api/reviews/products']; 

    for (const ep of endpoints) {
        try {
            const res = await fetch(ep, { credentials: 'include' });
            if (!res.ok) continue;
            
            const out = await handleResponse(res);
            const list = Array.isArray(out.body) ? out.body : (out.body?.data ?? []);

            return list.map(p => ({
                product_id: p.ProductID ?? p.Bar_code,
                name: p.ProductName ?? p.Name,
                image: p.Thumbnail ?? p.IMAGE_URL ?? null
            }));
        } catch (e) {
            console.error(`Error fetching products from ${ep}:`, e);
        }
    }
    return [];
}

export default {
  getReviews,
  createReview,
  markHelpful,
  upsertReaction,
  getPurchasesForReview,
  getAllProducts, // Export thêm hàm này
};