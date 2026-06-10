import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useVendors } from '../hooks/useVendors';
import { VendorDropdown } from '../components/VendorDropdown';

export const ContractForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    contract_name: '',
    contract_type: 'AMC',
    contract_type_description: '',
    vendor_name: '',
    vendor_contact_person: '',
    vendor_email: '',
    vendor_phone: '',
    vendor_address: '',
    active_from: new Date().toISOString().split('T')[0],
    active_till: '',
    contract_value: '',
    currency: 'INR',
    payment_terms: '',
    renewal_cost: '',
    status: '',
    description: '',
    document_path: '',
    linked_assets: []
  });

  const [errors, setErrors] = useState({});
  const [documentFile, setDocumentFile] = useState(null);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [generatedContractId, setGeneratedContractId] = useState(null);
  const { vendors } = useVendors();

  // Load assets for Asset Association section
  useEffect(() => {
    api.get('/assets?limit=500').then(res => {
      const list = res.data?.data?.assets || [];
      setAvailableAssets(list.filter(a => a.status === 'active'));
    }).catch(() => {});
  }, []);

  // Load existing contract in edit mode
  useEffect(() => {
    if (!isEditMode) return;
    api.get(`/contracts/${id}`).then(res => {
      const c = res.data?.data?.contract;
      if (!c) return;
      setFormData(prev => ({
        ...prev,
        contract_name: c.contract_name || '',
        vendor_name: c.vendor_name || '',
        vendor_contact_person: c.vendor_contact_person || '',
        vendor_email: c.vendor_email || '',
        vendor_phone: c.vendor_phone || c.vendor_contact || '',
        vendor_address: c.vendor_address || '',
        active_from: c.active_from ? c.active_from.split('T')[0] : prev.active_from,
        active_till: c.active_till ? c.active_till.split('T')[0] : '',
        contract_value: c.contract_value || '',
        description: c.description || '',
        status: c.status || '',
      }));
      setGeneratedContractId(c.contract_id);
    }).catch(() => toast.error('Failed to load contract'));
  }, [id, isEditMode]);

  const handleSelectVendor = (vendor) => {
    setFormData(prev => ({
      ...prev,
      vendor_name: vendor.name,
      vendor_phone: vendor.contact || prev.vendor_phone,
      vendor_email: vendor.email || prev.vendor_email,
      vendor_address: vendor.address || prev.vendor_address,
      vendor_contact_person: vendor.contact_person || prev.vendor_contact_person,
    }));
    setErrors(prev => ({ ...prev, vendor_name: '', vendor_phone: '', vendor_email: '' }));
  };

  // Calculate remaining days (can be negative for expired)
  const calculateRemainingDays = () => {
    if (!formData.active_till) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const endDate = new Date(formData.active_till); endDate.setHours(0, 0, 0, 0);
    return Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
  };

  // Auto-update status based on dates (uses DB-compatible lowercase values)
  useEffect(() => {
    if (!formData.active_till) return;
    const days = calculateRemainingDays();
    const activeFrom = new Date(formData.active_from); activeFrom.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let newStatus;
    if (days < 0) newStatus = 'expired';
    else if (activeFrom > today) newStatus = 'upcoming';
    else if (days <= 30) newStatus = 'expiring_soon';
    else newStatus = 'active';
    setFormData(prev => ({ ...prev, status: newStatus }));
  }, [formData.active_till, formData.active_from]);

  const validateForm = () => {
    const newErrors = {};

    // Mandatory field validation
    if (!formData.contract_name.trim()) newErrors.contract_name = 'Contract name is required';
    if (!formData.contract_type) newErrors.contract_type = 'Contract type is required';
    if (!formData.vendor_name.trim()) newErrors.vendor_name = 'Vendor name is required';
    if (!formData.vendor_email.trim()) newErrors.vendor_email = 'Vendor email is required';
    else if (!formData.vendor_email.includes('@')) newErrors.vendor_email = 'Invalid email format';
    if (!formData.vendor_phone.trim()) newErrors.vendor_phone = 'Vendor phone is required';
    if (!formData.active_from) newErrors.active_from = 'Active from date is required';
    if (!formData.active_till) newErrors.active_till = 'Active till date is required';

    // Conditional validation
    if (formData.contract_type === 'Other' && !formData.contract_type_description.trim()) {
      newErrors.contract_type_description = 'Contract type description is required';
    }

    // Date validation
    if (formData.active_from && formData.active_till) {
      const fromDate = new Date(formData.active_from);
      const tillDate = new Date(formData.active_till);
      if (tillDate <= fromDate) {
        newErrors.active_till = 'Active till date must be after active from date';
      }
    }

    // Phone number validation
    if (formData.vendor_phone && !/^\d{10}$|^\d{3}-\d{3}-\d{4}$|^\+\d{1,3}\s?\d{1,14}$/.test(formData.vendor_phone.replace(/\s/g, ''))) {
      newErrors.vendor_phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];

      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, DOCX, JPG, and PNG files are allowed');
        return;
      }

      setDocumentFile(file);
      setFormData(prev => ({
        ...prev,
        document_path: file.name
      }));
      toast.success(`Document "${file.name}" selected`);
    }
  };

  const handleAssetSelection = (assetId) => {
    setFormData(prev => {
      const isSelected = prev.linked_assets.includes(assetId);
      return {
        ...prev,
        linked_assets: isSelected
          ? prev.linked_assets.filter(id => id !== assetId)
          : [...prev.linked_assets, assetId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    try {

      // Prepare payload — contract_id is auto-generated by backend
      const payload = {
        contract_name: formData.contract_name.trim(),
        vendor_name: formData.vendor_name.trim(),
        active_from: formData.active_from,
        active_till: formData.active_till,
        // Optional fields
        ...(formData.contract_value && { contract_value: parseFloat(formData.contract_value) }),
        ...(formData.vendor_email && { vendor_email: formData.vendor_email.trim() }),
        ...(formData.vendor_phone && { vendor_phone: formData.vendor_phone.trim() }),
        ...(formData.vendor_address && { vendor_address: formData.vendor_address.trim() }),
        ...(formData.vendor_contact_person && { vendor_contact_person: formData.vendor_contact_person.trim() }),
        ...(formData.description && { description: formData.description.trim() })
      };


      if (isEditMode) {
        // Update existing contract
        const response = await api.put(`/contracts/${id}`, payload);

        toast.success(`✅ Data stored successfully - Contract updated`);

        setTimeout(() => {
          navigate(`/contracts?refresh=true&new=${formData.contract_id}`);
        }, 2000);
      } else {
        // Create new contract

        const response = await api.post('/contracts', payload);

        const contractId = response.data.data?.contract?.contract_id;
        setGeneratedContractId(contractId);

        toast.success(`✅ Contract ${contractId} created successfully`);

        setTimeout(() => {
          navigate(`/contracts?refresh=true&new=${contractId}`);
        }, 2000);
      }
    } catch (err) {

      const errorMessage = err.response?.data?.details
        ? err.response.data.details.map(e => e.msg).join(', ')
        : err.response?.data?.message || 'Failed to save contract';

      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    navigate('/contracts');
  };

  const remainingDays = calculateRemainingDays();
  const statusLabel = { active: 'Active', expiring_soon: 'Expiring Soon', expired: 'Expired', upcoming: 'Upcoming' };
  const statusColor = {
    active: 'border-green-500 bg-green-50 text-green-700',
    expiring_soon: 'border-orange-500 bg-orange-50 text-orange-700',
    expired: 'border-red-500 bg-red-50 text-red-700',
    upcoming: 'border-blue-500 bg-blue-50 text-blue-700',
  };

  return (
    <AppLayout title={isEditMode ? 'Edit Contract' : 'New Contract'}>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Edit Contract' : 'Create New Contract'}
          </h2>
          <p className="text-sm text-gray-600">
            Contract ID: <span className="font-semibold text-blue-600">{generatedContractId || '(Auto-generated on submit)'}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contract Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contract Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contract_name"
                  placeholder="e.g., Microsoft Office 365"
                  value={formData.contract_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.contract_name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.contract_name && <p className="text-red-500 text-xs mt-1">{errors.contract_name}</p>}
              </div>

              {/* Contract Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contract Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="contract_type"
                  value={formData.contract_type}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.contract_type ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="AMC">AMC (Annual Maintenance)</option>
                  <option value="Warranty">Warranty</option>
                  <option value="Service Agreement">Service Agreement</option>
                  <option value="Software License">Software License</option>
                  <option value="Hardware Support">Hardware Support</option>
                  <option value="Subscription">Subscription</option>
                  <option value="Other">Other</option>
                </select>
                {errors.contract_type && <p className="text-red-500 text-xs mt-1">{errors.contract_type}</p>}
              </div>

              {/* Contract Type Description (if Other) */}
              {formData.contract_type === 'Other' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Type Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contract_type_description"
                    placeholder="Describe the contract type"
                    value={formData.contract_type_description}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.contract_type_description ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.contract_type_description && <p className="text-red-500 text-xs mt-1">{errors.contract_type_description}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Vendor Information */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
              Vendor Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vendor Name — searchable dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Name <span className="text-red-500">*</span>
                  {vendors.length > 0 && <span className="text-gray-400 font-normal text-xs ml-2">— select existing or type new</span>}
                </label>
                <VendorDropdown
                  vendors={vendors}
                  value={formData.vendor_name}
                  onChange={val => { setFormData(p => ({ ...p, vendor_name: val })); if (errors.vendor_name) setErrors(p => ({ ...p, vendor_name: '' })); }}
                  onSelect={handleSelectVendor}
                  error={!!errors.vendor_name}
                  placeholder="e.g., Microsoft Corporation"
                />
                {errors.vendor_name && <p className="text-red-500 text-xs mt-1">{errors.vendor_name}</p>}
              </div>

              {/* Vendor Contact Person */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Contact Person
                </label>
                <input
                  type="text"
                  name="vendor_contact_person"
                  placeholder="e.g., John Smith"
                  value={formData.vendor_contact_person}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Vendor Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="vendor_email"
                  placeholder="vendor@example.com"
                  value={formData.vendor_email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.vendor_email ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.vendor_email && <p className="text-red-500 text-xs mt-1">{errors.vendor_email}</p>}
              </div>

              {/* Vendor Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="vendor_phone"
                  placeholder="+91-9876543210"
                  value={formData.vendor_phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.vendor_phone ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.vendor_phone && <p className="text-red-500 text-xs mt-1">{errors.vendor_phone}</p>}
              </div>

              {/* Vendor Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Address
                </label>
                <textarea
                  name="vendor_address"
                  placeholder="Full address"
                  value={formData.vendor_address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Contract Duration */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
              Contract Duration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Active From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Active From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="active_from"
                  value={formData.active_from}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.active_from ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.active_from && <p className="text-red-500 text-xs mt-1">{errors.active_from}</p>}
              </div>

              {/* Active Till */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Active Till <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="active_till"
                  value={formData.active_till}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.active_till ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.active_till && <p className="text-red-500 text-xs mt-1">{errors.active_till}</p>}
              </div>

              {/* Remaining Days (Read-only) */}
              {formData.active_till && remainingDays !== null && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remaining Days
                  </label>
                  <div className={`px-4 py-2 rounded-lg border-2 font-semibold text-lg ${
                    remainingDays < 0 ? 'border-red-500 bg-red-50 text-red-700' :
                    remainingDays <= 30 ? 'border-orange-500 bg-orange-50 text-orange-700' :
                    'border-green-500 bg-green-50 text-green-700'
                  }`}>
                    {remainingDays < 0 ? `Expired ${Math.abs(remainingDays)} days ago` : `${remainingDays} days remaining`}
                  </div>
                </div>
              )}

              {/* Status (Read-only) */}
              {formData.status && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status (Auto-updated)
                  </label>
                  <div className={`px-4 py-2 rounded-lg border-2 font-semibold ${statusColor[formData.status] || 'border-gray-300 bg-gray-50 text-gray-600'}`}>
                    {statusLabel[formData.status] || formData.status}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Financial Details */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">4</span>
              Financial Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contract Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contract Value
                </label>
                <input
                  type="number"
                  name="contract_value"
                  placeholder="0.00"
                  value={formData.contract_value}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>

              {/* Payment Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Terms
                </label>
                <input
                  type="text"
                  name="payment_terms"
                  placeholder="e.g., Net 30"
                  value={formData.payment_terms}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Renewal Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Renewal Cost
                </label>
                <input
                  type="number"
                  name="renewal_cost"
                  placeholder="0.00"
                  value={formData.renewal_cost}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Asset Association */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">5</span>
              Asset Association
            </h3>

            <label className="block text-sm font-medium text-gray-700 mb-3">
              Link Assets to This Contract <span className="text-gray-400 font-normal text-xs">(Multiple selection allowed)</span>
            </label>
            {availableAssets.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center border border-dashed border-gray-200 rounded-lg">No active assets available</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {availableAssets.map(asset => (
                    <div key={asset.id}
                      onClick={() => handleAssetSelection(asset.id)}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.linked_assets.includes(asset.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                      <input
                        type="checkbox"
                        id={`asset-${asset.id}`}
                        checked={formData.linked_assets.includes(asset.id)}
                        onChange={() => {}}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                      <label htmlFor={`asset-${asset.id}`} className="ml-3 flex-1 cursor-pointer">
                        <span className="font-medium text-gray-800 text-sm">{asset.asset_name}</span>
                        <span className="text-xs text-gray-500 block">{asset.asset_tag} · {asset.sub_type}</span>
                      </label>
                    </div>
                  ))}
                </div>
                {formData.linked_assets.length > 0 && (
                  <p className="text-sm text-blue-600 font-medium mt-3">
                    {formData.linked_assets.length} asset(s) selected
                  </p>
                )}
              </>
            )}
          </div>

          {/* Section 6: Contract Description */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-cyan-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">6</span>
              Contract Description
            </h3>

            <textarea
              name="description"
              placeholder="Enter contract description, terms, and conditions..."
              value={formData.description}
              onChange={handleInputChange}
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Section 7: Document Upload */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">7</span>
              Document Upload
            </h3>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">Upload contract document (PDF, DOCX, JPG, PNG)</p>
              <input
                type="file"
                accept=".pdf,.docx,.jpg,.jpeg,.png"
                onChange={handleDocumentUpload}
                className="hidden"
                id="document-input"
              />
              <label htmlFor="document-input" className="cursor-pointer">
                <button
                  type="button"
                  onClick={() => document.getElementById('document-input').click()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  📄 Choose File
                </button>
              </label>
              {documentFile && (
                <p className="text-sm text-green-600 mt-4">
                  ✓ File selected: {documentFile.name}
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2"
            >
              <span>✅</span> {isEditMode ? 'Update Contract' : 'Create Contract'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};
