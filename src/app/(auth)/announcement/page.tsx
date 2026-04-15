'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import { 
  useAnnouncements, 
  useCreateAnnouncement, 
  useUpdateAnnouncement, 
  useDeleteAnnouncement,
  useToggleAnnouncement 
} from '@/hooks/useAnnouncements';
import type { Announcement } from '@/types';
import ConfirmDialog from '@/components/common/ConfirmDialog';

export default function AnnouncementPage() {
  const { data: announcementsData, isLoading } = useAnnouncements();
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const toggleMutation = useToggleAnnouncement();

  const announcements = announcementsData?.data || [];

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    text: '',
    bgColor: '#10b981',
    textColor: '#ffffff',
    link: '',
    isActive: true,
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ text: '', bgColor: '#10b981', textColor: '#ffffff', link: '', isActive: true });
    setShowModal(true);
  };

  const handleOpenEdit = (a: Announcement) => {
    setEditingId(a._id);
    setForm({
      text: a.text,
      bgColor: a.bgColor,
      textColor: a.textColor,
      link: a.link || '',
      isActive: a.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.text.trim()) {
      toast.error('Text is required');
      return;
    }
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: form });
        toast.success('Announcement updated');
      } else {
        await createMutation.mutateAsync(form);
        toast.success('Announcement created');
      }
      setShowModal(false);
    } catch {
      toast.error('Failed to save announcement');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Announcement deleted');
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete announcement');
    }
  };

  const handleToggle = async (a: Announcement) => {
    try {
      await toggleMutation.mutateAsync(a._id);
    } catch {
      toast.error('Failed to update announcement');
    }
  };

  const colorPresets = [
    { bg: '#10b981', text: '#ffffff', label: 'Emerald' },
    { bg: '#ef4444', text: '#ffffff', label: 'Red' },
    { bg: '#3b82f6', text: '#ffffff', label: 'Blue' },
    { bg: '#f59e0b', text: '#000000', label: 'Amber' },
    { bg: '#8b5cf6', text: '#ffffff', label: 'Purple' },
    { bg: '#000000', text: '#ffffff', label: 'Black' },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcement Bar</h1>
          <p className="text-gray-500 text-sm mt-1">Manage the sales bar above the header</p>
        </div>
        <button onClick={handleOpenCreate} className="btn-primary">
          <FiPlus className="mr-2 h-4 w-4" />
          Add Announcement
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : !announcements?.length ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500 mb-4">No announcements yet</p>
          <button onClick={handleOpenCreate} className="btn-primary">
            <FiPlus className="mr-2 h-4 w-4" />
            Add Your First Announcement
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a: Announcement) => (
            <div key={a._id} className="card p-4">
              {/* Preview - Full Width */}
              <div className="mb-4">
                <div className="rounded-lg overflow-hidden shadow-sm" style={{ backgroundColor: a.bgColor }}>
                  <div className="py-3 px-4 text-center text-sm font-medium" style={{ color: a.textColor }}>
                    {a.text}
                    {a.link && <span className="ml-2">→</span>}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${a.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {a.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded border border-gray-300" style={{ backgroundColor: a.bgColor }} />
                    <span className="text-xs text-gray-500 font-mono">{a.bgColor}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleToggle(a)} 
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors" 
                    title={a.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {a.isActive ? <FiEye className="h-4 w-4 text-green-600" /> : <FiEyeOff className="h-4 w-4 text-gray-400" />}
                  </button>
                  <button 
                    onClick={() => handleOpenEdit(a)} 
                    className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setDeleteId(a._id)} 
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
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
              <h3 className="text-lg font-semibold">{editingId ? 'Edit' : 'Add'} Announcement</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><FiX className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Text *</label>
                <input value={form.text} onChange={e => setForm(p => ({ ...p, text: e.target.value }))} className="input-field" placeholder="Free shipping on orders above Rs. 2000!" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Link (optional)</label>
                <input value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} className="input-field" placeholder="/deals" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color Presets</label>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => setForm(prev => ({ ...prev, bgColor: preset.bg, textColor: preset.text }))}
                      className={`h-10 px-4 rounded-lg text-xs font-medium transition-all ${form.bgColor === preset.bg ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                      style={{ backgroundColor: preset.bg, color: preset.text }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Custom BG Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.bgColor} onChange={e => setForm(p => ({ ...p, bgColor: e.target.value }))} className="h-10 w-10 rounded border cursor-pointer" />
                    <input value={form.bgColor} onChange={e => setForm(p => ({ ...p, bgColor: e.target.value }))} className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Custom Text Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.textColor} onChange={e => setForm(p => ({ ...p, textColor: e.target.value }))} className="h-10 w-10 rounded border cursor-pointer" />
                    <input value={form.textColor} onChange={e => setForm(p => ({ ...p, textColor: e.target.value }))} className="input-field" />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Preview</label>
                <div className="rounded-lg overflow-hidden" style={{ backgroundColor: form.bgColor }}>
                  <div className="py-2 px-4 text-center text-sm font-medium" style={{ color: form.textColor }}>
                    {form.text || 'Your announcement text'}
                    {form.link && ' →'}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} className="btn-primary flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                </button>
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Announcement"
        message="Are you sure? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        variant="danger"
      />
    </div>
  );
}
