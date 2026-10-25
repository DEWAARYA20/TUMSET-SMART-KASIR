'use client';

import { useState } from 'react';
import {
  Settings,
  Store,
  Printer,
  Shield,
  Save,
  Download,
  RotateCcw,
  Check,
  Bluetooth,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProductStore } from '@/lib/store/product-store';
import { useSalesStore } from '@/lib/store/sales-store';
import { bluetoothPrinter } from '@/lib/printer/bluetooth-printer';

export default function SettingsPage() {
  const { products, categories, resetToDefaults } = useProductStore();
  const { sales } = useSalesStore();

  const [storeName, setStoreName] = useState('TUMSET SMART KIOS');
  const [storeAddress, setStoreAddress] = useState('Jl. Poros Utama No. 88, Makassar');
  const [storePhone, setStorePhone] = useState('0812-3456-7890');
  const [receiptFooter, setReceiptFooter] = useState('Terima kasih atas kunjungan Anda!');
  const [paperSize, setPaperSize] = useState<'58mm' | '80mm'>('58mm');
  const [saved, setSaved] = useState(false);
  const [btConnected, setBtConnected] = useState(bluetoothPrinter.isConnected());
  const [btDeviceName, setBtDeviceName] = useState(bluetoothPrinter.getDeviceName());
  const [isConnectingBt, setIsConnectingBt] = useState(false);

  async function handleConnectBluetooth() {
    try {
      setIsConnectingBt(true);
      const name = await bluetoothPrinter.connect();
      setBtConnected(true);
      setBtDeviceName(name);
    } catch (err: any) {
      alert(err.message || 'Gagal menyambungkan Bluetooth printer.');
    } finally {
      setIsConnectingBt(false);
    }
  }

  function handleDisconnectBluetooth() {
    bluetoothPrinter.disconnect();
    setBtConnected(false);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleBackupData() {
    const backupObj = {
      timestamp: new Date().toISOString(),
      store: { storeName, storeAddress, storePhone },
      products,
      categories,
      sales,
    };
    const blob = new Blob([JSON.stringify(backupObj, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-kios-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Pengaturan Toko & Printer
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Konfigurasi identitas kios, format struk kasir, dan pencadangan data.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identitas Toko */}
        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              Identitas Kios / Warung
            </CardTitle>
            <CardDescription className="text-xs">
              Informasi ini akan tercetak pada bagian atas struk kasir thermal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Kios / Toko *</Label>
              <Input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="h-10 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Alamat Kios</Label>
              <Input
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Nomor WhatsApp / Telepon</Label>
              <Input
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                className="h-10 text-xs font-mono"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pengaturan Printer Struk Thermal */}
        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Printer className="h-4 w-4 text-primary" />
              Konfigurasi Printer Thermal Struk
            </CardTitle>
            <CardDescription className="text-xs">
              Pilih lebar kertas struk kasir Bluetooth / USB Thermal printer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Ukuran Kertas Thermal</Label>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <Button
                  type="button"
                  variant={paperSize === '58mm' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPaperSize('58mm')}
                  className="text-xs font-bold h-10"
                >
                  58mm (Ukuran Kios Standar)
                </Button>
                <Button
                  type="button"
                  variant={paperSize === '80mm' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPaperSize('80mm')}
                  className="text-xs font-bold h-10"
                >
                  80mm (Ukuran Besar POS)
                </Button>
              </div>
            </div>

            {/* Bluetooth Direct Connection */}
            <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <Bluetooth className="h-4 w-4 text-blue-600" />
                  Koneksi Printer Bluetooth Thermal (ESC/POS)
                </span>
                <Badge
                  variant={btConnected ? 'default' : 'outline'}
                  className={`text-[10px] ${btConnected ? 'bg-emerald-600 text-white' : 'text-muted-foreground'}`}
                >
                  {btConnected ? 'Terhubung' : 'Belum Terhubung'}
                </Badge>
              </div>

              <p className="text-[11px] text-muted-foreground leading-snug">
                Dapat terhubung langsung ke mini thermal printer Bluetooth (Panda, VSC, Iware, Eppos, Goojprt) untuk cetak cepat tanpa pop-up dialog print browser.
              </p>

              <div className="flex items-center gap-2 pt-1">
                {btConnected ? (
                  <>
                    <span className="text-xs font-mono font-medium text-foreground">
                      {btDeviceName}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDisconnectBluetooth}
                      className="text-xs h-8 text-destructive hover:bg-destructive/10 ml-auto"
                    >
                      Putuskan
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isConnectingBt}
                    onClick={handleConnectBluetooth}
                    className="text-xs h-8 gap-1.5 text-blue-600 border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold"
                  >
                    <Bluetooth className="h-3.5 w-3.5" />
                    {isConnectingBt ? 'Mencari Perangkat...' : 'Sambungkan Printer Bluetooth'}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Pesan Kaki Struk (Footer Greeting)</Label>
              <Input
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="h-10 text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Backup & Data */}
        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Pencadangan Data Toko
            </CardTitle>
            <CardDescription className="text-xs">
              Simpan salinan data produk, inventaris, dan transaksi ke file JSON untuk backup lokal.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBackupData}
              className="gap-1.5 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              Download Backup Data JSON
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Kembalikan data produk ke seed awal?')) {
                  resetToDefaults();
                }
              }}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Data Produk Default
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" className="gap-2 font-bold px-6">
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? 'Tersimpan!' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
