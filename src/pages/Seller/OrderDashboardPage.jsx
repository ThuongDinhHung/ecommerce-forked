import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiRefreshCw, FiPackage } from 'react-icons/fi';
import { LuChevronDown } from "react-icons/lu";
import sellerOrderService from '../../services/sellerOrderService';

const OrderDashboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState(1);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const mountedRef = useRef(true);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Available order statuses
  const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  useEffect(() => {
    mountedRef.current = true;
    fetchOrders();
    return () => { mountedRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search: wait 400ms after typing stops
  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setOffset(0);
      setPage(1);
      fetchOrders({ search, offset: 0 });
    }, 400);
    return () => { if (searchRef.current) clearTimeout(searchRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function fetchOrders(opts = {}) {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const signal = controller.signal;

    if (searchRef.current && searchRef.current.abortController) {
      try { searchRef.current.abortController.abort(); } catch(e) {}
    }
    searchRef.current = { abortController: controller, timer: searchRef.current?.timer };

    try {
      console.log('Fetching orders with params:', {
        limit,
        offset: opts.offset ?? offset,
        search: opts.search ?? search,
        status: opts.status ?? selectedStatus,
      });

      const resp = await sellerOrderService.listSellerOrders({
        limit,
        offset: opts.offset ?? offset,
        search: opts.search ?? search,
        status: opts.status ?? selectedStatus,
        signal,
      });

      console.log('Orders response:', resp);

      // Handle response from /api/orders/seller endpoint
      // Response format: { success: true, count: N, orders: [...] }
      const list = Array.isArray(resp.orders) ? resp.orders : 
                   (Array.isArray(resp.data) ? resp.data : 
                   (Array.isArray(resp) ? resp : []));
      
      if (!mountedRef.current) return;

      console.log('Mapped list:', list);

      // Map and format orders from seller endpoint
      const mapped = list.map(o => ({
        ID: o.ID,
        Status: o.Status || 'N/A',
        Total: o.Total || 0,
        Address: o.Address || 'N/A',
        Time: formatDate(o.Time),
        BuyerName: o.BuyerName || 'N/A',
        BuyerEmail: o.BuyerEmail || '',
        ItemCount: o.ItemCount || 0,
        ProductNames: o.ProductNames || 'N/A',
      }));

      setOrders(mapped);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Fetch orders error:', err);
      if (mountedRef.current) setError(err.message || 'Failed to load orders');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleString();
    } catch (e) {
      return String(dateStr);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
    try {
      await sellerOrderService.updateOrderStatus(orderId, newStatus);
      // Update local state optimistically
      setOrders(prev => prev.map(o => 
        o.ID === orderId ? { ...o, Status: newStatus } : o
      ));
    } catch (err) {
      console.error('Update status error:', err);
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleRefresh = () => {
    setOffset(0);
    setPage(1);
    fetchOrders({ offset: 0 });
  };

  const handlePrev = () => {
    if (offset === 0) return;
    const newOffset = Math.max(0, offset - limit);
    setOffset(newOffset);
    setPage(page - 1);
    fetchOrders({ offset: newOffset });
  };

  const handleNext = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    setPage(page + 1);
    fetchOrders({ offset: newOffset });
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

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
            <li className="mb-2">
              <button 
                onClick={() => navigate('/seller/seller-dashboard')}
                className="w-full flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Dashboard
              </button>
            </li>
            <li className="mb-2">
              <button 
                onClick={() => navigate('/seller/seller-dashboard')}
                className="w-full flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Products
              </button>
            </li>
            <li className="mb-2">
              <button 
                onClick={() => navigate('/seller/orders')}
                className="w-full flex items-center p-2 text-blue-600 bg-blue-50 rounded"
              >
                Orders
              </button>
            </li>
            <li className="mb-2">
              <a href="#" className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded">Analytics</a>
            </li>
            <li className="mb-2">
              <a href="#" className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded">Settings</a>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mb-3">
            View Storefront
          </button>
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

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-1">Track and manage orders containing your products.</p>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 disabled:opacity-50"
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="relative w-1/3">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order ID or Buyer Name"
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => { 
                    setSelectedStatus(e.target.value); 
                    setOffset(0); 
                    fetchOrders({ status: e.target.value, offset: 0 }); 
                  }}
                  className="pl-4 pr-10 py-2 border rounded-lg bg-white shadow-sm text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  {ORDER_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left font-medium text-gray-600">Order ID</th>
                <th className="p-4 text-left font-medium text-gray-600">Buyer</th>
                <th className="p-4 text-left font-medium text-gray-600">Products</th>
                <th className="p-4 text-left font-medium text-gray-600">Items</th>
                <th className="p-4 text-left font-medium text-gray-600">Total</th>
                <th className="p-4 text-left font-medium text-gray-600">Address</th>
                <th className="p-4 text-left font-medium text-gray-600">Date</th>
                <th className="p-4 text-left font-medium text-gray-600">Status</th>
                <th className="p-4 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-gray-500">Loading orders...</td>
                </tr>
              )}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-gray-500">
                    <FiPackage className="mx-auto mb-2 text-4xl" />
                    <p>No orders found.</p>
                  </td>
                </tr>
              )}
              {!loading && orders.map((order) => (
                <tr key={order.ID} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-semibold text-gray-900">{order.ID}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-gray-900">{order.BuyerName}</p>
                    <p className="text-sm text-gray-500">{order.BuyerEmail}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-700 max-w-xs" title={order.ProductNames}>
                      {order.ProductNames.length > 50 
                        ? order.ProductNames.substring(0, 50) + '...' 
                        : order.ProductNames}
                    </p>
                  </td>
                  <td className="p-4 text-gray-600">{order.ItemCount}</td>
                  <td className="p-4 text-gray-900 font-semibold">
                    ${order.Total ? Number(order.Total).toFixed(2) : '0.00'}
                  </td>
                  <td className="p-4 text-gray-600 max-w-xs truncate">{order.Address}</td>
                  <td className="p-4 text-gray-600 text-sm">{order.Time}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(order.Status)}`}>
                      {order.Status}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={order.Status}
                      onChange={(e) => handleStatusChange(order.ID, e.target.value)}
                      disabled={updatingStatus[order.ID]}
                      className="px-3 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {ORDER_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {offset + 1} to {offset + orders.length} results
            </p>
            <div className="flex space-x-2">
              <button 
                onClick={handlePrev} 
                disabled={offset === 0} 
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                &lt; Previous
              </button>
              <button 
                onClick={handleNext} 
                disabled={orders.length < limit}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Next &gt;
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDashboardPage;
