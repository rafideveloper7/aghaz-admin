'use client';

import { useMemo, useState } from 'react';
import { FiClock, FiMail, FiPhone, FiSearch, FiTrash2, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useContactMessages, useDeleteContactMessage } from '@/hooks/useContactMessages';

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function MessagesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const limit = 10;

  const { data, isLoading } = useContactMessages({ page, limit, search });
  const deleteMutation = useDeleteContactMessage();

  const messages = data?.data || [];
  const pagination = data?.pagination;
  const deleteLabel = useMemo(
    () => messages.find((message) => message._id === deleteId)?.name || 'this message',
    [deleteId, messages]
  );

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Message deleted successfully');
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete message');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
        <p className="text-sm text-gray-500">Messages are kept for 7 days, then removed automatically from the database.</p>
      </div>

      <div className="card p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search messages"
            className="input-field pl-9"
          />
        </div>
      </div>

      <div className="space-y-4">
        {isLoading && Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="card p-4 sm:p-5 animate-pulse">
            <div className="h-5 w-40 rounded bg-gray-200" />
            <div className="mt-4 h-4 w-56 rounded bg-gray-200" />
            <div className="mt-2 h-4 w-full rounded bg-gray-200" />
            <div className="mt-2 h-4 w-4/5 rounded bg-gray-200" />
          </div>
        ))}

        {!isLoading && messages.length === 0 && (
          <div className="card p-12 text-center">
            <FiMail className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm text-gray-500">No messages found.</p>
          </div>
        )}

        {!isLoading && messages.map((message) => (
          <div key={message._id} className="card p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
                    <FiUser className="h-4 w-4" />
                    {message.name}
                  </div>
                  <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                    <FiClock className="h-4 w-4" />
                    {formatDateTime(message.createdAt)}
                  </div>
                </div>

                <div className="grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FiMail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{message.email}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <FiPhone className="h-4 w-4 shrink-0" />
                    <span className="truncate">{message.phone || 'No phone provided'}</span>
                  </div>
                </div>

                {message.subject && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Subject</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{message.subject}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Message</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-700">{message.message}</p>
                </div>

                <p className="text-xs text-gray-400">Auto deletes on {formatDateTime(message.expiresAt)}</p>
              </div>

              <button onClick={() => setDeleteId(message._id)} className="btn-danger w-full sm:w-auto">
                <FiTrash2 className="mr-2 h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.pages}
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

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Message"
        message={`Are you sure you want to delete ${deleteLabel}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        variant="danger"
      />
    </div>
  );
}
