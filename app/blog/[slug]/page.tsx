'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Calendar, Clock, User, ArrowLeft,
  Share2, MessageSquare, Sparkles, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import DOMPurify from 'isomorphic-dompurify';

export default function BlogPostPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`/api/blog/slug/${slug}`);
        const data = await res.json();
        if (data.success) {
          setBlog(data.blog);
        }
      } catch (err) {
        console.error('Failed to fetch blog post', err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-10 w-10 animate-spin text-agro-green" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <h1 className="text-4xl font-display font-bold mb-4">Post Not Found</h1>
        <Link href="/blog" className="text-agro-green font-bold flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="bg-white dark:bg-zinc-950 pt-32 pb-24">
      {/* ── HEADER ───────────────────────────────────────────────── */}
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/blog" className="inline-flex items-center gap-2 text-zinc-500 hover:text-agro-green transition-colors font-medium mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </Link>

          <div className="flex justify-center mb-6">
            <Badge className="bg-agro-green/10 text-agro-green border-agro-green/20 px-6 py-2 rounded-full uppercase tracking-widest text-[10px] font-bold">
              {blog.category}
            </Badge>
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-bold mb-8 leading-[1.1] tracking-tight">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500 font-medium pb-8 border-b border-zinc-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-agro-green/10 flex items-center justify-center font-bold text-xs text-agro-green">
                {blog.author?.name?.charAt(0) || 'A'}
              </div>
              <span>By {blog.author?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(blog.createdAt), 'MMM dd, yyyy')}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {blog.readingTime} min read
            </div>
          </div>
        </div>
      </header>

      {/* ── COVER IMAGE ─────────────────────────────────────────── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-6xl mx-auto">
          <div className="relative aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl">
            <Image
              src={blog.coverImage || '/images/placeholder-blog.jpg'}
              alt={blog.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div
            className="prose prose-zinc dark:prose-invert prose-lg md:prose-xl max-w-none 
              prose-headings:font-display prose-headings:font-bold 
              prose-p:leading-relaxed prose-p:text-zinc-600 dark:prose-p:text-zinc-400
              prose-img:rounded-[2.5rem] prose-img:shadow-xl
              prose-blockquote:border-l-4 prose-blockquote:border-agro-green prose-blockquote:bg-agro-green/5 prose-blockquote:p-8 prose-blockquote:rounded-r-3xl
              prose-strong:text-zinc-900 dark:prose-strong:text-white"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }}
          />

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-16 pt-8 border-t border-zinc-100 dark:border-white/5 flex flex-wrap gap-2">
              {blog.tags.map((tag: string) => (
                <span key={tag} className="px-4 py-1.5 bg-zinc-50 dark:bg-white/5 text-zinc-500 rounded-full text-xs font-bold ring-1 ring-zinc-200 dark:ring-white/10 uppercase tracking-widest">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Social Share */}
          <div className="mt-16 p-8 bg-zinc-50 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center shadow-md">
                <Share2 className="h-5 w-5 text-agro-green" />
              </div>
              <div>
                <p className="font-bold text-sm">Share this Article</p>
                <p className="text-zinc-400 text-xs">Spread the knowledge with your farm network</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" className="rounded-xl h-10 w-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10"> <Sparkles className="h-4 w-4" /> </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── RELATED POSTS ───────────────────────────────────────── */}
      {/* ... maybe later ... */}
    </article>
  );
}

// Simple internal Button mock to avoid import issues
function Button({ children, className, variant, size, ...props }: any) {
  return (
    <button className={cn('inline-flex items-center justify-center transition-colors', className)} {...props}>
      {children}
    </button>
  );
}
