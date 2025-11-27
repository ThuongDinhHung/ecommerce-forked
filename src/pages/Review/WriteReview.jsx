import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import reviewService from '../../services/reviewService';
// Adjust the import path for Header/Footer based on your actual folder structure
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';

const WriteReview = () => {
  const navigate = useNavigate();
  
  // State managing star rating (default 0 or 5 as preferred)
  const [rating, setRating] = useState(4); 
  // State managing review content
  const [reviewContent, setReviewContent] = useState(
    "The linen fabric is very cool, suitable for summer wear. Simple but elegant design, easy to mix and match. I am very satisfied with this product."
  );

  // Function to return status text based on star count
  const getRatingLabel = (score) => {
    switch (score) {
      case 5: return 'Excellent';
      case 4: return 'Good';
      case 3: return 'Average';
      case 2: return 'Poor';
      case 1: return 'Very Poor';
      default: return '';
    }
  };

  const [purchases, setPurchases] = useState([]);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoadingProducts(true);
      try {
        const list = await reviewService.getPurchasesForReview();
        setPurchases(list && list.length ? list : []);
        if (list && list.length) setSelectedPurchaseId(list[0].id);
      } catch (err) {
        console.error('getPurchasesForReview', err);
        setPurchases([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    load();
  }, []);

  const handleNavigateToReviews = () => {
    const selectedPurchase = purchases.find(p => p.id === selectedPurchaseId);
    if (selectedPurchase) navigate(`/product/review`);
  };

  const handleSubmit = async () => {
    const selectedPurchase = purchases.find(p => p.id === selectedPurchaseId);
    if (!selectedPurchase) { setError('Please select a product'); return; }
    if (!reviewContent.trim()) { setError('Please write a review'); return; }
    setSubmitting(true); setError('');
    try {
      await reviewService.createReview({
        orderId: selectedPurchase.orderId,
        orderItemId: selectedPurchase.orderItemId,
        rating,
        content: reviewContent
      });
      // Navigate after successful submission (to the product review page)
      navigate(`/product/review`);
    } catch (err) {
      console.error('createReview', err);
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Header />

      <main className="flex-grow flex items-center justify-center py-8 px-4">
        {/* Card Container - Restricted width to mimic mobile app interface */}
        <div className="bg-white w-full max-w-md shadow-sm rounded-lg overflow-hidden border border-gray-100">
          
          {/* 1. Top Bar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <button onClick={() => navigate(-1)} className="text-gray-700 hover:bg-gray-100 p-1 rounded-full">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold text-gray-800">Product Review</h1>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="text-yellow-500 font-bold text-sm hover:text-yellow-600 transition-colors disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>

          {/* 2. Product Info */}
          <div className="p-5 border-b border-gray-50">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-800">
                    {purchases.find(p => p.id === selectedPurchaseId)?.name ?? 'Select a product to review'}
                </h2>
                {/* <p className="text-sm text-gray-500 mt-1">
                    Product ID: {purchases.find(p => p.id === selectedPurchaseId)?.productId || '---'}
                </p> */}
                <div className="mt-3">
                  <select value={selectedPurchaseId} onChange={(e) => setSelectedPurchaseId(e.target.value)} className="mt-2 w-full border border-gray-200 rounded px-3 py-2 text-sm">
                    {loadingProducts && <option>Loading products...</option>}
                    {!loadingProducts && purchases.length === 0 && <option value="">No products available</option>}
                    {!loadingProducts && purchases.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-gray-50 flex gap-2">
            <button onClick={handleNavigateToReviews} className="px-3 py-2 bg-gray-100 border rounded hover:bg-gray-200 transition-colors">
              See Reviews
            </button>
            <div className="text-sm text-gray-500 self-center">Or submit your review directly below.</div>
          </div>

          {/* 3. Rating Section */}
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <span className="text-gray-800 font-medium text-sm">Product Quality</span>
            
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform active:scale-110"
                  >
                    <Star 
                      size={24} 
                      // Logic: If current star <= selected rating, fill yellow, otherwise gray outline
                      className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-500 min-w-[60px] text-right">
                {getRatingLabel(rating)}
              </span>
            </div>
          </div>

          {/* 4. Review Content Section */}
          <div className="p-5">
            <label className="block text-gray-800 font-medium text-sm mb-3">
              Review Content
            </label>
            <textarea
              className="w-full h-40 p-3 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 resize-none"
              placeholder="Please share your thoughts about this product!"
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
            />
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WriteReview;