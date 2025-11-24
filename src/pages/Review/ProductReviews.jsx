import React, { useState } from 'react';
import { FaStar, FaThumbsUp, FaRegCommentDots } from 'react-icons/fa';

// Mock data giả lập dữ liệu từ Database (Table Review, User, Write_review)
const MOCK_REVIEWS = [
  {
    id: 1,
    username: "huytrieu76",
    avatar: "https://i.pravatar.cc/150?img=3", // Placeholder avatar
    rating: 5,
    variant: "UK 7.5 (41)",
    content: "Giày rất đẹp, giá sale rẻ quá làm mình cứ sợ mua nhầm hàng fake 😂... nhưng mà thấy tag đúng made in VN và độ hoàn thiện sản phẩm tốt nên cũng đỡ lo. Shop giao hàng nhanh, đóng gói kỹ, mình rất hài lòng.",
    images: [
      "https://down-vn.img.susercontent.com/file/vn-11134103-7r98o-lzy2j5y2q5y21e", // Thay bằng link ảnh thật hoặc placeholder
      "https://down-vn.img.susercontent.com/file/vn-11134103-7r98o-lzy2j5y2rkzm7f"
    ],
    date: "21/06/2025 10:30",
    sellerResponse: "Mizuno Việt Nam xin chào! Cảm ơn bạn đã tin tưởng và ủng hộ shop. Mong bạn sẽ tiếp tục đồng hành cùng Mizuno trong tương lai ạ ❤️"
  },
  {
    id: 2,
    username: "toanpm26",
    avatar: "https://i.pravatar.cc/150?img=12",
    rating: 5,
    variant: "UK 8 (42)",
    content: "Giày đẹp, đi êm chân. Giao hàng hơi chậm chút nhưng chấp nhận được.",
    images: [],
    date: "22/06/2025 08:15",
    sellerResponse: null
  }
];

const ProductReviews = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  // Helper render sao
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar key={index} className={index < rating ? "text-yellow-400" : "text-gray-300"} />
    ));
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-sm">
      <h2 className="text-xl font-bold mb-4">Đánh giá sản phẩm</h2>

      {/* Section 1: Overview & Filters */}
      <div className="bg-red-50 p-6 border border-red-100 rounded-sm mb-6 flex items-start gap-8">
        <div className="text-center mr-4">
            <div className="text-4xl font-bold text-red-600">4.9 <span className="text-xl text-red-600">/ 5</span></div>
            <div className="flex text-xl mt-1 justify-center text-yellow-400">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            </div>
        </div>
        
        <div className="flex flex-wrap gap-2 flex-1">
            {['Tất cả', '5 Sao (643)', '4 Sao (20)', '3 Sao (5)', '2 Sao (1)', '1 Sao (0)', 'Có Bình luận (191)', 'Có Hình ảnh / Video (101)'].map((filter, idx) => (
                <button 
                    key={idx}
                    onClick={() => setActiveFilter(idx)}
                    className={`px-4 py-1.5 text-sm border rounded-sm transition-colors ${
                        activeFilter === idx 
                        ? 'border-red-500 text-red-500 font-medium bg-white' 
                        : 'border-gray-200 bg-white text-gray-600 hover:border-red-500 hover:text-red-500'
                    }`}
                >
                    {filter}
                </button>
            ))}
        </div>
      </div>

      {/* Section 2: Review List */}
      <div className="flex flex-col divide-y divide-gray-100">
        {MOCK_REVIEWS.map((review) => (
            <div key={review.id} className="py-6 flex gap-4 items-start">
                {/* Avatar */}
                <div className="w-10 h-10 shrink-0">
                    <img src={review.avatar} alt={review.username} className="w-full h-full rounded-full object-cover bg-gray-100" />
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="text-xs text-gray-800 font-medium mb-1">{review.username}</div>
                    <div className="flex text-xs text-yellow-400 mb-1">
                        {renderStars(review.rating)}
                    </div>
                    
                    {/* Variant info */}
                    <div className="text-xs text-gray-500 mb-3">Phân loại: {review.variant}</div>

                    {/* Comment Text */}
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">{review.content}</p>

                    {/* Images Grid */}
                    {review.images.length > 0 && (
                        <div className="flex gap-2 mb-4">
                            {review.images.map((img, idx) => (
                                <div key={idx} className="w-16 h-16 border border-gray-200 cursor-pointer hover:opacity-90">
                                    <img src={img} alt="review-img" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Timestamp */}
                    <div className="text-xs text-gray-400 mb-3">{review.date}</div>

                    {/* Seller Response */}
                    {review.sellerResponse && (
                        <div className="bg-gray-50 p-3 rounded-sm mb-2 relative">
                            <div className="text-xs font-medium text-gray-800 mb-1">Phản hồi của Người bán:</div>
                            <p className="text-sm text-gray-600">{review.sellerResponse}</p>
                        </div>
                    )}

                    {/* Actions: Like/Helpful */}
                    <div className="flex items-center gap-4 text-gray-400 mt-2">
                         <button className="flex items-center gap-1 text-sm hover:text-gray-600">
                            <FaThumbsUp /> Hữu ích
                         </button>
                         <button className="flex items-center gap-1 text-sm hover:text-gray-600">
                            <FaRegCommentDots />
                         </button>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;