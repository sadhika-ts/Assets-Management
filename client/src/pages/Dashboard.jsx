import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import api from '../api/axios';

// Loading Skeleton
const StatCardSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-10 bg-gray-200 rounded w-1/2"></div>
  </div>
);

const TableRowSkeleton = () => (
  <tr>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></td>
  </tr>
);

// Stat Card Component
const StatCard = ({ label, value, color, onClick, cursor = 'cursor-pointer' }) => {
  const colorClasses = {
    blue: 'border-l-blue-500 bg-blue-50',
    purple: 'border-l-purple-500 bg-purple-50',
    green: 'border-l-green-500 bg-green-50',
    orange: 'border-l-orange-500 bg-orange-50',
    red: 'border-l-red-500 bg-red-50',
    gray: 'border-l-gray-500 bg-gray-50'
  };

  const textColorClasses = {
    blue: 'text-blue-700',
    purple: 'text-purple-700',
    green: 'text-green-700',
    orange: 'text-orange-700',
    red: 'text-red-700',
    gray: 'text-gray-700'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white p-6 rounded-lg shadow-sm border-l-4 transition-all ${colorClasses[color]} ${cursor} hover:shadow-md ${onClick ? 'hover:-translate-y-1' : ''}`}
    >
      <p className="text-gray-600 text-sm font-medium">{label}</p>
      <p className={`text-4xl font-bold mt-3 ${textColorClasses[color]}`}>{value}</p>
    </div>
  );
};

// Status Badge
const StatusBadge = ({ status }) => {
  const statusStyles = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    disposed: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || statusStyles.inactive}`}>
      {status}
    </span>
  );
};

// Days Left Badge for Contracts
const DaysLeftBadge = ({ activeTill }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryDate = new Date(activeTill);
  expiryDate.setHours(0, 0, 0, 0);

  const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

  let color = 'bg-amber-100 text-amber-800';
  if (daysLeft < 7) color = 'bg-red-100 text-red-800';
  if (daysLeft < 0) color = 'bg-gray-100 text-gray-800';

  const displayText = daysLeft < 0 ? 'Expired' : `${daysLeft} days left`;

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${color}`}>
      {displayText}
    </span>
  );
};

export const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/reports/dashboard');
        setDashboard(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (error) {
    return (
      <AppLayout title="Dashboard">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p className="font-medium">Error loading dashboard</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label="Total Assets"
              value={dashboard?.total_assets || 0}
              color="blue"
              onClick={() => navigate('/assets')}
            />
            <StatCard
              label="IT Assets"
              value={dashboard?.it_assets || 0}
              color="purple"
              onClick={() => navigate('/assets?category=IT')}
            />
            <StatCard
              label="Non-IT Assets"
              value={dashboard?.non_it_assets || 0}
              color="gray"
              onClick={() => navigate('/assets?category=Non-IT')}
            />
            <StatCard
              label="Active"
              value={dashboard?.active || 0}
              color="green"
              onClick={() => navigate('/assets?status=active')}
            />
            <StatCard
              label="Inactive"
              value={dashboard?.inactive || 0}
              color="orange"
              onClick={() => navigate('/assets?status=inactive')}
            />
            <StatCard
              label="Disposed"
              value={dashboard?.disposed || 0}
              color="red"
              onClick={() => navigate('/assets?status=disposed')}
            />
          </>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expiring Contracts - Larger */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Expiring Contracts (Next 30 Days)</h3>
              <p className="text-sm text-gray-500 mt-1">
                {loading ? 'Loading...' : `${dashboard?.expiring_contracts?.length || 0} contract${dashboard?.expiring_contracts?.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Content */}
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-6 text-center text-gray-500">Loading...</div>
              ) : dashboard?.expiring_contracts && dashboard.expiring_contracts.length > 0 ? (
                dashboard.expiring_contracts.map((contract) => (
                  <div key={contract.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{contract.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{contract.vendor_name}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <DaysLeftBadge activeTill={contract.active_till} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>✓ No contracts expiring in the next 30 days</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats - Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Asset Summary
            </h4>
            {loading ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
                  <span className="text-gray-600">Status Active</span>
                  <span className="font-semibold text-green-600">{dashboard?.active || 0}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
                  <span className="text-gray-600">Status Inactive</span>
                  <span className="font-semibold text-orange-600">{dashboard?.inactive || 0}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
                  <span className="text-gray-600">Status Disposed</span>
                  <span className="font-semibold text-red-600">{dashboard?.disposed || 0}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between items-center p-2 rounded font-semibold">
                  <span className="text-gray-800">Total</span>
                  <span className="text-blue-600">{dashboard?.total_assets || 0}</span>
                </div>
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              By Category
            </h4>
            {loading ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
                  <span className="text-gray-600">IT Assets</span>
                  <span className="font-semibold text-purple-600">{dashboard?.it_assets || 0}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
                  <span className="text-gray-600">Non-IT Assets</span>
                  <span className="font-semibold text-gray-600">{dashboard?.non_it_assets || 0}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Assets Table */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Recent Assets</h3>
          <p className="text-sm text-gray-500 mt-1">Last 5 added assets</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Asset Tag
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Sub Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Serial Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Date Added
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : dashboard?.recent_assets && dashboard.recent_assets.length > 0 ? (
                dashboard.recent_assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">{asset.asset_tag}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-700">{asset.sub_type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-600 text-sm">{asset.detail?.serial_no || '—'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {new Date(asset.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No assets yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};
