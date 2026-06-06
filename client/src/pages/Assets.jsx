import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import toast from 'react-hot-toast';
import api from '../api/axios';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const displayAssignee = (val) => (!val || UUID_RE.test(val) ? '—' : val);

const StatusBadge = ({ status }) => {
  const s = {
    active:   'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
    inactive: 'bg-red-100 text-red-700 ring-1 ring-red-200',
    retired:  'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${s[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

const StatCard = ({ label, value, icon, color }) => {
  const colors = {
    blue:   'from-blue-500 to-blue-600',
    emerald:'from-emerald-500 to-emerald-600',
    red:    'from-red-500 to-red-600',
    gray:   'from-gray-500 to-gray-600',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-5 text-white shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/75 text-xs font-medium uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-3xl opacity-80">{icon}</span>
      </div>
    </div>
  );
};

const AssetCard = ({ asset, onView, onEdit }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5 flex flex-col gap-3">
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="font-bold text-gray-800 leading-tight">{asset.asset_name}</p>
        <p className="text-xs text-blue-500 font-mono mt-0.5">{asset.asset_tag}</p>
      </div>
      <StatusBadge status={asset.status} />
    </div>
    <div className="grid grid-cols-2 gap-y-1.5 text-xs text-gray-600 border-t border-gray-50 pt-3">
      <span className="text-gray-400">Category</span><span className="font-medium text-right">{asset.category}</span>
      <span className="text-gray-400">Type</span><span className="font-medium text-right">{asset.sub_type}</span>
      <span className="text-gray-400">Assigned</span><span className="font-medium text-right truncate">{displayAssignee(asset.assigned_to) === '—' ? 'Unassigned' : displayAssignee(asset.assigned_to)}</span>
    </div>
    <div className="flex gap-2 pt-1">
      <button onClick={() => onView(asset.id)} className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 py-1.5 rounded-lg text-xs font-semibold transition-colors">View</button>
      <button onClick={() => onEdit(asset.id)} className="flex-1 bg-gray-50 text-gray-600 hover:bg-gray-100 py-1.5 rounded-lg text-xs font-semibold transition-colors">Edit</button>
    </div>
  </div>
);

export const Assets = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAssets(); }, [searchParams]);

  const fetchAssets = async () => {
    try {
      const res = await api.get('/assets?limit=500');
      const list = res.data?.data?.assets || [];
      setAssets(list);
      if (searchParams.get('refresh') === 'true') toast.success('Assets list updated!');
    } catch { toast.error('Failed to load assets'); }
    finally { setLoading(false); }
  };

  const subTypeOptions = [...new Set(assets.map(a => a.sub_type).filter(Boolean))].sort();

  const filtered = assets.filter(a => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || a.asset_name?.toLowerCase().includes(q) || a.asset_tag?.toLowerCase().includes(q) || a.assigned_to?.toLowerCase().includes(q);
    const matchCat = filterCategory === 'all' || a.sub_type === filterCategory;
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const handleExport = () => {
    const csv = [['Asset Tag','Name','Category','Status','Assigned To'], ...filtered.map(a => [a.asset_tag, a.asset_name, a.category, a.status, a.assigned_to || 'N/A'])].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'assets.csv'; a.click();
    toast.success('Exported as CSV');
  };

  if (loading) return (
    <AppLayout title="Assets">
      <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
    </AppLayout>
  );

  return (
    <AppLayout title="Assets">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Asset Inventory</h2>
            <p className="text-sm text-gray-500 mt-0.5">{assets.length} assets total</p>
          </div>
          <button onClick={() => navigate('/assets/new')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-blue-500/25">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Add Asset
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total" value={assets.length} icon="📦" color="blue" />
          <StatCard label="Active" value={assets.filter(a => a.status === 'active').length} icon="✅" color="emerald" />
          <StatCard label="Inactive" value={assets.filter(a => a.status === 'inactive').length} icon="⛔" color="red" />
          <StatCard label="Retired" value={assets.filter(a => a.status === 'retired').length} icon="🗃️" color="gray" />
        </div>

        {/* Filters + actions bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" placeholder="Search by name, tag or assignee…" value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50" />
            </div>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 min-w-[140px]">
              <option value="all">All Types</option>
              {subTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 min-w-[130px]">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="retired">Retired</option>
            </select>
            <div className="flex gap-2">
              <button onClick={handleExport}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                CSV
              </button>
              <button onClick={() => setViewMode(v => v === 'list' ? 'grid' : 'list')}
                className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
                {viewMode === 'list'
                  ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                  : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
                }
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of {assets.length} assets</p>
        </div>

        {/* Table / Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.length === 0
              ? <div className="col-span-3 text-center py-20 text-gray-400">No assets match current filters</div>
              : filtered.map(a => <AssetCard key={a.id} asset={a} onView={id => navigate(`/assets/${id}`)} onEdit={id => navigate(`/assets/${id}/edit`)} />)
            }
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Asset Tag','Name','Type','Status','Assigned To','Serial','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0
                    ? <tr><td colSpan={7} className="px-4 py-16 text-center text-gray-400">No assets match current filters</td></tr>
                    : filtered.map(a => (
                      <tr key={a.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-4 py-3">
                          <button onClick={() => navigate(`/assets/${a.id}`)} className="font-mono text-blue-600 font-semibold hover:underline">{a.asset_tag}</button>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800 max-w-[180px] truncate">{a.asset_name}</td>
                        <td className="px-4 py-3 text-gray-500">{a.sub_type}</td>
                        <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                        <td className="px-4 py-3 text-gray-600">{displayAssignee(a.assigned_to)}</td>
                        <td className="px-4 py-3 font-mono text-gray-400 text-xs">{a.serial_no || a.detail?.serial_no || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <button onClick={() => navigate(`/assets/${a.id}`)} className="text-blue-600 hover:text-blue-800 font-semibold text-xs">View</button>
                            <button onClick={() => navigate(`/assets/${a.id}/edit`)} className="text-emerald-600 hover:text-emerald-800 font-semibold text-xs">Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
