'use client';

import { useState } from 'react';
import {
  RotateCcw,
  Plus,
  Trash2,
  AlertCircle,
  Package,
  Search,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useReturnStore, ReturnItem } from '@/lib/store/return-store';
import { useProductStore } from '@/lib/store/product-store';
import { formatCurrency, formatDateTime } from '@/lib/format';

export default function ReturnsPage() {
  const { returns, addReturn, deleteReturn } = useReturnStore();
  const { products, adjustStock } = useProductStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [returnType, setReturnType] = useState<'customer' | 'supplier'>('customer');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [refundAmount, setRefundAmount] = useState('');
  const [reason, setReason] = useState<'damaged' | 'expired' | 'wrong_item' | 'other'>('damaged');
  const [notes, setNotes] = useState('');
  const [restockStock, setRestockStock] = useState(false);

  const filteredReturns = returns.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      r.return_number.toLowerCase().includes(q) ||
      r.product_name.toLowerCase().includes(q)
    );
  });

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  function handleProductChange(prodId: string) {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setRefundAmount((prod.selling_price * quantity).toString());
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct) return;

    const parsedRefund = Number(refundAmount) || 0;

    addReturn({
      return_type: returnType,
      product_name: selectedProduct.name,
      quantity,
      unit: selectedProduct.unit,
      refund_amount: parsedRefund,
      reason,
      notes,
    });

    // If restock requested, return to stock
    if (restockStock && returnType === 'customer') {
      adjustStock(
        selectedProduct.id,
        selectedProduct.current_stock + quantity,
        `Retur dari Pelanggan (+${quantity} ${selectedProduct.unit})`
      );
    } else if (returnType === 'supplier') {
      // Return to supplier reduces our stock
      adjustStock(
        selectedProduct.id,
        Math.max(0, selectedProduct.current_stock - quantity),
        `Retur ke Pemasok (-${quantity} ${selectedProduct.unit})`
      );
    }

    setModalOpen(false);
    setNotes('');
  }

  function getReasonBadge(reason: ReturnItem['reason']) {
    switch (reason) {
      case 'damaged':
        return <Badge variant="destructive" className="text-[10px]">Barang Rusak</Badge>;
      case 'expired':
        return <Badge variant="destructive" className="text-[10px] bg-amber-600">Kedaluwarsa</Badge>;
      case 'wrong_item':
        return <Badge variant="outline" className="text-[10px]">Salah Beli / Varian</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">Lainnya</Badge>;
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Retur Barang & Pengembalian Dana</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Kelola pengembalian barang rusak atau kedaluwarsa dari pelanggan atau ke distributor.
          </p>
        </div>

        <Button onClick={() => setModalOpen(true)} className="gap-2 font-semibold shadow-md">
          <Plus className="h-4 w-4" />
          Proses Retur Baru
        </Button>
      </div>

      {/* Search Input */}
      <Card className="p-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nomor retur atau nama barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs sm:text-sm h-10"
          />
        </div>
      </Card>

      {/* Returns Table */}
      <Card className="overflow-hidden border-border/60">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead>No. Retur</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Nama Barang & Qty</TableHead>
                <TableHead>Alasan</TableHead>
                <TableHead className="text-right">Dana Kembali</TableHead>
                <TableHead className="text-center w-20">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReturns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center text-muted-foreground text-xs">
                    <RotateCcw className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    Belum ada riwayat pengembalian barang.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReturns.map((ret) => (
                  <TableRow key={ret.id} className="text-xs hover:bg-muted/30">
                    <TableCell className="font-mono font-bold text-primary">
                      {ret.return_number}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {formatDateTime(ret.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {ret.return_type === 'customer' ? 'Dari Pembeli' : 'Ke Pemasok'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">{ret.product_name}</span>
                      <span className="text-muted-foreground ml-1.5">
                        ({ret.quantity} {ret.unit})
                      </span>
                    </TableCell>
                    <TableCell>{getReasonBadge(ret.reason)}</TableCell>
                    <TableCell className="text-right font-bold text-foreground">
                      {formatCurrency(ret.refund_amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm('Hapus riwayat retur ini?')) {
                            deleteReturn(ret.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal Add Return */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <RotateCcw className="h-5 w-5 text-primary" />
              Form Retur Barang
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Tipe Retur</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={returnType === 'customer' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReturnType('customer')}
                  className="text-xs h-9"
                >
                  Pelanggan ke Toko
                </Button>
                <Button
                  type="button"
                  variant={returnType === 'supplier' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReturnType('supplier')}
                  className="text-xs h-9"
                >
                  Toko ke Pemasok
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Pilih Produk *</Label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-md border border-input bg-background"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) - {formatCurrency(p.selling_price)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Jumlah (Qty)</Label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => {
                    const q = Number(e.target.value) || 1;
                    setQuantity(q);
                    if (selectedProduct) {
                      setRefundAmount((selectedProduct.selling_price * q).toString());
                    }
                  }}
                  className="h-10 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Total Refund (Rp)</Label>
                <Input
                  type="number"
                  min={0}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="h-10 text-xs font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Alasan Retur</Label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full h-10 px-3 text-xs rounded-md border border-input bg-background"
              >
                <option value="damaged">Barang Rusak / Bocor / Cacat Pabrik</option>
                <option value="expired">Barang Sudah Kedaluwarsa</option>
                <option value="wrong_item">Salah Ambil / Salah Varian</option>
                <option value="other">Lainnya</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Catatan Tambahan</Label>
              <Input
                placeholder="Contoh: Kemasan sobek saat diterima"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm">
                Simpan Retur
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
