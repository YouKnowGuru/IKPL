'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Calendar, Clock, ArrowRight, Sparkles, 
  ChevronRight, Filter, X, Loader2, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/shared/Toast';

const CATEGORIES = ['All', 'Expert Advice', 'News', 'Techniques', 'Success Stories', 'Sustainability'];

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { showToast } = useToast();

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '9');
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      
      const res = await fetch(`/api/blog?${params}`);
      const data = await res.json();
      if (data.success) {
        setBlogs(data.blogs);
        setTotalPages(data.pages);
      }
    } catch (err) {
      showToast('Failed to load articles', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, searchTerm, showToast]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBlogs();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchBlogs]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950">
      
      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80" 
            alt="Agricultural Field" 
            fill 
            className="object-cover opacity-10 blur-[2px]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/80 to-zinc-950" />
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-agro-green/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-agro-green/10 border border-agro-green/20 text-agro-green text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-8">
              <Sparkles className="h-3.5 w-3.5" />
              Expert Insights & News
            </div>
            <h1 className="text-4xl md:text-7xl font-display font-black text-white mb-6 leading-none tracking-tight">
              IKPL <span className="gradient-text-animate">JOURNAL</span>
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Empowering Bhutanese farmers with the latest news, expert nutrition advice, and sustainable agricultural techniques.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FILTER & SEARCH ──────────────────────────────────────── */}
      <section className="py-8 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-white/5 sticky top-14 md:top-16 z-30 backdrop-blur-xl bg-opacity-80 dark:bg-opacity-80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide w-full lg:w-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setPage(1); }}
                  className={cn(
                    "px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 border",
                    selectedCategory === cat
                      ? "bg-agro-green border-agro-green text-white shadow-lg shadow-agro-green/20 scale-105"
                      : "bg-zinc-100 dark:bg-zinc-900 border-transparent text-zinc-500 dark:text-zinc-400 hover:bg-agro-green/10 hover:text-agro-green"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-agro-green transition-colors" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-11 h-12 rounded-2xl border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 focus:ring-agro-green/20 text-sm"
              />
              {searchTerm && (
                <button 
                  onClick={() => { setSearchTerm(''); setPage(1); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── BLOG GRID ───────────────────────────────────────────── */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-950 min-h-[60vh]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
              >
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="aspect-[16/10] bg-zinc-200 dark:bg-zinc-900 animate-pulse rounded-[2.5rem]" />
                    <div className="h-6 w-1/4 bg-zinc-200 dark:bg-zinc-900 animate-pulse rounded-full" />
                    <div className="h-8 w-full bg-zinc-200 dark:bg-zinc-900 animate-pulse rounded-xl" />
                    <div className="h-16 w-full bg-zinc-200 dark:bg-zinc-900 animate-pulse rounded-xl" />
                  </div>
                ))}
              </motion.div>
            ) : blogs.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-32 text-center"
              >
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-10 w-10 text-zinc-300" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-2">No articles found</h3>
                <p className="text-zinc-500 max-w-md mx-auto mb-10 text-lg">
                  We couldn't find any articles matching your search or specialized filters.
                </p>
                <Button 
                  onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setPage(1); }}
                  className="btn-glow-green h-12 px-8 rounded-xl text-white font-bold"
                >
                  Clear All Filters
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
              >
                {blogs.map((blog, i) => (
                  <motion.article 
                    key={blog._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group"
                  >
                    <Link href={`/blog/${blog.slug}`} className="block">
                      <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden mb-6 bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 shadow-sm group-hover:shadow-2xl group-hover:shadow-agro-green/10 transition-all duration-500">
                        <Image 
                          src={blog.coverImage || '/images/placeholder-blog.jpg'} 
                          alt={blog.title} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute bottom-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                          <div className="w-12 h-12 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-2xl">
                            <ArrowRight className="h-6 w-6" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 px-2">
                        <div className="flex items-center gap-4">
                          <Badge className="bg-agro-green/10 text-agro-green border-0 uppercase tracking-widest text-[9px] font-black px-3 py-1 rounded-full">
                            {blog.category}
                          </Badge>
                          <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(blog.createdAt), 'MMM dd')}
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                            <Clock className="h-3 w-3" />
                            {blog.readingTime}m
                          </div>
                        </div>

                        <h3 className="text-2xl font-display font-bold leading-tight group-hover:text-agro-green transition-colors line-clamp-2">
                          {blog.title}
                        </h3>
                        
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed line-clamp-3">
                          {blog.excerpt}
                        </p>

                        <div className="pt-4 flex items-center gap-3">
                          <div className="h-px flex-1 bg-zinc-100 dark:bg-white/5" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-agro-green bg-agro-green/10 px-4 py-1.5 rounded-full flex items-center gap-1">
                            Read Post <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-20 flex justify-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setPage(i + 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                  className={cn(
                    "w-12 h-12 rounded-2xl font-bold text-sm transition-all duration-300 border",
                    page === i + 1
                      ? "bg-agro-green border-agro-green text-white shadow-xl shadow-agro-green/20"
                      : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 text-zinc-400 hover:text-agro-green"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── NEWSLETTER / CTA ────────────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative p-10 md:p-20 rounded-[3rem] bg-zinc-950 overflow-hidden shadow-3xl">
            <div className="absolute top-0 right-0 w-[600px] h-full bg-agro-green/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-agro-orange/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-display font-display font-bold text-white leading-tight mb-6">
                  Stay updated with <br />
                  <span className="gradient-text">Agricultural Trends</span>
                </h2>
                <p className="text-zinc-400 text-lg mb-8 max-w-md leading-relaxed">
                  Join our distribution network of farmers and receive the latest insights directly to your pocket.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input 
                    placeholder="Enter email for updates" 
                    className="h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:ring-agro-green/20"
                  />
                  <Button className="btn-glow-green h-14 px-10 text-white font-bold rounded-2xl border-0">
                    Subscribe
                  </Button>
                </div>
              </div>

              <div className="hidden lg:grid grid-cols-2 gap-4">
                {[
                  { label: 'Weekly Reports', icon: BookOpen },
                  { label: 'Market Prices', icon: Sparkles },
                  { label: 'Farmer Stories', icon: Loader2 },
                  { label: 'Expert Tips', icon: ArrowRight }
                ].map((item, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-xl bg-agro-green/10 text-agro-green flex items-center justify-center">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
