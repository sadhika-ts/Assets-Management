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

      // Extract unique vendors from purchases
      const uniqueVendors = [];
      const vendorMap = new Map();

      purchases.forEach(purchase => {
        if (!vendorMap.has(purchase.vendor_name)) {
          vendorMap.set(purchase.vendor_name, {
            id: purchase.vendor_name,
            name: purchase.vendor_name,
            contact: purchase.vendor_contact || 'N/A',
            email: purchase.vendor_email || 'N/A',
            address: purchase.vendor_address || 'N/A',
            totalPurchases: 1,
            totalSpent: parseFloat(purchase.total_amount) || 0,
            rating: 4.5
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

  const purchaseTrendData = [];

  const categoryDistribution = [];

  const vendorPerformanceData = [];

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
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 font-medium transition whitespace-nowrap ${activeTab === 'purchases' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            📦 Purchases
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

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button onClick={handleUploadInvoice} className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium transition text-sm">
                  📄 Upload Invoice
                </button>
                <button onClick={handleRegisterWarranty} className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium transition text-sm">
                  ✅ Register Warranty
                </button>
                <button onClick={handleExportAnalytics} className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 font-medium transition text-sm">
                  📊 Export Report
                </button>
                <button onClick={() => setActiveTab('vendors')} className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 font-medium transition text-sm">
                  🏢 View Vendors
                </button>
              </div>
            </div>

            {/* Recent Purchases */}
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
        {activeTab === 'purchases' && (
          <div className="space-y-6">
            {/* Search & Filter */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Purchases</label>
                  <input
                    type="text"
                    placeholder="Search by PO ID or vendor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="ordered">Ordered</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex justify-end">
              <button
                onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium transition"
              >
                {viewMode === 'card' ? '📋 List View' : '⊞ Card View'}
              </button>
            </div>

            {/* Purchases Display */}
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPurchases.map(purchase => (
                  <PurchaseCard
                    key={purchase.id}
                    purchase={purchase}
                    onView={handleViewPurchase}
                    onDelete={handleDeletePurchase}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">PO ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Invoice</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPurchases.map(purchase => (
                      <tr key={purchase.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{purchase.purchase_id}</td>
                        <td className="px-6 py-4 text-gray-700">{purchase.vendor_name}</td>
                        <td className="px-6 py-4 text-gray-700">{purchase.purchase_date}</td>
                        <td className="px-6 py-4 text-gray-700">{purchase.invoice_number}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">₹{(purchase.total_amount / 100000).toFixed(2)}L</td>
                        <td className="px-6 py-4"><StatusBadge status={purchase.status} /></td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => handleViewPurchase(purchase.id)} className="text-blue-600 hover:text-blue-800 font-medium">View</button>
                            <button onClick={() => handleDeletePurchase(purchase.id, purchase.purchase_id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VENDORS TAB */}
        {activeTab === 'vendors' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockVendors.map(vendor => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  onView={handleViewPurchase}
                />
              ))}
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
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Category Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ₹${(value / 100000).toFixed(1)}L`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
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
                  <p>Total Amount: <strong>₹{(mockPurchases.reduce((sum, p) => sum + p.total_amount, 0) / 100000).toFixed(1)}L</strong></p>
                  <p>Avg Order: <strong>₹{Math.round(mockPurchases.reduce((sum, p) => sum + p.total_amount, 0) / mockPurchases.length / 100000 * 100)}K</strong></p>
                  <p>Top Vendor: <strong>{mockVendors[3].name}</strong></p>
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
