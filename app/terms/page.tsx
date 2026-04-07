'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText, ShoppingBag, Truck, RefreshCw, Gavel,
  AlertTriangle, Copyright, Scale, Phone, ChevronRight, Sparkles, CheckCircle
} from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';

const sections = [
  {
    id: 'acceptance',
    icon: CheckCircle,
    title: '1. Acceptance of Terms',
    content: "By accessing and using IKPL's website and services, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services. Continued use constitutes ongoing acceptance.",
    color: 'from-agro-green to-emerald-600',
    bg: 'bg-green-50 dark:bg-green-950/20',
  },
  {
    id: 'use',
    icon: FileText,
    title: '2. Use of Services',
    content: "You agree to use our services only for lawful purposes and in accordance with these terms. You are responsible for ensuring that your account information is accurate and up to date. Misuse may result in account suspension.",
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    id: 'products',
    icon: ShoppingBag,
    title: '3. Product Information',
    content: "We strive to provide accurate product information, but we do not warrant that product descriptions or other content is accurate, complete, or current. Prices and availability are subject to change without notice.",
    color: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
  },
  {
    id: 'orders',
    icon: CheckCircle,
    title: '4. Orders and Payment',
    content: "All orders are subject to acceptance and availability. We reserve the right to refuse any order. Payment must be made at the time of order placement for online purchases. We accept major credit/debit cards and digital payments.",
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50 dark:bg-purple-950/20',
  },
  {
    id: 'delivery',
    icon: Truck,
    title: '5. Delivery',
    content: 'Delivery times are estimates and may vary based on location and availability. We are not responsible for delays caused by circumstances beyond our control, including weather events or logistics disruptions. Risk passes upon delivery.',
    color: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-50 dark:bg-cyan-950/20',
  },
  {
    id: 'returns',
    icon: RefreshCw,
    title: '6. Returns and Refunds',
    content: 'Products may be returned within 30 days of delivery if unopened and in original condition. Refunds will be processed within 14 days of receiving the returned item, to the original payment method.',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
  },
  {
    id: 'intellectual',
    icon: Copyright,
    title: '7. Intellectual Property',
    content: 'All content on this website, including text, graphics, logos, and images, is the property of IKPL and protected by copyright laws. Unauthorized reproduction is strictly prohibited.',
    color: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50 dark:bg-rose-950/20',
  },
  {
    id: 'liability',
    icon: AlertTriangle,
    title: '8. Limitation of Liability',
    content: 'IKPL shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or services, beyond the amount paid for the specific product or service.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
  },
  {
    id: 'governing',
    icon: Scale,
    title: '9. Governing Law',
    content: 'These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which IKPL operates. Any disputes shall be resolved in the competent courts of that jurisdiction.',
    color: 'from-indigo-500 to-purple-500',
    bg: 'bg-indigo-50 dark:bg-indigo-950/20',
  },
  {
    id: 'changes',
    icon: Gavel,
    title: '10. Changes to Terms',
    content: 'We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of our services after any changes constitutes your acceptance.',
    color: 'from-slate-500 to-zinc-600',
    bg: 'bg-slate-50 dark:bg-slate-950/20',
  },
  {
    id: 'contact',
    icon: Phone,
    title: '11. Contact Information',
    content: 'For questions about these terms, please contact our legal team at indrakausilaprivatelimitedcomp@gmail.com or call our support line. We aim to respond to all legal inquiries within 5 business days.',
    color: 'from-teal-500 to-emerald-500',
    bg: 'bg-teal-50 dark:bg-teal-950/20',
  },
];

export default function TermsPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    fetch('/api/content?key=terms')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setContent(data.content?.value || ''); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative py-16 sm:py-24 bg-zinc-950 overflow-hidden">
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-agro-orange/10 rounded-full blur-[120px] animate-blob delay-2000" />
        <div className="absolute inset-0 hero-grid opacity-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-agro-orange/15 border border-agro-orange/30 text-agro-orange text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Legal Agreement
          </div>
          <h1 className="text-hero font-display font-bold text-white mb-4">
            Terms & <span className="text-agro-orange">Conditions</span>
          </h1>
          <p className="text-zinc-300 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
            Please read these terms carefully before using our services. They govern your relationship with IKPL.
          </p>
          <p className="text-zinc-500 text-sm mt-4">Effective: April 4, 2026 &bull; Version 4.0</p>
        </div>
      </section>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <section className="py-12 sm:py-20 bg-white dark:bg-zinc-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 max-w-6xl mx-auto">

            {/* Sidebar TOC */}
            <aside className="lg:col-span-3 hidden lg:block">
              <div className="sticky top-24 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl p-6 border border-zinc-100 dark:border-white/5">
                <h3 className="font-display font-bold text-sm uppercase tracking-widest text-zinc-500 mb-4">Sections</h3>
                <nav className="space-y-1 max-h-[60vh] overflow-y-auto">
                  {sections.map(({ id, title }) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      onClick={() => setActiveSection(id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        activeSection === id
                          ? 'bg-agro-orange/10 text-agro-orange'
                          : 'text-zinc-500 hover:text-agro-orange hover:bg-agro-orange/5'
                      }`}
                    >
                      <ChevronRight className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{title.replace(/^\d+\. /, '')}</span>
                    </a>
                  ))}
                </nav>

                <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-white/5">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    By using our platform, you agree to all sections listed. Questions? Contact{' '}
                    <a href="mailto:indrakausilaprivatelimitedcomp@gmail.com" className="text-agro-orange hover:underline">indrakausilaprivatelimitedcomp@gmail.com</a>
                  </p>
                </div>
              </div>
            </aside>

            {/* Content */}
            <main className="lg:col-span-9">
              {loading ? (
                <div className="space-y-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-3 p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-800/30">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  ))}
                </div>
              ) : content ? (
                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
              ) : (
                <div className="space-y-5">
                  {sections.map(({ id, icon: Icon, title, content: text, color, bg }) => (
                    <div
                      key={id}
                      id={id}
                      className={`group p-5 sm:p-7 rounded-3xl ${bg} border border-transparent hover:border-agro-orange/20 transition-all duration-500 card-hover`}
                    >
                      <div className="flex items-start gap-4 sm:gap-5">
                        <div className={`w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div>
                          <h2 className="font-display font-bold text-base sm:text-lg mb-2">{title}</h2>
                          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-xs sm:text-sm">{text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer note */}
              <div className="mt-8 sm:mt-10 p-4 sm:p-6 rounded-3xl bg-agro-orange/5 border border-agro-orange/15">
                <div className="flex items-start gap-3 sm:gap-4">
                  <Gavel className="h-5 w-5 sm:h-6 sm:w-6 text-agro-orange flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold mb-1">Legal Inquiry?</h4>
                    <p className="text-zinc-500 text-xs sm:text-sm">
                      For any legal questions, email{' '}
                      <a href="mailto:indrakausilaprivatelimitedcomp@gmail.com" className="text-agro-orange font-semibold hover:underline">indrakausilaprivatelimitedcomp@gmail.com</a>
                      {' '}or{' '}
                      <Link href="/contact" className="text-agro-green font-semibold hover:underline">contact our team</Link>.
                    </p>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}
