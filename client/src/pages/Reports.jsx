import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '../layouts/AppLayout';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../api/axios';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#84cc16'];

const StatCard = ({ label, value, color = 'blue' }) => {
  const colorMap = {
    blue: 'from-blue-50 to-blue-100 border-blue-500 text-blue-700',
    green: 'from-green-50 to-green-100 border-green-500 text-green-700',
    orange: 'from-orange-50 to-orange-100 border-orange-500 text-orange-700',
    red: 'from-red-50 to-red-100 border-red-500 text-red-700',
    purple: 'from-purple-50 to-purple-100 border-purple-500 text-purple-700',
  };
  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} p-5 rounded-lg border-l-4`}>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${colorMap[color].split(' ').pop()}`}>{value}</p>
    </div>
  );
};

const ExportModal = ({ isOpen, onClose, reportName, onExport }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Export — {reportName}</h2>
        <div className="space-y-3 mb-6">
          <button onClick={() => onExport('csv')} className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium transition flex items-center gap-2">
            <span>📋</span> Export as CSV
          </button>
          <button onClick={() => onExport('excel')} className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium transition flex items-center gap-2">
            <span>📊</span> Export as Excel (CSV)
          </button>
          <button onClick={() => onExport('json')} className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 font-medium transition flex items-center gap-2">
            <span>📄</span> Export as JSON
          </button>
        </div>
        <button onClick={onClose} className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium">
          Cancel
        </button>
      </div>
    </div>
  );
};

const EmptyChart = ({ message = 'No data available' }) => (
  <div className="flex items-center justify-center h-full text-gray-400 text-sm">{message}</div>
);

export const Reports = () => {
  const [activeTab, setActiveTab] = useState('assets');
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState('');
  const [exportData, setExportData] = useState([]);

  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2026-12-31');
  const [filterAssetType, setFilterAssetType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterContractStatus, setFilterContractStatus] = useState('all');

  const [assets, setAssets] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  const extractArray = (res, ...keys) => {
    const d = res?.data;
    if (Array.isArray(d)) return d;
    if (d?.data) {
      for (const k of keys) {
        if (Array.isArray(d.data[k])) return d.data[k];
      }
      if (Array.isArray(d.data)) return d.data;
    }
    return [];
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [aRes, pRes, cRes] = await Promise.all([
          api.get('/assets?limit=100'),
          api.get('/purchases'),
          api.get('/contracts'),
        ]);
        setAssets(extractArray(aRes, 'assets'));
        setPurchases(extractArray(pRes, 'purchases'));
        setContracts(extractArray(cRes, 'contracts'));
      } catch (err) {
        toast.error('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ---- Filtered assets ----
  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      if (a.created_at) {
        const createdAt = new Date(a.created_at);
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        if (createdAt < from || createdAt > to) return false;
      }
      if (filterAssetType !== 'all') {
        if (filterAssetType === 'it' && a.category !== 'IT') return false;
        if (filterAssetType === 'non-it' && a.category !== 'Non-IT') return false;
      }
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      return true;
    });
  }, [assets, dateFrom, dateTo, filterAssetType, filterStatus]);

  // ---- Filtered contracts ----
  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      if (filterContractStatus !== 'all' && c.status !== filterContractStatus) return false;
      return true;
    });
  }, [contracts, filterContractStatus]);

  // ---- Asset analytics ----
  const assetStats = useMemo(() => {
    const categoryMap = {};
    const subTypeMap = {};
    filteredAssets.forEach(a => {
      categoryMap[a.category] = (categoryMap[a.category] || 0) + 1;
      const key = a.sub_type || 'Unknown';
      subTypeMap[key] = (subTypeMap[key] || 0) + 1;
    });

    const categoryWise = Object.entries(categoryMap).map(([name, count], i) => ({
      name, count, color: COLORS[i % COLORS.length]
    }));
    const subTypeWise = Object.entries(subTypeMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    const assigned = filteredAssets.filter(a => a.assigned_to).length;
    const unassigned = filteredAssets.length - assigned;

    const statusMap = {};
    filteredAssets.forEach(a => {
      statusMap[a.status] = (statusMap[a.status] || 0) + 1;
    });
    const statusWise = Object.entries(statusMap).map(([name, count], i) => ({
      name, count, color: COLORS[i % COLORS.length]
    }));

    return { categoryWise, subTypeWise, assigned, unassigned, statusWise, total: filteredAssets.length };
  }, [filteredAssets]);

  // ---- Purchase analytics ----
  const purchaseStats = useMemo(() => {
    const filteredPurchases = purchases.filter(p => {
      const d = new Date(p.purchase_date);
      return d >= new Date(dateFrom) && d <= new Date(dateTo);
    });

    const monthMap = {};
    const vendorMap = {};
    filteredPurchases.forEach(p => {
      const month = p.purchase_date ? p.purchase_date.slice(0, 7) : 'Unknown';
      monthMap[month] = (monthMap[month] || 0) + (parseFloat(p.total_amount) || 0);
      const v = p.vendor_name || 'Unknown';
      vendorMap[v] = (vendorMap[v] || 0) + (parseFloat(p.total_amount) || 0);
    });

    const monthly = Object.entries(monthMap).sort().map(([month, amount]) => ({
      month: month.replace('-', '/'),
      amount,
      count: filteredPurchases.filter(p => p.purchase_date?.startsWith(month)).length
    }));

    const vendorWise = Object.entries(vendorMap).map(([vendor, spent]) => ({ vendor, spent }));
    const totalSpend = filteredPurchases.reduce((s, p) => s + (parseFloat(p.total_amount) || 0), 0);

    return { monthly, vendorWise, total: filteredPurchases.length, totalSpend };
  }, [purchases, dateFrom, dateTo]);

  // ---- Contract analytics ----
  const contractStats = useMemo(() => {
    const today = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);

    const active = filteredContracts.filter(c => c.status === 'active').length;
    const expired = filteredContracts.filter(c => c.status === 'expired').length;
    const expiring = filteredContracts.filter(c => {
      if (c.status !== 'active') return false;
      const till = new Date(c.active_till);
      return till >= today && till <= thirtyDays;
    }).length;

    const totalValue = filteredContracts.reduce((s, c) => s + (parseFloat(c.contract_value) || 0), 0);
    const vendorMap = {};
    filteredContracts.forEach(c => {
      const v = c.vendor_name || 'Unknown';
      vendorMap[v] = (vendorMap[v] || 0) + 1;
    });
    const vendorWise = Object.entries(vendorMap).map(([vendor, count]) => ({ vendor, count }));

    return { active, expired, expiring, total: filteredContracts.length, totalValue, vendorWise };
  }, [filteredContracts]);

  // ---- Maintenance analytics ----
  const maintenanceStats = useMemo(() => {
    const needingService = filteredAssets.filter(a => a.status === 'maintenance').length;
    const retired = filteredAssets.filter(a => a.status === 'retired').length;
    return { needingService, retired };
  }, [filteredAssets]);

  // ---- Frequently used ----
  const frequentStats = useMemo(() => {
    const subTypeMap = {};
    filteredAssets.forEach(a => {
      const key = a.sub_type || 'Unknown';
      subTypeMap[key] = (subTypeMap[key] || 0) + 1;
    });
    const mostUsedCategories = Object.entries(subTypeMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([category, usage]) => ({ category, usage }));

    const assigneeMap = {};
    filteredAssets.filter(a => a.assigned_to).forEach(a => {
      assigneeMap[a.assigned_to] = (assigneeMap[a.assigned_to] || 0) + 1;
    });
    const mostAssigned = Object.entries(assigneeMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    const maxCount = mostAssigned[0]?.count || 1;
    return { mostUsedCategories, mostAssigned, maxCount };
  }, [filteredAssets]);

  // ---- Export helpers ----
  const toCSV = (rows, headers) => {
    const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [headers.map(escape).join(',')];
    rows.forEach(row => lines.push(headers.map(h => escape(row[h])).join(',')));
    return lines.join('\n');
  };

  const downloadFile = (content, filename, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getReportRows = (reportName) => {
    switch (reportName) {
      case 'Assets Report':
        return {
          rows: filteredAssets.map(a => ({
            asset_tag: a.asset_tag, name: a.asset_name, category: a.category,
            sub_type: a.sub_type, status: a.status, assigned_to: a.assigned_to || 'Unassigned',
            created_at: a.created_at
          })),
          headers: ['asset_tag', 'name', 'category', 'sub_type', 'status', 'assigned_to', 'created_at']
        };
      case 'Purchases Report':
        return {
          rows: purchases.map(p => ({
            purchase_id: p.purchase_id, vendor_name: p.vendor_name,
            purchase_date: p.purchase_date, total_amount: p.total_amount, status: p.status
          })),
          headers: ['purchase_id', 'vendor_name', 'purchase_date', 'total_amount', 'status']
        };
      case 'Contracts Report':
        return {
          rows: filteredContracts.map(c => ({
            contract_id: c.contract_id, contract_name: c.contract_name, vendor_name: c.vendor_name,
            active_from: c.active_from, active_till: c.active_till, status: c.status,
            contract_value: c.contract_value
          })),
          headers: ['contract_id', 'contract_name', 'vendor_name', 'active_from', 'active_till', 'status', 'contract_value']
        };
      default:
        return { rows: filteredAssets, headers: ['asset_tag', 'category', 'sub_type', 'status'] };
    }
  };

  const handleGenerateReport = (reportName) => {
    setSelectedReport(reportName);
    setShowExportModal(true);
  };

  const handleExport = (format) => {
    const slug = selectedReport.toLowerCase().replace(/\s+/g, '_');
    const { rows, headers } = getReportRows(selectedReport);

    if (format === 'json') {
      downloadFile(JSON.stringify(rows, null, 2), `${slug}.json`, 'application/json');
    } else {
      const csv = toCSV(rows, headers);
      const ext = format === 'excel' ? 'xlsx' : 'csv';
      const mime = format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv';
      downloadFile(csv, `${slug}.${ext}`, mime);
    }
    toast.success(`${selectedReport} exported as ${format.toUpperCase()}`);
    setShowExportModal(false);
  };

  const formatCurrency = (v) => {
    if (!v && v !== 0) return '—';
    return `₹${(v / 100000).toFixed(1)}L`;
  };

  if (loading) {
    return (
      <AppLayout title="Reports & Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading report data…</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Reports & Analytics">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
          <button
            onClick={() => { setLoading(true); window.location.reload(); }}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-medium transition-all text-sm"
          >
            Refresh Data
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Filters</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Asset Type</label>
              <select value={filterAssetType} onChange={e => setFilterAssetType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">All Types</option>
                <option value="it">IT Assets</option>
                <option value="non-it">Non-IT Assets</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Asset Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contract Status</label>
              <select value={filterContractStatus} onChange={e => setFilterContractStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
          {[
            { id: 'assets', label: 'Assets' },
            { id: 'purchases', label: 'Purchases' },
            { id: 'contracts', label: 'Contracts' },
            { id: 'maintenance', label: 'Maintenance' },
            { id: 'frequently', label: 'Frequently Used' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 font-medium text-sm transition whitespace-nowrap border-b-2 -mb-px ${
                activeTab === tab.id ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== ASSETS TAB ===== */}
        {activeTab === 'assets' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Assets" value={assetStats.total} color="blue" />
              <StatCard label="Assigned" value={assetStats.assigned} color="green" />
              <StatCard label="Unassigned" value={assetStats.unassigned} color="orange" />
              <StatCard label="In Maintenance" value={maintenanceStats.needingService} color="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">Category Distribution</h3>
                  <button onClick={() => handleGenerateReport('Assets Report')}
                    className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition">
                    Export
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  {assetStats.categoryWise.length > 0 ? (
                    <PieChart>
                      <Pie data={assetStats.categoryWise} cx="50%" cy="50%" outerRadius={90}
                        dataKey="count" label={({ name, count }) => `${name}: ${count}`} labelLine={false}>
                        {assetStats.categoryWise.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, 'Count']} />
                      <Legend />
                    </PieChart>
                  ) : <EmptyChart />}
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">Asset Status Breakdown</h3>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  {assetStats.statusWise.length > 0 ? (
                    <PieChart>
                      <Pie data={assetStats.statusWise} cx="50%" cy="50%" outerRadius={90}
                        dataKey="count" label={({ name, count }) => `${name}: ${count}`} labelLine={false}>
                        {assetStats.statusWise.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  ) : <EmptyChart />}
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Assets by Sub-Type</h3>
                <button onClick={() => handleGenerateReport('Assets Report')}
                  className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition">
                  Export
                </button>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                {assetStats.subTypeWise.length > 0 ? (
                  <BarChart data={assetStats.subTypeWise} margin={{ bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-30} textAnchor="end" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : <EmptyChart />}
              </ResponsiveContainer>
            </div>

            {/* Asset Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Asset List ({filteredAssets.length})</h3>
                <button onClick={() => handleGenerateReport('Assets Report')}
                  className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 transition">
                  Export List
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Asset Tag</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Sub-Type</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAssets.length === 0 ? (
                      <tr><td colSpan={6} className="text-center text-gray-400 py-8">No assets match the current filters</td></tr>
                    ) : filteredAssets.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-blue-600">{a.asset_tag}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{a.asset_name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.category === 'IT' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {a.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{a.sub_type}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            a.status === 'active' ? 'bg-green-100 text-green-700' :
                            a.status === 'maintenance' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>{a.status}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{a.assigned_to || <span className="text-gray-400">Unassigned</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== PURCHASES TAB ===== */}
        {activeTab === 'purchases' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="Total Purchases" value={purchaseStats.total} color="blue" />
              <StatCard label="Total Spend" value={formatCurrency(purchaseStats.totalSpend)} color="green" />
              <StatCard label="Vendors" value={purchaseStats.vendorWise.length} color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">Monthly Purchase Trend</h3>
                  <button onClick={() => handleGenerateReport('Purchases Report')}
                    className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition">Export</button>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  {purchaseStats.monthly.length > 0 ? (
                    <AreaChart data={purchaseStats.monthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Amount']} />
                      <Area type="monotone" dataKey="amount" fill="#dbeafe" stroke="#3b82f6" strokeWidth={2} name="Amount (₹)" />
                    </AreaChart>
                  ) : <EmptyChart message="No purchases in selected date range" />}
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">Vendor-wise Spend</h3>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  {purchaseStats.vendorWise.length > 0 ? (
                    <BarChart data={purchaseStats.vendorWise} margin={{ bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="vendor" angle={-30} textAnchor="end" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Spent']} />
                      <Bar dataKey="spent" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : <EmptyChart message="No vendor data available" />}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Purchases Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Purchase Orders ({purchases.length})</h3>
                <button onClick={() => handleGenerateReport('Purchases Report')}
                  className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 transition">Export</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">PO ID</th>
                      <th className="px-4 py-3 text-left">Vendor</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {purchases.length === 0 ? (
                      <tr><td colSpan={5} className="text-center text-gray-400 py-8">No purchases found</td></tr>
                    ) : purchases.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-blue-600">{p.purchase_id}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{p.vendor_name}</td>
                        <td className="px-4 py-3 text-gray-600">{p.purchase_date}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-800">₹{(parseFloat(p.total_amount) || 0).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            p.status === 'received' ? 'bg-green-100 text-green-700' :
                            p.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>{p.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== CONTRACTS TAB ===== */}
        {activeTab === 'contracts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Contracts" value={contractStats.total} color="blue" />
              <StatCard label="Active" value={contractStats.active} color="green" />
              <StatCard label="Expiring (30 days)" value={contractStats.expiring} color="orange" />
              <StatCard label="Expired" value={contractStats.expired} color="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">Contract Status Distribution</h3>
                <ResponsiveContainer width="100%" height={240}>
                  {contractStats.total > 0 ? (
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Active', value: contractStats.active, color: '#10b981' },
                          { name: 'Expiring Soon', value: contractStats.expiring, color: '#f59e0b' },
                          { name: 'Expired', value: contractStats.expired, color: '#ef4444' },
                        ].filter(d => d.value > 0)}
                        cx="50%" cy="50%" outerRadius={80}
                        dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                        {[
                          { name: 'Active', value: contractStats.active, color: '#10b981' },
                          { name: 'Expiring Soon', value: contractStats.expiring, color: '#f59e0b' },
                          { name: 'Expired', value: contractStats.expired, color: '#ef4444' },
                        ].filter(d => d.value > 0).map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  ) : <EmptyChart message="No contracts match current filters" />}
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">Contracts by Vendor</h3>
                <ResponsiveContainer width="100%" height={240}>
                  {contractStats.vendorWise.length > 0 ? (
                    <BarChart data={contractStats.vendorWise} margin={{ bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="vendor" angle={-30} textAnchor="end" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : <EmptyChart />}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Contracts Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Contracts ({filteredContracts.length})</h3>
                <button onClick={() => handleGenerateReport('Contracts Report')}
                  className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 transition">Export</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Contract ID</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Vendor</th>
                      <th className="px-4 py-3 text-left">Valid Until</th>
                      <th className="px-4 py-3 text-right">Value</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredContracts.length === 0 ? (
                      <tr><td colSpan={6} className="text-center text-gray-400 py-8">No contracts found</td></tr>
                    ) : filteredContracts.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-blue-600">{c.contract_id}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{c.contract_name}</td>
                        <td className="px-4 py-3 text-gray-600">{c.vendor_name}</td>
                        <td className="px-4 py-3 text-gray-600">{c.active_till}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-800">₹{(parseFloat(c.contract_value) || 0).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            c.status === 'active' ? 'bg-green-100 text-green-700' :
                            c.status === 'expired' ? 'bg-red-100 text-red-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>{c.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== MAINTENANCE TAB ===== */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="In Maintenance" value={maintenanceStats.needingService} color="orange" />
              <StatCard label="Retired" value={maintenanceStats.retired} color="red" />
              <StatCard label="Active (Healthy)" value={assetStats.statusWise.find(s => s.name === 'active')?.count ?? assetStats.total - maintenanceStats.needingService - maintenanceStats.retired} color="green" />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Asset Health Overview</h3>
                <button onClick={() => handleGenerateReport('Assets Report')}
                  className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition">Export</button>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                {assetStats.statusWise.length > 0 ? (
                  <BarChart data={assetStats.statusWise}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {assetStats.statusWise.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                ) : <EmptyChart />}
              </ResponsiveContainer>
            </div>

            {/* Maintenance Assets Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Assets Requiring Attention</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Asset Tag</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAssets.filter(a => a.status !== 'active').length === 0 ? (
                      <tr><td colSpan={5} className="text-center text-gray-400 py-8">All assets are in active/healthy status</td></tr>
                    ) : filteredAssets.filter(a => a.status !== 'active').map(a => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-blue-600">{a.asset_tag}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{a.asset_name}</td>
                        <td className="px-4 py-3 text-gray-600">{a.category}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            a.status === 'maintenance' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                          }`}>{a.status}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{a.assigned_to || <span className="text-gray-400">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== FREQUENTLY USED TAB ===== */}
        {activeTab === 'frequently' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">Most Used Asset Types</h3>
                  <button onClick={() => handleGenerateReport('Assets Report')}
                    className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition">Export</button>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  {frequentStats.mostUsedCategories.length > 0 ? (
                    <BarChart data={frequentStats.mostUsedCategories} margin={{ bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" angle={-30} textAnchor="end" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="usage" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : <EmptyChart />}
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">Top Asset Holders</h3>
                <div className="space-y-3">
                  {frequentStats.mostAssigned.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">No assigned assets found</p>
                  ) : frequentStats.mostAssigned.map((person, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-4">{idx + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{person.name}</span>
                          <span className="text-xs text-gray-500">{person.count} asset{person.count > 1 ? 's' : ''}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${(person.count / frequentStats.maxCount) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Full Category Breakdown</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {assetStats.subTypeWise.map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">{s.name}</p>
                    <p className="text-xl font-bold" style={{ color: COLORS[i % COLORS.length] }}>{s.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          reportName={selectedReport}
          onExport={handleExport}
        />
      </div>
    </AppLayout>
  );
};
