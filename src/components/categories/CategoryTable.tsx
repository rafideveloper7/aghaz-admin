'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiFilter } from 'react-icons/fi';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Modal from '@/components/common/Modal';

export default function CategoriesPage() {
  const { data: categoriesData, isLoading } = useCategories(true);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const categories = categoriesData?.data || [];

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setShowModal(true);
  };

  const openEdit = (id: string, currentName: string, currentDesc: string) => {
    setEditingId(id);
    setName(currentName);
    setDescription(currentDesc);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const data = { name: name.trim(), description: description.trim() || undefined };
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
        toast.success('Category updated');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Category created');
      }
      setShowModal(false);
    } catch {
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Category deleted');
      setDeleteId(null);
    } catch (error: unknown) {
      toast.error('Cannot delete category with existing products');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Manage product categories</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <FiPlus className="mr-2 h-4 w-4" />
          Add Category
        </button>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-10 bg-gray-200 rounded w-48" />
                <div className="flex-1 h-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <FiFilter className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500">No categories found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Slug</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Products</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.map(cat => (
                  <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                      {cat.description && <p className="text-xs text-gray-500 truncate max-w-xs">{cat.description}</p>}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{cat.slug}</code>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{cat.productCount || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(cat._id, cat.name, cat.description || '')}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(cat._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Category' : 'Add Category'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field"
              placeholder="Category name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="input-field resize-none"
              rows={3}
              placeholder="Optional description"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="btn-primary flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingId ? 'Update' : 'Create'}
            </button>
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Category"
        message="Are you sure? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        variant="danger"
      />
    </div>
  );
}
