'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ShoppingCart, Sun, Moon, Menu, X, LogOut,
  LayoutDashboard, Package, ChevronDown, Leaf
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [settings, setSettings] = useState<{ logo?: string }>({});

  // Do not show navbar on admin pages
  if (pathname?.startsWith('/admin')) return null;

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isNavbarTransparent = false; // Always use solid/blurred background for visibility

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  const isActive = (href: string) => pathname === href;

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-500 ease-out',
        !isNavbarTransparent
          ? 'bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200/80 dark:border-white/5 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 md:h-16 items-center justify-between gap-3">


          {/* ── Logo ─────────────────────────────────────────────── */}
          <Link
            href="/"
            className="group flex items-center gap-2 flex-shrink-0 transition-transform duration-300 hover:scale-105"
          >
            <div className={cn(
              'relative h-9 w-9 rounded-full overflow-hidden border-2 transition-all duration-500 flex items-center justify-center shadow-lg active:scale-95 group-hover:shadow-agro-green/20 ring-2 ring-white/5',
              !isNavbarTransparent
                ? 'border-agro-green/30 bg-white'
                : 'border-white/40 bg-white/95 backdrop-blur-md'
            )}>

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
              <span className={cn(
                'font-display font-bold text-lg tracking-tight transition-colors duration-300',
                !isNavbarTransparent ? 'text-zinc-900 dark:text-white' : 'text-white'
              )}>
                IKPL
              </span>

              <span className={cn(
                'text-[9px] font-semibold uppercase tracking-[0.15em] transition-colors duration-300',
                !isNavbarTransparent ? 'text-agro-green' : 'text-white/60'
              )}>
                Premium Feeds
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ───────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200',
                  isActive(link.href)
                    ? !isNavbarTransparent
                      ? 'text-agro-green bg-agro-green/8'
                      : 'text-white bg-white/15'
                    : !isNavbarTransparent
                      ? 'text-zinc-600 dark:text-zinc-300 hover:text-agro-green hover:bg-agro-green/8'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-agro-green rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* ── Action Bar ───────────────────────────────────────── */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={cn(
                'rounded-lg h-8 w-8 transition-all duration-300',
                !isNavbarTransparent
                  ? 'hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300'
                  : 'hover:bg-white/10 text-white/80'
              )}
            >
              <div className="relative h-3.5 w-3.5">

                <Sun className={cn(
                  'absolute h-4 w-4 text-agro-orange transition-all',
                  theme === 'dark' ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
                )} />
                <Moon className={cn(
                  'absolute h-4 w-4 text-agro-green transition-all',
                  theme === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0'
                )} />
              </div>
            </Button>

            {/* Cart */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'relative rounded-lg h-8 w-8 transition-all duration-300',
                  !isNavbarTransparent
                    ? 'hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300'
                    : 'hover:bg-white/10 text-white/80',
                  totalItems > 0 && '!text-agro-green'
                )}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-agro-orange text-[8px] font-bold text-white flex items-center justify-center shadow-md border-2 border-white dark:border-zinc-950">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Button>
            </Link>


            {/* User */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'flex items-center gap-2 px-2 h-8 rounded-lg transition-all duration-300',
                      !isNavbarTransparent
                        ? 'hover:bg-zinc-100 dark:hover:bg-white/5 border border-zinc-200 dark:border-white/10'
                        : 'hover:bg-white/10 border border-white/20'
                    )}
                  >
                    <Avatar className="h-5 w-5 ring-2 ring-agro-green/40">
                      <AvatarFallback className="bg-gradient-to-br from-agro-green to-agro-orange text-white text-[9px] font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className={cn(
                      'text-xs font-semibold hidden sm:block max-w-[70px] truncate',
                      !isNavbarTransparent ? 'text-zinc-700 dark:text-zinc-200' : 'text-white'
                    )}>
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className={cn(
                      'h-2.5 w-2.5 transition-colors',
                      !isNavbarTransparent ? 'text-zinc-400' : 'text-white/60'
                    )} />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-60 rounded-2xl p-2 border border-zinc-200/80 dark:border-white/10 shadow-2xl bg-white dark:bg-zinc-900"
                  align="end"
                  forceMount
                >
                  <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-white/5 rounded-xl mb-2">
                    <Avatar className="h-10 w-10 ring-2 ring-agro-green/30">
                      <AvatarFallback className="bg-gradient-to-br from-agro-green to-agro-orange text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold leading-tight">{user.name}</p>
                      <p className="text-[11px] text-zinc-400 truncate max-w-[120px]">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-zinc-100 dark:bg-white/5 mx-1" />
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer my-1 hover:bg-agro-green/8 text-sm font-medium">
                    <Link href={(user.role === 'super_admin' || user.role === 'store_admin') ? '/admin/dashboard' : '/dashboard'} className="flex items-center w-full">
                      <LayoutDashboard className="mr-2 h-4 w-4 text-agro-green" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'customer' && (
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer hover:bg-agro-orange/8 text-sm font-medium">
                      <Link href="/orders" className="flex items-center w-full">
                        <Package className="mr-2 h-4 w-4 text-agro-orange" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-zinc-100 dark:bg-white/5 mx-1 my-1" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 focus:bg-red-50 cursor-pointer text-sm font-medium"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'rounded-lg text-xs font-bold h-8 px-3 transition-all',
                      !isNavbarTransparent
                        ? 'hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-200'
                        : 'hover:bg-white/10 text-white/80 hover:text-white'
                    )}
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="rounded-lg h-8 px-4 bg-agro-green hover:bg-agro-green/90 text-white font-bold text-xs border-0 shadow-md transition-all hover:scale-105"
                  >
                    Join
                  </Button>
                </Link>
              </div>
            )}


            {/* Mobile Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'md:hidden rounded-xl h-9 w-9 transition-all',
                !isNavbarTransparent
                  ? 'hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-200'
                  : 'hover:bg-white/10 text-white'
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="relative h-5 w-5">
                <Menu className={cn('absolute h-5 w-5 transition-all', mobileMenuOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100')} />
                <X className={cn('absolute h-5 w-5 transition-all', mobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-0')} />
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ───────────────────────────────────────── */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-500 ease-out bg-white dark:bg-zinc-950 border-b border-zinc-200/80 dark:border-white/5',
          mobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="container mx-auto px-4 py-6 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center justify-between px-5 py-4 text-base font-semibold rounded-2xl transition-all',
                isActive(link.href)
                  ? 'bg-agro-green text-white shadow-lg shadow-agro-green/20'
                  : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/5'
              )}
            >
              {link.label}
              {isActive(link.href) && <span className="w-2 h-2 bg-white rounded-full" />}
            </Link>
          ))}

          {!user ? (
            <div className="grid grid-cols-2 gap-3 pt-4 mt-2 border-t border-zinc-100 dark:border-white/5">
              <Link href="/login">
                <Button variant="outline" className="w-full rounded-2xl h-12 font-bold border-zinc-200 dark:border-white/10">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="w-full rounded-2xl h-12 bg-agro-green hover:bg-agro-green/90 font-bold border-0 text-white">
                  Join Free
                </Button>
              </Link>
            </div>
          ) : (
            <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-white/5">
              <Button
                variant="outline"
                onClick={logout}
                className="w-full rounded-2xl h-12 font-bold text-red-500 border-red-100 dark:border-red-950/30 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
