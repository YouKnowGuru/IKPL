'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Award, Users, Truck, Leaf, FlaskConical, Globe, HeartHandshake, 
  Target, ArrowRight, CheckCircle, Sparkles, TrendingUp, ShieldCheck, 
  Zap, Eye, Store, Handshake, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Counter ──────────────────────────────────────────────────
function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let s = 0;
        const step = end / (1800 / 16);
        const t = setInterval(() => {
          s += step;
          if (s >= end) { setCount(end); clearInterval(t); } else setCount(Math.floor(s));
        }, 16);
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <div ref={ref} className="stat-number text-3xl sm:text-5xl lg:text-7xl gradient-text font-display font-bold tabular-nums tracking-tighter">{count.toLocaleString()}{suffix}</div>;
}

const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function AboutPage() {
  const [team, setTeam] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/team')
      .then(res => res.json())
      .then(d => { if (d.success && d.team) setTeam(d.team); })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col overflow-x-hidden bg-white dark:bg-zinc-950">
      
      {/* ── HERO: THE HERITAGE ───────────────────────────────────── */}
      <section className="relative min-h-[70vh] sm:min-h-[90vh] lg:min-h-screen flex items-center pt-20 sm:pt-24 overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-agro-green/15 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-agro-orange/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
          <div className="absolute inset-0 hero-grid opacity-[0.03] dark:opacity-[0.07]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-agro-green/8 px-4 py-2 rounded-full border border-agro-green/20 text-agro-green text-xs font-bold uppercase tracking-widest mb-8">
                <Sparkles className="h-3.5 w-3.5" />
                Since 2004
              </motion.div>
              
              <motion.h1 variants={fadeUp} className="text-display-lg font-display font-black leading-[1.1] text-zinc-900 dark:text-white mb-4 sm:mb-6">
                Redefining the <br />
                <span className="gradient-text-animate">Distribution</span> Landscape
              </motion.h1>
              
              <motion.p variants={fadeUp} className="text-sm sm:text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed mb-6 sm:mb-10">
                Indra & Kausila Private Limited (IKPL) is a family-owned enterprise in Tsirang, Bhutan, distinguished by its elite partnerships and unwavering commitment to community growth.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col xs:flex-row flex-wrap gap-3 sm:gap-4">
                 <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 pr-4 sm:pr-8">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-agro-green/10 flex items-center justify-center flex-shrink-0">
                       <MapPin className="h-6 w-6 text-agro-green" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Base of Operations</p>
                      <p className="text-sm font-bold">Tsirang, Bhutan</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 pr-4 sm:pr-8">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-agro-orange/10 flex items-center justify-center flex-shrink-0">
                       <Handshake className="h-6 w-6 text-agro-orange" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Enterprise Type</p>
                      <p className="text-sm font-bold">Family Owned</p>
                    </div>
                 </div>
              </motion.div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
               className="relative lg:pl-12"
            >
                {/* Cinematic Visual Frame */}
                <div className="relative aspect-video w-full rounded-xl sm:rounded-2xl lg:rounded-[3rem] overflow-hidden shadow-2xl border border-zinc-200 dark:border-white/10 group bg-zinc-950/50 backdrop-blur-sm">
                  <Image 
                    src="/banner2.jpg" 
                    alt="IKPL Operations and UDOR Feeds" 
                    fill 
                    className="object-contain lg:object-cover group-hover:scale-[1.02] transition-transform duration-1000"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/20 via-transparent to-transparent opacity-30" />
                  <div className="absolute bottom-4 left-4 right-4 lg:bottom-8 lg:left-8 lg:right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="glass-dark p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-white/10 hidden sm:block">
                        <p className="text-white text-xs lg:text-sm font-display font-medium leading-relaxed italic">
                          "Bridging the gap between premium products and everyday consumers."
                        </p>
                     </div>
                  </div>
                </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── THE PARTNERSHIPS ────────────────────────────────────────── */}
      <section className="py-12 sm:py-24 bg-zinc-50 dark:bg-zinc-950 border-y border-zinc-100 dark:border-white/5">
         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
               <div className="lg:w-1/3">
                  <h2 className="text-2xl sm:text-3xl font-display font-bold leading-tight mb-4">Strategic <br className="hidden sm:block" /><span className="gradient-text">Wholesale Partners</span></h2>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">As a trusted marketing partner for globally recognized brands, we specialize in tailoring high-volume solutions for the Bhutanese market.</p>
               </div>
               <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 w-full">
                  {[
                    { name: 'Noodles', label: 'Quality Food Products', desc: 'Premium food range catering to households across the kingdom.', href: null },
                    { name: 'UDOR Feeds', label: 'Animal Nutrition', desc: 'Expertly formulated livestock feeds for farmers and cooperatives.', href: '/udoor' }
                  ].map((p, i) => (
                    <div key={i} className="group p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 card-hover shadow-sm flex flex-col">
                       <div className="text-agro-green font-black text-2xl mb-2 group-hover:scale-105 transition-transform">{p.name}</div>
                       <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">{p.label}</div>
                       <p className="text-sm text-zinc-500 leading-relaxed mb-8 flex-1">{p.desc}</p>
                       {p.href && (
                         <Link href={p.href}>
                           <Button variant="outline" className="rounded-xl border-zinc-200 dark:border-white/10 h-11 text-xs font-bold w-full group/btn">
                             View Company Profile
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

      {/* ── MISSION & VISION ────────────────────────────────────────── */}
      <section className="py-16 sm:py-32 relative">
         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 xl:gap-24">
               
               {/* Vision */}
               <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <div className="inline-flex items-center gap-2 bg-agro-orange/10 text-agro-orange text-xs font-bold px-4 py-2 rounded-full mb-6">
                    <Eye className="h-4 w-4" />
                    Our Vision
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-display font-bold mb-4 sm:mb-6 text-zinc-900 dark:text-white">To become Bhutan’s most <span className="gradient-text">trusted</span> distribution partner.</h3>
                  <p className="text-base sm:text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6 sm:mb-8 italic border-l-4 border-agro-orange/30 pl-4 sm:pl-6">
                    "Recognized for delivering high-quality products, empowering local communities, and contributing to sustainable economic growth."
                  </p>
               </motion.div>

               {/* Mission */}
               <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <div className="inline-flex items-center gap-2 bg-agro-green/10 text-agro-green text-xs font-bold px-4 py-2 rounded-full mb-6">
                    <Target className="h-4 w-4" />
                    Our Mission
                  </div>
                  <div className="space-y-6">
                    {[
                      { t: 'Strategic Partnerships', d: 'Providing high-quality, reliable, and affordable products through strong partnerships with reputable global brands.' },
                      { t: 'Community Empowerment', d: 'Supporting farmers and communities by offering nutritious livestock solutions and essential goods.' },
                      { t: 'Integrity & Trust', d: 'Ensuring exceptional customer satisfaction while upholding integrity and excellence in every aspect of our business.' }
                    ].map((m, i) => (
                      <div key={i} className="group flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-agro-green/10 flex items-center justify-center flex-shrink-0 text-agro-green font-bold">0{i+1}</div>
                        <div>
                          <h4 className="font-bold text-zinc-900 dark:text-white mb-1 group-hover:text-agro-green transition-colors">{m.t}</h4>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{m.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </motion.div>
            </div>
         </div>
      </section>

      {/* ── STATS: THE IMPACT ────────────────────────────────────────── */}
      <section className="py-12 sm:py-24 bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-[0.05]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-12 md:gap-20">
            {[
              { end: 2004, suffix: '', label: 'Founded Year', icon: Award },
              { end: 100, suffix: '+', label: 'Distribution Hubs', icon: Truck },
              { end: 20, suffix: '+', label: 'Strategic Brands', icon: Zap },
              { end: 50000, suffix: '+', label: 'Units Delivered', icon: TrendingUp },
            ].map(({ end, suffix, label, icon: Icon }) => (
              <div key={label} className="group">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-3 sm:mb-6 group-hover:bg-agro-green/20 transition-all duration-300">
                  <Icon className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                </div>
                <Counter end={end} suffix={suffix} />
                <p className="text-zinc-500 text-xs mt-3 font-bold uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES & INTEGRITY ───────────────────────────────────────── */}
      <section className="py-16 sm:py-32 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-20">
            <h2 className="text-display font-display font-bold leading-tight mb-4">
              Our Core <span className="gradient-text">Values</span>
            </h2>
            <p className="text-zinc-500 text-base">Driven by integrity and a deep understanding of the local market.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: ShieldCheck, title: 'Quality Assurance', desc: 'No compromises on the products entering our national supply chain.', color: 'emerald' },
              { icon: HeartHandshake, title: 'Trust & Integrity', desc: 'Honest partnerships built over two decades of dedicated service.', color: 'orange' },
              { icon: TrendingUp, title: 'Sustainable Growth', desc: 'Committed to long-term prosperity for both Bhutan and our partners.', color: 'blue' }
            ].map((v, i) => (
              <div key={i} className="group p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 hover:border-agro-green/20 transition-all duration-500">
                <div className={`w-10 h-10 sm:w-14 sm:h-14 bg-white dark:bg-zinc-800 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-8 shadow-inner-sm group-hover:scale-110 transition-transform`}>
                   <v.icon className="h-6 w-6 text-agro-green" />
                </div>
                <h3 className="font-display font-bold text-base sm:text-xl mb-2 sm:mb-4 group-hover:text-agro-green transition-colors">{v.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM: LEADERSHIP ─────────────────────────────────────── */}
      <section id="team" className="py-12 sm:py-24 bg-zinc-950 px-4 md:px-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-display font-display font-bold leading-tight mb-4 text-white">
                Leadership <br /><span className="gradient-text">at the Helm</span>
              </h2>
              <p className="text-zinc-400 text-lg">The individuals driving Bhutan's most reliable agricultural distribution network.</p>
            </div>
            <Link href="/contact">
              <Button variant="outline" className="bg-transparent rounded-2xl h-14 px-8 border-white/20 text-white hover:bg-white/10 font-bold group">
                Work With Us
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
            {team.length > 0 ? team.map((member) => (
              <div key={member._id} className="group relative">
                <div className="relative h-56 sm:h-80 md:h-96 rounded-xl sm:rounded-[2.5rem] overflow-hidden mb-3 sm:mb-6 border border-white/10 shadow-sm transition-all duration-700 group-hover:rounded-[1.5rem]">
                  {member.photo ? (
                    <Image src={member.photo} alt={member.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" sizes="(max-width: 768px) 50vw, 25vw" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-500 text-4xl font-bold">
                       {member.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 sm:opacity-60 transition-opacity" />
                  <div className="absolute bottom-2 left-2 right-2 sm:bottom-6 sm:left-6 sm:right-6">
                    <p className="text-white font-display font-bold text-xs sm:text-xl mb-0.5 sm:mb-1 leading-tight break-words">{member.name}</p>
                    <p className="text-agro-green font-bold text-[8px] sm:text-xs uppercase tracking-widest leading-tight">{member.title}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center bg-white dark:bg-zinc-900 rounded-[3rem] border border-dashed border-zinc-200 dark:border-white/10">
                 <p className="text-zinc-500 uppercase font-black tracking-widest">Leadership data incoming...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="py-16 sm:py-32 relative overflow-hidden bg-zinc-950">
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-agro-green/10 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
           <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}>
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold text-white mb-4 sm:mb-8 tracking-tight">
                Empowering <span className="gradient-text">Communities</span>
              </h2>
              <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed">
                Join IKPL in supporting sustainable growth and empowering farmers across the kingdom of Bhutan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Link href="/products">
                    <Button className="btn-glow-green h-14 px-10 text-white font-bold text-lg rounded-2xl border-0">
                       Explore Products
                    </Button>
                 </Link>
                 <Link href="/contact">
                   <Button variant="outline" className="bg-transparent h-14 px-10 border-white/20 text-white hover:bg-white/10 font-bold text-lg rounded-2xl">
                      Contact HQ
                   </Button>
                 </Link>
              </div>
           </motion.div>
        </div>
      </section>

    </div>
  );
}
