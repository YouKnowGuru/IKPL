'use client';

import { Leaf, Sparkles } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#050508] p-4 font-body">
      {/* ── Background Elements ────────────────────────────────────── */}
      <div className="absolute inset-0 hero-grid opacity-20 pointer-events-none" />
      
      {/* Moving Blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-agro-green/20 rounded-full blur-[120px] animate-blob pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-agro-orange/15 rounded-full blur-[100px] animate-blob delay-2000 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[80px] pointer-events-none" />

      {/* ── Content Wrapper ────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-20">
        
        {/* Left Side: Branding / Intro (Hidden on mobile) */}
        <div className="hidden lg:flex flex-col space-y-8 animate-fade-in pr-10">
          <div className="flex items-center gap-4 group">
            <div className="relative h-18 w-18 rounded-full overflow-hidden border-2 border-white/10 bg-zinc-900 flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-2xl shadow-agro-green/20 ring-4 ring-white/5">
              <div className="relative w-full h-full p-3 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="IKPL Logo"
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
            <div>
              <div className="font-display font-black text-4xl text-white tracking-tight">IKPL</div>
              <div className="h-1 w-full bg-gradient-to-r from-agro-green via-agro-orange to-transparent rounded-full" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-agro-green/15 border border-agro-green/30 text-agro-green text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              Revolutionizing Agriculture
            </div>
            <h1 className="text-5xl xl:text-6xl font-display font-bold text-white leading-tight">
              Premium Nutrition<br />
              <span className="gradient-text-animate whitespace-nowrap">For Better Yields</span>
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
              Join 10,000+ farmers across Bhutan who trust IKPL for scientifically-formulated, ISO-certified animal nutrition.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4">
            {[
              { label: 'Farmers Trusted', val: '10K+' },
              { label: 'Pickup States', val: '10' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
                <div className="text-2xl font-display font-bold text-white">{stat.val}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Auth Form (The Card) */}
        <div className="flex justify-center lg:justify-end animate-slide-up">
          {children}
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-3">
        <span>Scientific</span>
        <span className="w-1 h-1 rounded-full bg-zinc-800" />
        <span>Sustainable</span>
        <span className="w-1 h-1 rounded-full bg-zinc-800" />
        <span>Superior</span>
      </div>
    </div>
  );
}
