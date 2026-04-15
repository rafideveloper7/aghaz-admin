'use client';

import Sidebar from './Sidebar';
import { type ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
