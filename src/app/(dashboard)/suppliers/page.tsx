'use client';

import { useState } from 'react';
import {
  Truck,
  Plus,
  Edit,
  Trash2,
  Phone,
  MapPin,
  User,
  Search,
  Package,
  Receipt,
  FileText,
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
import { useSupplierStore, SupplierItem } from '@/lib/store/supplier-store';
import { formatCurrency, formatDate } from '@/lib/format';

export default function SuppliersPage() {
  const { suppliers, purchases, addSupplier, updateSupplier, deleteSupplier } =
    useSupplierStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');

  const filteredSuppliers = suppliers.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      s.name.toLowerCase().includes(q) ||
      (s.contact_person && s.contact_person.toLowerCase().includes(q)) ||
      s.category.toLowerCase().includes(q)
    );
  });

  function handleOpenCreate() {
    setEditingSupplier(null);
    setName('');
    setContactPerson('');
    setPhone('');
    setAddress('');
    setCategory('Sembako');
    setModalOpen(true);
  }

  function handleOpenEdit(sup: SupplierItem) {
    setEditingSupplier(sup);
    setName(sup.name);
    setContactPerson(sup.contact_person || '');
    setPhone(sup.phone);
    setAddress(sup.address || '');
    setCategory(sup.category);
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, {
        name: name.trim(),
        contact_person: contactPerson.trim(),
        phone: phone.trim(),
        address: address.trim(),
        category: category.trim(),
      });
    } else {
      addSupplier({
        name: name.trim(),
        contact_person: contactPerson.trim(),
        phone: phone.trim(),
        address: address.trim(),
        category: category.trim(),
      });
    }

    setModalOpen(false);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pemasok & Distributor</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Daftar kontak agen grosir dan distributor resmi untuk pemesanan stok barang kios.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 font-semibold shadow-md">
          <Plus className="h-4 w-4" />
          Tambah Pemasok
        </Button>
      </div>

      {/* Search Input */}
      <Card className="p-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama toko grosir, nama sales, atau jenis barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs sm:text-sm h-10"
          />
        </div>
      </Card>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((sup) => (
          <Card key={sup.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow border-border/70">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base text-foreground">{sup.name}</h3>
                  <Badge variant="secondary" className="text-[10px] mt-1">
                    {sup.category}
                  </Badge>
                </div>
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Truck className="h-4 w-4" />
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                {sup.contact_person && (
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    <span>{sup.contact_person}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                  <a
                    href={`https://wa.me/${sup.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-mono"
                  >
                    {sup.phone} (WhatsApp)
                  </a>
                </div>
                {sup.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{sup.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
              <a
                href={`tel:${sup.phone}`}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Hubungi Sekarang
              </a>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleOpenEdit(sup)}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (confirm(`Hapus pemasok "${sup.name}"?`)) {
                      deleteSupplier(sup.id);
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Add / Edit Supplier */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Truck className="h-5 w-5 text-primary" />
              {editingSupplier ? 'Ubah Data Pemasok' : 'Tambah Pemasok Baru'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Toko Grosir / Distributor *</Label>
              <Input
                required
                placeholder="Contoh: Grosir Sembako Rezeki"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nama Kontak / Sales</Label>
                <Input
                  placeholder="Contoh: Pak Budi"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Nomor WhatsApp / Telp *</Label>
                <Input
                  required
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Kategori Produk yang Dipasok</Label>
              <Input
                placeholder="Contoh: Beras, Minyak Goreng, Tepung"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Alamat Toko / Gudang</Label>
              <Input
                placeholder="Contoh: Pasar Induk Blok C No. 8"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm">
                Simpan Data
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
