import StatusBadge from '../../components/order/StatusBadge';
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
export default OrderCard;