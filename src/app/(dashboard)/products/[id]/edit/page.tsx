'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Barcode as BarcodeIcon,
  Calculator,
  Camera,
  Layers,
  Package,
  Save,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useProductStore } from '@/lib/store/product-store';
import { formatCurrency } from '@/lib/format';
import { BarcodeCamera } from '@/components/scanner/barcode-camera';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const { products, categories, updateProduct, deleteProduct } = useProductStore();

  const product = products.find((p) => p.id === productId);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(5);
  const [expiryDate, setExpiryDate] = useState('');

  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategoryId(product.category_id || '');
      setBrand(product.brand || '');
      setUnit(product.unit || 'pcs');
      setSku(product.sku || '');
      setBarcode(product.barcode || '');
      setPurchasePrice(product.purchase_price || 0);
      setSellingPrice(product.selling_price || 0);
      setCurrentStock(product.current_stock || 0);
      setMinStock(product.min_stock || 5);
      setExpiryDate(product.expiry_date || '');
    }
  }, [product]);

  if (!product) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-40" />
        <h2 className="text-xl font-bold">Produk Tidak Ditemukan</h2>
        <p className="text-sm text-muted-foreground">
          Produk dengan ID ini tidak tersedia atau sudah dihapus.
        </p>
        <Link
          href="/products"
          className={buttonVariants({ variant: 'default' })}
        >
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const marginRp = sellingPrice - purchasePrice;
  const marginPct = purchasePrice > 0 ? (marginRp / purchasePrice) * 100 : 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    updateProduct(productId, {
      name: name.trim(),
      category_id: categoryId || null,
      brand: brand.trim(),
      unit,
      sku: sku.trim(),
      barcode: barcode.trim(),
      purchase_price: Number(purchasePrice) || 0,
      selling_price: Number(sellingPrice) || 0,
      current_stock: Number(currentStock) || 0,
      min_stock: Number(minStock) || 5,
      expiry_date: expiryDate || undefined,
    });

    router.push('/products');
  }

  function handleDelete() {
    if (confirm('Yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.')) {
      deleteProduct(productId);
      router.push('/products');
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'h-9 w-9' })}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Produk</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Perbarui harga, data barcode, atau stok barang
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDelete}
          className="text-destructive hover:bg-destructive/10 border-destructive/30 gap-1.5"
        >
          <Trash2 className="h-4 w-4" />
          Hapus
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Data Produk */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Informasi Barang
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">Nama Produk</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-10 text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-semibold">Kategori</Label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Pilih Kategori...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="brand" className="text-xs font-semibold">Merek</Label>
                <Input
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unit" className="text-xs font-semibold">Satuan</Label>
                <select
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="pcs">pcs (buah/biji)</option>
                  <option value="bks">bks (bungkus)</option>
                  <option value="btl">btl (botol)</option>
                  <option value="sak">sak (karung)</option>
                  <option value="rcg">rcg (renceng)</option>
                  <option value="rak">rak (rak telur)</option>
                  <option value="kg">kg (kilogram)</option>
                  <option value="dus">dus (karton)</option>
                  <option value="pouch">pouch</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Barcode & SKU */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarcodeIcon className="h-4 w-4 text-primary" />
              Kode Barcode & SKU
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="barcode" className="text-xs font-semibold">Kode Barcode</Label>
                <div className="flex gap-2">
                  <Input
                    id="barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="h-10 text-sm font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setScannerOpen(true)}
                    className="h-10 px-3"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sku" className="text-xs font-semibold">Kode SKU</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="h-10 text-sm font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Harga & Margin */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              Harga & Margin Keuntungan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="purchasePrice" className="text-xs font-semibold">Harga Modal (HPP)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={purchasePrice || ''}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  min={0}
                  className="h-10 text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sellingPrice" className="text-xs font-semibold">Harga Jual</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  value={sellingPrice || ''}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  min={0}
                  required
                  className="h-10 text-sm font-bold text-foreground"
                />
              </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Estimasi Keuntungan Kasir</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  +{formatCurrency(marginRp > 0 ? marginRp : 0)} <span className="text-xs font-normal text-muted-foreground">per {unit}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-medium">Margin</p>
                <p className={`text-lg font-bold mt-0.5 ${marginPct >= 15 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                  {marginPct > 0 ? marginPct.toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Persediaan */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Persediaan Stok
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="currentStock" className="text-xs font-semibold">Stok Saat Ini</Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={currentStock || ''}
                  onChange={(e) => setCurrentStock(Number(e.target.value))}
                  min={0}
                  className="h-10 text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="minStock" className="text-xs font-semibold">Batas Minimum</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={minStock || ''}
                  onChange={(e) => setMinStock(Number(e.target.value))}
                  min={1}
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expiryDate" className="text-xs font-semibold">Kedaluwarsa (Opsional)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/products"
            className={buttonVariants({ variant: 'outline', className: 'h-11 px-5' })}
          >
            Batal
          </Link>
          <Button type="submit" className="h-11 px-6 font-semibold gap-2 shadow-md shadow-primary/20">
            <Save className="h-4 w-4" />
            Simpan Perubahan
          </Button>
        </div>
      </form>

      {/* Barcode Camera Modal */}
      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Barcode</DialogTitle>
            <DialogDescription className="text-xs">
              Arahkan kamera ke barcode produk
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <BarcodeCamera
              active={scannerOpen}
              onScan={(scanned) => {
                setBarcode(scanned);
                setScannerOpen(false);
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setScannerOpen(false)}>
              Batal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
