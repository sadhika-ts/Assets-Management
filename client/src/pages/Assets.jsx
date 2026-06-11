import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import toast from 'react-hot-toast';
import api from '../api/axios';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const displayAssignee = val => (!val || UUID_RE.test(val) ? '—' : val);

const StatusBadge = ({ status }) => {
  const s = {
    active:   'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-700',
    inactive: 'bg-red-100 text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-700',
    retired:  'bg-gray-100 text-gray-600 ring-1 ring-gray-200 dark:bg-slate-700 dark:text-slate-400 dark:ring-slate-600',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${s[status] || 'bg-gray-100 text-gray-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'active' ? 'bg-emerald-500' : status === 'inactive' ? 'bg-red-500' : 'bg-gray-400'}`} />
      {status}
    </span>
  );
};

const STAT_COLORS = {
  blue:    { from: 'from-blue-500',    to: 'to-blue-600',    icon: 'bg-blue-400/30'    },
  emerald: { from: 'from-emerald-500', to: 'to-emerald-600', icon: 'bg-emerald-400/30' },
  red:     { from: 'from-red-500',     to: 'to-red-600',     icon: 'bg-red-400/30'     },
  gray:    { from: 'from-slate-500',   to: 'to-slate-600',   icon: 'bg-slate-400/30'   },
};

const StatCard = ({ label, value, icon, color }) => {
  const c = STAT_COLORS[color] || STAT_COLORS.blue;
  return (
    <div className={`bg-gradient-to-br ${c.from} ${c.to} rounded-2xl p-5 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/70 text-xs font-medium uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold mt-1.5">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center`}>
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
      </div>
    </div>
  );
};

const ICON_PATHS = {
  box:     'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  check:   'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  close:   'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  archive: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
  laptop:  'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
};

const AssetCard = ({ asset, onView, onEdit }) => {
  const assignee = displayAssignee(asset.assigned_to);
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 p-5 flex flex-col gap-3 group">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-gray-800 dark:text-slate-100 leading-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{asset.asset_name}</p>
          <p className="text-xs text-blue-500 font-mono mt-0.5">{asset.asset_tag}</p>
        </div>
        <StatusBadge status={asset.status} />
      </div>
      <div className="grid grid-cols-2 gap-y-2 text-xs border-t border-gray-100 dark:border-slate-700 pt-3">
        <span className="text-gray-400 dark:text-slate-500">Category</span>
        <span className="font-medium text-gray-700 dark:text-slate-300 text-right">{asset.category}</span>
        <span className="text-gray-400 dark:text-slate-500">Type</span>
        <span className="font-medium text-gray-700 dark:text-slate-300 text-right">{asset.sub_type}</span>
        <span className="text-gray-400 dark:text-slate-500">Assigned</span>
        <span className={`font-medium text-right truncate ${assignee === '—' ? 'text-gray-300 dark:text-slate-600' : 'text-gray-700 dark:text-slate-300'}`}>
          {assignee === '—' ? 'Unassigned' : assignee}
        </span>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => onView(asset.id)}
          className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 py-2 rounded-xl text-xs font-semibold transition-colors">
          View Details
        </button>
        <button onClick={() => onEdit(asset.id)}
          className="flex-1 bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600 py-2 rounded-xl text-xs font-semibold transition-colors">
          Edit
        </button>
      </div>
    </div>
  );
};

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
    const matchCat    = filterCategory === 'all' || a.sub_type === filterCategory;
    const matchStatus = filterStatus === 'all'   || a.status   === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const handleExport = () => {
    const csv = [['Asset Tag','Name','Category','Type','Status','Assigned To','Serial'],
      ...filtered.map(a => [a.asset_tag, a.asset_name, a.category, a.sub_type, a.status, a.assigned_to || 'N/A', a.serial_no || 'N/A'])
    ].map(r => r.join(',')).join('\n');
    const el = document.createElement('a');
    el.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    el.download = 'assets.csv'; el.click();
    toast.success('Exported as CSV');
  };

  if (loading) return (
    <AppLayout title="Assets">
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm text-gray-400 dark:text-slate-500">Loading assets…</p>
        </div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout title="Assets">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Asset Inventory</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{assets.length} total assets</p>
          </div>
          <button onClick={() => navigate('/assets/new')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-500/25">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Add Asset
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total"    value={assets.length}                                    icon={ICON_PATHS.box}     color="blue"    />
          <StatCard label="Active"   value={assets.filter(a => a.status === 'active').length}   icon={ICON_PATHS.check}   color="emerald" />
          <StatCard label="Inactive" value={assets.filter(a => a.status === 'inactive').length} icon={ICON_PATHS.close}   color="red"     />
          <StatCard label="Retired"  value={assets.filter(a => a.status === 'retired').length}  icon={ICON_PATHS.archive} color="gray"    />
        </div>

        {/* Filters bar */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input type="text" placeholder="Search by name, tag or assignee…" value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500" />
            </div>
            {/* Type filter */}
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-200 min-w-[140px]">
              <option value="all">All Types</option>
              {subTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {/* Status filter */}
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-200 min-w-[130px]">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="retired">Retired</option>
            </select>
            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm shadow-emerald-500/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                CSV
              </button>
              <button onClick={() => setViewMode(v => v === 'list' ? 'grid' : 'list')}
                title={viewMode === 'list' ? 'Grid view' : 'List view'}
                className="p-2 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                {viewMode === 'list'
                  ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                  : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
                }
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
            <p className="text-xs text-gray-400 dark:text-slate-500">
              Showing <span className="font-semibold text-gray-600 dark:text-slate-300">{filtered.length}</span> of <span className="font-semibold text-gray-600 dark:text-slate-300">{assets.length}</span> assets
            </p>
            {(searchTerm || filterCategory !== 'all' || filterStatus !== 'all') && (
              <button onClick={() => { setSearchTerm(''); setFilterCategory('all'); setFilterStatus('all'); }}
                className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors">
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Grid view */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.length === 0
              ? <div className="col-span-3 flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-slate-400 font-medium">No assets match your filters</p>
                  <p className="text-gray-400 dark:text-slate-500 text-sm">Try adjusting your search or filters</p>
                </div>
              : filtered.map(a => <AssetCard key={a.id} asset={a} onView={id => navigate(`/assets/${id}`)} onEdit={id => navigate(`/assets/${id}/edit`)} />)
            }
          </div>
        ) : (
          /* List / table view */
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                    {['Asset Tag','Name','Type','Status','Assigned To','Serial','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                  {filtered.length === 0
                    ? <tr><td colSpan={7} className="px-4 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-10 h-10 text-gray-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                          </svg>
                          <p className="text-gray-400 dark:text-slate-500">No assets match current filters</p>
                        </div>
                      </td></tr>
                    : filtered.map(a => (
                      <tr key={a.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-700/40 transition-colors group">
                        <td className="px-4 py-3">
                          <button onClick={() => navigate(`/assets/${a.id}`)}
                            className="font-mono text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                            {a.asset_tag}
                          </button>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-slate-200 max-w-[180px] truncate">{a.asset_name}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs font-medium">{a.sub_type}</span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                        <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{displayAssignee(a.assigned_to)}</td>
                        <td className="px-4 py-3 font-mono text-gray-400 dark:text-slate-500 text-xs">{a.serial_no || a.detail?.serial_no || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 opacity-70 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => navigate(`/assets/${a.id}`)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold text-xs transition-colors">View</button>
                            <button onClick={() => navigate(`/assets/${a.id}/edit`)}
                              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold text-xs transition-colors">Edit</button>
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
