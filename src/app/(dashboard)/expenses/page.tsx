'use client';

import { useState } from 'react';
import {
  TrendingDown,
  Plus,
  Trash2,
  Calendar,
  Wallet,
  Tag,
  Search,
  Receipt,
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
import { useExpenseStore, ExpenseItem } from '@/lib/store/expense-store';
import { formatCurrency, formatDate } from '@/lib/format';

export default function ExpensesPage() {
  const {
    expenses,
    categories,
    addExpense,
    deleteExpense,
    getTodayExpensesTotal,
    getThisMonthExpensesTotal,
  } = useExpenseStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Form states
  const [category, setCategory] = useState(categories[0]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const todayTotal = getTodayExpensesTotal();
  const monthTotal = getThisMonthExpensesTotal();

  const filteredExpenses = expenses.filter((e) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      e.description.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategoryFilter === 'all' || e.category === selectedCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0 || !description.trim()) return;

    addExpense({
      category,
      amount: parsedAmount,
      description: description.trim(),
      payment_method: paymentMethod,
      date,
    });

    setModalOpen(false);
    setAmount('');
    setDescription('');
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Biaya Operasional Kios</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Catat pengeluaran harian seperti listrik, kantong plastik, transport kulakan, dan beban lainnya.
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="gap-2 font-semibold shadow-md bg-destructive hover:bg-destructive/90 text-destructive-foreground"
        >
          <Plus className="h-4 w-4" />
          Catat Pengeluaran
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/60">
          <span className="text-xs text-muted-foreground font-medium">Pengeluaran Hari Ini</span>
          <div className="text-2xl font-black text-destructive mt-1">
            {formatCurrency(todayTotal)}
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Pengeluaran kas hari ini
          </span>
        </Card>

        <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/60">
          <span className="text-xs text-muted-foreground font-medium">Pengeluaran Bulan Ini</span>
          <div className="text-2xl font-black text-destructive/90 mt-1">
            {formatCurrency(monthTotal)}
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Akumulasi beban operasional bulan ini
          </span>
        </Card>

        <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/60">
          <span className="text-xs text-muted-foreground font-medium">Total Catatan Pengeluaran</span>
          <div className="text-2xl font-black text-foreground mt-1">
            {expenses.length}
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Transaksi pengeluaran tercatat
          </span>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari keterangan pengeluaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs sm:text-sm h-10"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <Button
              size="sm"
              variant={selectedCategoryFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategoryFilter('all')}
              className="text-xs h-9 shrink-0"
            >
              Semua Kategori
            </Button>
            {categories.slice(0, 3).map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={selectedCategoryFilter === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategoryFilter(cat)}
                className="text-xs h-9 shrink-0 truncate max-w-[150px]"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Expenses Table */}
      <Card className="overflow-hidden border-border/60">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead>Tanggal</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Metode Bayar</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
                <TableHead className="text-center w-20">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-muted-foreground text-xs">
                    <Receipt className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    Belum ada catatan pengeluaran.
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((exp) => (
                  <TableRow key={exp.id} className="text-xs hover:bg-muted/30">
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {formatDate(exp.date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px] font-normal">
                        {exp.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-foreground max-w-sm truncate">
                      {exp.description}
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {exp.payment_method === 'cash' ? 'Tunai' : 'Transfer Bank'}
                    </TableCell>
                    <TableCell className="text-right font-bold text-destructive">
                      -{formatCurrency(exp.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm('Hapus catatan pengeluaran ini?')) {
                            deleteExpense(exp.id);
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

      {/* Modal Add Expense */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-destructive">
              <TrendingDown className="h-5 w-5" />
              Catat Pengeluaran Baru
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Kategori Pengeluaran</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-md border border-input bg-background"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Nominal Pengeluaran (Rp) *</Label>
              <Input
                type="number"
                min={500}
                step={500}
                required
                placeholder="Contoh: 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-10 text-sm font-bold text-destructive"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Keterangan / Keperluan *</Label>
              <Input
                required
                placeholder="Contoh: Beli bensin motor untuk belanja sembako"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Metode Bayar</Label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full h-10 px-3 text-xs rounded-md border border-input bg-background"
                >
                  <option value="cash">Tunai (Kas Kios)</option>
                  <option value="transfer">Transfer Bank</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Tanggal</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Simpan Pengeluaran
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
