'use client';

import Link from 'next/link';
import { FiEye } from 'react-icons/fi';
import type { Order } from '@/types';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';

export default function RecentOrders({ orders }: { orders: Order[] }) {
  if (!orders.length) {
    return (
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="p-8 text-center">
          <p className="text-gray-500">No orders yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        <Link href="/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          View all
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Order</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Customer</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Total</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.slice(0, 10).map(order => (
              <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900">#{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900">{order.customerName}</p>
                  <p className="text-xs text-gray-500">{order.phone}</p>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <p className="text-sm font-medium text-gray-900">{formatPrice(order.totalAmount)}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/orders/${order._id}`} className="text-primary-600 hover:text-primary-700">
                    <FiEye className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
