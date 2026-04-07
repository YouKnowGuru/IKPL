'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Lock, Eye, Share2, Bell, Cookie, RefreshCw, Mail, ChevronRight, Sparkles } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';

const sections = [
  {
    id: 'collection',
    icon: Eye,
    title: '1. Information We Collect',
    content: 'We collect information you provide directly to us, including your name, email address, phone number, and shipping address when you create an account or place an order. We also collect usage data to improve your experience on our platform.',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    id: 'use',
    icon: Shield,
    title: '2. How We Use Your Information',
    content: 'We use the information we collect to process your orders, communicate with you, improve our services, and send you marketing communications (with your consent). We never use your data for purposes beyond what is described here.',
    color: 'from-agro-green to-emerald-600',
    bg: 'bg-green-50 dark:bg-green-950/20',
  },
  {
    id: 'sharing',
    icon: Share2,
    title: '3. Information Sharing',
    content: 'We do not sell or rent your personal information to third parties. We may share your information only with service providers who help us operate our business, under strict confidentiality agreements.',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50 dark:bg-purple-950/20',
  },
  {
    id: 'security',
    icon: Lock,
    title: '4. Data Security',
    content: 'We implement industry-standard SSL encryption and security measures to protect your personal information from unauthorized access, alteration, or disclosure. Your data is stored securely on certified servers.',
    color: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
  },
  {
    id: 'rights',
    icon: Bell,
    title: '5. Your Rights',
    content: 'You have the right to access, correct, or delete your personal information at any time. You may also opt out of marketing communications. Contact our support team to exercise any of these rights.',
    color: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
  },
  {
    id: 'cookies',
    icon: Cookie,
    title: '6. Cookies Policy',
    content: 'We use cookies to enhance your browsing experience, remember your preferences, and analyze website traffic. You can control or disable cookies through your browser settings without affecting most site functionality.',
    color: 'from-amber-500 to-yellow-500',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
  },
  {
    id: 'updates',
    icon: RefreshCw,
    title: '7. Policy Updates',
    content: 'We may update this privacy policy from time to time to reflect changes in our practices. We will notify you of any significant changes by posting the new policy on this page and updating the effective date.',
    color: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-50 dark:bg-cyan-950/20',
  },
  {
    id: 'contact',
    icon: Mail,
    title: '8. Contact Us',
    content: 'If you have any questions about this privacy policy or our data practices, please contact our Privacy Officer at indrakausilaprivatelimitedcomp@gmail.com or write to us at our registered office address.',
    color: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50 dark:bg-rose-950/20',
  },
];

export default function PrivacyPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    fetch('/api/content?key=privacy')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setContent(data.content?.value || ''); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative py-16 sm:py-24 bg-zinc-950 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-agro-green/10 rounded-full blur-[120px] animate-blob" />
        <div className="absolute inset-0 hero-grid opacity-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-agro-green/15 border border-agro-green/30 text-agro-green text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Your Data, Our Responsibility
          </div>
          <h1 className="text-hero font-display font-bold text-white mb-4">
            Privacy <span className="gradient-text-animate">Policy</span>
          </h1>
          <p className="text-zinc-300 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
            We are committed to protecting your personal data and ensuring your privacy at every step.
          </p>
          <p className="text-zinc-500 text-sm mt-4">Last updated: April 4, 2026</p>
        </div>
      </section>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <section className="py-12 sm:py-20 bg-white dark:bg-zinc-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 max-w-6xl mx-auto">

            {/* Sidebar TOC */}
            <aside className="lg:col-span-3 hidden lg:block">
              <div className="sticky top-24 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl p-6 border border-zinc-100 dark:border-white/5">
                <h3 className="font-display font-bold text-sm uppercase tracking-widest text-zinc-500 mb-4">Contents</h3>
                <nav className="space-y-1">
                  {sections.map(({ id, title }) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      onClick={() => setActiveSection(id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        activeSection === id
                          ? 'bg-agro-green/10 text-agro-green'
                          : 'text-zinc-500 hover:text-agro-green hover:bg-agro-green/5'
                      }`}
                    >
                      <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{title.replace(/^\d+\. /, '')}</span>
                    </a>
                  ))}
                </nav>

                <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-agro-green" />
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">GDPR Compliant</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    We follow GDPR and applicable data protection laws.
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
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  ))}
                </div>
              ) : content ? (
                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
              ) : (
                <div className="space-y-6">
                  {sections.map(({ id, icon: Icon, title, content: text, color, bg }) => (
                    <div
                      key={id}
                      id={id}
                      className={`group p-5 sm:p-8 rounded-3xl ${bg} border border-transparent hover:border-agro-green/20 transition-all duration-500 card-hover`}
                    >
                      <div className="flex items-start gap-4 sm:gap-5">
                        <div className={`w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                          <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="font-display font-bold text-base sm:text-xl mb-3">{title}</h2>
                          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm sm:text-base">{text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer note */}
              <div className="mt-8 sm:mt-10 p-4 sm:p-6 rounded-3xl bg-agro-green/5 border border-agro-green/15">
                <div className="flex items-start gap-3 sm:gap-4">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-agro-green flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold mb-1">Question about privacy?</h4>
                    <p className="text-zinc-500 text-xs sm:text-sm">
                      Email our Privacy Officer at{' '}
                      <a href="mailto:indrakausilaprivatelimitedcomp@gmail.com" className="text-agro-green font-semibold hover:underline">
                        indrakausilaprivatelimitedcomp@gmail.com
                      </a>{' '}
                      or{' '}
                      <Link href="/contact" className="text-agro-orange font-semibold hover:underline">
                        use our contact form
                      </Link>.
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
