import React, { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import ProductList from '../../components/product/ProductList';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import ProductFilters from '../../components/product/ProductFilters';
import AddToCartModal from '../../components/product/AddToCartModal';

const ProductListingPage = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts({ searchTerm, sortBy, page: pagination.currentPage });
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy, pagination.currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleAddToCartClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    // Optionally: show a toast/notification
  };

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-8 md:p-12 mb-8 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Mid-Season Sale</h1>
          <p className="text-lg mb-6 text-blue-100">Get up to 40% off on selected items. Don't miss out on amazing deals!</p>
          <a className="bg-white text-primary font-semibold py-2 px-6 rounded-full hover:bg-zinc-100 transition duration-300 ease-in-out transform hover:scale-105" href="#">Shop Now</a>
        </div>
        <div>
          <ProductFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
            totalItems={pagination.totalItems}
          />
          {loading ? (
            <div className="text-center p-8">Loading products...</div>
          ) : (
            <ProductList
              products={products}
              pagination={pagination}
              onPageChange={handlePageChange}
              onAddToCart={handleAddToCartClick}
            />
          )}
        </div>
      </main>
      <Footer />
      <AddToCartModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onAddToCart={handleAddToCart}
      />
    </>
  );
};

export default ProductListingPage;
