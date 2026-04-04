'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Leaf, FlaskConical, Award, Users, Truck, 
  Target, ArrowRight, CheckCircle, Sparkles, TrendingUp, Shell,
  Zap, Eye, Store, Handshake, MapPin, Beef, Fish, Egg, Wheat
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function UdoorBrandPage() {
  return (
    <div className="flex flex-col overflow-x-hidden bg-white dark:bg-zinc-950">
      
      {/* ── HERO: UDOR FEEDS ───────────────────────────────────── */}
      <section className="relative min-h-[80vh] flex items-center pt-24 pb-16 overflow-hidden">
        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/banner2.jpg" 
            alt="UDOR Feeds Production" 
            fill 
            className="object-cover opacity-20 dark:opacity-30 blur-sm"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white/10 dark:from-zinc-950 dark:via-zinc-950/80 dark:to-zinc-950/10" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-agro-green/10 rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl pt-10">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-agro-green/10 px-4 py-2 rounded-full border border-agro-green/20 text-agro-green text-xs font-bold uppercase tracking-widest mb-8">
                <Sparkles className="h-3.5 w-3.5" />
                Farmer's Best Partner
              </motion.div>
              
              <motion.h1 variants={fadeUp} className="text-display-lg font-display font-black leading-none text-zinc-900 dark:text-white mb-6">
                UDOR <span className="gradient-text-animate whitespace-nowrap">FEEDS</span>
              </motion.h1>
              
              <motion.p variants={fadeUp} className="text-xl sm:text-2xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-2xl mb-10">
                Nutritionally balanced feed products developed for performance, health, and a sustainable future for Bhutanese farmers.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                 <div className="flex items-center gap-4 p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 shadow-xl pr-10">
                    <div className="w-12 h-12 rounded-2xl bg-agro-green/10 flex items-center justify-center flex-shrink-0 text-agro-green">
                       <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest leading-none mb-1">Manufacturing Base</p>
                      <p className="text-base font-bold dark:text-white">Pasakha, Bhutan</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 shadow-xl pr-10">
                    <div className="w-12 h-12 rounded-2xl bg-agro-orange/10 flex items-center justify-center flex-shrink-0 text-agro-orange">
                       <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest leading-none mb-1">Established</p>
                      <p className="text-base font-bold dark:text-white">2021</p>
                    </div>
                 </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── COMPANY PROFILE ────────────────────────────────────────── */}
      <section className="py-32 bg-zinc-50 dark:bg-zinc-900/40 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                 <div className="inline-flex items-center gap-2 bg-agro-green/10 text-agro-green text-xs font-bold px-4 py-2 rounded-full mb-6">
                    <Store className="h-4 w-4" />
                    Company Profile
                 </div>
                 <h2 className="text-display font-display font-bold mb-8 leading-tight text-zinc-900 dark:text-white">Contributing to the Nation's <br /><span className="gradient-text">Feed Industry</span></h2>
                 <div className="space-y-6 text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    <p>Based in Bhalujora, Pasakha, Phuentsholing, UDOR Feeds was established in 2021 as a cornerstone of Bhutan's agricultural development. Operations began in September 2023 with a relentless focus on delivering nutritionally balanced feed products.</p>
                    <p>The company prioritizes sustainability and environmentally friendly practices, ensuring improved animal health and welfare throughout the nation's livestock sector.</p>
                 </div>
              </motion.div>
              
              <div className="relative">
                 <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-3xl border border-zinc-200 dark:border-white/5 group bg-zinc-950">
                    <Image 
                      src="/banner2.jpg" 
                      alt="UDOR Feed Bag" 
                      fill 
                      className="object-contain p-8 lg:p-12 rotate-[-5deg] group-hover:rotate-0 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/20 via-transparent to-transparent opacity-40 pointer-events-none" />
                 </div>
                 {/* Floating Stat */}
                 <div className="absolute -bottom-6 -right-6 lg:-right-10 bg-white dark:bg-zinc-800 p-8 rounded-[2rem] shadow-3xl border border-zinc-100 dark:border-white/5 max-w-[240px]">
                    <TrendingUp className="h-10 w-10 text-agro-green mb-4" />
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Operational Since</p>
                    <p className="text-2xl font-display font-black text-zinc-900 dark:text-white leading-none">Sept 2023</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* ── EXPERTISE & QUALITY ─────────────────────────────────────── */}
      <section className="py-32 bg-white dark:bg-zinc-950 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-agro-orange/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              <div className="lg:w-1/2 order-2 lg:order-1 relative">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4 pt-12">
                       <div className="p-8 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5">
                          <FlaskConical className="h-8 w-8 text-agro-green mb-4" />
                          <h4 className="font-bold mb-2 dark:text-white">Scientifically Formulated</h4>
                          <p className="text-xs text-zinc-500 leading-relaxed">Scientifically developed for optimal growth across all animal species.</p>
                       </div>
                       <div className="p-8 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5">
                          <Users className="h-8 w-8 text-agro-orange mb-4" />
                          <h4 className="font-bold mb-2 dark:text-white">Expert Team</h4>
                          <p className="text-xs text-zinc-500 leading-relaxed">Managed by highly qualified nutritionists and veterinarians.</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="p-8 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5">
                          <CheckCircle className="h-8 w-8 text-blue-500 mb-4" />
                          <h4 className="font-bold mb-2 dark:text-white">Strict Quality Control</h4>
                          <p className="text-xs text-zinc-500 leading-relaxed">Highest standards of safety—from raw material to final packaging.</p>
                       </div>
                       <div className="p-8 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5">
                          <Zap className="h-8 w-8 text-amber-500 mb-4" />
                          <h4 className="font-bold mb-2 dark:text-white">Technical Support</h4>
                          <p className="text-xs text-zinc-500 leading-relaxed">Expert consultation services for feed management and animal health.</p>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="lg:w-1/2 order-1 lg:order-2">
                 <div className="inline-flex items-center gap-2 bg-agro-orange/10 text-agro-orange text-xs font-bold px-4 py-2 rounded-full mb-6">
                    <FlaskConical className="h-4 w-4" />
                    Our Methodology
                 </div>
                 <h2 className="text-display font-display font-bold mb-8 leading-tight text-zinc-900 dark:text-white">Precision Nutrition for <br /><span className="gradient-text">Better Performance</span></h2>
                 <p className="text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">
                    UDOR Feeds ensures the highest standards of safety and quality through state-of-the-art manufacturing facilities and rigorous scientific development.
                 </p>
                 <ul className="space-y-4">
                    {['Natural ingredient focus', 'Qualified veterinary oversight', 'Optimized for growth & performance', 'Eco-friendly sustainable manufacturing'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300 font-bold">
                         <div className="w-6 h-6 rounded-full bg-agro-green/10 flex items-center justify-center flex-shrink-0 text-agro-green">
                            <CheckCircle className="h-3.5 w-3.5" />
                         </div>
                         {item}
                      </li>
                    ))}
                 </ul>
              </div>
           </div>
        </div>
      </section>

      {/* ── PRODUCT MATRIX ─────────────────────────────────────────── */}
      <section className="py-32 bg-zinc-50 dark:bg-zinc-900 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-24">
             <h2 className="text-display font-display font-bold leading-tight mb-4">
               Precision <br /><span className="gradient-text">Product Matrix</span>
             </h2>
             <p className="text-zinc-500 dark:text-zinc-400 text-lg">Carefully formulated solutions catering to all animal stages and species.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 text-zinc-900 dark:text-white">
             
             {/* 1. Broiler */}
             <div className="group bg-white dark:bg-zinc-800 rounded-[3rem] p-10 border border-zinc-100 dark:border-white/5 hover:border-agro-green/20 transition-all duration-500 flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-8 flex-shrink-0">
                  <Egg className="h-7 w-7 text-orange-500" />
                </div>
                <h3 className="font-display font-black text-2xl mb-2 flex items-center justify-between">
                   Broiler
                   <span className="text-[10px] uppercase font-black text-zinc-300 dark:text-zinc-600">01</span>
                </h3>
                <div className="text-xs font-bold uppercase text-zinc-400 mb-6 tracking-widest">Feed Category</div>
                <div className="space-y-4 flex-1">
                   {[
                     { t: 'Starter Crumbs', age: '0–16 days' },
                     { t: 'Grower Crumbs', age: '17–27 days' },
                     { t: 'Finisher Crumbs', age: '28+ days' }
                   ].map((f, i) => (
                     <div key={i} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-white/5 group-hover:scale-105 transition-transform">
                        <div className="text-xs font-bold mb-1">{f.t}</div>
                        <div className="text-[10px] text-zinc-400">{f.age} old birds</div>
                     </div>
                   ))}
                </div>
             </div>

             {/* 2. Layer */}
             <div className="group bg-white dark:bg-zinc-800 rounded-[3rem] p-10 border border-zinc-100 dark:border-white/5 hover:border-agro-green/20 transition-all duration-500 flex flex-col pt-16 -mt-8 xl:mt-0 xl:pt-10">
                <div className="w-14 h-14 rounded-2xl bg-agro-green/10 flex items-center justify-center mb-8 flex-shrink-0">
                  <Leaf className="h-7 w-7 text-agro-green" />
                </div>
                <h3 className="font-display font-black text-2xl mb-2 flex items-center justify-between">
                   Layer
                   <span className="text-[10px] uppercase font-black text-zinc-300 dark:text-zinc-600">02</span>
                </h3>
                <div className="text-xs font-bold uppercase text-zinc-400 mb-6 tracking-widest">Feed Category</div>
                <div className="space-y-4 flex-1">
                   {[
                     { t: 'Chicken Starter', age: '0–4 weeks' },
                     { t: 'Chicken Grower', age: '6–17 weeks' },
                     { t: 'Layer (Pellet/Mash)', age: '18–72 weeks' }
                   ].map((f, i) => (
                     <div key={i} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-white/5 group-hover:scale-105 transition-transform">
                        <div className="text-xs font-bold mb-1">{f.t}</div>
                        <div className="text-[10px] text-zinc-400">{f.age} old birds</div>
                     </div>
                   ))}
                </div>
             </div>

             {/* 3. Cattle */}
             <div className="group bg-white dark:bg-zinc-800 rounded-[3rem] p-10 border border-zinc-100 dark:border-white/5 hover:border-agro-green/20 transition-all duration-500 flex flex-col pt-10">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-8 flex-shrink-0">
                  <Beef className="h-7 w-7 text-amber-500" />
                </div>
                <h3 className="font-display font-black text-2xl mb-2 flex items-center justify-between">
                   Cattle
                   <span className="text-[10px] uppercase font-black text-zinc-300 dark:text-zinc-600">03</span>
                </h3>
                <div className="text-xs font-bold uppercase text-zinc-400 mb-6 tracking-widest">Feed Category</div>
                <div className="space-y-4 flex-1">
                   {[
                     { t: 'Calf Starter Pellet', sub: 'For suckling & weaned' },
                     { t: 'Cattle Concentrate', sub: 'For breeding bulls' },
                     { t: 'Milk Ration Pellet', sub: 'For milking cows' }
                   ].map((f, i) => (
                     <div key={i} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-white/5 group-hover:scale-105 transition-transform">
                        <div className="text-xs font-bold mb-1">{f.t}</div>
                        <div className="text-[10px] text-zinc-400">{f.sub}</div>
                     </div>
                   ))}
                </div>
             </div>

             {/* 4. Pig */}
             <div className="group bg-white dark:bg-zinc-800 rounded-[3rem] p-10 border border-zinc-100 dark:border-white/5 hover:border-agro-green/20 transition-all duration-500 flex flex-col pt-16 -mt-8 xl:mt-0 xl:pt-10">
                <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-8 flex-shrink-0">
                  <Sparkles className="h-7 w-7 text-pink-500" />
                </div>
                <h3 className="font-display font-black text-2xl mb-2 flex items-center justify-between">
                   Swine
                   <span className="text-[10px] uppercase font-black text-zinc-300 dark:text-zinc-600">04</span>
                </h3>
                <div className="text-xs font-bold uppercase text-zinc-400 mb-6 tracking-widest">Feed Category</div>
                <div className="space-y-4 flex-1">
                   {[
                     { t: 'Pig Starter Pellet', age: '8–10 weeks' },
                     { t: 'Pig Grower Pellet', age: '10–16 weeks' },
                     { t: 'Pig Finisher / Sow', age: '16–28 weeks' }
                   ].map((f, i) => (
                     <div key={i} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-white/5 group-hover:scale-105 transition-transform">
                        <div className="text-xs font-bold mb-1">{f.t}</div>
                        <div className="text-[10px] text-zinc-400">{f.age} growth stage</div>
                     </div>
                   ))}
                </div>
             </div>

          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="py-32 relative overflow-hidden bg-zinc-950">
         <div className="absolute top-0 right-0 w-[500px] h-full bg-agro-green/5 rounded-full blur-[150px] pointer-events-none" />
         <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-display font-display font-bold text-white mb-8">Ready to <span className="gradient-text">Boost </span>Production?</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12">Experience the UDOR difference. Contact our network of agents in your Dzongkhag or gewog today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Link href="/products?brand=UDOR">
                 <Button className="btn-glow-green h-14 px-10 text-white font-bold text-lg rounded-2xl border-0 group">
                    View Catalog
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                 </Button>
               </Link>
               <Link href="/contact">
                  <Button variant="outline" className="h-14 px-10 border-white/10 text-white hover:bg-white/10 font-bold text-lg rounded-2xl transition-all">
                     Technical Support
                  </Button>
               </Link>
            </div>
         </div>
      </section>

    </div>
  );
}
