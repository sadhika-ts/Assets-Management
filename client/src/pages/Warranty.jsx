import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { backendApi as api } from '../api/axios';
import { AppLayout } from '../layouts/AppLayout';
import { AttachmentSection } from '../components/AttachmentSection';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  active:        { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Active' },
  expiring_soon: { bg: 'bg-amber-500/10',   text: 'text-amber-400',   dot: 'bg-amber-400',   label: 'Expiring Soon' },
  expired:       { bg: 'bg-red-500/10',      text: 'text-red-400',     dot: 'bg-red-400',     label: 'Expired' },
  unknown:       { bg: 'bg-slate-700/50',    text: 'text-slate-400',   dot: 'bg-slate-500',   label: 'Unknown' },
};

const WARRANTY_TYPES = ['Onsite', 'Carry-in', 'NBD (Next Business Day)', 'Parts Only', 'Comprehensive', 'Extended', 'Other'];

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.unknown;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const StatCard = ({ label, value, color, icon }) => {
  const colors = {
    blue:  'from-blue-500 to-blue-600 shadow-blue-500/30',
    green: 'from-emerald-500 to-green-600 shadow-emerald-500/30',
    amber: 'from-amber-500 to-orange-500 shadow-amber-500/30',
    red:   'from-red-500 to-rose-600 shadow-red-500/30',
  };
  return (
    <div className="bg-slate-800/80 rounded-2xl p-5 shadow-sm border border-slate-700/50 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg flex-shrink-0`}>
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
};

const EMPTY_FORM = {
  asset_id: '', warranty_provider: '', warranty_type: '',
  start_date: '', end_date: '', warranty_number: '', contact_number: '', notes: '',
};

/* ── Modal (Add / Edit / Renew) ── */
const WarrantyModal = ({ warranty, assets, mode, onClose, onSave }) => {
  const isRenew = mode === 'renew';
  const [form, setForm] = useState(() => {
    if (!warranty) return { ...EMPTY_FORM };
    const base = {
      asset_id: warranty.asset_id || '',
      warranty_provider: warranty.warranty_provider || '',
      warranty_type: warranty.warranty_type || '',
      start_date: warranty.start_date || '',
      end_date: warranty.end_date || '',
      warranty_number: warranty.warranty_number || '',
      contact_number: warranty.contact_number || '',
      notes: warranty.notes || '',
    };
    if (isRenew) {
      // pre-fill new start = old end date, clear end date for user to fill
      base.start_date = warranty.end_date || '';
      base.end_date = '';
      base.notes = '';
    }
    return base;
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.asset_id) { toast.error('Please select an asset'); return; }
    if (!form.end_date) { toast.error('End date is required'); return; }
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  const title = isRenew ? 'Renew Warranty' : warranty ? 'Edit Warranty' : 'Add Warranty';
  const submitLabel = isRenew ? 'Renew Warranty' : warranty ? 'Save Changes' : 'Add Warranty';
  const iconColor = isRenew ? 'from-emerald-500 to-green-600 shadow-emerald-500/30' : 'from-blue-500 to-blue-600 shadow-blue-500/30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${iconColor} flex items-center justify-center shadow-lg`}>
              {isRenew ? (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{title}</h2>
              {isRenew && <p className="text-xs text-slate-400 mt-0.5">Set new coverage period for this warranty</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {isRenew && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2.5">
              <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-emerald-300">New start date is pre-filled from the previous end date. Set the new end date to complete renewal.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Asset */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Asset <span className="text-red-400">*</span></label>
              <select name="asset_id" value={form.asset_id} onChange={handleChange} required
                disabled={isRenew}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-600 bg-slate-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                <option value="">Select Asset...</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.asset_tag} — {a.asset_name}</option>
                ))}
              </select>
            </div>

            {/* Provider */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Warranty Provider</label>
              <input name="warranty_provider" value={form.warranty_provider} onChange={handleChange} placeholder="e.g. Dell ProSupport"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-600 bg-slate-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-500" />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Warranty Type</label>
              <select name="warranty_type" value={form.warranty_type} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-600 bg-slate-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                <option value="">Select Type...</option>
                {WARRANTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Start Date {isRenew && <span className="text-emerald-400 normal-case font-normal">(new period)</span>}
              </label>
              <input type="date" name="start_date" value={form.start_date} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-600 bg-slate-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                End Date <span className="text-red-400">*</span>
                {isRenew && <span className="text-emerald-400 normal-case font-normal"> (new expiry)</span>}
              </label>
              <input type="date" name="end_date" value={form.end_date} onChange={handleChange} required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-600 bg-slate-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
            </div>

            {/* Warranty Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Warranty Number</label>
              <input name="warranty_number" value={form.warranty_number} onChange={handleChange} placeholder="e.g. WR-2024-00123"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-600 bg-slate-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-500" />
            </div>

            {/* Contact */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Contact Number</label>
              <input name="contact_number" value={form.contact_number} onChange={handleChange} placeholder="Support phone / email"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-600 bg-slate-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-500" />
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Additional warranty details..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-600 bg-slate-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-500 resize-none" />
            </div>

            {/* Document Attachments */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Document Attachments</label>
              <AttachmentSection
                storageKey={warranty ? `warranty_attachments_${warranty.id}` : 'warranty_attachments_pending'}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className={`px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all duration-200 disabled:opacity-60 flex items-center gap-2 ${
                isRenew
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
              }`}>
              {saving && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Delete Confirm ── */
const DeleteConfirm = ({ warranty, onClose, onConfirm }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700 p-6">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Delete Warranty</h3>
          <p className="text-sm text-slate-400 mt-0.5">
            Delete warranty for <span className="font-semibold text-slate-200">{warranty?.asset?.asset_name || 'this asset'}</span>? This cannot be undone.
          </p>
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-red-500/30">Delete</button>
      </div>
    </div>
  </div>
);

/* ── Main Page ── */
export const Warranty = () => {
  const [warranties, setWarranties]   = useState([]);
  const [assets, setAssets]           = useState([]);
  const [stats, setStats]             = useState({ total: 0, active: 0, expiring_soon: 0, expired: 0 });
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal]             = useState(null); // { mode: 'add'|'edit'|'renew', warranty? }
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchWarranties = useCallback(async () => {
    try {
      const res = await api.get('/warranties');
      const d = res.data?.data;
      setWarranties(d?.warranties || []);
      setStats(d?.stats || { total: 0, active: 0, expiring_soon: 0, expired: 0 });
    } catch {
      toast.error('Failed to load warranties');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAssets = useCallback(async () => {
    try {
      const res = await api.get('/assets');
      setAssets(res.data?.data?.assets || res.data?.data || []);
    } catch {}
  }, []);

  useEffect(() => { fetchWarranties(); fetchAssets(); }, [fetchWarranties, fetchAssets]);

  const filtered = warranties.filter(w => {
    if (statusFilter !== 'all' && w.status !== statusFilter) return false;
    if (search) {
      const t = search.toLowerCase();
      return (
        w.warranty_number?.toLowerCase().includes(t) ||
        w.warranty_provider?.toLowerCase().includes(t) ||
        w.asset?.asset_tag?.toLowerCase().includes(t) ||
        w.asset?.asset_name?.toLowerCase().includes(t)
      );
    }
    return true;
  });

  const handleSave = async (form) => {
    try {
      if (modal?.mode === 'add') {
        await api.post('/warranties', form);
        toast.success('Warranty added');
      } else if (modal?.mode === 'renew') {
        await api.put(`/warranties/${modal.warranty.id}`, form);
        toast.success('Warranty renewed');
      } else {
        await api.put(`/warranties/${modal.warranty.id}`, form);
        toast.success('Warranty updated');
      }
      setModal(null);
      fetchWarranties();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save warranty');
      throw err;
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/warranties/${deleteTarget.id}`);
      toast.success('Warranty deleted');
      setDeleteTarget(null);
      fetchWarranties();
    } catch {
      toast.error('Failed to delete warranty');
    }
  };

  const daysLeftLabel = (w) => {
    if (w.days_left == null) return '—';
    if (w.days_left < 0) return `${Math.abs(w.days_left)}d ago`;
    if (w.days_left === 0) return 'Today';
    return `${w.days_left}d left`;
  };

  return (
    <AppLayout title="Warranty Management">
      <div className="p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Warranties" value={stats.total} color="blue"
            icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          <StatCard label="Active" value={stats.active} color="green"
            icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          <StatCard label="Expiring Soon" value={stats.expiring_soon} color="amber"
            icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          <StatCard label="Expired" value={stats.expired} color="red"
            icon="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </div>

        {/* Toolbar */}
        <div className="bg-slate-800/80 rounded-2xl shadow-sm border border-slate-700/50 p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by asset, provider, warranty #..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-600 bg-slate-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-500" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-600 bg-slate-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <button onClick={() => setModal({ mode: 'add' })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Warranty
          </button>
        </div>

        {/* Table */}
        <div className="bg-slate-800/80 rounded-2xl shadow-sm border border-slate-700/50 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <p className="text-sm text-slate-500">Loading warranties...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-700 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-slate-300 font-semibold">No warranties found</p>
                <p className="text-sm text-slate-500 mt-1">
                  {search || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Click "Add Warranty" to get started'}
                </p>
              </div>
              {!search && statusFilter === 'all' && (
                <button onClick={() => setModal({ mode: 'add' })}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-500/30">
                  Add Warranty
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/60">
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Asset</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Provider</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Warranty #</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">End Date</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Time Left</th>
                    <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="text-center px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {filtered.map(w => (
                    <tr key={w.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <Link to={`/assets/${w.asset_id}`} className="text-sm font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                            {w.asset?.asset_tag || '—'}
                          </Link>
                          <p className="text-xs text-slate-400 mt-0.5">{w.asset?.asset_name || '—'}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300">{w.warranty_provider || '—'}</td>
                      <td className="px-5 py-4 text-sm text-slate-300">{w.warranty_type || '—'}</td>
                      <td className="px-5 py-4 text-sm font-mono text-slate-400">{w.warranty_number || '—'}</td>
                      <td className="px-5 py-4 text-sm text-slate-300">
                        {w.end_date ? new Date(w.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold ${
                          w.status === 'expired'       ? 'text-red-400' :
                          w.status === 'expiring_soon' ? 'text-amber-400' :
                          'text-emerald-400'
                        }`}>
                          {daysLeftLabel(w)}
                        </span>
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={w.status} /></td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Renew */}
                          <button
                            onClick={() => setModal({ mode: 'renew', warranty: w })}
                            title="Renew"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 text-xs font-semibold transition-colors border border-emerald-500/20">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Renew
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => setModal({ mode: 'edit', warranty: w })}
                            title="Edit"
                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors border border-blue-500/20">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(w)}
                            title="Delete"
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border border-red-500/20">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-slate-700/50">
                <p className="text-xs text-slate-500">Showing {filtered.length} of {warranties.length} warranties</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <WarrantyModal
          warranty={modal.warranty}
          assets={assets}
          mode={modal.mode}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          warranty={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </AppLayout>
  );
};
