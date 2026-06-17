import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { AppLayout } from '../layouts/AppLayout';
import { AttachmentSection } from '../components/AttachmentSection';
import api from '../api/axios';
import { getEmployees } from '../utils/employeeStore';

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

// Sub type options based on category for small organizations
const subTypeOptions = {
  IT: [
    { value: 'Laptop', label: 'Laptop' },
    { value: 'Desktop', label: 'Desktop Computer' },
    { value: 'Monitor', label: 'Monitor' },
    { value: 'Keyboard', label: 'Keyboard' },
    { value: 'Mouse', label: 'Mouse' },
    { value: 'Printer', label: 'Printer' },
    { value: 'Scanner', label: 'Scanner' },
    { value: 'Router', label: 'Router' },
    { value: 'Switch', label: 'Network Switch' },
    { value: 'UPS', label: 'UPS (Uninterruptible Power Supply)' },
    { value: 'Projector', label: 'Projector' },
    { value: 'Webcam', label: 'Webcam' },
    { value: 'Headset', label: 'Headset / Earphones' },
    { value: 'Mobile', label: 'Mobile Phone' },
    { value: 'Tablet', label: 'Tablet' },
    { value: 'Software License', label: 'Software License' },
    { value: 'Other', label: 'Other' }
  ],
  'Non-IT': [
    { value: 'Chair', label: 'Office Chair' },
    { value: 'Desk', label: 'Desk' },
    { value: 'Cupboard', label: 'Cupboard / Cabinet' },
    { value: 'Whiteboard', label: 'Whiteboard' },
    { value: 'Shelf', label: 'Shelf' },
    { value: 'Cabinet', label: 'Filing Cabinet' },
    { value: 'Table', label: 'Conference Table' },
    { value: 'Sofa', label: 'Sofa' },
    { value: 'Fan', label: 'Fan (Ceiling/Table)' },
    { value: 'Lamp', label: 'Lamp / Lighting' },
    { value: 'Other', label: 'Other' }
  ]
};

// User list for "Assigned To" field
// Remove empty email display from dropdown
const formatUserName = (name) => name;

// Generate asset tag by calling backend API
const generateAssetTagFromAPI = async (category, subType) => {
  try {
    if (!category || !subType) return '';

    const response = await api.post('/assets/generate-tag', {
      category,
      sub_type: subType
    });

    const generatedTag = response.data.data?.asset_tag;
    return generatedTag || '';
  } catch (err) {
    console.error('Error generating asset tag:', err);
    return '';
  }
};


const EMPTY_LICENSE = { license_key: '', license_vendor: '', license_expiry: '' };

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
  const [licenses, setLicenses] = useState([{ ...EMPTY_LICENSE }]);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      asset_tag: '',
      category: 'IT',
      sub_type: 'Laptop',
      other_subtype_description: '',
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
      other_applications_installed: false,
      other_applications_description: '',
      software_list: '',
      configuration: '',
      others: ''
    }
  });

  const selectedCategory = watch('category');
  const selectedSubType = watch('sub_type');
  const selectedStatus = watch('status');
  const msOfficeEnabled = watch('ms_office');
  const otherApplicationsEnabled = watch('other_applications_installed');
  const isSoftwareLicense = selectedSubType === 'Software License';

  // Fetch asset data if editing
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load employee list from localStorage store
        setUsers(getEmployees());

        const purchasesRes = await api.get('/purchases?limit=500');
        // Sort by date descending and take last 10
        const allPurchases = purchasesRes.data.data.purchases || [];
        const recentPurchases = allPurchases
          .sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date))
          .slice(0, 10);
        setPurchases(recentPurchases);

        // Fetch asset if editing
        if (isEditMode) {
          const assetRes = await api.get(`/assets/${id}`);
          const asset = assetRes.data.data?.asset || assetRes.data.data;

          reset({
            asset_tag: asset.asset_tag,
            asset_name: asset.asset_name || '',
            category: asset.category,
            sub_type: asset.sub_type,
            other_subtype_description: asset.other_subtype_description || '',
            serial_no: asset.serial_no || asset.detail?.serial_no || '',
            mac_address: asset.mac_address || asset.detail?.mac_address || '',
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
            other_applications_installed: asset.detail?.other_applications_installed || false,
            other_applications_description: asset.detail?.other_applications_description || '',
            software_list: asset.detail?.software_list || '',
            configuration: asset.detail?.configuration || '',
            others: asset.detail?.others || ''
          });
          // Load licenses from DB
          try {
            const licRes = await api.get(`/assets/${id}/licenses`);
            const dbLics = licRes.data.data?.licenses || [];
            setLicenses(dbLics.length > 0 ? dbLics : [{ ...EMPTY_LICENSE }]);
          } catch { setLicenses([{ ...EMPTY_LICENSE }]); }
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

  // Auto-generate asset tag based on category and sub_type
  useEffect(() => {
    if (isEditMode) return; // Don't auto-generate when editing

    const generateAndSetTag = async () => {
      const newTag = await generateAssetTagFromAPI(selectedCategory, selectedSubType);
      if (newTag) {
        setValue('asset_tag', newTag);
      }
    };

    if (selectedCategory && selectedSubType) {
      generateAndSetTag();
    }
  }, [selectedCategory, selectedSubType, isEditMode, setValue]);

  // Clear assigned_to when status changes to inactive or disposed
  useEffect(() => {
    if (selectedStatus !== 'active') {
      setValue('assigned_to', '');
    }
  }, [selectedStatus, setValue]);

  // Form submission with validation
  const onSubmit = async (data) => {
    try {
      setIsSaving(true);

      // Validation: Check if subtype is "Other" and description is empty
      if (data.sub_type === 'Other' && !data.other_subtype_description.trim()) {
        setToast({
          message: 'Please specify the asset subtype.',
          type: 'error'
        });
        setIsSaving(false);
        return;
      }

      // Validation: Check if Other Applications is checked and description is empty
      if (data.other_applications_installed && !data.other_applications_description.trim()) {
        setToast({
          message: 'Please provide details of the installed applications.',
          type: 'error'
        });
        setIsSaving(false);
        return;
      }

      // Validation: Check if assigned_to is set for non-active assets
      if (data.assigned_to && data.status !== 'active') {
        setToast({
          message: `Cannot assign ${data.status} assets. Please change status to Active first.`,
          type: 'error'
        });
        setIsSaving(false);
        return;
      }

      // FLATTENED PAYLOAD - Backend expects all fields at root level (NOT nested in 'detail')
      const payload = {
        // Basic Info
        asset_tag: data.asset_tag.trim(),
        asset_name: data.asset_name.trim() || data.asset_tag.trim(),  // Use asset_name if provided, otherwise asset_tag
        category: data.category,
        sub_type: data.sub_type,
        other_subtype_description: data.sub_type === 'Other' ? data.other_subtype_description : undefined,
        status: data.status || 'active',

        // Optional associations
        ...(data.purchase_id && { purchase_id: data.purchase_id }),
        // Only include assigned_to if status is active
        ...(data.assigned_to && data.status === 'active' && { assigned_to: data.assigned_to }),

        // Asset detail fields - FLATTENED to root level
        serial_no: data.serial_no || undefined,
        // Only include MAC address for IT assets
        ...(data.category === 'IT' && { mac_address: data.mac_address || undefined }),

        // IT specific fields
        os_type: data.os_type || undefined,
        os_version: data.os_version || undefined,
        product_id: data.product_id || undefined,
        os_activated: data.os_activated || false,
        processor_name: data.processor_name || undefined,
        manufacturer: data.manufacturer || undefined,
        cores: data.cores ? parseInt(data.cores) : undefined,
        ram_gb: data.ram_gb ? parseFloat(data.ram_gb) : undefined,
        disk_gb: data.disk_gb ? parseFloat(data.disk_gb) : undefined,
        disk_model: data.disk_model || undefined,
        ms_office: data.ms_office || false,
        office_key: data.ms_office ? data.office_key : undefined,
        other_applications_installed: data.other_applications_installed || false,
        other_applications_description: data.other_applications_installed ? data.other_applications_description : undefined,
        software_list: data.software_list || undefined,
        configuration: data.configuration || undefined,
        others: data.others || undefined,
        software_licenses: isSoftwareLicense ? licenses.filter(l => l.license_key.trim()) : undefined
      };


      if (isEditMode) {
        const editRes = await api.put(`/assets/${id}`, payload);
        const assetId = editRes.data.data?.asset?.id || id;
        if (isSoftwareLicense) await api.post(`/assets/${assetId}/licenses`, { licenses });
        setToast({ message: '✅ Asset updated successfully', type: 'success' });
        setTimeout(() => navigate('/assets'), 1500);
      } else {
        const response = await api.post('/assets', payload);
        const assetId = response.data.data?.id || response.data.data?.asset?.id;
        if (isSoftwareLicense && assetId) await api.post(`/assets/${assetId}/licenses`, { licenses });
        setToast({ message: '✅ Data stored successfully - Asset created', type: 'success' });
        setTimeout(() => navigate(`/assets?refresh=true&new=${payload.asset_tag}`), 2000);
      }
    } catch (err) {
      console.error('Form submission error:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        details: err.response?.data?.details,
        fullError: err
      });

      const errorMessage = err.response?.data?.details
        ? err.response.data.details.map(e => e.msg).join(', ')
        : err.response?.data?.message || err.message || 'Failed to save asset';

      setToast({
        message: errorMessage,
        type: 'error'
      });
      setIsSaving(false);
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Basic Information</h3>

          <div className="grid grid-cols-2 gap-6">
            {/* Asset Tag - Auto-generated, Read-only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Tag <span className="text-red-500">*</span>
              </label>
              <Controller
                name="asset_tag"
                control={control}
                rules={undefined}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Auto-generated"
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                )}
              />
              <p className="text-gray-500 text-xs mt-1">Auto-generated based on category and sub-type</p>
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

            {/* Asset Name - Required for all assets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Name <span className="text-red-500">*</span>
              </label>
              <Controller
                name="asset_name"
                control={control}
                rules={{ required: 'Asset name is required' }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder={isSoftwareLicense ? "e.g., Microsoft Office 365" : selectedCategory === 'Non-IT' ? "e.g., Executive Chair" : "e.g., Dell Laptop"}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.asset_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                )}
              />
              {errors.asset_name && (
                <p className="text-red-600 text-sm mt-1">{errors.asset_name.message}</p>
              )}
            </div>

            {/* Status - Required for all assets */}
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
                    <option value="retired">Retired</option>

                  </select>
                )}
              />
              {errors.status && (
                <p className="text-red-600 text-sm mt-1">{errors.status.message}</p>
              )}
            </div>

            {/* Other Subtype Description - Show only when "Other" is selected */}
            {selectedSubType === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Subtype Description <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="other_subtype_description"
                  control={control}
                  rules={{ required: 'Please specify the asset subtype.' }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., Smart Watch, Game Console"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.other_subtype_description ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  )}
                />
                {errors.other_subtype_description && (
                  <p className="text-red-600 text-sm mt-1">{errors.other_subtype_description.message}</p>
                )}
              </div>
            )}

            {/* Serial Number — hidden for Software License */}
            {!isSoftwareLicense && (
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
            )}

            {/* Multi-license block — spans full width, shown only for Software License sub-type */}
            {isSoftwareLicense && (
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    Software Licenses
                    <span className="ml-2 text-xs text-gray-400 dark:text-slate-500">({licenses.length} {licenses.length === 1 ? 'entry' : 'entries'})</span>
                  </label>
                  <button type="button"
                    onClick={() => setLicenses(prev => [...prev, { ...EMPTY_LICENSE }])}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                    </svg>
                    Add License
                  </button>
                </div>
                <div className="space-y-3">
                  {licenses.map((lic, idx) => (
                    <div key={idx} className="relative border border-gray-200 dark:border-slate-600 rounded-xl p-4 bg-gray-50 dark:bg-slate-900/40">
                      {licenses.length > 1 && (
                        <button type="button"
                          onClick={() => setLicenses(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-3 right-3 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Remove this license">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      )}
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-3">
                        License #{idx + 1}
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">License Key</label>
                          <input type="text" value={lic.license_key} placeholder="XXXXX-XXXXX-XXXXX"
                            onChange={e => setLicenses(prev => prev.map((l, i) => i === idx ? { ...l, license_key: e.target.value } : l))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 font-mono" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Vendor</label>
                          <input type="text" value={lic.license_vendor} placeholder="e.g., Microsoft"
                            onChange={e => setLicenses(prev => prev.map((l, i) => i === idx ? { ...l, license_vendor: e.target.value } : l))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Expiry Date</label>
                          <input type="date" value={lic.license_expiry}
                            onChange={e => setLicenses(prev => prev.map((l, i) => i === idx ? { ...l, license_expiry: e.target.value } : l))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MAC Address - Only for IT assets, not Software License */}
            {selectedCategory === 'IT' && !isSoftwareLicense && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">MAC Address</label>
                <Controller
                  name="mac_address"
                  control={control}
                  rules={{
                    validate: val => {
                      if (!val || !val.trim()) return true;
                      return /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(val.trim())
                        || 'Invalid MAC address. Use format XX:XX:XX:XX:XX:XX (0-9, A-F)';
                    }
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., 00:1A:2B:3C:4D:5E"
                      maxLength={17}
                      onChange={e => {
                        // Auto-insert colons and force uppercase
                        let val = e.target.value.replace(/[^0-9A-Fa-f:]/g, '').toUpperCase();
                        // Auto-add colon after every 2 hex chars if user isn't deleting
                        const raw = val.replace(/:/g, '');
                        if (raw.length <= 12 && e.target.value.length > field.value.length) {
                          val = raw.match(/.{1,2}/g)?.join(':') || val;
                        }
                        field.onChange(val.slice(0, 17));
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                        errors.mac_address ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  )}
                />
                {errors.mac_address
                  ? <p className="text-red-600 text-xs mt-1">{errors.mac_address.message}</p>
                  : <p className="text-gray-400 text-xs mt-1">Only hex characters (0–9, A–F). Auto-formatted as XX:XX:XX:XX:XX:XX</p>
                }
              </div>
            )}

            {/* Purchase + Assigned To — hidden for Software License */}
            {!isSoftwareLicense && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase <span className="text-xs text-gray-500">(Last 10 Recent)</span>
                  </label>
                  <Controller
                    name="purchase_id"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a purchase</option>
                        {purchases.map((purchase) => {
                          const purchaseDate = new Date(purchase.purchase_date).toLocaleDateString('en-IN');
                          const displayText = `${purchase.purchase_id} - ${purchase.vendor_name} (${purchaseDate}) - ₹${parseFloat(purchase.total_amount).toLocaleString()}`;
                          return (
                            <option key={purchase.id} value={purchase.id}>
                              {displayText}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  />
                  {purchases.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">No purchases available. Create a purchase order first.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned To
                    {selectedStatus !== 'active' && (
                      <span className="text-gray-500 text-xs ml-2">(Disabled for {selectedStatus} assets)</span>
                    )}
                  </label>
                  <Controller
                    name="assigned_to"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        disabled={selectedStatus !== 'active'}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          selectedStatus !== 'active'
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300'
                            : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select a user</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.name}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {selectedStatus !== 'active' && (
                    <p className="text-gray-500 text-xs mt-1">
                      Cannot assign {selectedStatus} assets. Change status to Active to assign a user.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* SECTION 2 - Technical Details (IT only, not Software License) */}
        {selectedCategory === 'IT' && !isSoftwareLicense && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
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

              {/* Other Applications Installed Checkbox */}
              <div className="flex items-center">
                <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <Controller
                    name="other_applications_installed"
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
                  Other Applications Installed
                </label>
              </div>

              {/* Other Applications Description - Show only when checked */}
              {otherApplicationsEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Description <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="other_applications_description"
                    control={control}
                    rules={{ required: 'Please provide details of the installed applications.' }}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        placeholder="List installed applications (one per line)&#10;e.g.&#10;Adobe Acrobat Pro&#10;AutoCAD 2025&#10;Visual Studio Code"
                        rows="4"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.other_applications_description ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    )}
                  />
                  {errors.other_applications_description && (
                    <p className="text-red-600 text-sm mt-1">{errors.other_applications_description.message}</p>
                  )}
                </div>
              )}

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

        {/* SECTION 3 - Document Attachments */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Document Attachments</h3>
            <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">(optional)</span>
          </div>
          <AttachmentSection storageKey={watch('asset_tag') ? `asset_attachments_${watch('asset_tag')}` : null} />
        </div>

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
