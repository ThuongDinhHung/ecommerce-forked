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

export default StatusBadge;