'use client';

import { useState, useEffect } from 'react';
import {
  Banknote,
  QrCode,
  CreditCard,
  BookOpen,
  Check,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/format';
import { CartItem, SaleTransaction } from '@/lib/store/sales-store';
import { sounds } from '@/lib/audio';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
  initialCustomerName?: string;
  onConfirmCheckout: (paymentDetails: {
    method: 'cash' | 'qris' | 'transfer' | 'debt';
    cashAmount?: number;
    changeAmount?: number;
    customerName?: string;
    referenceNumber?: string;
    notes?: string;
  }) => void;
}

export function CheckoutModal({
  open,
  onClose,
  cart,
  subtotal,
  discountTotal,
  total,
  initialCustomerName = '',
  onConfirmCheckout,
}: CheckoutModalProps) {
  const [method, setMethod] = useState<'cash' | 'qris' | 'transfer' | 'debt'>('cash');
  const [cashGiven, setCashGiven] = useState<number>(total);
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [bankName, setBankName] = useState('BCA');
  const [notes, setNotes] = useState('');

  // Update cash given default when total changes or modal opens
  useEffect(() => {
    if (open) {
      setCashGiven(total);
      setCustomerName(initialCustomerName || '');
    }
  }, [open, total, initialCustomerName]);

  const change = Math.max(0, cashGiven - total);
  const isCashSufficient = cashGiven >= total;

  // Indonesian cash denominations
  const quickCashOptions = [
    { label: 'Uang Pas', amount: total },
    { label: 'Rp 10.000', amount: 10000 },
    { label: 'Rp 20.000', amount: 20000 },
    { label: 'Rp 50.000', amount: 50000 },
    { label: 'Rp 100.000', amount: 100000 },
    { label: 'Rp 200.000', amount: 200000 },
  ].filter((opt) => opt.amount >= total || opt.label === 'Uang Pas');

  function handleProcess() {
    if (method === 'cash' && !isCashSufficient) {
      sounds.playError();
      return;
    }

    sounds.playCash();
    onConfirmCheckout({
      method,
      cashAmount: method === 'cash' ? cashGiven : total,
      changeAmount: method === 'cash' ? change : 0,
      customerName: customerName.trim() || 'Pelanggan Umum',
      referenceNumber:
        method === 'qris'
          ? `QRIS-${Date.now().toString().slice(-8)}`
          : method === 'transfer'
          ? `${bankName}-${Date.now().toString().slice(-6)}`
          : undefined,
      notes: notes.trim(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <span>Pembayaran Kasir</span>
            </DialogTitle>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Total Tagihan</span>
              <span className="text-2xl font-black text-primary tracking-tight">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* Customer Name Input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Nama Pelanggan (Opsional)
            </Label>
            <Input
              placeholder="Contoh: Pak Budi / Bu Dewi"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="h-10 text-sm"
            />
          </div>

          {/* Payment Method Tabs */}
          <Tabs
            value={method}
            onValueChange={(val) => setMethod(val as any)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 w-full h-11 p-1 bg-muted/70">
              <TabsTrigger value="cash" className="gap-1 text-xs">
                <Banknote className="h-4 w-4" />
                Tunai
              </TabsTrigger>
              <TabsTrigger value="qris" className="gap-1 text-xs">
                <QrCode className="h-4 w-4" />
                QRIS
              </TabsTrigger>
              <TabsTrigger value="transfer" className="gap-1 text-xs">
                <CreditCard className="h-4 w-4" />
                Transfer
              </TabsTrigger>
              <TabsTrigger value="debt" className="gap-1 text-xs">
                <BookOpen className="h-4 w-4" />
                Kas Bon
              </TabsTrigger>
            </TabsList>

            {/* TUNAI / CASH */}
            <TabsContent value="cash" className="space-y-4 pt-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Jumlah Uang Diterima (Rp)
                </Label>
                <Input
                  type="number"
                  min={0}
                  step={500}
                  value={cashGiven || ''}
                  onChange={(e) => setCashGiven(Number(e.target.value))}
                  className="h-12 text-xl font-bold tracking-tight text-primary text-right"
                  autoFocus
                />
              </div>

              {/* Quick Cash Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Pilihan Cepat Nominal:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {quickCashOptions.map((opt, i) => (
                    <Button
                      key={i}
                      type="button"
                      variant={cashGiven === opt.amount ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCashGiven(opt.amount)}
                      className="text-xs font-medium h-9"
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Change Indicator Card */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  isCashSufficient
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-destructive/10 border-destructive/30 text-destructive'
                }`}
              >
                <div>
                  <span className="text-xs font-medium block">
                    {isCashSufficient ? 'Uang Kembalian' : 'Kekurangan Uang'}
                  </span>
                  <span className="text-2xl font-black">
                    {formatCurrency(isCashSufficient ? change : total - cashGiven)}
                  </span>
                </div>
                {isCashSufficient ? (
                  <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="h-5 w-5" />
                  </div>
                ) : (
                  <span className="text-xs font-medium">Uang belum cukup</span>
                )}
              </div>
            </TabsContent>

            {/* QRIS */}
            <TabsContent value="qris" className="space-y-4 pt-3">
              <div className="p-6 rounded-2xl bg-card border border-border flex flex-col items-center justify-center text-center space-y-3">
                <div className="h-10 px-4 bg-muted rounded-full flex items-center justify-center text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  QRIS STANDAR PEMBAYARAN NASIONAL
                </div>
                {/* Visual QR Simulator */}
                <div className="w-48 h-48 bg-white p-3 rounded-2xl border-4 border-foreground/10 shadow-inner flex flex-col items-center justify-center relative group">
                  <div className="w-full h-full border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center p-2 text-center">
                    <QrCode className="h-28 w-28 text-gray-900" />
                    <span className="text-[10px] font-bold text-gray-800">
                      TUMSET SMART KIOS
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Scan QRIS untuk Bayar</p>
                  <p className="text-xs text-muted-foreground">
                    Mendukung GoPay, OVO, Dana, ShopeePay, BCA, Mandiri & Semua Mobile Banking
                  </p>
                  <p className="text-base font-bold text-primary mt-2">
                    {formatCurrency(total)}
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* TRANSFER BANK */}
            <TabsContent value="transfer" className="space-y-4 pt-3">
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Pilih Rekening Bank Tujuan
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {['BCA', 'BRI', 'Mandiri'].map((bank) => (
                    <Button
                      key={bank}
                      type="button"
                      variant={bankName === bank ? 'default' : 'outline'}
                      onClick={() => setBankName(bank)}
                      className="font-bold text-sm h-11"
                    >
                      {bank}
                    </Button>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-muted/60 border border-border space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nomor Rekening:</span>
                    <span className="font-mono font-bold">123-456-7890</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Atas Nama:</span>
                    <span className="font-semibold">KIOS BERKAH BAROKAH</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t">
                    <span className="text-muted-foreground">Nominal Transfer:</span>
                    <span className="font-bold text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* KAS BON (DEBT) */}
            <TabsContent value="debt" className="space-y-4 pt-3">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 space-y-2 text-xs">
                <p className="font-semibold flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  Catatan Kas Bon / Utang Pelanggan
                </p>
                <p>
                  Transaksi akan disimpan sebagai piutang toko. Pastikan nama pelanggan telah diisi dengan lengkap untuk memudahkan penagihan.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Catatan / Keterangan Bon (Jatuh Tempo)
                </Label>
                <Input
                  placeholder="Contoh: Janji bayar hari Jumat depan"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Confirmation */}
        <DialogFooter className="p-6 pt-3 bg-muted/30 border-t flex flex-row items-center justify-between gap-3">
          <Button variant="ghost" onClick={onClose} className="text-xs">
            Batal
          </Button>

          <Button
            size="lg"
            disabled={method === 'cash' && !isCashSufficient}
            onClick={handleProcess}
            className="flex-1 max-w-xs gap-2 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
          >
            <span>Selesaikan Transaksi</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
