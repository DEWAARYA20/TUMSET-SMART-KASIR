'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Package,
  Layers,
  Palette,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useProductStore, CategoryItem } from '@/lib/store/product-store';

const COLOR_PRESETS = [
  '#10b981', // emerald
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#64748b', // slate
];

export default function CategoriesPage() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useProductStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLOR_PRESETS[0]);

  function handleOpenCreate() {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setColor(COLOR_PRESETS[0]);
    setModalOpen(true);
  }

  function handleOpenEdit(cat: CategoryItem) {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setColor(cat.color || COLOR_PRESETS[0]);
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: name.trim(),
        description: description.trim(),
        color,
      });
    } else {
      addCategory({
        name: name.trim(),
        description: description.trim(),
        color,
      });
    }

    setModalOpen(false);
  }

  function handleDelete(id: string, catName: string) {
    const count = products.filter((p) => p.category_id === id).length;
    const msg = count > 0
      ? `Hapus kategori "${catName}"? Sebanyak ${count} produk dalam kategori ini akan dialihkan ke kategori 'Umum'.`
      : `Hapus kategori "${catName}"?`;

    if (confirm(msg)) {
      deleteCategory(id);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'h-9 w-9' })}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Kategori Produk</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Kelompokkan produk kios untuk mempermudah kasir dan laporan penjualan
            </p>
          </div>
        </div>

        <Button onClick={handleOpenCreate} className="gap-1.5 h-9 font-semibold shadow-md shadow-primary/20">
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const productCount = products.filter((p) => p.category_id === cat.id).length;

          return (
            <Card key={cat.id} className="border-border/60 hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3.5 w-3.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: cat.color }}
                      />
                      <h3 className="font-bold text-base tracking-tight text-foreground">{cat.name}</h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(cat)}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {cat.description || 'Tidak ada keterangan tambahan.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5" />
                    Jumlah Produk
                  </span>
                  <Badge variant="secondary" className="font-semibold text-xs">
                    {productCount} SKU
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal Add / Edit Category */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Beri nama dan warna pembeda agar mudah dikenali di layar kasir
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="catName" className="text-xs font-semibold">Nama Kategori</Label>
              <Input
                id="catName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Sembako, Minuman, Snack, Rokok"
                required
                className="h-10 text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catDesc" className="text-xs font-semibold">Keterangan (Opsional)</Label>
              <Input
                id="catDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi singkat jenis barang..."
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5" />
                Warna Pembeda
              </Label>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-full transition-transform ${
                      color === c ? 'scale-125 ring-2 ring-primary ring-offset-2' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit">
                {editingCategory ? 'Simpan Perubahan' : 'Buat Kategori'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
