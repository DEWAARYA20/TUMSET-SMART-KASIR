'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OFFICIAL_PLANS, SubscriptionPlan } from '@/types/subscription';
import { useSubscriptionStore } from '@/lib/store/subscription-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Check,
  Crown,
  Flame,
  Loader2,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Zap,
} from 'lucide-react';

function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const planIcons: Record<string, React.ReactNode> = {
  monthly: <Zap className="h-5 w-5" />,
  '3_months': <Star className="h-5 w-5" />,
  '6_months': <Flame className="h-5 w-5" />,
  '9_months': <ShieldCheck className="h-5 w-5" />,
  yearly: <Crown className="h-5 w-5" />,
};

const planGradients: Record<string, string> = {
  monthly:
    'from-slate-500/10 via-slate-400/5 to-transparent dark:from-slate-400/10 dark:via-slate-500/5',
  '3_months':
    'from-blue-500/10 via-blue-400/5 to-transparent dark:from-blue-400/10 dark:via-blue-500/5',
  '6_months':
    'from-amber-500/10 via-orange-400/5 to-transparent dark:from-amber-400/10 dark:via-orange-500/5',
  '9_months':
    'from-violet-500/10 via-purple-400/5 to-transparent dark:from-violet-400/10 dark:via-purple-500/5',
  yearly:
    'from-teal-500/15 via-emerald-400/5 to-transparent dark:from-teal-400/15 dark:via-emerald-500/5',
};

const planAccentColors: Record<string, string> = {
  monthly: 'text-slate-600 dark:text-slate-300',
  '3_months': 'text-blue-600 dark:text-blue-400',
  '6_months': 'text-amber-600 dark:text-amber-400',
  '9_months': 'text-violet-600 dark:text-violet-400',
  yearly: 'text-teal-600 dark:text-teal-400',
};

const planBorderColors: Record<string, string> = {
  monthly: 'border-border/60',
  '3_months': 'border-blue-200/60 dark:border-blue-800/40',
  '6_months': 'border-amber-200/60 dark:border-amber-800/40',
  '9_months': 'border-violet-200/60 dark:border-violet-800/40',
  yearly: 'border-teal-300/80 dark:border-teal-700/60 ring-2 ring-teal-500/20',
};

const badgeColors: Record<string, string> = {
  'Hemat 11%': 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  Populer: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  'Paling Hemat': 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
};

export default function PricingPage() {
  const router = useRouter();
  const { subscription, checkSubscriptionStatus } = useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const subStatus = checkSubscriptionStatus();
  const currentPlanId = subscription?.plan_id;

  function handleSelectPlan(plan: SubscriptionPlan) {
    setSelectedPlan(plan.code);
    setLoading(true);

    // Navigate to checkout/payment with plan info
    setTimeout(() => {
      router.push(`/billing/checkout?plan=${plan.code}`);
    }, 400);
  }

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-teal-500/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative px-4 py-8 lg:px-8 lg:py-12 max-w-7xl mx-auto text-center">
          {/* Logo */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 mb-5">
            <Store className="h-7 w-7" />
          </div>

          <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-foreground mb-3">
            Pilih Paket Langganan
          </h1>
          <p className="text-sm lg:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Kelola kios Anda dengan fitur kasir pintar, AI cerdas, dan laporan bisnis otomatis.
            Pilih paket terbaik sesuai kebutuhan Anda.
          </p>

          {/* Current subscription status */}
          {subStatus.isSubscribed && (
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>
                Langganan aktif • {subStatus.daysRemaining} hari tersisa
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="px-4 pb-10 lg:px-8 max-w-7xl mx-auto">
        {/* Desktop: Horizontal scroll, Mobile: Vertical stack */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-3">
          {OFFICIAL_PLANS.filter((p) => p.is_active).map((plan, index) => {
            const isYearly = plan.code === 'yearly';
            const isCurrentPlan = plan.id === currentPlanId;
            const iconColor = planAccentColors[plan.code] || '';
            const gradient = planGradients[plan.code] || '';
            const borderColor = planBorderColors[plan.code] || '';

            return (
              <Card
                key={plan.id}
                className={`
                  relative overflow-hidden transition-all duration-300 
                  hover:shadow-xl hover:-translate-y-1 
                  ${borderColor}
                  ${isYearly ? 'lg:scale-[1.03] shadow-lg shadow-teal-500/10' : 'shadow-md'}
                  ${isCurrentPlan ? 'opacity-80' : ''}
                `}
                style={{
                  animationDelay: `${index * 80}ms`,
                  animation: 'fadeInUp 0.5s ease-out both',
                }}
              >
                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${gradient} pointer-events-none`}
                />

                {/* Badge */}
                {plan.badge_label && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge
                      className={`
                        text-[10px] font-bold px-2 py-0.5 border-0 shadow-sm
                        ${badgeColors[plan.badge_label] || 'bg-muted text-muted-foreground'}
                      `}
                    >
                      {plan.badge_label === 'Paling Hemat' && (
                        <Sparkles className="h-3 w-3 mr-1" />
                      )}
                      {plan.badge_label}
                    </Badge>
                  </div>
                )}

                <CardHeader className="relative pb-2 pt-5">
                  {/* Plan icon */}
                  <div
                    className={`
                      h-10 w-10 rounded-xl flex items-center justify-center mb-3
                      ${
                        isYearly
                          ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400'
                          : 'bg-muted/80'
                      }
                      ${iconColor}
                    `}
                  >
                    {planIcons[plan.code]}
                  </div>

                  <CardTitle className="text-base font-bold tracking-tight">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {plan.duration_months} bulan akses penuh
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative space-y-4 pb-3">
                  {/* Price */}
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl lg:text-xl font-black text-foreground tracking-tight">
                        {formatRupiah(plan.price_idr)}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      ≈ {formatRupiah(plan.effective_price_monthly)}
                      <span className="opacity-70">/bulan</span>
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2">
                    {plan.features.map((feature, fi) => (
                      <li
                        key={fi}
                        className="flex items-start gap-2 text-xs text-foreground/80"
                      >
                        <Check
                          className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
                            isYearly
                              ? 'text-teal-500'
                              : 'text-primary/60'
                          }`}
                        />
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="relative pt-0 pb-5">
                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={loading || isCurrentPlan}
                    className={`
                      w-full h-10 text-xs font-bold gap-2 transition-all duration-200
                      ${
                        isYearly
                          ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/25 dark:bg-teal-500 dark:hover:bg-teal-600'
                          : ''
                      }
                      ${isCurrentPlan ? 'opacity-60' : ''}
                    `}
                    variant={isYearly ? 'default' : 'outline'}
                  >
                    {loading && selectedPlan === plan.code ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : isCurrentPlan ? (
                      'Paket Saat Ini'
                    ) : (
                      <>
                        <span>Pilih Paket</span>
                        <Zap className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Trust Section */}
        <div className="mt-10 text-center space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-teal-500" />
              <span>Pembayaran Aman & Terenkripsi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-teal-500" />
              <span>Aktivasi Instan Otomatis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Store className="h-4 w-4 text-teal-500" />
              <span>Data Toko Tetap Aman</span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground/70 max-w-md mx-auto leading-relaxed">
            Semua paket termasuk akses penuh ke seluruh fitur kasir pintar.
            Data toko Anda tidak akan dihapus saat langganan berakhir.
            Anda hanya perlu memperpanjang untuk melanjutkan akses.
          </p>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
