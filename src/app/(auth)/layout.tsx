import AdminLayout from '@/components/layout/AdminLayout';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
