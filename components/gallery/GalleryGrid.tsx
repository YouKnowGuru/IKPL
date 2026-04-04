'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ZoomIn, Info, MapPin, Calendar, Camera, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GalleryGridProps {
  items: any[];
}

export default function GalleryGrid({ items }: GalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemAnim: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="relative">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="columns-2 lg:columns-3 xl:columns-4 gap-3 md:gap-6 space-y-3 md:space-y-6"
      >
        {items.map((item, i) => (
          <motion.div
            key={item._id}
            variants={itemAnim}
            className="break-inside-avoid relative group cursor-pointer"
            onClick={() => setSelectedImage(item)}
          >
            <div className="relative overflow-hidden rounded-[2rem] bg-zinc-100 dark:bg-white/5 border border-zinc-100 dark:border-white/5 shadow-sm group-hover:shadow-2xl transition-all duration-500 overflow-hidden">
              <Image 
                src={item.imageUrl} 
                alt={item.caption || 'Gallery Image'}
                width={600}
                height={800}
                className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-agro-green text-[10px] font-bold text-white uppercase tracking-widest rounded-full">
                      {item.category}
                    </span>
                  </div>
                  {item.caption && (
                    <p className="text-white text-sm font-medium line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-white/60 text-[10px] font-bold uppercase tracking-wider">
                        <ZoomIn className="h-3.5 w-3.5" />
                        Explore View
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Lightbox ───────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedImage && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 pointer-events-none"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-zinc-950/95 backdrop-blur-xl pointer-events-auto"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-6xl aspect-[4/3] md:aspect-[16/9] lg:aspect-[21/9] bg-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row pointer-events-auto"
            >
              <div className="relative flex-1 bg-black group/lb">
                <Image 
                  src={selectedImage.imageUrl} 
                  alt="Gallery Image" 
                  fill 
                  className="object-contain"
                  priority
                />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-6 left-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all group-hover/lb:scale-110 active:scale-95"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="w-full md:w-[400px] p-8 md:p-12 flex flex-col justify-between bg-zinc-900 border-l border-white/5">
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-2 bg-agro-green/15 text-agro-green text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-agro-green/20 w-fit mb-6">
                      <ImageIcon className="h-3 w-3" />
                      {selectedImage.category}
                    </div>
                    <h3 className="text-3xl md:text-4xl font-display font-black text-white leading-tight tracking-tight">
                      Capture Moment
                    </h3>
                    <div className="h-1 w-20 bg-gradient-to-r from-agro-green to-transparent rounded-full mt-4" />
                  </div>

                  {selectedImage.caption && (
                    <div className="prose prose-sm prose-invert">
                       <p className="text-zinc-400 text-lg leading-relaxed font-medium">
                         {selectedImage.caption}
                       </p>
                    </div>
                  )}

                  <div className="space-y-4 pt-4 border-t border-white/5">

                    <div className="flex items-center gap-4 group">
                       <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-agro-orange/10 transition-colors">
                          <Calendar className="h-4 w-4 text-zinc-500 group-hover:text-agro-orange transition-colors" />
                       </div>
                       <div>
                          <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest leading-none mb-1">Captured</p>
                          <p className="text-zinc-200 font-bold text-sm">{new Date(selectedImage.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                   <Button 
                      className="w-full h-14 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 flex items-center justify-center gap-2 group transition-all"
                      onClick={() => setSelectedImage(null)}
                   >
                     Return to Gallery
                     <X className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                   </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
