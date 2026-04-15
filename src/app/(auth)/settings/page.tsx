'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { FiUpload, FiSave, FiX } from 'react-icons/fi';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { uploadApi } from '@/lib/api';

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
      });
    }
  }, [settings]);

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
        <p className="text-gray-500 text-sm mt-1">Manage logo, contact info, and social links</p>
      </div>

      {/* Logo */}
      <div className="card p-6">
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
      <div className="card p-6">
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
        </div>
      </div>

      <button onClick={handleSave} disabled={updateMutation.isPending} className="btn-primary">
        <FiSave className="mr-2 h-4 w-4" />
        {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
