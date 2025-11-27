import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { FiCheck } from 'react-icons/fi';
import paymentService from '../../services/paymentService';

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderIds, total } = location.state || {};

  console.log('PaymentPage: orderIds & total from state:', orderIds, total);
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [transactionId, setTransactionId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [processing, setProcessing] = useState(false);

  // If state is lost (no orderIds), send user back to cart immediately
  useEffect(() => {
    if (!orderIds || !orderIds.length) {
      navigate('/cart');
      return;
    }
    // Create transaction on mount
    const createTransaction = async () => {
      try {
        const res = await fetch('/api/transaction', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderIds, total })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Transaction creation failed');
        setTransactionId(data?.transactionId || data?.id);
        console.log('Transaction created:', data);
      } catch (err) {
        console.error('Transaction error:', err);
        setErrorMsg(err.message || 'Failed to create transaction');
      }
    };
    createTransaction();
  }, [orderIds, total, navigate]);

  const handlePayment = async () => {
    if (!transactionId) {
      setErrorMsg('No transaction ID. Cannot proceed with payment.');
      return;
    }
    setProcessing(true);
    setShowSuccess(true);
    try {
      const res = await fetch('/api/pay', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Payment failed');
      setSuccessMsg(data?.message || 'Payment successful');
      setErrorMsg('');
      console.log('Payment successful:', data);
      // Success: redirect to buyer orders after countdown
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/buyer/orders');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (e) {
      console.error('Payment error:', e);
      setErrorMsg(e.message || 'Payment failed');
      setSuccessMsg('');
      setShowSuccess(false);
    } finally {
      setProcessing(false);
    }
  };

  if (!orderIds || !orderIds.length) return null;
  const formatAmount = (val) => {
    const num = Number(val);
    return Number.isFinite(num) ? num.toFixed(3) : '0.000';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto p-6 text-black">
        <h1 className="text-2xl font-bold mb-6">Payment</h1>

        {/* Transaction & Payment feedback banners */}
        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-3">
            {successMsg}
          </div>
        )}
        {transactionId && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-3 text-sm">
            Transaction ID: {transactionId}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Payment Methods */}
          <div className="space-y-6">
            <section className="bg-white rounded-md shadow p-6">
              <h2 className="font-semibold mb-4">Select Payment Method</h2>
              
              <div className="space-y-3">
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                  paymentMethod === 'qr' ? 'border-primary bg-primary-light' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="qr"
                    checked={paymentMethod === 'qr'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">QR Code Payment</div>
                    <div className="text-sm text-gray-600">Scan to pay with banking app</div>
                  </div>
                </label>

                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                  paymentMethod === 'cod' ? 'border-primary bg-primary-light' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-sm text-gray-600">Pay when you receive</div>
                  </div>
                </label>

                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                  paymentMethod === 'card' ? 'border-primary bg-primary-light' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Credit/Debit Card</div>
                    <div className="text-sm text-gray-600">Visa, Mastercard, etc.</div>
                  </div>
                </label>
              </div>
            </section>

            {/* Order Summary */}
            <section className="bg-white rounded-md shadow p-6">
              <h2 className="font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Orders ({orderIds?.length || 0})</span>
                  <span className="font-medium">{formatAmount(Number(total) - 16.5)}₫</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">16.500₫</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg text-red-600">{formatAmount(total)}₫</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right: QR Code / Payment Details */}
          <div>
            <section className="bg-white rounded-md shadow p-6">
              {/* Only Card payment UI */}

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <h3 className="font-semibold mb-4">Card Details</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" className="w-full border rounded-md p-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Expiry</label>
                      <input type="text" placeholder="MM/YY" className="w-full border rounded-md p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CVV</label>
                      <input type="text" placeholder="123" className="w-full border rounded-md p-2" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Cardholder Name</label>
                    <input type="text" placeholder="JOHN DOE" className="w-full border rounded-md p-2" />
                  </div>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={!transactionId || processing}
                className={`w-full mt-6 bg-primary hover:bg-secondary text-white py-3 rounded-md font-semibold ${
                  !transactionId || processing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {processing ? 'Processing...' : `Pay ${formatAmount(total)}₫`}
              </button>
            </section>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              {errorMsg ? (
                <p className="text-red-600 mb-2">Error: {errorMsg}</p>
              ) : (
                <p className="text-gray-600 mb-2">Your payment has been processed successfully.</p>
              )}
              <p className="text-sm text-gray-500 mb-4">Order Total: <span className="font-semibold text-red-600">{formatAmount(total)}₫</span></p>
              <p className="text-sm text-gray-400">Redirecting in {countdown} seconds...</p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
