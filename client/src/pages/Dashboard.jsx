import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../api/axios';

// ── Small reusable components ────────────────────────────────────

const StatCard = ({ label, value, color, icon, sub, onClick }) => {
  const border = {
    blue: 'border-l-blue-500', purple: 'border-l-purple-500',
    green: 'border-l-green-500', orange: 'border-l-orange-500',
    red: 'border-l-red-500', cyan: 'border-l-cyan-500',
    indigo: 'border-l-indigo-500', teal: 'border-l-teal-500',
    pink: 'border-l-pink-500',
  };
  const text = {
    blue: 'text-blue-700', purple: 'text-purple-700',
    green: 'text-green-700', orange: 'text-orange-700',
    red: 'text-red-700', cyan: 'text-cyan-700',
    indigo: 'text-indigo-700', teal: 'text-teal-700',
    pink: 'text-pink-700',
  };
  return (
    <div
      onClick={onClick}
      className={`bg-white p-5 rounded-xl shadow-sm border-l-4 ${border[color]} ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${text[color]}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <span className="text-4xl opacity-80">{icon}</span>
      </div>
    </div>
  );
};

const Card = ({ title, children, action }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

const EmptyState = ({ msg }) => (
  <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">{msg}</div>
);

const StatusDot = ({ status }) => {
  const c = { active: 'bg-green-500', inactive: 'bg-red-400', retired: 'bg-gray-400', expiring_soon: 'bg-orange-400' };
  return <span className={`inline-block w-2 h-2 rounded-full ${c[status] || 'bg-gray-300'} mr-2`} />;
};

// ── Main component ───────────────────────────────────────────────

export const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, pRes, cRes] = await Promise.allSettled([
          api.get('/assets?limit=500'),
          api.get('/purchases?limit=500'),
          api.get('/contracts?limit=500'),
        ]);
        if (aRes.status === 'fulfilled') {
          const d = aRes.value.data?.data;
          setAssets(Array.isArray(d?.assets) ? d.assets : Array.isArray(d) ? d : []);
        }
        if (pRes.status === 'fulfilled') {
          const d = pRes.value.data?.data;
          setPurchases(Array.isArray(d?.purchases) ? d.purchases : Array.isArray(d) ? d : []);
        }
        if (cRes.status === 'fulfilled') {
          const d = cRes.value.data?.data;
          setContracts(Array.isArray(d?.contracts) ? d.contracts : Array.isArray(d) ? d : []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Derived metrics ──────────────────────────────────────────
  const metrics = useMemo(() => {
    const total = assets.length;
    const it = assets.filter(a => a.category === 'IT').length;
    const nonIt = assets.filter(a => a.category === 'Non-IT').length;
    const active = assets.filter(a => a.status === 'active').length;
    const inactive = assets.filter(a => a.status === 'inactive').length;
    const retired = assets.filter(a => a.status === 'retired').length;
    const assigned = assets.filter(a => a.assigned_to && a.assigned_to.trim()).length;
    const unassigned = active - assigned < 0 ? 0 : active - assigned;

    const today = new Date();
    const in30 = new Date(); in30.setDate(today.getDate() + 30);
    const activeContracts = contracts.filter(c => c.status === 'active').length;
    const expiringContracts = contracts.filter(c => {
      const till = new Date(c.active_till);
      return till >= today && till <= in30;
    }).length + contracts.filter(c => c.status === 'expiring_soon').length;
    const contractValue = contracts.reduce((s, c) => s + (parseFloat(c.contract_value) || 0), 0);

    const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0);
    const purchasesThisMonth = purchases.filter(p => new Date(p.purchase_date) >= thisMonth).length;
    const totalSpend = purchases.reduce((s, p) => s + (parseFloat(p.total_amount) || 0), 0);

    return {
      total, it, nonIt, active, inactive, retired,
      assigned, unassigned,
      activeContracts, expiringContracts, contractValue,
      purchasesThisMonth, totalSpend,
    };
  }, [assets, purchases, contracts]);

  // ── Chart data ───────────────────────────────────────────────

  // Pie: Assets by category
  const categoryPie = useMemo(() => {
    const map = {};
    assets.forEach(a => { map[a.category] = (map[a.category] || 0) + 1; });
    const colors = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#06b6d4'];
    return Object.entries(map).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  }, [assets]);

  // Pie: Asset health (active/inactive/retired)
  const healthPie = useMemo(() => [
    { name: 'Active', value: metrics.active, color: '#22c55e' },
    { name: 'Inactive', value: metrics.inactive, color: '#ef4444' },
    { name: 'Retired', value: metrics.retired, color: '#9ca3af' },
  ].filter(d => d.value > 0), [metrics]);

  // Bar: Top sub-types
  const subTypeBar = useMemo(() => {
    const map = {};
    assets.forEach(a => { if (a.sub_type) map[a.sub_type] = (map[a.sub_type] || 0) + 1; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, value]) => ({ name, value }));
  }, [assets]);

  // Area: Purchase spend by month (last 6 months)
  const spendTrend = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      months.push({
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        year: d.getFullYear(),
        month: d.getMonth(),
        spend: 0,
        count: 0,
      });
    }
    purchases.forEach(p => {
      const d = new Date(p.purchase_date);
      const m = months.find(x => x.year === d.getFullYear() && x.month === d.getMonth());
      if (m) { m.spend += parseFloat(p.total_amount) || 0; m.count += 1; }
    });
    return months.map(m => ({ month: m.label, spend: Math.round(m.spend), orders: m.count }));
  }, [purchases]);

  // ── Recent items ─────────────────────────────────────────────
  const recentAssets = useMemo(() =>
    [...assets].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5),
    [assets]);

  const recentPurchases = useMemo(() =>
    [...purchases].sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date)).slice(0, 5),
    [purchases]);

  const expiringContractsList = useMemo(() => {
    const today = new Date();
    const in60 = new Date(); in60.setDate(today.getDate() + 60);
    return contracts
      .filter(c => {
        const till = new Date(c.active_till);
        return (till >= today && till <= in60) || c.status === 'expiring_soon';
      })
      .sort((a, b) => new Date(a.active_till) - new Date(b.active_till))
      .slice(0, 5);
  }, [contracts]);

  const fmtCurrency = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const daysLeft = (till) => Math.ceil((new Date(till) - new Date()) / 86400000);

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-7">

        {/* ── Top summary banner ── */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Asset Inventory Overview</h2>
              <p className="text-blue-200 text-sm mt-1">Last updated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-blue-200 text-xs uppercase tracking-wide">Total Assets</p>
                <p className="text-3xl font-bold">{metrics.total}</p>
              </div>
              <div>
                <p className="text-blue-200 text-xs uppercase tracking-wide">Total Spend</p>
                <p className="text-3xl font-bold">{fmtCurrency(metrics.totalSpend)}</p>
              </div>
              <div>
                <p className="text-blue-200 text-xs uppercase tracking-wide">Contracts</p>
                <p className="text-3xl font-bold">{contracts.length}</p>
              </div>
              <div>
                <p className="text-blue-200 text-xs uppercase tracking-wide">Contract Value</p>
                <p className="text-3xl font-bold">{fmtCurrency(metrics.contractValue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stat cards row 1 ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Total Assets" value={metrics.total} color="blue" icon="📦"
            onClick={() => navigate('/assets')} />
          <StatCard label="IT Assets" value={metrics.it} color="purple" icon="💻"
            sub={`${metrics.nonIt} Non-IT`} onClick={() => navigate('/assets?category=IT')} />
          <StatCard label="Active" value={metrics.active} color="green" icon="✅"
            sub={`${metrics.inactive} inactive`} onClick={() => navigate('/assets?status=active')} />
          <StatCard label="Assigned" value={metrics.assigned} color="indigo" icon="👥"
            sub={`${metrics.unassigned} unassigned`} />
          <StatCard label="Retired" value={metrics.retired} color="red" icon="🗃️"
            onClick={() => navigate('/assets?status=retired')} />
        </div>

        {/* ── Stat cards row 2 ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard label="Active Contracts" value={metrics.activeContracts} color="teal" icon="📋"
            onClick={() => navigate('/contracts')} />
          <StatCard label="Expiring ≤ 30 days" value={metrics.expiringContracts} color="orange" icon="⚠️"
            onClick={() => navigate('/contracts')} />
          <StatCard label="Total Purchases" value={purchases.length} color="cyan" icon="🛒"
            sub={`${metrics.purchasesThisMonth} this month`} onClick={() => navigate('/purchases')} />
          <StatCard label="Pending Orders" value={purchases.filter(p => p.status === 'pending' || p.status === 'ordered').length}
            color="pink" icon="🕐" onClick={() => navigate('/purchases')} />
        </div>

        {/* ── Charts row 1 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Assets by Category pie */}
          <Card title="Assets by Category">
            {categoryPie.length === 0 ? <EmptyState msg="No asset data" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={categoryPie} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                    label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                    {categoryPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Asset health pie */}
          <Card title="Asset Health Status">
            {healthPie.length === 0 ? <EmptyState msg="No asset data" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={healthPie} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                    dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                    {healthPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Top asset sub-types bar */}
          <Card title="Top Asset Types">
            {subTypeBar.length === 0 ? <EmptyState msg="No asset data" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={subTypeBar} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} name="Count" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* ── Purchase spend trend ── */}
        <Card title="Purchase Spend — Last 6 Months"
          action={<span className="text-xs text-gray-400">Amount in ₹</span>}>
          {spendTrend.every(m => m.spend === 0) ? <EmptyState msg="No purchase data in the last 6 months" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={spendTrend}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, n) => n === 'spend' ? [`₹${v.toLocaleString('en-IN')}`, 'Spend'] : [v, 'Orders']} />
                <Legend />
                <Area type="monotone" dataKey="spend" stroke="#3b82f6" fill="url(#spendGrad)" strokeWidth={2} name="Spend (₹)" />
                <Area type="monotone" dataKey="orders" stroke="#a855f7" fill="none" strokeWidth={2} strokeDasharray="4 2" name="Orders" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* ── Bottom section: 3 lists ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Recently added assets */}
          <Card title="Recently Added Assets"
            action={<button onClick={() => navigate('/assets')} className="text-xs text-blue-600 hover:underline">View all</button>}>
            {recentAssets.length === 0 ? <EmptyState msg="No assets yet" /> : (
              <div className="space-y-3">
                {recentAssets.map(a => (
                  <div key={a.id}
                    onClick={() => navigate(`/assets/${a.id}`)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl">{a.category === 'IT' ? '💻' : '🪑'}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{a.asset_name}</p>
                        <p className="text-xs text-gray-400">{a.asset_tag} · {a.sub_type}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <StatusDot status={a.status} />
                      <span className="text-xs text-gray-400">{fmtDate(a.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent purchases */}
          <Card title="Recent Purchases"
            action={<button onClick={() => navigate('/purchases')} className="text-xs text-blue-600 hover:underline">View all</button>}>
            {recentPurchases.length === 0 ? <EmptyState msg="No purchases yet" /> : (
              <div className="space-y-3">
                {recentPurchases.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.vendor_name}</p>
                      <p className="text-xs text-gray-400">{p.purchase_id} · {fmtDate(p.purchase_date)}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-sm font-semibold text-gray-800">{fmtCurrency(p.total_amount)}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        p.status === 'received' ? 'bg-green-100 text-green-700' :
                        p.status === 'ordered'  ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Expiring contracts */}
          <Card title="Contracts Expiring Soon"
            action={<button onClick={() => navigate('/contracts')} className="text-xs text-blue-600 hover:underline">View all</button>}>
            {expiringContractsList.length === 0
              ? <EmptyState msg="No contracts expiring within 60 days 🎉" />
              : (
              <div className="space-y-3">
                {expiringContractsList.map(c => {
                  const d = daysLeft(c.active_till);
                  return (
                    <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{c.contract_name}</p>
                        <p className="text-xs text-gray-400">{c.vendor_name}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className={`text-sm font-bold ${d <= 7 ? 'text-red-600' : d <= 30 ? 'text-orange-500' : 'text-yellow-600'}`}>
                          {d <= 0 ? 'Expired' : `${d}d left`}
                        </p>
                        <p className="text-xs text-gray-400">{fmtDate(c.active_till)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* ── Asset distribution progress bars ── */}
        <Card title="Asset Distribution Breakdown">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Active', value: metrics.active, total: metrics.total, color: 'bg-green-500' },
              { label: 'Assigned to Users', value: metrics.assigned, total: metrics.total, color: 'bg-blue-500' },
              { label: 'IT Assets', value: metrics.it, total: metrics.total, color: 'bg-purple-500' },
              { label: 'Non-IT Assets', value: metrics.nonIt, total: metrics.total, color: 'bg-teal-500' },
              { label: 'Inactive', value: metrics.inactive, total: metrics.total, color: 'bg-red-400' },
              { label: 'Retired', value: metrics.retired, total: metrics.total, color: 'bg-gray-400' },
            ].map((item, i) => {
              const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.value} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className={`${item.color} h-2.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

      </div>
    </AppLayout>
  );
};
