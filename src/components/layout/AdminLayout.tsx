'use client';

import Sidebar from './Sidebar';
import { type ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="min-h-screen lg:pl-64">
        <div className="max-w-full overflow-x-hidden px-4 pb-8 pt-20 sm:px-6 lg:px-8 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
