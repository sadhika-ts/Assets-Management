import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '../layouts/AppLayout';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../api/axios';

const COLORS = ['#3b82f6','#22c55e','#f97316','#ef4444','#a855f7','#06b6d4','#eab308','#ec4899'];

const fmt = (n) => (parseFloat(n) || 0).toLocaleString('en-IN');
const fmtL = (n) => {
  const v = parseFloat(n) || 0;
  return v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${v.toLocaleString('en-IN')}`;
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KPI = ({ label, value, sub, color = 'blue', icon }) => (
  <div className={`bg-white rounded-lg shadow-sm border-l-4 border-${color}-500 p-5`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className={`text-3xl font-bold text-${color}-600 mt-1`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

// ── Empty State ───────────────────────────────────────────────────────────────
const Empty = ({ msg = 'No data available for selected filters.' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <span className="text-5xl mb-3">📭</span>
    <p className="text-sm">{msg}</p>
  </div>
);

// ── Section Wrapper ───────────────────────────────────────────────────────────
const Card = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
    {title && <h3 className="text-base font-semibold text-gray-800 mb-4">{title}</h3>}
    {children}
  </div>
);

// ── Simple Table ──────────────────────────────────────────────────────────────
const Table = ({ cols, rows }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-gray-50 border-b">
        <tr>{cols.map(c => <th key={c.key} className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{c.label}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {rows.length === 0
          ? <tr><td colSpan={cols.length} className="px-4 py-8 text-center text-gray-400 text-xs">No records</td></tr>
          : rows.map((r, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {cols.map(c => <td key={c.key} className="px-4 py-2 text-gray-700">{r[c.key] ?? '—'}</td>)}
            </tr>
          ))
        }
      </tbody>
    </table>
  </div>
);

// ── Status Badge ──────────────────────────────────────────────────────────────
const Badge = ({ v }) => {
  const map = {
    active: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700',
    expiring_soon: 'bg-orange-100 text-orange-700',
    upcoming: 'bg-blue-100 text-blue-700',
    pending: 'bg-yellow-100 text-yellow-700',
    ordered: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    maintenance: 'bg-orange-100 text-orange-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[v] || 'bg-gray-100 text-gray-700'}`}>{v}</span>;
};

// ── Export helpers ────────────────────────────────────────────────────────────
const exportCSV = (rows, cols, filename) => {
  const header = cols.map(c => c.label).join(',');
  const body = rows.map(r => cols.map(c => `"${r[c.key] ?? ''}"`).join(',')).join('\n');
  const blob = new Blob([header + '\n' + body], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `${filename}.csv`; a.click();
};

const printSection = (title) => {
  window.print();
};

// ── Main Component ────────────────────────────────────────────────────────────
export const Reports = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // filters
  const today = new Date();
  const yearStart = `${today.getFullYear()}-01-01`;
  const [dateFrom, setDateFrom] = useState(yearStart);
  const [dateTo, setDateTo] = useState(today.toISOString().split('T')[0]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterVendor, setFilterVendor] = useState('all');

  // data
  const [dashboard, setDashboard] = useState(null);
  const [assetData, setAssetData] = useState(null);
  const [purchaseData, setPurchaseData] = useState(null);
  const [contractData, setContractData] = useState(null);
  const [maintenanceData, setMaintenanceData] = useState(null);
  const [freqData, setFreqData] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const r = await api.get('/reports/dashboard');
      setDashboard(r.data.data);
    } catch { setDashboard(null); }
  }, []);

  const fetchTab = useCallback(async (tab) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ from: dateFrom, to: dateTo });
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterVendor !== 'all') params.append('vendor', filterVendor);

      if (tab === 'assets') {
        const r = await api.get(`/reports/assets?${params}`);
        setAssetData(r.data.data);
      } else if (tab === 'purchases') {
        const r = await api.get(`/reports/purchases?${params}`);
        setPurchaseData(r.data.data);
      } else if (tab === 'contracts') {
        const r = await api.get(`/reports/contracts?${params}`);
        setContractData(r.data.data);
      } else if (tab === 'maintenance') {
        const r = await api.get(`/reports/maintenance?${params}`);
        setMaintenanceData(r.data.data);
      } else if (tab === 'frequently') {
        const r = await api.get(`/reports/frequently-requested?${params}`);
        setFreqData(r.data.data);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [dateFrom, dateTo, filterCategory, filterStatus, filterVendor]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  useEffect(() => {
    if (activeTab !== 'dashboard') fetchTab(activeTab);
  }, [activeTab, fetchTab]);

  const tabs = [
    { id: 'dashboard', label: '🏠 Dashboard' },
    { id: 'assets',    label: '💻 Assets' },
    { id: 'purchases', label: '🛒 Purchases' },
    { id: 'contracts', label: '📋 Contracts' },
    { id: 'maintenance', label: '🔧 Maintenance' },
    { id: 'frequently', label: '⭐ Frequently Requested' },
  ];

  // ── Filters bar ─────────────────────────────────────────────────────────────
  const Filters = () => (
    <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap gap-4 items-end">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
          <option value="all">All Categories</option>
          <option value="IT">IT</option>
          <option value="Non-IT">Non-IT</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
          <option value="disposed">Disposed</option>
        </select>
      </div>
      <button onClick={() => fetchTab(activeTab)}
        className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
        Apply Filters
      </button>
      <button onClick={() => { setDateFrom(yearStart); setDateTo(today.toISOString().split('T')[0]); setFilterCategory('all'); setFilterStatus('all'); setFilterVendor('all'); }}
        className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
        Reset
      </button>
    </div>
  );

  const Loader = () => (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  // ── DASHBOARD TAB ───────────────────────────────────────────────────────────
  const DashboardTab = () => {
    if (!dashboard) return <Loader />;
    const d = dashboard;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPI label="Total Assets"        value={d.totalAssets}      icon="💻" color="blue" />
          <KPI label="Active Assets"       value={d.activeAssets}     icon="✅" color="green" />
          <KPI label="Inactive Assets"     value={d.inactiveAssets}   icon="⏸️" color="gray" />
          <KPI label="In Maintenance"      value={d.maintenanceAssets} icon="🔧" color="orange" />
          <KPI label="Assigned"            value={d.assignedAssets}   icon="👤" color="purple" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPI label="Unassigned"          value={d.unassignedAssets} icon="📦" color="yellow" />
          <KPI label="Total Contracts"     value={d.totalContracts}   icon="📋" color="blue" />
          <KPI label="Active Contracts"    value={d.activeContracts}  icon="✅" color="green" />
          <KPI label="Expired Contracts"   value={d.expiredContracts} icon="❌" color="red" />
          <KPI label="Expiring (30 days)"  value={d.expiringContracts} icon="⚠️" color="orange" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
            <p className="text-sm font-medium opacity-80">Total Purchase Spend</p>
            <p className="text-4xl font-bold mt-1">{fmtL(d.totalSpent)}</p>
          </div>
          <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg p-6">
            <p className="text-sm font-medium opacity-80">Asset Utilization</p>
            <p className="text-4xl font-bold mt-1">{d.utilization}%</p>
            <p className="text-xs opacity-70 mt-1">{d.assignedAssets} of {d.totalAssets} assets assigned</p>
          </div>
        </div>
      </div>
    );
  };

  // ── ASSETS TAB ──────────────────────────────────────────────────────────────
  const AssetsTab = () => {
    if (loading) return <Loader />;
    if (!assetData) return <Empty />;
    const d = assetData;
    return (
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <KPI label="Total Assets" value={d.total} icon="💻" color="blue" />
          <KPI label="Assigned" value={d.assigned} icon="👤" color="green" />
          <KPI label="Unassigned" value={d.unassigned} icon="📦" color="orange" />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Category Distribution">
            {d.categoryWise.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={d.categoryWise} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                    label={({ name, value }) => `${name}: ${value}`}>
                    {d.categoryWise.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card title="Status Distribution">
            {d.statusWise.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={d.statusWise}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" /><YAxis />
                  <Tooltip />
                  <Bar dataKey="value" name="Count">
                    {d.statusWise.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Sub-Type Distribution (Top 10)">
            {d.subTypeWise.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={d.subTypeWise.slice(0,10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" /><YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card title="Assets Added per Month">
            {d.monthlyTrend.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={d.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis /><Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#bfdbfe" name="Assets Added" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Department-wise */}
        {d.deptWise.length > 0 && (
          <Card title="Assets by Assigned User (Top 10)">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={d.deptWise}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                <YAxis /><Tooltip />
                <Bar dataKey="value" fill="#a855f7" name="Assets" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Recently added table */}
        <Card title={`Recently Added Assets (${d.recentlyAdded.length})`}>
          <div className="mb-3 flex justify-end">
            <button onClick={() => exportCSV(d.recentlyAdded, [
              {key:'asset_tag',label:'Tag'},{key:'asset_name',label:'Name'},
              {key:'category',label:'Category'},{key:'sub_type',label:'Sub-type'},
              {key:'status',label:'Status'},{key:'assigned_to',label:'Assigned To'}
            ], 'recently_added_assets')}
              className="px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700">
              ⬇ Export CSV
            </button>
          </div>
          <Table
            cols={[
              {key:'asset_tag',label:'Tag'},{key:'asset_name',label:'Name'},
              {key:'category',label:'Category'},{key:'sub_type',label:'Sub-type'},
              {key:'status',label:'Status'},{key:'assigned_to',label:'Assigned To'}
            ]}
            rows={d.recentlyAdded}
          />
        </Card>
      </div>
    );
  };

  // ── PURCHASES TAB ───────────────────────────────────────────────────────────
  const PurchasesTab = () => {
    if (loading) return <Loader />;
    if (!purchaseData) return <Empty />;
    const d = purchaseData;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <KPI label="Total Orders" value={d.total} icon="🛒" color="blue" />
          <KPI label="Total Spent" value={fmtL(d.totalAmount)} icon="💰" color="green" />
          <KPI label="Avg per Order" value={fmtL(d.total ? d.totalAmount / d.total : 0)} icon="📊" color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Monthly Purchase Trend">
            {d.monthly.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={d.monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis />
                  <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} />
                  <Area type="monotone" dataKey="amount" stroke="#22c55e" fill="#bbf7d0" name="Amount (₹)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card title="Order Count by Month">
            {d.monthly.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={d.monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Vendor-wise Spending (Top 10)">
            {d.vendorWise.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={d.vendorWise} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" /><YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} />
                  <Bar dataKey="amount" fill="#f97316" name="Amount (₹)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card title="Status Distribution">
            {d.statusWise.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={d.statusWise} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                    label={({ name, count }) => `${name}: ${count}`}>
                    {d.statusWise.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        <Card title="Top Purchases by Value">
          <div className="mb-3 flex justify-end">
            <button onClick={() => exportCSV(d.topPurchases, [
              {key:'purchase_id',label:'PO ID'},{key:'vendor_name',label:'Vendor'},
              {key:'total_amount',label:'Amount'},{key:'purchase_date',label:'Date'},{key:'status',label:'Status'}
            ], 'top_purchases')}
              className="px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700">
              ⬇ Export CSV
            </button>
          </div>
          <Table
            cols={[
              {key:'purchase_id',label:'PO ID'},{key:'vendor_name',label:'Vendor'},
              {key:'total_amount',label:'Amount (₹)'},{key:'purchase_date',label:'Date'},{key:'status',label:'Status'}
            ]}
            rows={d.topPurchases.map(p => ({
              ...p,
              total_amount: `₹${(parseFloat(p.total_amount)||0).toLocaleString('en-IN')}`,
              purchase_date: new Date(p.purchase_date).toLocaleDateString('en-IN'),
              status: <Badge v={p.status} />
            }))}
          />
        </Card>
      </div>
    );
  };

  // ── CONTRACTS TAB ───────────────────────────────────────────────────────────
  const ContractsTab = () => {
    if (loading) return <Loader />;
    if (!contractData) return <Empty />;
    const d = contractData;
    const cols = [
      {key:'contract_id',label:'ID'},{key:'contract_name',label:'Name'},
      {key:'vendor_name',label:'Vendor'},{key:'contract_value',label:'Value (₹)'},
      {key:'active_till',label:'Expires'},{key:'status',label:'Status'}
    ];
    const mapRow = r => ({
      ...r,
      contract_value: `₹${(r.contract_value||0).toLocaleString('en-IN')}`,
      active_till: new Date(r.active_till).toLocaleDateString('en-IN'),
      status: <Badge v={r.status} />
    });
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <KPI label="Total Contracts" value={d.total} icon="📋" color="blue" />
          <KPI label="Total Value" value={fmtL(d.totalValue)} icon="💰" color="green" />
          <KPI label="Expiring ≤30 days" value={d.expiring30.length} icon="⚠️" color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Status Distribution">
            {d.statusWise.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={d.statusWise} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                    label={({ name, count }) => `${name}: ${count}`}>
                    {d.statusWise.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
          <Card title="Vendor-wise Contract Value">
            {d.vendorWise.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={d.vendorWise}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} /><YAxis />
                  <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} />
                  <Bar dataKey="value" fill="#3b82f6" name="Value (₹)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {d.expiring30.length > 0 && (
          <Card title={`⚠️ Expiring in 30 Days (${d.expiring30.length})`} className="border-l-4 border-orange-500">
            <Table cols={cols} rows={d.expiring30.map(mapRow)} />
          </Card>
        )}
        {d.expiring60.length > 0 && (
          <Card title={`Expiring in 31–60 Days (${d.expiring60.length})`} className="border-l-4 border-yellow-400">
            <Table cols={cols} rows={d.expiring60.map(mapRow)} />
          </Card>
        )}
        {d.expiring90.length > 0 && (
          <Card title={`Expiring in 61–90 Days (${d.expiring90.length})`} className="border-l-4 border-blue-400">
            <Table cols={cols} rows={d.expiring90.map(mapRow)} />
          </Card>
        )}

        <Card title={`All Contracts (${d.allContracts.length})`}>
          <div className="mb-3 flex justify-end">
            <button onClick={() => exportCSV(d.allContracts, cols, 'contracts_report')}
              className="px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700">
              ⬇ Export CSV
            </button>
          </div>
          <Table cols={cols} rows={d.allContracts.map(mapRow)} />
        </Card>
      </div>
    );
  };

  // ── MAINTENANCE TAB ─────────────────────────────────────────────────────────
  const MaintenanceTab = () => {
    if (loading) return <Loader />;
    if (!maintenanceData) return <Empty />;
    const d = maintenanceData;
    return (
      <div className="space-y-6">
        <KPI label="Assets Under Maintenance" value={d.total} icon="🔧" color="orange" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Maintenance by Sub-type">
            {d.subTypeWise.length === 0 ? <Empty msg="No assets currently under maintenance." /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={d.subTypeWise}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f97316" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
          <Card title="Maintenance by Category">
            {d.categoryWise.length === 0 ? <Empty msg="No assets currently under maintenance." /> : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={d.categoryWise} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                    label={({ name, count }) => `${name}: ${count}`}>
                    {d.categoryWise.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        <Card title={`Assets Under Maintenance (${d.assets.length})`}>
          {d.assets.length === 0
            ? <Empty msg="No assets currently under maintenance." />
            : <Table
                cols={[
                  {key:'asset_tag',label:'Tag'},{key:'asset_name',label:'Name'},
                  {key:'category',label:'Category'},{key:'sub_type',label:'Sub-type'},
                  {key:'assigned_to',label:'Last Assigned'},{key:'updated_at',label:'Since'}
                ]}
                rows={d.assets.map(a => ({
                  ...a,
                  updated_at: new Date(a.updated_at).toLocaleDateString('en-IN')
                }))}
              />
          }
        </Card>
      </div>
    );
  };

  // ── FREQUENTLY REQUESTED TAB ────────────────────────────────────────────────
  const FreqTab = () => {
    if (loading) return <Loader />;
    if (!freqData) return <Empty />;
    const d = freqData;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Most Assigned Asset Types">
            {d.mostAssigned.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={d.mostAssigned} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" /><YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#a855f7" name="Assigned Count" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
          <Card title="Category Demand">
            {d.categoryDemand.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={d.categoryDemand} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100}
                    label={({ name, count }) => `${name}: ${count}`}>
                    {d.categoryDemand.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        <Card title="Users with Most Assets Assigned">
          {d.perUser.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={d.perUser}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} /><YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#06b6d4" name="Assets Assigned" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Most Assigned Asset Types — Detail">
          <Table
            cols={[{key:'name',label:'Sub-type'},{key:'category',label:'Category'},{key:'count',label:'Assigned Count'}]}
            rows={d.mostAssigned}
          />
        </Card>
      </div>
    );
  };

  const tabContent = {
    dashboard: <DashboardTab />,
    assets: <AssetsTab />,
    purchases: <PurchasesTab />,
    contracts: <ContractsTab />,
    maintenance: <MaintenanceTab />,
    frequently: <FreqTab />,
  };

  return (
    <AppLayout title="Reports & Analytics">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
          <button onClick={() => { fetchDashboard(); fetchTab(activeTab); }}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
            🔄 Refresh
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition border-b-2 ${
                activeTab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters (not shown on dashboard) */}
        {activeTab !== 'dashboard' && <Filters />}

        {/* Content */}
        {tabContent[activeTab]}
      </div>
    </AppLayout>
  );
};
