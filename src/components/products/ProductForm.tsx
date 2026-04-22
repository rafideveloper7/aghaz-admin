'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiArrowLeft } from 'react-icons/fi';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import ImageUpload from '@/components/products/ImageUpload';
import Link from 'next/link';
import type { Product } from '@/types';

const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  comparePrice: z.coerce.number().min(0).optional().or(z.literal(0)),
  category: z.string().min(1, 'Category is required'),
  tags: z.string().min(1, 'At least one tag is required'),
  stock: z.coerce.number().min(0, 'Stock must be positive'),
  isFeatured: z.boolean().default(false),
  isHot: z.boolean().default(false),
  isDeal: z.boolean().default(false),
  isOffer: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  sortOrder: z.coerce.number().default(0),
  benefits: z.string().min(1, 'At least one benefit is required'),
  videoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
  images: z.array(z.string()).min(1, 'At least one image is required'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const { data: categoriesData } = useCategories(true);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(
    product?.faqs || [{ question: '', answer: '' }]
  );

  const categories = categoriesData?.data || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product?.title || '',
      description: product?.description || '',
      price: product?.price || 0,
      comparePrice: product?.comparePrice || 0,
      category: typeof product?.category === 'object' ? product?.category?._id || '' : product?.category || '',
      tags: product?.tags?.join(', ') || '',
      stock: product?.stock || 0,
      isFeatured: product?.isFeatured || false,
      isHot: product?.isHot || false,
      isDeal: product?.isDeal || false,
      isOffer: product?.isOffer || false,
      isNewArrival: product?.isNewArrival || false,
      sortOrder: product?.sortOrder || 0,
      benefits: product?.benefits?.join('\n') || '',
      videoUrl: product?.videoUrl || '',
      faqs: product?.faqs || [{ question: '', answer: '' }],
      images: product?.images || [],
    },
  });

  const images = watch('images');

  const onSubmit = async (data: ProductFormData) => {
    try {
      const processedData = {
        ...data,
        tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
        benefits: data.benefits.split('\n').map(b => b.trim()).filter(Boolean),
        faqs: faqs.filter(f => f.question && f.answer),
        comparePrice: data.comparePrice || undefined,
        videoUrl: data.videoUrl || undefined,
      };

      if (product) {
        // --- EDIT MODE: Only send changed fields ---
        const original = {
          title: product.title || '',
          description: product.description || '',
          price: product.price || 0,
          comparePrice: product.comparePrice || 0,
          category: typeof product.category === 'object' ? product.category?._id || '' : product.category || '',
          tags: (product.tags || []).join(', '),
          stock: product.stock || 0,
          isFeatured: product.isFeatured || false,
          isHot: product.isHot || false,
          isDeal: product.isDeal || false,
          isOffer: product.isOffer || false,
          isNewArrival: product.isNewArrival || false,
          sortOrder: product.sortOrder || 0,
          benefits: (product.benefits || []).join('\n'),
          videoUrl: product.videoUrl || '',
          images: product.images || [],
        };

        // Build changed fields only
        const changes: Record<string, unknown> = {};

        if (processedData.title !== original.title) changes.title = processedData.title;
        if (processedData.description !== original.description) changes.description = processedData.description;
        if (processedData.price !== original.price) changes.price = processedData.price;
        if ((processedData.comparePrice || 0) !== (original.comparePrice || 0)) changes.comparePrice = processedData.comparePrice;
        if (processedData.category !== original.category) changes.category = processedData.category;
        if (JSON.stringify(processedData.tags) !== JSON.stringify(original.tags)) changes.tags = processedData.tags;
        if (processedData.stock !== original.stock) changes.stock = processedData.stock;
        if (processedData.isFeatured !== original.isFeatured) changes.isFeatured = processedData.isFeatured;
        if (processedData.isHot !== original.isHot) changes.isHot = processedData.isHot;
        if (processedData.isDeal !== original.isDeal) changes.isDeal = processedData.isDeal;
        if (processedData.isOffer !== original.isOffer) changes.isOffer = processedData.isOffer;
        if (processedData.isNewArrival !== original.isNewArrival) changes.isNewArrival = processedData.isNewArrival;
        if (processedData.sortOrder !== original.sortOrder) changes.sortOrder = processedData.sortOrder;
        if (JSON.stringify(processedData.benefits) !== JSON.stringify(original.benefits)) changes.benefits = processedData.benefits;
        if (processedData.videoUrl !== original.videoUrl) changes.videoUrl = processedData.videoUrl;
        if (JSON.stringify(processedData.images) !== JSON.stringify(original.images)) changes.images = processedData.images;
        if (JSON.stringify(processedData.faqs) !== JSON.stringify(product.faqs || [])) changes.faqs = processedData.faqs;

        // If nothing changed
        if (Object.keys(changes).length === 0) {
          toast('No changes detected. Nothing to update.');
          return;
        }

        await updateMutation.mutateAsync({ id: product._id, data: changes });
        toast.success('Product updated successfully');
      } else {
        await createMutation.mutateAsync(processedData);
        toast.success('Product created successfully');
      }
      router.push('/products');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to save product');
    }
  };

  const addFaq = () => setFaqs([...faqs, { question: '', answer: '' }]);
  const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));
  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setFaqs(newFaqs);
    setValue('faqs', newFaqs);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/products" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <FiArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add Product'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {product ? 'Update product details' : 'Create a new product listing'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
              <ImageUpload
                images={images}
                onChange={vals => setValue('images', vals, { shouldValidate: true })}
              />
              {errors.images && <p className="mt-2 text-sm text-red-600">{errors.images.message}</p>}
            </div>

            {/* Basic Info */}
            <div className="card p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                <input {...register('title')} className="input-field" placeholder="Product title" />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                <textarea
                  {...register('description')}
                  rows={5}
                  className="input-field resize-none"
                  placeholder="Detailed product description"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                  <select {...register('category')} className="input-field">
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags *</label>
                  <input {...register('tags')} className="input-field" placeholder="gadget, kitchen, smart (comma separated)" />
                  {errors.tags && <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (PKR) *</label>
                  <input {...register('price')} type="number" className="input-field" placeholder="0" />
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Compare Price</label>
                  <input {...register('comparePrice')} type="number" className="input-field" placeholder="0 (optional)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock *</label>
                  <input {...register('stock')} type="number" className="input-field" placeholder="0" />
                  {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Video URL (optional)</label>
                <input {...register('videoUrl')} className="input-field" placeholder="https://youtube.com/watch?v=..." />
              </div>

              <div className="flex items-center gap-3">
                <input
                  {...register('isFeatured')}
                  type="checkbox"
                  id="isFeatured"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">Featured Product</label>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Display Sections</h3>
                <p className="text-xs text-gray-500 mb-3">Select which sections this product should appear in on the homepage</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      {...register('isHot')}
                      type="checkbox"
                      id="isHot"
                      className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="isHot" className="text-sm text-gray-700">🔥 Hot Products</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      {...register('isDeal')}
                      type="checkbox"
                      id="isDeal"
                      className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="isDeal" className="text-sm text-gray-700">⚡ Flash Deals</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      {...register('isOffer')}
                      type="checkbox"
                      id="isOffer"
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="isOffer" className="text-sm text-gray-700">🎁 Special Offers</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      {...register('isNewArrival')}
                      type="checkbox"
                      id="isNewArrival"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isNewArrival" className="text-sm text-gray-700">✨ New Arrivals</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort Order</label>
                <input {...register('sortOrder')} type="number" className="input-field w-24" placeholder="0" />
              </div>
            </div>

            {/* Benefits */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Benefits</h2>
              <p className="text-sm text-gray-500 mb-4">One benefit per line. Focus on customer value, not features.</p>
              <textarea
                {...register('benefits')}
                rows={5}
                className="input-field resize-none"
                placeholder="Save time on daily tasks&#10;Improve your home efficiency&#10;Easy to use for everyone"
              />
              {errors.benefits && <p className="mt-1 text-sm text-red-600">{errors.benefits.message}</p>}
            </div>

            {/* FAQs */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">FAQs</h2>
                <button type="button" onClick={addFaq} className="btn-secondary text-sm py-2 px-3">
                  <FiPlus className="h-4 w-4 mr-1" /> Add FAQ
                </button>
              </div>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
                    {faqs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFaq(index)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    )}
                    <input
                      value={faq.question}
                      onChange={e => updateFaq(index, 'question', e.target.value)}
                      className="input-field mb-2"
                      placeholder="Question"
                    />
                    <textarea
                      value={faq.answer}
                      onChange={e => updateFaq(index, 'answer', e.target.value)}
                      className="input-field resize-none"
                      rows={2}
                      placeholder="Answer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Publish</h2>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="btn-primary w-full"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Saving...
                  </span>
                ) : product ? 'Update Product' : 'Create Product'}
              </button>
              <p className="text-xs text-gray-400 mt-3 text-center">
                This will {(product ? 'update' : 'create')} the product in your catalog
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
