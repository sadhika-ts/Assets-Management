import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '../layouts/AppLayout';
import toast from 'react-hot-toast';
import api from '../api/axios';

// ── helpers ─────────────────────────────────────────────────────
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtCurrency = v => v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '—';
const daysLeft = till => Math.ceil((new Date(till) - new Date()) / 86400000);

const statusBadge = (status) => {
  const map = {
    active:        'bg-green-100 text-green-700',
    inactive:      'bg-red-100 text-red-700',
    retired:       'bg-gray-100 text-gray-600',
    received:      'bg-green-100 text-green-700',
    ordered:       'bg-blue-100 text-blue-700',
    pending:       'bg-orange-100 text-orange-700',
    cancelled:     'bg-red-100 text-red-700',
    expiring_soon: 'bg-orange-100 text-orange-700',
    expired:       'bg-red-100 text-red-700',
    upcoming:      'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${map[status] || 'bg-gray-100 text-gray-600'}`}>
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

// ── Report definitions ───────────────────────────────────────────
const REPORTS = [
  {
    id: 'all_assets',
    title: 'All Assets',
    icon: '📦',
    color: 'blue',
    description: 'Complete list of all assets with status, category and assignment details.',
    filters: ['dateFrom', 'dateTo', 'category', 'status'],
  },
  {
    id: 'it_assets',
    title: 'IT Assets',
    icon: '💻',
    color: 'purple',
    description: 'All IT assets — laptops, desktops, routers, switches and more.',
    filters: ['status'],
  },
  {
    id: 'non_it_assets',
    title: 'Non-IT Assets',
    icon: '🪑',
    color: 'teal',
    description: 'Furniture and non-IT equipment tracked in inventory.',
    filters: ['status'],
  },
  {
    id: 'assigned_assets',
    title: 'Assigned Assets',
    icon: '👥',
    color: 'indigo',
    description: 'Assets currently assigned to employees.',
    filters: ['category'],
  },
  {
    id: 'unassigned_assets',
    title: 'Unassigned Assets',
    icon: '📍',
    color: 'orange',
    description: 'Assets that are active but not yet assigned to any employee.',
    filters: ['category'],
  },
  {
    id: 'retired_assets',
    title: 'Retired / Inactive Assets',
    icon: '🗃️',
    color: 'red',
    description: 'Assets that are retired or inactive and no longer in use.',
    filters: [],
  },
  {
    id: 'all_purchases',
    title: 'All Purchase Orders',
    icon: '🛒',
    color: 'cyan',
    description: 'Full list of purchase orders with vendor, date and amount.',
    filters: ['dateFrom', 'dateTo', 'purchaseStatus'],
  },
  {
    id: 'vendor_spend',
    title: 'Vendor-wise Spend',
    icon: '🏢',
    color: 'pink',
    description: 'Total spend per vendor across all purchase orders.',
    filters: ['dateFrom', 'dateTo'],
  },
  {
    id: 'all_contracts',
    title: 'All Contracts',
    icon: '📋',
    color: 'green',
    description: 'All contracts with vendor, validity period and value.',
    filters: ['contractStatus'],
  },
  {
    id: 'expiring_contracts',
    title: 'Expiring Contracts',
    icon: '⚠️',
    color: 'orange',
    description: 'Contracts expiring within the next 60 days.',
    filters: [],
  },
];

const COLOR_BORDER = {
  blue: 'border-blue-500 text-blue-700 bg-blue-50',
  purple: 'border-purple-500 text-purple-700 bg-purple-50',
  teal: 'border-teal-500 text-teal-700 bg-teal-50',
  indigo: 'border-indigo-500 text-indigo-700 bg-indigo-50',
  orange: 'border-orange-500 text-orange-700 bg-orange-50',
  red: 'border-red-500 text-red-700 bg-red-50',
  cyan: 'border-cyan-500 text-cyan-700 bg-cyan-50',
  pink: 'border-pink-500 text-pink-700 bg-pink-50',
  green: 'border-green-500 text-green-700 bg-green-50',
};

// ── Main component ───────────────────────────────────────────────
export const Reports = () => {
  const [assets, setAssets] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [contracts, setContracts] = useState([]);
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

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, pRes, cRes] = await Promise.allSettled([
          api.get('/assets?limit=500'),
          api.get('/purchases?limit=500'),
          api.get('/contracts?limit=500'),
        ]);
        if (aRes.status === 'fulfilled') setAssets(aRes.value.data?.data?.assets || []);
        if (pRes.status === 'fulfilled') setPurchases(pRes.value.data?.data?.purchases || []);
        if (cRes.status === 'fulfilled') setContracts(cRes.value.data?.data?.contracts || []);
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
  }, [dateFrom, dateTo, filterCategory, filterStatus, filterPurchaseStatus, filterContractStatus, assets, purchases, contracts]);

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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          <span className="ml-3 text-gray-500">Loading data…</span>
        </div>
      </AppLayout>
    );
  }

  // ── Report preview screen ────────────────────────────────────────
  if (activeReport) {
    const report = activeReport;
    const hasFilters = report.filters.length > 0;
    const headers = previewRows.length > 0 ? Object.keys(previewRows[0]) : [];

    return (
      <AppLayout title="Reports">
        <div className="space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={handleBack}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                ← Back
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{report.icon} {report.title}</h2>
                <p className="text-sm text-gray-500">{report.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleExport('csv')}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors">
                ↓ CSV
              </button>
              <button onClick={() => handleExport('json')}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors">
                ↓ JSON
              </button>
            </div>
          </div>

          {/* Filters */}
          {hasFilters && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Filter Report</p>
              <div className="flex flex-wrap gap-4">
                {report.filters.includes('dateFrom') && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">From Date</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                )}
                {report.filters.includes('dateTo') && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">To Date</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                )}
                {report.filters.includes('category') && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Category</label>
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                      <option value="all">All</option>
                      <option value="IT">IT</option>
                      <option value="Non-IT">Non-IT</option>
                    </select>
                  </div>
                )}
                {report.filters.includes('status') && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="retired">Retired</option>
                    </select>
                  </div>
                )}
                {report.filters.includes('purchaseStatus') && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                    <select value={filterPurchaseStatus} onChange={e => setFilterPurchaseStatus(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
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
                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                    <select value={filterContractStatus} onChange={e => setFilterContractStatus(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
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
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-3 border border-gray-100">
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-800">{previewRows.length}</span> records found
            </span>
            {previewRows.length > 0 && (
              <span className="text-xs text-gray-400">{headers.length} columns</span>
            )}
          </div>

          {/* Table preview */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {previewRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <span className="text-4xl mb-3">📭</span>
                <p className="text-sm">No records match the selected filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                      {headers.map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {previewRows.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                        {headers.map(h => (
                          <td key={h} className="px-4 py-3 text-gray-700 whitespace-nowrap">
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
  const assetReports = REPORTS.filter(r => ['all_assets','it_assets','non_it_assets','assigned_assets','unassigned_assets','retired_assets'].includes(r.id));
  const purchaseReports = REPORTS.filter(r => ['all_purchases','vendor_spend'].includes(r.id));
  const contractReports = REPORTS.filter(r => ['all_contracts','expiring_contracts'].includes(r.id));

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
  };

  const ReportCard = ({ report }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
      onClick={() => handleGenerate(report)}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{report.icon}</span>
        <span className={`text-lg font-bold px-2.5 py-0.5 rounded-lg border ${COLOR_BORDER[report.color]}`}>
          {counts[report.id] ?? 0}
        </span>
      </div>
      <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">{report.title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{report.description}</p>
      <div className="mt-4 flex items-center gap-1 text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Generate Report →
      </div>
    </div>
  );

  return (
    <AppLayout title="Reports">
      <div className="space-y-8">

        {/* Page header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
          <p className="text-sm text-gray-500 mt-1">Select a report to preview and export data as CSV or JSON.</p>
        </div>

        {/* Quick summary strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Assets', value: assets.length, color: 'bg-blue-600' },
            { label: 'Total Purchases', value: purchases.length, color: 'bg-purple-600' },
            { label: 'Total Contracts', value: contracts.length, color: 'bg-teal-600' },
            { label: 'Expiring Soon', value: counts.expiring_contracts, color: 'bg-orange-500' },
          ].map((s, i) => (
            <div key={i} className={`${s.color} text-white rounded-xl p-4 shadow-sm`}>
              <p className="text-white/75 text-xs font-medium uppercase tracking-wide">{s.label}</p>
              <p className="text-3xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Asset reports */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Asset Reports</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {assetReports.map(r => <ReportCard key={r.id} report={r} />)}
          </div>
        </div>

        {/* Purchase reports */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Purchase Reports</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {purchaseReports.map(r => <ReportCard key={r.id} report={r} />)}
          </div>
        </div>

        {/* Contract reports */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Contract Reports</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contractReports.map(r => <ReportCard key={r.id} report={r} />)}
          </div>
        </div>

      </div>
    </AppLayout>
  );
};
