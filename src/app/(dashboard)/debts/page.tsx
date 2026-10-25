'use client';

import { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  DollarSign,
  Phone,
  Calendar,
  Share2,
  CheckCircle,
  AlertCircle,
  Trash2,
  CreditCard,
  Banknote,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { useDebtStore, CustomerDebt } from '@/lib/store/debt-store';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';

export default function DebtsPage() {
  const { debts, addDebt, recordPayment, deleteDebt, getTotalOutstandingDebt } =
    useDebtStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'partial' | 'paid'>('all');

  // New Debt Modal
  const [newDebtOpen, setNewDebtOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [itemsSummary, setItemsSummary] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Payment Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<CustomerDebt | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [paymentNotes, setPaymentNotes] = useState('');

  const totalOutstanding = getTotalOutstandingDebt();
  const activeDebtorsCount = debts.filter((d) => d.status !== 'paid').length;

  const filteredDebts = debts.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      d.customer_name.toLowerCase().includes(q) ||
      (d.customer_phone && d.customer_phone.includes(q)) ||
      (d.items_summary && d.items_summary.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  function handleAddDebtSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = Number(totalAmount);
    if (!customerName.trim() || !amountNum || amountNum <= 0) return;

    addDebt({
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      total_amount: amountNum,
      items_summary: itemsSummary.trim() || 'Barang sembako',
      due_date: dueDate || undefined,
    });

    setNewDebtOpen(false);
    setCustomerName('');
    setCustomerPhone('');
    setTotalAmount('');
    setItemsSummary('');
    setDueDate('');
  }

  function handleRecordPaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDebt) return;
    const amountNum = Number(paymentAmount);
    if (!amountNum || amountNum <= 0) return;

    recordPayment(selectedDebt.id, {
      amount: Math.min(amountNum, selectedDebt.remaining_amount),
      payment_method: paymentMethod,
      notes: paymentNotes.trim(),
    });

    setPaymentModalOpen(false);
    setSelectedDebt(null);
    setPaymentAmount('');
    setPaymentNotes('');
  }

  function handleSendWhatsAppReminder(debt: CustomerDebt) {
    let phoneClean = (debt.customer_phone || '').replace(/[^0-9]/g, '');
    if (phoneClean.startsWith('0')) {
      phoneClean = '62' + phoneClean.slice(1);
    }
    const message = `Halo ${debt.customer_name}, salam hangat dari TUMSET Smart Kios.\n\nMengingatkan kembali catatan kas bon belanja Anda:\n- Total Belanja: ${formatCurrency(debt.total_amount)}\n- Sudah Dibayar: ${formatCurrency(debt.paid_amount)}\n- Sisa Tagihan: *${formatCurrency(debt.remaining_amount)}*\n${debt.due_date ? `- Perkiraan Jatuh Tempo: ${formatDate(debt.due_date)}\n` : ''}\nTerima kasih banyak atas kepercayaannya berbelanja di kios kami! 🙏`;
    const url = phoneClean
      ? `https://wa.me/${phoneClean}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Buku Kas Bon (Piutang Pelanggan)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pencatatan kas bon warga, pembayaran cicilan, dan pengingat tagihan via WhatsApp.
          </p>
        </div>

        <Button onClick={() => setNewDebtOpen(true)} className="gap-2 font-semibold shadow-md">
          <Plus className="h-4 w-4" />
          Catat Kas Bon Baru
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/70">
          <span className="text-xs text-muted-foreground font-medium">Total Piutang Belum Lunas</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(totalOutstanding)}
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Uang toko yang masih di luar
          </span>
        </Card>

        <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/70">
          <span className="text-xs text-muted-foreground font-medium">Jumlah Pelanggan Berutang</span>
          <div className="text-2xl font-black text-foreground mt-1">
            {activeDebtorsCount} orang
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Belum lunas / bayar sebagian
          </span>
        </Card>

        <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/70">
          <span className="text-xs text-muted-foreground font-medium">Total Catatan Kas Bon</span>
          <div className="text-2xl font-black text-foreground mt-1">
            {debts.length} catatan
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Termasuk yang telah lunas
          </span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama warga, nomor telp, atau barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs sm:text-sm h-10"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'all', label: 'Semua Status' },
              { id: 'unpaid', label: 'Belum Bayar' },
              { id: 'partial', label: 'Dicicil' },
              { id: 'paid', label: 'Lunas' },
            ].map((f) => (
              <Button
                key={f.id}
                size="sm"
                variant={statusFilter === f.id ? 'default' : 'outline'}
                onClick={() => setStatusFilter(f.id as any)}
                className="text-xs h-9 shrink-0"
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Debts Table */}
      <Card className="overflow-hidden border-border/70">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead>Nama Pelanggan</TableHead>
                <TableHead>Rincian Barang</TableHead>
                <TableHead>Jatuh Tempo</TableHead>
                <TableHead className="text-right">Total Bon</TableHead>
                <TableHead className="text-right">Sisa Tagihan</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center w-36">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDebts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center text-muted-foreground text-xs">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    Belum ada data catatan kas bon.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDebts.map((debt) => (
                  <TableRow key={debt.id} className="text-xs hover:bg-muted/30">
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground text-xs block">
                          {debt.customer_name}
                        </span>
                        {debt.customer_phone && (
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {debt.customer_phone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground line-clamp-1 max-w-xs">
                        {debt.items_summary || 'Belanja sembako'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {debt.due_date ? formatDate(debt.due_date) : '—'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(debt.total_amount)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-amber-600 dark:text-amber-400">
                      {debt.remaining_amount <= 0 ? 'Rp0' : formatCurrency(debt.remaining_amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      {debt.status === 'paid' ? (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-500/40 text-[10px]">
                          Lunas
                        </Badge>
                      ) : debt.status === 'partial' ? (
                        <Badge variant="outline" className="text-blue-600 border-blue-500/40 text-[10px]">
                          Dicicil
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px]">
                          Belum Bayar
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {debt.status !== 'paid' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              className="h-7 px-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => {
                                setSelectedDebt(debt);
                                setPaymentAmount(debt.remaining_amount.toString());
                                setPaymentModalOpen(true);
                              }}
                            >
                              Bayar
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                              title="Kirim Pengingat WA"
                              onClick={() => handleSendWhatsAppReminder(debt)}
                            >
                              <Share2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if (confirm(`Hapus catatan kas bon "${debt.customer_name}"?`)) {
                              deleteDebt(debt.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal Add Debt */}
      <Dialog open={newDebtOpen} onOpenChange={setNewDebtOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <BookOpen className="h-5 w-5 text-primary" />
              Catat Kas Bon Pelanggan Baru
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddDebtSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Pelanggan / Warga *</Label>
              <Input
                required
                placeholder="Contoh: Pak Budi RT 03"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nomor WhatsApp (Opsional)</Label>
                <Input
                  placeholder="081234567890"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-10 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Total Nominal Utang (Rp) *</Label>
                <Input
                  type="number"
                  min={1000}
                  step={500}
                  required
                  placeholder="50000"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="h-10 text-xs font-bold text-amber-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Daftar Barang yang Diambil</Label>
              <Input
                placeholder="Contoh: Beras 5kg, Telur 1 Rak, Rokok 1 bks"
                value={itemsSummary}
                onChange={(e) => setItemsSummary(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Perkiraan Tanggal Bayar / Jatuh Tempo</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setNewDebtOpen(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm">
                Simpan Kas Bon
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Record Payment */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-emerald-600">
              <CheckCircle className="h-5 w-5" />
              Catat Pembayaran Kas Bon
            </DialogTitle>
          </DialogHeader>

          {selectedDebt && (
            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 py-2">
              <div className="p-3 rounded-lg bg-muted/60 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pelanggan:</span>
                  <span className="font-semibold text-foreground">{selectedDebt.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sisa Utang:</span>
                  <span className="font-bold text-amber-600">{formatCurrency(selectedDebt.remaining_amount)}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Jumlah yang Dibayarkan (Rp) *</Label>
                <Input
                  type="number"
                  min={500}
                  max={selectedDebt.remaining_amount}
                  step={500}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="h-10 text-sm font-bold text-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Metode Pembayaran</Label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full h-10 px-3 text-xs rounded-md border border-input bg-background"
                >
                  <option value="cash">Tunai (Kas Kios)</option>
                  <option value="transfer">Transfer Bank / QRIS</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Catatan Pembayaran</Label>
                <Input
                  placeholder="Contoh: Titip lewat anaknya"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              <DialogFooter className="pt-3 gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setPaymentModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  Simpan Pembayaran
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
