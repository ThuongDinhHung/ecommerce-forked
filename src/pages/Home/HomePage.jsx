// ...existing code...
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import ProductReviews from '../../components/product/ProductReviews';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('search')?.trim() || '';

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // load categories
  useEffect(() => {
    let mounted = true;
    fetch('/api/products/categories')
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((data) => {
        if (!mounted) return;
        // support payloads like { data: { categories: [...] } } or simple array
        const list = data?.data?.categories || data?.categories || data || [];
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.error('Failed to load categories', err);
      });
    return () => { mounted = false; };
  }, []);

  // load products: priority -> search query -> selected category -> all
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = '/api/products/all';
        if (query) {
            url = `/api/products/search?name=${encodeURIComponent(query)}`;
        } else if (selectedCategory) {
            // --- FIX: Change this line to match the new backend route ---
            url = `/api/products/category/${encodeURIComponent(selectedCategory)}`;
        }

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        // normalize response shapes
        const list = data?.data?.products || data?.products || data?.data || data || [];
        const normalized = (Array.isArray(list) ? list : []).map((p) => ({
          id: p.id ?? p.barcode ?? p.Bar_code ?? p.sku,
          barcode: p.barcode ?? p.Bar_code ?? p.id ?? p.sku,
          name: p.name ?? p.productName ?? p.productname ?? p.Name ?? p.title ?? 'Unnamed product',
          image: p.image ?? p.images?.[0] ?? p.IMAGE_URL ?? p.imageUrl ?? null,
          price: p.price ?? p.PRICE ?? p.cost ?? 0,
          rating: p.rating ?? p.avgRating ?? p.AvgRating ?? p.Avg_Rating ?? 0,
        }));
        setProducts(normalized);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
          setError('Failed to load products');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [query, selectedCategory]);

  const openProduct = (p) => {
    const code = p.barcode || p.id;
    if (code) navigate(`/product/${code}`);
  };

  const formatPrice = (val) => {
    const n = Math.round(Number(val) || 0);
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto p-6">
        <section className="mb-6">
          <div className="rounded-lg p-6 bg-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                {query ? `Search results for "${query}"` : selectedCategory ? selectedCategory : 'Discover products'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {query
                  ? `Results for "${query}". ${products.length} items.`
                  : selectedCategory
                  ? `${products.length} items in ${selectedCategory}.`
                  : `${products.length} products available.`}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setSelectedCategory(''); }}
                className="px-4 py-2 rounded-full bg-white border hover:shadow-sm"
              >
                All
              </button>
              <button
                onClick={() => { /* placeholder: could toggle sort/view */ }}
                className="px-4 py-2 rounded-full bg-white border hover:shadow-sm"
              >
                Toggle View
              </button>
            </div>
          </div>
        </section>

        {/* Categories row */}
        <section className="mb-6">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.length === 0 ? (
              <div className="text-sm text-gray-500">No categories</div>
            ) : (
              categories.map((cat) => {
                const active = cat === selectedCategory;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory((prev) => (prev === cat ? '' : cat))}
                    className={`flex-shrink-0 px-4 py-2 rounded-full border ${active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'} shadow-sm`}
                  >
                    {cat}
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Product grid */}
        <section>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse p-4 bg-white rounded-lg">
                  <div className="h-36 bg-gray-200 rounded-md mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {products.map((p) => (
                    <div
                    key={p.id || p.barcode}
                    className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md"
                    onClick={() => openProduct(p)}
                    >
                    <div className="h-44 bg-gray-100 flex items-center justify-center">
                        {p.image ? (
                        <img src={p.image} alt={p.name} className="max-h-40 object-contain" />
                        ) : (
                        <div className="text-gray-400 text-sm">No image</div>
                        )}
                    </div>
                    <div className="p-3">
                        <div className="font-medium text-sm text-gray-900 truncate">{p.name}</div>
                        <div className="mt-1 flex items-center justify-between">
                        <div className="text-indigo-600 font-semibold">{formatPrice(p.price)}</div>
                        <div className="text-xs text-gray-500">{p.rating ? `${p.rating} ★` : '—'}</div>
                        </div>
                    </div>
                    </div>
                ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;