import { use } from 'react';
import BlogForm from '@/components/blogs/BlogForm';

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <BlogForm blogId={resolvedParams.id} />;
}
