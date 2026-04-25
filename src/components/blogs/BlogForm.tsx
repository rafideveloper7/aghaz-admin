'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiArrowLeft, FiLink } from 'react-icons/fi';
import { useCreateBlog, useUpdateBlog, useBlogById } from '@/hooks/useBlogs';
import { useCategories } from '@/hooks/useCategories';
import RichTextEditor from '@/components/common/RichTextEditor';
import ImageUpload from '@/components/products/ImageUpload';
import SingleImageUpload from '@/components/common/SingleImageUpload';
import type { Blog, BlogCustomLink } from '@/types';

const blogSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters').max(500, 'Excerpt cannot exceed 500 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  featuredImage: z.string().min(1, 'Featured image is required'),
  tags: z.string().min(1, 'At least one tag is required'),
  authorName: z.string().min(1, 'Author name is required'),
  category: z.string().optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(60, 'Meta title cannot exceed 60 characters').optional(),
  metaDescription: z.string().max(160, 'Meta description cannot exceed 160 characters').optional(),
  sortOrder: z.coerce.number().default(0),
});

type BlogFormData = z.infer<typeof blogSchema>;

interface BlogFormProps {
  blogId?: string;
}

export default function BlogForm({ blogId }: BlogFormProps) {
  const router = useRouter();
  const isEditing = !!blogId;
  const { data: blogData } = useBlogById(blogId || '');
  const { data: categoriesData } = useCategories(true);
  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();

  const [gallery, setGallery] = useState<string[]>([]);
  const [customLinks, setCustomLinks] = useState<BlogCustomLink[]>([]);

  const categories = categoriesData?.data || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      featuredImage: '',
      tags: '',
      authorName: '',
      category: '',
      isPublished: false,
      isFeatured: false,
      metaTitle: '',
      metaDescription: '',
      sortOrder: 0,
    },
  });

  // Load blog data for editing
  useEffect(() => {
    if (blogData?.data) {
      const blog = blogData.data as Blog;
      setValue('title', blog.title);
      setValue('excerpt', blog.excerpt);
      setValue('content', blog.content);
      setValue('featuredImage', blog.featuredImage);
      setValue('tags', blog.tags?.join(', ') || '');
      setValue('authorName', blog.author?.name || '');
      setValue('category', typeof blog.category === 'string' ? blog.category : blog.category?._id || '');
      setValue('isPublished', blog.isPublished);
      setValue('isFeatured', blog.isFeatured);
      setValue('metaTitle', blog.metaTitle || '');
      setValue('metaDescription', blog.metaDescription || '');
      setValue('sortOrder', blog.sortOrder || 0);
      setGallery(blog.gallery || []);
      setCustomLinks(blog.customLinks || []);
    }
  }, [blogData, setValue]);

  const featuredImage = watch('featuredImage');
  const tags = watch('tags');

  const onSubmit = async (data: BlogFormData) => {
    try {
      const processedData = {
        ...data,
        tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
        gallery,
        customLinks,
        category: data.category || undefined,
        metaTitle: data.metaTitle?.trim() || undefined,
        metaDescription: data.metaDescription?.trim() || undefined,
      };

      // Remove authorName and map to author object
      const finalData = {
        ...processedData,
        author: { name: processedData.authorName },
      };
      delete finalData.authorName;

      if (isEditing && blogId) {
        // Only send changed fields for update
        const changes: Record<string, unknown> = { ...finalData };
        // Remove fields that shouldn't be sent if they're unchanged? Actually just send all except _id, createdAt, updatedAt
        // For simplicity, send all fields and let backend handle it

        await updateMutation.mutateAsync({ id: blogId, data: changes });
        toast.success('Blog updated successfully');
      } else {
        await createMutation.mutateAsync(finalData as CreateBlogData);
        toast.success('Blog created successfully');
      }
      router.push('/blogs');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to save blog');
    }
  };

  const addCustomLink = () => {
    setCustomLinks([
      ...customLinks,
      { text: '', url: '', style: 'primary', isButton: true },
    ]);
  };

  const removeCustomLink = (index: number) => {
    setCustomLinks(customLinks.filter((_, i) => i !== index));
  };

  const updateCustomLink = (index: number, field: keyof BlogCustomLink, value: string | boolean) => {
    const newLinks = [...customLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setCustomLinks(newLinks);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/blogs" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <FiArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Blog' : 'Add Blog'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEditing ? 'Update blog post details' : 'Create a new blog post'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="card p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                <input {...register('title')} className="input-field" placeholder="Blog title" />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Excerpt *</label>
                <textarea
                  {...register('excerpt')}
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Short summary of the blog (max 500 chars)"
                />
                {errors.excerpt && <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <select {...register('category')} className="input-field">
                    <option value="">Select category (optional)</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma separated) *</label>
                  <input {...register('tags')} className="input-field" placeholder="tag1, tag2, tag3" />
                  {errors.tags && <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>}
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="card p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Featured Image</h2>
              <SingleImageUpload
                image={featuredImage}
                onChange={val => setValue('featuredImage', val)}
              />
              {errors.featuredImage && <p className="mt-1 text-sm text-red-600">{errors.featuredImage.message}</p>}
            </div>

            {/* Content Editor */}
            <div className="card p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Content *</h2>
              <RichTextEditor
                content={watch('content')}
                onChange={val => setValue('content', val)}
                placeholder="Write your blog content here..."
              />
              {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
            </div>

            {/* Gallery Images */}
            <div className="card p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Gallery Images</h2>
              <p className="text-sm text-gray-500">Additional images for the blog post</p>
              <ImageUpload images={gallery} onChange={setGallery} />
            </div>

            {/* Custom Action Links */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Action Links</h2>
                  <p className="text-sm text-gray-500">Call-to-action buttons embedded in the blog</p>
                </div>
                <button type="button" onClick={addCustomLink} className="btn-secondary text-sm py-2 px-3">
                  <FiPlus className="h-4 w-4 mr-1" /> Add Link
                </button>
              </div>

              {customLinks.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FiLink className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No custom links added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customLinks.map((link, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
                      {customLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCustomLink(index)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                          value={link.text}
                          onChange={e => updateCustomLink(index, 'text', e.target.value)}
                          className="input-field"
                          placeholder="Button text"
                        />
                        <input
                          value={link.url}
                          onChange={e => updateCustomLink(index, 'url', e.target.value)}
                          className="input-field"
                          placeholder="URL"
                        />
                        <select
                          value={link.style}
                          onChange={e => updateCustomLink(index, 'style', e.target.value)}
                          className="input-field"
                        >
                          <option value="primary">Primary</option>
                          <option value="secondary">Secondary</option>
                          <option value="outline">Outline</option>
                          <option value="link">Link</option>
                        </select>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`isButton-${index}`}
                            checked={link.isButton}
                            onChange={e => updateCustomLink(index, 'isButton', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <label htmlFor={`isButton-${index}`} className="text-sm text-gray-700">
                            Show as button
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SEO Settings */}
            <div className="card p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">SEO Settings</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Title</label>
                <input {...register('metaTitle')} className="input-field" placeholder="SEO title (optional)" />
                {errors.metaTitle && <p className="mt-1 text-sm text-red-600">{errors.metaTitle.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Description</label>
                <textarea
                  {...register('metaDescription')}
                  rows={2}
                  className="input-field resize-none"
                  placeholder="SEO description (optional)"
                />
                {errors.metaDescription && <p className="mt-1 text-sm text-red-600">{errors.metaDescription.message}</p>}
              </div>
            </div>

            {/* Author Info */}
            <div className="card p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Author Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Author Name *</label>
                <input {...register('authorName')} className="input-field" placeholder="Author name" />
                {errors.authorName && <p className="mt-1 text-sm text-red-600">{errors.authorName.message}</p>}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Publish</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    {...register('isFeatured')}
                    type="checkbox"
                    id="isFeatured"
                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                    Featured Blog
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    {...register('isPublished')}
                    type="checkbox"
                    id="isPublished"
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                    Publish Now
                  </label>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort Order</label>
                <input {...register('sortOrder')} type="number" className="input-field w-full" placeholder="0" />
                <p className="text-xs text-gray-400 mt-1">Higher numbers appear first</p>
              </div>

              <div className="border-t pt-4 mt-4 space-y-3">
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
                  ) : isEditing ? 'Update Blog' : 'Create Blog'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/blogs')}
                  className="btn-secondary w-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
