'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import {
  Search, Calendar, Clock, ArrowRight, Sparkles,
  ChevronRight, LayoutGrid, List
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const CATEGORIES = ['All', 'Company News', 'Expert Advice', 'Farming Tips', 'Other'];

export default function BlogIndexPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/blog?category=${activeCategory}&search=${searchTerm}`);
      const data = await res.json();
      if (data.success) {
        setBlogs(data.blogs);
      }
    } catch (err) {
      console.error('Failed to fetch blogs', err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchTerm]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[60vh] flex items-end pt-24 pb-16 overflow-hidden bg-zinc-950">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80"
            alt="Farmers in field"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/30" />
        </div>
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-agro-green/15 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-agro-orange/10 rounded-full blur-[100px] animate-blob delay-2000" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-agro-green/15 border border-agro-green/30 text-agro-green text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-6 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Insights & Stories
            </div>
            <h1 className="text-hero font-display font-bold text-white mb-6">
              Empowering Bhutan through <span className="gradient-text-animate">Expertise</span>
            </h1>
            <p className="text-zinc-300 text-xl max-w-2xl leading-relaxed">
              Stay updated with the latest in sustainable agriculture, expert livestock advice, and company news from the leading distributor of premium feeds.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FILTERS ─────────────────────────────────────────────── */}
      <section className="sticky top-20 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-white/5 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide w-full md:w-auto">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300',
                    activeCategory === cat
                      ? 'bg-agro-green text-white shadow-lg shadow-agro-green/20'
                      : 'text-zinc-500 hover:text-agro-green hover:bg-agro-green/5'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 h-11 rounded-xl bg-zinc-100 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-agro-green/20 transition-all text-sm outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── BLOG LIST ────────────────────────────────────────────── */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="aspect-[16/10] bg-zinc-200 dark:bg-white/5 rounded-[1.5rem] md:rounded-[2.5rem]" />
                  <div className="h-4 w-3/4 bg-zinc-200 dark:bg-white/5 rounded-full" />
                  <div className="h-3 w-full bg-zinc-200 dark:bg-white/5 rounded-full hidden md:block" />
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-display font-bold mb-2">No articles found</h3>
              <p className="text-zinc-500">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
              {blogs.map((blog, idx) => (
                <motion.article
                  key={blog._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                >
                  <Link href={`/blog/${blog.slug}`} className="group block h-full">
                    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-zinc-100 dark:border-white/5 shadow-sm hover:shadow-2xl hover:border-agro-green/30 transition-all duration-500 card-hover">
                      {/* Image container */}
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={blog.coverImage || '/images/placeholder-blog.jpg'}
                          alt={blog.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute top-6 left-6">
                          <Badge className="bg-agro-green text-white font-bold border-0 shadow-lg px-4 py-1.5 rounded-full backdrop-blur-md">
                            {blog.category}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 md:p-8 flex flex-col flex-1">
                        <div className="flex items-center gap-3 md:gap-4 text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 md:mb-4">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3 md:h-3.5 w-3 md:w-3.5" />
                            {format(new Date(blog.createdAt), 'MMM dd')}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3 md:h-3.5 w-3 md:w-3.5" />
                            {blog.readingTime} min
                          </span>
                        </div>

                        <h3 className="text-lg md:text-2xl font-display font-bold mb-3 md:mb-4 leading-tight group-hover:text-agro-green transition-colors line-clamp-2">
                          {blog.title}
                        </h3>

                        <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm leading-relaxed mb-6 md:mb-8 line-clamp-3">
                          {blog.excerpt}
                        </p>

                        <div className="mt-auto pt-4 md:pt-6 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-agro-green/10 flex items-center justify-center font-bold text-[10px] md:text-xs text-agro-green">
                              {blog.author?.name?.charAt(0) || 'A'}
                            </div>
                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{blog.author?.name}</span>
                          </div>
                          <span className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-agro-green group-hover:text-white transition-all">
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────────────── */}
      <section className="py-24 bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-agro-green/10 to-agro-orange/10 border border-agro-green/20 p-12 md:p-16 rounded-[3rem] text-center">
            <h2 className="text-4xl font-display font-bold text-white mb-6">Never Miss a Crop Update</h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Join 5,000+ commercial farmers getting monthly newsletters about market trends and logistics updates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 h-14 px-6 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-agro-green"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="h-14 px-8 rounded-2xl bg-agro-green text-white font-bold btn-glow-green"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
