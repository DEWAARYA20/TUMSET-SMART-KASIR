'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscriptionStore } from '@/lib/store/subscription-store';
import { OFFICIAL_PLANS } from '@/types/subscription';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Crown,
  CreditCard,
  History,
  RefreshCw,
  ShieldCheck,
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const statusConfig: Record<string, { label: string; color: string }> = {
  inactive: {
    label: 'Belum Berlangganan',
    color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  },
  active: {
    label: 'Aktif',
    color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
  },
  expired: {
    label: 'Kedaluwarsa',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  },
  pending: {
    label: 'Menunggu',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  },
  canceled: {
    label: 'Dibatalkan',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300',
  },
  past_due: {
    label: 'Tertunggak',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  },
  suspended: {
    label: 'Disuspend',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  paid: {
    label: 'Lunas',
    color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
  },
  pending: {
    label: 'Menunggu',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  },
  pending_verification: {
    label: 'Verifikasi',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  },
  failed: {
    label: 'Gagal',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  },
  expired: {
    label: 'Expired',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300',
  },
  refunded: {
    label: 'Refund',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  },
};

export default function SubscriptionPage() {
  const router = useRouter();
  const { subscription, orders, history, checkSubscriptionStatus } =
    useSubscriptionStore();

  const subStatus = checkSubscriptionStatus();

  // Calculate progress
  const progressPercent = useMemo(() => {
    if (!subscription || subscription.status !== 'active') return 0;
    const start = new Date(subscription.starts_at).getTime();
    const end = new Date(subscription.expires_at).getTime();
    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  }, [subscription]);

  const currentPlan = useMemo(
    () => OFFICIAL_PLANS.find((p) => p.id === subscription?.plan_id),
    [subscription]
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 lg:px-8 lg:py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Langganan Saya
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Kelola paket langganan dan riwayat pembayaran Anda
        </p>
      </div>

      {/* Subscription Status Card */}
      <Card className="border-border/60 shadow-lg overflow-hidden">
        <div className="relative">
          {/* Gradient accent */}
          <div
            className={`absolute top-0 left-0 right-0 h-1 ${
              subStatus.isSubscribed
                ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                : 'bg-gradient-to-r from-amber-500 to-orange-400'
            }`}
          />

          <CardHeader className="pt-6 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                    subStatus.isSubscribed
                      ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {subStatus.isSubscribed ? (
                    <ShieldCheck className="h-6 w-6" />
                  ) : (
                    <Clock className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-base font-bold">
                    {currentPlan?.name || 'Tidak ada paket aktif'}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {subscription ? (
                      <>
                        <Badge
                          className={`text-[9px] px-1.5 py-0 mr-1.5 border-0 ${
                            statusConfig[subscription.status]?.color || ''
                          }`}
                        >
                          {statusConfig[subscription.status]?.label || subscription.status}
                        </Badge>
                        {subStatus.isSubscribed && (
                          <span>{subStatus.daysRemaining} hari tersisa</span>
                        )}
                      </>
                    ) : (
                      'Belum memiliki langganan aktif'
                    )}
                  </CardDescription>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => router.push('/billing/pricing')}
                className="text-xs font-bold gap-1.5 h-9"
              >
                {subStatus.isSubscribed ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Perpanjang
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5" />
                    Berlangganan
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          {subscription && (
            <CardContent className="space-y-4 pb-6">
              {/* Progress Bar */}
              {subStatus.isSubscribed && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Dimulai: {formatDate(subscription.starts_at)}</span>
                    <span>Berakhir: {formatDate(subscription.expires_at)}</span>
                  </div>
                  <Progress
                    value={progressPercent}
                    className="h-2"
                  />
                  <p className="text-[10px] text-muted-foreground text-center">
                    {progressPercent}% masa langganan telah berlalu
                  </p>
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground">Paket</p>
                  <p className="text-xs font-bold text-foreground mt-0.5">
                    {currentPlan?.name || '-'}
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground">Durasi</p>
                  <p className="text-xs font-bold text-foreground mt-0.5">
                    {currentPlan?.duration_months || 0} Bulan
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground">Per Bulan</p>
                  <p className="text-xs font-bold text-foreground mt-0.5">
                    {currentPlan ? formatRupiah(currentPlan.effective_price_monthly) : '-'}
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground">Total</p>
                  <p className="text-xs font-bold text-foreground mt-0.5">
                    {currentPlan ? formatRupiah(currentPlan.price_idr) : '-'}
                  </p>
                </div>
              </div>

              {/* Data Safe Notice */}
              <div className="flex items-center gap-2 bg-teal-500/5 rounded-lg p-3">
                <Store className="h-4 w-4 text-teal-500 shrink-0" />
                <p className="text-[10px] text-teal-700 dark:text-teal-300">
                  Data toko Anda selalu aman dan tidak akan dihapus saat langganan berakhir.
                </p>
              </div>
            </CardContent>
          )}
        </div>
      </Card>

      {/* Payment History */}
      <Card className="border-border/60 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Riwayat Pembayaran
          </CardTitle>
          <CardDescription className="text-xs">
            Daftar transaksi pembayaran langganan Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                Belum ada riwayat pembayaran
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => {
                const pStatus = paymentStatusConfig[order.status];
                return (
                  <div
                    key={order.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-foreground truncate">
                          {order.plan_name}
                        </p>
                        <Badge
                          className={`text-[9px] px-1.5 py-0 border-0 shrink-0 ${
                            pStatus?.color || ''
                          }`}
                        >
                          {pStatus?.label || order.status}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {order.order_number} • {formatDateTime(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-foreground">
                        {formatRupiah(order.amount_idr)}
                      </p>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        {order.payment_method.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription History */}
      <Card className="border-border/60 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Riwayat Aktivitas Langganan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                Belum ada riwayat aktivitas
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item, index) => (
                <div key={item.id} className="flex gap-3">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                        item.action === 'activated' || item.action === 'renewed'
                          ? 'bg-teal-500/10 text-teal-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {item.action === 'activated' ? (
                        <Check className="h-3 w-3" />
                      ) : item.action === 'renewed' ? (
                        <RefreshCw className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                    </div>
                    {index < history.length - 1 && (
                      <div className="w-px flex-1 bg-border/50 my-1" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-3 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-foreground capitalize">
                        {item.action === 'activated'
                          ? 'Diaktifkan'
                          : item.action === 'renewed'
                          ? 'Diperpanjang'
                          : item.action === 'expired'
                          ? 'Kedaluwarsa'
                          : item.action === 'canceled'
                          ? 'Dibatalkan'
                          : 'Disuspend'}
                      </p>
                      <Badge
                        className={`text-[9px] px-1.5 py-0 border-0 ${
                          statusConfig[item.new_status]?.color || ''
                        }`}
                      >
                        {statusConfig[item.new_status]?.label || item.new_status}
                      </Badge>
                    </div>
                    {item.notes && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {item.notes}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                      {formatDateTime(item.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
