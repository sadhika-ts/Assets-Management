import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AttachmentSection } from '../components/AttachmentSection';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useVendors } from '../hooks/useVendors';
import { VendorDropdown } from '../components/VendorDropdown';

const paymentMethods = ['Cash', 'Bank Transfer', 'Credit Card', 'UPI', 'Cheque'];
const purchaseStatuses = ['Pending', 'Ordered', 'Received', 'Cancelled'];

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
  const { vendors } = useVendors();

  const handleSelectVendor = (vendor) => {
    setFormData(prev => ({
      ...prev,
      vendor_name: vendor.name,
      vendor_contact: vendor.contact || prev.vendor_contact,
      vendor_email: vendor.email || prev.vendor_email,
      vendor_address: vendor.address || prev.vendor_address,
    }));
    setErrors(prev => ({ ...prev, vendor_name: '', vendor_contact: '', vendor_email: '', vendor_address: '' }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.vendor_name.trim()) newErrors.vendor_name = 'Vendor name is required';
    if (!formData.vendor_contact.trim()) newErrors.vendor_contact = 'Contact number is required';
    else if (!/^\d{10}$/.test(formData.vendor_contact.replace(/\D/g, '')))
      newErrors.vendor_contact = 'Contact number must be 10 digits';
    if (!formData.vendor_email.trim()) newErrors.vendor_email = 'Email is required';
    else if (!formData.vendor_email.includes('@')) newErrors.vendor_email = 'Invalid email format';
    if (!formData.vendor_address.trim()) newErrors.vendor_address = 'Vendor address is required';
    if (!formData.shipping_address.trim()) newErrors.shipping_address = 'Shipping address is required';
    if (!formData.billing_address.trim()) newErrors.billing_address = 'Billing address is required';
    if (!formData.invoice_number.trim()) newErrors.invoice_number = 'Invoice number is required';
    if (!formData.purchase_date) newErrors.purchase_date = 'Purchase date is required';
    if (!formData.total_amount || parseFloat(formData.total_amount) <= 0)
      newErrors.total_amount = 'Amount must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) { toast.error('Please fill in all required fields'); return; }
    try {
      const payload = {
        vendor_name: formData.vendor_name.trim(),
        vendor_contact: formData.vendor_contact.replace(/\D/g, ''),
        vendor_email: formData.vendor_email.trim(),
        billing_address: formData.billing_address.trim(),
        shipping_address: formData.shipping_address.trim(),
        purchase_date: formData.purchase_date,
        status: formData.purchase_status.toLowerCase(),
        total_amount: parseFloat(formData.total_amount),
        notes: formData.notes,
        payment_method: formData.payment_method,
        vendor_address: formData.vendor_address.trim(),
        invoice_number: formData.invoice_number.trim()
      };
      const response = await api.post('/purchases', payload);
      const purchaseId = response.data?.data?.purchase?.purchase_id || generatedPurchaseId;
      setGeneratedPurchaseId(purchaseId);
      // Move pending attachments to the real PO key
      const pending = localStorage.getItem('purchase_attachments_pending');
      if (pending && purchaseId) {
        localStorage.setItem(`purchase_attachments_${purchaseId}`, pending);
        localStorage.removeItem('purchase_attachments_pending');
      }
      toast.success(`Purchase Order ${purchaseId} created`);
      setTimeout(() => navigate(`/purchases?refresh=true&new=${purchaseId}`), 1500);
    } catch (err) {
      const msg = err.response?.data?.details
        ? err.response.data.details.map(e => e.msg).join(', ')
        : err.response?.data?.message || 'Failed to save purchase order';
      toast.error(msg);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors[field] ? 'border-red-500' : 'border-gray-300'}`;

  return (
    <AppLayout title="New Purchase Order">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Create Purchase Order</h2>
          <p className="text-sm text-gray-600">PO ID: <span className="font-semibold text-blue-600">{generatedPurchaseId || '(Auto-generated on submit)'}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Purchase Information */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
              Purchase Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date <span className="text-red-500">*</span></label>
                <input type="date" name="purchase_date" value={formData.purchase_date} onChange={handleInputChange} className={inputClass('purchase_date')} />
                {errors.purchase_date && <p className="text-red-500 text-xs mt-1">{errors.purchase_date}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number <span className="text-red-500">*</span></label>
                <input type="text" name="invoice_number" placeholder="INV-2024-001" value={formData.invoice_number} onChange={handleInputChange} className={inputClass('invoice_number')} />
                {errors.invoice_number && <p className="text-red-500 text-xs mt-1">{errors.invoice_number}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select name="payment_method" value={formData.payment_method} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  {paymentMethods.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount (₹) <span className="text-red-500">*</span></label>
                <input type="number" name="total_amount" placeholder="e.g., 50000" value={formData.total_amount} onChange={handleInputChange} min="0" step="0.01" className={inputClass('total_amount')} />
                {errors.total_amount && <p className="text-red-500 text-xs mt-1">{errors.total_amount}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Status <span className="text-red-500">*</span></label>
                <select name="purchase_status" value={formData.purchase_status} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  {purchaseStatuses.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes / Special Instructions</label>
              <textarea name="notes" placeholder="Add any special notes..." value={formData.notes} onChange={handleInputChange} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
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
                />
                {errors.vendor_name && <p className="text-red-500 text-xs mt-1">{errors.vendor_name}</p>}
              </div>

              {/* Vendor Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Contact Number <span className="text-red-500">*</span></label>
                <input type="tel" name="vendor_contact" placeholder="+91-9876543210" value={formData.vendor_contact} onChange={handleInputChange} className={inputClass('vendor_contact')} />
                {errors.vendor_contact && <p className="text-red-500 text-xs mt-1">{errors.vendor_contact}</p>}
              </div>

              {/* Vendor Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Email <span className="text-red-500">*</span></label>
                <input type="email" name="vendor_email" placeholder="vendor@company.com" value={formData.vendor_email} onChange={handleInputChange} className={inputClass('vendor_email')} />
                {errors.vendor_email && <p className="text-red-500 text-xs mt-1">{errors.vendor_email}</p>}
              </div>

              {/* Vendor Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Address <span className="text-red-500">*</span></label>
                <input type="text" name="vendor_address" placeholder="123 Tech Park, Bangalore" value={formData.vendor_address} onChange={handleInputChange} className={inputClass('vendor_address')} />
                {errors.vendor_address && <p className="text-red-500 text-xs mt-1">{errors.vendor_address}</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Shipping & Billing */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
              Shipping & Billing Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address <span className="text-red-500">*</span></label>
                <textarea name="shipping_address" placeholder="Enter complete shipping address" value={formData.shipping_address} onChange={handleInputChange} rows="3" className={inputClass('shipping_address')} />
                {errors.shipping_address && <p className="text-red-500 text-xs mt-1">{errors.shipping_address}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address <span className="text-red-500">*</span></label>
                <textarea name="billing_address" placeholder="Enter complete billing address" value={formData.billing_address} onChange={handleInputChange} rows="3" className={inputClass('billing_address')} />
                {errors.billing_address && <p className="text-red-500 text-xs mt-1">{errors.billing_address}</p>}
                <button type="button" onClick={() => setFormData(p => ({ ...p, billing_address: p.vendor_address }))} className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  📋 Copy Vendor Address
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Document Attachments */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">4</span>
              Document Attachments
              <span className="text-xs text-gray-400 dark:text-slate-500 font-normal">(optional)</span>
            </h3>
            <AttachmentSection storageKey={generatedPurchaseId ? `purchase_attachments_${generatedPurchaseId}` : 'purchase_attachments_pending'} />
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <button type="button" onClick={() => navigate('/purchases')} className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all">
              Cancel
            </button>
            <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2">
              <span>✅</span> Create Purchase Order
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};
