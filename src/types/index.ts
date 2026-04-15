export interface User {
  _id?: string;
  email: string;
  role: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  productCount?: number;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  videoUrl?: string;
  category: string | Category;
  tags: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  views: number;
  sales: number;
  faqs: { question: string; answer: string }[];
  benefits: string[];
  createdAt: string;
}

export interface OrderProduct {
  product: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  _id: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  products: OrderProduct[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  totalRevenue: number;
  ordersByStatus: Record<string, number>;
  topProducts: { title: string; sales: number; revenue: number }[];
  recentOrders: Order[];
}

export interface HeroSlide {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobileBg?: string;
  desktopBg?: string;
  ctaText: string;
  ctaLink: string;
  mobileTitle?: string;
  mobileSubtitle?: string;
  mobileCtaText?: string;
  mobileCtaLink?: string;
  desktopTitle?: string;
  desktopSubtitle?: string;
  desktopCtaText?: string;
  desktopCtaLink?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  _id: string;
  text: string;
  bgColor: string;
  textColor: string;
  link?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  _id: string;
  logo: string;
  logoWidth: number;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  whatsappNumber: string;
}

export interface FooterSocial {
  _id: string;
  platform: string;
  label: string;
  url: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
