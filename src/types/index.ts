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
  isHot: boolean;
  isDeal: boolean;
  isOffer: boolean;
  isNewArrival: boolean;
  sortOrder: number;
  views: number;
  sales: number;
  faqs: { question: string; answer: string }[];
  benefits: string[];
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  product: { _id: string; title: string; slug: string };
  name: string;
  rating: number;
  comment: string;
  image?: string;
  verified: boolean;
  approved: boolean;
  helpful: number;
  createdAt: string;
  updatedAt: string;
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
  paymentMethod: {
    code: string;
    label: string;
    type: 'cod' | 'wallet' | 'bank' | 'other';
  };
  paymentDetails?: {
    accountTitle?: string;
    accountNumber?: string;
    iban?: string;
    paymentReference?: string;
  };
  paymentStatus: 'unpaid' | 'awaiting_verification' | 'paid';
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
  rightSideMediaType?: 'image' | 'video' | 'gif' | 'card' | 'none';
  rightSideMediaUrl?: string;
  rightSideCardTitle?: string;
  rightSideCardSubtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
  titleFontSize?: number;
  subtitleFontSize?: number;
  heroHeight?: number;
  mobileHeroHeight?: number;
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

export interface PageHero {
  title?: string;
  subtitle?: string;
  bgColor?: string;
  bgGradient?: string;
  bgImage?: string;
  image?: string;
  timerEndTime?: string;
  titleColor?: string;
  subtitleColor?: string;
  titleFontSize?: number;
  subtitleFontSize?: number;
  rightSideImage?: string;
}

export interface TopBanner {
  enabled?: boolean;
  text?: string;
  bgColor?: string;
  textColor?: string;
  link?: string;
}

export interface HomeHero {
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  bgColor?: string;
  bgGradientStart?: string;
  bgGradientMid?: string;
  bgGradientEnd?: string;
  bgImage?: string;
  titleColor?: string;
  subtitleColor?: string;
  titleFontSize?: number;
  subtitleFontSize?: number;
  ctaLink?: string;
  ctaBgColor?: string;
  ctaTextColor?: string;
}

export interface SiteSettings {
  _id: string;
  logo: string;
  logoWidth: number;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  whatsappNumber: string;
  workingHours: string;
  formSubmitEmail: string;
  orderSuccessMessage: string;
  paymentMethods: {
    code: string;
    label: string;
    type: 'cod' | 'wallet' | 'bank' | 'other';
    accountTitle?: string;
    accountNumber?: string;
    iban?: string;
    instructions?: string;
    isActive: boolean;
    sortOrder: number;
  }[];
  reviewsEnabled: boolean;
  reviewsRequireApproval: boolean;
  newArrivalsHero?: PageHero;
  dealsHero?: PageHero;
  aboutHero?: PageHero;
  shopHero?: PageHero;
  topBanner?: TopBanner;
  homeHero?: HomeHero;
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

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  expiresAt: string;
  createdAt: string;
}

export interface BlogAuthor {
  name: string;
  image?: string;
  adminId?: string;
}

export interface BlogCustomLink {
  text: string;
  url: string;
  style: 'primary' | 'secondary' | 'outline' | 'link';
  isButton: boolean;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  gallery: string[];
  author: BlogAuthor;
  tags: string[];
  category?: string | Category;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  customLinks: BlogCustomLink[];
  viewCount: number;
  likeCount: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogData {
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  gallery?: string[];
  author?: { name: string };
  tags?: string[];
  category?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  customLinks?: BlogCustomLink[];
  sortOrder?: number;
}

export interface UpdateBlogData extends Partial<CreateBlogData> {
  title?: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
}
