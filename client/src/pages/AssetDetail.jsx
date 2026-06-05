import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import QRCode from 'qrcode';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const displayAssignee = (val) => (!val || UUID_RE.test(val) ? '—' : val);

const STATUS_STYLES = {
  active:   'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-700',
  retired:  'bg-gray-100 text-gray-600',
};

const StatusBadge = ({ status }) => (
  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
    {status}
  </span>
);

const InfoRow = ({ label, value }) => (
  <div className="border-b border-gray-100 py-2.5 last:border-b-0 flex justify-between items-start gap-4">
    <span className="text-sm text-gray-500 font-medium shrink-0 w-36">{label}</span>
    <span className="text-sm text-gray-900 text-right">{value || '—'}</span>
  </div>
);

const BoolBadge = ({ value, label }) => (
  <div className="flex items-center gap-2 py-1">
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
      {value ? 'YES' : 'NO'}
    </span>
    <span className="text-sm text-gray-700">{label}</span>
  </div>
);

export const AssetDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { canEdit } = useAuth();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Build the QR payload — full asset details so scanning shows everything
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const assetRes = await api.get(`/assets/${id}`);
        const fetched = assetRes.data.data?.asset || assetRes.data.data;
        if (!fetched) throw new Error('Asset not found');
        setAsset(fetched);

        // Auto-generate QR immediately after fetch
        const payload = buildQrPayload(fetched);
        const dataUrl = await QRCode.toDataURL(payload, {
          width: 240,
          margin: 1,
          color: { dark: '#1e293b', light: '#ffffff' },
          errorCorrectionLevel: 'M',
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Failed to load asset';
        // Ignore unrelated 404s (e.g. /users endpoint doesn't exist)
        if (msg !== 'Route not found') setError(msg);
        else setError('Failed to load asset');
      } finally {
        setLoading(false);
      }
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
    .label {
      border: 2px solid #1e293b;
      border-radius: 10px;
      padding: 18px 20px;
      width: 320px;
      text-align: center;
    }
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

  if (loading) {
    return (
      <AppLayout title="Asset Details">
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <span className="text-gray-500 text-sm">Loading asset details…</span>
        </div>
      </AppLayout>
    );
  }

  if (error || !asset) {
    return (
      <AppLayout title="Asset Details">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p className="font-medium">Error loading asset</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </AppLayout>
    );
  }

  const serialNo = asset.serial_no || asset.detail?.serial_no;
  const macAddress = asset.mac_address || asset.detail?.mac_address;
  const assignee = displayAssignee(asset.assigned_to);

  return (
    <AppLayout title="Asset Details">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 font-mono">{asset.asset_tag}</h1>
            <StatusBadge status={asset.status} />
          </div>
          <p className="text-sm text-gray-500 mt-1">{asset.asset_name} &nbsp;·&nbsp; {asset.category} &nbsp;·&nbsp; {asset.sub_type}</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handlePrintLabel}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print QR Label
          </button>
          {canEdit() && (
            <button
              onClick={() => navigate(`/assets/${id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => navigate('/assets')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            Back
          </button>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: QR Code card — auto-generated */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col items-center">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 self-start">QR Code Label</h3>

          <div className="border-2 border-gray-800 rounded-lg p-4 w-full text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">IT Asset Management</p>
            <p className="text-xl font-black tracking-widest text-gray-900 mb-0.5">{asset.asset_tag}</p>
            <p className="text-xs text-gray-500 mb-3">{asset.asset_name}</p>
            {qrDataUrl
              ? <img src={qrDataUrl} alt="QR Code" className="mx-auto w-44 h-44" />
              : <div className="w-44 h-44 mx-auto bg-gray-100 flex items-center justify-center text-xs text-gray-400">Generating…</div>
            }
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-0.5">
              <p>{asset.sub_type} &nbsp;·&nbsp; <span className="capitalize">{asset.status}</span></p>
              {serialNo && <p>S/N: {serialNo}</p>}
              {assignee !== '—' && <p>Assigned: {assignee}</p>}
            </div>
          </div>

          <button
            onClick={handlePrintLabel}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print QR Label
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">Scan QR to view all asset details</p>
        </div>

        {/* Right: Details (2 cols on large) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Basic Information</h3>
            <InfoRow label="Asset Tag" value={asset.asset_tag} />
            <InfoRow label="Asset Name" value={asset.asset_name} />
            <InfoRow label="Category" value={asset.category} />
            <InfoRow label="Sub Type" value={asset.sub_type} />
            {asset.other_subtype_description && <InfoRow label="Other Description" value={asset.other_subtype_description} />}
            <InfoRow label="Status" value={<StatusBadge status={asset.status} />} />
            <InfoRow label="Serial Number" value={serialNo} />
            <InfoRow label="MAC Address" value={macAddress} />
            <InfoRow label="Assigned To" value={assignee} />
            <InfoRow label="Added On" value={asset.created_at ? new Date(asset.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : null} />
          </div>

          {/* Technical Details — IT only */}
          {asset.category === 'IT' && asset.detail && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Technical Details</h3>
              {asset.detail.manufacturer && <InfoRow label="Manufacturer" value={asset.detail.manufacturer} />}
              {asset.detail.processor_name && <InfoRow label="Processor" value={asset.detail.processor_name} />}
              {asset.detail.cores && <InfoRow label="CPU Cores" value={asset.detail.cores} />}
              {asset.detail.ram_gb && <InfoRow label="RAM" value={`${asset.detail.ram_gb} GB`} />}
              {asset.detail.disk_gb && <InfoRow label="Disk Size" value={`${asset.detail.disk_gb} GB`} />}
              {asset.detail.disk_model && <InfoRow label="Disk Model" value={asset.detail.disk_model} />}
              {asset.detail.os_type && <InfoRow label="OS Type" value={asset.detail.os_type} />}
              {asset.detail.os_version && <InfoRow label="OS Version" value={asset.detail.os_version} />}
              {asset.detail.product_id && <InfoRow label="Product ID" value={asset.detail.product_id} />}
              {asset.detail.office_key && <InfoRow label="Office Key" value={asset.detail.office_key} />}

              <div className="pt-3 mt-2 border-t border-gray-100 space-y-1">
                <BoolBadge value={asset.detail.os_activated} label="OS Activated" />
                <BoolBadge value={asset.detail.ms_office} label="MS Office Installed" />
                {asset.detail.other_applications_installed !== undefined && (
                  <BoolBadge value={asset.detail.other_applications_installed} label="Other Applications Installed" />
                )}
              </div>

              {asset.detail.other_applications_description && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Other Applications</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{asset.detail.other_applications_description}</p>
                </div>
              )}

              {asset.detail.software_list && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Installed Software</p>
                  <div className="flex flex-wrap gap-2">
                    {asset.detail.software_list.split('\n').filter(s => s.trim()).map((s, i) => (
                      <span key={i} className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {asset.detail.configuration && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Configuration</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{asset.detail.configuration}</p>
                </div>
              )}

              {asset.detail.others && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Additional Notes</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{asset.detail.others}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg border text-sm font-medium
          ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {toast.message}
        </div>
      )}
    </AppLayout>
  );
};
