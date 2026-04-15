'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiHome,
  FiPackage,
  FiShoppingCart,
  FiFolder,
  FiBarChart2,
  FiLogOut,
  FiMenu,
  FiX,
  FiImage,
  FiBell,
  FiSettings,
  FiShare2,
} from 'react-icons/fi';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: FiHome },
  { label: 'Products', href: '/products', icon: FiPackage },
  { label: 'Orders', href: '/orders', icon: FiShoppingCart },
  { label: 'Categories', href: '/categories', icon: FiFolder },
  { label: 'Hero Slides', href: '/hero', icon: FiImage },
  { label: 'Announcement', href: '/announcement', icon: FiBell },
  { label: 'Footer Social', href: '/footer-social', icon: FiShare2 },
  { label: 'Settings', href: '/settings', icon: FiSettings },
  { label: 'Analytics', href: '/analytics', icon: FiBarChart2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    // Clear the auth cookie
    document.cookie = 'aghaz-admin-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    logout();
    window.location.href = '/login';
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-lighter">
        <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        <div>
          <h1 className="text-white font-semibold text-base">AGHAZ</h1>
          <p className="text-gray-500 text-[10px] uppercase tracking-wider">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-sidebar-light hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-lighter px-3 py-4">
        <div className="mb-3 px-3">
          <p className="text-white text-sm font-medium truncate">{user?.email}</p>
          <p className="text-gray-500 text-xs capitalize">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-sidebar-light hover:text-white transition-colors"
        >
          <FiLogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 rounded-lg bg-white p-2 shadow-md lg:hidden hover:bg-gray-50 transition-colors"
        aria-label="Open menu"
      >
        <FiMenu className="h-5 w-5 text-gray-700" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-sidebar min-h-0">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      {mobileOpen && (
        <motion.div
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
        >
          <div className="flex flex-col flex-1 bg-sidebar min-h-0 shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <FiX className="h-5 w-5" />
            </button>
            <SidebarContent />
          </div>
        </motion.div>
      )}
    </>
  );
}
