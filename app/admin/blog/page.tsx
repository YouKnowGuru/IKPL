'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/shared/Toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Plus, Search, Edit2, Trash2, ExternalLink,
  Eye, EyeOff, Loader2, Calendar, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function AdminBlogList() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/blog?isAdmin=true&limit=100&search=${searchTerm}`);
      const data = await res.json();
      if (data.success) {
        setBlogs(data.blogs);
      }
    } catch (err) {
      showToast('Failed to load blog posts', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, showToast]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Blog post deleted', 'success');
        setBlogs(prev => prev.filter(b => b._id !== id));
      } else {
        showToast(data.message || 'Delete failed', 'error');
      }
    } catch (err) {
      showToast('Error deleting post', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const togglePublish = async (blog: any) => {
    try {
      const res = await fetch(`/api/blog/${blog._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !blog.published }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Post ${!blog.published ? 'published' : 'unpublished'}`, 'success');
        setBlogs(prev => prev.map(b => b._id === blog._id ? { ...b, published: !blog.published } : b));
      }
    } catch (err) {
      showToast('Error updating publish status', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold">Blog Management</h1>
          <p className="text-zinc-500 text-sm mt-2 max-w-md">
            Manage your articles, news, and expert advice for the IKPL community.
          </p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="btn-glow-green text-white font-bold h-12 rounded-2xl px-6 group">
            <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
            New Blog Post
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
        <Input
          placeholder="Search by title, excerpt..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-14 rounded-2xl border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm focus:ring-agro-green/20"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-zinc-200 dark:border-white/10">
          <Loader2 className="h-10 w-10 text-agro-green animate-spin mb-4" />
          <p className="text-zinc-400 font-medium">Fetching blog posts...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 dark:bg-white/5 rounded-3xl border border-dashed border-zinc-200 dark:border-white/10">
          <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="font-display font-bold text-xl mb-1">No blogs found</h3>
          <p className="text-zinc-400 text-sm mb-6">Start by creating your first post.</p>
          <Link href="/admin/blog/new">
            <Button variant="outline" className="rounded-xl font-bold">
              Create New Blog
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/10 rounded-2xl p-5 group flex items-center gap-6 hover:border-agro-green/30 transition-all card-hover"
            >
              <div className="relative h-20 w-32 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0">
                <img
                  src={blog.coverImage || '/images/placeholder-blog.jpg'}
                  alt={blog.title}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="outline" className="text-[10px] uppercase font-bold text-agro-green bg-agro-green/5 border-agro-green/20">
                    {blog.category}
                  </Badge>
                  {blog.published ? (
                    <Badge className="bg-emerald-500 text-[10px] uppercase font-bold">Published</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold">Draft</Badge>
                  )}
                </div>
                <h3 className="font-display font-bold text-lg truncate group-hover:text-agro-green transition-colors">{blog.title}</h3>
                <div className="flex items-center gap-4 text-xs text-zinc-400 mt-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(blog.createdAt), 'MMM dd, yyyy')}
                  </span>
                  <span>{blog.readingTime} min read</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => togglePublish(blog)}
                  className={cn(
                    "h-10 w-10 rounded-xl transition-all",
                    blog.published ? "text-zinc-400 hover:text-zinc-600" : "text-agro-green hover:bg-agro-green/10"
                  )}
                  title={blog.published ? "Unpublish" : "Publish"}
                >
                  {blog.published ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>

                <Link href={`/admin/blog/edit/${blog._id}`}>
                  <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-agro-orange/10 hover:text-agro-orange">
                    <Edit2 className="h-5 w-5" />
                  </Button>
                </Link>

                <Button
                  size="icon"
                  variant="ghost"
                  disabled={deletingId === blog._id}
                  onClick={() => handleDelete(blog._id, blog.title)}
                  className="h-10 w-10 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  {deletingId === blog._id ? <Loader2 className="h-4 w-4 animate-spin text-red-500" /> : <Trash2 className="h-5 w-5" />}
                </Button>

                {blog.published && (
                  <Link href={`/blog/${blog.slug}`} target="_blank">
                    <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-zinc-400 hover:text-agro-green">
                      <ExternalLink className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
