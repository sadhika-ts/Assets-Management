import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusStyles = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-amber-100 text-amber-800',
    disposed: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-4 py-2 text-sm font-semibold rounded-full ${statusStyles[status] || statusStyles.inactive}`}>
      {status}
    </span>
  );
};

// Boolean Badge Component
const BooleanBadge = ({ value, label }) => {
  return (
    <div className="flex items-center gap-2">
      {value ? (
        <span className="flex items-center gap-1 text-green-700">
          <span className="text-lg">✓</span>
          {label}
        </span>
      ) : (
        <span className="flex items-center gap-1 text-red-700">
          <span className="text-lg">✕</span>
          {label}
        </span>
      )}
    </div>
  );
};

// Info Row Component
const InfoRow = ({ label, value, copyable = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-b border-gray-100 py-3 last:border-b-0">
      <p className="text-sm text-gray-600 font-medium">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <p className="text-gray-900 mt-1">{value || '—'}</p>
        {copyable && value && (
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  );
};

// Assign User Modal
const AssignUserModal = ({ isOpen, onClose, currentAssignee, onAssign, isLoading, users }) => {
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    setSelectedUser(currentAssignee || '');
  }, [currentAssignee]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Assign Asset</h2>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.name}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onAssign(selectedUser)}
            disabled={isLoading || selectedUser === currentAssignee}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800';

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg border ${bgColor} shadow-lg z-50`}>
      <p className="font-medium">{message}</p>
    </div>
  );
};

export const AssetDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { canEdit } = useAuth();

  // State
  const [asset, setAsset] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignModal, setAssignModal] = useState({
    isOpen: false,
    isLoading: false
  });
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState(null);

  // Fetch asset and audit log
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [assetRes, usersRes] = await Promise.all([
          api.get(`/assets/${id}`),
          api.get('/users')
        ]);

        setAsset(assetRes.data.data);
        setUsers(usersRes.data.data.users || []);

        // Fetch audit log if available
        try {
          const auditRes = await api.get(`/assets/${id}/audit-log`);
          setAuditLog(auditRes.data.data?.audit_logs || []);
        } catch {
          // Audit log endpoint might not exist, skip silently
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load asset');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAssign = async (newAssignee) => {
    try {
      setAssignModal(prev => ({ ...prev, isLoading: true }));
      await api.put(`/assets/${id}`, {
        assigned_to: newAssignee || null
      });

      setAsset(prev => ({
        ...prev,
        assigned_to: newAssignee
      }));

      setToast({
        message: 'Asset reassigned successfully',
        type: 'success'
      });

      setAssignModal({
        isOpen: false,
        isLoading: false
      });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to reassign asset',
        type: 'error'
      });
      setAssignModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <AppLayout title="Asset Details">
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading...</div>
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

  return (
    <AppLayout title="Asset Details">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 print:mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 print:text-2xl">{asset.asset_tag}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={asset.status} />
            <p className="text-sm text-gray-600">
              Category: <span className="font-medium">{asset.category}</span>
            </p>
            <p className="text-sm text-gray-600">
              Type: <span className="font-medium">{asset.sub_type}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition-colors"
          >
            🖨 Print
          </button>
          {canEdit() && (
            <button
              onClick={() => navigate(`/assets/${id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column - Basic Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 print:shadow-none print:border-gray-300">
          <h3 className="text-lg font-bold text-gray-800 mb-4 print:text-base">Basic Information</h3>

          <InfoRow label="Asset Tag" value={asset.asset_tag} copyable />
          <InfoRow label="Category" value={asset.category} />
          <InfoRow label="Sub Type" value={asset.sub_type} />
          <InfoRow label="Serial Number" value={asset.detail?.serial_no} copyable />
          <InfoRow label="MAC Address" value={asset.detail?.mac_address} copyable />

          <div className="border-b border-gray-100 py-3">
            <p className="text-sm text-gray-600 font-medium">Assigned To</p>
            <div className="flex items-center justify-between gap-2 mt-1">
              <p className="text-gray-900">{asset.assigned_to || '—'}</p>
              {canEdit() && (
                <button
                  onClick={() => setAssignModal({ isOpen: true, isLoading: false })}
                  className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 print:hidden"
                >
                  Assign
                </button>
              )}
            </div>
          </div>

          <InfoRow
            label="Purchase Date"
            value={asset.purchase_id ? new Date(asset.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : '—'}
          />
        </div>

        {/* Right Column - Technical Details */}
        {asset.category === 'IT' && asset.detail && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 print:shadow-none print:border-gray-300">
            <h3 className="text-lg font-bold text-gray-800 mb-4 print:text-base">Technical Details</h3>

            {asset.detail.os_type && <InfoRow label="OS Type" value={asset.detail.os_type} />}
            {asset.detail.os_version && <InfoRow label="OS Version" value={asset.detail.os_version} />}
            {asset.detail.product_id && <InfoRow label="Product ID" value={asset.detail.product_id} copyable />}
            {asset.detail.processor_name && <InfoRow label="Processor" value={asset.detail.processor_name} />}
            {asset.detail.manufacturer && <InfoRow label="Manufacturer" value={asset.detail.manufacturer} />}
            {asset.detail.cores && <InfoRow label="Cores" value={asset.detail.cores} />}
            {asset.detail.ram_gb && <InfoRow label="RAM" value={`${asset.detail.ram_gb} GB`} />}
            {asset.detail.disk_gb && <InfoRow label="Disk" value={`${asset.detail.disk_gb} GB`} />}
            {asset.detail.disk_model && <InfoRow label="Disk Model" value={asset.detail.disk_model} />}

            {/* Activation Status */}
            <div className="border-b border-gray-100 py-3 last:border-b-0 space-y-2">
              <BooleanBadge value={asset.detail.os_activated} label="OS Activated" />
              <BooleanBadge value={asset.detail.ms_office} label="MS Office Installed" />
            </div>

            {asset.detail.office_key && (
              <InfoRow label="Office Key" value={asset.detail.office_key} copyable />
            )}
          </div>
        )}
      </div>

      {/* Software List */}
      {asset.category === 'IT' && asset.detail?.software_list && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 print:shadow-none print:border-gray-300">
          <h3 className="text-lg font-bold text-gray-800 mb-4 print:text-base">Installed Software</h3>
          <div className="flex flex-wrap gap-2">
            {asset.detail.software_list.split('\n').filter(s => s.trim()).map((software, idx) => (
              <span
                key={idx}
                className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200"
              >
                {software.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Configuration & Others */}
      {asset.category === 'IT' && (asset.detail?.configuration || asset.detail?.others) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {asset.detail?.configuration && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 print:shadow-none print:border-gray-300">
              <h4 className="font-bold text-gray-800 mb-3 print:text-sm">Configuration</h4>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{asset.detail.configuration}</p>
            </div>
          )}
          {asset.detail?.others && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 print:shadow-none print:border-gray-300">
              <h4 className="font-bold text-gray-800 mb-3 print:text-sm">Additional Notes</h4>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{asset.detail.others}</p>
            </div>
          )}
        </div>
      )}

      {/* Audit Log */}
      {auditLog.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-gray-300">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 print:text-base">Audit History</h3>
            <p className="text-sm text-gray-500 mt-1">{auditLog.length} change{auditLog.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 print:bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Field</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Old Value</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">New Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {auditLog.map((log, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 print:hover:bg-transparent">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {new Date(log.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{log.changed_by || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{log.field_name || '—'}</td>
                    <td className="px-6 py-4 text-gray-600 break-words max-w-xs">{log.old_value || '—'}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium break-words max-w-xs">{log.new_value || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign User Modal */}
      <AssignUserModal
        isOpen={assignModal.isOpen}
        onClose={() => setAssignModal({ isOpen: false, isLoading: false })}
        currentAssignee={asset.assigned_to}
        onAssign={handleAssign}
        isLoading={assignModal.isLoading}
        users={users}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background-color: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:mb-4 {
            margin-bottom: 1rem !important;
          }
          .print\\:text-2xl {
            font-size: 1.5rem !important;
          }
          .print\\:text-base {
            font-size: 1rem !important;
          }
          .print\\:text-sm {
            font-size: 0.875rem !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-gray-300 {
            border-color: rgb(209, 213, 219) !important;
          }
          .print\\:bg-gray-100 {
            background-color: rgb(243, 244, 246) !important;
          }
          .print\\:hover\\:bg-transparent:hover {
            background-color: transparent !important;
          }
        }
      `}</style>
    </AppLayout>
  );
};
