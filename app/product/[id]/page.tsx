'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Product, Review } from '@/types';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/shared/Toast';
import { 
  ArrowLeft, ShoppingCart, Star, Minus, Plus, Check, 
  MapPin, ShieldCheck, Award, Zap, Wheat, FlaskConical,
  Store, Info, AlertTriangle, ChevronRight
} from 'lucide-react';
import { getCategoryLabel, formatDate, stripHtml, cn } from '@/lib/utils';


export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  
  const [product, setProduct] = useState<any | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Please enter a comment', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: params.id, rating, comment })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        setComment('');
        setRating(5);
      } else {
        showToast(data.message || 'Error submitting review', 'error');
      }
    } catch (err) {
      showToast('An error occurred', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [100, 200], [0, 1]);
  const headerY = useTransform(scrollY, [100, 200], [-20, 0]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
      fetchReviews();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if ((product.stock ?? 0) === 0) {
      showToast('Product is out of stock', 'error');
      return;
    }
    addToCart(product, quantity);
    showToast(`${product.name} added to cart`, 'success');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-[3rem]" />
          <div className="space-y-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-32 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-14 w-32 rounded-2xl" />
              <Skeleton className="h-14 flex-1 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center min-h-screen">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
          <h1 className="text-3xl font-display font-bold mb-3">Product Not Found</h1>
          <p className="text-zinc-500 mb-6 max-w-md mx-auto text-base leading-relaxed">
            The premium agricultural feed you're looking for might have been moved or is currently unavailable.
          </p>
          <Link href="/products">
            <Button className="btn-glow-green text-white font-bold h-11 px-7 rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }


  const stockStatus = (p: any) => {
    const s = p.stock ?? 0;
    if (s === 0) return { label: 'Out of Stock', color: 'text-red-500 bg-red-500/10' };
    if (s < 10) return { label: `Low Stock: ${s} left`, color: 'text-amber-500 bg-amber-500/10 font-bold' };
    return { label: 'In Stock', color: 'text-agro-green bg-agro-green/10 font-bold' };
  };

  const images = product.images?.length > 0 ? product.images : [product.image || '/images/placeholder-product.jpg'];

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen bg-white dark:bg-zinc-950">
      
      {/* ── STICKY HEADER ────────────────────────────────────────────── */}
      <motion.div 
        style={{ opacity: headerOpacity, y: headerY }}
        className="fixed top-0 left-0 right-0 z-[100] h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-100 dark:border-white/5 flex items-center justify-between px-4 sm:px-8 pointer-events-none data-[active=true]:pointer-events-auto"
        data-active={isScrolled}
      >
        <div className="flex items-center gap-4">
          <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-zinc-100">
            <Image src={product.image || images[0]} alt={product.name} fill className="object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-sm truncate max-w-[150px] sm:max-w-[300px]">{product.name}</h3>
            <p className="text-agro-green font-bold text-xs">Nu. {product.price.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Button 
            size="sm"
            onClick={handleAddToCart}
            className="btn-glow-green text-white font-bold h-10 px-6 rounded-xl text-xs"
            disabled={(product.stock ?? 0) === 0}
          >
            Add to Cart
          </Button>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12">
          <Link href="/products" className="inline-flex items-center text-sm font-bold text-zinc-400 hover:text-agro-green transition-colors group">
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mr-3 group-hover:bg-agro-green group-hover:text-white transition-all">
              <ArrowLeft className="h-4 w-4" />
            </div>
            Back to Catalog
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-widest bg-zinc-50 dark:bg-zinc-900 px-4 py-2 rounded-full border border-zinc-100 dark:border-white/5 self-start sm:self-auto">
             Inventory ID: <span className="text-agro-orange">{product._id.slice(-8)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-start">
          
          {/* LEFT: Premium Visuals */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative aspect-square rounded-3xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 shadow-xl group"
            >

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={images[currentImage]}
                    alt={product.name}
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />
              
              {/* Overlay Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-3">
                <Badge className={cn("px-4 py-2 rounded-2xl border-0 text-xs font-bold uppercase tracking-wider backdrop-blur-md", stockStatus(product).color)}>
                  {stockStatus(product).label}
                </Badge>
                {product.status === 'active' && (
                  <Badge className="bg-white/10 text-white backdrop-blur-md border border-white/20 uppercase tracking-widest px-4 py-2 rounded-2xl text-[10px] font-bold">
                    <Zap className="h-3 w-3 mr-1 text-amber-400 fill-amber-400" /> Premium Quality
                  </Badge>
                )}
              </div>
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4 p-2 overflow-x-auto scrollbar-hide">
                {images.map((img: string, i: number) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={cn(
                      "relative h-20 w-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0",
                      currentImage === i ? "border-agro-green shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <Image src={img} alt="Thumb" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Signals Card */}
            <Card className="rounded-3xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 overflow-hidden shadow-sm">
              <CardContent className="p-6 grid grid-cols-3 gap-4">
                {[
                  { icon: ShieldCheck, label: 'ISO certified', color: 'text-emerald-500' },
                  { icon: Award, label: 'Quality Tested', color: 'text-blue-500' },
                  { icon: Wheat, label: '100% Organic', color: 'text-amber-500' }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-2">
                    <div className={cn("w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-inner-sm", item.color)}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">{item.label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>

          {/* RIGHT: Product Details */}
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 text-agro-green bg-agro-green/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em] mb-6">
                <FlaskConical className="h-4 w-4" /> {getCategoryLabel(product.category)}
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-display font-bold leading-tight mb-3 text-zinc-900 dark:text-white">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Brand: IKPL Premium</span>
              </div>

              <div className="flex items-end gap-2 mb-8">
                <span className="text-4xl font-display font-bold text-agro-green leading-none">
                  Nu. {product.price.toLocaleString()}
                </span>
                <span className="text-sm text-zinc-400 font-medium mb-1 opacity-60">/ Bag</span>
              </div>

              <div 
                className="prose prose-zinc dark:prose-invert max-w-none text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8 text-base"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />

              {/* Add to Cart Section */}
              <div className="p-6 bg-zinc-950 rounded-3xl shadow-xl relative overflow-hidden mb-10">
                {/* Visual mesh */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-agro-green/10 rounded-full blur-[40px]" />
                
                <div className="relative z-10 flex flex-col gap-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Quantity</p>
                      <div className="flex items-center bg-white/5 border border-white/10 rounded-xl h-12 w-fit px-1.5">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setQuantity(q => Math.max(1, q-1))}
                          disabled={quantity <= 1}
                          className="h-8 w-8 text-white hover:bg-white/10 hover:text-white rounded-lg"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-10 text-center text-white font-bold text-lg">{quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setQuantity(q => Math.min(product.stock ?? 999, q+1))}
                          className="h-8 w-8 text-white hover:bg-white/10 hover:text-white rounded-lg"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-left sm:text-right mt-2 sm:mt-0 border-t border-white/10 sm:border-0 pt-4 sm:pt-0">
                      <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-0.5">Estimated Total</p>
                      <p className="text-2xl font-display font-bold text-white">Nu. {(product.price * quantity).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <Button 
                      onClick={handleAddToCart}
                      disabled={(product.stock ?? 0) === 0}
                      className="w-full h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-base transition-all border border-zinc-700"
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Bag
                    </Button>
                    <Button 
                      onClick={() => {
                        handleAddToCart();
                        router.push('/checkout');
                      }}
                      disabled={(product.stock ?? 0) === 0}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-agro-orange to-amber-500 hover:from-agro-orange hover:to-amber-500 text-zinc-950 font-bold text-base group shadow-lg transition-all border-0"
                    >
                      Place Order
                      <ChevronRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>


                  <div className="flex items-center justify-center gap-6 mt-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      <Store className="h-3 w-3 text-agro-green" /> 20 Pickup Stores
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      <ShieldCheck className="h-3 w-3 text-agro-green" /> Secure Order
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Store Stock Indicators */}
              <details className="group border border-zinc-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
                <summary className="flex items-center justify-between p-5 sm:p-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                  <h3 className="text-lg sm:text-xl font-display font-bold">Store Availability</h3>
                  <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center gap-3 mr-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <div className="h-2 w-2 rounded-full bg-agro-green" /> High
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <div className="h-2 w-2 rounded-full bg-amber-500" /> Low
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <div className="h-2 w-2 rounded-full bg-red-500" /> Out
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3 py-1.5 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-white/10 group-open:text-agro-green flex items-center gap-1">
                       Check <ChevronRight className="h-3 w-3 group-open:rotate-90 transition-transform duration-300" />
                    </div>
                  </div>
                </summary>
                
                <div className="p-5 sm:p-6 border-t border-zinc-100 dark:border-white/5 bg-white dark:bg-zinc-950">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.inventoryByLocation?.length > 0 ? (
                      product.inventoryByLocation.map((inv: any) => (
                        <div key={inv.locationId} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 flex items-center justify-between group-hover/card:border-agro-green/30 transition-all group/card">

                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center",
                              inv.stock > 10 ? "bg-agro-green/10 text-agro-green" : inv.stock > 0 ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                            )}>
                              <Store className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold text-sm leading-tight">{inv.name}</p>
                              <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-tight">{inv.district}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={cn(
                              "text-sm font-black",
                              inv.stock > 0 ? "text-zinc-900 dark:text-white" : "text-zinc-300"
                            )}>{inv.stock} <span className="text-[10px] font-medium text-zinc-400">BAGS</span></p>
                            <p className="text-[10px] font-bold text-zinc-400 tracking-tighter">STOCK LEVEL</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 p-6 rounded-[2rem] bg-zinc-50 dark:bg-white/5 border border-dashed border-zinc-100 flex flex-col items-center text-center gap-2 text-zinc-400">
                         <MapPin className="h-8 w-8 mb-2 opacity-40" />
                         <p className="text-sm font-bold uppercase tracking-widest">Store availability unknown</p>
                         <p className="text-xs">Please contact HQ for stock inquiries.</p>
                      </div>
                    )}
                  </div>
                </div>
              </details>

            </motion.div>
          </div>
        </div>

        {/* DETAILS TABS */}
        <div className="mt-24">
          <Tabs defaultValue="nutrition" className="w-full">
            <div className="flex justify-start sm:justify-center overflow-x-auto scrollbar-hide border-b border-zinc-100 dark:border-white/5 mb-10 pb-px">
              <TabsList className="bg-transparent h-auto p-0 gap-6 sm:gap-8 flex-nowrap min-w-max">
                <TabsTrigger 
                  value="nutrition" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-agro-green border-b-2 border-transparent data-[state=active]:border-agro-green rounded-none px-2 pb-4 pt-0 h-auto font-display font-bold text-base sm:text-lg text-zinc-400"
                > Nutritional Specs </TabsTrigger>
                <TabsTrigger 
                  value="reviews" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-agro-green border-b-2 border-transparent data-[state=active]:border-agro-green rounded-none px-2 pb-4 pt-0 h-auto font-display font-bold text-base sm:text-lg text-zinc-400"
                > Client Reviews ({reviews.length}) </TabsTrigger>
                <TabsTrigger 
                  value="faq" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-agro-green border-b-2 border-transparent data-[state=active]:border-agro-green rounded-none px-2 pb-4 pt-0 h-auto font-display font-bold text-base sm:text-lg text-zinc-400"
                > Expert Q&A </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="nutrition" className="mt-0 outline-none">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { label: 'Protien CONTENT', value: product.nutrients?.protein || '0', sub: 'Essential Amino Acids', icon: Zap, color: 'from-blue-500 to-indigo-600' },
                  { label: 'Fat CONTENT', value: product.nutrients?.fat || '0', sub: 'Healthy Omega-3/6', icon: Sparkles, color: 'from-amber-400 to-orange-500' },
                  { label: 'Fiber CONTENT', value: product.nutrients?.fiber || '0', sub: 'Digestive Health', icon: Wheat, color: 'from-emerald-400 to-green-600' },
                  { label: 'Moisture MAX', value: product.nutrients?.moisture || '0', sub: 'Optimal Storage', icon: FlaskConical, color: 'from-zinc-400 to-zinc-600' }
                ].map((spec, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="group dark:bg-white/5 border border-zinc-100 dark:border-white/5 p-4 sm:p-6 rounded-3xl card-hover flex flex-col gap-3 sm:gap-4 overflow-hidden"
                  >
                    <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-md flex-shrink-0", spec.color)}>
                      <spec.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-1 line-clamp-1">{spec.label}</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-display font-bold text-zinc-900 dark:text-white">{spec.value}</span>
                        <span className="text-base sm:text-lg font-bold text-zinc-400">%</span>
                      </div>
                      <div className="mt-2 sm:mt-3 h-1.5 w-full bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">


                         <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${Math.min(100, (parseFloat(spec.value) || 0) * 2)}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={cn("h-full bg-gradient-to-r", spec.color)}
                         />
                      </div>
                      <p className="mt-4 text-xs font-medium text-zinc-500 opacity-60 uppercase tracking-widest">{spec.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-0 outline-none">
              <div className="max-w-4xl mx-auto space-y-6">

                {/* Review Form */}
                {user ? (
                  <form onSubmit={submitReview} className="p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[2rem] shadow-sm mb-8">
                    <h3 className="text-xl font-display font-bold mb-4">Write a Review</h3>
                    <div className="mb-4">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Rating</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 focus:outline-none"
                          >
                            <Star className={cn("h-6 w-6 transition-colors", star <= rating ? "text-amber-500 fill-amber-500" : "text-zinc-300 dark:text-zinc-700")} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Your Experience</p>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tell us what you think about this product..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-agro-green outline-none resize-none transition-all"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={submittingReview} 
                      className="btn-glow-green text-white font-bold h-11 px-8 rounded-xl disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </form>
                ) : (
                  <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-2xl flex items-center justify-between mb-8">
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Please log in to share your experience with this product.</p>
                    <Link href={`/login?redirect=/product/${params.id}`}>
                      <Button variant="outline" className="rounded-xl font-bold bg-white dark:bg-black">Log In</Button>
                    </Link>
                  </div>
                )}

                {reviews.length === 0 ? (
                  <div className="py-20 text-center bg-zinc-50 dark:bg-white/5 rounded-[3rem] border border-dashed border-zinc-200 dark:border-white/10">
                     <p className="text-zinc-400 font-bold uppercase tracking-widest">No reviews yet</p>
                  </div>
                ) : (
                  reviews.map((r, i) => (
                    <Card key={r._id} className="rounded-3xl border-zinc-100 dark:border-white/5 shadow-sm">
                      <CardContent className="p-8">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-agro-green/10 text-agro-green flex items-center justify-center font-black text-lg">
                              {r.user?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-black text-lg leading-tight">{r.user?.name || 'Unknown User'}</p>
                              <p className="text-xs text-zinc-400 font-medium">{formatDate(r.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, s) => (
                              <Star key={s} className={cn("h-4 w-4", s < r.rating ? "text-amber-500 fill-amber-500" : "text-zinc-200 dark:text-white/5")} />
                            ))}
                          </div>
                        </div>
                        <p className="mt-6 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                          {r.comment}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="faq" className="mt-0 outline-none">
               <div className="max-w-3xl mx-auto grid grid-cols-1 gap-6">
                 {[
                   { q: 'Is this feed suitable for all climates in Bhutan?', a: 'Yes, our formula is specifically stabilized for the diverse humidity and temperature ranges of the kingdom.' },
                   { q: 'How long can I store unopened bags?', a: 'When kept in a cool, dry place, the nutritional value is guaranteed for up to 6 months from the date of manufacture.' },
                   { q: 'Can I pick up orders directly from the warehouse?', a: 'You can choose any of our 20+ distribution centers during checkout for convenient pickup within 24-48 hours.' }
                 ].map((item, i) => (
                   <div key={i} className="p-8 rounded-[2rem] bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 group transition-all">
                     <h3 className="flex items-center gap-3 font-display font-black text-xl mb-3">
                       <div className="w-8 h-8 rounded-full bg-agro-green text-white flex items-center justify-center text-xs">Q</div>
                       {item.q}
                     </h3>
                     <p className="text-zinc-500 dark:text-zinc-400 pl-11 text-lg leading-relaxed">{item.a}</p>
                   </div>
                 ))}
               </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

const Sparkles = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);


