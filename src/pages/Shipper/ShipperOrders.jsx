import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { getAllOrders, claimOrder, updateOrderStatus } from '../../services/shipperOrdersService';

function StatusBadge({ status }) {
  const color = {
    Pending: 'bg-gray-100 text-gray-700',
    Processing: 'bg-amber-100 text-amber-800',
    Dispatched: 'bg-blue-100 text-blue-800',
    Delivering: 'bg-indigo-100 text-indigo-800',
    Delivered: 'bg-emerald-100 text-emerald-800',
    Completed: 'bg-green-100 text-green-800',
  }[status] || 'bg-slate-100 text-slate-800';

  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{status}</span>;
}

function OrderCard({ order, actions }) {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">Order ID</p>
          <p className="font-semibold text-slate-900">{order.id || order.Id || order.orderId}</p>
        </div>
        <StatusBadge status={order.status || order.Status} />
      </div>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-slate-500">Seller</p>
          <p className="text-slate-900">{order.sellerName || order.SellerName || '-'}</p>
        </div>
        <div>
          <p className="text-slate-500">Buyer</p>
          <p className="text-slate-900">{order.buyerName || order.BuyerName || '-'}</p>
        </div>
        <div>
          <p className="text-slate-500">Total</p>
          <p className="text-slate-900">{order.total ? `$${order.total.toFixed(2)}` : (order.Total || '-')}</p>
        </div>
      </div>
      {actions}
    </div>
  );
}

export default function ShipperOrders() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [available, setAvailable] = useState([]); // Processing orders (to claim)
  const [active, setActive] = useState([]); // Dispatched / Delivering (my current work)
  const [doing, setDoing] = useState(''); // current action indicator

  const loadAll = async () => {
    try {
      setLoading(true);
      setError('');
      const all = await getAllOrders();
      // Filter client-side based on status field
      const processing = all.filter(o => {
        const s = (o.status || o.Status || '').toString();
        return s === 'Processing';
      });
      const mine = all.filter(o => {
        const s = (o.status || o.Status || '').toString();
        return s === 'Dispatched' || s === 'Delivering';
      });
      setAvailable(processing);
      setActive(mine);
    } catch (e) {
      setError(e.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleClaim = async (orderId) => {
    try {
      setDoing(orderId + ':claim');
      await claimOrder(orderId);
      await loadAll();
    } catch (e) {
      alert(e.message || 'Failed to claim');
    } finally {
      setDoing('');
    }
  };

  const handlePickup = async (orderId) => {
    try {
      setDoing(orderId + ':pickup');
      await updateOrderStatus(orderId, 'Delivering');
      await loadAll();
    } catch (e) {
      alert(e.message || 'Failed to update to Delivering');
    } finally {
      setDoing('');
    }
  };

  const handleDelivered = async (orderId) => {
    try {
      setDoing(orderId + ':delivered');
      await updateOrderStatus(orderId, 'Delivered');
      await loadAll();
    } catch (e) {
      alert(e.message || 'Failed to update to Delivered');
    } finally {
      setDoing('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto p-6">
        <div className="flex items-baseline justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Shipper Orders</h1>
          <button
            onClick={loadAll}
            className="px-3 py-2 text-sm rounded-md border bg-white hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {loading && (
          <div className="bg-white rounded-lg shadow p-6">Loading orders…</div>
        )}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">{error}</div>
        )}

        {!loading && !error && (
          <div className="space-y-10">
            {/* Available Orders (Processing) */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-slate-900">Available Orders (Processing)</h2>
                <p className="text-sm text-slate-500">Only orders in Processing are listed here.</p>
              </div>
              {available.length === 0 ? (
                <div className="bg-white border rounded-lg p-6 text-slate-500">No available orders right now.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {available.map((o) => {
                    const id = o.id || o.Id || o.orderId;
                    return (
                      <OrderCard
                        key={id}
                        order={o}
                        actions={
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={() => handleClaim(id)}
                              disabled={doing === id + ':claim'}
                              className="px-3 py-2 text-sm font-medium rounded-md bg-primary text-white hover:bg-secondary disabled:opacity-60"
                            >
                              {doing === id + ':claim' ? 'Claiming…' : 'Nhận đơn'}
                            </button>
                          </div>
                        }
                      />
                    );
                  })}
                </div>
              )}
            </section>

            {/* My Active Orders (Dispatched / Delivering) */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-slate-900">My Active Orders</h2>
                <p className="text-sm text-slate-500">Progress your accepted deliveries.</p>
              </div>
              {active.length === 0 ? (
                <div className="bg-white border rounded-lg p-6 text-slate-500">No active orders.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {active.map((o) => {
                    const id = o.id || o.Id || o.orderId;
                    const status = o.status || o.Status;
                    return (
                      <OrderCard
                        key={id}
                        order={o}
                        actions={
                          <div className="mt-4 flex justify-end gap-2">
                            {status === 'Dispatched' && (
                              <button
                                onClick={() => handlePickup(id)}
                                disabled={doing === id + ':pickup'}
                                className="px-3 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                              >
                                {doing === id + ':pickup' ? 'Updating…' : 'Đã lấy hàng'}
                              </button>
                            )}
                            {status === 'Delivering' && (
                              <button
                                onClick={() => handleDelivered(id)}
                                disabled={doing === id + ':delivered'}
                                className="px-3 py-2 text-sm font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                              >
                                {doing === id + ':delivered' ? 'Updating…' : 'Đã giao'}
                              </button>
                            )}
                          </div>
                        }
                      />
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
