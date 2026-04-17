'use client';

import { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCopy, FiPhone, FiMapPin, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import { useOrder, useUpdateOrderStatus } from '@/hooks/useOrders';
import { formatPrice, formatDate, copyToClipboard, getStatusColor } from '@/lib/utils';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import { ORDER_STATUS } from '@/lib/constants';

export default function OrderDetail({ id }: { id: string }) {
  const { data: orderData, isLoading } = useOrder(id);
  const updateMutation = useUpdateOrderStatus();
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

  const order = orderData?.data;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-gray-200 rounded-xl" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-12 text-gray-500">Order not found</div>;
  }

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success(`${label} copied to clipboard`);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    try {
      await updateMutation.mutateAsync({ id: order._id, status: newStatus, notes: notes || undefined });
      toast.success('Order status updated');
      setNewStatus('');
      setNotes('');
    } catch {
      toast.error('Failed to update order status');
    }
  };

  const CopyField = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
    <div className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg group">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
      </div>
      <button
        onClick={() => handleCopy(value, label)}
        className="p-2 rounded-lg bg-white shadow-sm opacity-0 group-hover:opacity-100 hover:bg-primary-50 hover:text-primary-600 transition-all flex-shrink-0"
        title={`Copy ${label.toLowerCase()}`}
      >
        <FiCopy className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/orders" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <FiArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order._id.slice(-6).toUpperCase()}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-gray-500 text-sm mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Products</h2>
            <div className="space-y-3">
              {order.products.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="h-16 w-16 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-gray-100">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} width={64} height={64} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-300">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-base font-semibold text-gray-900">Total Amount</span>
              <span className="text-xl font-bold text-primary-600">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
              <p className="text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg border border-yellow-100">{order.notes}</p>
            </div>
          )}

          <div className="card p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Payment</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <CopyField label="Method" value={order.paymentMethod?.label || 'Cash on Delivery'} />
              <CopyField label="Payment Status" value={order.paymentStatus || 'unpaid'} />
              {order.paymentDetails?.accountTitle ? (
                <CopyField label="Account Title" value={order.paymentDetails.accountTitle} />
              ) : null}
              {order.paymentDetails?.accountNumber ? (
                <CopyField label="Account Number" value={order.paymentDetails.accountNumber} />
              ) : null}
              {order.paymentDetails?.iban ? (
                <CopyField label="IBAN" value={order.paymentDetails.iban} />
              ) : null}
              {order.paymentDetails?.paymentReference ? (
                <CopyField label="Reference" value={order.paymentDetails.paymentReference} />
              ) : null}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h2>
            <div className="space-y-3">
              <CopyField
                label="Full Name"
                value={order.customerName}
                icon={<FiUser />}
              />
              <CopyField
                label="Phone Number"
                value={order.phone}
                icon={<FiPhone />}
              />
              <CopyField
                label="City"
                value={order.city}
                icon={<FiMapPin />}
              />
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Full Address</p>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900">{order.address}</p>
                  <button
                    onClick={() => handleCopy(order.address, 'Address')}
                    className="p-2 rounded-lg bg-white shadow-sm hover:bg-primary-50 hover:text-primary-600 transition-all flex-shrink-0"
                  >
                    <FiCopy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>
            <div className="space-y-3">
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="input-field"
              >
                <option value="">Select new status</option>
                {ORDER_STATUS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add a note (optional)"
                rows={3}
                className="input-field resize-none"
              />
              <button
                onClick={handleStatusUpdate}
                disabled={!newStatus || updateMutation.isPending}
                className="btn-primary w-full disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
