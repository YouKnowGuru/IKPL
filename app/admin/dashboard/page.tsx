'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Package, TrendingUp, Users,
  ShoppingCart, BarChart3, Clock, Archive,
  CreditCard, Wallet, HandCoins
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const loadStats = () => {
    setLoading(true);
    fetch('/api/admin/stats', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.stats);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Revenue card (always first) ───────────────────────────────────────────
  const statCards: {
    label: string;
    value: string | number;
    sub?: string;
    icon: any;
    color: string;
    bg: string;
  }[] = [
    {
      label: 'Total Revenue',
      value: `Nu. ${(stats?.revenue ?? 0).toLocaleString()}`,
      sub: 'All money received',
      icon: TrendingUp,
      color: 'text-agro-green',
      bg: 'bg-agro-green/10',
    },
    {
      label: 'Total Orders',
      value: stats?.orders ?? 0,
      icon: ShoppingCart,
      color: 'text-agro-orange',
      bg: 'bg-agro-orange/10',
    },
    {
      label: 'Outstanding Credit',
      value: `Nu. ${(stats?.totalCredit ?? 0).toLocaleString()}`,
      sub: 'Owed but not paid',
      icon: CreditCard,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Advance Received',
      value: `Nu. ${(stats?.totalAdvanceReceived ?? 0).toLocaleString()}`,
      sub: 'Partial payments in hand',
      icon: Wallet,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Advance Remaining',
      value: `Nu. ${(stats?.totalAdvanceRemaining ?? 0).toLocaleString()}`,
      sub: 'Still to collect',
      icon: HandCoins,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Active Pickups',
      value: stats?.pending ?? 0,
      icon: Clock,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ];

  // Super admin gets extra cards
  if (isSuperAdmin) {
    if (stats?.customers !== undefined) {
      statCards.push({
        label: 'Total Customers',
        value: stats.customers ?? 0,
        icon: Users,
        color: 'text-indigo-500',
        bg: 'bg-indigo-500/10',
      });
    }
    if (stats?.blogs !== undefined) {
      statCards.push({
        label: 'Blog Posts',
        value: stats.blogs ?? 0,
        icon: Archive,
        color: 'text-zinc-400',
        bg: 'bg-zinc-400/10',
      });
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in flex flex-col min-h-full">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-agro-green/10 text-agro-green text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-agro-green/20 mb-3">
            <BarChart3 className="h-3 w-3" />
            Overview
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 mt-2 max-w-xl text-sm">
            Real-time snapshot of revenue, credit outstanding, and advance collections.
          </p>
        </div>
        <button
          onClick={loadStats}
          className="self-start md:self-auto text-xs font-bold text-zinc-400 hover:text-agro-green border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-2 transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="group relative p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Background ghost icon */}
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
              <stat.icon className="h-28 w-28" />
            </div>
            <div className={`${stat.bg} ${stat.color} h-12 w-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl sm:text-3xl font-display font-black text-zinc-900 dark:text-white leading-none">
              {stat.value}
            </h3>
            {stat.sub && (
              <p className="text-[11px] text-zinc-400 mt-1">{stat.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* CTA Banner */}
      <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-agro-green to-emerald-800 text-white relative overflow-hidden flex flex-col justify-center items-start shadow-xl shadow-agro-green/20">
        <div className="absolute right-0 bottom-0 opacity-20 p-8 transform translate-x-1/4 translate-y-1/4 pointer-events-none">
          <Package className="w-64 h-64" />
        </div>
        <div className="z-10 max-w-lg">
          <h2 className="text-2xl font-display font-bold mb-2">Track Orders & Payments</h2>
          <p className="text-emerald-100 text-sm mb-6 leading-relaxed">
            Record payments, mark pickups as completed, and send automated billing emails — all from the orders queue.
          </p>
          <Link href="/admin/orders">
            <button className="bg-white text-agro-green px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors shadow-lg flex items-center gap-2 group">
              Go to Orders Queue <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
