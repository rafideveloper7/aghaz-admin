'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CELL_COLORS = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444'];

interface TopProduct {
  title: string;
  sales: number;
  revenue: number;
}

export default function TopProducts({ topProducts }: { topProducts?: TopProduct[] }) {
  const products = topProducts || [];

  if (!products.length) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h2>
        <div className="h-48 flex items-center justify-center">
          <p className="text-gray-500 text-sm">No data available</p>
        </div>
      </div>
    );
  }

  const data = products.slice(0, 5).map(p => ({
    name: p.title.length > 20 ? p.title.slice(0, 20) + '...' : p.title,
    sales: p.sales,
  }));

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Sales</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} width={120} />
            <Tooltip />
            <Bar dataKey="sales" radius={[0, 6, 6, 0]} barSize={24}>
              {data.map((_, i) => (
                <Cell key={i} fill={CELL_COLORS[i] || '#6b7280'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
