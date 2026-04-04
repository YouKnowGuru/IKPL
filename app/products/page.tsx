'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Product } from '@/types';
import { Search, ShoppingCart, Filter, ArrowRight, Sparkles, Star, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/shared/Toast';
import { getCategoryLabel } from '@/lib/utils';
import { cn, stripHtml } from '@/lib/utils';

const categories = ['all', 'broiler', 'layer', 'pig', 'cattle', 'fish', 'other'];

const categoryMeta: Record<string, { emoji: string; desc: string; color: string }> = {
  all: { emoji: '🌾', desc: 'All products', color: 'bg-zinc-100 dark:bg-zinc-800' },
  broiler: { emoji: '🐔', desc: 'Poultry growth feed', color: 'bg-orange-50 dark:bg-orange-950/20' },
  layer: { emoji: '🥚', desc: 'Layer hen nutrition', color: 'bg-yellow-50 dark:bg-yellow-950/20' },
  pig: { emoji: '🐷', desc: 'Swine developer feed', color: 'bg-pink-50 dark:bg-pink-950/20' },
  cattle: { emoji: '🐄', desc: 'Dairy & beef nutrition', color: 'bg-amber-50 dark:bg-amber-950/20' },
  fish: { emoji: '🐟', desc: 'Aquaculture pellets', color: 'bg-blue-50 dark:bg-blue-950/20' },
  other: { emoji: '🌱', desc: 'Other livestock', color: 'bg-green-50 dark:bg-green-950/20' },
};

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product) => void }) {
  return (
    <div className="group relative bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-100 dark:border-white/5 hover:border-agro-green/30 dark:hover:border-agro-green/30 transition-all duration-500 card-hover shadow-sm hover:shadow-xl">
      {/* Image */}
      <Link href={`/product/${product._id}`} className="block">
        <div className="relative h-32 xs:h-44 overflow-hidden bg-zinc-50 dark:bg-zinc-800">

          <NextImage
            src={product.image || '/images/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {(product.stock ?? 0) === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-red-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">Out of Stock</span>
            </div>
          )}

          {((product.stock ?? 0) > 0 && (product.stock ?? 0) < 10) && (
            <div className="absolute top-2.5 left-2.5 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              Only {product.stock ?? 0} left
            </div>
          )}
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <span className="text-white text-[10px] font-semibold flex items-center gap-1 backdrop-blur-md bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
              Details <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </div>
        </div>
      </Link>


      {/* Body */}
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-1 mb-2">
          <span className="text-[8px] sm:text-[9px] font-bold text-agro-green bg-agro-green/8 px-1.5 py-0.5 rounded-full uppercase tracking-[0.1em]">
            {getCategoryLabel(product.category)}
          </span>
        </div>

        <Link href={`/product/${product._id}`}>
          <h3 className="font-display font-bold text-xs sm:text-sm mb-1 group-hover:text-agro-green transition-colors leading-tight line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="hidden xs:block text-zinc-400 text-[10px] sm:text-[11px] line-clamp-1 sm:line-clamp-2 leading-relaxed mb-3 sm:mb-4 min-h-0 sm:min-h-[2.5rem]">
          {stripHtml(product.description)}
        </p>

        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-0 mt-auto">
          <span className="font-display font-bold text-sm sm:text-lg text-agro-green">Nu. {product.price.toLocaleString()}</span>

          <Button
            size="sm"
            onClick={() => onAddToCart(product)}
            disabled={(product.stock ?? 0) === 0}
            className={cn(
              'h-7 sm:h-8 px-2 sm:px-3 rounded-lg text-[9px] sm:text-[10px] font-bold border-0 transition-all shadow-sm',
              (product.stock ?? 0) === 0
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                : 'btn-glow-green text-white'
            )}
          >
            <ShoppingCart className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
            {(product.stock ?? 0) === 0 ? 'Out' : 'Buy'}
          </Button>
        </div>
      </div>

    </div>

  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) setDbCategories(data.categories);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  const availableCategories = ['all', ...dbCategories.map(c => c.slug)];

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '12');
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      const res = await fetch(`/api/products?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setTotalPages(data.pages || 1);
        setTotalCount(data.total || data.products.length);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, searchQuery]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleAddToCart = (product: Product) => {
    if ((product.stock ?? 0) === 0) { showToast('Product is out of stock', 'error'); return; }
    addToCart(product, 1);
    showToast(`${product.name} added to cart!`, 'success');
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); };
  const clearFilters = () => { setSearchQuery(''); setSelectedCategory('all'); setPage(1); };

  const getCategoryDisplay = (slug: string) => {
    if (slug === 'all') return { name: 'All Products', emoji: '🌾' };
    const found = dbCategories.find(c => c.slug === slug);
    return { 
      name: found?.name || slug.charAt(0).toUpperCase() + slug.slice(1),
      emoji: categoryMeta[slug]?.emoji || '🌱'
    };
  };

  return (
    <div className="flex flex-col overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[35vh] flex items-center pt-20 pb-12 overflow-hidden bg-zinc-950">
        <div className="absolute inset-0">
          <NextImage
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80"
            alt="Farmers in field"
            fill
            className="object-cover opacity-15"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/40" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-agro-green/10 border border-agro-green/20 text-agro-green text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-6">
            <Sparkles className="h-3 w-3" />
            Premium Feed Range
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            Our <span className="gradient-text-animate">Products</span>
          </h1>
          <p className="text-zinc-400 text-base max-w-lg mx-auto leading-relaxed">
            High-quality nutrition for superior results.
          </p>
        </div>
      </section>


      {/* ── Category Pills ────────────────────────────────────────── */}
      <section className="py-3 bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-100 dark:border-white/5 sticky top-14 md:top-16 z-30 backdrop-blur-xl">

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {availableCategories.map((cat) => {
              const display = getCategoryDisplay(cat);
              return (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setPage(1); }}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0',
                    selectedCategory === cat
                      ? 'bg-agro-green text-white shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-agro-green/10 hover:text-agro-green'
                  )}
                >
                  <span className="text-sm">{display.emoji}</span>
                  {display.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>


      {/* ── Main Content ──────────────────────────────────────────── */}
      <section className="py-12 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-xl border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 focus:border-agro-green focus:ring-agro-green/20 text-xs"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </form>

            <div className="flex gap-2 flex-shrink-0">
              <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setPage(1); }}>
                <SelectTrigger className="w-40 h-10 rounded-xl border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-xs focus:ring-agro-green/20">
                  <Filter className="h-3.5 w-3.5 mr-2 text-zinc-400" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-zinc-200 dark:border-white/10">
                  {availableCategories.map((cat) => {
                    const display = getCategoryDisplay(cat);
                    return (
                      <SelectItem key={cat} value={cat} className="rounded-lg text-xs">
                        {display.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {(searchQuery || selectedCategory !== 'all') && (
                <Button variant="outline" onClick={clearFilters} className="h-10 rounded-xl border-zinc-200 dark:border-white/10 text-xs font-bold hover:border-red-300 hover:text-red-500 transition-colors">
                  <X className="h-3.5 w-3.5 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>


          {/* Results count */}
          {!loading && (
            <p className="text-sm text-zinc-400 mb-6">
              Showing <span className="font-semibold text-zinc-700 dark:text-zinc-200">{products.length}</span> {products.length === 1 ? 'product' : 'products'}
              {selectedCategory !== 'all' && <span> in <span className="text-agro-green font-semibold">{getCategoryLabel(selectedCategory)}</span></span>}
              {searchQuery && <span> for "<span className="text-agro-orange font-semibold">{searchQuery}</span>"</span>}
            </p>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">


              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="h-[280px] md:h-[360px] rounded-2xl md:rounded-3xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-7xl mb-4">🔍</div>
              <h3 className="font-display font-bold text-xl mb-2">No products found</h3>
              <p className="text-zinc-400 mb-6 text-sm">Try adjusting your search or filter criteria.</p>
              <Button onClick={clearFilters} className="btn-glow-green rounded-2xl text-white font-bold border-0">
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">


              {products.map((product) => (
                <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-2xl h-11 w-11 border-zinc-200 dark:border-white/10 hover:border-agro-green hover:text-agro-green disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={cn(
                      'w-10 h-10 rounded-xl text-sm font-bold transition-all',
                      page === i + 1
                        ? 'bg-agro-green text-white shadow-md shadow-agro-green/20'
                        : 'bg-white dark:bg-zinc-900 text-zinc-500 hover:bg-agro-green/10 hover:text-agro-green border border-zinc-200 dark:border-white/10'
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-2xl h-11 w-11 border-zinc-200 dark:border-white/10 hover:border-agro-green hover:text-agro-green disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
