import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '../layouts/AppLayout';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { backendApi } from '../api/axios';

// ── helpers ─────────────────────────────────────────────────────
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtCurrency = v => v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '—';
const daysLeft = till => Math.ceil((new Date(till) - new Date()) / 86400000);

const statusBadge = (status) => {
  const map = {
    active:        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    inactive:      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    retired:       'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400',
    received:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    ordered:       'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    pending:       'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    cancelled:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    expiring_soon: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    expired:       'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    upcoming:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${map[status] || 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400'}`}>
      {status?.replace('_', ' ')}
    </span>
  );
};

// ── Export helpers ───────────────────────────────────────────────
const toCSV = (rows, headers) => {
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [headers.map(esc).join(','), ...rows.map(r => headers.map(h => esc(r[h])).join(','))].join('\n');
};
const download = (content, filename, mime) => {
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([content], { type: mime })),
    download: filename,
  });
  a.click();
  URL.revokeObjectURL(a.href);
};

// ── SVG icon paths per report ────────────────────────────────────
const REPORT_ICONS = {
  all_assets:          'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  it_assets:           'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  non_it_assets:       'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  assigned_assets:     'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  unassigned_assets:   'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
  retired_assets:      'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
  all_purchases:       'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
  vendor_spend:        'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  all_contracts:        'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  expiring_contracts:   'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z',
  all_warranties:       'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  expiring_warranties:  'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  expired_warranties:   'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
};

// ── Report definitions ───────────────────────────────────────────
const REPORTS = [
  {
    id: 'all_assets',
    title: 'All Assets',
    color: 'blue',
    description: 'Complete list of all assets with status, category and assignment details.',
    filters: ['dateFrom', 'dateTo', 'category', 'status'],
  },
  {
    id: 'it_assets',
    title: 'IT Assets',
    color: 'purple',
    description: 'All IT assets — laptops, desktops, routers, switches and more.',
    filters: ['status'],
  },
  {
    id: 'non_it_assets',
    title: 'Non-IT Assets',
    color: 'teal',
    description: 'Furniture and non-IT equipment tracked in inventory.',
    filters: ['status'],
  },
  {
    id: 'assigned_assets',
    title: 'Assigned Assets',
    color: 'indigo',
    description: 'Assets currently assigned to employees.',
    filters: ['category'],
  },
  {
    id: 'unassigned_assets',
    title: 'Unassigned Assets',
    color: 'orange',
    description: 'Assets that are active but not yet assigned to any employee.',
    filters: ['category'],
  },
  {
    id: 'retired_assets',
    title: 'Retired / Inactive Assets',
    color: 'red',
    description: 'Assets that are retired or inactive and no longer in use.',
    filters: [],
  },
  {
    id: 'all_purchases',
    title: 'All Purchase Orders',
    color: 'cyan',
    description: 'Full list of purchase orders with vendor, date and amount.',
    filters: ['dateFrom', 'dateTo', 'purchaseStatus'],
  },
  {
    id: 'vendor_spend',
    title: 'Vendor-wise Spend',
    color: 'pink',
    description: 'Total spend per vendor across all purchase orders.',
    filters: ['dateFrom', 'dateTo'],
  },
  {
    id: 'all_contracts',
    title: 'All Contracts',
    color: 'green',
    description: 'All contracts with vendor, validity period and value.',
    filters: ['contractStatus'],
  },
  {
    id: 'expiring_contracts',
    title: 'Expiring Contracts',
    color: 'orange',
    description: 'Contracts expiring within the next 60 days.',
    filters: [],
  },
  {
    id: 'all_warranties',
    title: 'All Warranties',
    color: 'blue',
    description: 'Complete list of all asset warranties with provider, type, and validity.',
    filters: ['warrantyStatus'],
  },
  {
    id: 'expiring_warranties',
    title: 'Expiring Warranties',
    color: 'amber',
    description: 'Warranties expiring within the next 30 days.',
    filters: [],
  },
  {
    id: 'expired_warranties',
    title: 'Expired Warranties',
    color: 'red',
    description: 'Warranties that have already expired and may need renewal.',
    filters: [],
  },
];

const COLOR_MAP = {
  blue:   { icon: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',   badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',   hover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400'   },
  purple: { icon: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', hover: 'group-hover:text-purple-600 dark:group-hover:text-purple-400' },
  teal:   { icon: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',   badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',   hover: 'group-hover:text-teal-600 dark:group-hover:text-teal-400'   },
  indigo: { icon: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400', badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', hover: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400' },
  orange: { icon: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', hover: 'group-hover:text-orange-600 dark:group-hover:text-orange-400' },
  red:    { icon: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',       badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',       hover: 'group-hover:text-red-600 dark:group-hover:text-red-400'     },
  cyan:   { icon: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',   badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',   hover: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400'   },
  pink:   { icon: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',   badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',   hover: 'group-hover:text-pink-600 dark:group-hover:text-pink-400'   },
  green:  { icon: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', hover: 'group-hover:text-green-600 dark:group-hover:text-green-400' },
  amber:  { icon: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', hover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400' },
};

// ── Main component ───────────────────────────────────────────────
export const Reports = () => {
  const [assets, setAssets] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active report state
  const [activeReport, setActiveReport] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [generating, setGenerating] = useState(false);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPurchaseStatus, setFilterPurchaseStatus] = useState('all');
  const [filterContractStatus, setFilterContractStatus] = useState('all');
  const [filterWarrantyStatus, setFilterWarrantyStatus] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, pRes, cRes, wRes] = await Promise.allSettled([
          api.get('/assets?limit=500'),
          api.get('/purchases?limit=500'),
          api.get('/contracts?limit=500'),
          backendApi.get('/warranties?limit=500'),
        ]);
        if (aRes.status === 'fulfilled') setAssets(aRes.value.data?.data?.assets || []);
        if (pRes.status === 'fulfilled') setPurchases(pRes.value.data?.data?.purchases || []);
        if (cRes.status === 'fulfilled') setContracts(cRes.value.data?.data?.contracts || []);
        if (wRes.status === 'fulfilled') setWarranties(wRes.value.data?.data?.warranties || []);
      } catch { toast.error('Failed to load data'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // ── Row builders ────────────────────────────────────────────────
  const buildRows = (reportId) => {
    const inDateRange = (d) => {
      if (!d) return true;
      const dt = new Date(d);
      if (dateFrom && dt < new Date(dateFrom)) return false;
      if (dateTo && dt > new Date(dateTo)) return false;
      return true;
    };

    switch (reportId) {
      case 'all_assets': {
        return assets
          .filter(a => inDateRange(a.created_at))
          .filter(a => filterCategory === 'all' || a.category === filterCategory)
          .filter(a => filterStatus === 'all' || a.status === filterStatus)
          .map(a => ({
            'Asset Tag': a.asset_tag,
            'Asset Name': a.asset_name,
            'Category': a.category,
            'Sub-Type': a.sub_type,
            'Status': a.status,
            'Assigned To': a.assigned_to || 'Unassigned',
            'Purchase Vendor': a.purchase?.vendor_name || '—',
            'Added On': fmtDate(a.created_at),
          }));
      }
      case 'it_assets': {
        return assets
          .filter(a => a.category === 'IT')
          .filter(a => filterStatus === 'all' || a.status === filterStatus)
          .map(a => ({
            'Asset Tag': a.asset_tag,
            'Asset Name': a.asset_name,
            'Sub-Type': a.sub_type,
            'Serial No': a.serial_no || '—',
            'MAC Address': a.mac_address || '—',
            'Status': a.status,
            'Assigned To': a.assigned_to || 'Unassigned',
            'Added On': fmtDate(a.created_at),
          }));
      }
      case 'non_it_assets': {
        return assets
          .filter(a => a.category === 'Non-IT')
          .filter(a => filterStatus === 'all' || a.status === filterStatus)
          .map(a => ({
            'Asset Tag': a.asset_tag,
            'Asset Name': a.asset_name,
            'Sub-Type': a.sub_type,
            'Status': a.status,
            'Assigned To': a.assigned_to || 'Unassigned',
            'Added On': fmtDate(a.created_at),
          }));
      }
      case 'assigned_assets': {
        return assets
          .filter(a => a.assigned_to && a.assigned_to.trim())
          .filter(a => filterCategory === 'all' || a.category === filterCategory)
          .map(a => ({
            'Asset Tag': a.asset_tag,
            'Asset Name': a.asset_name,
            'Category': a.category,
            'Sub-Type': a.sub_type,
            'Assigned To': a.assigned_to,
            'Status': a.status,
          }));
      }
      case 'unassigned_assets': {
        return assets
          .filter(a => (!a.assigned_to || !a.assigned_to.trim()) && a.status === 'active')
          .filter(a => filterCategory === 'all' || a.category === filterCategory)
          .map(a => ({
            'Asset Tag': a.asset_tag,
            'Asset Name': a.asset_name,
            'Category': a.category,
            'Sub-Type': a.sub_type,
            'Status': a.status,
            'Added On': fmtDate(a.created_at),
          }));
      }
      case 'retired_assets': {
        return assets
          .filter(a => a.status === 'retired' || a.status === 'inactive')
          .map(a => ({
            'Asset Tag': a.asset_tag,
            'Asset Name': a.asset_name,
            'Category': a.category,
            'Sub-Type': a.sub_type,
            'Status': a.status,
            'Last Assigned To': a.assigned_to || '—',
          }));
      }
      case 'all_purchases': {
        return purchases
          .filter(p => inDateRange(p.purchase_date))
          .filter(p => filterPurchaseStatus === 'all' || p.status === filterPurchaseStatus)
          .map(p => ({
            'PO ID': p.purchase_id,
            'Vendor': p.vendor_name,
            'Date': fmtDate(p.purchase_date),
            'Invoice No': p.invoice_number || '—',
            'Amount': fmtCurrency(p.total_amount),
            'Payment Method': p.payment_method || '—',
            'Status': p.status,
          }));
      }
      case 'vendor_spend': {
        const map = {};
        purchases
          .filter(p => inDateRange(p.purchase_date))
          .forEach(p => {
            if (!map[p.vendor_name]) map[p.vendor_name] = { orders: 0, total: 0 };
            map[p.vendor_name].orders += 1;
            map[p.vendor_name].total += parseFloat(p.total_amount) || 0;
          });
        return Object.entries(map)
          .sort((a, b) => b[1].total - a[1].total)
          .map(([vendor, d]) => ({
            'Vendor': vendor,
            'No. of Orders': d.orders,
            'Total Spend': fmtCurrency(d.total),
          }));
      }
      case 'all_contracts': {
        return contracts
          .filter(c => filterContractStatus === 'all' || c.status === filterContractStatus)
          .map(c => ({
            'Contract ID': c.contract_id,
            'Contract Name': c.contract_name,
            'Vendor': c.vendor_name,
            'Active From': fmtDate(c.active_from),
            'Active Till': fmtDate(c.active_till),
            'Value': fmtCurrency(c.contract_value),
            'Status': c.status?.replace('_', ' '),
          }));
      }
      case 'expiring_contracts': {
        const in60 = new Date(); in60.setDate(in60.getDate() + 60);
        return contracts
          .filter(c => {
            const till = new Date(c.active_till);
            return till >= new Date() && till <= in60;
          })
          .sort((a, b) => new Date(a.active_till) - new Date(b.active_till))
          .map(c => ({
            'Contract ID': c.contract_id,
            'Contract Name': c.contract_name,
            'Vendor': c.vendor_name,
            'Expires On': fmtDate(c.active_till),
            'Days Left': daysLeft(c.active_till),
            'Value': fmtCurrency(c.contract_value),
          }));
      }
      case 'all_warranties': {
        return warranties
          .filter(w => filterWarrantyStatus === 'all' || w.status === filterWarrantyStatus)
          .map(w => ({
            'Asset Tag': w.asset?.asset_tag || '—',
            'Asset Name': w.asset?.asset_name || '—',
            'Provider': w.warranty_provider || '—',
            'Type': w.warranty_type || '—',
            'Warranty #': w.warranty_number || '—',
            'Contact': w.contact_number || '—',
            'Start Date': fmtDate(w.start_date),
            'End Date': fmtDate(w.end_date),
            'Days Left': w.days_left != null ? (w.days_left < 0 ? `Expired ${Math.abs(w.days_left)}d ago` : `${w.days_left}d`) : '—',
            'Status': w.status,
          }));
      }
      case 'expiring_warranties': {
        return warranties
          .filter(w => w.status === 'expiring_soon')
          .sort((a, b) => (a.days_left ?? 999) - (b.days_left ?? 999))
          .map(w => ({
            'Asset Tag': w.asset?.asset_tag || '—',
            'Asset Name': w.asset?.asset_name || '—',
            'Provider': w.warranty_provider || '—',
            'Type': w.warranty_type || '—',
            'Warranty #': w.warranty_number || '—',
            'End Date': fmtDate(w.end_date),
            'Days Left': w.days_left != null ? `${w.days_left}d` : '—',
            'Contact': w.contact_number || '—',
          }));
      }
      case 'expired_warranties': {
        return warranties
          .filter(w => w.status === 'expired')
          .sort((a, b) => new Date(b.end_date) - new Date(a.end_date))
          .map(w => ({
            'Asset Tag': w.asset?.asset_tag || '—',
            'Asset Name': w.asset?.asset_name || '—',
            'Provider': w.warranty_provider || '—',
            'Type': w.warranty_type || '—',
            'Warranty #': w.warranty_number || '—',
            'Expired On': fmtDate(w.end_date),
            'Expired Days Ago': w.days_left != null ? `${Math.abs(w.days_left)}d ago` : '—',
            'Contact': w.contact_number || '—',
          }));
      }
      default: return [];
    }
  };

  const handleGenerate = (report) => {
    setGenerating(true);
    setActiveReport(report);
    // Reset filters
    setDateFrom(''); setDateTo('');
    setFilterCategory('all'); setFilterStatus('all');
    setFilterPurchaseStatus('all'); setFilterContractStatus('all');
    setFilterWarrantyStatus('all');
    setTimeout(() => {
      const rows = buildRows(report.id);
      setPreviewRows(rows);
      setGenerating(false);
    }, 100);
  };

  // Re-run when filters change while a report is active
  useEffect(() => {
    if (!activeReport) return;
    setPreviewRows(buildRows(activeReport.id));
  }, [dateFrom, dateTo, filterCategory, filterStatus, filterPurchaseStatus, filterContractStatus, filterWarrantyStatus, assets, purchases, contracts, warranties]);

  const handleExport = (format) => {
    if (!previewRows.length) { toast.error('No data to export'); return; }
    const headers = Object.keys(previewRows[0]);
    const slug = activeReport.title.toLowerCase().replace(/\s+/g, '_');
    if (format === 'json') {
      download(JSON.stringify(previewRows, null, 2), `${slug}.json`, 'application/json');
    } else {
      const csv = toCSV(previewRows, headers);
      download(csv, `${slug}.csv`, 'text/csv');
    }
    toast.success(`${activeReport.title} exported as ${format.toUpperCase()}`);
  };

  const handleBack = () => { setActiveReport(null); setPreviewRows([]); };

  if (loading) {
    return (
      <AppLayout title="Reports">
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm text-gray-400 dark:text-slate-500">Loading report data…</p>
        </div>
      </AppLayout>
    );
  }

  // ── Report preview screen ────────────────────────────────────────
  if (activeReport) {
    const report = activeReport;
    const hasFilters = report.filters.length > 0;
    const headers = previewRows.length > 0 ? Object.keys(previewRows[0]) : [];

    const c = COLOR_MAP[report.color] || COLOR_MAP.blue;
    return (
      <AppLayout title="Reports">
        <div className="space-y-5">

          {/* Header */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button onClick={handleBack}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                  </svg>
                </button>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={REPORT_ICONS[report.id]} />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">{report.title}</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{report.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleExport('csv')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm shadow-emerald-500/20">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  CSV
                </button>
                <button onClick={() => handleExport('json')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm shadow-purple-500/20">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  JSON
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          {hasFilters && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-3">Filter Report</p>
              <div className="flex flex-wrap gap-4">
                {report.filters.includes('dateFrom') && (
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">From Date</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-200" />
                  </div>
                )}
                {report.filters.includes('dateTo') && (
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">To Date</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-200" />
                  </div>
                )}
                {report.filters.includes('category') && (
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Category</label>
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-200">
                      <option value="all">All</option>
                      <option value="IT">IT</option>
                      <option value="Non-IT">Non-IT</option>
                    </select>
                  </div>
                )}
                {report.filters.includes('status') && (
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Status</label>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-200">
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="retired">Retired</option>
                    </select>
                  </div>
                )}
                {report.filters.includes('purchaseStatus') && (
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Status</label>
                    <select value={filterPurchaseStatus} onChange={e => setFilterPurchaseStatus(e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-200">
                      <option value="all">All</option>
                      <option value="pending">Pending</option>
                      <option value="ordered">Ordered</option>
                      <option value="received">Received</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
                {report.filters.includes('contractStatus') && (
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Status</label>
                    <select value={filterContractStatus} onChange={e => setFilterContractStatus(e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-200">
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="expiring_soon">Expiring Soon</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                )}
                {report.filters.includes('warrantyStatus') && (
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Status</label>
                    <select value={filterWarrantyStatus} onChange={e => setFilterWarrantyStatus(e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-200">
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="expiring_soon">Expiring Soon</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary bar */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800/60 rounded-2xl px-5 py-3 border border-gray-100 dark:border-slate-700">
            <span className="text-sm text-gray-600 dark:text-slate-400">
              <span className="font-semibold text-gray-800 dark:text-slate-200">{previewRows.length}</span> records found
            </span>
            {previewRows.length > 0 && (
              <span className="text-xs text-gray-400 dark:text-slate-500">{headers.length} columns</span>
            )}
          </div>

          {/* Table preview */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
            {previewRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                  <svg className="w-7 h-7 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-slate-400 font-medium">No records match the selected filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide w-8">#</th>
                      {headers.map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                    {previewRows.map((row, i) => (
                      <tr key={i} className="hover:bg-blue-50/30 dark:hover:bg-slate-700/40 transition-colors">
                        <td className="px-4 py-3 text-gray-300 dark:text-slate-600 text-xs">{i + 1}</td>
                        {headers.map(h => (
                          <td key={h} className="px-4 py-3 text-gray-700 dark:text-slate-300 whitespace-nowrap">
                            {h === 'Status' ? statusBadge(row[h]) : row[h]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </AppLayout>
    );
  }

  // ── Report catalogue screen ──────────────────────────────────────
  const assetReports    = REPORTS.filter(r => ['all_assets','it_assets','non_it_assets','assigned_assets','unassigned_assets','retired_assets'].includes(r.id));
  const purchaseReports = REPORTS.filter(r => ['all_purchases','vendor_spend'].includes(r.id));
  const contractReports = REPORTS.filter(r => ['all_contracts','expiring_contracts'].includes(r.id));
  const warrantyReports = REPORTS.filter(r => ['all_warranties','expiring_warranties','expired_warranties'].includes(r.id));

  const counts = {
    all_assets: assets.length,
    it_assets: assets.filter(a => a.category === 'IT').length,
    non_it_assets: assets.filter(a => a.category === 'Non-IT').length,
    assigned_assets: assets.filter(a => a.assigned_to?.trim()).length,
    unassigned_assets: assets.filter(a => !a.assigned_to?.trim() && a.status === 'active').length,
    retired_assets: assets.filter(a => a.status === 'retired' || a.status === 'inactive').length,
    all_purchases: purchases.length,
    vendor_spend: [...new Set(purchases.map(p => p.vendor_name))].length,
    all_contracts: contracts.length,
    expiring_contracts: (() => {
      const in60 = new Date(); in60.setDate(in60.getDate() + 60);
      return contracts.filter(c => { const t = new Date(c.active_till); return t >= new Date() && t <= in60; }).length;
    })(),
    all_warranties:      warranties.length,
    expiring_warranties: warranties.filter(w => w.status === 'expiring_soon').length,
    expired_warranties:  warranties.filter(w => w.status === 'expired').length,
  };

  const ReportCard = ({ report }) => {
    const c = COLOR_MAP[report.color] || COLOR_MAP.blue;
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
        onClick={() => handleGenerate(report)}>
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.icon} group-hover:scale-110 transition-transform duration-200`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d={REPORT_ICONS[report.id]} />
            </svg>
          </div>
          <span className={`text-lg font-bold px-3 py-0.5 rounded-xl ${c.badge}`}>
            {counts[report.id] ?? 0}
          </span>
        </div>
        <h3 className={`font-semibold text-gray-800 dark:text-slate-100 mb-1 transition-colors ${c.hover}`}>{report.title}</h3>
        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{report.description}</p>
        <div className="mt-4 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Generate Report
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    );
  };

  return (
    <AppLayout title="Reports">
      <div className="space-y-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Reports</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Select a report to preview and export data as CSV or JSON.</p>
          </div>
        </div>

        {/* Quick summary strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Assets',      value: assets.length,               from: 'from-blue-500',   to: 'to-blue-600'   },
            { label: 'Total Purchases',   value: purchases.length,            from: 'from-purple-500', to: 'to-purple-600' },
            { label: 'Total Contracts',   value: contracts.length,            from: 'from-teal-500',   to: 'to-teal-600'   },
            { label: 'Total Warranties',  value: warranties.length,           from: 'from-blue-600',   to: 'to-indigo-600' },
            { label: 'Expiring Soon',     value: counts.expiring_contracts + counts.expiring_warranties, from: 'from-orange-500', to: 'to-orange-600' },
          ].map((s, i) => (
            <div key={i} className={`bg-gradient-to-br ${s.from} ${s.to} text-white rounded-2xl p-5 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200`}>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wide">{s.label}</p>
              <p className="text-3xl font-bold mt-1.5">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Asset reports */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Asset Reports</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {assetReports.map(r => <ReportCard key={r.id} report={r} />)}
          </div>
        </div>

        {/* Purchase reports */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-purple-500 rounded-full" />
            <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Purchase Reports</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {purchaseReports.map(r => <ReportCard key={r.id} report={r} />)}
          </div>
        </div>

        {/* Contract reports */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-teal-500 rounded-full" />
            <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Contract Reports</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contractReports.map(r => <ReportCard key={r.id} report={r} />)}
          </div>
        </div>

        {/* Warranty reports */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Warranty Reports</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {warrantyReports.map(r => <ReportCard key={r.id} report={r} />)}
          </div>
        </div>

      </div>
    </AppLayout>
  );
};
