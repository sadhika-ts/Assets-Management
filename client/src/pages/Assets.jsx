import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import toast from 'react-hot-toast';
import api from '../api/axios';

// Status Badge
const StatusBadge = ({ status }) => {
  const styles = {
    available: 'bg-green-100 text-green-800',
    assigned: 'bg-blue-100 text-blue-800',
    repair: 'bg-orange-100 text-orange-800',
    retired: 'bg-red-100 text-red-800'
  };
  return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status] || styles.available}`}>{status}</span>;
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
const AssetCard = ({ asset, onView, onEdit, onDelete }) => (
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
      <p><strong>Serial:</strong> {asset.detail?.serial_no || 'N/A'}</p>
      <p><strong>Assigned:</strong> {asset.assigned_to || 'Unassigned'}</p>
    </div>

    <div className="flex gap-2">
      <button onClick={() => onView(asset.id)} className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition text-sm font-medium">
        View
      </button>
      <button onClick={() => onEdit(asset.id)} className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition text-sm font-medium">
        Edit
      </button>
      <button onClick={() => onDelete(asset.id, asset.asset_tag)} className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition text-sm font-medium">
        Delete
      </button>
    </div>
  </div>
);

export const Assets = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('list');
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
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

  // Filter assets
  const filteredAssets = mockAssets.filter(asset => {
    const matchesSearch = asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.asset_tag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || asset.sub_type === filterCategory;
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Asset Categories
  const itComponents = [
    'Access Points', 'Computers', 'Mobile Devices', 'Printers', 'Routers',
    'Switches', 'Scanners', 'Keyboards', 'HDMI Cables', 'USB Cables', 'Extension Ports'
  ];

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

  const handleDeleteAsset = (id, tag) => {
    setDeleteTarget({ id, tag });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    toast.success(`Asset ${deleteTarget.tag} deleted`);
    setShowDeleteModal(false);
    setDeleteTarget(null);
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

  const handleGenerateQR = (assetTag) => {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(assetTag)}`;
    const link = document.createElement('a');
    link.href = qrApiUrl;
    link.download = `${assetTag}_qr.png`;
    link.click();
    toast.success(`QR Code for ${assetTag} downloaded`);
  };

  const handleGenerateBarcode = (assetTag) => {
    const barcodeApiUrl = `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(assetTag)}&code=Code128&dpi=96&print=true`;
    const link = document.createElement('a');
    link.href = barcodeApiUrl;
    link.download = `${assetTag}_barcode.png`;
    link.click();
    toast.success(`Barcode for ${assetTag} downloaded`);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <FilterCard title="Total Assets" icon="📦" count={mockAssets.length} />
          <FilterCard title="Available" icon="✅" count={mockAssets.filter(a => a.status === 'available').length} />
          <FilterCard title="Assigned" icon="👤" count={mockAssets.filter(a => a.status === 'assigned').length} />
          <FilterCard title="In Repair" icon="🔧" count={mockAssets.filter(a => a.status === 'repair').length} />
          <FilterCard title="Retired" icon="⛔" count={mockAssets.filter(a => a.status === 'retired').length} />
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Assets</label>
              <input
                type="text"
                placeholder="Search by name or tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Component Type</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {itComponents.map(comp => (
                  <option key={comp} value={comp}>{comp}</option>
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
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="repair">In Repair</option>
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
            onClick={() => handleGenerateQR('ASSET-001')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium transition"
          >
            📱 Generate QR Codes
          </button>
          <button
            onClick={() => handleGenerateBarcode('ASSET-001')}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-medium transition"
          >
            📊 Generate Barcodes
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
                    onDelete={handleDeleteAsset}
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
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{asset.asset_tag}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{asset.asset_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{asset.sub_type}</td>
                        <td className="px-6 py-4"><StatusBadge status={asset.status} /></td>
                        <td className="px-6 py-4 text-sm text-gray-700">{asset.assigned_to || '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{asset.detail?.serial_no || '—'}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button onClick={() => handleViewAsset(asset.id)} className="text-blue-600 hover:text-blue-800 font-medium">View</button>
                            <button onClick={() => handleEditAsset(asset.id)} className="text-green-600 hover:text-green-800 font-medium">Edit</button>
                            <button onClick={() => handleDeleteAsset(asset.id, asset.asset_tag)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
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

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Delete Asset</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete asset <span className="font-semibold">{deleteTarget?.tag}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
