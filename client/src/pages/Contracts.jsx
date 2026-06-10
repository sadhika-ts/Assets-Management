import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import api from '../api/axios';

// Status Badge
const StatusBadge = ({ status }) => {
  const styles = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    expiring_soon: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    renewal_due: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${styles[status] || styles.active}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

// Contract Card
const ContractCard = ({ contract, onView, onRenew }) => {
  const daysUntilExpiry = Math.ceil((new Date(contract.active_till) - new Date()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry < 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-800 dark:text-slate-100">{contract.contract_name}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">ID: {contract.contract_id}</p>
        </div>
        <StatusBadge status={contract.status} />
      </div>

      <div className="space-y-2 text-sm text-gray-600 dark:text-slate-300 mb-4 border-b border-gray-100 dark:border-slate-700 pb-4">
        <p><strong>Vendor:</strong> {contract.vendor_name}</p>
        <p><strong>Value:</strong> ₹{(parseFloat(contract.contract_value) || 0).toLocaleString()}</p>
        <p><strong>Active:</strong> {new Date(contract.active_from).toLocaleDateString('en-IN')}</p>
        <p><strong>Expires:</strong> {new Date(contract.active_till).toLocaleDateString('en-IN')}</p>
        {daysUntilExpiry > 0 && (
          <p className={isExpiringSoon ? 'text-orange-600 dark:text-orange-400 font-semibold' : ''}>
            <strong>Days Left:</strong> {daysUntilExpiry} days
          </p>
        )}
        {isExpired && <p className="text-red-600 dark:text-red-400 font-semibold"><strong>Status:</strong> Expired {Math.abs(daysUntilExpiry)} days ago</p>}
      </div>

      <div className="flex gap-2">
        <button onClick={() => onView(contract.id)}
          className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition text-sm font-medium">
          View
        </button>
        <button onClick={() => onRenew(contract.id, contract.contract_id)}
          className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition text-sm font-medium">
          Renew
        </button>
      </div>
    </div>
  );
};

// Alert Card — fixed: no dynamic Tailwind class names
const ALERT_STYLES = {
  green:  { border: 'border-l-green-500',  text: 'text-green-700 dark:text-green-400'  },
  orange: { border: 'border-l-orange-500', text: 'text-orange-700 dark:text-orange-400' },
  red:    { border: 'border-l-red-500',    text: 'text-red-700 dark:text-red-400'    },
  yellow: { border: 'border-l-yellow-500', text: 'text-yellow-700 dark:text-yellow-400' },
};

const AlertCard = ({ type, title, count, color }) => {
  const s = ALERT_STYLES[color] || ALERT_STYLES.green;
  const icon = type === 'active' ? '✅' : type === 'expiring' ? '⚠️' : type === 'expired' ? '❌' : '🔄';
  return (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border-l-4 ${s.border} border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${s.text}`}>{count}</p>
        </div>
        <span className="text-5xl">{icon}</span>
      </div>
    </div>
  );
};

export const Contracts = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [renewalTarget, setRenewalTarget] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewContract, setViewContract] = useState(null);
  const [renewalNewTill, setRenewalNewTill] = useState('');
  const [renewalLoading, setRenewalLoading] = useState(false);
  const [mockContracts, setMockContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, [searchParams]);

  const fetchContracts = async () => {
    try {
      const response = await api.get('/contracts?limit=500');
      const raw = response.data?.data?.contracts || [];
      const contracts = raw.map(c => ({ ...c, contract_value: parseFloat(c.contract_value) || 0 }));
      setMockContracts(contracts);
      const shouldRefresh = searchParams.get('refresh') === 'true';
      if (shouldRefresh) toast.success('Contracts list updated!');
    } catch (error) {
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const activeContracts   = mockContracts.filter(c => c.status === 'active').length;
  const expiringWithin30  = mockContracts.filter(c => c.status === 'expiring_soon').length;
  const expiredContracts  = mockContracts.filter(c => c.status === 'expired').length;
  const renewalDue        = mockContracts.filter(c => c.status === 'renewal_due').length;

  const valueDistribution = [
    { name: 'Active',        value: activeContracts,  color: '#22c55e' },
    { name: 'Expiring Soon', value: expiringWithin30, color: '#f97316' },
    { name: 'Expired',       value: expiredContracts, color: '#ef4444' },
    { name: 'Upcoming',      value: mockContracts.filter(c => c.status === 'upcoming').length, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  const vendorContracts = (() => {
    const map = new Map();
    mockContracts.forEach(c => {
      const name = c.vendor_name || 'Unknown';
      if (!map.has(name)) map.set(name, { name: name.substring(0, 14), value: 0, count: 0 });
      map.get(name).value += c.contract_value;
      map.get(name).count += 1;
    });
    return Array.from(map.values()).sort((a, b) => b.value - a.value).slice(0, 8);
  })();

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

  const filteredContracts = mockContracts.filter(contract => {
    const name   = (contract.contract_name || '').toLowerCase();
    const vendor = (contract.vendor_name  || '').toLowerCase();
    const term   = searchTerm.toLowerCase();
    const matchesSearch  = name.includes(term) || vendor.includes(term);
    const matchesStatus  = filterStatus === 'all' || contract.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewContract = (id) => {
    const contract = mockContracts.find(c => c.id === id);
    if (contract) { setViewContract(contract); setShowViewModal(true); }
  };

  const handleRenewContract = (id, contractId) => {
    const contract = mockContracts.find(c => c.id === id);
    const currentTill = new Date(contract.active_till);
    currentTill.setFullYear(currentTill.getFullYear() + 1);
    setRenewalNewTill(currentTill.toISOString().split('T')[0]);
    setRenewalTarget({ id, contractId, contract });
    setShowRenewalModal(true);
  };

  const confirmRenewal = async () => {
    if (!renewalNewTill) { toast.error('Please select a new expiry date'); return; }
    setRenewalLoading(true);
    try {
      const newTill  = new Date(renewalNewTill);
      const today    = new Date(); today.setHours(0, 0, 0, 0);
      const daysLeft = Math.ceil((newTill - today) / (1000 * 60 * 60 * 24));
      const newStatus = newTill < today ? 'expired' : daysLeft <= 30 ? 'expiring_soon' : 'active';

      await api.put(`/contracts/${renewalTarget.id}`, { active_till: renewalNewTill, status: newStatus });
      setMockContracts(prev =>
        prev.map(c => c.id === renewalTarget.id ? { ...c, active_till: renewalNewTill, status: newStatus } : c)
      );
      toast.success(`Contract ${renewalTarget.contractId} renewed until ${new Date(renewalNewTill).toLocaleDateString('en-IN')}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to renew contract');
    } finally {
      setRenewalLoading(false);
      setShowRenewalModal(false);
      setRenewalTarget(null);
    }
  };

  const handleUploadDocument = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) { toast.success(`Document ${file.name} uploaded successfully`); setShowUploadModal(false); }
    };
    fileInput.click();
  };

  if (loading) {
    return (
      <AppLayout title="Contract Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Contract Management">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Contracts</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{mockContracts.length} contracts total</p>
          </div>
          <button onClick={() => navigate('/contracts/new')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-blue-500/25">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            New Contract
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
          {[{ id: 'overview', label: 'Overview' }, { id: 'analytics', label: 'Analytics' }, { id: 'documents', label: 'Documents' }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2.5 text-sm font-medium transition whitespace-nowrap border-b-2 -mb-px ${activeTab === t.id ? 'text-blue-600 border-blue-600' : 'text-gray-500 dark:text-slate-400 border-transparent hover:text-gray-700 dark:hover:text-slate-200'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AlertCard type="active"   title="Active Contracts"       count={activeContracts}  color="green"  />
              <AlertCard type="expiring" title="Expiring Within 30 Days" count={expiringWithin30} color="orange" />
              <AlertCard type="expired"  title="Expired Contracts"       count={expiredContracts} color="red"    />
              <AlertCard type="renewal"  title="Renewal Due"             count={renewalDue}       color="yellow" />
            </div>

            {/* Total Contract Value */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold mb-2">Total Contract Value</h3>
              <p className="text-4xl font-bold">₹{(() => {
                const total = mockContracts.reduce((sum, c) => sum + (parseFloat(c.contract_value) || 0), 0);
                return total >= 100000 ? (total / 100000).toFixed(1) + 'L' : total.toLocaleString();
              })()}</p>
              <p className="text-blue-100 mt-2">Across {mockContracts.length} contracts</p>
            </div>

            {/* Contracts Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-gray-100 dark:border-slate-700">
                <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100">
                  All Contracts <span className="text-gray-400 font-normal text-sm">({filteredContracts.length})</span>
                </h3>
                <div className="flex gap-2 flex-wrap">
                  <input type="text" placeholder="Search by name or vendor..."
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 w-48" />
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className="px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="expiring_soon">Expiring Soon</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                    <tr>
                      {['Contract ID','Name','Vendor','Value','Active From','Expires','Status','Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {filteredContracts.length === 0 ? (
                      <tr><td colSpan="8" className="px-6 py-12 text-center text-gray-400 dark:text-slate-500">No contracts found</td></tr>
                    ) : filteredContracts.map(contract => (
                      <tr key={contract.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors">
                        <td className="px-5 py-4 font-mono font-semibold text-blue-600 dark:text-blue-400">{contract.contract_id}</td>
                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-slate-200">{contract.contract_name}</td>
                        <td className="px-5 py-4 text-gray-600 dark:text-slate-300">{contract.vendor_name}</td>
                        <td className="px-5 py-4 font-semibold text-gray-900 dark:text-slate-100">₹{(parseFloat(contract.contract_value) || 0).toLocaleString()}</td>
                        <td className="px-5 py-4 text-gray-500 dark:text-slate-400">{new Date(contract.active_from).toLocaleDateString('en-IN')}</td>
                        <td className="px-5 py-4 text-gray-500 dark:text-slate-400">{new Date(contract.active_till).toLocaleDateString('en-IN')}</td>
                        <td className="px-5 py-4"><StatusBadge status={contract.status} /></td>
                        <td className="px-5 py-4">
                          <div className="flex gap-3">
                            <button onClick={() => handleViewContract(contract.id)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-xs">View</button>
                            <button onClick={() => handleRenewContract(contract.id, contract.contract_id)} className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium text-xs">Renew</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
              <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-4">Contract Timeline</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={contractTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="active"  fill="#10b981" name="Active Contracts"  />
                  <Bar dataKey="expired" fill="#ef4444" name="Expired Contracts" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
                <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-4">Status Distribution</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={valueDistribution} cx="50%" cy="50%" labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`} outerRadius={80} dataKey="value">
                      {valueDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
                <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-4">Vendor Contracts</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={vendorContracts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" name="Value (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-xl">
                <h3 className="text-base font-semibold mb-4">Statistics</h3>
                <div className="space-y-3 text-sm">
                  <p>Total Contracts: <strong>{mockContracts.length}</strong></p>
                  <p>Avg Value: <strong>₹{mockContracts.length ? Math.round(mockContracts.reduce((s, c) => s + c.contract_value, 0) / mockContracts.length).toLocaleString() : 0}</strong></p>
                  <p>Highest Value: <strong>₹{mockContracts.length ? Math.max(...mockContracts.map(c => c.contract_value)).toLocaleString() : 0}</strong></p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-xl">
                <h3 className="text-base font-semibold mb-4">Status Summary</h3>
                <div className="space-y-3 text-sm">
                  <p>Active: <strong>{activeContracts}</strong></p>
                  <p>Expiring Soon: <strong>{expiringWithin30}</strong></p>
                  <p>Renewal Due: <strong>{renewalDue}</strong></p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white p-6 rounded-xl">
                <h3 className="text-base font-semibold mb-4">Alerts</h3>
                <div className="space-y-3 text-sm">
                  <p>Expired: <strong>{expiredContracts}</strong></p>
                  <p>Action Needed: <strong>{expiringWithin30 + renewalDue}</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
            <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-4">Contract Documents</h3>
            <div className="space-y-3">
              {mockContracts.length === 0 && (
                <p className="text-center text-gray-400 dark:text-slate-500 py-12">No contracts found</p>
              )}
              {mockContracts.map(contract => (
                <div key={contract.id} className="border border-gray-100 dark:border-slate-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-slate-100">{contract.contract_name}</h4>
                      <p className="text-sm text-gray-500 dark:text-slate-400">{contract.contract_id} — {contract.vendor_name}</p>
                    </div>
                    <button onClick={() => setShowUploadModal(true)}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                      Upload
                    </button>
                  </div>
                  {!contract.document_path && (
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">No document uploaded</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Renewal Modal */}
        {showRenewalModal && renewalTarget && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
              <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-1">Renew Contract</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{renewalTarget.contractId} — {renewalTarget.contract?.contract_name}</p>
              <div className="mb-2 text-sm text-gray-600 dark:text-slate-300">
                Current expiry: <span className="font-medium">{new Date(renewalTarget.contract?.active_till).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">New Expiry Date</label>
                <input type="date" value={renewalNewTill} min={new Date().toISOString().split('T')[0]}
                  onChange={e => setRenewalNewTill(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100" />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setShowRenewalModal(false); setRenewalTarget(null); }}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                  Cancel
                </button>
                <button onClick={confirmRenewal} disabled={renewalLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 flex items-center gap-2 transition-colors">
                  {renewalLoading && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
                  Renew
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Contract Modal */}
        {showViewModal && viewContract && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-lg w-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">{viewContract.contract_name}</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{viewContract.contract_id}</p>
                </div>
                <StatusBadge status={viewContract.status} />
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-5">
                {[
                  { label: 'Vendor',         val: viewContract.vendor_name },
                  { label: 'Contract Value', val: '₹' + (parseFloat(viewContract.contract_value) || 0).toLocaleString() },
                  { label: 'Active From',    val: new Date(viewContract.active_from).toLocaleDateString('en-IN') },
                  { label: 'Expires On',     val: new Date(viewContract.active_till).toLocaleDateString('en-IN') },
                  ...(viewContract.vendor_contact ? [{ label: 'Contact', val: viewContract.vendor_contact }] : []),
                  ...(viewContract.vendor_email   ? [{ label: 'Email',   val: viewContract.vendor_email   }] : []),
                  ...(viewContract.vendor_phone   ? [{ label: 'Phone',   val: viewContract.vendor_phone   }] : []),
                ].map(({ label, val }) => (
                  <div key={label}>
                    <p className="text-gray-400 dark:text-slate-500 text-xs">{label}</p>
                    <p className="font-medium text-gray-800 dark:text-slate-100 mt-0.5">{val}</p>
                  </div>
                ))}
                {viewContract.vendor_address && (
                  <div className="col-span-2">
                    <p className="text-gray-400 dark:text-slate-500 text-xs">Address</p>
                    <p className="font-medium text-gray-800 dark:text-slate-100 mt-0.5">{viewContract.vendor_address}</p>
                  </div>
                )}
              </div>
              {(viewContract.notes || viewContract.description) && (
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-3 mb-4 text-sm">
                  <p className="text-gray-400 dark:text-slate-500 text-xs mb-1">Notes</p>
                  <p className="text-gray-700 dark:text-slate-300">{viewContract.notes || viewContract.description}</p>
                </div>
              )}
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setShowViewModal(false); setViewContract(null); }}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                  Close
                </button>
                <button onClick={() => { setShowViewModal(false); handleRenewContract(viewContract.id, viewContract.contract_id); }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Renew
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
              <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-4">Upload Contract Document</h2>
              <div className="border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                <p className="text-gray-500 dark:text-slate-400 text-sm">Drag and drop or click to upload</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">PDF, DOC, DOCX, JPG, PNG</p>
              </div>
              <div className="flex gap-3 justify-end mt-5">
                <button onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                  Cancel
                </button>
                <button onClick={handleUploadDocument}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
