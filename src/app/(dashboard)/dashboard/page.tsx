'use client';

import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Wallet,
  PiggyBank,
  Receipt,
  Boxes,
  Calculator,
  Plus,
  ShoppingBag,
  Clock,
  Printer,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useProductStore } from '@/lib/store/product-store';
import { useSalesStore } from '@/lib/store/sales-store';
import { formatCurrency, formatDateTime } from '@/lib/format';

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}) {
  const variantStyles = {
    default: 'bg-card',
    success: 'bg-card border-success/20',
    warning: 'bg-card border-warning/20',
    destructive: 'bg-card border-destructive/20',
  };

  const iconStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    destructive: 'bg-destructive/10 text-destructive',
  };

  return (
    <Card className={`${variantStyles[variant]} transition-shadow hover:shadow-md border-border/60`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {title}
            </p>
            <p className="text-xl sm:text-2xl font-bold tracking-tight truncate">{value}</p>
            {trendValue && (
              <div className="flex items-center gap-1 mt-1.5">
                {trend === 'up' && <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />}
                {trend === 'down' && <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />}
                <span
                  className={`text-xs font-medium ${
                    trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                  }`}
                >
                  {trendValue}
                </span>
                {subtitle && (
                  <span className="text-xs text-muted-foreground ml-1">{subtitle}</span>
                )}
              </div>
            )}
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${iconStyles[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { products } = useProductStore();
  const { sales, getTodaySalesSummary } = useSalesStore();

  const todaySummary = getTodaySalesSummary();

  // Inventory stats
  const totalProducts = products.length;
  const lowStockProducts = products.filter(
    (p) => p.current_stock > 0 && p.current_stock <= p.min_stock
  );
  const outOfStockProducts = products.filter((p) => p.current_stock <= 0);
  const totalStockAssets = products.reduce(
    (acc, p) => acc + p.purchase_price * p.current_stock,
    0
  );

  const recentSales = sales.slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard Kios</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Ringkasan performa penjualan, laba rugi, dan inventaris barang hari ini.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/pos">
            <Button className="gap-2 font-bold shadow-md bg-primary text-primary-foreground">
              <ShoppingBag className="h-4 w-4" />
              Buka Kasir POS
            </Button>
          </Link>
          <Link href="/products/new">
            <Button variant="outline" className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" />
              Tambah Produk
            </Button>
          </Link>
        </div>
      </div>

      {/* Revenue & Profit Metrics */}
      <div>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Ringkasan Keuangan (Hari Ini)
        </h2>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Omset Penjualan"
            value={formatCurrency(todaySummary.totalRevenue)}
            icon={DollarSign}
            trend="up"
            trendValue="+12%"
            subtitle="vs kemarin"
          />
          <MetricCard
            title="Estimasi Laba Kotor"
            value={formatCurrency(todaySummary.totalProfit)}
            icon={TrendingUp}
            trend="up"
            trendValue="Untung"
            variant="success"
          />
          <MetricCard
            title="Barang Terjual"
            value={`${todaySummary.itemsSoldCount} unit`}
            icon={ShoppingCart}
            trend="up"
            trendValue={`${todaySummary.transactionCount} transaksi`}
          />
          <MetricCard
            title="Nilai Aset Stok"
            value={formatCurrency(totalStockAssets)}
            icon={Boxes}
            subtitle="Total Modal Barang"
          />
        </div>
      </div>

      {/* Inventory & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Low Stock Alerts */}
        <Card className="lg:col-span-1 border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Peringatan Stok ({lowStockProducts.length + outOfStockProducts.length})
              </CardTitle>
              <Link href="/inventory" className="text-xs text-primary hover:underline font-medium">
                Kelola Stok
              </Link>
            </div>
            <CardDescription className="text-xs">
              Produk yang menipis dan perlu segera dipesan ulang ke pemasok.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                <Package className="h-8 w-8 mx-auto mb-1.5 opacity-40 text-emerald-500" />
                Semua stok barang dalam kondisi aman.
              </div>
            ) : (
              <div className="space-y-2">
                {outOfStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-lg border border-destructive/30 bg-destructive/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.sku}</p>
                    </div>
                    <Badge variant="destructive" className="text-[10px]">
                      Habis (0)
                    </Badge>
                  </div>
                ))}
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Min: {p.min_stock} {p.unit}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-amber-600 border-amber-500/40 text-[10px] font-bold">
                      Sisa: {p.current_stock}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Recent Sales Activity */}
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Transaksi Penjualan Terakhir
              </CardTitle>
              <Link href="/transactions" className="text-xs text-primary hover:underline font-medium">
                Lihat Semua
              </Link>
            </div>
            <CardDescription className="text-xs">
              Aktivitas checkout kasir terkini beserta rincian pembayarannya.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {recentSales.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-xs">
                <Receipt className="h-8 w-8 mx-auto mb-2 opacity-30" />
                Belum ada transaksi hari ini. Buka kasir untuk mulai bertransaksi!
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="py-3 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">
                          {sale.invoice_number}
                        </span>
                        <Badge variant="outline" className="capitalize text-[10px] py-0 px-1.5 font-normal">
                          {sale.payment_method}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {sale.customer_name || 'Pelanggan Umum'} • {sale.items.length} macam produk • {formatDateTime(sale.created_at)}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-sm text-foreground block">
                        {formatCurrency(sale.total)}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Selesai
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
