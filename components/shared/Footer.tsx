'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Facebook, Twitter, Instagram, Linkedin,
  Mail, Phone, MapPin, ArrowUpRight,
  ShieldCheck, Truck, Leaf, Send, ArrowRight, Sprout, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Static navigation links — these don't need to be in the DB
const footerLinks = {
  company: [
    { name: 'About IKPL', href: '/about' },
    { name: 'Meet the Team', href: '/about#team' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Our Products', href: '/products' },
    { name: 'Latest Blog', href: '/blog' },
    { name: 'Contact Us', href: '/contact' },
  ],
  support: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms & Conditions', href: '/terms' },
  ],
  categories: [
    { name: 'Broiler Feed', href: '/products' },
    { name: 'Layer Feed', href: '/products' },
    { name: 'Cattle Feed', href: '/products' },
    { name: 'Fish Feed', href: '/products' },
  ],
};

// Default fallback values when settings are not yet configured
const DEFAULTS = {
  phone: '+1 (800) IKPL-FEED',
  email: 'contact@ikpl.com',
  address: '123 Farm Tech Avenue, IKPL Plaza, Suite 900',
  facebook: '#',
  instagram: '#',
  whatsapp: '#',
};

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Do not show footer on admin pages
  if (pathname?.startsWith('/admin')) return null;

  // ── Settings from DB ──────────────────────────────────────────────────────
  const [settings, setSettings] = useState<{
    logo?: string;
    copyright?: string;
    contactInfo?: { phone?: string; email?: string; address?: string };
    socialLinks?: { facebook?: string; instagram?: string; whatsapp?: string };
  }>({});

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(() => {
        // Silently fall back to defaults on network error
      });
  }, []);

  // Resolve values — DB settings take priority over defaults
  const phone = settings.contactInfo?.phone || DEFAULTS.phone;
  const contactEmail = settings.contactInfo?.email || DEFAULTS.email;
  const address = settings.contactInfo?.address || DEFAULTS.address;
  const facebookHref = settings.socialLinks?.facebook || DEFAULTS.facebook;
  const instagramHref = settings.socialLinks?.instagram || DEFAULTS.instagram;
  const whatsappHref = settings.socialLinks?.whatsapp
    ? `https://wa.me/${settings.socialLinks.whatsapp.replace(/\D/g, '')}`
    : DEFAULTS.whatsapp;

  const socialLinks = [
    { icon: Facebook, href: facebookHref, label: 'Facebook', hoverClass: 'hover:bg-[#1877F2] hover:border-[#1877F2]' },
    { icon: Twitter, href: '#', label: 'Twitter / X', hoverClass: 'hover:bg-zinc-700 hover:border-zinc-700' },
    { icon: Instagram, href: instagramHref, label: 'Instagram', hoverClass: 'hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 hover:border-pink-500' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', hoverClass: 'hover:bg-[#0A66C2] hover:border-[#0A66C2]' },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(''); }
  };

  return (
    <footer className="relative bg-zinc-950 text-white overflow-hidden">

      {/* ── Top Wave ─────────────────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-agro-green/50 to-transparent" />

      {/* ── Background Decorations ────────────────────────────── */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-agro-green/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -left-32 w-96 h-96 bg-agro-orange/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* ── Newsletter Strip ──────────────────────────────────── */}
      <div className="relative border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-gradient-to-br from-agro-green/10 to-agro-orange/5 border border-white/8 rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 text-agro-green/5">
              <Send className="w-32 h-32" />
            </div>

            <div className="relative z-10 max-w-md">
              <div className="flex items-center gap-2 text-agro-green text-[10px] font-bold uppercase tracking-widest mb-2">
                <Sprout className="h-3 w-3" />
                Farmer Newsletter
              </div>
              <h3 className="font-display font-bold text-xl md:text-2xl text-white mb-1.5">
                Farming Insights
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Early access to formulas, discounts, and expert tips.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 w-full lg:max-w-xs relative z-10 flex-shrink-0">
              {subscribed ? (
                <div className="flex items-center gap-2 bg-agro-green/15 border border-agro-green/30 rounded-xl px-4 py-3 w-full">
                  <ShieldCheck className="h-4 w-4 text-agro-green flex-shrink-0" />
                  <span className="text-white font-bold text-xs">Subscribed! 🎉</span>
                </div>
              ) : (
                <>
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 rounded-xl focus:border-agro-green focus:ring-agro-green/20 flex-1 text-xs"
                    required
                  />
                  <Button
                    type="submit"
                    className="h-10 px-5 bg-agro-green hover:bg-agro-green/90 text-white font-bold rounded-xl border-0 flex-shrink-0 group shadow-lg"
                  >
                    Subscribe
                    <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>


      {/* ── Main Footer Content ───────────────────────────────── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">

          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-white/10 bg-zinc-900 flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-xl ring-2 ring-white/5">
                {!logoError ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={settings.logo || '/logo.png'}
                      alt="IKPL Logo"
                      className="object-cover w-full h-full rounded-full"
                      onError={() => setLogoError(true)}
                    />
                  </div>
                ) : (
                  <Leaf className="h-5 w-5 text-agro-green" />
                )}
              </div>
              <div className="flex flex-col leading-none">
                <div className="font-display font-black text-xl text-white tracking-tight">IKPL</div>
              </div>
            </Link>


            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              Revolutionizing animal nutrition with premium, scientifically-formulated feeds. Trusted by 20,000+ farmers across Bhutan for over two decades.
            </p>

            {/* Contact info — pulled dynamically from Settings */}
            <div className="space-y-2.5">
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-2.5 text-zinc-400 hover:text-white transition-colors group text-xs text-medium">
                  <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-agro-orange/15 flex items-center justify-center border border-white/5 transition-all">
                    <Phone className="h-3 w-3 text-agro-orange" />
                  </div>
                  {phone}
                </a>
              )}
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-2.5 text-zinc-400 hover:text-white transition-colors group text-xs text-medium">
                  <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-agro-green/15 flex items-center justify-center border border-white/5 transition-all">
                    <Mail className="h-3 w-3 text-agro-green" />
                  </div>
                  {contactEmail}
                </a>
              )}
              {address && (
                <div className="flex items-start gap-2.5 text-zinc-400 text-xs text-medium">
                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 flex-shrink-0 mt-0.5">
                    <MapPin className="h-3 w-3 text-zinc-500" />
                  </div>
                  {address}
                </div>
              )}
            </div>

            {/* Social Links — pulled dynamically */}
            <div className="flex items-center gap-2 pt-1">
              {socialLinks.map(({ icon: Icon, href, label, hoverClass }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href !== '#' ? '_blank' : undefined}
                  rel={href !== '#' ? 'noopener noreferrer' : undefined}
                  className={cn(
                    'w-8 h-8 rounded-lg bg-white/5 border border-white/8 text-zinc-400 flex items-center justify-center transition-all duration-300 hover:text-white hover:-translate-y-1',
                    hoverClass
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>

          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-6">
            {/* Company */}
            <div>
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-3">Company</h4>
              <ul className="space-y-2">
                {footerLinks.company.map(({ name, href }) => (
                  <li key={name}>
                    <Link href={href} className="text-zinc-400 hover:text-white text-xs transition-colors flex items-center gap-1.5 group font-medium">
                      {name}
                      <ArrowUpRight className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 -translate-y-0.5 group-hover:translate-y-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-3">Products</h4>
              <ul className="space-y-2">
                {footerLinks.categories.map(({ name, href }) => (
                  <li key={name}>
                    <Link href={href} className="text-zinc-400 hover:text-agro-green text-xs transition-colors flex items-center gap-1.5 group font-medium">
                      {name}
                      <ArrowUpRight className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 -translate-y-0.5 group-hover:translate-y-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-3">Legal</h4>
              <ul className="space-y-2">
                {footerLinks.support.map(({ name, href }) => (
                  <li key={name}>
                    <Link href={href} className="text-zinc-400 hover:text-agro-orange text-xs transition-colors flex items-center gap-1.5 group font-medium">
                      {name}
                      <ArrowUpRight className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 -translate-y-0.5 group-hover:translate-y-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* ── Certifications ─────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-6 py-6 border-t border-b border-white/5 mb-8">
          {[
            { icon: ShieldCheck, text: 'ISO 9001', color: 'text-agro-green' },
            { icon: MapPin, text: '20 Districts', color: 'text-agro-orange' },
            { icon: Leaf, text: 'Eco Batch', color: 'text-emerald-400' },
            { icon: Globe, text: 'Global Ready', color: 'text-blue-400' },
          ].map(({ icon: Icon, text, color }) => (
            <div key={text} className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
              <Icon className={cn('h-4 w-4', color)} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">{text}</span>
            </div>
          ))}
        </div>


        {/* ── Bottom Bar ─────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-agro-green animate-pulse" />
            <p className="text-zinc-500 text-xs font-medium" dangerouslySetInnerHTML={{ __html: settings.copyright || '© 2026 IKPL Group. All rights reserved.' }} />
          </div>
          <div className="flex items-center gap-5 text-xs font-medium text-zinc-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <div className="w-px h-3 bg-white/10" />
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <div className="w-px h-3 bg-white/10" />
            <span className="text-zinc-700">Made with 🌱 for farmers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
