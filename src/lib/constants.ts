export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const ORDER_STATUS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export const PAGE_SIZE_OPTIONS = [10, 25, 50];
export const DEFAULT_PAGE_SIZE = 10;

export const SIDEBAR_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'FiHome' },
  { label: 'Products', href: '/products', icon: 'FiPackage' },
  { label: 'Orders', href: '/orders', icon: 'FiShoppingCart' },
  { label: 'Categories', href: '/categories', icon: 'FiFolder' },
  { label: 'Analytics', href: '/analytics', icon: 'FiBarChart2' },
] as const;
