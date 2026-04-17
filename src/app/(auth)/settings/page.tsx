'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { FiPlus, FiSave, FiTrash2, FiUpload, FiX } from 'react-icons/fi';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { uploadApi } from '@/lib/api';
import type { SiteSettings } from '@/types';

type PaymentMethodForm = NonNullable<SiteSettings['paymentMethods']>[number];

const createPaymentMethod = (overrides: Partial<PaymentMethodForm> = {}): PaymentMethodForm => ({
  code: '',
  label: '',
  type: 'other',
  accountTitle: '',
  accountNumber: '',
  iban: '',
  instructions: '',
  isActive: true,
  sortOrder: 0,
  ...overrides,
});

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    logo: '',
    logoWidth: 32,
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    whatsappNumber: '',
    workingHours: '',
    formSubmitEmail: '',
    orderSuccessMessage: '',
    paymentMethods: [createPaymentMethod({ code: 'cod', label: 'Cash on Delivery', type: 'cod', instructions: 'Pay when you receive your order.', sortOrder: 0 })],
  });

  useEffect(() => {
    if (settings) {
      setForm({
        logo: settings.logo || '',
        logoWidth: settings.logoWidth || 32,
        contactEmail: settings.contactEmail || '',
        contactPhone: settings.contactPhone || '',
        contactAddress: settings.contactAddress || '',
        whatsappNumber: settings.whatsappNumber || '',
        workingHours: settings.workingHours || '',
        formSubmitEmail: settings.formSubmitEmail || '',
        orderSuccessMessage: settings.orderSuccessMessage || '',
        paymentMethods: settings.paymentMethods?.length
          ? settings.paymentMethods.map((method, index) => createPaymentMethod({ ...method, sortOrder: index }))
          : [createPaymentMethod({ code: 'cod', label: 'Cash on Delivery', type: 'cod', instructions: 'Pay when you receive your order.', sortOrder: 0 })],
      });
    }
  }, [settings]);

  const updatePaymentMethod = (index: number, key: keyof PaymentMethodForm, value: string | boolean | number) => {
    setForm((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((method, methodIndex) =>
        methodIndex === index ? { ...method, [key]: value } : method
      ),
    }));
  };

  const addPaymentMethod = () => {
    setForm((prev) => ({
      ...prev,
      paymentMethods: [
        ...prev.paymentMethods,
        createPaymentMethod({
          code: `method-${prev.paymentMethods.length + 1}`,
          label: '',
          sortOrder: prev.paymentMethods.length,
        }),
      ],
    }));
  };

  const removePaymentMethod = (index: number) => {
    setForm((prev) => {
      const target = prev.paymentMethods[index];
      if (target?.type === 'cod') {
        toast.error('Cash on Delivery must remain available');
        return prev;
      }

      return {
        ...prev,
        paymentMethods: prev.paymentMethods
          .filter((_, methodIndex) => methodIndex !== index)
          .map((method, methodIndex) => ({ ...method, sortOrder: methodIndex })),
      };
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      setForm(prev => ({ ...prev, logo: res.data.data.url }));
      toast.success('Logo uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(form);
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="card p-6 animate-pulse">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage logo, contact info, messaging, and checkout payment methods</p>
      </div>

      {/* Logo */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Logo</h2>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="flex-shrink-0">
            {form.logo ? (
              <div className="relative group">
                <div className="h-24 w-40 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src={form.logo} 
                    alt="Logo" 
                    className="max-h-16 max-w-32 object-contain"
                    style={{ width: `${form.logoWidth}px` }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-gray-400 text-xs text-center p-2">Invalid image URL</div>';
                    }}
                  />
                </div>
                <button 
                  onClick={() => setForm(prev => ({ ...prev, logo: '' }))} 
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  title="Remove logo"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="h-24 w-40 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                No logo uploaded
              </div>
            )}
          </div>
          <div className="flex-1 space-y-3 w-full">
            <label className="flex items-center gap-2 btn-secondary cursor-pointer w-fit">
              <FiUpload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload Logo'}
              <input 
                type="file" 
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/bmp,image/tiff" 
                onChange={handleLogoUpload} 
                className="hidden" 
                disabled={uploading} 
              />
            </label>
            <div className="text-xs text-gray-500">
              Supported formats: JPG, PNG, WebP, GIF, SVG, BMP, TIFF (Max 5MB)
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">Display Width:</label>
              <input 
                type="number" 
                value={form.logoWidth} 
                onChange={e => setForm(prev => ({ ...prev, logoWidth: parseInt(e.target.value) || 32 }))} 
                className="input-field w-20" 
                min="16"
                max="200"
              />
              <span className="text-xs text-gray-400">px</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input value={form.contactEmail} onChange={e => setForm(prev => ({ ...prev, contactEmail: e.target.value }))} className="input-field" placeholder="support@aghaz.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <input value={form.contactPhone} onChange={e => setForm(prev => ({ ...prev, contactPhone: e.target.value }))} className="input-field" placeholder="+92 300 1234567" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp Number</label>
            <input value={form.whatsappNumber} onChange={e => setForm(prev => ({ ...prev, whatsappNumber: e.target.value }))} className="input-field" placeholder="923001234567" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <input value={form.contactAddress} onChange={e => setForm(prev => ({ ...prev, contactAddress: e.target.value }))} className="input-field" placeholder="Lahore, Pakistan" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Working Hours</label>
            <input value={form.workingHours} onChange={e => setForm(prev => ({ ...prev, workingHours: e.target.value }))} className="input-field" placeholder="Mon - Sat: 9AM - 9PM" />
          </div>
        </div>
      </div>

      <div className="card p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">FormSubmit Email</label>
            <input
              value={form.formSubmitEmail}
              onChange={e => setForm(prev => ({ ...prev, formSubmitEmail: e.target.value }))}
              className="input-field"
              placeholder="orders@example.com"
            />
            <p className="mt-1 text-xs text-gray-500">Orders and contact messages will be forwarded here through FormSubmit.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Order Success Message</label>
            <textarea
              value={form.orderSuccessMessage}
              onChange={e => setForm(prev => ({ ...prev, orderSuccessMessage: e.target.value }))}
              className="input-field min-h-28 resize-y"
              placeholder="Thank you for your order! We will contact you shortly to confirm your order details."
            />
          </div>
        </div>
      </div>

      <div className="card p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Checkout Payment Methods</h2>
            <p className="mt-1 text-sm text-gray-500">Control COD and pay-now methods like Easypaisa, JazzCash, or bank transfer from here.</p>
          </div>
          <button type="button" onClick={addPaymentMethod} className="btn-secondary w-full sm:w-auto">
            <FiPlus className="mr-2 h-4 w-4" />
            Add Method
          </button>
        </div>

        <div className="space-y-4">
          {form.paymentMethods.map((method, index) => (
            <div key={`${method.code}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {method.label || `Payment Method ${index + 1}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {method.type === 'cod' ? 'Cash on Delivery' : 'Pay-now method shown in checkout'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm">
                    <input
                      type="checkbox"
                      checked={method.isActive}
                      onChange={(e) => updatePaymentMethod(index, 'isActive', e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    Active
                  </label>
                  <button
                    type="button"
                    onClick={() => removePaymentMethod(index)}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-red-600 shadow-sm hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={method.type === 'cod'}
                  >
                    <FiTrash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Label</label>
                  <input
                    value={method.label}
                    onChange={(e) => updatePaymentMethod(index, 'label', e.target.value)}
                    className="input-field"
                    placeholder="Easypaisa / JazzCash / Bank Transfer"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Code</label>
                  <input
                    value={method.code}
                    onChange={(e) => updatePaymentMethod(index, 'code', e.target.value)}
                    className="input-field"
                    placeholder="easypaisa"
                    disabled={method.type === 'cod'}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={method.type}
                    onChange={(e) => updatePaymentMethod(index, 'type', e.target.value)}
                    className="input-field"
                    disabled={method.type === 'cod'}
                  >
                    <option value="cod">Cash on Delivery</option>
                    <option value="wallet">Mobile Wallet</option>
                    <option value="bank">Bank Account</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Sort Order</label>
                  <input
                    type="number"
                    value={method.sortOrder}
                    onChange={(e) => updatePaymentMethod(index, 'sortOrder', Number(e.target.value) || 0)}
                    className="input-field"
                    min="0"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Account Title</label>
                  <input
                    value={method.accountTitle || ''}
                    onChange={(e) => updatePaymentMethod(index, 'accountTitle', e.target.value)}
                    className="input-field"
                    placeholder="Muhammad Ali"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Account Number</label>
                  <input
                    value={method.accountNumber || ''}
                    onChange={(e) => updatePaymentMethod(index, 'accountNumber', e.target.value)}
                    className="input-field"
                    placeholder="03XXXXXXXXX / 123456789"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">IBAN</label>
                  <input
                    value={method.iban || ''}
                    onChange={(e) => updatePaymentMethod(index, 'iban', e.target.value)}
                    className="input-field"
                    placeholder="PK00XXXX0000000000000000"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Checkout Instructions</label>
                  <textarea
                    value={method.instructions || ''}
                    onChange={(e) => updatePaymentMethod(index, 'instructions', e.target.value)}
                    className="input-field min-h-24 resize-y"
                    placeholder="Add the payment steps customers should follow."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} disabled={updateMutation.isPending} className="btn-primary w-full sm:w-auto">
        <FiSave className="mr-2 h-4 w-4" />
        {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
