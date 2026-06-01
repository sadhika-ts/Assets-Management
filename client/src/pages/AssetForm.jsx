import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
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

// Sub type options based on category
const subTypeOptions = {
  IT: [
    { value: 'computer', label: 'Computer' },
    { value: 'printer', label: 'Printer' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'router', label: 'Router' },
    { value: 'switch', label: 'Switch' },
    { value: 'scanner', label: 'Scanner' },
    { value: 'keyboard', label: 'Keyboard' },
    { value: 'cable', label: 'Cable' },
    { value: 'other', label: 'Other' }
  ],
  'Non-IT': [
    { value: 'furniture', label: 'Furniture' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'stationery', label: 'Stationery' },
    { value: 'other', label: 'Other' }
  ]
};

export const AssetForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // State
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [users, setUsers] = useState([]);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      asset_tag: '',
      category: 'IT',
      sub_type: 'computer',
      serial_no: '',
      mac_address: '',
      status: 'active',
      purchase_id: '',
      assigned_to: '',
      os_type: 'Windows',
      os_version: '',
      product_id: '',
      os_activated: false,
      processor_name: '',
      manufacturer: '',
      cores: '',
      ram_gb: '',
      disk_gb: '',
      disk_model: '',
      ms_office: false,
      office_key: '',
      software_list: '',
      configuration: '',
      others: ''
    }
  });

  const selectedCategory = watch('category');
  const msOfficeEnabled = watch('ms_office');

  // Fetch asset data if editing
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch purchases and users in parallel
        const [purchasesRes, usersRes] = await Promise.all([
          api.get('/purchases'),
          api.get('/users')
        ]);

        setPurchases(purchasesRes.data.data.purchases || []);
        setUsers(usersRes.data.data.users || []);

        // Fetch asset if editing
        if (isEditMode) {
          const assetRes = await api.get(`/assets/${id}`);
          const asset = assetRes.data.data;

          reset({
            asset_tag: asset.asset_tag,
            category: asset.category,
            sub_type: asset.sub_type,
            serial_no: asset.detail?.serial_no || '',
            mac_address: asset.detail?.mac_address || '',
            status: asset.status,
            purchase_id: asset.purchase_id || '',
            assigned_to: asset.assigned_to || '',
            os_type: asset.detail?.os_type || 'Windows',
            os_version: asset.detail?.os_version || '',
            product_id: asset.detail?.product_id || '',
            os_activated: asset.detail?.os_activated || false,
            processor_name: asset.detail?.processor_name || '',
            manufacturer: asset.detail?.manufacturer || '',
            cores: asset.detail?.cores || '',
            ram_gb: asset.detail?.ram_gb || '',
            disk_gb: asset.detail?.disk_gb || '',
            disk_model: asset.detail?.disk_model || '',
            ms_office: asset.detail?.ms_office || false,
            office_key: asset.detail?.office_key || '',
            software_list: asset.detail?.software_list || '',
            configuration: asset.detail?.configuration || '',
            others: asset.detail?.others || ''
          });
        }
      } catch (err) {
        setToast({
          message: err.response?.data?.message || 'Failed to load data',
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, reset]);

  // Form submission
  const onSubmit = async (data) => {
    try {
      setIsSaving(true);

      const payload = {
        asset_tag: data.asset_tag,
        category: data.category,
        sub_type: data.sub_type,
        status: data.status,
        purchase_id: data.purchase_id || null,
        assigned_to: data.assigned_to || null,
        detail: {
          serial_no: data.serial_no,
          mac_address: data.mac_address,
          ...(data.category === 'IT' && {
            os_type: data.os_type,
            os_version: data.os_version,
            product_id: data.product_id,
            os_activated: data.os_activated,
            processor_name: data.processor_name,
            manufacturer: data.manufacturer,
            cores: data.cores ? parseInt(data.cores) : null,
            ram_gb: data.ram_gb ? parseFloat(data.ram_gb) : null,
            disk_gb: data.disk_gb ? parseFloat(data.disk_gb) : null,
            disk_model: data.disk_model,
            ms_office: data.ms_office,
            office_key: data.ms_office ? data.office_key : null,
            software_list: data.software_list,
            configuration: data.configuration,
            others: data.others
          })
        }
      };

      if (isEditMode) {
        await api.put(`/assets/${id}`, payload);
      } else {
        const response = await api.post('/assets', payload);
        navigate(`/assets/${response.data.data.id}`);
        return;
      }

      setToast({
        message: isEditMode ? 'Asset updated successfully' : 'Asset created successfully',
        type: 'success'
      });

      setTimeout(() => {
        navigate(`/assets/${id || ''}`);
      }, 1500);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to save asset',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout title={isEditMode ? 'Edit Asset' : 'Add Asset'}>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={isEditMode ? 'Edit Asset' : 'Add Asset'}>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        {/* SECTION 1 - Basic Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Basic Information</h3>

          <div className="grid grid-cols-2 gap-6">
            {/* Asset Tag */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Tag <span className="text-red-500">*</span>
              </label>
              <Controller
                name="asset_tag"
                control={control}
                rules={{ required: 'Asset tag is required' }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="e.g., LAP-001"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.asset_tag ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                )}
              />
              {errors.asset_tag && (
                <p className="text-red-600 text-sm mt-1">{errors.asset_tag.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <Controller
                name="category"
                control={control}
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="IT">IT</option>
                    <option value="Non-IT">Non-IT</option>
                  </select>
                )}
              />
              {errors.category && (
                <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            {/* Sub Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub Type <span className="text-red-500">*</span>
              </label>
              <Controller
                name="sub_type"
                control={control}
                rules={{ required: 'Sub type is required' }}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.sub_type ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {subTypeOptions[selectedCategory]?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.sub_type && (
                <p className="text-red-600 text-sm mt-1">{errors.sub_type.message}</p>
              )}
            </div>

            {/* Serial Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
              <Controller
                name="serial_no"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="e.g., DELL-123456"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>

            {/* MAC Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">MAC Address</label>
              <Controller
                name="mac_address"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="e.g., 00:1A:2B:3C:4D:5E"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <Controller
                name="status"
                control={control}
                rules={{ required: 'Status is required' }}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.status ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="disposed">Disposed</option>
                  </select>
                )}
              />
              {errors.status && (
                <p className="text-red-600 text-sm mt-1">{errors.status.message}</p>
              )}
            </div>

            {/* Purchase Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Purchase</label>
              <Controller
                name="purchase_id"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a purchase</option>
                    {purchases.map((purchase) => (
                      <option key={purchase.id} value={purchase.id}>
                        {purchase.description || `Purchase #${purchase.id}`}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>

            {/* Assigned To Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
              <Controller
                name="assigned_to"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.name}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2 - Technical Details (IT only) */}
        {selectedCategory === 'IT' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Technical Details</h3>

            <div className="space-y-6">
              {/* OS Type and Version Row */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">OS Type</label>
                  <Controller
                    name="os_type"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Windows">Windows</option>
                        <option value="Linux">Linux</option>
                        <option value="macOS">macOS</option>
                        <option value="OEM">OEM</option>
                        <option value="Licensed">Licensed</option>
                      </select>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">OS Version</label>
                  <Controller
                    name="os_version"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="e.g., Windows 11"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Product ID and OS Activated Row */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product ID</label>
                  <Controller
                    name="product_id"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="Product ID"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <Controller
                      name="os_activated"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="checkbox"
                          checked={field.value}
                          className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    />
                    OS Activated
                  </label>
                </div>
              </div>

              {/* Processor and Manufacturer Row */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Processor Name
                  </label>
                  <Controller
                    name="processor_name"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="e.g., Intel Core i7"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manufacturer
                  </label>
                  <Controller
                    name="manufacturer"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="e.g., Dell"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Cores, RAM, Disk Row */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cores</label>
                  <Controller
                    name="cores"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        placeholder="e.g., 8"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">RAM (GB)</label>
                  <Controller
                    name="ram_gb"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        step="0.1"
                        placeholder="e.g., 16"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Disk (GB)</label>
                  <Controller
                    name="disk_gb"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        step="0.1"
                        placeholder="e.g., 512"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Disk Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Disk Model</label>
                <Controller
                  name="disk_model"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., Samsung SSD 970"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                />
              </div>

              {/* MS Office and Office Key Row */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center">
                  <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <Controller
                      name="ms_office"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="checkbox"
                          checked={field.value}
                          className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    />
                    MS Office Installed
                  </label>
                </div>

                {msOfficeEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Office Key
                    </label>
                    <Controller
                      name="office_key"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="License key"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Software List Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Software List
                </label>
                <Controller
                  name="software_list"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      placeholder="List installed software (one per line)"
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                />
              </div>

              {/* Configuration Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Configuration
                </label>
                <Controller
                  name="configuration"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      placeholder="System configuration details"
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                />
              </div>

              {/* Others Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Others</label>
                <Controller
                  name="others"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      placeholder="Additional notes or information"
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Saving...' : isEditMode ? 'Update Asset' : 'Create Asset'}
          </button>
        </div>
      </form>

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
