'use client';

import { useMemo, useState } from 'react';
import { FiStar, FiSearch, FiCheckCircle, FiXCircle, FiTrash2, FiImage, FiEye, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useReviews, useApproveReview, useDeleteReview } from '@/hooks/useReviews';
import { cn } from '@/lib/utils';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const limit = 10;

  const { data, isLoading } = useReviews({ page, limit, approved: filter === 'all' ? undefined : filter === 'approved' });
  const approveMutation = useApproveReview();
  const deleteMutation = useDeleteReview();

  const reviews = useMemo(() => data?.reviews || [], [data]);
  const pagination = data?.pagination;

  const filteredReviews = useMemo(() => {
    if (!search) return reviews;
    const searchLower = search.toLowerCase();
    return reviews.filter(
      (review) =>
        review.name.toLowerCase().includes(searchLower) ||
        review.product?.title?.toLowerCase().includes(searchLower)
    );
  }, [reviews, search]);

  const handleApprove = async (id: string, currentStatus: boolean) => {
    try {
      await approveMutation.mutateAsync({ id, approved: !currentStatus });
      toast.success(`Review ${currentStatus ? 'unapproved' : 'approved'}`);
    } catch {
      toast.error('Failed to update review');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Review deleted');
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
        <p className="text-sm text-gray-500">Manage and moderate customer reviews for products.</p>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search reviews by name or product..."
              className="input-field pl-9"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'approved'] as const).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setPage(1);
                }}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                  filter === f
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="card overflow-hidden p-0">
        {isLoading && (
          <div className="space-y-4 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-gray-200" />
                    <div className="h-3 w-48 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredReviews.length === 0 && (
          <div className="p-12 text-center">
            <FiStar className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm text-gray-500">No reviews found.</p>
          </div>
        )}

        {!isLoading && (
          <div className="divide-y divide-gray-100">
            {filteredReviews.map((review) => (
              <div key={review._id} className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {/* Review image if any */}
                {review.image && (
                  <button
                    onClick={() => setPreviewImage(review.image || null)}
                    className="h-10 w-10 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition-opacity"
                  >
                    <img src={review.image} alt="Review" className="h-full w-full object-cover" />
                  </button>
                )}
                <div>
                  <p className="font-semibold text-gray-900 truncate max-w-[200px]">{review.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium text-gray-900 truncate max-w-[180px]">{review.product?.title || 'Unknown Product'}</span>
                    <span>•</span>
                    <span>{formatDate(review.createdAt)}</span>
                  </div>
                </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            size={14}
                            className={star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      {review.verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 text-[10px] font-medium text-primary-600">
                          Verified
                        </span>
                      )}
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium',
                          review.approved
                            ? 'bg-green-50 text-green-600'
                            : 'bg-amber-50 text-amber-600'
                        )}
                      >
                        {review.approved ? <FiCheckCircle size={10} /> : <FiXCircle size={10} />}
                        {review.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                  </div>

                  <div className="flex flex-col gap-2 mt-2 sm:mt-0">
                    {!review.approved && (
                      <button
                        onClick={() => handleApprove(review._id, false)}
                        disabled={approveMutation.isPending}
                        className="btn-success btn-sm flex items-center justify-center gap-1.5"
                      >
                        <FiCheckCircle size={14} />
                        Approve
                      </button>
                    )}
                    {review.approved && (
                      <button
                        onClick={() => handleApprove(review._id, true)}
                        disabled={approveMutation.isPending}
                        className="btn-secondary btn-sm flex items-center justify-center gap-1.5"
                      >
                        <FiXCircle size={14} />
                        Unapprove
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteId(review._id)}
                      className="btn-danger btn-sm flex items-center justify-center gap-1.5"
                    >
                      <FiTrash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={pagination.page <= 1}
              className="btn-secondary flex-1 sm:flex-none"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((current) => Math.min(pagination.pages, current + 1))}
              disabled={pagination.page >= pagination.pages}
              className="btn-secondary flex-1 sm:flex-none"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Image Preview Dialog */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <FiX size={24} />
            </button>
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        variant="danger"
      />
    </div>
  );
}
