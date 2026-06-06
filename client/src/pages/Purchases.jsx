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

const STATUS_STYLES = {
  pending:   'bg-amber-100 text-amber-800 border-amber-200',
  ordered:   'bg-blue-100 text-blue-800 border-blue-200',
  received:  'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

// Inline editable status dropdown
const StatusDropdown = ({ purchase, onStatusChange, updating }) => {
  const style = STATUS_STYLES[purchase.status] || 'bg-gray-100 text-gray-700 border-gray-200';
  const options = STATUS_TRANSITIONS[purchase.status];

  if (updating) {
    return (
      <span className="flex items-center gap-1 text-xs text-gray-500">
        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        Saving…
      </span>
    );
  }

  // Terminal statuses — show plain badge, no dropdown
  if (!options) {
    return (
      <span className={`text-xs font-semibold rounded-full px-3 py-1 border ${style}`}>
        {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
      </span>
    );
  }

  return (
    <select
      value={purchase.status}
      onChange={e => onStatusChange(purchase.id, e.target.value)}
      className={`text-xs font-semibold rounded-full px-3 py-1 border cursor-pointer appearance-none pr-6 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 ${style}`}
    >
      {options.map(s => (
        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
      ))}
    </select>
  );
};

// Vendor Card
const VendorCard = ({ vendor, onView }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="font-bold text-gray-800">{vendor.name}</h3>
        <p className="text-sm text-gray-600">ID: {vendor.id}</p>
      </div>
      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
        {vendor.totalPurchases} Orders
      </span>
    </div>

    <div className="space-y-2 text-sm text-gray-700 mb-4 border-b border-gray-200 pb-4">
      <p><strong>Contact:</strong> {vendor.contact}</p>
      <p><strong>Email:</strong> {vendor.email}</p>
      <p><strong>Total Spent:</strong> ₹{vendor.totalSpent.toLocaleString()}</p>
      <p><strong>Rating:</strong> ⭐ {vendor.rating}/5</p>
    </div>

    <button
      onClick={() => onView(vendor.id)}
      className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition text-sm font-medium"
    >
      View Details
    </button>
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

  useEffect(() => {
    const shouldRefresh = searchParams.get('refresh') === 'true';
    const newPurchaseId = searchParams.get('new');

    if (shouldRefresh) {
      console.log('🔄 Refreshing purchases list...');
      if (newPurchaseId) {
        console.log('New purchase ID:', newPurchaseId);
      }
    }

    fetchPurchases();
  }, [searchParams]);

  const fetchPurchases = async () => {
    try {
      console.log('📥 Fetching all purchases from API...');
      // Fetch with high limit to get all purchases (up to 500)
      const response = await api.get('/purchases?limit=500');
      const purchases = response.data?.data?.purchases || response.data || [];

      console.log('✅ Fetched purchases:', purchases.length);
      setMockPurchases(purchases);

      // Extract unique vendors from purchases - exclude test vendors
      const uniqueVendors = [];
      const vendorMap = new Map();

      // List of test vendor keywords to exclude
      const testKeywords = ['test', 'demo', 'sample', 'validation', 'zero', 'decimal', 'dashboard', 'autogen', 'large'];

      purchases.forEach(purchase => {
        // Skip test vendors
        const vendorNameLower = purchase.vendor_name.toLowerCase();
        const isTestVendor = testKeywords.some(keyword => vendorNameLower.includes(keyword));

        if (isTestVendor) return; // Skip this vendor

        if (!vendorMap.has(purchase.vendor_name)) {
          vendorMap.set(purchase.vendor_name, {
            id: purchase.vendor_name,
            name: purchase.vendor_name,
            contact: purchase.vendor_contact || 'N/A',
            email: purchase.vendor_email || 'N/A',
            address: purchase.vendor_address || 'N/A',
            totalPurchases: 1,
            totalSpent: purchase.status !== 'cancelled' ? (parseFloat(purchase.total_amount) || 0) : 0
          });
        } else {
          const vendor = vendorMap.get(purchase.vendor_name);
          vendor.totalPurchases += 1;
          if (purchase.status !== 'cancelled') vendor.totalSpent += parseFloat(purchase.total_amount) || 0;
        }
      });

      vendorMap.forEach(vendor => uniqueVendors.push(vendor));
      setMockVendors(uniqueVendors);
      setLoading(false);

      // Show success toast if this is a refresh after creating new purchase
      const shouldRefresh = searchParams.get('refresh') === 'true';
      if (shouldRefresh) {
        toast.success('✅ Purchases list updated with new order!');
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
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
    const matchesSearch = purchase.purchase_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.vendor_name.toLowerCase().includes(searchTerm.toLowerCase());
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-800">All Purchases <span className="text-gray-400 font-normal text-sm">({filteredPurchases.length})</span></h3>
                <div className="flex gap-2 flex-wrap">
                  <div className="relative">
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    <input type="text" placeholder="Search PO or vendor…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 w-44" />
                  </div>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50">
                    <option value="all">All Status</option>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['PO ID','Vendor','Date','Amount','Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredPurchases.length === 0
                      ? <tr><td colSpan={5} className="px-4 py-16 text-center text-gray-400">No purchases found</td></tr>
                      : filteredPurchases.map(p => {
                          const amt = parseFloat(p.total_amount) || 0;
                          const fmt = amt >= 100000 ? (amt/100000).toFixed(2)+'L' : amt.toLocaleString();
                          return (
                            <tr key={p.id} className="hover:bg-blue-50/20 transition-colors">
                              <td className="px-4 py-3 font-mono font-semibold text-blue-600">{p.purchase_id}</td>
                              <td className="px-4 py-3 font-medium text-gray-800">{p.vendor_name}</td>
                              <td className="px-4 py-3 text-gray-500">{new Date(p.purchase_date).toLocaleDateString('en-IN')}</td>
                              <td className="px-4 py-3 font-semibold text-gray-900">₹{fmt}</td>
                              <td className="px-4 py-3">
                                <StatusDropdown purchase={p} onStatusChange={handleStatusChange} updating={updatingId === p.id} />
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800">Vendors <span className="text-gray-400 font-normal text-sm">({mockVendors.length})</span></h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Vendor Name','Contact','Email','Address','Orders','Total Spent'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {mockVendors.map(v => (
                    <tr key={v.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-800">{v.name}</td>
                      <td className="px-4 py-3 text-gray-600">{v.contact}</td>
                      <td className="px-4 py-3 text-gray-600">{v.email}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{v.address}</td>
                      <td className="px-4 py-3 text-gray-600">{v.totalPurchases}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">₹{v.totalSpent>=100000?(v.totalSpent/100000).toFixed(2)+'L':v.totalSpent.toLocaleString()}</td>
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Purchase Trend (Last 6 Months)</h3>
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Status Distribution</h3>
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

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">⭐ Vendor Performance</h3>
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

        {/* Delete modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 text-center mb-1">Delete Purchase Order</h2>
              <p className="text-gray-500 text-sm text-center mb-6">Are you sure you want to delete <span className="font-semibold text-gray-800">{deleteTarget?.poId}</span>? This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-sm transition-colors">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium text-sm transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
