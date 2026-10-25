'use client';

import { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  ClipboardCheck,
  History,
  TrendingDown,
  TrendingUp,
  Search,
  ArrowUpDown,
  CheckCircle2,
  PackageCheck,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProductStore, ProductItem } from '@/lib/store/product-store';
import { formatCurrency, formatNumber, formatDateTime } from '@/lib/format';

export default function InventoryPage() {
  const { products, movements, adjustStock } = useProductStore();

  const [activeTab, setActiveTab] = useState('opname');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Stock opname physical counts buffer
  const [physicalCounts, setPhysicalCounts] = useState<Record<string, number>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Statistics
  const lowStockProducts = products.filter((p) => p.current_stock > 0 && p.current_stock <= p.min_stock);
  const outOfStockProducts = products.filter((p) => p.current_stock <= 0);

  function handlePhysicalCountChange(productId: string, val: string) {
    const num = val === '' ? 0 : Number(val);
    setPhysicalCounts((prev) => ({
      ...prev,
      [productId]: num,
    }));
  }

  function handleApplyOpname(product: ProductItem) {
    const physical = physicalCounts[product.id] !== undefined ? physicalCounts[product.id] : product.current_stock;
    const diff = physical - product.current_stock;
    if (diff === 0) return;

    adjustStock(
      product.id,
      physical,
      `Hasil Stock Opname (${diff > 0 ? '+' : ''}${diff} ${product.unit})`
    );

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  }

  function handleApplyAllOpname() {
    let count = 0;
    products.forEach((p) => {
      if (physicalCounts[p.id] !== undefined && physicalCounts[p.id] !== p.current_stock) {
        const physical = physicalCounts[p.id];
        const diff = physical - p.current_stock;
        adjustStock(
          p.id,
          physical,
          `Stock Opname Massal (${diff > 0 ? '+' : ''}${diff} ${p.unit})`
        );
        count++;
      }
    });

    if (count > 0) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Inventaris & Stock Opname</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Audit stok fisik, monitor peringatan barang menipis, dan riwayat mutasi barang
          </p>
        </div>

        {savedSuccess && (
          <Badge className="bg-emerald-600 text-white gap-1.5 py-1 px-3">
            <CheckCircle2 className="h-4 w-4" />
            Penyesuaian stok berhasil disimpan!
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="opname" className="gap-2 text-xs sm:text-sm">
            <ClipboardCheck className="h-4 w-4" />
            Stock Opname Fisik
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2 text-xs sm:text-sm">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Peringatan Stok ({lowStockProducts.length + outOfStockProducts.length})
          </TabsTrigger>
          <TabsTrigger value="movements" className="gap-2 text-xs sm:text-sm">
            <History className="h-4 w-4" />
            Riwayat Mutasi
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Stock Opname */}
        <TabsContent value="opname" className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  Pencocokan Stok Fisik (Stock Opname)
                </CardTitle>
                <CardDescription className="text-xs">
                  Hitung jumlah fisik barang di etalase/gudang, masukkan di kolom fisik, dan sistem akan menghitung selisihnya
                </CardDescription>
              </div>

              <Button
                size="sm"
                onClick={handleApplyAllOpname}
                className="gap-1.5 font-semibold shadow-md shadow-primary/20"
              >
                <PackageCheck className="h-4 w-4" />
                Simpan Semua Selisih Opname
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider border-y border-border font-semibold">
                    <tr>
                      <th className="py-3 px-4">Nama Produk</th>
                      <th className="py-3 px-4 font-mono">Barcode</th>
                      <th className="py-3 px-4 text-center">Stok Sistem</th>
                      <th className="py-3 px-4 text-center w-36">Hitungan Fisik</th>
                      <th className="py-3 px-4 text-center">Selisih</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {products.map((p) => {
                      const physical = physicalCounts[p.id] !== undefined ? physicalCounts[p.id] : p.current_stock;
                      const diff = physical - p.current_stock;

                      return (
                        <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-foreground">{p.name}</span>
                            <div className="text-xs text-muted-foreground">Satuan: {p.unit}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                            {p.barcode || '—'}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-base">
                            {formatNumber(p.current_stock)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Input
                              type="number"
                              min={0}
                              value={physical}
                              onChange={(e) => handlePhysicalCountChange(p.id, e.target.value)}
                              className="h-9 w-24 mx-auto text-center font-bold"
                            />
                          </td>
                          <td className="py-3 px-4 text-center font-semibold">
                            {diff === 0 ? (
                              <span className="text-muted-foreground text-xs">Cocok (0)</span>
                            ) : diff > 0 ? (
                              <span className="text-emerald-600 dark:text-emerald-400">+{diff} (Lebih)</span>
                            ) : (
                              <span className="text-destructive">{diff} (Kurang)</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={diff === 0}
                              onClick={() => handleApplyOpname(p)}
                              className="h-8 text-xs font-semibold"
                            >
                              Terapkan
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Alerts */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Low stock */}
            <Card className="border-warning/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-warning flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Barang Stok Menipis ({lowStockProducts.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Stok barang ini sudah di bawah batas minimum dan perlu di-restock
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {lowStockProducts.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    Tidak ada barang yang menipis saat ini.
                  </p>
                ) : (
                  lowStockProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-warning/20 bg-warning/5"
                    >
                      <div>
                        <p className="font-semibold text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Batas min: {p.min_stock} {p.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-warning text-base">
                          Sisa {p.current_stock} {p.unit}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Out of stock */}
            <Card className="border-destructive/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-destructive flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Barang Stok Habis ({outOfStockProducts.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Barang ini tidak dapat dijual di kasir sebelum diisi kembali
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {outOfStockProducts.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    Semua produk memiliki persediaan aktif.
                  </p>
                ) : (
                  outOfStockProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-destructive/20 bg-destructive/5"
                    >
                      <div>
                        <p className="font-semibold text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground">Barcode: {p.barcode || '—'}</p>
                      </div>
                      <Badge variant="destructive">Stok 0</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Movements Ledger */}
        <TabsContent value="movements" className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Ledger Riwayat Mutasi Stok
              </CardTitle>
              <CardDescription className="text-xs">
                Log kronologis seluruh pergerakan persediaan (penjualan, pembelian, opname, koreksi)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider border-y border-border font-semibold">
                    <tr>
                      <th className="py-3 px-4">Waktu</th>
                      <th className="py-3 px-4">Produk</th>
                      <th className="py-3 px-4">Tipe Pergerakan</th>
                      <th className="py-3 px-4 text-center">Perubahan</th>
                      <th className="py-3 px-4 text-center">Stok Baru</th>
                      <th className="py-3 px-4">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {movements.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          Belum ada pergerakan stok yang tercatat.
                        </td>
                      </tr>
                    ) : (
                      movements.map((m) => (
                        <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                            {formatDateTime(m.created_at)}
                          </td>
                          <td className="py-3 px-4 font-semibold text-foreground">
                            {m.product_name}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-xs font-normal">
                              {m.movement_type === 'sale'
                                ? 'Penjualan'
                                : m.movement_type === 'purchase'
                                ? 'Pembelian'
                                : m.movement_type === 'adjustment'
                                ? 'Penyesuaian'
                                : 'Saldo Awal'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center font-bold">
                            <span className={m.quantity_change > 0 ? 'text-emerald-600' : 'text-destructive'}>
                              {m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold">
                            {m.new_stock}
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">
                            {m.notes || '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
