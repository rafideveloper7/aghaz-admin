'use client';

import { useState } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { useOrders } from '@/hooks/useOrders';
import { formatPrice } from '@/lib/utils';
import { FiDownload } from 'react-icons/fi';
import * as XLSX from 'xlsx';

const COLORS = ['#eab308', '#3b82f6', '#a855f7', '#22c55e', '#ef4444'];

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');

  const { data: ordersData, isLoading } = useOrders({
    page: 1,
    limit: 1000,
    startDate,
    endDate,
  });

  const orders = ordersData?.data || [];

  const generateChartData = () => {
    const dates = eachDayOfInterval({ start: subDays(new Date(), days), end: new Date() });
    return dates.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayOrders = orders.filter(o => format(new Date(o.createdAt), 'yyyy-MM-dd') === dateStr);
      return {
        date: format(date, 'MMM dd'),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      };
    });
  };

  const generateStatusData = () => {
    const statusCounts: Record<string, number> = {};
    orders.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  };

  const handleExport = () => {
    const data = orders.map(o => ({
      'Order ID': o._id,
      'Customer': o.customerName,
      'Phone': o.phone,
      'City': o.city,
      'Total (PKR)': o.totalAmount,
      'Status': o.status,
      'Date': new Date(o.createdAt).toLocaleDateString(),
      'Items': o.products.length,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, `orders-export-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const orderData = generateChartData();
  const statusData = generateStatusData();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Orders and revenue insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            className="input-field w-auto"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={handleExport} className="btn-secondary">
            <FiDownload className="mr-2 h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-6 h-80 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-40 mb-4" />
              <div className="h-full bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Line charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders Over Time</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={orderData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={orderData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={v => `PKR ${v}`} />
                    <Tooltip formatter={(value: number) => formatPrice(value)} />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Status distribution */}
          {statusData.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h2>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(orders.reduce((s, o) => s + o.totalAmount, 0))}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.length ? formatPrice(orders.reduce((s, o) => s + o.totalAmount, 0) / orders.length) : 'PKR 0'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{orders.filter(o => o.status === 'pending').length}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
