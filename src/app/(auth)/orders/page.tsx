'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiEye, FiSearch, FiFilter, FiTrash2 } from 'react-icons/fi';
import { useOrders, useDeleteOrder } from '@/hooks/useOrders';
import { formatPrice, formatDate } from '@/lib/utils';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const limit = 15;

  const { data: ordersData, isLoading } = useOrders({ page, limit, status, search });
  const deleteMutation = useDeleteOrder();
  const orders = ordersData?.data || [];
  const pagination = ordersData?.pagination;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Order deleted successfully');
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete order');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">Manage customer orders</p>
        </div>
      </div>

      <div className="card mb-6 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or phone..."
              className="input-field pl-9"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="input-field w-full sm:w-48"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="card p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-center gap-4 animate-pulse">
              <div className="h-10 w-32 rounded bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-gray-200" />
                <div className="h-3 w-24 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <FiFilter className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 md:hidden">
            {orders.map((order) => (
              <div key={order._id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-mono font-medium text-gray-900">#{order._id.slice(-6).toUpperCase()}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-500">{order.phone}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">City</p>
                    <p className="mt-1 text-gray-700">{order.city}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Total</p>
                    <p className="mt-1 font-semibold text-gray-900">{formatPrice(order.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Items</p>
                    <p className="mt-1 text-gray-700">{order.products.length} item(s)</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Date</p>
                    <p className="mt-1 text-gray-700">{formatDate(order.createdAt)}</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link href={`/orders/${order._id}`} className="btn-secondary flex-1">
                    <FiEye className="mr-2 h-4 w-4" />
                    View
                  </Link>
                  <button onClick={() => setDeleteId(order._id)} className="btn-danger flex-1">
                    <FiTrash2 className="mr-2 h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                    <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 lg:table-cell">City</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                    <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr key={order._id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-mono font-medium text-gray-900">#{order._id.slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-gray-500">{order.products.length} item(s)</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.phone}</p>
                      </td>
                      <td className="hidden px-6 py-4 lg:table-cell">
                        <span className="text-sm text-gray-600">{order.city}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">{formatPrice(order.totalAmount)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="hidden px-6 py-4 sm:table-cell">
                        <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/orders/${order._id}`}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                            title="View"
                          >
                            <FiEye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(order._id)}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Delete"
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
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="card flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        variant="danger"
      />
    </div>
  );
}
