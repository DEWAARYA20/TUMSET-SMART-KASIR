'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSubscriptionStore } from '@/lib/store/subscription-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Clock,
  Crown,
  Lock,
  ShieldAlert,
  Store,
  Zap,
} from 'lucide-react';

/**
 * Routes that are ALWAYS accessible, regardless of subscription status.
 * Users can login, logout, view pricing, manage billing, access settings,
 * view terms/privacy/help, and see the dashboard (with limited info).
 */
const ALWAYS_ALLOWED_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/auth',
  '/billing',
  '/settings',
  '/terms',
  '/privacy',
  '/help',
  '/onboarding',
];

/**
 * Routes that require an ACTIVE subscription to access.
 * When subscription is not active (pending, expired, canceled, past_due, suspended),
 * these routes will show the subscription wall instead.
 */
const PROTECTED_PATHS = [
  '/pos',
  '/products',
  '/categories',
  '/inventory',
  '/transactions',
  '/expenses',
  '/reports',
  '/ai',
  '/debts',
  '/scan',
  '/suppliers',
  '/returns',
];

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { checkSubscriptionStatus, subscription } = useSubscriptionStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  const subStatus = checkSubscriptionStatus();

  // Check if current path is always allowed
  const isAlwaysAllowed = ALWAYS_ALLOWED_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  // Dashboard root is always accessible
  if (pathname === '/dashboard' || isAlwaysAllowed) {
    return (
      <>
        {/* Show expiring soon banner */}
        {subStatus.isSubscribed && subStatus.isExpiringSoon && (
          <ExpiringBanner daysRemaining={subStatus.daysRemaining} />
        )}
        {children}
      </>
    );
  }

  // Check if current path needs protection
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (!isProtected) {
    return <>{children}</>;
  }

  // If subscription is active, allow access
  if (subStatus.isSubscribed) {
    return (
      <>
        {subStatus.isExpiringSoon && (
          <ExpiringBanner daysRemaining={subStatus.daysRemaining} />
        )}
        {children}
      </>
    );
  }

  // LOCKED: Show subscription wall
  return <SubscriptionWall status={subStatus.status} />;
}

/**
 * Expiring soon banner — subtle top banner warning
 */
function ExpiringBanner({ daysRemaining }: { daysRemaining: number }) {
  const router = useRouter();

  return (
    <div className="bg-amber-500/10 border-b border-amber-200/40 dark:border-amber-800/30 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300 font-medium truncate">
            Langganan Anda berakhir dalam{' '}
            <span className="font-bold">{daysRemaining} hari</span>. Perpanjang sekarang agar
            tidak terganggu.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => router.push('/billing/pricing')}
          className="shrink-0 h-7 text-[10px] font-bold gap-1 bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Zap className="h-3 w-3" />
          Perpanjang
        </Button>
      </div>
    </div>
  );
}

/**
 * Subscription wall — full-page lock when subscription is inactive
 */
function SubscriptionWall({
  status,
}: {
  status: string;
}) {
  const router = useRouter();

  const statusMessages: Record<string, { title: string; desc: string; icon: React.ReactNode }> = {
    expired: {
      title: 'Langganan Telah Berakhir',
      desc: 'Masa langganan Anda sudah habis. Perpanjang sekarang untuk melanjutkan akses ke semua fitur kasir pintar.',
      icon: <Clock className="h-8 w-8" />,
    },
    pending: {
      title: 'Menunggu Aktivasi',
      desc: 'Pembayaran Anda sedang diproses. Silakan tunggu konfirmasi atau hubungi admin jika sudah lebih dari 24 jam.',
      icon: <ShieldAlert className="h-8 w-8" />,
    },
    canceled: {
      title: 'Langganan Dibatalkan',
      desc: 'Langganan Anda telah dibatalkan. Anda dapat berlangganan kembali kapan saja tanpa kehilangan data.',
      icon: <AlertTriangle className="h-8 w-8" />,
    },
    past_due: {
      title: 'Pembayaran Tertunggak',
      desc: 'Pembayaran perpanjangan langganan Anda gagal. Silakan perbarui metode pembayaran atau bayar manual.',
      icon: <AlertTriangle className="h-8 w-8" />,
    },
    suspended: {
      title: 'Akun Disuspend',
      desc: 'Akun Anda sedang dalam peninjauan. Hubungi tim support untuk informasi lebih lanjut.',
      icon: <Lock className="h-8 w-8" />,
    },
  };

  const msg = statusMessages[status] || statusMessages.expired;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Decorative background */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5 rounded-3xl blur-xl" />

          <div className="relative bg-card border border-border/60 rounded-2xl shadow-xl p-8 space-y-5">
            {/* Lock Icon */}
            <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              {msg.icon}
            </div>

            {/* Status Badge */}
            <Badge className="text-[10px] font-bold px-3 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-0">
              {status === 'expired' && 'Kedaluwarsa'}
              {status === 'pending' && 'Menunggu'}
              {status === 'canceled' && 'Dibatalkan'}
              {status === 'past_due' && 'Tertunggak'}
              {status === 'suspended' && 'Disuspend'}
            </Badge>

            {/* Message */}
            <div className="space-y-2">
              <h2 className="text-xl font-black text-foreground tracking-tight">{msg.title}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">{msg.desc}</p>
            </div>

            {/* Data Safe Notice */}
            <div className="flex items-center gap-2 bg-teal-500/5 rounded-lg p-3 text-left">
              <Store className="h-4 w-4 text-teal-500 shrink-0" />
              <p className="text-[10px] text-teal-700 dark:text-teal-300">
                <span className="font-bold">Data toko Anda aman!</span> Semua produk, transaksi,
                dan laporan tetap tersimpan. Anda hanya perlu memperpanjang langganan.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <Button
                onClick={() => router.push('/billing/pricing')}
                className="w-full h-11 text-xs font-bold gap-2"
              >
                <Crown className="h-4 w-4" />
                Lihat Paket Langganan
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="w-full h-10 text-xs"
              >
                Kembali ke Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Help link */}
        <p className="text-[10px] text-muted-foreground/70">
          Butuh bantuan? Hubungi{' '}
          <button
            onClick={() => router.push('/help')}
            className="underline hover:text-foreground transition-colors"
          >
            Tim Support
          </button>
        </p>
      </div>
    </div>
  );
}
