'use client';

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Download,
  Printer,
  Calendar,
  Layers,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSalesStore } from '@/lib/store/sales-store';
import { useExpenseStore } from '@/lib/store/expense-store';
import { useProductStore } from '@/lib/store/product-store';
import { formatCurrency, formatNumber } from '@/lib/format';

export default function ReportsPage() {
  const { sales } = useSalesStore();
  const { expenses } = useExpenseStore();
  const { products, categories } = useProductStore();

  const [period, setPeriod] = useState<'today' | 'month' | 'all'>('month');

  // Calculate totals
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  let totalCostOfGoodsSold = 0;
  const productSalesCount: Record<string, { name: string; qty: number; revenue: number; profit: number }> = {};

  for (const sale of sales) {
    for (const item of sale.items) {
      const cogs = item.purchase_price * item.quantity;
      const profit = item.subtotal - cogs;
      totalCostOfGoodsSold += cogs;

      if (!productSalesCount[item.product_id]) {
        productSalesCount[item.product_id] = {
          name: item.product_name,
          qty: 0,
          revenue: 0,
          profit: 0,
        };
      }
      productSalesCount[item.product_id].qty += item.quantity;
      productSalesCount[item.product_id].revenue += item.subtotal;
      productSalesCount[item.product_id].profit += profit;
    }
  }

  const grossProfit = totalRevenue - totalCostOfGoodsSold;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;

  // Top products sorted by revenue
  const topProducts = Object.values(productSalesCount).sort((a, b) => b.revenue - a.revenue);

  function handlePrintReport() {
    window.print();
  }

  function handleExportCsv() {
    let csv = 'No. Faktur,Tanggal,Pelanggan,Metode Bayar,Total Transaksi\n';
    for (const sale of sales) {
      csv += `"${sale.invoice_number}","${sale.created_at.slice(0, 10)}","${sale.customer_name || 'Pelanggan Umum'}","${sale.payment_method}","${sale.total}"\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-penjualan-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Laporan Keuangan & Laba Rugi</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Analisis laba bersih kios, laporan omset, biaya operasional, dan produk terlaris.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            Ekspor CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrintReport} className="gap-1.5 text-xs">
            <Printer className="h-3.5 w-3.5" />
            Cetak Laporan
          </Button>
        </div>
      </div>

      {/* Main Profit & Loss Statement (Laba Rugi) */}
      <Card className="p-6 border-border/70 bg-card/60 backdrop-blur-sm">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Laporan Laba Rugi Sederhana (Income Statement)
        </h2>

        <div className="space-y-3 text-sm max-w-2xl">
          <div className="flex justify-between py-2 border-b">
            <span className="font-semibold text-foreground">1. Total Omset Penjualan (Revenue)</span>
            <span className="font-bold text-primary">{formatCurrency(totalRevenue)}</span>
          </div>

          <div className="flex justify-between py-2 border-b text-muted-foreground">
            <span>2. Harga Pokok Penjualan / Modal Kulakan (HPP)</span>
            <span className="text-destructive font-mono">-{formatCurrency(totalCostOfGoodsSold)}</span>
          </div>

          <div className="flex justify-between py-2 border-b font-bold bg-muted/30 px-3 rounded-lg">
            <span>LABA KOTOR (Gross Profit)</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono">
              {formatCurrency(grossProfit)}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b text-muted-foreground">
            <span>3. Beban Operasional Toko (Listrik, Sewa, Plastik, dll)</span>
            <span className="text-destructive font-mono">-{formatCurrency(totalExpenses)}</span>
          </div>

          <div className="flex justify-between py-3 font-black text-base bg-primary/10 border border-primary/20 px-3 rounded-lg">
            <span className="text-foreground">LABA BERSIH (Net Profit Bersih Kios)</span>
            <span className={`font-mono text-lg ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
              {formatCurrency(netProfit)}
            </span>
          </div>
        </div>
      </Card>

      {/* Top Selling Products */}
      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary" />
            Produk Terlaris & Paling Menguntungkan
          </CardTitle>
          <CardDescription className="text-xs">
            Daftar produk yang memberikan kontribusi omset dan laba tertinggi bagi kios.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-xs bg-muted/40">
                  <TableHead>Nama Produk</TableHead>
                  <TableHead className="text-right">Jumlah Terjual</TableHead>
                  <TableHead className="text-right">Total Omset</TableHead>
                  <TableHead className="text-right">Kontribusi Laba</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-xs text-muted-foreground">
                      Belum ada data penjualan tercatat.
                    </TableCell>
                  </TableRow>
                ) : (
                  topProducts.map((p, idx) => (
                    <TableRow key={idx} className="text-xs hover:bg-muted/30">
                      <TableCell className="font-semibold text-foreground">
                        {p.name}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {p.qty} unit
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {formatCurrency(p.revenue)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(p.profit)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
