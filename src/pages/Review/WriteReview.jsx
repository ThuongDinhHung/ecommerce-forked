import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import reviewService from '../../services/reviewService';
// Sửa đường dẫn import Header/Footer theo cấu trúc folder thực tế của bạn
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';

const WriteReview = () => {
  const navigate = useNavigate();
  
  // State quản lý số sao đánh giá (mặc định 0 hoặc 5 tùy bạn)
  const [rating, setRating] = useState(4); 
  // State quản lý nội dung review
  const [reviewContent, setReviewContent] = useState(
    "Áo có chất liệu vải linen rất mát mẻ, phù hợp mặc vào mùa hè. Kiểu dáng đơn giản nhưng lịch sự, dễ phối đồ. Tôi rất hài lòng về sản phẩm này."
  );

  // Hàm trả về text trạng thái dựa trên số sao (để giống hình "Hài lòng")
  const getRatingLabel = (score) => {
    switch (score) {
      case 5: return 'Tuyệt vời';
      case 4: return 'Hài lòng';
      case 3: return 'Bình thường';
      case 2: return 'Không hài lòng';
      case 1: return 'Tệ';
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

  const handleSubmit = async () => {
    const selectedPurchase = purchases.find(p => p.id === selectedPurchaseId);
    if (!selectedPurchase) { setError('Vui lòng chọn sản phẩm'); return; }
    if (!reviewContent.trim()) { setError('Viết nội dung đánh giá'); return; }
    setSubmitting(true); setError('');
    try {
      await reviewService.createReview({
        orderId: selectedPurchase.orderId,
        orderItemId: selectedPurchase.orderItemId,
        rating,
        content: reviewContent
      });
      navigate(`/product/${selectedPurchase.productId}/reviews`);
    } catch (err) {
      console.error('createReview', err);
      setError(err.message || 'Gửi thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Header />

      <main className="flex-grow flex items-center justify-center py-8 px-4">
        {/* Card Container - Giới hạn chiều rộng để giống giao diện mobile/app như hình */}
        <div className="bg-white w-full max-w-md shadow-sm rounded-lg overflow-hidden border border-gray-100">
          
          {/* 1. Top Bar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <button onClick={() => navigate(-1)} className="text-gray-700 hover:bg-gray-100 p-1 rounded-full">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold text-gray-800">Đánh giá sản phẩm</h1>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="text-yellow-500 font-bold text-sm hover:text-yellow-600 transition-colors disabled:opacity-60"
            >
              {submitting ? 'Đang gửi...' : 'Gửi'}
            </button>
          </div>

          {/* 2. Product Info */}
          <div className="p-5 border-b border-gray-50">
            <div className="flex gap-4 items-center">
              {/* Placeholder ảnh sản phẩm (nếu cần) */}
              <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0">
                 {/* <img src="..." alt="product" className="w-full h-full object-cover rounded-md" /> */}
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-800">{purchases.find(p => p.id === selectedPurchaseId)?.name ?? 'Chọn sản phẩm để đánh giá'}</h2>
                <p className="text-sm text-gray-500 mt-1">Mã sản phẩm: {purchases.find(p => p.id === selectedPurchaseId)?.productId || '---'}</p>
                <div className="mt-3">
                  <select value={selectedPurchaseId} onChange={(e) => setSelectedPurchaseId(e.target.value)} className="mt-2 w-full border border-gray-200 rounded px-3 py-2 text-sm">
                    {loadingProducts && <option>Đang tải sản phẩm...</option>}
                    {!loadingProducts && purchases.length === 0 && <option value="">Không có sản phẩm</option>}
                    {!loadingProducts && purchases.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-gray-50 flex gap-2">
            <button onClick={() => {
              const selectedPurchase = purchases.find(p => p.id === selectedPurchaseId);
              if (selectedPurchase) navigate(`/product/${selectedPurchase.productId}/reviews`);
            }} className="px-3 py-2 bg-gray-100 border rounded">See review</button>
            <div className="text-sm text-gray-500 self-center">Hoặc gửi đánh giá trực tiếp bên dưới.</div>
          </div>

          {/* 3. Rating Section */}
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <span className="text-gray-800 font-medium text-sm">Chất lượng sản phẩm</span>
            
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
                      // Logic: Nếu sao hiện tại <= rating đã chọn thì tô màu vàng, ngược lại để viền
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
              Nội dung đánh giá
            </label>
            <textarea
              className="w-full h-40 p-3 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 resize-none"
              placeholder="Hãy chia sẻ nhận xét cho sản phẩm này bạn nhé!"
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