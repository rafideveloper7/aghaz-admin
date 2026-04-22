'use client';

import { useState } from 'react';
import { FiImage, FiTrash2, FiSearch, FiFolder, FiExternalLink, FiCheckSquare, FiSquare, FiBarChart2, FiHardDrive, FiInbox, FiCheckCircle, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useImages, useImageStats, useDeleteImage, useBulkDeleteImages } from '@/hooks/useImages';
import { cn } from '@/lib/utils';

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function ImagesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('aghaz');
  const [usageFilter, setUsageFilter] = useState<'all' | 'used' | 'unused'>('all');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const limit = 20;

  const { data, isLoading } = useImages({ folder, page, limit, usage: usageFilter });
  const { data: statsData, isLoading: statsLoading } = useImageStats();
  const deleteMutation = useDeleteImage();
  const bulkDeleteMutation = useBulkDeleteImages();

  const images = data?.files || [];
  const pagination = data?.pagination;
  const stats = statsData?.data;

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 0;

  const filteredImages = images.filter(img =>
    img.name?.toLowerCase().includes(search.toLowerCase()) ||
    img.fileId?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (fileId: string) => {
    setSelectedImages(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedImages.length === filteredImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(filteredImages.map(img => img.fileId));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Image deleted');
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete image');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) return;
    try {
      await bulkDeleteMutation.mutateAsync(selectedImages);
      toast.success(`${selectedImages.length} images deleted`);
      setSelectedImages([]);
    } catch {
      toast.error('Failed to delete images');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Image Library</h1>
        <p className="text-sm text-gray-500">Manage images uploaded to ImageKit. Delete unused images to free storage.</p>
      </div>

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FiImage className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalImages}</p>
                <p className="text-xs text-gray-500">Total Images</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <FiCheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.usedImages}</p>
                <p className="text-xs text-gray-500">In Use</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <FiInbox className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.unusedImages}</p>
                <p className="text-xs text-gray-500">Unused</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FiHardDrive className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 truncate">{formatBytes(stats.totalSize)}</p>
                <p className="text-xs text-gray-500">Total Size</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiCheckCircle className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 truncate">{formatBytes(stats.usedSize || 0)}</p>
                <p className="text-xs text-gray-500">Used Size</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <FiInbox className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 truncate">{formatBytes(stats.unusedSize || 0)}</p>
                <p className="text-xs text-gray-500">Unused Size</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats loading skeleton */}
      {statsLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-200 rounded-lg w-10 h-10" />
                <div className="space-y-2">
                  <div className="h-6 w-12 bg-gray-200 rounded" />
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or file ID..."
              className="input-field pl-9"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2 flex-wrap">
              {(['all', 'used', 'unused'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setUsageFilter(f);
                    setPage(1);
                  }}
                  className={cn(
                    'px-3 py-2 rounded-lg text-xs font-medium transition-colors capitalize flex items-center gap-1.5',
                    usageFilter === f
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {f === 'all' && <FiImage size={12} />}
                  {f === 'used' && <FiCheckCircle size={12} />}
                  {f === 'unused' && <FiClock size={12} />}
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === 'used' && stats && ` (${stats.usedImages})`}
                  {f === 'unused' && stats && ` (${stats.unusedImages})`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <FiFolder className="text-gray-400" />
              <select
                value={folder}
                onChange={(e) => {
                  setFolder(e.target.value);
                  setPage(1);
                }}
                className="input-field w-auto text-sm"
              >
                <option value="aghaz">aghaz</option>
                <option value="aghaz/products">aghaz/products</option>
                <option value="aghaz/categories">aghaz/categories</option>
                <option value="aghaz/slides">aghaz/slides</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedImages.length > 0 && (
        <div className="card bg-primary-50 border-primary-200 p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-primary-700">
            {selectedImages.length} image(s) selected
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleteMutation.isPending}
            className="btn-danger btn-sm"
          >
            <FiTrash2 size={14} />
            Delete Selected
          </button>
        </div>
      )}

      {/* Images Grid */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg" />
              <div className="mt-2 h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredImages.length === 0 && (
        <div className="card p-12 text-center">
          <FiImage className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-sm text-gray-500">No images found matching your criteria.</p>
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.fileId}
              className={cn(
                'group relative rounded-lg overflow-hidden border-2 transition-all',
                selectedImages.includes(image.fileId)
                  ? 'border-primary-500 ring-2 ring-primary-200'
                  : image.isUsed
                    ? 'border-transparent hover:border-green-300'
                    : 'border-transparent hover:border-red-300'
              )}
            >
              {/* Usage Badge */}
              <div className="absolute top-2 left-2 z-10">
                <span
                  className={cn(
                    'px-2 py-0.5 text-[10px] font-medium rounded-full',
                    image.isUsed
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  )}
                >
                  {image.isUsed ? 'Used' : 'Unused'}
                </span>
              </div>

              {/* Select Checkbox */}
              <div className="absolute right-2 top-2 z-10">
                <button
                  type="button"
                  onClick={() => handleSelect(image.fileId)}
                  className="p-1 bg-white/90 rounded hover:bg-white transition-colors"
                >
                  {selectedImages.includes(image.fileId) ? (
                    <FiCheckSquare className="text-primary-600" size={20} />
                  ) : (
                    <FiSquare className="text-gray-600" size={20} />
                  )}
                </button>
              </div>

              {/* Image Preview */}
              <div
                className="aspect-square bg-gray-100 cursor-pointer"
                onClick={() => setPreviewImage(image.url)}
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => window.open(image.url, '_blank')}
                  className="p-2 bg-white rounded-full hover:bg-gray-100"
                  title="Open in new tab"
                >
                  <FiExternalLink size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(image.fileId)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  title="Delete"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>

              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs truncate">{image.name}</p>
                <p className="text-gray-300 text-[10px] truncate">
                  {(image.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {totalPages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              className="btn-secondary flex-1 sm:flex-none"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={pagination.page >= totalPages}
              className="btn-secondary flex-1 sm:flex-none"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-5xl max-h-[95vh]">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <FiSquare size={32} className="mx-auto" />
            </button>
            <img src={previewImage} alt="Full preview" className="max-w-full max-h-[95vh] object-contain rounded-lg" />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        variant="danger"
      />
    </div>
  );
}
