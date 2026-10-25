'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ScanBarcode,
  Search,
  Package,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShoppingCart,
  Edit,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProductStore, ProductItem } from '@/lib/store/product-store';
import { formatCurrency, formatNumber } from '@/lib/format';
import { BarcodeCamera } from '@/components/scanner/barcode-camera';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';

export default function ScanPage() {
  const { products, categories, getProductByBarcode } = useProductStore();

  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [matchedProduct, setMatchedProduct] = useState<ProductItem | null>(null);
  const [notFoundCode, setNotFoundCode] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(true);

  function handleProcessBarcode(code: string) {
    const clean = code.trim();
    if (!clean) return;

    setLastScannedCode(clean);
    const prod = getProductByBarcode(clean);

    if (prod) {
      setMatchedProduct(prod);
      setNotFoundCode(null);
    } else {
      setMatchedProduct(null);
      setNotFoundCode(clean);
    }
  }

  // Hardware USB/Bluetooth HID scanner listener
  useBarcodeScanner({
    onScan: (barcode) => {
      handleProcessBarcode(barcode);
    },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <ScanBarcode className="h-7 w-7 text-primary" />
          Pindai Barcode (Cek Harga & Stok)
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Arahkan kamera ke kemasan barang atau gunakan scanner barcode USB / Bluetooth
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Camera Scanner */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Pemindai Kamera</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCameraActive(!cameraActive)}
                className="text-xs h-7"
              >
                {cameraActive ? 'Jeda Kamera' : 'Aktifkan'}
              </Button>
            </CardTitle>
            <CardDescription className="text-xs">
              Mendukung EAN-13, EAN-8, Code 128, QR Code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <BarcodeCamera
              active={cameraActive}
              onScan={(scanned) => handleProcessBarcode(scanned)}
            />

            {/* Manual Barcode Input Fallback */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleProcessBarcode(lastScannedCode);
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Atau ketik angka barcode..."
                value={lastScannedCode}
                onChange={(e) => setLastScannedCode(e.target.value)}
                className="h-10 text-sm font-mono"
              />
              <Button type="submit" variant="secondary" className="h-10 px-4">
                Cari
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right: Scan Results */}
        <div className="space-y-4">
          {matchedProduct ? (
            <Card className="border-primary/40 shadow-lg bg-card overflow-hidden">
              <div className="bg-primary/10 border-b border-primary/20 px-4 py-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Barang Terdaftar
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {matchedProduct.barcode}
                </span>
              </div>

              <CardContent className="p-5 space-y-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {matchedProduct.name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {matchedProduct.brand ? `Merek: ${matchedProduct.brand} • ` : ''}
                    Satuan: <span className="font-semibold">{matchedProduct.unit}</span>
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Harga Jual</p>
                    <p className="text-2xl font-bold text-primary mt-0.5">
                      {formatCurrency(matchedProduct.selling_price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Sisa Stok</p>
                    <p className={`text-xl font-bold mt-0.5 ${matchedProduct.current_stock <= matchedProduct.min_stock ? 'text-amber-500' : 'text-foreground'}`}>
                      {formatNumber(matchedProduct.current_stock)} <span className="text-xs font-normal text-muted-foreground">{matchedProduct.unit}</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/pos`}
                    className={buttonVariants({ className: 'flex-1 gap-2 font-semibold shadow-md shadow-primary/20' })}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Buka di Kasir
                  </Link>
                  <Link
                    href={`/products/${matchedProduct.id}/edit`}
                    className={buttonVariants({ variant: 'outline', size: 'icon' })}
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : notFoundCode ? (
            <Card className="border-warning/40 shadow-md bg-warning/5 p-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-warning/20 text-warning flex items-center justify-center mx-auto">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base">Barcode Belum Terdaftar</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Barcode <span className="font-mono font-semibold text-foreground">{notFoundCode}</span> tidak ditemukan dalam database kios Anda.
                </p>
              </div>

              <Link
                href={`/products/new`}
                className={buttonVariants({ className: 'gap-2 font-semibold' })}
              >
                <Plus className="h-4 w-4" />
                Daftarkan Produk Ini Sekarang
              </Link>
            </Card>
          ) : (
            <Card className="border-dashed border-border/80 p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[300px]">
              <Package className="h-12 w-12 opacity-30 mb-3" />
              <p className="font-medium text-sm">Menunggu Hasil Scan</p>
              <p className="text-xs mt-1 max-w-xs">
                Arahkan kemasan barang ke kamera atau tembakkan scanner barcode untuk mengecek harga dan stok barang secara instan.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
