import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_URL } from './constants';
import { useAuthStore } from '@/store/authStore';
import type { ApiResponse, Product, Category, Order, DashboardStats, HeroSlide, SiteSettings, FooterSocial } from '@/types';
import type { Announcement, CreateAnnouncementData, UpdateAnnouncementData } from '@/types/announcement';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<{ token: string; user: { email: string; role: string } }>>('/api/admin/login', { email, password }),
};

// Products
export const productsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; category?: string; status?: string; sort?: string }) =>
    apiClient.get<ApiResponse<Product[]>>('/api/products', { params }),
  getById: (id: string) =>
    apiClient.get<ApiResponse<Product>>(`/api/products/id/${id}`),
  create: (data: FormData | Record<string, unknown>) =>
    apiClient.post<ApiResponse<Product>>('/api/products', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<Product>>(`/api/products/${id}`, data),
  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/api/products/${id}`),
};

// Categories
export const categoriesApi = {
  getAll: (all = false) =>
    apiClient.get<ApiResponse<Category[]>>(all ? '/api/categories/all' : '/api/categories'),
  create: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse<Category>>('/api/categories', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<Category>>(`/api/categories/${id}`, data),
  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/api/categories/${id}`),
};

// Orders
export const ordersApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string; startDate?: string; endDate?: string; search?: string }) =>
    apiClient.get<ApiResponse<Order[]>>('/api/orders', { params }),
  getById: (id: string) =>
    apiClient.get<ApiResponse<Order>>(`/api/orders/${id}`),
  updateStatus: (id: string, status: string, notes?: string) =>
    apiClient.put<ApiResponse<Order>>(`/api/orders/${id}`, { status, notes }),
  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/api/orders/${id}`),
  getStats: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get<ApiResponse<DashboardStats>>('/api/orders/stats', { params }),
};

// Upload
export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post<ApiResponse<{ url: string; fileId: string }>>('/api/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return apiClient.post<ApiResponse<{ url: string; fileId: string }[]>>('/api/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteImage: (fileId: string) =>
    apiClient.delete<ApiResponse<null>>(`/api/upload/${fileId}`),
};

// Hero Slides
export const heroSlidesApi = {
  getAll: () =>
    apiClient.get<ApiResponse<HeroSlide[]>>('/api/hero-slides/all'),
  getActive: () =>
    apiClient.get<ApiResponse<HeroSlide[]>>('/api/hero-slides'),
  create: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse<HeroSlide>>('/api/hero-slides', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<HeroSlide>>(`/api/hero-slides/${id}`, data),
  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/api/hero-slides/${id}`),
  reorder: (slides: { id: string; sortOrder: number }[]) =>
    apiClient.put<ApiResponse<null>>('/api/hero-slides/reorder', { slides }),
};

// Settings
export const settingsApi = {
  get: () =>
    apiClient.get<ApiResponse<SiteSettings>>('/api/settings'),
  update: (data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<SiteSettings>>('/api/settings', data),
};

// Footer Social
export const footerSocialApi = {
  getAll: () =>
    apiClient.get<ApiResponse<FooterSocial[]>>('/api/footer-social/all'),
  getActive: () =>
    apiClient.get<ApiResponse<FooterSocial[]>>('/api/footer-social'),
  create: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse<FooterSocial>>('/api/footer-social', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<FooterSocial>>(`/api/footer-social/${id}`, data),
  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/api/footer-social/${id}`),
};

// Announcements
export const announcementsApi = {
  getAll: () =>
    apiClient.get<ApiResponse<Announcement[]>>('/api/announcement/all'),
  getActive: () =>
    apiClient.get<ApiResponse<Announcement>>('/api/announcement/active'),
  create: (data: CreateAnnouncementData) =>
    apiClient.post<ApiResponse<Announcement>>('/api/announcement', data),
  update: (id: string, data: UpdateAnnouncementData) =>
    apiClient.put<ApiResponse<Announcement>>(`/api/announcement/${id}`, data),
  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/api/announcement/${id}`),
};

export default apiClient;
