'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Search,
  Filter,
  Calendar,
  Printer,
  Eye,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Banknote,
  QrCode,
  BookOpen,
  User,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSalesStore, SaleTransaction } from '@/lib/store/sales-store';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { ReceiptModal } from '@/components/pos/receipt-modal';

export default function TransactionsPage() {
  const { sales, getTodaySalesSummary } = useSalesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [selectedSale, setSelectedSale] = useState<SaleTransaction | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const todaySummary = getTodaySalesSummary();

  const filteredSales = sales.filter((sale) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      sale.invoice_number.toLowerCase().includes(q) ||
      (sale.customer_name && sale.customer_name.toLowerCase().includes(q)) ||
      sale.items.some((item) => item.product_name.toLowerCase().includes(q));

    const matchesMethod =
      filterMethod === 'all' || sale.payment_method === filterMethod;

    return matchesSearch && matchesMethod;
  });

  function getPaymentBadge(method: SaleTransaction['payment_method']) {
    switch (method) {
      case 'cash':
        return (
          <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 gap-1 text-[11px]">
            <Banknote className="h-3 w-3" />
            Tunai
          </Badge>
        );
      case 'qris':
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-500/30 gap-1 text-[11px]">
            <QrCode className="h-3 w-3" />
            QRIS
          </Badge>
        );
      case 'transfer':
        return (
          <Badge variant="outline" className="text-purple-600 border-purple-500/30 gap-1 text-[11px]">
            <CreditCard className="h-3 w-3" />
            Transfer
          </Badge>
        );
      case 'debt':
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-500/30 gap-1 text-[11px]">
            <BookOpen className="h-3 w-3" />
            Kas Bon
          </Badge>
        );
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Transaksi Penjualan</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Daftar seluruh transaksi kasir, cetak ulang struk, dan pantau omset harian.
          </p>
        </div>

        <Link href="/pos">
          <Button className="gap-2 font-semibold shadow-md">
            <ShoppingBag className="h-4 w-4" />
            Buka Kasir POS
          </Button>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/60">
          <span className="text-xs text-muted-foreground font-medium">Omset Hari Ini</span>
          <div className="text-xl font-black text-primary mt-1">
            {formatCurrency(todaySummary.totalRevenue)}
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            {todaySummary.transactionCount} Transaksi
          </span>
        </Card>

        <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/60">
          <span className="text-xs text-muted-foreground font-medium">Estimasi Laba Kotor</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(todaySummary.totalProfit)}
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Hari ini
          </span>
        </Card>

        <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/60">
          <span className="text-xs text-muted-foreground font-medium">Total Barang Terjual</span>
          <div className="text-xl font-black text-foreground mt-1">
            {todaySummary.itemsSoldCount} <span className="text-xs font-normal text-muted-foreground">unit</span>
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Hari ini
          </span>
        </Card>

        <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/60">
          <span className="text-xs text-muted-foreground font-medium">Total Seluruh Transaksi</span>
          <div className="text-xl font-black text-foreground mt-1">
            {sales.length}
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Tersimpan di sistem
          </span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nomor faktur, nama barang, atau nama pelanggan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs sm:text-sm h-10"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['all', 'cash', 'qris', 'transfer', 'debt'].map((m) => (
              <Button
                key={m}
                size="sm"
                variant={filterMethod === m ? 'default' : 'outline'}
                onClick={() => setFilterMethod(m)}
                className="text-xs h-9 capitalize shrink-0"
              >
                {m === 'all' ? 'Semua Metode' : m === 'debt' ? 'Kas Bon' : m}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="overflow-hidden border-border/60">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead>No. Faktur</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Barang & Qty</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead className="text-right">Total Transaksi</TableHead>
                <TableHead className="text-center w-24">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center text-muted-foreground text-xs">
                    <Receipt className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    Belum ada riwayat transaksi yang cocok.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => {
                  const itemCount = sale.items.reduce((acc, i) => acc + i.quantity, 0);

                  return (
                    <TableRow key={sale.id} className="text-xs hover:bg-muted/30">
                      <TableCell className="font-mono font-semibold text-primary">
                        {sale.invoice_number}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {formatDateTime(sale.created_at)}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {sale.customer_name || 'Pelanggan Umum'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <span className="font-medium text-foreground">
                            {sale.items[0]?.product_name}
                          </span>
                          {sale.items.length > 1 && (
                            <span className="text-muted-foreground ml-1">
                              +{sale.items.length - 1} produk lainnya ({itemCount} total)
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getPaymentBadge(sale.payment_method)}</TableCell>
                      <TableCell className="text-right font-bold text-foreground">
                        {formatCurrency(sale.total)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => {
                            setSelectedSale(sale);
                            setReceiptModalOpen(true);
                          }}
                        >
                          <Printer className="h-3.5 w-3.5" />
                          Struk
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Thermal Receipt Preview Modal */}
      <ReceiptModal
        sale={selectedSale}
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        onNewTransaction={() => setReceiptModalOpen(false)}
      />
    </div>
  );
}
