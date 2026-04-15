'use client';

import { useState } from 'react';
import { FiShoppingCart, FiClock, FiCheckCircle, FiDollarSign } from 'react-icons/fi';
import { useDashboardStats } from '@/hooks/useOrders';
import { formatPrice } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import type { DashboardStats } from '@/types';
import RecentOrders from '@/components/dashboard/RecentOrders';
import DashboardChart from '@/components/dashboard/DashboardChart';
import TopProducts from '@/components/analytics/TopProducts';

const statCards = [
  { key: 'totalOrders', label: 'Total Orders', icon: FiShoppingCart, color: 'bg-blue-500' },
  { key: 'pendingOrders', label: 'Pending Orders', icon: FiClock, color: 'bg-yellow-500' },
  { key: 'confirmedOrders', label: 'Confirmed', icon: FiCheckCircle, color: 'bg-green-500' },
  { key: 'totalRevenue', label: 'Total Revenue', icon: FiDollarSign, color: 'bg-primary-500' },
];

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>(() => ({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  }));

  const { data: stats, isLoading } = useDashboardStats(dateRange);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of your store performance</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={e => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="input-field w-auto"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={e => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="input-field w-auto"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-20 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(card => {
            const value = stats?.[card.key as keyof DashboardStats];
            const displayValue = card.key === 'totalRevenue' ? formatPrice(value as number || 0) : (value as number || 0);
            return (
              <div key={card.key} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <div className={`h-9 w-9 rounded-lg ${card.color} bg-opacity-10 flex items-center justify-center`}>
                    <card.icon className={`h-5 w-5 ${card.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{displayValue}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <DashboardChart ordersByStatus={stats?.ordersByStatus} />
        </div>
        <div>
          <TopProducts topProducts={stats?.topProducts} />
        </div>
      </div>

      <RecentOrders orders={stats?.recentOrders || []} />
    </div>
  );
}
