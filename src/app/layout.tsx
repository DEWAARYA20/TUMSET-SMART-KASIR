import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'TUMSET Smart Kios — Kasir Pintar untuk Kios Anda',
    template: '%s | TUMSET Smart Kios',
  },
  description:
    'Aplikasi kasir kios modern dengan AI. Kelola penjualan, persediaan, dan laporan bisnis dengan mudah. Scan barcode, cetak struk, analitik cerdas.',
  keywords: [
    'kasir',
    'kios',
    'POS',
    'point of sale',
    'aplikasi kasir',
    'manajemen toko',
    'barcode scanner',
    'struk digital',
  ],
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TUMSET Smart Kios',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1d2e' },
  ],
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${inter.variable} h-full`}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-full antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delay={0}>
            {children}
          </TooltipProvider>
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
            }}
          />
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
