import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { LuChevronDown } from "react-icons/lu";
import sellerProductService from '../../services/sellerProductService';

const SellerDashboardPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedHasImages, setSelectedHasImages] = useState('');
  const [selectedStock, setSelectedStock] = useState('all');
  const [categories, setCategories] = useState([]);
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState(1);
  const [imageErrors, setImageErrors] = useState({}); // Track failed image loads
  const mountedRef = useRef(true);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    mountedRef.current = true;
    // Initial load
    fetchProducts();
    // fetch available categories for the filter dropdown
    (async () => {
      try {
        const res = await fetch('/api/categories', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data) ? data : (Array.isArray(data.categories) ? data.categories : []);
        setCategories(list);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mountedRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search: wait 400ms after typing stops
  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setOffset(0);
      setPage(1);
      fetchProducts({ search, offset: 0 });
    }, 400);
    return () => { if (searchRef.current) clearTimeout(searchRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Fetch products with abortable requests and robust mapping against DB column variants
  async function fetchProducts(opts = {}) {
    setLoading(true);
    setError(null);
    // Abort previous fetch if any (avoid race conditions on fast typing/pagination)
    const controller = new AbortController();
    const signal = controller.signal;
    // attach controller to ref so callers can cancel if needed
    if (searchRef.current && searchRef.current.abortController) {
      try { searchRef.current.abortController.abort(); } catch(e) {}
    }
    searchRef.current = { abortController: controller, timer: searchRef.current?.timer };

    try {
      const resp = await sellerProductService.listSellerProducts({
        limit,
        offset: opts.offset ?? offset,
        search: opts.search ?? search,
        category: opts.category ?? selectedCategory,
        hasImages: opts.hasImages ?? selectedHasImages,
        stock: opts.stock ?? selectedStock,
        signal, // service should pass this to fetch if implemented
      });

      // Backend may return { success: true, products: [...], total } or an array
      const list = Array.isArray(resp.products) ? resp.products : (Array.isArray(resp) ? resp : (resp.products || []));
      if (!mountedRef.current) return;

      // Map DB column variants to view model robustly. DB schema (DB_As2.sql) uses
      // Product_SKU with columns: Bar_code, Name, Manufacturing_date, Expired_date, Description, sellerID
      // But API could return different naming conventions (BarCode, Bar_code, Barcode, etc.).
      const mapped = list.map(p => {
        // Date fields: normalize safely — handle strings (YYYY-MM-DD), Date objects, or null
        const parseDate = (v) => {
          if (!v) return '';
          try {
            const d = new Date(v);
            if (isNaN(d.getTime())) return String(v).split('T')[0] || '';
            return d.toLocaleDateString();
          } catch (e) { return String(v).split('T')[0] || ''; }
        };
        return {
          Bar_code: p.Bar_code,
          Name: p.Name,
          Description: p.Description || '',
          IMAGE_URL: p.IMAGE_URL || null,
          images: p.images || [],
          Manufacturing_date: parseDate(p.Manufacturing_date) || null,
          Expired_date: parseDate(p.Expired_date) || null,
          variations: p.variations || [], 
          category: p.category || null,
        };
      });

      setProducts(mapped);
    } catch (err) {
      if (!mountedRef.current) return;
      // Handle aborts silently — user likely typed again
      if (err.name === 'AbortError') return;
      setError(err.message || 'Failed to load products');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  // Pagination helpers
  const handleNext = () => {
    setOffset(prev => {
      const next = prev + limit;
      setPage(p => p + 1);
      fetchProducts({ offset: next });
      return next;
    });
  };

  const handlePrev = () => {
    setOffset(prev => {
      const next = Math.max(0, prev - limit);
      setPage(p => Math.max(1, p - 1));
      fetchProducts({ offset: next });
      return next;
    });
  };

  // Handle image load errors (fallback to placeholder)
  const handleImageError = (barCode) => {
    setImageErrors(prev => ({ ...prev, [barCode]: true }));
  };

  // Get image URL with fallback
  const getProductImageUrl = (product) => {
    // If this image already failed to load, skip it
    if (imageErrors[product.Bar_code]) {
      return null; // Will display placeholder
    }
    // Try primary IMAGE_URL first, then first image from images array
    return product.IMAGE_URL || (product.images && product.images.length > 0 ? product.images[0] : null);
  };

  // Actions (edit/delete)
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This action cannot be undone.')) return;

    const prevProducts = products;
    // Optimistic UI update
    setProducts(prev => prev.filter(p => p.Bar_code !== id));
    setLoading(true);

    try {
      await sellerProductService.deleteSellerProduct(id); // returns 204 or {success: true}
      // Optionally show a toast / success message
    } catch (err) {
      // rollback optimistic removal
      setProducts(prevProducts);
      setError(err.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  // Fetch full product and navigate to Edit page (re-uses AddProductPage in edit mode)
  const handleEdit = async (id) => {
    setError(null);
    try {
      setLoading(true);
      const resp = await sellerProductService.getSellerProduct(id);
      // API returns { success: true, product } or product directly depending on server
      const product = resp?.product || resp;
      if (!product) throw new Error('Product not found');
      // Navigate to AddProductPage with product in location state for edit
      navigate('/seller/add-product', { state: { product } });
    } catch (err) {
      setError(err.message || 'Failed to load product for editing');
    } finally {
      setLoading(false);
    }
  };

  // View product details in read-only mode by re-using AddProductPage with viewOnly flag
  const handleView = async (id) => {
    setError(null);
    try {
      setLoading(true);
      const resp = await sellerProductService.getSellerProduct(id);
      const product = resp?.product || resp;
      if (!product) throw new Error('Product not found');
      navigate('/seller/add-product', { state: { product, viewOnly: true } });
    } catch (err) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  // Render
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r">
        <div className="p-4 border-b">
          <div className="flex items-center">
            <img src="https://via.placeholder.com/40" alt="Seller" className="w-10 h-10 rounded-full" />
            <div className="ml-3">
              <p className="font-semibold">BKBAY Seller</p>
              <p className="text-sm text-gray-500">seller@bkay.com</p>
            </div>
          </div>
        </div>
        <nav className="p-4">
          <ul>
            <li className="mb-2"><a href="#" className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded">Dashboard</a></li>
            <li className="mb-2"><a href="#" className="flex items-center p-2 text-blue-600 bg-blue-50 rounded">Products</a></li>
            <li className="mb-2">
              <button 
                onClick={() => navigate('/seller/orders')}
                className="w-full flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Orders
              </button>
            </li>
            <li className="mb-2"><a href="#" className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded">Analytics</a></li>
            <li className="mb-2"><a href="#" className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded">Settings</a></li>
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t">
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mb-3">View Storefront</button>
            <button 
              onClick={async () => {
                try {
                  await fetch('/api/users/logout', { method: 'POST', credentials: 'include' });
                  navigate('/login');
                } catch (error) {
                  console.error('Logout failed', error);
                }
              }}
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
            <div className="text-center mt-4">
                <a href="#" className="text-sm text-gray-600 hover:underline">Help & Support</a>
            </div>
        </div>
      </aside>

      <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
            <p className="text-gray-600 mt-1">Manage your product inventory and view sales performance.</p>
          </div>
          <button onClick={()=>navigate('/seller/add-product')} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
            <FiPlus className="mr-2" /> Add New Product
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="relative w-1/3">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Product Name or Barcode"
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setOffset(0); fetchProducts({ search: e.target.value, offset: 0 }); }}
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setOffset(0); fetchProducts({ category: e.target.value, offset: 0 }); }}
                  className="pl-4 pr-10 py-2 border rounded-lg bg-white shadow-sm text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <div className="relative">
                <select
                  value={selectedHasImages}
                  onChange={(e) => { setSelectedHasImages(e.target.value); setOffset(0); fetchProducts({ hasImages: e.target.value, offset: 0 }); }}
                  className="pl-4 pr-10 py-2 border rounded-lg bg-white shadow-sm text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Images</option>
                  <option value="with">With Images</option>
                  <option value="without">Without Images</option>
                </select>
                <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <div className="relative">
                <select
                  value={selectedStock}
                  onChange={(e) => { setSelectedStock(e.target.value); setOffset(0); fetchProducts({ stock: e.target.value, offset: 0 }); }}
                  className="pl-4 pr-10 py-2 border rounded-lg bg-white shadow-sm text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Stock</option>
                  <option value="in">In Stock</option>
                  <option value="out">Out of Stock</option>
                </select>
                <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left"><input type="checkbox" /></th>
                <th className="p-4 text-left font-medium text-gray-600">Product Name</th>
                <th className="p-4 text-left font-medium text-gray-600">Category</th>
                <th className="p-4 text-left font-medium text-gray-600">Description</th>
                <th className="p-4 text-left font-medium text-gray-600">Manufacturing Date</th>
                <th className="p-4 text-left font-medium text-gray-600">Expired Date</th>
                <th className="p-4 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-gray-500">Loading products...</td>
                </tr>
              )}
              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-gray-500">No products found.</td>
                </tr>
              )}
              {!loading && products.map((product) => (
                <tr key={product.Bar_code} className="border-b">
                  <td className="p-4"><input type="checkbox" /></td>
                  <td className="p-4">
                    <div className="flex items-center">
                      {getProductImageUrl(product) ? (
                        <img 
                          src={getProductImageUrl(product)} 
                          alt={product.Name} 
                          onError={() => handleImageError(product.Bar_code)}
                          className="w-10 h-10 rounded-md mr-4 object-cover" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md mr-4 bg-gray-200 flex items-center justify-center text-xs text-gray-400">
                          No Image
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{product.Name || 'Unnamed product'}</p>
                        <p className="text-sm text-gray-500">{product.Bar_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{product.category}</td>
                  <td className="p-4 text-gray-600 truncate max-w-xl">{product.Description}</td>
                  <td className="p-4 text-gray-600">{product.Manufacturing_date}</td>
                  <td className="p-4 text-gray-600">{product.Expired_date}</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(product.Bar_code)} className="text-gray-500 hover:text-blue-600" title="Edit"><FiEdit size={18} /></button>
                      <button onClick={() => handleView(product.Bar_code)} className="text-gray-500 hover:text-blue-600" title="View"><FiEye size={18} /></button>
                      <button onClick={() => handleDelete(product.Bar_code)} className="text-gray-500 hover:text-red-600" title="Delete"><FiTrash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">Showing {offset + 1} to {offset + products.length} results</p>
            <div className="flex space-x-2">
              <button onClick={handlePrev} disabled={offset === 0} className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50">&lt; Previous</button>
              <button onClick={handleNext} className="px-4 py-2 border rounded-lg hover:bg-gray-100">Next &gt;</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerDashboardPage;
