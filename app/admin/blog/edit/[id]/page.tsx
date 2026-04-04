'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import BlogForm from '@/components/admin/BlogForm';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/shared/Toast';

export default function EditBlogPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`/api/blog/${id}`);
        const data = await res.json();
        if (data.success) {
          setBlog(data.blog);
        } else {
          showToast(data.message || 'Failed to fetch blog', 'error');
        }
      } catch (err) {
        showToast('Error loading blog post', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBlog();
  }, [id, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-agro-green mx-auto mb-4" />
          <p className="text-zinc-500 font-medium">Loading post data...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-500">Blog post not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <BlogForm initialData={blog} isEdit />
    </div>
  );
}
