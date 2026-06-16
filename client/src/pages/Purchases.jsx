import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import api from '../api/axios';

const StatusBadge = ({ status }) => {
  const styles = {
    pending:   'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
    ordered:   'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
    received:  'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
    cancelled: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${styles[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
};

const STATUS_OPTIONS = ['pending', 'ordered', 'received', 'cancelled'];

// Which options are available from each current status
const STATUS_TRANSITIONS = {
  pending:   ['pending', 'ordered', 'received', 'cancelled'],
  ordered:   ['ordered', 'received', 'cancelled'],
  received:  null,   // terminal — no changes allowed
  cancelled: null,   // terminal — no changes allowed
};

const STATUS_BADGE = {
  pending:   { badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',   dot: 'bg-amber-400' },
  ordered:   { badge: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',       dot: 'bg-blue-400' },
  received:  { badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30', dot: 'bg-emerald-400' },
  cancelled: { badge: 'bg-red-500/15 text-red-400 border border-red-500/30',           dot: 'bg-red-400' },
};

// Inline editable status dropdown
const StatusDropdown = ({ purchase, onStatusChange, updating }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const s = STATUS_BADGE[purchase.status] || { badge: 'bg-slate-700 text-slate-300 border border-slate-600', dot: 'bg-slate-400' };
  const options = STATUS_TRANSITIONS[purchase.status];

  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (updating) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-slate-400">
        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        Saving…
      </span>
    );
  }

  // Terminal statuses — plain badge only
  if (!options) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 ${s.badge}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
      </span>
    );
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 cursor-pointer transition-all hover:opacity-80 ${s.badge}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 min-w-[130px] bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
          {options.map(opt => {
            const os = STATUS_BADGE[opt] || { badge: '', dot: 'bg-slate-400' };
            const isCurrent = opt === purchase.status;
            return (
              <button key={opt}
                onClick={() => { if (!isCurrent) onStatusChange(purchase.id, opt); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left transition-colors
                  ${isCurrent
                    ? 'bg-slate-700/60 text-slate-200 cursor-default'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${os.dot}`} />
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                {isCurrent && <svg className="w-3 h-3 ml-auto text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Vendor Card
const VendorCard = ({ vendor, onView }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="font-bold text-gray-800 dark:text-slate-100">{vendor.name}</h3>
      </div>
      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
        {vendor.totalPurchases} Orders
      </span>
    </div>
    <div className="space-y-2 text-sm text-gray-600 dark:text-slate-300 mb-4 border-b border-gray-200 dark:border-slate-700 pb-4">
      <p><strong>Contact:</strong> {vendor.contact}</p>
      <p><strong>Email:</strong> {vendor.email}</p>
      <p><strong>Total Spent:</strong> ₹{vendor.totalSpent.toLocaleString()}</p>
    </div>
  </div>
);

// Purchase Card
const PurchaseCard = ({ purchase, onView, onDelete }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="font-bold text-gray-800">{purchase.vendor_name}</h3>
        <p className="text-sm text-gray-600">PO: {purchase.purchase_id}</p>
      </div>
      <StatusBadge status={purchase.status} />
    </div>

    <div className="space-y-2 text-sm text-gray-700 mb-4 border-b border-gray-200 pb-4">
      <p><strong>Date:</strong> {purchase.purchase_date}</p>
      <p><strong>Items:</strong> {purchase.items.length}</p>
      <p><strong>Total:</strong> ₹{purchase.total_amount.toLocaleString()}</p>
      <p><strong>Invoice:</strong> {purchase.invoice_number}</p>
    </div>

    <div className="flex gap-2">
      <button
        onClick={() => onView(purchase.id)}
        className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition text-sm font-medium"
      >
        View
      </button>
      <button
        onClick={() => onDelete(purchase.id, purchase.purchase_id)}
        className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition text-sm font-medium"
      >
        Delete
      </button>
    </div>
  </div>
);

// Purchase Detail Modal
const PurchaseDetailModal = ({ purchaseId, onClose }) => {
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!purchaseId) return;
    api.get(`/purchases/${purchaseId}`)
      .then(res => setPurchase(res.data?.data?.purchase || null))
      .catch(() => toast.error('Failed to load purchase details'))
      .finally(() => setLoading(false));
  }, [purchaseId]);

  const Row = ({ label, value }) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm text-slate-200 font-medium">{value || '—'}</span>
    </div>
  );

  const statusStyle = {
    pending:   'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    ordered:   'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    received:  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    cancelled: 'bg-red-500/15 text-red-400 border border-red-500/30',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-700 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Purchase Details</h2>
              {purchase && <p className="text-xs text-slate-400 mt-0.5">{purchase.purchase_id}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
          ) : !purchase ? (
            <p className="text-center text-slate-400 py-12">Purchase not found</p>
          ) : (
            <>
              {/* Status + Amount banner */}
              <div className="flex items-center justify-between bg-slate-900/50 rounded-xl px-4 py-3 border border-slate-700/50">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-white">
                    ₹{parseFloat(purchase.total_amount || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusStyle[purchase.status] || 'bg-slate-700 text-slate-300'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {(purchase.status || '').charAt(0).toUpperCase() + (purchase.status || '').slice(1)}
                </span>
              </div>

              {/* Order Info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-blue-500 rounded-full" />
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Order Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-slate-900/30 rounded-xl p-4 border border-slate-700/40">
                  <Row label="PO Number" value={purchase.purchase_id} />
                  <Row label="Purchase Date" value={purchase.purchase_date ? new Date(purchase.purchase_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null} />
                  <Row label="Invoice Number" value={purchase.invoice_number} />
                  <Row label="Payment Method" value={purchase.payment_method} />
                  {purchase.notes && <div className="col-span-2"><Row label="Notes" value={purchase.notes} /></div>}
                </div>
              </div>

              {/* Vendor Info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-purple-500 rounded-full" />
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Vendor Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-slate-900/30 rounded-xl p-4 border border-slate-700/40">
                  <div className="col-span-2"><Row label="Vendor Name" value={purchase.vendor_name} /></div>
                  <Row label="Contact" value={purchase.vendor_contact} />
                  <Row label="Email" value={purchase.vendor_email} />
                  {purchase.vendor_address && <div className="col-span-2"><Row label="Vendor Address" value={purchase.vendor_address} /></div>}
                  {purchase.billing_address && <Row label="Billing Address" value={purchase.billing_address} />}
                  {purchase.shipping_address && <Row label="Shipping Address" value={purchase.shipping_address} />}
                </div>
              </div>

              {/* Linked Assets — only show if assets exist */}
              {purchase.assets && purchase.assets.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                      Linked Assets <span className="text-emerald-400 normal-case font-normal">({purchase.assets.length})</span>
                    </h3>
                  </div>
                  <div className="bg-slate-900/30 rounded-xl border border-slate-700/40 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700/50">
                          <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tag</th>
                          <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                          <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                          <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Assigned</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/30">
                        {purchase.assets.map(a => (
                          <tr key={a.id} className="hover:bg-slate-700/20 transition-colors">
                            <td className="px-4 py-2.5 font-mono text-xs text-blue-400 font-semibold">{a.asset_tag}</td>
                            <td className="px-4 py-2.5 text-slate-300 text-xs">{a.asset_name || a.sub_type}</td>
                            <td className="px-4 py-2.5 text-slate-400 text-xs">{a.category} / {a.sub_type}</td>
                            <td className="px-4 py-2.5">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                a.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' :
                                a.status === 'retired' ? 'bg-red-500/15 text-red-400' :
                                'bg-slate-600 text-slate-300'
                              }`}>{a.status}</span>
                            </td>
                            <td className="px-4 py-2.5 text-slate-400 text-xs">{a.assigned_to || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-slate-700 flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const Purchases = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('card');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [mockPurchases, setMockPurchases] = useState([]);
  const [mockVendors, setMockVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);

  useEffect(() => {
    fetchPurchases();
  }, [searchParams]);

  const fetchPurchases = async () => {
    try {
      const response = await api.get('/purchases?limit=500');
      const purchases = response.data?.data?.purchases || response.data || [];
      setMockPurchases(purchases);

      const uniqueVendors = [];
      const vendorMap = new Map();

      purchases.forEach(purchase => {
        const vendorName = (purchase.vendor_name || '').trim();
        if (!vendorName) return;

        if (!vendorMap.has(vendorName)) {
          vendorMap.set(vendorName, {
            id: vendorName,
            name: vendorName,
            contact: purchase.vendor_contact || 'N/A',
            email: purchase.vendor_email || 'N/A',
            address: purchase.vendor_address || 'N/A',
            totalPurchases: 1,
            totalSpent: purchase.status !== 'cancelled' ? (parseFloat(purchase.total_amount) || 0) : 0
          });
        } else {
          const vendor = vendorMap.get(vendorName);
          vendor.totalPurchases += 1;
          if (purchase.status !== 'cancelled') vendor.totalSpent += parseFloat(purchase.total_amount) || 0;
        }
      });

      vendorMap.forEach(vendor => uniqueVendors.push(vendor));
      setMockVendors(uniqueVendors);

      if (searchParams.get('refresh') === 'true') {
        toast.success('Purchases list updated!');
      }
    } catch (error) {
      toast.error('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  // Generate Purchase Trend Data (by month)
  const purchaseTrendData = (() => {
    const trendMap = new Map();
    mockPurchases.forEach(purchase => {
      const date = new Date(purchase.purchase_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      if (!trendMap.has(monthKey)) {
        trendMap.set(monthKey, { month: monthLabel, amount: 0, count: 0 });
      }
      const entry = trendMap.get(monthKey);
      if (purchase.status !== 'cancelled') entry.amount += parseFloat(purchase.total_amount) || 0;
      entry.count += 1;
    });
    return Array.from(trendMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  })();

  // Generate Status Distribution Data
  const categoryDistribution = (() => {
    const statusMap = new Map();
    const colors = { pending: '#FFA500', ordered: '#3b82f6', received: '#22c55e', cancelled: '#ef4444' };

    mockPurchases.forEach(purchase => {
      if (!statusMap.has(purchase.status)) {
        statusMap.set(purchase.status, 0);
      }
      statusMap.set(purchase.status, statusMap.get(purchase.status) + 1);
    });

    return Array.from(statusMap.entries()).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: colors[status] || '#888888'
    }));
  })();

  // Generate Vendor Performance Data
  const vendorPerformanceData = (() => {
    const vendorMap = new Map();
    mockPurchases.forEach(purchase => {
      if (!vendorMap.has(purchase.vendor_name)) {
        vendorMap.set(purchase.vendor_name, { name: purchase.vendor_name, spent: 0, orders: 0 });
      }
      const vendor = vendorMap.get(purchase.vendor_name);
      if (purchase.status !== 'cancelled') vendor.spent += parseFloat(purchase.total_amount) || 0;
      vendor.orders += 1;
    });
    return Array.from(vendorMap.values())
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 8)
      .map(v => ({ name: v.name.substring(0, 12), spent: v.spent / 100000, orders: v.orders }));
  })();

  const filteredPurchases = mockPurchases.filter(purchase => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (purchase.purchase_id || '').toLowerCase().includes(term) ||
                          (purchase.vendor_name  || '').toLowerCase().includes(term);
    const matchesStatus = filterStatus === 'all' || purchase.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (purchaseId, newStatus) => {
    setUpdatingId(purchaseId);
    try {
      await api.put(`/purchases/${purchaseId}`, { status: newStatus });
      setMockPurchases(prev =>
        prev.map(p => p.id === purchaseId ? { ...p, status: newStatus } : p)
      );
      toast.success(`Status updated to "${newStatus}"`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddPurchase = () => {
    navigate('/purchases/new');
  };

  const handleViewPurchase = (id) => {
    const purchase = mockPurchases.find(p => p.id === id);
    if (purchase) {
      toast.success(`Viewing ${purchase.purchase_id} details`);
    }
  };

  const handleDeletePurchase = (id, poId) => {
    setDeleteTarget({ id, poId });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    toast.success(`Purchase ${deleteTarget.poId} deleted successfully`);
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleUploadInvoice = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.jpg,.jpeg,.png';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        toast.success(`Invoice ${file.name} uploaded successfully`);
      }
    };
    fileInput.click();
  };

  const handleRegisterWarranty = () => {
    toast.success('Warranty registration initiated - Check your email for details');
  };

  const handleExportAnalytics = () => {
    const csv = [
      ['Month', 'Amount (₹)', 'Count'],
      ...purchaseTrendData.map(d => [d.month, d.amount, d.count])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'purchase_analytics.csv';
    link.click();
    toast.success('Analytics exported as CSV');
  };

  return (
    <AppLayout title="Purchases">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Purchase Orders</h2>
            <p className="text-sm text-gray-500 mt-0.5">{mockPurchases.length} orders total</p>
          </div>
          <button onClick={handleAddPurchase}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-blue-500/25">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            New Order
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
          {[{id:'overview',label:'Overview'},{id:'vendors',label:'Vendors'},{id:'analytics',label:'Analytics'}].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2.5 text-sm font-medium transition whitespace-nowrap border-b-2 -mb-px ${activeTab === t.id ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Total Orders', value: mockPurchases.length, cls: 'from-blue-500 to-blue-600' },
                { label: 'Total Spent', value: '₹' + (() => { const t = mockPurchases.filter(p=>p.status!=='cancelled').reduce((s,p)=>s+(parseFloat(p.total_amount)||0),0); return t>=100000?(t/100000).toFixed(1)+'L':t.toLocaleString(); })(), cls: 'from-emerald-500 to-emerald-600' },
                { label: 'Vendors', value: mockVendors.length, cls: 'from-purple-500 to-purple-600' },
                { label: 'Pending', value: mockPurchases.filter(p=>p.status==='pending').length, cls: 'from-amber-500 to-amber-600' },
                { label: 'Received', value: mockPurchases.filter(p=>p.status==='received').length, cls: 'from-teal-500 to-teal-600' },
              ].map((s,i) => (
                <div key={i} className={`bg-gradient-to-br ${s.cls} rounded-2xl p-4 text-white shadow-sm`}>
                  <p className="text-white/75 text-xs font-medium uppercase tracking-wide">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                </div>
              ))}
            </div>

            {/* All Purchases */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-gray-100 dark:border-slate-700">
                <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100">All Purchases <span className="text-gray-400 font-normal text-sm">({filteredPurchases.length})</span></h3>
                <div className="flex gap-2 flex-wrap">
                  <div className="relative">
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    <input type="text" placeholder="Search PO or vendor…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 w-44" />
                  </div>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className="px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100">
                    <option value="all">All Status</option>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                    <tr>
                      {['PO ID','Vendor','Date','Amount','Status','Action'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                    {filteredPurchases.length === 0
                      ? <tr><td colSpan={5} className="px-4 py-16 text-center text-gray-400 dark:text-slate-500">No purchases found</td></tr>
                      : filteredPurchases.map(p => {
                          const amt = parseFloat(p.total_amount) || 0;
                          const fmt = amt >= 100000 ? (amt/100000).toFixed(2)+'L' : amt.toLocaleString();
                          return (
                            <tr key={p.id} className="hover:bg-blue-50/20 dark:hover:bg-slate-700/40 transition-colors">
                              <td className="px-4 py-3 font-mono font-semibold text-blue-600 dark:text-blue-400">{p.purchase_id}</td>
                              <td className="px-4 py-3 font-medium text-gray-800 dark:text-slate-200">{p.vendor_name}</td>
                              <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{new Date(p.purchase_date).toLocaleDateString('en-IN')}</td>
                              <td className="px-4 py-3 font-semibold text-gray-900 dark:text-slate-100">₹{fmt}</td>
                              <td className="px-4 py-3">
                                <StatusDropdown purchase={p} onStatusChange={handleStatusChange} updating={updatingId === p.id} />
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => setViewingId(p.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 text-xs font-semibold border border-blue-500/20 transition-colors whitespace-nowrap">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View
                                </button>
                              </td>
                            </tr>
                          );
                        })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PURCHASES TAB */}

        {/* VENDORS TAB */}
        {activeTab === 'vendors' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-100 dark:border-slate-700">
              <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100">Vendors <span className="text-gray-400 font-normal text-sm">({mockVendors.length})</span></h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                  <tr>
                    {['Vendor Name','Contact','Email','Address','Orders','Total Spent'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                  {mockVendors.length === 0
                    ? <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 dark:text-slate-500">No vendors found</td></tr>
                    : mockVendors.map(v => (
                    <tr key={v.id} className="hover:bg-blue-50/20 dark:hover:bg-slate-700/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-slate-200">{v.name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{v.contact}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{v.email}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-slate-400 max-w-[200px] truncate">{v.address}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{v.totalPurchases}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-slate-100">₹{v.totalSpent>=100000?(v.totalSpent/100000).toFixed(2)+'L':v.totalSpent.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Purchase Trend */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-4">Purchase Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={purchaseTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="amount" fill="#3b82f6" stroke="#3b82f6" name="Amount (₹)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution & Vendor Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-4">Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} orders`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-4">Vendor Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vendorPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="spent" fill="#3b82f6" name="Amount (₹ 100K)" />
                    <Bar dataKey="orders" fill="#10b981" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">📊 Purchase Summary</h3>
                <div className="space-y-3 text-sm">
                  <p>Total Purchases: <strong>{mockPurchases.length}</strong> orders</p>
                  <p>Total Amount: <strong>₹{(() => {
                    const total = mockPurchases.filter(p => p.status !== 'cancelled').reduce((sum, p) => sum + (parseFloat(p.total_amount) || 0), 0);
                    return (total >= 100000) ? (total / 100000).toFixed(1) + 'L' : total.toLocaleString();
                  })()}</strong></p>
                  <p>Avg Order: <strong>₹{(() => {
                    const valid = mockPurchases.filter(p => p.status !== 'cancelled');
                    const avg = valid.reduce((sum, p) => sum + (parseFloat(p.total_amount) || 0), 0) / (valid.length || 1);
                    return (avg >= 100000) ? (avg / 100000).toFixed(2) + 'L' : Math.round(avg).toLocaleString();
                  })()}</strong></p>
                  <p>Top Vendor: <strong>{vendorPerformanceData[0]?.name || 'N/A'}</strong></p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">🎯 Status Breakdown</h3>
                <div className="space-y-3 text-sm">
                  <p>✅ Received: <strong>{mockPurchases.filter(p => p.status === 'received').length}</strong></p>
                  <p>📦 Shipped: <strong>{mockPurchases.filter(p => p.status === 'shipped').length}</strong></p>
                  <p>📋 Ordered: <strong>{mockPurchases.filter(p => p.status === 'ordered').length}</strong></p>
                  <p>⏳ Pending: <strong>{mockPurchases.filter(p => p.status === 'pending').length}</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Detail Modal */}
        {viewingId && (
          <PurchaseDetailModal purchaseId={viewingId} onClose={() => setViewingId(null)} />
        )}

        {/* Delete modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 text-center mb-1">Delete Purchase Order</h2>
              <p className="text-gray-500 dark:text-slate-400 text-sm text-center mb-6">Are you sure you want to delete <span className="font-semibold text-gray-800 dark:text-slate-200">{deleteTarget?.poId}</span>? This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 font-medium text-sm transition-colors">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium text-sm transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
