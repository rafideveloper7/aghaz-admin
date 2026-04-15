'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiX, FiExternalLink } from 'react-icons/fi';
import { useFooterSocial, useCreateFooterSocial, useUpdateFooterSocial, useDeleteFooterSocial } from '@/hooks/useFooterSocial';
import type { FooterSocial } from '@/types';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const PLATFORM_OPTIONS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

export default function FooterSocialPage() {
  const { data: links = [], isLoading } = useFooterSocial(true);
  const createMutation = useCreateFooterSocial();
  const updateMutation = useUpdateFooterSocial();
  const deleteMutation = useDeleteFooterSocial();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ platform: 'facebook', label: '', url: '', isActive: true });

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ platform: 'facebook', label: '', url: '', isActive: true });
    setShowModal(true);
  };

  const handleOpenEdit = (link: FooterSocial) => {
    setEditingId(link._id);
    setForm({ platform: link.platform, label: link.label, url: link.url, isActive: link.isActive });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.url.trim()) {
      toast.error('URL is required');
      return;
    }
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: form });
        toast.success('Link updated');
      } else {
        await createMutation.mutateAsync(form);
        toast.success('Link created');
      }
      setShowModal(false);
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Link deleted');
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const toggleActive = async (link: FooterSocial) => {
    try {
      await updateMutation.mutateAsync({ id: link._id, data: { isActive: !link.isActive } });
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Footer Social Links</h1>
          <p className="text-gray-500 text-sm mt-1">Manage social media icons in the footer</p>
        </div>
        <button onClick={handleOpenCreate} className="btn-primary">
          <FiPlus className="mr-2 h-4 w-4" />
          Add Link
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4 animate-pulse flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-3 bg-gray-200 rounded w-48" />
              </div>
            </div>
          ))}
        </div>
      ) : links.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500 mb-4">No social links yet</p>
          <button onClick={handleOpenCreate} className="btn-primary">
            <FiPlus className="mr-2 h-4 w-4" />
            Add Your First Link
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map(link => (
            <div key={link._id} className="card p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg font-bold capitalize">
                {link.platform[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 capitalize">{link.platform} {link.label && `- ${link.label}`}</p>
                <p className="text-xs text-gray-500 truncate">{link.url}</p>
              </div>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${link.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {link.isActive ? 'Active' : 'Inactive'}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleActive(link)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  {link.isActive ? <FiEye className="h-4 w-4 text-green-600" /> : <FiEyeOff className="h-4 w-4 text-gray-400" />}
                </button>
                <button onClick={() => handleOpenEdit(link)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50">
                  <FiEdit2 className="h-4 w-4" />
                </button>
                <button onClick={() => setDeleteId(link._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">{editingId ? 'Edit Link' : 'Add Link'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><FiX className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Platform</label>
                <select value={form.platform} onChange={e => setForm(prev => ({ ...prev, platform: e.target.value }))} className="input-field">
                  {PLATFORM_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Label (optional)</label>
                <input value={form.label} onChange={e => setForm(prev => ({ ...prev, label: e.target.value }))} className="input-field" placeholder="My Page" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">URL *</label>
                <input value={form.url} onChange={e => setForm(prev => ({ ...prev, url: e.target.value }))} className="input-field" placeholder="https://facebook.com/..." />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
                <label htmlFor="isActive" className="text-sm font-medium">Active</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} className="btn-primary flex-1">{editingId ? 'Update' : 'Create'}</button>
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="Delete Link" message="Are you sure?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} variant="danger" />
    </div>
  );
}
