import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import api from '../api/axios';

// Status Badge
const StatusBadge = ({ status }) => {
  const styles = {
    active: 'bg-green-100 text-green-800',
    expiring_soon: 'bg-orange-100 text-orange-800',
    expired: 'bg-red-100 text-red-800',
    renewal_due: 'bg-yellow-100 text-yellow-800'
  };
  return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status] || styles.active}`}>{status.replace('_', ' ')}</span>;
};

// Contract Card
const ContractCard = ({ contract, onView, onRenew, onDelete }) => {
  const daysUntilExpiry = Math.ceil((new Date(contract.active_till) - new Date()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry < 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-800">{contract.contract_name}</h3>
          <p className="text-sm text-gray-600">ID: {contract.contract_id}</p>
        </div>
        <StatusBadge status={contract.status} />
      </div>

      <div className="space-y-2 text-sm text-gray-700 mb-4 border-b border-gray-200 pb-4">
        <p><strong>Vendor:</strong> {contract.vendor_name}</p>
        <p><strong>Value:</strong> ₹{(parseFloat(contract.contract_value) || 0).toLocaleString()}</p>
        <p><strong>Active:</strong> {new Date(contract.active_from).toLocaleDateString('en-IN')}</p>
        <p><strong>Expires:</strong> {new Date(contract.active_till).toLocaleDateString('en-IN')}</p>
        {daysUntilExpiry > 0 && <p className={isExpiringSoon ? 'text-orange-600 font-semibold' : 'text-gray-600'}><strong>Days Left:</strong> {daysUntilExpiry} days</p>}
        {isExpired && <p className="text-red-600 font-semibold"><strong>Status:</strong> Expired {Math.abs(daysUntilExpiry)} days ago</p>}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView(contract.id)}
          className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition text-sm font-medium"
        >
          View
        </button>
        <button
          onClick={() => onRenew(contract.id, contract.contract_id)}
          className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition text-sm font-medium"
        >
          Renew
        </button>
        <button
          onClick={() => onDelete(contract.id, contract.contract_id)}
          className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

// Alert Card
const AlertCard = ({ type, title, count, color }) => (
  <div className={`bg-white p-6 rounded-lg shadow-sm border-l-4 border-${color}-500 hover:shadow-md transition-all`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className={`text-3xl font-bold text-${color}-700 mt-2`}>{count}</p>
      </div>
      <span className="text-5xl">{type === 'active' ? '✅' : type === 'expiring' ? '⚠️' : type === 'expired' ? '❌' : '🔄'}</span>
    </div>
  </div>
);

export const Contracts = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('card');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [renewalTarget, setRenewalTarget] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [mockContracts, setMockContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const shouldRefresh = searchParams.get('refresh') === 'true';
    const newContractId = searchParams.get('new');

    if (shouldRefresh) {
      console.log('🔄 Refreshing contracts list...');
      if (newContractId) {
        console.log('New contract ID:', newContractId);
      }
    }

    fetchContracts();
  }, [searchParams]);

  const fetchContracts = async () => {
    try {
      const response = await api.get('/contracts?limit=500');
      const raw = response.data?.data?.contracts || [];
      // Normalize contract_value to number
      const contracts = raw.map(c => ({
        ...c,
        contract_value: parseFloat(c.contract_value) || 0
      }));
      setMockContracts(contracts);
      setLoading(false);
      const shouldRefresh = searchParams.get('refresh') === 'true';
      if (shouldRefresh) toast.success('✅ Contracts list updated!');
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setLoading(false);
    }
  };

  // Calculate dashboard widgets
  const activeContracts = mockContracts.filter(c => c.status === 'active').length;
  const expiringWithin30 = mockContracts.filter(c => c.status === 'expiring_soon').length;
  const expiredContracts = mockContracts.filter(c => c.status === 'expired').length;
  const renewalDue = mockContracts.filter(c => c.status === 'renewal_due').length;

  // Status distribution for pie chart
  const valueDistribution = [
    { name: 'Active', value: mockContracts.filter(c => c.status === 'active').length, color: '#22c55e' },
    { name: 'Expiring Soon', value: mockContracts.filter(c => c.status === 'expiring_soon').length, color: '#f97316' },
    { name: 'Expired', value: mockContracts.filter(c => c.status === 'expired').length, color: '#ef4444' },
    { name: 'Upcoming', value: mockContracts.filter(c => c.status === 'upcoming').length, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  // Contract value by vendor (top 8)
  const vendorContracts = (() => {
    const map = new Map();
    mockContracts.forEach(c => {
      if (!map.has(c.vendor_name)) map.set(c.vendor_name, { name: c.vendor_name.substring(0, 14), value: 0, count: 0 });
      map.get(c.vendor_name).value += c.contract_value;
      map.get(c.vendor_name).count += 1;
    });
    return Array.from(map.values()).sort((a, b) => b.value - a.value).slice(0, 8);
  })();

  // Timeline: contracts by expiry month
  const contractTimelineData = (() => {
    const map = new Map();
    mockContracts.forEach(c => {
      const d = new Date(c.active_till);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!map.has(key)) map.set(key, { month: label, active: 0, expired: 0 });
      if (c.status === 'expired') map.get(key).expired += 1;
      else map.get(key).active += 1;
    });
    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
  })();

  // Filter contracts
  const filteredContracts = mockContracts.filter(contract => {
    const matchesSearch = contract.contract_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.vendor_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddContract = () => {
    navigate('/contracts/new');
  };

  const handleViewContract = (id) => {
    const contract = mockContracts.find(c => c.id === id);
    if (contract) {
      toast.success(`Viewing ${contract.contract_id} - ${contract.vendor_name}`);
    }
  };

  const handleDeleteContract = (id, contractId) => {
    setDeleteTarget({ id, contractId });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/contracts/${deleteTarget.id}`);
      toast.success(`Contract ${deleteTarget.contractId} deleted successfully`);
      setMockContracts(prev => prev.filter(c => c.id !== deleteTarget.id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete contract');
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleRenewContract = (id, contractId) => {
    setRenewalTarget({ id, contractId });
    setShowRenewalModal(true);
  };

  const confirmRenewal = () => {
    const newDate = new Date();
    newDate.setFullYear(newDate.getFullYear() + 1);
    toast.success(`Contract ${renewalTarget.contractId} renewed until ${newDate.toLocaleDateString()}`);
    setShowRenewalModal(false);
    setRenewalTarget(null);
  };

  const handleUploadDocument = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        toast.success(`Document ${file.name} uploaded successfully`);
        setShowUploadModal(false);
      }
    };
    fileInput.click();
  };

  return (
    <AppLayout title="Contract Management">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Contracts</h2>
          <button
            onClick={handleAddContract}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-all"
          >
            ➕ New Contract
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
            onClick={() => setActiveTab('contracts')}
            className={`px-4 py-2 font-medium transition whitespace-nowrap ${activeTab === 'contracts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            📋 Contracts
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 font-medium transition whitespace-nowrap ${activeTab === 'analytics' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            📈 Analytics
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 font-medium transition whitespace-nowrap ${activeTab === 'documents' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            📄 Documents
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Dashboard Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AlertCard type="active" title="Active Contracts" count={activeContracts} color="green" />
              <AlertCard type="expiring" title="Expiring Within 30 Days" count={expiringWithin30} color="orange" />
              <AlertCard type="expired" title="Expired Contracts" count={expiredContracts} color="red" />
              <AlertCard type="renewal" title="Renewal Due" count={renewalDue} color="yellow" />
            </div>

            {/* Total Contract Value */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-2">Total Contract Value</h3>
              <p className="text-4xl font-bold">₹{(() => {
                const total = mockContracts.reduce((sum, c) => sum + (parseFloat(c.contract_value) || 0), 0);
                return total >= 100000 ? (total / 100000).toFixed(1) + 'L' : total.toLocaleString();
              })()}</p>
              <p className="text-blue-100 mt-2">Across {mockContracts.length} contracts</p>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium transition text-sm"
                >
                  📄 Upload Document
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium transition text-sm"
                >
                  📊 View Analytics
                </button>
                <button
                  onClick={() => toast.success('Renewal reminders enabled')}
                  className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 font-medium transition text-sm"
                >
                  🔔 Send Reminders
                </button>
                <button
                  onClick={() => toast.success('Statuses updated')}
                  className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 font-medium transition text-sm"
                >
                  🔄 Auto Update Status
                </button>
              </div>
            </div>

            {/* Recent Expiring Contracts */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">⚠️ Contracts Expiring Soon</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Contract ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Expires</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Days Left</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockContracts.filter(c => c.status !== 'expired' && c.status !== 'active').map(contract => {
                      const daysLeft = Math.ceil((new Date(contract.active_till) - new Date()) / (1000 * 60 * 60 * 24));
                      return (
                        <tr key={contract.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{contract.contract_id}</td>
                          <td className="px-6 py-4 text-gray-700">{contract.contract_name}</td>
                          <td className="px-6 py-4 text-gray-700">{contract.vendor_name}</td>
                          <td className="px-6 py-4 text-gray-700">{new Date(contract.active_till).toLocaleDateString('en-IN')}</td>
                          <td className="px-6 py-4"><span className={daysLeft > 0 ? 'text-orange-600 font-semibold' : 'text-red-600 font-semibold'}>{daysLeft > 0 ? daysLeft : 'Expired'}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CONTRACTS TAB */}
        {activeTab === 'contracts' && (
          <div className="space-y-6">
            {/* Search & Filter */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Contracts</label>
                  <input
                    type="text"
                    placeholder="Search by name or vendor..."
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
                    <option value="active">Active</option>
                    <option value="expiring_soon">Expiring Soon</option>
                    <option value="expired">Expired</option>
                    <option value="renewal_due">Renewal Due</option>
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

            {/* Contracts Display */}
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContracts.map(contract => (
                  <ContractCard
                    key={contract.id}
                    contract={contract}
                    onView={handleViewContract}
                    onRenew={handleRenewContract}
                    onDelete={handleDeleteContract}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Contract ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Expires</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredContracts.map(contract => (
                      <tr key={contract.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{contract.contract_id}</td>
                        <td className="px-6 py-4 text-gray-700">{contract.contract_name}</td>
                        <td className="px-6 py-4 text-gray-700">{contract.vendor_name}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">₹{(parseFloat(contract.contract_value) || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-gray-700">{new Date(contract.active_till).toLocaleDateString('en-IN')}</td>
                        <td className="px-6 py-4"><StatusBadge status={contract.status} /></td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => handleViewContract(contract.id)} className="text-blue-600 hover:text-blue-800 font-medium">View</button>
                            <button onClick={() => handleRenewContract(contract.id, contract.contract_id)} className="text-green-600 hover:text-green-800 font-medium">Renew</button>
                            <button onClick={() => handleDeleteContract(contract.id, contract.contract_id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
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

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Contract Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Contract Timeline</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={contractTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="active" fill="#10b981" name="Active Contracts" />
                  <Bar dataKey="expired" fill="#ef4444" name="Expired Contracts" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Value Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Contract Value Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={valueDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {valueDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🏢 Vendor Contracts</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vendorContracts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3b82f6" name="Value (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Contract Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">📊 Statistics</h3>
                <div className="space-y-3 text-sm">
                  <p>Total Contracts: <strong>{mockContracts.length}</strong></p>
                  <p>Avg Contract Value: <strong>₹{mockContracts.length ? Math.round(mockContracts.reduce((sum, c) => sum + c.contract_value, 0) / mockContracts.length).toLocaleString() : 0}</strong></p>
                  <p>Highest Value: <strong>₹{mockContracts.length ? Math.max(...mockContracts.map(c => c.contract_value)).toLocaleString() : 0}</strong></p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">✅ Status Summary</h3>
                <div className="space-y-3 text-sm">
                  <p>Active: <strong>{activeContracts}</strong></p>
                  <p>Expiring Soon: <strong>{expiringWithin30}</strong></p>
                  <p>Renewal Due: <strong>{renewalDue}</strong></p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">🔔 Alerts</h3>
                <div className="space-y-3 text-sm">
                  <p>Expired: <strong>{expiredContracts}</strong></p>
                  <p>Renewal Overdue: <strong>{Math.max(0, renewalDue - 1)}</strong></p>
                  <p>Action Needed: <strong>{expiringWithin30 + renewalDue}</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📄 Contract Documents</h3>
              <div className="space-y-4">
                {mockContracts.map(contract => (
                  <div key={contract.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-800">{contract.contract_name}</h4>
                        <p className="text-sm text-gray-600">{contract.contract_id} — {contract.vendor_name}</p>
                      </div>
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        📤 Upload
                      </button>
                    </div>
                    {contract.document_path && (
                      <div className="mt-3 flex items-center gap-3 bg-gray-50 p-2 rounded">
                        <span className="text-xl">📄</span>
                        <span className="text-sm text-gray-700">{contract.document_path}</span>
                      </div>
                    )}
                    {!contract.document_path && (
                      <p className="text-xs text-gray-400 mt-2">No document uploaded</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Delete Contract</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">{deleteTarget?.contractId}</span>? This action cannot be undone.
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

        {/* Renewal Confirmation Modal */}
        {showRenewalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Renew Contract</h2>
              <p className="text-gray-600 mb-6">
                Do you want to renew <span className="font-semibold">{renewalTarget?.contractId}</span> for another year?
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowRenewalModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                  Cancel
                </button>
                <button onClick={confirmRenewal} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Renew
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Document Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Upload Contract Document</h2>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
                  <p className="text-gray-600">📄 Drag and drop or click to upload</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                  Cancel
                </button>
                <button onClick={handleUploadDocument} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
