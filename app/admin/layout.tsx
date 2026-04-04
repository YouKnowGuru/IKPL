'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, ShoppingCart, Package, MapPin, 
  Users, Settings, FileText, Star, LogOut, Sun, Moon,
  Menu, X, Tags, LayoutGrid, UserCircle, Mail
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<{ logo?: string }>({});

  useEffect(() => {
    setMounted(true);
    if (!loading && (!user || (user.role !== 'super_admin' && user.role !== 'store_admin'))) {
      router.push('/login');
    }

    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(() => {});
  }, [user, loading, router]);

  if (!mounted || loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-agro-green border-t-transparent" />
      </div>
    );
  }

  const isSuperAdmin = user.role === 'super_admin';

  const menuItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, required: 'any' },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart, required: 'any' },
    { label: 'Inbox', href: '/admin/messages', icon: Mail, required: 'any' },
    { label: 'Inventory', href: '/admin/inventory', icon: Package, required: 'any' },
    { label: 'Products', href: '/admin/products', icon: Package, required: 'super_admin' },
    { label: 'Categories', href: '/admin/categories', icon: Tags, required: 'super_admin' },
    { label: 'Locations', href: '/admin/locations', icon: MapPin, required: 'super_admin' },
    { label: 'Users', href: '/admin/users', icon: Users, required: 'super_admin' },
    { label: 'Blog Posts', href: '/admin/blog', icon: FileText, required: 'super_admin' },
    { label: 'Our Team', href: '/admin/team', icon: Users, required: 'super_admin' },
    { label: 'Partners', href: '/admin/partners', icon: LayoutGrid, required: 'super_admin' },
    { label: 'Gallery', href: '/admin/gallery', icon: LayoutGrid, required: 'super_admin' },
    { label: 'Content CMS', href: '/admin/content', icon: FileText, required: 'super_admin' },
    { label: 'Reviews', href: '/admin/reviews', icon: Star, required: 'super_admin' },

    { label: 'Profile', href: '/admin/profile', icon: UserCircle, required: 'any' },
    { label: 'Settings', href: '/admin/settings', icon: Settings, required: 'super_admin' },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => item.required === 'any' || (item.required === 'super_admin' && isSuperAdmin)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex font-body text-zinc-900 dark:text-zinc-100">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-white/10 shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-white/10">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="h-8 w-8 rounded-full overflow-hidden border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shrink-0">
              <img 
                src={settings.logo || '/logo.png'} 
                alt="Logo" 
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=IKPL&background=10b981&color=fff';
                }}
              />
            </div>
            <span className="font-display font-black text-xl tracking-tight text-agro-green">
              IKPL <span className="text-zinc-900 dark:text-white font-bold">Admin</span>
            </span>
          </Link>
          <button className="lg:hidden text-zinc-500 hover:text-zinc-900 dark:hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 mt-4 ml-1">Menu</p>
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                  isActive 
                    ? "bg-agro-green text-white shadow-md shadow-agro-green/20" 
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                <Icon className={cn("h-4 w-4", !isActive && "opacity-70")} />
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-agro-green/10 text-agro-green flex items-center justify-center font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold truncate">
                {isSuperAdmin ? 'HQ Admin' : 'Store Admin'}
              </p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Header */}
        <header className="h-16 flex-shrink-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/10 flex items-center justify-between px-4 sm:px-6 z-30">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display font-bold text-lg hidden sm:block">Control Panel</h1>
          </div>
          
          <div className="flex items-center gap-3">
             <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
             >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
             </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50 dark:bg-zinc-950/50">
          {children}
        </main>
      </div>

    </div>
  );
}
