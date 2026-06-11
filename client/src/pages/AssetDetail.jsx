import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import QRCode from 'qrcode';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const displayAssignee = (val) => (!val || UUID_RE.test(val) ? '—' : val);

const StatusBadge = ({ status }) => {
  const s = {
    active:   'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-700',
    inactive: 'bg-red-100 text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-700',
    retired:  'bg-gray-100 text-gray-600 ring-1 ring-gray-200 dark:bg-slate-700 dark:text-slate-400 dark:ring-slate-600',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${s[status] || 'bg-gray-100 text-gray-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-emerald-500' : status === 'inactive' ? 'bg-red-500' : 'bg-gray-400'}`} />
      {status}
    </span>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-start gap-4 py-2.5 border-b border-gray-100 dark:border-slate-700 last:border-b-0">
    <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide shrink-0 w-36">{label}</span>
    <span className="text-sm text-gray-800 dark:text-slate-200 text-right font-medium">{value || '—'}</span>
  </div>
);

const BoolBadge = ({ value, label }) => (
  <div className="flex items-center gap-2.5 py-1">
    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${value ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
      {value ? 'YES' : 'NO'}
    </span>
    <span className="text-sm text-gray-700 dark:text-slate-300">{label}</span>
  </div>
);

const SectionCard = ({ title, icon, children }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-slate-700">
      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wide">{title}</h3>
    </div>
    {children}
  </div>
);

const buildQrPayload = (a) => {
  const lines = [
    `ASSET TAG: ${a.asset_tag}`,
    `NAME: ${a.asset_name}`,
    `CATEGORY: ${a.category}`,
    `TYPE: ${a.sub_type}`,
    `STATUS: ${a.status}`,
  ];
  if (a.serial_no || a.detail?.serial_no) lines.push(`SERIAL: ${a.serial_no || a.detail?.serial_no}`);
  if (a.mac_address || a.detail?.mac_address) lines.push(`MAC: ${a.mac_address || a.detail?.mac_address}`);
  const assignee = displayAssignee(a.assigned_to);
  if (assignee !== '—') lines.push(`ASSIGNED TO: ${assignee}`);
  if (a.detail?.manufacturer) lines.push(`MANUFACTURER: ${a.detail.manufacturer}`);
  if (a.detail?.processor_name) lines.push(`PROCESSOR: ${a.detail.processor_name}`);
  if (a.detail?.ram_gb) lines.push(`RAM: ${a.detail.ram_gb} GB`);
  if (a.detail?.disk_gb) lines.push(`DISK: ${a.detail.disk_gb} GB`);
  if (a.detail?.os_type) lines.push(`OS: ${a.detail.os_type}${a.detail.os_version ? ' ' + a.detail.os_version : ''}`);
  return lines.join('\n');
};

export const AssetDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { canEdit } = useAuth();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const assetRes = await api.get(`/assets/${id}`);
        const fetched = assetRes.data.data?.asset || assetRes.data.data;
        if (!fetched) throw new Error('Asset not found');
        setAsset(fetched);

        const payload = buildQrPayload(fetched);
        const dataUrl = await QRCode.toDataURL(payload, {
          width: 240, margin: 1,
          color: { dark: '#1e293b', light: '#ffffff' },
          errorCorrectionLevel: 'M',
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Failed to load asset';
        setError(msg !== 'Route not found' ? msg : 'Failed to load asset');
      } finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const handlePrintLabel = () => {
    if (!asset || !qrDataUrl) return;
    const assignee = displayAssignee(asset.assigned_to);
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Asset Label — ${asset.asset_tag}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #fff; display: flex; justify-content: center; align-items: flex-start; padding: 24px; }
    .label { border: 2px solid #1e293b; border-radius: 10px; padding: 18px 20px; width: 320px; text-align: center; }
    .org { font-size: 10px; color: #64748b; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
    .tag { font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #1e293b; margin-bottom: 2px; }
    .name { font-size: 13px; color: #475569; margin-bottom: 12px; }
    .qr { display: block; margin: 0 auto 12px; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 10px 0; }
    .meta { font-size: 11px; color: #475569; line-height: 1.9; text-align: left; }
    .meta-row { display: flex; justify-content: space-between; }
    .meta-label { color: #94a3b8; font-weight: 600; text-transform: uppercase; font-size: 9px; }
    .meta-val { color: #1e293b; font-size: 11px; font-weight: 500; }
    .footer { margin-top: 10px; font-size: 9px; color: #94a3b8; letter-spacing: 0.5px; }
    @media print { body { padding: 0; } @page { margin: 8mm; size: 90mm 120mm; } }
  </style>
</head>
<body>
  <div class="label">
    <div class="org">IT Asset Management</div>
    <div class="tag">${asset.asset_tag}</div>
    <div class="name">${asset.asset_name}</div>
    <img class="qr" src="${qrDataUrl}" width="200" height="200" />
    <hr class="divider"/>
    <div class="meta">
      <div class="meta-row"><span class="meta-label">Type</span><span class="meta-val">${asset.sub_type}</span></div>
      <div class="meta-row"><span class="meta-label">Category</span><span class="meta-val">${asset.category}</span></div>
      <div class="meta-row"><span class="meta-label">Status</span><span class="meta-val">${asset.status}</span></div>
      ${(asset.serial_no || asset.detail?.serial_no) ? `<div class="meta-row"><span class="meta-label">Serial</span><span class="meta-val">${asset.serial_no || asset.detail?.serial_no}</span></div>` : ''}
      ${assignee !== '—' ? `<div class="meta-row"><span class="meta-label">Assigned To</span><span class="meta-val">${assignee}</span></div>` : ''}
      ${asset.detail?.manufacturer ? `<div class="meta-row"><span class="meta-label">Manufacturer</span><span class="meta-val">${asset.detail.manufacturer}</span></div>` : ''}
    </div>
    <div class="footer">Scan QR code to view full asset details</div>
  </div>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }<\/script>
</body>
</html>`);
    win.document.close();
  };

  if (loading) return (
    <AppLayout title="Asset Details">
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
        <p className="text-sm text-gray-400 dark:text-slate-500">Loading asset details…</p>
      </div>
    </AppLayout>
  );

  if (error || !asset) return (
    <AppLayout title="Asset Details">
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        <p className="font-semibold text-gray-700 dark:text-slate-200">Failed to load asset</p>
        <p className="text-sm text-gray-400 dark:text-slate-500">{error}</p>
        <button onClick={() => navigate('/assets')}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          Back to Assets
        </button>
      </div>
    </AppLayout>
  );

  const serialNo = asset.serial_no || asset.detail?.serial_no;
  const macAddress = asset.mac_address || asset.detail?.mac_address;
  const assignee = displayAssignee(asset.assigned_to);

  return (
    <AppLayout title="Asset Details">
      <div className="space-y-6">

        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 font-mono">{asset.asset_tag}</h1>
                  <StatusBadge status={asset.status} />
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  {asset.asset_name}
                  <span className="mx-2 text-gray-300 dark:text-slate-600">·</span>
                  {asset.category}
                  <span className="mx-2 text-gray-300 dark:text-slate-600">·</span>
                  {asset.sub_type}
                </p>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button onClick={handlePrintLabel}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-sm transition-colors shadow-lg shadow-purple-500/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                </svg>
                Print QR Label
              </button>
              {canEdit() && (
                <button onClick={() => navigate(`/assets/${id}/edit`)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors shadow-lg shadow-blue-500/20">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Edit Asset
                </button>
              )}
              <button onClick={() => navigate('/assets')}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl font-medium text-sm transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* QR Code card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 flex flex-col items-center">
            <div className="flex items-center gap-2 w-full mb-4 pb-3 border-b border-gray-100 dark:border-slate-700">
              <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wide">QR Code Label</h3>
            </div>

            <div className="border-2 border-slate-800 dark:border-slate-600 rounded-xl p-4 w-full text-center bg-white">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">IT Asset Management</p>
              <p className="text-lg font-black tracking-widest text-slate-900 mb-0.5">{asset.asset_tag}</p>
              <p className="text-xs text-gray-500 mb-3">{asset.asset_name}</p>
              {qrDataUrl
                ? <img src={qrDataUrl} alt="QR Code" className="mx-auto w-44 h-44" />
                : <div className="w-44 h-44 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
                  </div>
              }
              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-0.5">
                <p>{asset.sub_type} · <span className="capitalize">{asset.status}</span></p>
                {serialNo && <p>S/N: {serialNo}</p>}
                {assignee !== '—' && <p>Assigned: {assignee}</p>}
              </div>
            </div>

            <button onClick={handlePrintLabel}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-sm transition-colors shadow-lg shadow-purple-500/20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              Print QR Label
            </button>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 text-center">Scan to view all asset details</p>
          </div>

          {/* Right: Details (2 cols) */}
          <div className="lg:col-span-2 space-y-5">

            <SectionCard title="Basic Information" icon="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
              <InfoRow label="Asset Tag"   value={<span className="font-mono text-blue-600 dark:text-blue-400">{asset.asset_tag}</span>} />
              <InfoRow label="Asset Name"  value={asset.asset_name} />
              <InfoRow label="Category"    value={asset.category} />
              <InfoRow label="Sub Type"    value={asset.sub_type} />
              {asset.other_subtype_description && <InfoRow label="Description" value={asset.other_subtype_description} />}
              <InfoRow label="Status"      value={<StatusBadge status={asset.status} />} />
              <InfoRow label="Serial No."  value={serialNo} />
              <InfoRow label="MAC Address" value={macAddress} />
              <InfoRow label="Assigned To" value={assignee} />
              <InfoRow label="Added On"    value={asset.created_at ? new Date(asset.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : null} />
            </SectionCard>

            {asset.category === 'IT' && asset.detail && (
              <SectionCard title="Technical Details" icon="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18">
                {asset.detail.manufacturer    && <InfoRow label="Manufacturer" value={asset.detail.manufacturer} />}
                {asset.detail.processor_name  && <InfoRow label="Processor"    value={asset.detail.processor_name} />}
                {asset.detail.cores           && <InfoRow label="CPU Cores"    value={asset.detail.cores} />}
                {asset.detail.ram_gb          && <InfoRow label="RAM"          value={`${asset.detail.ram_gb} GB`} />}
                {asset.detail.disk_gb         && <InfoRow label="Disk Size"    value={`${asset.detail.disk_gb} GB`} />}
                {asset.detail.disk_model      && <InfoRow label="Disk Model"   value={asset.detail.disk_model} />}
                {asset.detail.os_type         && <InfoRow label="OS Type"      value={asset.detail.os_type} />}
                {asset.detail.os_version      && <InfoRow label="OS Version"   value={asset.detail.os_version} />}
                {asset.detail.product_id      && <InfoRow label="Product ID"   value={asset.detail.product_id} />}
                {asset.detail.office_key      && <InfoRow label="Office Key"   value={asset.detail.office_key} />}

                <div className="pt-3 mt-1 border-t border-gray-100 dark:border-slate-700 space-y-1">
                  <BoolBadge value={asset.detail.os_activated} label="OS Activated" />
                  <BoolBadge value={asset.detail.ms_office} label="MS Office Installed" />
                  {asset.detail.other_applications_installed !== undefined && (
                    <BoolBadge value={asset.detail.other_applications_installed} label="Other Applications Installed" />
                  )}
                </div>

                {asset.detail.other_applications_description && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                    <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">Other Applications</p>
                    <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap">{asset.detail.other_applications_description}</p>
                  </div>
                )}

                {asset.detail.software_list && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                    <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-2">Installed Software</p>
                    <div className="flex flex-wrap gap-1.5">
                      {asset.detail.software_list.split('\n').filter(s => s.trim()).map((s, i) => (
                        <span key={i} className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded-full border border-blue-100 dark:border-blue-800">{s.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}

                {asset.detail.configuration && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                    <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">Configuration</p>
                    <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap">{asset.detail.configuration}</p>
                  </div>
                )}

                {asset.detail.others && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                    <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">Additional Notes</p>
                    <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap">{asset.detail.others}</p>
                  </div>
                )}
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
