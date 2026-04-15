'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useProduct } from '@/hooks/useProducts';
import ProductForm from '@/components/products/ProductForm';

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, error } = useProduct(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-gray-500">Product not found</p>
        <Link href="/products" className="mt-4 inline-block text-primary-600 hover:underline">
          ← Back to Products
        </Link>
      </div>
    );
  }

  return <ProductForm product={data.data} />;
}
