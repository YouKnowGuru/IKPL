'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/shared/Toast';
import {
  Mail, Phone, MapPin, Clock, Send, Loader2,
  MessageSquare, CheckCircle, Linkedin, Twitter,
  Facebook, Instagram, ArrowRight, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

// We will dynamically compute this inside the component now

const faqs = [
  { q: "Where can I pick up my order?", a: "We have certified store locations across all 20 states of Bhutan. Simply select your preferred state at checkout to see the nearest pickup point and availability." },
  { q: "What's the minimum order quantity?", a: "Our minimum order is just 1 bag, with bulk discounts available for orders above 500kg. Contact us for wholesale pricing." },
  { q: "Are the products you distribute certified?", a: "Yes! All the brands we distribute are highly certified and use 100% natural ingredients with no synthetic additives or growth hormones." },
  { q: "How do I get expert advice?", a: "Our dedicated product specialists and support team are available via call, email, or chat. You can also book a free farm consultation." },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '', locationId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [settings, setSettings] = useState<any>({});
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(d => {
        if (d.success && d.settings) setSettings(d.settings);
      })
      .catch(() => {});

    fetch('/api/locations?all=true', { cache: 'no-store' })
      .then(res => res.json())
      .then(d => {
        if (d.success && d.locations) {
          setLocations(d.locations.filter((l: any) => l.isActive));
        }
      })
      .catch(() => {});
  }, []);

  const contactBoxes = [
    {
      icon: MapPin,
      label: 'Head Office',
      lines: settings.contactInfo?.address ? settings.contactInfo.address.split(', ') : ['123 Farm Tech Avenue', 'IKPL Plaza, Suite 900'],
      color: 'from-emerald-500 to-green-600',
      bg: 'bg-green-50 dark:bg-green-950/20',
    },
    {
      icon: Phone,
      label: 'Phone',
      lines: settings.contactInfo?.phone ? settings.contactInfo.phone.split(', ') : ['+1 (800) IKPL-FEED', '+1 (555) 987-6543'],
      color: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      icon: Mail,
      label: 'Email',
      lines: settings.contactInfo?.email ? settings.contactInfo.email.split(', ') : ['indrakausilaprivatelimitedcomp@gmail.com'],
      color: 'from-orange-500 to-amber-500',
      bg: 'bg-orange-50 dark:bg-orange-950/20',
    },
    {
      icon: Clock,
      label: 'Working Hours',
      lines: settings.contactInfo?.workingHours ? settings.contactInfo.workingHours.split(', ') : ['Mon – Fri: 8AM – 6PM', 'Saturday: 9AM – 4PM'],
      color: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-50 dark:bg-purple-950/20',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSent(true);
        showToast('Message sent! We\'ll respond within 24 hours.', 'success');
        setFormData({ name: '', email: '', subject: '', message: '', locationId: '' });
        setTimeout(() => setSent(false), 6000);
      } else {
        const d = await res.json();
        showToast(d.message || 'Failed to send message', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[50vh] flex items-center pt-24 pb-16 overflow-hidden bg-zinc-950">
        <div className="absolute inset-0">
          <NextImage
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80"
            alt="Farmers in field"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/30" />
        </div>
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-agro-green/15 rounded-full blur-[120px] animate-blob" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-agro-green/15 border border-agro-green/30 text-agro-green text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            We'd Love to Hear From You
          </div>
          <h1 className="text-hero font-display font-bold text-white mb-4">
            Contact <span className="gradient-text-animate">IKPL</span>
          </h1>
          <p className="text-zinc-300 text-sm sm:text-xl max-w-xl mx-auto leading-relaxed">
            Our team of farming experts is ready to help — whether you have a quick question or need a full consultation.
          </p>
        </div>
      </section>

      {/* ── CONTACT INFO CARDS ────────────────────────────────────── */}
      <section className="py-16 bg-white dark:bg-zinc-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 stagger-children">
            {contactBoxes.map(({ icon: Icon, label, lines, color, bg }) => (
              <div key={label} className={`group p-3 sm:p-7 rounded-2xl sm:rounded-3xl ${bg} border border-transparent hover:border-agro-green/20 dark:hover:border-agro-green/20 transition-all duration-500 card-hover`}>
                <div className={`w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br ${color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-5 shadow-md group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                  <Icon className="h-3.5 w-3.5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="font-display font-bold text-[10px] sm:text-base mb-1 sm:mb-2">{label}</h3>
                {lines.map((line: string, i: number) => (
                  <p key={i} className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-sm leading-relaxed break-all">{line}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORM + FAQ ───────────────────────────────────────────── */}
      <section className="py-16 bg-zinc-50 dark:bg-zinc-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* ── Contact Form ─── */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 border border-zinc-100 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-agro-green/10 rounded-2xl flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-agro-green" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl">Send Us a Message</h2>
                    <p className="text-zinc-400 text-sm">We reply within 24 hours</p>
                  </div>
                </div>

                {sent ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-agro-green/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-zoom-in">
                      <CheckCircle className="h-8 w-8 text-agro-green" />
                    </div>
                    <h3 className="font-display font-bold text-xl mb-2">Message Sent!</h3>
                    <p className="text-zinc-500 text-sm">Our team will get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                          placeholder="Farmer John"
                          required
                          disabled={isSubmitting}
                          className="h-12 rounded-xl border-zinc-200 dark:border-white/10 focus:border-agro-green focus:ring-agro-green/20 bg-zinc-50 dark:bg-zinc-800 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                          placeholder="farmer@example.com"
                          required
                          disabled={isSubmitting}
                          className="h-12 rounded-xl border-zinc-200 dark:border-white/10 focus:border-agro-green focus:ring-agro-green/20 bg-zinc-50 dark:bg-zinc-800 text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Subject</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData(f => ({ ...f, subject: e.target.value }))}
                        placeholder="How can we help you?"
                        required
                        disabled={isSubmitting}
                        className="h-12 rounded-xl border-zinc-200 dark:border-white/10 focus:border-agro-green focus:ring-agro-green/20 bg-zinc-50 dark:bg-zinc-800 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Which Store are you trying to reach? (Optional)</Label>
                      <select
                        id="location"
                        value={formData.locationId}
                        onChange={(e) => setFormData(f => ({ ...f, locationId: e.target.value }))}
                        disabled={isSubmitting}
                        className="flex h-12 w-full items-center justify-between rounded-xl border border-zinc-200 dark:border-white/10 focus:border-agro-green focus:ring-agro-green/20 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm"
                      >
                        <option value="">General Support / HQ</option>
                        {locations.map((loc) => (
                          <option key={loc._id} value={loc._id}>
                            {loc.name} — {loc.district}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Message</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData(f => ({ ...f, message: e.target.value }))}
                        placeholder="Tell us about your farm, livestock, or what you need from us..."
                        rows={5}
                        required
                        disabled={isSubmitting}
                        className="rounded-xl border-zinc-200 dark:border-white/10 focus:border-agro-green focus:ring-agro-green/20 bg-zinc-50 dark:bg-zinc-800 resize-none text-sm"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-glow-green w-full h-13 text-white font-bold rounded-2xl border-0 group"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                      ) : (
                        <><Send className="h-4 w-4 mr-2" /> Send Message <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </Button>
                  </form>
                )}
              </div>

              {/* Social links */}
              <div className="mt-6 flex items-center gap-3">
                <span className="text-sm text-zinc-500 font-medium">Connect on:</span>
                {[
                  { icon: Facebook, label: 'Facebook', href: settings.socialLinks?.facebook || '#', color: 'hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]' },
                  { icon: Twitter, label: 'Twitter', href: '#', color: 'hover:bg-zinc-800 hover:text-white hover:border-zinc-700' },
                  { icon: Instagram, label: 'Instagram', href: settings.socialLinks?.instagram || '#', color: 'hover:bg-pink-500 hover:text-white hover:border-pink-500' },
                  { icon: Linkedin, label: 'LinkedIn', href: '#', color: 'hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]' },
                ].map(({ icon: Icon, label, href, color }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noreferrer"
                    className={cn('w-9 h-9 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-500 flex items-center justify-center transition-all duration-300 -translate-y-0 hover:-translate-y-1', color)}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* ── FAQ ─── */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <h3 className="font-display font-bold text-xl mb-6">Frequently Asked</h3>
                <div className="space-y-3">
                  {faqs.map(({ q, a }, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-white/5 overflow-hidden"
                    >
                      <button
                        className="w-full text-left p-5 flex items-start justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors"
                        onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                      >
                        <span className="font-semibold text-sm leading-relaxed">{q}</span>
                        <span className={cn('flex-shrink-0 w-5 h-5 rounded-full bg-agro-green/10 text-agro-green flex items-center justify-center text-xs font-bold transition-transform mt-0.5', activeFaq === i && 'rotate-45')}>
                          +
                        </span>
                      </button>
                      {activeFaq === i && (
                        <div className="px-5 pb-5">
                          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{a}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Quick contact */}
                <div className="mt-6 bg-gradient-to-br from-agro-green/10 to-agro-orange/5 border border-agro-green/15 rounded-3xl p-6">
                  <h4 className="font-display font-bold mb-2">Need Urgent Help?</h4>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">Call us directly for immediate assistance from our farming experts.</p>
                  <a href={`tel:${settings.contactInfo?.phone || '+18004755334'}`}>
                    <Button className="btn-glow-green w-full rounded-2xl text-white font-bold border-0 h-11 group">
                      <Phone className="mr-2 h-4 w-4" />
                      Call {settings.contactInfo?.phone || '+1 (800) IKPL-FEED'}
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Map ───────────────────────────────────────── */}
      <section className="h-[450px] w-full relative bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113942.34563842887!2d89.98664188730467!3d27.02538961726058!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e1a6c4293f7739%3A0x633d4554b706c627!2sTsirang%2C%20Bhutan!5e0!3m2!1sen!2sus!4v1712239140000!5m2!1sen!2sus"
          width="100%"
          height="100%"
          style={{ border: 0, filter: 'grayscale(100%) invert(90%) contrast(90%)' }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="dark:opacity-80"
        />
        <div className="absolute top-6 left-6 z-10 hidden md:block">
          <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-zinc-200 dark:border-white/10 max-w-[240px]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-agro-green/10 rounded-lg flex items-center justify-center">
                <MapPin className="h-4 w-4 text-agro-green" />
              </div>
              <h4 className="font-display font-bold text-sm">Tsirang Office</h4>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Main Distribution Hub,<br />
              Tsirang, Bhutan.<br />
              P.O. Box: 36001
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
