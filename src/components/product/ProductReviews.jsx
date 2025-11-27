import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaUserCircle } from 'react-icons/fa';
import reviewService from '../../services/reviewService'; // Import the review service

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const fetchReviews = async () => {
    try {
      // Use the service to get reviews
      const fetchedReviews = await reviewService.getReviews(productId);
      setReviews(fetchedReviews || []);
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!productId) return;
    fetchReviews();
  }, [productId]);

  const handleReplyChange = (e) => {
    setReplyContent(e.target.value);
  };

  const handleReplySubmit = async (reviewId) => {
    if (!replyContent.trim()) return;
    try {
      // The sendReply function should return the updated review with the new reply
      await reviewService.sendReply(reviewId, replyContent);

      // Refresh reviews to show the new reply
      fetchReviews();

      setReplyContent('');
      setReplyingTo(null);
    } catch (err) {
      console.error("Failed to submit reply", err);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"} />
    ));
  };

  if (loading) return <div className="py-4 text-gray-500">Loading reviews...</div>;

  const topReviews = reviews.slice(0, 3);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Top Reviews</h3>
        
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
          {topReviews.map((review) => (
            <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FaUserCircle className="text-gray-400 text-2xl" />
                  <span className="font-semibold text-gray-800">
                    {review.username || 'Anonymous'}
                  </span>
                </div>
                <div className="flex text-sm">{renderStars(review.rating)}</div>
              </div>
              <p className="text-gray-600 text-sm">{review.content}</p>
              <div className="text-xs text-gray-400 mt-2">
                {review.date ? new Date(review.date).toLocaleDateString() : ''}
              </div>
              
              {/* --- Replies Section --- */}
              <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-2">
                {review.replies && review.replies.map(reply => (
                  <div key={reply.id} className="bg-gray-100 p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <FaUserCircle className="text-gray-500" />
                      <span className="font-semibold text-sm">{reply.username}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{reply.content}</p>
                     <div className="text-xs text-gray-400 mt-1">
                      {reply.date ? new Date(reply.date).toLocaleDateString() : ''}
                    </div>
                  </div>
                ))}
              </div>

              {/* --- Reply Form --- */}
              <div className="mt-4">
                {replyingTo === review.id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={replyContent}
                      onChange={handleReplyChange}
                      className="w-full p-2 border rounded-md text-sm"
                      placeholder="Write your reply..."
                      rows="2"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="text-sm px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReplySubmit(review.id)}
                        className="text-sm px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        Submit Reply
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingTo(review.id)}
                    className="text-sm font-medium text-indigo-600 hover:underline"
                  >
                    Reply
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;