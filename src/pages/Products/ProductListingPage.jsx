import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import ProductReviews from '../../components/product/ProductReviews'; // Ensure this is imported

const ProductListingPage = () => {
    const { barcode } = useParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [product, setProduct] = useState(null);
    const [images, setImages] = useState([]);
    const [variations, setVariations] = useState([]);
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [qty, setQty] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null); 
    
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [cartError, setCartError] = useState(null);

    const formatPrice = (val) => {
        const n = Math.round(Number(val) || 0);
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
    };

    const availableStock = useMemo(() => {
        return selectedVariant?.stock ?? 0;
    }, [selectedVariant]);

    const handleQtyChange = (newQty) => {
        const stockLimit = availableStock;
        if (newQty < 1) {
            setQty(1);
        } else if (newQty > stockLimit) {
            setQty(stockLimit);
        } else {
            setQty(newQty);
        }
    };

    const handleAddToCart = async () => {
        setCartError(null);
        if (!selectedVariant) {
            setCartError("Please select a product variant before adding to cart.");
            return;
        }
        if (qty < 1 || qty > availableStock) {
            setCartError(`Invalid quantity. Must be between 1 and ${availableStock}.`);
            return;
        }
        setIsAddingToCart(true);
        const cartData = {
            barcode: barcode,
            variationName: selectedVariant.name,
            quantity: qty
        };
        try {
            const res = await fetch('/api/cart', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cartData),
            });
            const result = await res.json();
            if (!res.ok || !result.success) {
                throw new Error(result.message || `Failed to add item. Status: ${res.status}`);
            }
            alert(`✅ ${result.message || 'Item added to cart successfully!'}`);
        } catch (err) {
            console.error("Cart API Error:", err);
            setCartError(err.message);
        } finally {
            setIsAddingToCart(false);
        }
    };

    useEffect(() => {
        if (!barcode) return;
        const controller = new AbortController();
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/products/${encodeURIComponent(barcode)}`, { signal: controller.signal });
                if (res.status === 404) {
                    setProduct(null); 
                    setError('Product not found (HTTP 404)');
                    return;
                }
                if (!res.ok) throw new Error(`Status ${res.status}`);
                const data = await res.json();
                const { product: rawProduct, images: rawImages, variations: rawVariations } = data;
                const finalProduct = rawProduct || data;
                if (!finalProduct || !finalProduct.name) {
                    setError('Product data is empty or missing name.');
                    return;
                }
                setProduct(finalProduct);
                setImages(rawImages || []);
                setVariations(rawVariations || []);
                setSelectedImageIdx(0);
                const initialVariant = (rawVariations && rawVariations.length > 0) ? rawVariations[0] : null;
                setSelectedVariant(initialVariant);
                setQty(1); 
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error(err);
                    setError(`Failed to load product: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
        return () => controller.abort();
    }, [barcode]);

    let finalDisplayPrice;
    const priceRange = product?.priceRange;
    const isMultipleVariants = variations.length > 1;

    if (selectedVariant) {
        finalDisplayPrice = formatPrice(selectedVariant.price);
    } else if (isMultipleVariants && priceRange && priceRange.min !== priceRange.max) {
        finalDisplayPrice = `${formatPrice(priceRange.min)} - ${formatPrice(priceRange.max)}`;
    } else if (isMultipleVariants || variations.length === 1) {
        const price = variations[0]?.price || priceRange?.min || product?.price;
        finalDisplayPrice = formatPrice(price);
    } else {
        finalDisplayPrice = formatPrice(product?.price);
    }
    
    if (loading) {
        return (
            <>
                <Header />
                <main className="max-w-6xl mx-auto p-6">Loading product...</main>
                <Footer />
            </>
        );
    }

    if (error || !product) {
        return (
            <>
                <Header />
                <main className="max-w-6xl mx-auto p-6">
                    <div className="text-red-600">{error || 'Product not found'}</div>
                </main>
                <Footer />
            </>
        );
    }

    const mainImage = images[selectedImageIdx] ?? images[0] ?? null;
    const displayListPrice = product.listPrice ?? null;

    return (
        <>
            <Header />
            <main className="max-w-6xl mx-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Left: images */}
                    <div className="md:col-span-5 bg-white rounded-lg p-4 shadow-sm">
                        <div className="h-96 flex items-center justify-center bg-gray-50 rounded-md overflow-hidden">
                            {mainImage ? (
                                <img src={mainImage} alt={product.name} className="max-h-full object-contain" />
                            ) : (
                                <div className="text-gray-400">No image</div>
                            )}
                        </div>
                        {images.length > 0 && (
                            <div className="mt-4 flex gap-3 overflow-x-auto">
                                {images.map((src, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImageIdx(i)}
                                        className={`w-20 h-20 rounded-md overflow-hidden border ${i === selectedImageIdx ? 'ring-2 ring-indigo-500' : 'border-gray-200'}`}
                                    >
                                        <img src={src} alt={`${product.name} ${i}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: details */}
                    <div className="md:col-span-7 bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                            <div>{product.averageRating ? `${product.averageRating} ★` : 'No ratings yet'}</div>
                            <div className="text-gray-400">|</div>
                            <div>{product.sold ? `${product.sold} sold` : '— sold'}</div>
                        </div>

                        <div className="mb-4">
                            <div className="flex items-baseline gap-4">
                                <div className="text-3xl font-extrabold text-red-600">{finalDisplayPrice}</div>
                                {displayListPrice ? (
                                    <div className="text-sm text-gray-500 line-through">{formatPrice(displayListPrice)}</div>
                                ) : null}
                            </div>
                        </div>

                        <div className="text-sm text-gray-700 mb-6">{product.description || 'No description available.'}</div>
                        
                        {cartError && (
                            <div className="text-sm text-red-600 mb-3 p-2 border border-red-200 bg-red-50 rounded">
                                Error adding to cart: {cartError}
                            </div>
                        )}

                        {variations.length > 0 && (
                            <div className="mb-4">
                                <div className="text-sm font-medium mb-2">Variants</div>
                                <div className="flex gap-2 flex-wrap">
                                    {variations.map((v, index) => (
                                        <button
                                            key={v.name || index}
                                            onClick={() => {
                                                setSelectedVariant(v);
                                                handleQtyChange(qty); 
                                            }}
                                            className={`px-3 py-2 border rounded-md text-sm transition-colors 
                                                ${(selectedVariant?.name === v.name) 
                                                    ? 'bg-red-600 text-white border-red-600' 
                                                    : 'bg-white border-gray-300 hover:border-red-600'
                                                }`
                                            }
                                        >
                                            {v.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center border rounded-md">
                                <button
                                    onClick={() => handleQtyChange(qty - 1)}
                                    className="px-3 py-2"
                                    disabled={qty <= 1} 
                                >
                                    -
                                </button>
                                <div className="px-4">{qty}</div>
                                <button
                                    onClick={() => handleQtyChange(qty + 1)}
                                    className="px-3 py-2"
                                    disabled={qty >= availableStock} 
                                >
                                    +
                                </button>
                            </div>
                            <div className="text-sm text-gray-500">{availableStock} pieces available</div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={handleAddToCart} 
                                className="flex-1 bg-white border border-red-600 text-red-600 py-3 rounded-md hover:bg-red-50"
                                disabled={isAddingToCart || qty > availableStock || availableStock === 0}
                            >
                                {isAddingToCart ? 'Adding...' : 'Add to cart'}
                            </button>
                            <button 
                                className="flex-1 bg-red-600 text-white py-3 rounded-md hover:bg-red-700"
                                disabled={qty > availableStock || availableStock === 0}
                            >
                                Buy now
                            </button>
                        </div>

                        <div className="mt-6 text-sm text-gray-500">
                            <div>Shipping: Free Ship 0₫</div>
                            <div className="mt-2">Returns: 15-Day Free Returns • 100% Authentic</div>
                        </div>
                    </div>
                </div>

                {/* --- NEW SECTION: Product Reviews (Moved OUT of the grid) --- */}
                <div className="mt-10">
                    <ProductReviews productId={barcode} />
                </div>

            </main>
            <Footer />
        </>
    );
};

export default ProductListingPage;