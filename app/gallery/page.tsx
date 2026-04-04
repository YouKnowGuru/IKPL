'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import { motion } from 'framer-motion';
import { Camera, LayoutGrid, Filter, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = ['All', 'Logistics', 'Farming', 'Events', 'General'];

export default function GalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gallery?category=${activeCategory}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Gallery load error', err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-body transition-colors duration-500">
      
      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="relative min-h-[50vh] flex items-end pb-20 overflow-hidden bg-zinc-950">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80"
            alt="Farmers in field"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center md:text-left">
           <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-agro-green/20 text-agro-green text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-agro-green/30 mb-6 shadow-sm"
           >
              <Camera className="h-3 w-3" />
              Visual Impact
           </motion.div>
           <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tight leading-none mb-8 text-white"
           >
             Our <span className="gradient-text-animate">Gallery</span>
           </motion.h1>
           <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl text-zinc-400 text-lg md:text-xl font-medium leading-relaxed"
           >
             Capturing our journey across Bhutan's agricultural landscape. From our logistics hubs to the farms we serve daily.
           </motion.p>
        </div>
      </section>

      {/* ── Category Filter Strip ───────────────────────────────── */}
      <div className="sticky top-20 z-40 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-y border-zinc-100 dark:border-white/5 py-6">
        <div className="container mx-auto px-4 flex flex-wrap items-center justify-center gap-4">
           {CATEGORIES.map((cat, i) => (
             <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                   "group relative px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                   activeCategory === cat 
                     ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl" 
                     : "text-zinc-400 hover:text-agro-green"
                )}
             >
                <div className="relative z-10 flex items-center gap-2">
                   {cat === 'All' ? <LayoutGrid className="h-3 w-3" /> : <Filter className="h-3 w-3 opacity-50 group-hover:opacity-100" />}
                   {cat}
                </div>
             </button>
           ))}
        </div>
      </div>

      {/* ── Gallery Content ─────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20 min-h-[50vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
             <div className="relative h-12 w-12">
                <div className="absolute inset-0 rounded-full border-4 border-agro-green/10" />
                <div className="absolute inset-0 rounded-full border-4 border-agro-green border-t-transparent animate-spin" />
             </div>
             <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest mt-6 animate-pulse">Loading Visuals...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center">
             <div className="w-20 h-20 bg-zinc-100 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 border border-zinc-200 dark:border-white/10">
                <ImageIcon className="h-8 w-8 text-zinc-300" />
             </div>
             <h3 className="text-2xl font-display font-bold mb-2">No Visuals Found</h3>
             <p className="text-zinc-500 max-w-md mx-auto leading-relaxed">
                We haven't added any photos in the <span className="text-agro-green font-bold">"{activeCategory}"</span> category yet. Check back soon for updates from our field teams.
             </p>
          </div>
        ) : (
          <GalleryGrid items={items} />
        )}
      </section>

      {/* ── Footer Decoration ───────────────────────────────────── */}
      <div className="py-20 border-t border-zinc-100 dark:border-white/5 bg-zinc-100/50 dark:bg-white/[0.01]">
         <div className="container mx-auto px-4 text-center">
            <p className="text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.4em] mb-4">Perspective</p>
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent mx-auto" />
         </div>
      </div>
    </div>
  );
}
