import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AppLayout } from '../layouts/AppLayout';
import api from '../api/axios';

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

// Chart Card Component
const ChartCard = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
    {subtitle && <p className="text-sm text-gray-600 mb-4">{subtitle}</p>}
    {children}
  </div>
);

export const Reports = () => {
  // State
  const [assetByCategory, setAssetByCategory] = useState([]);
  const [osActivation, setOsActivation] = useState([]);
  const [msOfficeStatus, setMsOfficeStatus] = useState([]);
  const [assetStatus, setAssetStatus] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Colors for charts
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const statusColors = { active: '#10b981', inactive: '#f59e0b', disposed: '#ef4444' };

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/reports/dashboard');
        const data = response.data.data;

        // Asset by category (Sub Type breakdown)
        if (data.asset_by_category) {
          setAssetByCategory(data.asset_by_category);
        }

        // OS Activation Status
        if (data.os_activation_status) {
          setOsActivation(data.os_activation_status);
        }

        // MS Office Status
        if (data.ms_office_status) {
          setMsOfficeStatus(data.ms_office_status);
        }

        // Asset Status Breakdown
        if (data.asset_status_breakdown) {
          setAssetStatus(data.asset_status_breakdown);
        }

        // Audit Log
        if (data.audit_log) {
          setAuditLog(data.audit_log);
        }

        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load reports');
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Export functions
  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) {
      setToast({ message: 'No data to export', type: 'error' });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers
          .map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({ message: `${filename} exported successfully`, type: 'success' });
  };

  const handleExportAssets = async () => {
    try {
      const response = await api.get('/reports/export');
      downloadCSV(response.data.data.assets, 'Assets');
    } catch (err) {
      setToast({ message: 'Failed to export assets', type: 'error' });
    }
  };

  const handleExportAuditLog = async () => {
    try {
      const response = await api.get('/reports/audit-log');
      downloadCSV(response.data.data.audit_logs, 'AuditLog');
    } catch (err) {
      setToast({ message: 'Failed to export audit log', type: 'error' });
    }
  };

  if (error && !loading) {
    return (
      <AppLayout title="Reports">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p className="font-medium">Error loading reports</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Reports">
      {/* Header with Export Buttons */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
        <div className="flex gap-3">
          <button
            onClick={handleExportAssets}
            className="px-4 py-2 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            📥 Export Assets CSV
          </button>
          <button
            onClick={handleExportAuditLog}
            className="px-4 py-2 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            📥 Export Audit Log CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading reports...</div>
        </div>
      ) : (
        <>
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* 1. Asset by Category */}
            <ChartCard
              title="Assets by Sub Type"
              subtitle={`Total: ${assetByCategory.reduce((sum, item) => sum + item.count, 0)} assets`}
            >
              {assetByCategory && assetByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={assetByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sub_type" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">No data available</p>
              )}
            </ChartCard>

            {/* 2. OS Activation Status */}
            <ChartCard
              title="OS Activation Status"
              subtitle="IT Assets only"
            >
              {osActivation && osActivation.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={osActivation}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {osActivation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">No data available</p>
              )}
            </ChartCard>

            {/* 3. MS Office Status */}
            <ChartCard
              title="MS Office Status"
              subtitle="IT Assets only"
            >
              {msOfficeStatus && msOfficeStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={msOfficeStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {msOfficeStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">No data available</p>
              )}
            </ChartCard>

            {/* 4. Asset Status Breakdown */}
            <ChartCard
              title="Asset Status Breakdown"
              subtitle={`Total: ${assetStatus.reduce((sum, item) => sum + item.count, 0)} assets`}
            >
              {assetStatus && assetStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={assetStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6">
                      {assetStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={statusColors[entry.status] || '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">No data available</p>
              )}
            </ChartCard>
          </div>

          {/* Audit Log Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Recent Audit Log</h3>
              <p className="text-sm text-gray-500 mt-1">
                {auditLog.length} change{auditLog.length !== 1 ? 's' : ''} (last 50)
              </p>
            </div>

            {auditLog && auditLog.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">User</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Asset</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Field</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Old Value</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">New Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {auditLog.map((log, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {new Date(log.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{log.changed_by || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{log.asset_tag || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{log.field_name || '—'}</td>
                        <td className="px-6 py-4 text-gray-600 break-words max-w-xs">{log.old_value || '—'}</td>
                        <td className="px-6 py-4 text-gray-900 font-medium break-words max-w-xs">{log.new_value || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No audit logs found
              </div>
            )}
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AppLayout>
  );
};
