import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaUserCircle } from 'react-icons/fa';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.reviews || []);
        }
      } catch (err) {
        console.error("Failed to load reviews", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"} />
    ));
  };

  if (loading) return <div className="py-4 text-gray-500">Loading reviews...</div>;

  // Top 3 reviews
  const topReviews = reviews.slice(0, 3);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Top Reviews</h3>
        
        {/* --- Hyperlink for "See all comments" --- */}
        <Link 
            to={`/product/${productId}/reviews`} 
            className="text-indigo-600 font-medium hover:text-indigo-800 hover:underline"
        >
            See all comments
        </Link>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8">
            <p className="text-gray-500">No reviews yet.</p>
            <p className="text-sm text-gray-400 mt-1">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {topReviews.map((review, index) => (
            <div key={review._id || index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FaUserCircle className="text-gray-400 text-2xl" />
                  <span className="font-semibold text-gray-800">
                    {review.username || 'Anonymous'}
                  </span>
                </div>
                <div className="flex text-sm">{renderStars(review.rating)}</div>
              </div>
              <p className="text-gray-600 text-sm">{review.comment}</p>
              <div className="text-xs text-gray-400 mt-2">
                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;