import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import toast from 'react-hot-toast';
import api from '../api/axios';

// Status Badge
const StatusBadge = ({ status }) => {
  const styles = {
    active:   'bg-green-100 text-green-700',
    inactive: 'bg-red-100 text-red-700',
    retired:  'bg-gray-100 text-gray-600',
  };
  const label = status?.replace('_', ' ') || status;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
};

// Filter Card
const FilterCard = ({ title, icon, count }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <p className="text-2xl font-bold text-blue-700 mt-2">{count}</p>
      </div>
      <span className="text-4xl">{icon}</span>
    </div>
  </div>
);

// Asset Card (Grid View)
const AssetCard = ({ asset, onView, onEdit }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="font-bold text-gray-800">{asset.asset_name}</h3>
        <p className="text-sm text-gray-600">Tag: {asset.asset_tag}</p>
      </div>
      <StatusBadge status={asset.status} />
    </div>

    <div className="space-y-2 text-sm text-gray-700 mb-4 border-b border-gray-200 pb-4">
      <p><strong>Category:</strong> {asset.category}</p>
      <p><strong>Type:</strong> {asset.sub_type}</p>
      <p><strong>Serial:</strong> {asset.serial_no || asset.detail?.serial_no || 'N/A'}</p>
      <p><strong>Assigned:</strong> {displayAssignee(asset.assigned_to) === '—' ? 'Unassigned' : displayAssignee(asset.assigned_to)}</p>
    </div>

    <div className="flex gap-2">
      <button onClick={() => onView(asset.id)} className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition text-sm font-medium">
        View
      </button>
      <button onClick={() => onEdit(asset.id)} className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition text-sm font-medium">
        Edit
      </button>
    </div>
  </div>
);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const displayAssignee = (val) => (!val || UUID_RE.test(val) ? '—' : val);

export const Assets = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('list');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [mockAssets, setMockAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const shouldRefresh = searchParams.get('refresh') === 'true';
    const newAssetTag = searchParams.get('new');

    if (shouldRefresh) {
      console.log('🔄 Refreshing assets list...');
      if (newAssetTag) {
        console.log('New asset tag:', newAssetTag);
      }
    }

    fetchAssets();
  }, [searchParams]);

  const fetchAssets = async () => {
    try {
      console.log('📥 Fetching all assets from API...');
      const response = await api.get('/assets');
      const assets = response.data?.data?.assets || response.data || [];

      console.log('✅ Fetched assets:', assets.length);
      setMockAssets(assets);
      setLoading(false);

      // Show success toast if this is a refresh after creating new asset
      const shouldRefresh = searchParams.get('refresh') === 'true';
      if (shouldRefresh) {
        toast.success('✅ Assets list updated with new record!');
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
      setLoading(false);
    }
  };

  // Dynamic sub_type options from actual data
  const subTypeOptions = [...new Set(mockAssets.map(a => a.sub_type).filter(Boolean))].sort();

  // Filter assets
  const filteredAssets = mockAssets.filter(asset => {
    const matchesSearch =
      asset.asset_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.asset_tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assigned_to?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || asset.sub_type === filterCategory;
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddAsset = () => {
    navigate('/assets/new');
    toast.success('Create new asset');
  };

  const handleViewAsset = (id) => {
    navigate(`/assets/${id}`);
  };

  const handleEditAsset = (id) => {
    navigate(`/assets/${id}/edit`);
  };

  const handleExportAssets = () => {
    const csv = [
      ['Asset Tag', 'Asset Name', 'Category', 'Status', 'Assigned To', 'Serial Number'],
      ...filteredAssets.map(a => [
        a.asset_tag,
        a.asset_name,
        a.category,
        a.status,
        a.assigned_to || 'N/A',
        a.detail?.serial_no || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assets.csv';
    a.click();
    toast.success('Assets exported as CSV');
  };

  return (
    <AppLayout title="Assets Management">
      <div className="space-y-6">

        {/* Header with Add Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Asset Inventory</h2>
          <button
            onClick={handleAddAsset}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-all"
          >
            ➕ Add New Asset
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FilterCard title="Total Assets" icon="📦" count={mockAssets.length} />
          <FilterCard title="Active" icon="✅" count={mockAssets.filter(a => a.status === 'active').length} />
          <FilterCard title="Inactive" icon="⛔" count={mockAssets.filter(a => a.status === 'inactive').length} />
          <FilterCard title="Retired" icon="🗑️" count={mockAssets.filter(a => a.status === 'retired').length} />
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Assets</label>
              <input
                type="text"
                placeholder="Search by name, tag or assignee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Component Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Component Type</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {subTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Asset Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleExportAssets}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition"
          >
            📥 Export CSV
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium transition"
          >
            {viewMode === 'list' ? '⊞ Grid View' : '≡ List View'}
          </button>
        </div>

        {/* Assets Display */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <p className="text-gray-700 font-medium mb-4">Showing {filteredAssets.length} of {mockAssets.length} assets</p>

            {viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssets.map(asset => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onView={handleViewAsset}
                    onEdit={handleEditAsset}
                  />
                ))}
              </div>
            ) : (
              // List View (Table)
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Asset Tag</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Assigned To</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Serial</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAssets.map(asset => (
                      <tr key={asset.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono font-semibold text-blue-600 cursor-pointer" onClick={() => handleViewAsset(asset.id)}>{asset.asset_tag}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{asset.asset_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{asset.sub_type}</td>
                        <td className="px-6 py-4 w-32"><StatusBadge status={asset.status} /></td>
                        <td className="px-6 py-4 text-sm text-gray-600">{displayAssignee(asset.assigned_to)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">{asset.serial_no || asset.detail?.serial_no || '—'}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleViewAsset(asset.id)} className="text-blue-600 hover:text-blue-800 font-medium">View</button>
                            <button onClick={() => handleEditAsset(asset.id)} className="text-green-600 hover:text-green-800 font-medium">Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  );
};
