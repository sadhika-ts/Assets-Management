import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { AppLayout } from '../layouts/AppLayout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

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

// Add/Edit Purchase Modal
const PurchaseModal = ({ isOpen, onClose, onSubmit, isLoading, editingPurchase }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      purchase_id: '',
      vendor_name: '',
      vendor_contact: '',
      vendor_email: '',
      billing_address: '',
      shipping_address: '',
      purchase_date: '',
      total_amount: '',
      status: 'completed'
    }
  });

  useEffect(() => {
    if (editingPurchase) {
      reset({
        purchase_id: editingPurchase.purchase_id,
        vendor_name: editingPurchase.vendor_name,
        vendor_contact: editingPurchase.vendor_contact || '',
        vendor_email: editingPurchase.vendor_email || '',
        billing_address: editingPurchase.billing_address || '',
        shipping_address: editingPurchase.shipping_address || '',
        purchase_date: editingPurchase.purchase_date?.split('T')[0] || '',
        total_amount: editingPurchase.total_amount || '',
        status: editingPurchase.status || 'completed'
      });
    } else {
      reset();
    }
  }, [editingPurchase, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 my-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          {editingPurchase ? 'Edit Purchase' : 'Add Purchase'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-96 overflow-y-auto">
          {/* Purchase ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase ID *</label>
            <Controller
              name="purchase_id"
              control={control}
              rules={{ required: 'Purchase ID is required' }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="e.g., PUR-001"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.purchase_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              )}
            />
            {errors.purchase_id && <p className="text-red-600 text-xs mt-1">{errors.purchase_id.message}</p>}
          </div>

          {/* Vendor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name *</label>
            <Controller
              name="vendor_name"
              control={control}
              rules={{ required: 'Vendor name is required' }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Vendor name"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.vendor_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              )}
            />
            {errors.vendor_name && <p className="text-red-600 text-xs mt-1">{errors.vendor_name.message}</p>}
          </div>

          {/* Vendor Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Contact</label>
            <Controller
              name="vendor_contact"
              control={control}
              render={({ field }) => (
                <input {...field} type="text" placeholder="Contact person" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              )}
            />
          </div>

          {/* Vendor Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Email</label>
            <Controller
              name="vendor_email"
              control={control}
              render={({ field }) => (
                <input {...field} type="email" placeholder="vendor@example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              )}
            />
          </div>

          {/* Billing Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address</label>
            <Controller
              name="billing_address"
              control={control}
              render={({ field }) => (
                <textarea {...field} placeholder="Address" rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              )}
            />
          </div>

          {/* Shipping Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
            <Controller
              name="shipping_address"
              control={control}
              render={({ field }) => (
                <textarea {...field} placeholder="Address" rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              )}
            />
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
            <Controller
              name="purchase_date"
              control={control}
              render={({ field }) => (
                <input {...field} type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              )}
            />
          </div>

          {/* Total Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
            <Controller
              name="total_amount"
              control={control}
              render={({ field }) => (
                <input {...field} type="number" step="0.01" placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              )}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <select {...field} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              )}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteModal = ({ isOpen, onConfirm, onCancel, isDeleting, purchaseId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Delete Purchase</h2>
        <p className="text-gray-600 mb-6">Are you sure you want to delete purchase <span className="font-semibold">{purchaseId}</span>?</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const Purchases = () => {
  const { canCreate, canEdit, canDelete } = useAuth();

  // State
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, editingPurchase: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, purchaseId: null, id: null, isDeleting: false });
  const [expandedPurchase, setExpandedPurchase] = useState(null);
  const [linkedAssets, setLinkedAssets] = useState({});

  // Filters
  const [vendorFilter, setVendorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });

  // Fetch purchases
  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const params = {};
      if (vendorFilter) params.vendor_name = vendorFilter;
      if (dateFilter.from) params.from_date = dateFilter.from;
      if (dateFilter.to) params.to_date = dateFilter.to;

      const response = await api.get('/purchases', { params });
      setPurchases(response.data.data.purchases || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [vendorFilter, dateFilter]);

  const handleExpandPurchase = async (purchaseId) => {
    if (expandedPurchase === purchaseId) {
      setExpandedPurchase(null);
      return;
    }

    try {
      const response = await api.get(`/purchases/${purchaseId}/assets`);
      setLinkedAssets(prev => ({ ...prev, [purchaseId]: response.data.data.assets || [] }));
      setExpandedPurchase(purchaseId);
    } catch (err) {
      setToast({ message: 'Failed to load linked assets', type: 'error' });
    }
  };

  const handleAddModal = () => {
    setModal({ isOpen: true, editingPurchase: null });
  };

  const handleEditModal = (purchase) => {
    setModal({ isOpen: true, editingPurchase: purchase });
  };

  const handleCloseModal = () => {
    setModal({ isOpen: false, editingPurchase: null });
  };

  const handleSave = async (data) => {
    try {
      if (modal.editingPurchase) {
        await api.put(`/purchases/${modal.editingPurchase.id}`, data);
        setToast({ message: 'Purchase updated successfully', type: 'success' });
      } else {
        await api.post('/purchases', data);
        setToast({ message: 'Purchase created successfully', type: 'success' });
      }
      handleCloseModal();
      fetchPurchases();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to save purchase', type: 'error' });
    }
  };

  const handleDeleteClick = (id, purchaseId) => {
    setDeleteModal({ isOpen: true, purchaseId, id, isDeleting: false });
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, isDeleting: true }));
      await api.delete(`/purchases/${deleteModal.id}`);
      setToast({ message: 'Purchase deleted successfully', type: 'success' });
      setDeleteModal({ isOpen: false, purchaseId: null, id: null, isDeleting: false });
      fetchPurchases();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to delete purchase', type: 'error' });
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  if (error && !loading) {
    return (
      <AppLayout title="Purchases">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p className="font-medium">Error loading purchases</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Purchases">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Purchases</h2>
        {canCreate && (
          <button
            onClick={handleAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Purchase
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name</label>
            <input
              type="text"
              placeholder="Filter by vendor..."
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateFilter.from}
              onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={dateFilter.to}
              onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setVendorFilter('');
                setDateFilter({ from: '', to: '' });
              }}
              className="w-full px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-sm text-gray-500">
            {loading ? 'Loading...' : `${purchases.length} purchase${purchases.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Purchase ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Vendor Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : purchases.length > 0 ? (
                purchases.map((purchase) => (
                  <React.Fragment key={purchase.id}>
                    <tr className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleExpandPurchase(purchase.id)}>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{purchase.purchase_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{purchase.vendor_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">{purchase.vendor_email || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {purchase.purchase_date ? new Date(purchase.purchase_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">₹{purchase.total_amount?.toFixed(2) || '0.00'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          purchase.status === 'completed' ? 'bg-green-100 text-green-800' :
                          purchase.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {purchase.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          {canEdit && (
                            <button
                              onClick={() => handleEditModal(purchase)}
                              className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1"
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteClick(purchase.id, purchase.purchase_id)}
                              className="text-xs text-red-600 hover:text-red-700 px-2 py-1"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row - Linked Assets */}
                    {expandedPurchase === purchase.id && (
                      <tr className="bg-gray-50">
                        <td colSpan="7" className="px-6 py-4">
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-gray-700">Linked Assets ({linkedAssets[purchase.id]?.length || 0})</p>
                            {linkedAssets[purchase.id]?.length > 0 ? (
                              <div className="space-y-1">
                                {linkedAssets[purchase.id].map((asset) => (
                                  <div key={asset.id} className="text-sm text-gray-600">
                                    • {asset.asset_tag} ({asset.sub_type}) - {asset.status}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No assets linked to this purchase</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No purchases found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <PurchaseModal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        onSubmit={handleSave}
        isLoading={false}
        editingPurchase={modal.editingPurchase}
      />

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, purchaseId: null, id: null, isDeleting: false })}
        isDeleting={deleteModal.isDeleting}
        purchaseId={deleteModal.purchaseId}
      />

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
