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

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusStyles = {
    active: 'bg-green-100 text-green-800',
    upcoming: 'bg-blue-100 text-blue-800',
    expired: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || statusStyles.expired}`}>
      {status}
    </span>
  );
};

// Add/Edit Contract Modal
const ContractModal = ({ isOpen, onClose, onSubmit, isLoading, editingContract }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      contract_id: '',
      name: '',
      vendor_name: '',
      active_from: '',
      active_till: '',
      status: 'active',
      description: ''
    }
  });

  useEffect(() => {
    if (editingContract) {
      reset({
        contract_id: editingContract.contract_id,
        name: editingContract.name,
        vendor_name: editingContract.vendor_name,
        active_from: editingContract.active_from?.split('T')[0] || '',
        active_till: editingContract.active_till?.split('T')[0] || '',
        status: editingContract.status || 'active',
        description: editingContract.description || ''
      });
    } else {
      reset();
    }
  }, [editingContract, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 my-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          {editingContract ? 'Edit Contract' : 'Add Contract'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-96 overflow-y-auto">
          {/* Contract ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contract ID *</label>
            <Controller
              name="contract_id"
              control={control}
              rules={{ required: 'Contract ID is required' }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="e.g., CON-001"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.contract_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              )}
            />
            {errors.contract_id && <p className="text-red-600 text-xs mt-1">{errors.contract_id.message}</p>}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contract Name *</label>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Contract name is required' }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Contract name"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              )}
            />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
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

          {/* Active From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Active From *</label>
            <Controller
              name="active_from"
              control={control}
              rules={{ required: 'Start date is required' }}
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.active_from ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              )}
            />
            {errors.active_from && <p className="text-red-600 text-xs mt-1">{errors.active_from.message}</p>}
          </div>

          {/* Active Till */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Active Till *</label>
            <Controller
              name="active_till"
              control={control}
              rules={{ required: 'End date is required' }}
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.active_till ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              )}
            />
            {errors.active_till && <p className="text-red-600 text-xs mt-1">{errors.active_till.message}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <select {...field} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="expired">Expired</option>
                </select>
              )}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <textarea {...field} placeholder="Contract details" rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
const DeleteModal = ({ isOpen, onConfirm, onCancel, isDeleting, contractId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Delete Contract</h2>
        <p className="text-gray-600 mb-6">Are you sure you want to delete contract <span className="font-semibold">{contractId}</span>?</p>
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

export const Contracts = () => {
  const { canCreate, canEdit, canDelete } = useAuth();

  // State
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, editingContract: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, contractId: null, id: null, isDeleting: false });
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch contracts
  const fetchContracts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/contracts', { params });
      setContracts(response.data.data.contracts || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [statusFilter]);

  // Calculate contract status
  const getContractStatus = (activeFrom, activeTill) => {
    const now = new Date();
    const from = new Date(activeFrom);
    const till = new Date(activeTill);

    if (now < from) return 'upcoming';
    if (now > till) return 'expired';
    return 'active';
  };

  // Check for expiring soon contracts
  const expiringContracts = contracts.filter(c => {
    const now = new Date();
    const till = new Date(c.active_till);
    const daysLeft = Math.ceil((till - now) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 && daysLeft <= 30 && getContractStatus(c.active_from, c.active_till) === 'active';
  });

  const handleAddModal = () => {
    setModal({ isOpen: true, editingContract: null });
  };

  const handleEditModal = (contract) => {
    setModal({ isOpen: true, editingContract: contract });
  };

  const handleCloseModal = () => {
    setModal({ isOpen: false, editingContract: null });
  };

  const handleSave = async (data) => {
    try {
      if (modal.editingContract) {
        await api.put(`/contracts/${modal.editingContract.id}`, data);
        setToast({ message: 'Contract updated successfully', type: 'success' });
      } else {
        await api.post('/contracts', data);
        setToast({ message: 'Contract created successfully', type: 'success' });
      }
      handleCloseModal();
      fetchContracts();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to save contract', type: 'error' });
    }
  };

  const handleDeleteClick = (id, contractId) => {
    setDeleteModal({ isOpen: true, contractId, id, isDeleting: false });
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, isDeleting: true }));
      await api.delete(`/contracts/${deleteModal.id}`);
      setToast({ message: 'Contract deleted successfully', type: 'success' });
      setDeleteModal({ isOpen: false, contractId: null, id: null, isDeleting: false });
      fetchContracts();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to delete contract', type: 'error' });
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  if (error && !loading) {
    return (
      <AppLayout title="Contracts">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p className="font-medium">Error loading contracts</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Contracts">
      {/* Expiring Soon Banner */}
      {expiringContracts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 mb-6">
          <p className="font-medium">⚠️ {expiringContracts.length} contract{expiringContracts.length !== 1 ? 's' : ''} expiring within 30 days</p>
          <ul className="text-sm mt-2 space-y-1">
            {expiringContracts.map(c => (
              <li key={c.id}>• {c.name} - Expires {new Date(c.active_till).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Contracts</h2>
        {canCreate && (
          <button
            onClick={handleAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Contract
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setStatusFilter('')}
              className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
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
            {loading ? 'Loading...' : `${contracts.length} contract${contracts.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Contract ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Active From</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Active Till</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : contracts.length > 0 ? (
                contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{contract.contract_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{contract.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">{contract.vendor_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(contract.active_from).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(contract.active_till).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={getContractStatus(contract.active_from, contract.active_till)} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        {canEdit && (
                          <button
                            onClick={() => handleEditModal(contract)}
                            className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1"
                          >
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteClick(contract.id, contract.contract_id)}
                            className="text-xs text-red-600 hover:text-red-700 px-2 py-1"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No contracts found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ContractModal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        onSubmit={handleSave}
        isLoading={false}
        editingContract={modal.editingContract}
      />

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, contractId: null, id: null, isDeleting: false })}
        isDeleting={deleteModal.isDeleting}
        contractId={deleteModal.contractId}
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
