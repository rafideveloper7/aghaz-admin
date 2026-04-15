'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  trend?: string;
}

export default function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center', color)}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
    </div>
  );
}
