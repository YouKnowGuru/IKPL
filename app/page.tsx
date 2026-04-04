'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, Variants } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/types';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/shared/Toast';
import {
  ArrowRight, Leaf, Truck, Shield, Award, ChevronDown,
  Star, CheckCircle, Zap, Globe, Users, TrendingUp, FlaskConical,
  HeartHandshake, ArrowUpRight, Sparkles, ShoppingCart, LogIn,
  UserPlus, Play, BadgeCheck, Wheat, Fish, Beef, Egg, MapPin, LineChart, Package,
  Handshake
} from 'lucide-react';


import { stripHtml } from '@/lib/utils';

// ─── Animated Counter ──────────────────────────────────────────────────
function AnimatedCounter({ end, suffix = '', prefix = '' }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let s = 0;
        const step = end / (2000 / 16);
        const t = setInterval(() => {
          s += step;
          if (s >= end) { setCount(end); clearInterval(t); }
          else setCount(Math.floor(s));
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ─── Particle Canvas ───────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    const setSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    setSize();
    window.addEventListener('resize', setSize);

    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number; }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5,
        o: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(77,137,0,${p.o})`;
        ctx.fill();
      });
      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(77,137,0,${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', setSize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// ─── Product Card ──────────────────────────────────────────────────────
function ProductCard({ product, index }: { product: Product; index: number }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if ((product.stock ?? 0) === 0) { showToast('Out of stock', 'error'); return; }
    if (!user) { showToast('Please login to add items to cart', 'error'); return; }
    setAdding(true);
    await new Promise(r => setTimeout(r, 300));
    addToCart(product, 1);
    showToast(`${product.name} added to cart!`, 'success');
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Link href={`/product/${product._id}`}>
      <div
        className="group relative bg-white dark:bg-zinc-900 rounded-xl sm:rounded-3xl overflow-hidden border border-zinc-100 dark:border-white/5 hover:border-agro-green/40 dark:hover:border-agro-green/30 transition-all duration-500 shadow-sm cursor-pointer"
        style={{ animationDelay: `${index * 0.08}s` }}
      >


        {/* Image */}
        <div className="relative h-32 xs:h-40 sm:h-56 overflow-hidden bg-zinc-50 dark:bg-zinc-800">


          <Image
            src={product.image || '/images/placeholder-product.jpg'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {(product.stock ?? 0) === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full">Out of Stock</span>
            </div>
          )}
          {((product.stock ?? 0) > 0 && (product.stock ?? 0) < 10) && (
            <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide animate-pulse">
              Only {product.stock} left
            </div>
          )}
          {/* Quick view label */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300">
            <span className="text-white text-xs font-semibold flex items-center gap-1 backdrop-blur-sm bg-white/20 px-3 py-1.5 rounded-full border border-white/20">
              View Details <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-5">


          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-agro-green bg-agro-green/8 px-2.5 py-1 rounded-full uppercase tracking-[0.1em]">
              {product.category}
            </span>
          </div>
          <h3 className="font-display font-bold text-xs sm:text-base mb-1 group-hover:text-agro-green transition-colors leading-tight line-clamp-1">
            {product.name}
          </h3>
          <p className="hidden xs:block text-zinc-400 text-[10px] sm:text-xs line-clamp-1 sm:line-clamp-2 mb-3 sm:mb-4 leading-relaxed">
            {stripHtml(product.description)}
          </p>


          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <span className="font-display font-bold text-base sm:text-xl text-agro-green">Nu. {product.price.toFixed(0)}</span>
            <button
              onClick={handleAdd}
              disabled={(product.stock ?? 0) === 0 || adding}
              className={`h-7 sm:h-9 px-2 sm:px-3 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold border-0 transition-all duration-300 flex items-center gap-1 sm:gap-1.5 ${added
                ? 'bg-emerald-500 text-white scale-95'
                : (product.stock ?? 0) === 0
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                  : 'btn-glow-green text-white hover:scale-105'
                }`}
            >
              {added ? (
                <><CheckCircle className="h-2.5 sm:h-3.5 w-2.5 sm:w-3.5" /> Added</>
              ) : adding ? (
                <><div className="h-2.5 sm:h-3.5 w-2.5 sm:w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> ...</>
              ) : (
                <><ShoppingCart className="h-2.5 sm:h-3.5 w-2.5 sm:w-3.5" /> Buy</>
              )}
            </button>
          </div>

        </div>
      </div>
    </Link>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────
export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 150]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const heroImages = [
    "https://images.pexels.com/photos/7781984/pexels-photo-7781984.jpeg",
    "https://images.pexels.com/photos/10041325/pexels-photo-10041325.jpeg",
    "https://images.unsplash.com/photo-1667388600917-e5e06c407ff1?q=80&w=1170&auto=format&fit=crop",
    "/banner2.jpg"
  ];

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.2, duration: 0.8 } }
  };
  const { user } = useAuth();

  useEffect(() => {
    // Fetch products
    fetch('/api/products?limit=8')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setFeaturedProducts(data.products); })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Fetch team
    fetch('/api/team')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setTeam(data.team); })
      .catch(console.error);

    // Fetch partners
    fetch('/api/partners')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setPartners(data.partners); })
      .catch(console.error);

    // Fetch reviews
    fetch('/api/reviews?limit=6')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && data.reviews) setTestimonials(data.reviews); })
      .catch(console.error);
  }, []);




  const stats = [
    { value: 20000, suffix: '+', label: 'Happy Farmers', icon: Users },
    { value: 20, suffix: '+', label: 'Years Excellence', icon: Award },
    { value: 50, suffix: '+', label: 'Feed Formulas', icon: FlaskConical },
    { value: 25, suffix: '', label: 'States Covered', icon: Globe },
  ];

  const features = [
    { icon: Leaf, title: '100% Organic', desc: 'Natural ingredients, zero synthetic additives or hormones.', color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { icon: Shield, title: 'ISO Certified', desc: 'Rigorous lab testing in our ISO 9001-certified facilities.', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { icon: MapPin, title: 'Store Pickup', desc: 'Ready for pickup in 24-48 hrs in 20 states across Bhutan.', color: 'from-orange-500 to-amber-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
    { icon: HeartHandshake, title: 'Vet Support', desc: 'Expert nutritionists guiding your farm success.', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  ];



  const marqueeItems = [
    '🐔 Premium Broiler Feed', '🥚 Organic Layer Mash', '🐄 Cattle Growth Formula',
    '🐟 Aquaculture Pellets', '🐷 Pig Developer Feed', '🌱 Probiotic Supplements',
    '⚗️ Mineral Premixes', '🌾 Starter Crumbles', '🔬 Finisher Pellets', '🏆 Breeder Ration',
  ];

  const feedCategories = [
    { icon: '🐔', label: 'Poultry', href: '/products?cat=broiler', sub: 'Broiler & Layer' },
    { icon: '🐄', label: 'Cattle', href: '/products?cat=cattle', sub: 'Dairy & Beef' },
    { icon: '🐟', label: 'Aquaculture', href: '/products?cat=fish', sub: 'Fish & Shrimp' },
    { icon: '🐷', label: 'Swine', href: '/products?cat=pig', sub: 'Pig Developer' },
  ];

  return (
    <div className="flex flex-col overflow-x-hidden">

      {/* ════════════════════════════════════════════════════════════
          HERO — Modern SaaS-Level Framer Motion
      ════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-[85vh] sm:min-h-[100vh] flex items-center pt-20 sm:pt-24 pb-8 sm:pb-12 overflow-hidden bg-zinc-950">

        {/* Animated Mesh / Blobs Background */}
        <div className="absolute inset-0 z-0 opacity-40">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-agro-orange/20 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-agro-green/15 rounded-full blur-[150px]"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-950/20 via-zinc-950/80 to-zinc-950 z-10" />
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* LEFT COLUMN: Content */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="flex flex-col text-center lg:text-left items-center lg:items-start space-y-3 sm:space-y-6 max-w-3xl mx-auto lg:mx-0"
            >


              <motion.div variants={fadeUp} className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/5 border border-white/10 text-agro-orange text-[10px] sm:text-sm font-semibold px-3 sm:px-5 py-2 sm:py-2.5 rounded-full backdrop-blur-md w-fit shadow-[0_0_20px_rgba(255,174,0,0.1)]">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-zinc-200 tracking-wide">Premium Wholesale</span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="font-display font-extrabold text-white text-2xl sm:text-5xl md:text-6xl lg:text-[4rem] leading-[1.1] sm:leading-[1.05] tracking-tight">
                Bhutan’s Trusted <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-agro-orange via-amber-400 to-agro-green bg-clip-text text-transparent">Agriculture Partner</span>
              </motion.h1>


              <motion.p variants={fadeUp} className="text-sm sm:text-xl md:text-2xl text-zinc-400 font-medium max-w-xl leading-relaxed">
                Delivering reliable supply chains of premium noodles and high-quality livestock feeds.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <Link href="/products" className="w-full sm:w-auto">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="h-11 sm:h-14 px-6 sm:px-8 w-full btn-glow-orange bg-gradient-to-r from-agro-orange to-amber-500 hover:from-agro-orange hover:to-amber-500 text-black font-bold text-sm sm:text-lg rounded-xl sm:rounded-2xl shadow-xl flex items-center justify-center gap-2">
                      <Package className="h-4 w-4 sm:h-5 sm:w-5" /> Explore Products
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/contact" className="w-full sm:w-auto">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" className="h-11 sm:h-14 px-6 sm:px-8 w-full bg-white/5 hover:bg-white/10 border-white/10 text-white font-bold text-sm sm:text-lg rounded-xl sm:rounded-2xl backdrop-blur-md transition-all flex items-center justify-center">
                      Contact Us
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>

            {/* RIGHT COLUMN: Visuals */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="relative w-full h-[280px] sm:h-[500px] lg:h-[650px] flex items-center justify-center mt-4 sm:mt-8 lg:mt-0"
            >


              {/* Main Image Base with Slider */}
              <motion.div style={{ y: y1 }} className="absolute right-0 lg:-right-4 w-[90%] sm:w-[85%] h-[85%] rounded-2xl sm:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_30px_100px_rgba(255,174,0,0.15)] flex items-center justify-center z-10 glass-dark">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentHeroIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={heroImages[currentHeroIndex]}
                      alt="IKPL Premium Banner"
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
                
                <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950/40 via-transparent to-agro-orange/5 pointer-events-none" />
                
                {/* Navigation Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {heroImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentHeroIndex(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        currentHeroIndex === idx ? 'w-8 bg-agro-green' : 'w-2 bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Floating Element 1 - Noodles (Hidden on small mobile) */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[8%] left-[-4%] z-20 w-[35%] sm:w-[42%] aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/20 glass-dark hidden xs:block"
              >
                <Image src="https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80" alt="Premium Noodles" fill sizes="33vw" className="object-cover opacity-90 hover:scale-110 transition-transform duration-700" />
              </motion.div>


              {/* Floating Element 2 - Feed / Livestock (Smaller on mobile) */}
              <motion.div
                style={{ y: y2 }}
                className="absolute bottom-[2%] left-[4%] z-20 w-[35%] sm:w-[50%] aspect-square rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/20 glass-dark p-1 sm:p-2"
              >
                <div className="relative w-full h-full rounded-xl overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80" alt="Livestock" fill sizes="33vw" className="object-cover opacity-90 hover:scale-110 transition-transform duration-700" />
                </div>
              </motion.div>


              {/* Glassmorphism Stats Cards */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="absolute top-[5%] right-[-5%] lg:right-[-2%] z-30 bg-white/10 backdrop-blur-3xl border border-white/20 text-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-2xl hidden xs:block"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-agro-orange text-zinc-950 p-2 rounded-xl flex items-center justify-center">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <div>
                    <p className="font-bold text-lg leading-tight">100+</p>
                    <p className="text-[10px] text-zinc-300 uppercase tracking-wider">Retail Partners</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
                className="absolute bottom-[10%] right-[-5%] z-30 bg-white/10 backdrop-blur-3xl border border-white/20 text-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-2xl flex flex-col gap-1 hidden xs:block"
              >
                <div className="flex -space-x-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-agro-green border border-white/20 flex items-center justify-center font-bold text-[10px]">P</div>
                  <div className="w-8 h-8 rounded-full bg-amber-500 border border-white/20 flex items-center justify-center font-bold text-[10px]">F</div>
                  <div className="w-8 h-8 rounded-full bg-blue-500 border border-white/20 flex items-center justify-center font-bold text-[10px]">A</div>
                </div>
                <p className="font-bold text-sm">Premium Quality Supply</p>
                <p className="text-[10px] text-zinc-300 flex items-center gap-1">
                  <svg className="h-3 w-3 text-agro-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Trusted Across Bhutan
                </p>
              </motion.div>

            </motion.div>

          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        >
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-white/20 flex justify-center py-1 bg-white/5 backdrop-blur-sm">
            <div className="w-1 h-2 bg-agro-orange rounded-full" />
          </div>
        </motion.div>

      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────── */}
      <div className="bg-agro-green py-3.5 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-agro-green via-transparent to-agro-green z-10 pointer-events-none" />
        <div className="marquee-container">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-3 mx-8 text-white/90 font-semibold text-sm">
                <span className="w-1 h-1 bg-white/40 rounded-full flex-shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── AUTH NUDGE (for guests only) ──────────────────────────────── */}
      {!user && (
        <div className="bg-gradient-to-r from-agro-green/90 to-emerald-700 py-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-white flex-shrink-0" />
              <p className="text-white text-sm font-semibold">
                Create a free account to unlock exclusive pricing, order tracking & expert consultations.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/login">
                <button className="bg-white/20 hover:bg-white/30 text-white text-sm font-bold px-5 py-2 rounded-xl transition-all">
                  Login
                </button>
              </Link>
              <Link href="/register">
                <button className="bg-white text-agro-green text-sm font-bold px-5 py-2 rounded-xl hover:scale-105 transition-all shadow-md">
                  Sign Up Free →
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── STATS ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-8" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {stats.map(({ value, suffix, label, icon: Icon }, i) => (
              <div
                key={label}
                className="group glass-dark rounded-2xl sm:rounded-3xl p-4 sm:p-7 text-center border border-white/5 hover:border-agro-green/30 transition-all duration-500"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-agro-green/15 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4 group-hover:bg-agro-green/25 transition-colors">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-agro-green" />
                </div>
                <div className="stat-number text-2xl sm:text-4xl text-white mb-1 sm:mb-1.5 gradient-text">
                  <AnimatedCounter end={value} suffix={suffix} />
                </div>
                <div className="text-zinc-500 text-[9px] sm:text-xs font-medium uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────────────────── */}
      <section className="py-10 sm:py-20 bg-white dark:bg-zinc-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-agro-green/10 text-agro-green text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4">
                <FlaskConical className="h-3.5 w-3.5" />
                Featured Products
              </div>
              <h2 className="text-display font-display font-bold">
                Premium <span className="gradient-text">Products</span>
              </h2>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {!user && (
                <Link href="/login">
                  <Button variant="outline" size="sm" className="rounded-xl border-agro-green/30 text-agro-green hover:bg-agro-green hover:text-white font-semibold text-xs gap-1.5 h-9">
                    <LogIn className="h-3.5 w-3.5" />
                    Login to Order
                  </Button>
                </Link>
              )}
              <Link href="/products">
                <Button variant="outline" className="rounded-2xl border-zinc-200 dark:border-white/10 font-bold text-sm hover:border-agro-green hover:text-agro-green group">
                  All Products
                  <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {!user && (
            <div className="mb-8 p-4 rounded-2xl bg-agro-green/5 border border-agro-green/15 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-agro-green flex-shrink-0" />
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  <Link href="/login" className="text-agro-green font-bold hover:underline">Login</Link> or{' '}
                  <Link href="/register" className="text-agro-orange font-bold hover:underline">create an account</Link> to add items to your cart and place orders.
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {[...Array(loading ? 8 : 0)].map((_, i) => <Skeleton key={i} className="h-[280px] md:h-[380px] rounded-2xl md:rounded-3xl" />)}
            </div>

          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {featuredProducts.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
            </div>


          )}
        </div>
      </section>

      {/* ── STRATEGIC PARTNERS ────────────────────────────────────────── */}
      <section className="py-12 sm:py-24 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
              <div className="lg:w-1/3">
                 <div className="inline-flex items-center gap-2 bg-agro-orange/10 text-agro-orange text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-6">
                    <Handshake className="h-4 w-4" />
                    Our Partners
                 </div>
                 <h2 className="text-2xl sm:text-4xl font-display font-bold leading-tight mb-4">Strategic <br className="hidden sm:block" /><span className="gradient-text">Wholesale Network</span></h2>
                 <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-lg">We bridge the gap between world-class manufacturing and local farmers through elite brand partnerships.</p>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
                 {[
                   { name: 'Noodles', label: 'Quality Food Products', desc: 'Premium food range catering to households across the kingdom.', href: null },
                   { name: 'UDOR Feeds', label: 'Animal Nutrition', desc: 'Expertly formulated livestock feeds for farmers and cooperatives.', href: '/udoor' }
                 ].map((p, i) => (
                   <div key={i} className="group p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-white/5 card-hover shadow-sm flex flex-col">
                      <div className="text-agro-green font-black text-2xl mb-2 group-hover:scale-105 transition-transform">{p.name}</div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">{p.label}</div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8 flex-1">{p.desc}</p>
                      {p.href && (
                        <Link href={p.href}>
                          <Button variant="outline" className="rounded-xl border-zinc-200 dark:border-white/10 h-11 text-xs font-bold w-full group/btn">
                            View Brand Profile
                            <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      )}
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 bg-agro-green/10 text-agro-green text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4">
              <Zap className="h-3.5 w-3.5" />
              Why Choose IKPL
            </div>
            <h2 className="text-display font-display font-bold">
              Built for the{' '}<span className="gradient-text">Modern Farmer</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 stagger-children">


            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className={`group p-4 sm:p-7 rounded-xl sm:rounded-3xl ${bg} border border-transparent hover:border-agro-green/20 transition-all duration-500`}>
                <div className={`w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br ${color} rounded-lg sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                  <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="font-display font-bold text-xs sm:text-lg mb-1 sm:mb-2">{title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-none">{desc}</p>
              </div>


            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT HIGHLIGHT ───────────────────────────────────────────── */}
      <section className="py-10 sm:py-16 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="relative h-[250px] sm:h-[380px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-zinc-100 dark:border-white/5">

                <Image
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=900&q=80"
                  alt="Farmers"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="absolute -bottom-5 -right-2 sm:-right-6 bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-2xl border border-zinc-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-agro-orange rounded-2xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-lg sm:text-xl gradient-text">+47%</div>
                    <div className="text-zinc-400 text-[10px] sm:text-xs">Avg. Yield Increase</div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -left-2 sm:-left-4 bg-agro-orange rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 shadow-xl">
                <div className="text-white font-display font-bold text-xl sm:text-3xl">20+</div>
                <div className="text-white/80 text-[10px] sm:text-xs">Years Experience</div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-agro-green/10 text-agro-green text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-6">
                <Award className="h-3.5 w-3.5" /> About IKPL
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-4 leading-tight text-center lg:text-left">
                Rooted in Tradition,<br /><span className="gradient-text">Growing with Logistics</span>
              </h2>


              <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base leading-relaxed mb-8 text-center lg:text-left max-w-xl mx-auto lg:mx-0">
                For over two decades, IKPL has been the distribution backbone of successful farms across the nation. We strategically partner with top global brands to bring you the highest quality agricultural products and livestock feeds.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { label: 'Sourcing Experts', value: '25+' }, { label: 'Distribution Hubs', value: '12' },
                  { label: 'Brand Partners', value: '40+' }, { label: 'Satisfaction Rate', value: '99%' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-4">
                    <div className="font-display font-bold text-2xl gradient-text">{value}</div>
                    <div className="text-zinc-500 text-xs mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center lg:justify-start">
                <Link href="/about">
                  <Button className="btn-glow-green h-11 sm:h-12 px-7 text-white font-bold rounded-2xl border-0 group">
                    Our Story <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── OUR TEAM ─────────────────────────────────────────────────── */}
      {team.length > 0 && (
        <section className="py-10 sm:py-20 bg-zinc-50 dark:bg-zinc-950/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-lg mx-auto mb-12">
              <div className="inline-flex items-center gap-2 bg-agro-green/10 text-agro-green text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-3">
                <Users className="h-3.5 w-3.5" /> Meet the Experts
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold">
                Our Dedicated <span className="gradient-text">Leadership</span>
              </h2>

              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-4">
                The visionary minds behind Bhutan's most reliable agricultural distribution network.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">


              {team.map((member, i) => (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group"
                >
                  <div className="relative h-44 sm:h-72 rounded-xl sm:rounded-2xl overflow-hidden mb-2 sm:mb-4 shadow-sm border border-zinc-100 dark:border-white/5">

                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5">
                      <h3 className="text-white font-display font-bold text-sm sm:text-xl">{member.name}</h3>
                      <p className="text-agro-green text-[8px] sm:text-xs font-bold uppercase tracking-widest">{member.title}</p>
                    </div>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-sm leading-relaxed line-clamp-2 md:line-clamp-3 text-center sm:text-left px-1 sm:px-2">
                    {member.description}
                  </p>


                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}

      <section className="py-10 sm:py-20 bg-zinc-50 dark:bg-zinc-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 bg-agro-orange/10 text-agro-orange text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4">
              <Star className="h-3.5 w-3.5 fill-agro-orange" /> Farmer Stories
            </div>
            <h2 className="text-display font-display font-bold">Trusted by <span className="gradient-text">Thousands</span></h2>
          </div>
          {testimonials.length > 0 ? (
            <div className="relative w-full overflow-hidden flex -mx-4 sm:mx-0 px-4 sm:px-0 py-4">
              <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-32 bg-gradient-to-r from-zinc-50 dark:from-zinc-950 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-32 bg-gradient-to-l from-zinc-50 dark:from-zinc-950 to-transparent z-10 pointer-events-none" />

              <div className="flex animate-marquee hover:[animation-play-state:paused] gap-4 sm:gap-6 w-max items-stretch">
                {/* Looping logic for marquee width */}
                {[...testimonials, ...testimonials, ...testimonials].map((r: any, idx: number) => {
                  const colors = ['from-emerald-500 to-green-600', 'from-blue-500 to-cyan-500', 'from-orange-500 to-amber-500', 'from-purple-500 to-pink-500'];
                  const color = colors[idx % colors.length];
                  const name = r.user?.name || 'Verified Customer';
                  const avatar = name.charAt(0).toUpperCase();
                  const role = r.product?.name ? `Purchased ${r.product.name}` : 'Customer';
                  return (
                    <div key={`${r._id}-${idx}`} className="w-[280px] sm:w-[380px] shrink-0 flex flex-col bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-zinc-100 dark:border-white/5 shadow-sm group transition-all duration-300 hover:border-agro-green/30">
                      <div className="text-2xl sm:text-4xl font-display font-bold text-zinc-100 dark:text-white/5 mb-2 sm:mb-3 select-none leading-none">"</div>
                      <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                        {[...Array(5)].map((_, s) => <Star key={`${idx}-${s}`} className={s < r.rating ? "h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-agro-orange fill-agro-orange" : "h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-zinc-200 dark:text-zinc-800"} />)}
                      </div>
                      <p className="text-zinc-500 dark:text-zinc-300 text-[10px] sm:text-sm leading-relaxed mb-4 sm:mb-5 line-clamp-4 italic flex-1">"{r.comment}"</p>
                      <div className="flex items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-zinc-100 dark:border-white/5 mt-auto">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-[10px] sm:text-sm flex-shrink-0`}>{avatar}</div>
                        <div className="min-w-0">
                          <div className="font-bold text-[10px] sm:text-sm truncate">{name}</div>
                          <div className="text-zinc-400 text-[8px] sm:text-xs truncate">{role}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-zinc-500">
              <p>Customer reviews will appear here.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── PARTNERS ─────────────────────────────────────────────────── */}
      {partners.length > 0 && (
        <section className="py-20 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-zinc-100 dark:bg-white/5 text-zinc-500 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4">
                <Handshake className="h-3.5 w-3.5" /> Our Trusted Network
              </div>
              <h2 className="text-3xl font-display font-bold">Strategic <span className="gradient-text">Partnerships</span></h2>
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-3 sm:flex sm:flex-wrap justify-center items-center gap-6 sm:gap-12 md:gap-20 opacity-60 hover:opacity-100 transition-opacity duration-500">
              {partners.map((partner) => (
                <motion.div
                  key={partner._id}
                  whileHover={{ scale: 1.1 }}
                  className="relative h-10 w-full sm:h-12 sm:w-32 md:h-16 md:w-40 grayscale hover:grayscale-0 transition-all duration-300"
                >

                  <Image
                    src={partner.photo}
                    alt={partner.name}
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FINAL CTA ──────────────────────────────────────────────────── */}

      <section className="relative py-12 sm:py-20 overflow-hidden bg-zinc-950">
        <div className="absolute top-0 left-1/2 w-[500px] h-[400px] bg-agro-green/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-agro-orange/5 rounded-full blur-[80px]" />
        <div className="absolute inset-0 hero-grid opacity-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-agro-green/15 border border-agro-green/30 text-agro-green text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-6">
            <Sparkles className="h-3.5 w-3.5" /> Join the IKPL Family
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white mb-4 max-w-2xl mx-auto leading-tight">
            Ready to Transform Your <span className="text-agro-orange">Farm's Potential?</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-lg max-w-md mx-auto mb-6 sm:mb-8 leading-relaxed">
            Access premium feeds, expert consultations, and exclusive farmer rewards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link href="/register">
                  <Button className="btn-glow-orange h-11 px-8 text-zinc-900 font-bold text-base rounded-xl border-0 group w-full sm:w-auto">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Free Account
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="bg-transparent h-11 px-8 border-white/20 text-white hover:bg-white/10 font-bold text-base rounded-xl w-full sm:w-auto">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/products">
                  <Button className="btn-glow-green h-11 px-8 text-white font-bold text-base rounded-xl border-0 group w-full sm:w-auto">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Shop Now
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="bg-transparent h-11 px-8 border-white/20 text-white hover:bg-white/10 font-bold text-base rounded-xl w-full sm:w-auto">
                    Talk to Expert
                  </Button>
                </Link>
              </>
            )}

          </div>
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 mt-8 sm:mt-12 opacity-40">
            {['No Hidden Fees', 'Free Expert Advice', 'Cancel Anytime', '24/7 Support'].map((t) => (
              <div key={t} className="flex items-center gap-1.5 sm:gap-2 text-zinc-400 text-xs sm:text-sm">
                <CheckCircle className="h-3.5 w-3.5 text-agro-green" /> {t}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
