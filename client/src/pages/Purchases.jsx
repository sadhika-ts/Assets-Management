import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import api from '../api/axios';

// Status Badge
const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    ordered: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status] || styles.pending}`}>{status}</span>;
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
            totalSpent: parseFloat(purchase.total_amount) || 0
          });
        } else {
          const vendor = vendorMap.get(purchase.vendor_name);
          vendor.totalPurchases += 1;
          vendor.totalSpent += parseFloat(purchase.total_amount) || 0;
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
      entry.amount += parseFloat(purchase.total_amount) || 0;
      entry.count += 1;
    });
    return Array.from(trendMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  })();

  // Generate Status Distribution Data
  const categoryDistribution = (() => {
    const statusMap = new Map();
    const colors = { pending: '#FFA500', ordered: '#3b82f6', delivered: '#22c55e', cancelled: '#ef4444' };

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
      vendor.spent += parseFloat(purchase.total_amount) || 0;
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
    <AppLayout title="Purchase Management">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Purchase Orders</h2>
          <button
            onClick={handleAddPurchase}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-all"
          >
            ➕ New Purchase Order
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium transition whitespace-nowrap ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-4 py-2 font-medium transition whitespace-nowrap ${activeTab === 'vendors' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            🏢 Vendors
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 font-medium transition whitespace-nowrap ${activeTab === 'analytics' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            📈 Analytics
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                <p className="text-gray-600 text-sm font-medium">Total Purchases</p>
                <p className="text-3xl font-bold text-blue-700 mt-2">{mockPurchases.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                <p className="text-gray-600 text-sm font-medium">Total Spent</p>
                <p className="text-3xl font-bold text-green-700 mt-2">₹{(() => {
                  const total = mockPurchases.reduce((sum, p) => {
                    const amount = typeof p.total_amount === 'string' ? parseFloat(p.total_amount) : p.total_amount;
                    return sum + (isNaN(amount) ? 0 : amount);
                  }, 0);
                  return (total >= 100000) ? (total / 100000).toFixed(1) + 'L' : total.toLocaleString();
                })()}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
                <p className="text-gray-600 text-sm font-medium">Total Vendors</p>
                <p className="text-3xl font-bold text-purple-700 mt-2">{mockVendors.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
                <p className="text-gray-600 text-sm font-medium">Pending Orders</p>
                <p className="text-3xl font-bold text-orange-700 mt-2">{mockPurchases.filter(p => p.status === 'pending').length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-cyan-500">
                <p className="text-gray-600 text-sm font-medium">Delivered</p>
                <p className="text-3xl font-bold text-cyan-700 mt-2">{mockPurchases.filter(p => p.status === 'delivered').length}</p>
              </div>
            </div>

            {/* All Purchases */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">All Purchases ({mockPurchases.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">PO ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockPurchases.map(purchase => {
                      const amount = typeof purchase.total_amount === 'string' ? parseFloat(purchase.total_amount) : purchase.total_amount;
                      const formattedAmount = (amount >= 100000) ? (amount / 100000).toFixed(2) + 'L' : amount.toLocaleString();
                      return (
                        <tr key={purchase.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{purchase.purchase_id}</td>
                          <td className="px-6 py-4 text-gray-700">{purchase.vendor_name}</td>
                          <td className="px-6 py-4 text-gray-700">{new Date(purchase.purchase_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 font-medium text-gray-900">₹{formattedAmount}</td>
                          <td className="px-6 py-4"><StatusBadge status={purchase.status} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PURCHASES TAB */}

        {/* VENDORS TAB */}
        {activeTab === 'vendors' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">All Vendors ({mockVendors.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Vendor Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockVendors.map(vendor => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{vendor.name}</td>
                      <td className="px-6 py-4 text-gray-700">{vendor.contact}</td>
                      <td className="px-6 py-4 text-gray-700">{vendor.email}</td>
                      <td className="px-6 py-4 text-gray-700">{vendor.address}</td>
                      <td className="px-6 py-4 text-gray-700">{vendor.totalPurchases}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">₹{(vendor.totalSpent >= 100000) ? (vendor.totalSpent / 100000).toFixed(2) + 'L' : vendor.totalSpent.toLocaleString()}</td>
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
                    const total = mockPurchases.reduce((sum, p) => sum + (parseFloat(p.total_amount) || 0), 0);
                    return (total >= 100000) ? (total / 100000).toFixed(1) + 'L' : total.toLocaleString();
                  })()}</strong></p>
                  <p>Avg Order: <strong>₹{(() => {
                    const avg = mockPurchases.reduce((sum, p) => sum + (parseFloat(p.total_amount) || 0), 0) / mockPurchases.length;
                    return (avg >= 100000) ? (avg / 100000).toFixed(2) + 'L' : Math.round(avg).toLocaleString();
                  })()}</strong></p>
                  <p>Top Vendor: <strong>{vendorPerformanceData[0]?.name || 'N/A'}</strong></p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">🎯 Status Breakdown</h3>
                <div className="space-y-3 text-sm">
                  <p>✅ Delivered: <strong>{mockPurchases.filter(p => p.status === 'delivered').length}</strong></p>
                  <p>📦 Shipped: <strong>{mockPurchases.filter(p => p.status === 'shipped').length}</strong></p>
                  <p>📋 Ordered: <strong>{mockPurchases.filter(p => p.status === 'ordered').length}</strong></p>
                  <p>⏳ Pending: <strong>{mockPurchases.filter(p => p.status === 'pending').length}</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Delete Purchase Order</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">{deleteTarget?.poId}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                  Cancel
                </button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
