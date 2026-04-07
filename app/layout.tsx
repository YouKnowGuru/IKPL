import type { Metadata, Viewport } from 'next';
import { Inter, Syne, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import { ThemeProvider } from '@/hooks/useTheme';
import { ToastProvider } from '@/components/shared/Toast';
import { Navbar, Footer, BackToTop } from '@/components/shared';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ikpl-feed.com'),
  title: {
    default: 'IKPL — Premium Animal Feed | Trusted by 20,000+ Farmers',
    template: '%s | IKPL Premium Feeds',
  },
  description: 'IKPL provides scientifically-formulated, ISO-certified animal feed for broilers, layers, cattle, fish, and more. Available for store pickup across all 20 states of Bhutan since 2004.',
  keywords: ['IKPL', 'animal feed', 'premium livestock feed', 'broiler feed', 'cattle feed', 'fish feed', 'poultry nutrition', 'farmer', 'agro'],
  authors: [{ name: 'IKPL Group' }],
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'IKPL — Premium Animal Feed',
    description: 'Nourishing farms, nurturing futures. Premium quality animal feed for healthier livestock and better yields.',
    type: 'website',
    locale: 'en_US',
    siteName: 'IKPL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IKPL — Premium Animal Feed',
    description: 'Trusted by 20,000+ farmers. ISO-certified, science-backed animal nutrition.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${syne.variable} ${spaceGrotesk.variable}`}
    >
      <body className="font-body antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "url": "https://ikpl-feed.com",
              "logo": "https://ikpl-feed.com/logo.png"
            })
          }}
        />
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
                <div className="flex min-h-screen flex-col">
                  <Navbar />
                  <main className="flex-1">{children}</main>
                  <Footer />
                  <BackToTop />
                </div>
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
