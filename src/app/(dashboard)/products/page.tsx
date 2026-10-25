'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Download,
  Upload,
  ScanBarcode,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Edit,
  Trash2,
  Barcode as BarcodeIcon,
  Layers,
  ArrowUpDown,
  Printer,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useProductStore, ProductItem } from '@/lib/store/product-store';
import { formatCurrency, formatNumber } from '@/lib/format';
import { generateBarcodeSvg } from '@/lib/barcode-generator';
import { BarcodeCamera } from '@/components/scanner/barcode-camera';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';

export default function ProductsPage() {
  const router = useRouter();
  const { products, categories, deleteProduct, adjustStock, addBatchProducts } = useProductStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [parsedProducts, setParsedProducts] = useState<Omit<ProductItem, 'id'>[]>([]);
  const [importFileName, setImportFileName] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'safe' | 'low' | 'out'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [barcodeModalProd, setBarcodeModalProd] = useState<ProductItem | null>(null);
  const [adjustModalProd, setAdjustModalProd] = useState<ProductItem | null>(null);
  const [deleteConfirmProd, setDeleteConfirmProd] = useState<ProductItem | null>(null);
  const [newStockInput, setNewStockInput] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Koreksi fisik (Stock Opname)');

  // Global hardware barcode scanner listener
  useBarcodeScanner({
    onScan: (scanned) => {
      setSearchQuery(scanned);
    },
  });

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.barcode.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query);

      // Category
      const matchesCategory =
        selectedCategory === 'all' || p.category_id === selectedCategory;

      // Stock status
      let matchesStock = true;
      if (stockFilter === 'safe') {
        matchesStock = p.current_stock > p.min_stock;
      } else if (stockFilter === 'low') {
        matchesStock = p.current_stock > 0 && p.current_stock <= p.min_stock;
      } else if (stockFilter === 'out') {
        matchesStock = p.current_stock <= 0;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  // Statistics
  const totalSKU = products.length;
  const totalAssetValue = products.reduce((acc, p) => acc + p.purchase_price * p.current_stock, 0);
  const lowStockCount = products.filter((p) => p.current_stock > 0 && p.current_stock <= p.min_stock).length;
  const outOfStockCount = products.filter((p) => p.current_stock <= 0).length;

  // Handle Quick Stock Adjust
  function handleOpenAdjust(prod: ProductItem) {
    setAdjustModalProd(prod);
    setNewStockInput(prod.current_stock);
    setAdjustReason('Koreksi fisik');
  }

  function handleSaveAdjust() {
    if (!adjustModalProd) return;
    adjustStock(adjustModalProd.id, Number(newStockInput), adjustReason);
    setAdjustModalProd(null);
  }

  // Export to CSV
  function handleExportCsv() {
    const headers = ['SKU', 'Nama Produk', 'Barcode', 'Kategori', 'Satuan', 'Harga Beli (HPP)', 'Harga Jual', 'Stok Saat Ini', 'Stok Min'];
    const rows = products.map((p) => {
      const cat = categories.find((c) => c.id === p.category_id)?.name || 'Umum';
      return [
        `"${p.sku}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.barcode}"`,
        `"${cat}"`,
        `"${p.unit}"`,
        p.purchase_price,
        p.selling_price,
        p.current_stock,
        p.min_stock,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `katalog_produk_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Unduh template CSV
  function handleDownloadTemplate() {
    const headers = ['SKU', 'Nama Produk', 'Barcode', 'Kategori', 'Satuan', 'Harga Beli', 'Harga Jual', 'Stok Awal', 'Stok Minimum'];
    const sampleRows = [
      ['SKU-001', 'Minyak Goreng SunCo 2L', '8992388112233', 'Sembako & Bahan Pokok', 'Pcs', '34000', '39000', '24', '5'],
      ['SKU-002', 'Beras Ramos Super 5Kg', '8993005123456', 'Sembako & Bahan Pokok', 'Sak', '68000', '75000', '15', '3'],
      ['SKU-003', 'Indomie Goreng Original 85g', '089686010046', 'Makanan Instan & Snack', 'Bks', '2900', '3500', '120', '20'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'template_import_produk_kios.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Parse CSV File
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setImportError(null);
    setImportSuccessCount(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          setImportError('File kosong atau tidak terbaca.');
          return;
        }

        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
        if (lines.length < 2) {
          setImportError('File CSV minimal harus memiliki 1 baris header dan 1 baris produk.');
          return;
        }

        // Detect delimiter (comma or semicolon)
        const firstLine = lines[0];
        const delimiter = firstLine.includes(';') ? ';' : ',';

        const parseCsvLine = (line: string): string[] => {
          const values: string[] = [];
          let current = '';
          let insideQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              if (insideQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
              } else {
                insideQuotes = !insideQuotes;
              }
            } else if (char === delimiter && !insideQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim());
          return values;
        };

        const parsedList: Omit<ProductItem, 'id'>[] = [];

        // Loop data rows
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCsvLine(lines[i]);
          if (cols.length < 3) continue;

          const rawSku = cols[0] || `SKU-${Date.now().toString().slice(-4)}-${i}`;
          const rawName = cols[1] || '';
          const rawBarcode = cols[2] || '';
          const rawCategory = cols[3] || 'Umum';
          const rawUnit = cols[4] || 'Pcs';
          const rawBuyPrice = parseFloat(cols[5]?.replace(/[^0-9.-]+/g, '')) || 0;
          const rawSellPrice = parseFloat(cols[6]?.replace(/[^0-9.-]+/g, '')) || 0;
          const rawStock = parseInt(cols[7]?.replace(/[^0-9-]+/g, ''), 10) || 0;
          const rawMinStock = parseInt(cols[8]?.replace(/[^0-9-]+/g, ''), 10) || 5;

          if (!rawName) continue;

          // Find or fallback category
          const matchedCategory = categories.find(
            (c) => c.name.toLowerCase() === rawCategory.toLowerCase()
          );

          parsedList.push({
            name: rawName,
            sku: rawSku,
            barcode: rawBarcode || `BRC${Date.now().toString().slice(-8)}${i}`,
            category_id: matchedCategory ? matchedCategory.id : (categories[0]?.id || null),
            brand: 'Umum',
            unit: rawUnit,
            purchase_price: Math.max(0, rawBuyPrice),
            selling_price: Math.max(0, rawSellPrice || rawBuyPrice),
            current_stock: Math.max(0, rawStock),
            min_stock: Math.max(1, rawMinStock),
            is_active: true,
          });
        }

        if (parsedList.length === 0) {
          setImportError('Tidak ada data produk yang valid ditemukan di dalam file CSV.');
        } else {
          setParsedProducts(parsedList);
        }
      } catch (err: any) {
        setImportError('Gagal memproses file CSV: ' + (err?.message || 'Format tidak valid.'));
      }
    };

    reader.readAsText(file);
  }

  // Execute Batch Import
  function handleExecuteImport() {
    if (parsedProducts.length === 0) return;

    const count = addBatchProducts(parsedProducts);
    setImportSuccessCount(count);
    setParsedProducts([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setTimeout(() => {
      setImportModalOpen(false);
      setImportSuccessCount(null);
      setImportFileName('');
    }, 1800);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Katalog Produk</h1>
            <Badge variant="secondary" className="font-semibold text-xs px-2.5 py-0.5">
              {totalSKU} SKU
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola data barang, harga jual, margin laba, dan barcode kios
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScannerOpen(true)}
            className="gap-1.5 h-9"
          >
            <ScanBarcode className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Scan Kamera</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportModalOpen(true)}
            className="gap-1.5 h-9"
          >
            <Upload className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Import CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="gap-1.5 h-9"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>

          <Link
            href="/products/new"
            className={buttonVariants({ size: 'sm', className: 'gap-1.5 h-9 shadow-md shadow-primary/20 font-semibold' })}
          >
            <Plus className="h-4 w-4" />
            Tambah Produk
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Produk</p>
              <p className="text-xl sm:text-2xl font-bold mt-0.5">{totalSKU} <span className="text-xs font-normal text-muted-foreground">SKU</span></p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Package className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Nilai Persediaan</p>
              <p className="text-xl sm:text-2xl font-bold mt-0.5 text-primary">{formatCurrency(totalAssetValue)}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-warning-foreground font-medium uppercase tracking-wider">Stok Menipis</p>
              <p className="text-xl sm:text-2xl font-bold mt-0.5 text-warning">{lowStockCount} <span className="text-xs font-normal text-muted-foreground">item</span></p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-warning/20 text-warning flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-destructive-foreground font-medium uppercase tracking-wider">Stok Habis</p>
              <p className="text-xl sm:text-2xl font-bold mt-0.5 text-destructive">{outOfStockCount} <span className="text-xs font-normal text-muted-foreground">item</span></p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-destructive/20 text-destructive flex items-center justify-center">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border/60">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama barang, barcode EAN, SKU, atau merek..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-1 text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Stock Status Filter */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as 'all' | 'safe' | 'low' | 'out')}
                className="h-10 rounded-md border border-input bg-background px-3 py-1 text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">Status Stok: Semua</option>
                <option value="safe">Stok Aman</option>
                <option value="low">Stok Menipis (⚠️)</option>
                <option value="out">Stok Habis (0)</option>
              </select>

              {/* Quick links to categories */}
              <Link
                href="/categories"
                className={buttonVariants({ variant: 'outline', size: 'sm', className: 'h-10 whitespace-nowrap' })}
              >
                Kelola Kategori
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-border/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider border-b border-border font-semibold">
              <tr>
                <th className="py-3.5 px-4">Produk & Merek</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Barcode / SKU</th>
                <th className="py-3.5 px-4 text-right">Harga Beli</th>
                <th className="py-3.5 px-4 text-right">Harga Jual</th>
                <th className="py-3.5 px-4 text-right">Margin Laba</th>
                <th className="py-3.5 px-4 text-center">Stok</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-base">Tidak ada produk ditemukan</p>
                    <p className="text-xs mt-0.5">Ubah kata kunci pencarian atau tambahkan produk baru.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const cat = categories.find((c) => c.id === prod.category_id);
                  const marginRp = prod.selling_price - prod.purchase_price;
                  const marginPct = prod.purchase_price > 0 ? (marginRp / prod.purchase_price) * 100 : 0;
                  const isLowStock = prod.current_stock > 0 && prod.current_stock <= prod.min_stock;
                  const isOutStock = prod.current_stock <= 0;

                  return (
                    <tr key={prod.id} className="hover:bg-muted/30 transition-colors">
                      {/* Name & Brand */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <span>{prod.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {prod.brand ? `Merek: ${prod.brand}` : '—'} • Satuan: <span className="font-medium">{prod.unit}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        {cat ? (
                          <Badge
                            variant="outline"
                            className="text-xs font-normal"
                            style={{ borderColor: cat.color + '60', color: cat.color }}
                          >
                            {cat.name}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Umum</span>
                        )}
                      </td>

                      {/* Barcode & SKU */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-foreground">
                          <button
                            onClick={() => setBarcodeModalProd(prod)}
                            title="Lihat & Cetak Barcode"
                            className="hover:text-primary transition-colors flex items-center gap-1"
                          >
                            <BarcodeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{prod.barcode || '—'}</span>
                          </button>
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                          SKU: {prod.sku || '—'}
                        </div>
                      </td>

                      {/* Purchase Price */}
                      <td className="py-3 px-4 text-right font-medium text-muted-foreground">
                        {formatCurrency(prod.purchase_price)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 text-right font-bold text-foreground">
                        {formatCurrency(prod.selling_price)}
                      </td>

                      {/* Margin */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          +{formatCurrency(marginRp)}
                        </span>
                        <div className="text-[11px] text-muted-foreground">
                          ({marginPct.toFixed(1)}%)
                        </div>
                      </td>

                      {/* Stock & Status - Interactive Click to Adjust */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenAdjust(prod)}
                          className="group/stk inline-flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-border/70 hover:border-primary/60 hover:bg-primary/5 transition-all cursor-pointer w-full text-center"
                          title="Klik untuk ubah atau sesuaikan stok barang"
                        >
                          <div className="flex items-center justify-center gap-1.5 font-bold text-sm">
                            <span className={isOutStock ? 'text-destructive' : isLowStock ? 'text-amber-500' : 'text-foreground'}>
                              {formatNumber(prod.current_stock)}
                            </span>
                            <span className="text-xs text-muted-foreground">{prod.unit}</span>
                            <ArrowUpDown className="h-3 w-3 text-muted-foreground opacity-40 group-hover/stk:opacity-100 group-hover/stk:text-primary transition-opacity" />
                          </div>
                          {isOutStock ? (
                            <Badge variant="destructive" className="text-[10px] py-0 px-1.5 mt-1">
                              Habis • Ubah
                            </Badge>
                          ) : isLowStock ? (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-amber-500 text-amber-600 mt-1">
                              Menipis ({prod.min_stock})
                            </Badge>
                          ) : (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5 group-hover/stk:underline">Aman • Ubah</span>
                          )}
                        </button>
                      </td>

                      {/* Direct CRUD Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenAdjust(prod)}
                            className="h-8 w-8 text-primary border-primary/20 hover:bg-primary/10 rounded-lg"
                            title="Sesuaikan Stok Fisik"
                          >
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/products/${prod.id}/edit`)}
                            className="h-8 w-8 text-foreground hover:bg-muted rounded-lg"
                            title="Edit Data Produk (Harga, Nama, dll)"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setBarcodeModalProd(prod)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                            title="Lihat & Cetak Barcode"
                          >
                            <BarcodeIcon className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeleteConfirmProd(prod)}
                            className="h-8 w-8 text-destructive border-destructive/20 hover:bg-destructive/10 rounded-lg"
                            title="Hapus Produk"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Camera Scanner Modal */}
      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanBarcode className="h-5 w-5 text-primary" />
              Scan Barcode Produk
            </DialogTitle>
            <DialogDescription className="text-xs">
              Arahkan kamera ke barcode kemasan barang (EAN-13, Code 128, QR Code)
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <BarcodeCamera
              active={scannerOpen}
              onScan={(scanned) => {
                setScannerOpen(false);
                setSearchQuery(scanned);
              }}
            />
          </div>

          <DialogFooter className="sm:justify-between items-center text-xs text-muted-foreground">
            <span>Dapat juga scan menggunakan scanner USB / Bluetooth</span>
            <Button variant="outline" size="sm" onClick={() => setScannerOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Barcode Viewer & Print Modal */}
      <Dialog open={!!barcodeModalProd} onOpenChange={(open) => !open && setBarcodeModalProd(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Barcode Produk</DialogTitle>
            <DialogDescription className="text-xs">
              Label barcode dapat ditempel pada barang repacking atau rak toko
            </DialogDescription>
          </DialogHeader>

          {barcodeModalProd && (
            <div className="flex flex-col items-center justify-center p-6 bg-card border rounded-xl text-center space-y-4">
              <div className="text-sm font-semibold">{barcodeModalProd.name}</div>
              <div className="text-xs text-muted-foreground">
                Harga: <span className="font-bold text-foreground">{formatCurrency(barcodeModalProd.selling_price)}</span>
              </div>

              <div
                className="w-64 h-24 p-2 bg-white text-black rounded shadow-sm border flex items-center justify-center"
                dangerouslySetInnerHTML={{
                  __html: generateBarcodeSvg(barcodeModalProd.barcode, { width: 220, height: 75 }),
                }}
              />

              <div className="text-[11px] text-muted-foreground font-mono">
                Format: Code 128 • Barcode: {barcodeModalProd.barcode}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBarcodeModalProd(null)}>
              Tutup
            </Button>
            <Button
              onClick={() => {
                window.print();
              }}
              className="gap-1.5"
            >
              <Printer className="h-4 w-4" />
              Cetak Stiker
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Adjust Stock Modal */}
      <Dialog open={!!adjustModalProd} onOpenChange={(open) => !open && setAdjustModalProd(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5 text-primary" />
              Sesuaikan Stok Barang
            </DialogTitle>
            <DialogDescription className="text-xs">
              Perbarui jumlah stok fisik kios, lakukan penambahan kulakan atau koreksi stock opname
            </DialogDescription>
          </DialogHeader>

          {adjustModalProd && (
            <div className="space-y-4 py-2">
              <div className="p-3.5 rounded-xl bg-muted/50 border border-border/60 text-xs space-y-1">
                <p className="font-bold text-sm text-foreground">{adjustModalProd.name}</p>
                <div className="flex items-center justify-between text-muted-foreground pt-1">
                  <span>Stok saat ini di sistem:</span>
                  <span className="font-bold text-foreground text-sm">
                    {adjustModalProd.current_stock} {adjustModalProd.unit}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newStock" className="text-xs font-semibold">
                  Stok Fisik Baru ({adjustModalProd.unit})
                </Label>
                <Input
                  id="newStock"
                  type="number"
                  value={newStockInput}
                  onChange={(e) => setNewStockInput(Number(e.target.value))}
                  min={0}
                  className="h-11 text-base font-bold text-primary"
                  autoFocus
                />

                {/* Quick Add / Deduct Presets */}
                <div className="flex flex-wrap items-center justify-between gap-1 pt-1">
                  <span className="text-[11px] text-muted-foreground font-medium">Ubah Cepat:</span>
                  <div className="flex flex-wrap items-center gap-1">
                    {[+1, +5, +10, +50].map((inc) => (
                      <Button
                        key={inc}
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => setNewStockInput((prev) => Math.max(0, Number(prev) + inc))}
                        className="h-7 text-xs px-2 font-semibold"
                      >
                        +{inc}
                      </Button>
                    ))}
                    {[-1, -5].map((dec) => (
                      <Button
                        key={dec}
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => setNewStockInput((prev) => Math.max(0, Number(prev) + dec))}
                        className="h-7 text-xs px-2 text-destructive font-semibold"
                      >
                        {dec}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Stock difference indicator */}
                <div className="text-[11px] font-medium text-center py-1.5 px-3 rounded-lg bg-muted/40 border border-border/40">
                  {Number(newStockInput) - adjustModalProd.current_stock > 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      ▲ Bertambah +{Number(newStockInput) - adjustModalProd.current_stock} {adjustModalProd.unit} (Stok Masuk)
                    </span>
                  ) : Number(newStockInput) - adjustModalProd.current_stock < 0 ? (
                    <span className="text-destructive font-semibold">
                      ▼ Berkurang {Number(newStockInput) - adjustModalProd.current_stock} {adjustModalProd.unit} (Stok Keluar)
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Tidak ada perubahan jumlah stok</span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reason" className="text-xs font-semibold">Alasan Penyesuaian</Label>
                <select
                  id="reason"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-medium"
                >
                  <option value="Kulakan / Barang Masuk Baru">Kulakan / Barang Masuk Baru</option>
                  <option value="Koreksi fisik (Stock Opname)">Koreksi fisik (Stock Opname)</option>
                  <option value="Barang rusak / bocor">Barang rusak / bocor</option>
                  <option value="Kedaluwarsa (Expired)">Kedaluwarsa (Expired)</option>
                  <option value="Hilang / Selisih hitung">Hilang / Selisih hitung</option>
                  <option value="Konsumsi pribadi pemilik">Konsumsi pribadi pemilik</option>
                </select>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAdjustModalProd(null)}>
              Batal
            </Button>
            <Button onClick={handleSaveAdjust} className="font-semibold">
              Simpan Penyesuaian Stok
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteConfirmProd} onOpenChange={(open) => !open && setDeleteConfirmProd(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Hapus Produk
            </DialogTitle>
            <DialogDescription className="text-xs">
              Konfirmasi penghapusan data barang dari katalog toko
            </DialogDescription>
          </DialogHeader>

          {deleteConfirmProd && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 space-y-2 text-xs text-foreground">
              <p>
                Apakah Anda yakin ingin menghapus produk <strong className="font-bold text-destructive">{deleteConfirmProd.name}</strong>?
              </p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Produk akan dihapus dari katalog kasir dan tidak dapat di-scan lagi. Data riwayat transaksi penjualan yang sudah terjadi sebelumnya tetap tersimpan aman.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmProd(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteConfirmProd) {
                  deleteProduct(deleteConfirmProd.id);
                  setDeleteConfirmProd(null);
                }
              }}
              className="font-semibold"
            >
              Ya, Hapus Produk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import CSV Modal */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Import Produk Massal via CSV
            </DialogTitle>
            <DialogDescription className="text-xs">
              Upload file spreadsheet CSV untuk mendaftarkan ratusan produk secara serentak ke sistem kios.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {importSuccessCount !== null ? (
              <div className="p-6 rounded-xl bg-teal-500/10 border border-teal-500/20 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-teal-600 dark:text-teal-400 mx-auto" />
                <h4 className="font-bold text-foreground text-base">Berhasil Mengimpor {importSuccessCount} Produk!</h4>
                <p className="text-xs text-muted-foreground">Seluruh produk telah didaftarkan dan dapat langsung digunakan di kasir POS.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/60">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Gunakan Template Standar</p>
                    <p className="text-[11px] text-muted-foreground">Unduh format CSV siap isi untuk mempermudah input data dari Excel.</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTemplate}
                    className="gap-1.5 text-xs h-8 shrink-0"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Unduh Template CSV
                  </Button>
                </div>

                {/* Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-xl p-6 text-center cursor-pointer transition-colors bg-card hover:bg-muted/20"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {importFileName ? importFileName : 'Klik atau seret file CSV ke sini'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mendukung pemisah koma (,) maupun titik koma (;)
                  </p>
                </div>

                {importError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{importError}</span>
                  </div>
                )}

                {/* Preview Table */}
                {parsedProducts.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                      <span>Ditemukan {parsedProducts.length} produk siap impor:</span>
                      <span className="text-muted-foreground font-normal">Pratinjau 5 baris pertama</span>
                    </div>

                    <div className="max-h-48 overflow-auto border border-border/60 rounded-lg text-xs">
                      <table className="w-full border-collapse">
                        <thead className="bg-muted/70 sticky top-0 border-b border-border/50 text-muted-foreground">
                          <tr>
                            <th className="p-2 text-left">Nama Produk</th>
                            <th className="p-2 text-left">Barcode</th>
                            <th className="p-2 text-right">Harga Beli</th>
                            <th className="p-2 text-right">Harga Jual</th>
                            <th className="p-2 text-center">Stok</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {parsedProducts.slice(0, 5).map((p, idx) => (
                            <tr key={idx} className="hover:bg-muted/20">
                              <td className="p-2 font-medium max-w-[180px] truncate">{p.name}</td>
                              <td className="p-2 font-mono text-[11px] text-muted-foreground">{p.barcode}</td>
                              <td className="p-2 text-right">{formatCurrency(p.purchase_price)}</td>
                              <td className="p-2 text-right font-semibold text-primary">{formatCurrency(p.selling_price)}</td>
                              <td className="p-2 text-center">{p.current_stock} {p.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setImportModalOpen(false);
                setParsedProducts([]);
                setImportFileName('');
                setImportError(null);
              }}
            >
              Tutup
            </Button>
            {parsedProducts.length > 0 && importSuccessCount === null && (
              <Button onClick={handleExecuteImport} className="gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Impor {parsedProducts.length} Produk Sekarang
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
