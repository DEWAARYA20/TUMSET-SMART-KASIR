'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Barcode as BarcodeIcon,
  Calculator,
  Camera,
  Layers,
  Package,
  Plus,
  Save,
  Sparkles,
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
import { generateInternalBarcode } from '@/lib/barcode-generator';
import { BarcodeCamera } from '@/components/scanner/barcode-camera';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';

export default function NewProductPage() {
  const router = useRouter();
  const { categories, addProduct } = useProductStore();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [brand, setBrand] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(5);
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [scannerOpen, setScannerOpen] = useState(false);

  // Global scanner listener fills the barcode
  useBarcodeScanner({
    onScan: (scanned) => {
      setBarcode(scanned);
    },
  });

  // Calculate margin
  const marginRp = sellingPrice - purchasePrice;
  const marginPct = purchasePrice > 0 ? (marginRp / purchasePrice) * 100 : 0;

  function handleGenerateBarcode() {
    const generated = generateInternalBarcode('KIOS');
    setBarcode(generated);
    if (!sku) {
      setSku('SKU-' + generated.slice(-6));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    addProduct({
      name: name.trim(),
      category_id: categoryId || null,
      brand: brand.trim(),
      unit,
      sku: sku.trim() || 'SKU-' + Date.now().toString().slice(-6),
      barcode: barcode.trim() || generateInternalBarcode('KIOS'),
      purchase_price: Number(purchasePrice) || 0,
      selling_price: Number(sellingPrice) || 0,
      current_stock: Number(currentStock) || 0,
      min_stock: Number(minStock) || 5,
      expiry_date: expiryDate || undefined,
      is_active: isActive,
    });

    router.push('/products');
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/products"
          className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'h-9 w-9' })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Produk Baru</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daftarkan barang kios baru dengan harga, stok, dan barcode
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Informasi Dasar */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Informasi Barang
            </CardTitle>
            <CardDescription className="text-xs">
              Detail nama barang, kategori, merek, dan satuan kemasan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">
                Nama Produk <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Beras Ramos 5kg, Indomie Goreng, Aqua 600ml"
                required
                className="h-10 text-sm font-medium"
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
                <Label htmlFor="brand" className="text-xs font-semibold">Merek / Pabrik</Label>
                <Input
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Contoh: Indofood, Mayora, Lokal"
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unit" className="text-xs font-semibold">Satuan Kemasan</Label>
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
            <CardDescription className="text-xs">
              Gunakan barcode kemasan pabrik atau buat barcode internal untuk barang curah/eceran
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="barcode" className="text-xs font-semibold">Kode Barcode</Label>
                  <button
                    type="button"
                    onClick={handleGenerateBarcode}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="h-3 w-3" />
                    Buat Barcode Otomatis
                  </button>
                </div>
                <div className="flex gap-2">
                  <Input
                    id="barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Scan atau ketik kode barcode..."
                    className="h-10 text-sm font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setScannerOpen(true)}
                    className="h-10 px-3 shrink-0"
                    title="Scan dengan kamera"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sku" className="text-xs font-semibold">Kode SKU Toko</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Contoh: BRS-001, IDM-001"
                  className="h-10 text-sm font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Penetapan Harga & Margin Keuntungan */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              Harga & Margin Keuntungan
            </CardTitle>
            <CardDescription className="text-xs">
              Sistem akan menghitung laba bersih per item dan persentase margin secara otomatis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="purchasePrice" className="text-xs font-semibold">
                  Harga Beli / Modal (HPP)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">Rp</span>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={purchasePrice || ''}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    placeholder="0"
                    min={0}
                    className="pl-9 h-10 text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sellingPrice" className="text-xs font-semibold">
                  Harga Jual Kasir <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">Rp</span>
                  <Input
                    id="sellingPrice"
                    type="number"
                    value={sellingPrice || ''}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    placeholder="0"
                    min={0}
                    required
                    className="pl-9 h-10 text-sm font-bold text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Margin Calculation Preview */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Estimasi Keuntungan Kasir</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  +{formatCurrency(marginRp > 0 ? marginRp : 0)} <span className="text-xs font-normal text-muted-foreground">per {unit}</span>
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-muted-foreground font-medium">Margin Keuntungan</p>
                <p className={`text-lg font-bold mt-0.5 ${marginPct >= 15 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                  {marginPct > 0 ? marginPct.toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Persediaan Stok & Tanggal Kedaluwarsa */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Persediaan Stok & Kedaluwarsa
            </CardTitle>
            <CardDescription className="text-xs">
              Atur jumlah stok awal dan batas minimum untuk notifikasi restock otomatis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="currentStock" className="text-xs font-semibold">Stok Awal Saat Ini</Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={currentStock || ''}
                  onChange={(e) => setCurrentStock(Number(e.target.value))}
                  placeholder="0"
                  min={0}
                  className="h-10 text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="minStock" className="text-xs font-semibold">Batas Minimum Notifikasi</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={minStock || ''}
                  onChange={(e) => setMinStock(Number(e.target.value))}
                  placeholder="5"
                  min={1}
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expiryDate" className="text-xs font-semibold">Tanggal Kedaluwarsa (Opsional)</Label>
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
            Simpan Produk
          </Button>
        </div>
      </form>

      {/* Barcode Camera Modal */}
      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Barcode Kemasan</DialogTitle>
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
