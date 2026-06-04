import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import toast from 'react-hot-toast';

export const PurchaseForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    purchase_date: new Date().toISOString().split('T')[0],
    vendor_name: '',
    vendor_contact: '',
    vendor_email: '',
    vendor_address: '',
    shipping_address: '',
    billing_address: '',
    invoice_number: '',
    total_amount: '',
    payment_method: 'Bank Transfer',
    purchase_status: 'Pending',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [generatedPurchaseId, setGeneratedPurchaseId] = useState(null);

  const paymentMethods = ['Cash', 'Bank Transfer', 'Credit Card', 'UPI', 'Cheque'];
  const purchaseStatuses = ['Pending', 'Ordered', 'Delivered', 'Cancelled'];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.vendor_name.trim()) newErrors.vendor_name = 'Vendor name is required';
    if (!formData.vendor_contact.trim()) newErrors.vendor_contact = 'Contact number is required';
    if (!formData.vendor_email.trim()) newErrors.vendor_email = 'Email is required';
    else if (!formData.vendor_email.includes('@')) newErrors.vendor_email = 'Invalid email format';
    if (!formData.vendor_address.trim()) newErrors.vendor_address = 'Vendor address is required';
    if (!formData.shipping_address.trim()) newErrors.shipping_address = 'Shipping address is required';
    if (!formData.billing_address.trim()) newErrors.billing_address = 'Billing address is required';
    if (!formData.invoice_number.trim()) newErrors.invoice_number = 'Invoice number is required';
    if (!formData.purchase_date) newErrors.purchase_date = 'Purchase date is required';
    if (!formData.total_amount || parseFloat(formData.total_amount) <= 0) newErrors.total_amount = 'Amount must be greater than 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      console.log('🛒 Purchase Form Submitted');
      console.log('Form Data:', formData);

      // Flatten and map frontend fields to backend expected fields
      const payload = {
        vendor_name: formData.vendor_name.trim(),
        vendor_contact: formData.vendor_contact.trim(),
        vendor_email: formData.vendor_email.trim(),
        billing_address: formData.billing_address.trim(),
        shipping_address: formData.shipping_address.trim(),
        purchase_date: formData.purchase_date,
        status: formData.purchase_status.toLowerCase(), // Map purchase_status to status
        total_amount: parseFloat(formData.total_amount), // Convert to number
        notes: formData.notes,
        payment_method: formData.payment_method,
        vendor_address: formData.vendor_address,
        invoice_number: formData.invoice_number
      };

      console.log('Payload to send:', payload);

      // Import axios dynamically
      const { default: api } = await import('../api/axios');

      console.log('Sending POST request to /api/purchases');
      const response = await api.post('/purchases', payload);

      console.log('Response:', response.data);

      const purchaseId = response.data?.data?.purchase?.purchase_id || generatedPurchaseId;

      // Show success message
      toast.success(`✅ Data stored successfully - Purchase Order ${purchaseId} created`);

      // Wait for user to see the toast before redirecting
      setTimeout(() => {
        console.log('Redirecting to purchases list with refresh:', purchaseId);
        // Navigate to purchases list with refresh flag to show new purchase
        navigate(`/purchases?refresh=true&new=${purchaseId}`);
      }, 2000);
    } catch (err) {
      console.error('Form submission error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });

      const errorMessage = err.response?.data?.details
        ? err.response.data.details.map(e => e.msg).join(', ')
        : err.response?.data?.message || 'Failed to save purchase order';

      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    navigate('/purchases');
  };

  const handleCopySameAsVendor = () => {
    setFormData(prev => ({
      ...prev,
      billing_address: prev.vendor_address
    }));
    toast.success('Billing address copied from vendor address');
  };

  return (
    <AppLayout title="New Purchase Order">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Create Purchase Order</h2>
          <p className="text-sm text-gray-600">PO ID: <span className="font-semibold text-blue-600">{generatedPurchaseId || '(Auto-generated on submit)'}</span></p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Purchase Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
              Purchase Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Purchase Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="purchase_date"
                  value={formData.purchase_date}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.purchase_date ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.purchase_date && <p className="text-red-500 text-xs mt-1">{errors.purchase_date}</p>}
              </div>

              {/* Invoice Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="invoice_number"
                  placeholder="INV-2024-001"
                  value={formData.invoice_number}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.invoice_number ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.invoice_number && <p className="text-red-500 text-xs mt-1">{errors.invoice_number}</p>}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              {/* Total Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="total_amount"
                  placeholder="e.g., 50000"
                  value={formData.total_amount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.total_amount ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.total_amount && <p className="text-red-500 text-xs mt-1">{errors.total_amount}</p>}
              </div>

              {/* Purchase Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="purchase_status"
                  value={formData.purchase_status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {purchaseStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes / Special Instructions
              </label>
              <textarea
                name="notes"
                placeholder="Add any special notes or instructions for this purchase..."
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Section 2: Vendor Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
              Vendor Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vendor Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="vendor_name"
                  placeholder="e.g., Tech Solutions Inc"
                  value={formData.vendor_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.vendor_name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.vendor_name && <p className="text-red-500 text-xs mt-1">{errors.vendor_name}</p>}
              </div>

              {/* Vendor Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="vendor_contact"
                  placeholder="+91-9876543210"
                  value={formData.vendor_contact}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.vendor_contact ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.vendor_contact && <p className="text-red-500 text-xs mt-1">{errors.vendor_contact}</p>}
              </div>

              {/* Vendor Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="vendor_email"
                  placeholder="vendor@company.com"
                  value={formData.vendor_email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.vendor_email ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.vendor_email && <p className="text-red-500 text-xs mt-1">{errors.vendor_email}</p>}
              </div>

              {/* Vendor Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="vendor_address"
                  placeholder="123 Tech Park, Bangalore"
                  value={formData.vendor_address}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.vendor_address ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.vendor_address && <p className="text-red-500 text-xs mt-1">{errors.vendor_address}</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Shipping & Billing Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
              Shipping & Billing Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="shipping_address"
                  placeholder="Enter complete shipping address"
                  value={formData.shipping_address}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.shipping_address ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.shipping_address && <p className="text-red-500 text-xs mt-1">{errors.shipping_address}</p>}
              </div>

              {/* Billing Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="billing_address"
                  placeholder="Enter complete billing address"
                  value={formData.billing_address}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.billing_address ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.billing_address && <p className="text-red-500 text-xs mt-1">{errors.billing_address}</p>}

                <button
                  type="button"
                  onClick={handleCopySameAsVendor}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  📋 Copy Vendor Address
                </button>
              </div>
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
              <span>✅</span> Create Purchase Order
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};
