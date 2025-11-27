import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiUpload, FiSearch, FiHeart, FiShoppingCart, FiUser } from 'react-icons/fi';
import UploadImages from '../../components/UploadImages';

const AddProductPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize state (supports simple edit mode if `location.state.product` is passed)
  const initial = location?.state?.product || {};
  const barCode = initial?.Bar_code || ''; // Extract barCode for edit mode
  const [productName, setProductName] = useState(initial.Name || '');
  const [description, setDescription] = useState(initial.Description || '');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [availableStock, setAvailableStock] = useState('');
  const [availableSizes, setAvailableSizes] = useState('');
  const [availableColors, setAvailableColors] = useState('');
  // Variants: each variant will have a name (e.g. "Red-L"), price and stock.
  // This maps to the VARIATIONS table (Bar_code, NAME, PRICE) and we add stock as well.
  const [variants, setVariants] = useState(() => {
    // Initialize from API `variations` (DB field) if provided by edit flow
    const v = initial?.variations || [];
    return Array.isArray(v) && v.length ? v.map(x => ({
      name: x.NAME || '',
      price: x.PRICE ?? '',
      stock: x.STOCK ?? 0,
    })) : [{ name: '', price: '', stock: 0 }];
  });
  // Categories for Belongs_to table selection
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initial?.category || '');
  const [manufacturingDate, setManufacturingDate] = useState('');
  const [expiredDate, setExpiredDate] = useState('');
  // Selected image files are kept locally but AddProductPage will NOT upload them.
  // Uploading is intentionally left to the parent/integration layer.
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const isEdit = Boolean(initial && Object.keys(initial).length > 0);
  const saveLabel = isEdit ? 'Update Product' : 'Add Product';
  const viewOnly = Boolean(location?.state?.viewOnly);

  useEffect(() => {
    if (initial && Object.keys(initial).length > 0) {
      setProductName(initial.Name || '');
      setDescription(initial.Description || '');
      setManufacturingDate(initial.Manufacturing_date ? initial.Manufacturing_date.split('T')[0] : '');
      setExpiredDate(initial.Expired_date ? initial.Expired_date.split('T')[0] : '');
      setVariants(prev => {
        if (Array.isArray(initial?.variations) && initial.variations.length) {
          return initial.variations.map(x => ({ name: x.NAME || '', price: x.PRICE ?? '', stock: x.STOCK ?? 0 }));
        }
        return prev;
      });
      setSelectedCategory(initial.category || selectedCategory);
      // If editing/viewing and product has images from API, keep selectedFiles empty (images come from API)
      if (Array.isArray(initial.images) && initial.images.length) {
        setSelectedFiles([]);
      }
    }
  }, [initial]);

  // Load category options for Belongs_to selection on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/categories', { credentials: 'include' });
        if (!mounted) return;
        if (!res.ok) return; // silent fail: categories optional
        const data = await res.json();
        // Expecting an array of categories or { categories: [...] }
        const list = Array.isArray(data) ? data : (Array.isArray(data.categories) ? data.categories : []);
        setCategories(list);
      } catch (e) {
        // ignore failures - category dropdown is a progressive enhancement
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Note: previews are handled inside the `UploadImages` UI component.

  const handleCancel = () => {
    navigate('/seller/seller-dashboard');
  };

  const handleSave = async () => {
    setSuccessMessage('');
    setErrorMessage('');
    // Basic validation
    if (!productName) {
      setErrorMessage('Please provide at least a Product Name.');
      return;
    }
    // Validate variants: at least one variant, each with name and numeric price
    if (!Array.isArray(variants) || variants.length === 0) {
      setErrorMessage('Please add at least one variant with price and stock.');
      return;
    }
    for (const v of variants) {
      if (!v.name || v.name.trim() === '') { setErrorMessage('Each variant requires a name.'); return; }
      if (v.price === '' || Number.isNaN(Number(v.price))) { setErrorMessage('Each variant requires a valid numeric price.'); return; }
      if (v.stock === '' || Number.isNaN(Number(v.stock))) { setErrorMessage('Each variant requires numeric stock (0 if none).'); return; }
    }

    setLoading(true);
    try {
      let imageUrls = [];

      // Upload images to AWS S3 if any files are selected
      if (selectedFiles && selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach(file => {
          formData.append('images', file);
        });

        const uploadRes = await fetch('/api/upload/images', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          setErrorMessage(uploadData?.message || 'Image upload failed');
          setLoading(false);
          return;
        }

        // Extract URLs from the response
        if (uploadData.success && uploadData.data && uploadData.data.files) {
          imageUrls = uploadData.data.files.map(file => file.url);
        }
      }
      // Note: Image file upload is currently disabled. To add images, upload to an external service
      // and pass the URLs via the payload.images array, or use the file selection to collect URLs.
      const payload = {
        Name: productName,
        Description: description,
        Manufacturing_date: manufacturingDate || null,
        Expired_date: expiredDate || null,
        variations: variants.map(v => ({ NAME: v.name, PRICE: Number(v.price), STOCK: Number(v.stock) })),
      };
      
      // For create: backend will auto-generate barCode, so we don't include it in payload
      // For update: barCode is in the URL, not in the payload
      
      // Note: selectedFiles are collected but not uploaded. 
      // To support file uploads, integrate with an external storage service (S3, Cloudinary, etc.)
      // and populate images with public URLs.
      
      if (selectedCategory && typeof selectedCategory === 'string') {
        payload.category = selectedCategory;
      }

      if (imageUrls.length > 0) {
        payload.images = imageUrls;
      }

      console.log('Product Details to be sent:', payload);
      console.log('API URL:', isEdit ? `/api/seller/products/${encodeURIComponent(barCode)}` : '/api/seller/products');
      console.log('Method:', isEdit ? 'PUT' : 'POST');

      const url = isEdit ? `/api/seller/products/${encodeURIComponent(barCode)}` : '/api/seller/products';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(()=>({}));
      if (!res.ok) {
        const msg = data?.message || data?.error || `Request failed with status ${res.status}`;
        setErrorMessage(`Product Creation Failed: ${msg}`);
        setLoading(false);
        return;
      } else {
        setSuccessMessage(isEdit ? 'Product updated successfully! Redirecting...' : 'Product created successfully! Redirecting...');
        setTimeout(()=>navigate('/seller/seller-dashboard'), 1500);
      }
    } catch (err) {
      setErrorMessage(`Product Creation Failed: ${err.message || 'Unexpected error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Variant helpers
  const handleVariantChange = (index, field, value) => {
    setVariants(prev => {
      const copy = prev.map(v => ({ ...v }));
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addVariant = () => {
    setVariants(prev => [...prev, { name: '', price: '', stock: 0 }]);
  };

  const removeVariant = (index) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold text-blue-600">BKBAY</div>
            <div className="relative w-1/3">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full pl-12 pr-4 py-2 border rounded-full bg-gray-100 focus:bg-white focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-6 text-gray-600">
              <a href="#" className="hover:text-blue-600"><FiHeart size={22} /></a>
              <a href="#" className="hover:text-blue-600"><FiShoppingCart size={22} /></a>
              <a href="#" className="hover:text-blue-600"><FiUser size={22} /></a>
            </div>
          </div>
        </div>
      </header> */}

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Product</h1>
            <p className="text-gray-600">Fill in the details below to add a new item to your store.</p>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="bg-white p-8 border rounded-lg shadow-sm mb-8">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Product Details</h2>
              {/* Alert / message box - use same background/text as description for readability */}
              {(successMessage || errorMessage) && (
                <div className="mb-6 p-4 rounded-md bg-white text-gray-800 border border-gray-200 shadow-sm">
                  {successMessage && (
                    <div className="text-sm font-medium text-green-700">{successMessage}</div>
                  )}
                  {errorMessage && (
                    <div className="text-sm text-red-700 mt-1">{errorMessage}</div>
                  )}
                </div>
              )}
              {/* End message box */}
              <div className="mb-6">
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                 <input
                   type="text"
                   id="productName"
                   value={productName}
                   onChange={(e) => setProductName(e.target.value)}
                   placeholder="e.g. Ergonomic Cloud Slippers"
                   className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                   disabled={viewOnly}
                 />
              </div>
              {/* Bar Code - shown only in edit/view mode, auto-generated on create */}
              {isEdit && (
                <div className="mb-6">
                  <label htmlFor="barCode" className="block text-sm font-medium text-gray-700 mb-2">Bar Code</label>
                  <input
                    type="text"
                    id="barCode"
                    value={barCode}
                    className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-800 cursor-not-allowed"
                    disabled={true}
                  />
                  <p className="text-xs text-gray-500 mt-1">Bar codes are auto-generated and cannot be changed.</p>
                </div>
              )}
              {/* Manufacturing and Expiry dates - these map to Product_SKU.Manufacturing_date and Expired_date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label htmlFor="manufacturingDate" className="block text-sm font-medium text-gray-700 mb-2">Manufacturing Date</label>
                  <input
                    type="date"
                    id="manufacturingDate"
                    value={manufacturingDate}
                    onChange={(e) => setManufacturingDate(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                    disabled={viewOnly}
                  />
                </div>
                <div>
                  <label htmlFor="expiredDate" className="block text-sm font-medium text-gray-700 mb-2">Expired Date</label>
                  <input
                    type="date"
                    id="expiredDate"
                    value={expiredDate}
                    onChange={(e) => setExpiredDate(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                    disabled={viewOnly}
                  />
                </div>
              </div>
              <div className="mt-6">
                <label htmlFor="detailedDescription" className="block text-sm font-medium text-gray-700 mb-2">Detailed Description</label>
                <textarea
                  id="detailedDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the product, its features, materials, etc."
                  rows="4"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-800"
                  disabled={viewOnly}
                ></textarea>
              </div>
            </div>

            {/* Pricing & Stock moved to per-variant editor below; remove redundant static block */}

            <div className="bg-white p-8 border rounded-lg shadow-sm mb-8">
                <h2 className="text-xl font-semibold mb-6 text-gray-800">Product Images</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white">
                  <UploadImages
                    initialImages={Array.isArray(initial?.images) ? initial.images : []}
                    disabled={viewOnly}
                    maxFiles={10}
                    maxSizeMB={10}
                    onFilesChange={(files) => setSelectedFiles(files)}
                  />
                </div>
              </div>

            <div className="bg-white p-8 border rounded-lg shadow-sm mb-8">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Variants</h2>
              {/* Category selector for Belongs_to association */}
              <div className="mb-6">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e)=>setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-white text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                  disabled={viewOnly}
                >
                  <option value="" disabled>-- Select category (optional) --</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Variant list: each variant has name, price and stock */}
              <div className="space-y-4">
                {variants.map((v, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="block text-sm font-medium text-gray-700 mb-2">Variant {idx + 1}</h3>
                      <div className="flex items-center space-x-2">
                        <button type="button" onClick={()=>removeVariant(idx)} className="text-sm text-red-600 hover:underline" disabled={viewOnly}>Remove</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Variant Name</label>
                        <input type="text" value={v.name} onChange={(e)=>handleVariantChange(idx, 'name', e.target.value)} placeholder="e.g. Red-L" className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-800" disabled={viewOnly} />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Price (đ)</label>
                        <input type="number" min="0" step="0.01" value={v.price} onChange={(e)=>handleVariantChange(idx, 'price', e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-800" disabled={viewOnly} />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Stock</label>
                        <input type="number" min="0" step="1" value={v.stock} onChange={(e)=>handleVariantChange(idx, 'stock', e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-800" disabled={viewOnly} />
                      </div>
                    </div>
                  </div>
                ))}
                <div>
                  <button type="button" onClick={addVariant} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700" disabled={viewOnly}>Add Variant</button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button type="button" onClick={handleCancel} className="px-8 py-3 border rounded-lg text-gray-600 font-semibold hover:bg-gray-100">{viewOnly ? 'Back' : 'Cancel'}</button>
              {!viewOnly && (
                <button type="button" onClick={handleSave} disabled={loading} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60">{saveLabel}</button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddProductPage;
