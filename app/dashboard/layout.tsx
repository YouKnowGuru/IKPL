'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Settings, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const sidebarLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/orders', label: 'My Orders', icon: Package },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-agro-green border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Component */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-24 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-4 shadow-xl">
            {/* User Mini Profile */}
            <div className="flex items-center gap-3 px-2 mb-6">
              <div className="h-12 w-12 rounded-full flex items-center justify-center ring-2 ring-agro-green/30 bg-gradient-to-br from-agro-green to-agro-orange text-white font-bold text-xl shadow-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white leading-tight truncate w-32">{user?.name}</h3>
                <p className="text-xs text-zinc-500 font-medium capitalize">{user?.role}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 min-w-[140px] lg:min-w-0 flex-shrink-0',
                      isActive
                        ? 'bg-agro-green text-white shadow-lg shadow-agro-green/20 scale-[1.02]'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn('h-5 w-5', isActive ? 'text-white' : 'text-zinc-400')} />
                      {link.label}
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4 hidden lg:block" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-6 lg:p-8 shadow-xl">
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
}
