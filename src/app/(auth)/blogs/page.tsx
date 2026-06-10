// src/components/blogs/BlogForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiSave } from 'react-icons/fi';
import { useCreateBlog, useUpdateBlog, useBlog } from '@/hooks/useBlogs';
import { useCategories } from '@/hooks/useCategories';
import SingleImageUpload from '@/components/common/SingleImageUpload';
import type { Blog } from '@/types';

interface BlogFormProps {
  blogId?: string;
}

export default function BlogForm({ blogId }: BlogFormProps) {
  const router = useRouter();
  const isEditing = !!blogId;
  
  // Fetch blog data if editing
  const { data: blogData, isLoading: isLoadingBlog } = useBlog(blogId || '');
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    featuredImage: '',
    isPublished: false,
    isFeatured: false,
    tags: '',
    metaTitle: '',
    metaDescription: '',
  });

  const { data: categoriesData } = useCategories(true);
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();

  const categories = Array.isArray(categoriesData?.data) ? categoriesData.data : [];

  // Populate form when editing
  useState(() => {
    if (isEditing && blogData?.data) {
      const blog = blogData.data;
      setFormData({
        title: blog.title || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        category: typeof blog.category === 'object' ? blog.category?._id : blog.category || '',
        featuredImage: blog.featuredImage || '',
        isPublished: blog.isPublished || false,
        isFeatured: blog.isFeatured || false,
        tags: blog.tags?.join(', ') || '',
        metaTitle: blog.metaTitle || '',
        metaDescription: blog.metaDescription || '',
      });
    }
  });

  const handleImageUpload = (imageUrl: string) => {
    console.log('Image uploaded successfully:', imageUrl);
    setFormData(prev => ({ ...prev, featuredImage: imageUrl }));
    toast.success('Featured image uploaded!');
  };

  const handleImageError = (error: string) => {
    console.error('Image upload error:', error);
    toast.error(error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submitting form with featuredImage:', formData.featuredImage);
    
    // Validate required fields
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }
    
    if (!formData.featuredImage) {
      toast.error('Featured image is required');
      return;
    }

    const submitData = {
      title: formData.title,
      excerpt: formData.excerpt,
      content: formData.content,
      category: formData.category,
      featuredImage: formData.featuredImage,
      isPublished: formData.isPublished,
      isFeatured: formData.isFeatured,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
    };

    try {
      if (isEditing && blogId) {
        await updateBlog.mutateAsync({ id: blogId, data: submitData });
        toast.success('Blog updated successfully!');
      } else {
        await createBlog.mutateAsync(submitData);
        toast.success('Blog created successfully!');
      }
      router.push('/blogs');
      router.refresh();
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to save blog');
    }
  };

  if (isEditing && isLoadingBlog) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Blog' : 'Create New Blog'}
        </h1>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createBlog.isLoading || updateBlog.isLoading}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            <FiSave className="h-4 w-4" />
            {isEditing ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blog Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter blog title..."
              required
            />
          </div>

          {/* Featured Image Upload - Using your existing component */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image *
            </label>
            <SingleImageUpload
              value={formData.featuredImage}
              onChange={handleImageUpload}
              onError={handleImageError}
              folder="blogs"
              aspectRatio="16/9"
              className="w-full"
            />
            {formData.featuredImage && (
              <p className="text-xs text-green-600 mt-2">
                ✓ Image uploaded successfully
              </p>
            )}
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt / Summary
            </label>
            <textarea
              value={formData.excerpt}
              onChange={e => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="Write a brief summary of your blog..."
            />
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 font-mono"
              placeholder="Write your blog content here..."
              required
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category: any) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Blog Status
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={e => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                  className="rounded border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Published</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={e => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="rounded border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Feature this blog</span>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="react, nextjs, tailwind"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate tags with commas
            </p>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={formData.metaTitle}
              onChange={e => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="SEO title (optional)"
            />
            
            <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
              Meta Description
            </label>
            <textarea
              value={formData.metaDescription}
              onChange={e => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="SEO description (optional)"
            />
          </div>
        </div>
      </div>
    </form>
  );
}