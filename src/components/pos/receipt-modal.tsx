'use client';

import { useRef, useState } from 'react';
import {
  Printer,
  Share2,
  CheckCircle,
  Copy,
  Check,
  ShoppingBag,
  ExternalLink,
  Bluetooth,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { bluetoothPrinter } from '@/lib/printer/bluetooth-printer';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SaleTransaction } from '@/lib/store/sales-store';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { generateBarcodeSvg } from '@/lib/barcode-generator';

interface ReceiptModalProps {
  sale: SaleTransaction | null;
  open: boolean;
  onClose: () => void;
  onNewTransaction: () => void;
}

export function ReceiptModal({
  sale,
  open,
  onClose,
  onNewTransaction,
}: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [isPrintingBt, setIsPrintingBt] = useState(false);

  if (!sale) return null;

  async function handleBluetoothPrint() {
    if (!sale) return;
    try {
      setIsPrintingBt(true);
      if (!bluetoothPrinter.isConnected()) {
        await bluetoothPrinter.connect();
      }
      await bluetoothPrinter.printReceipt(sale, {
        name: sale.store_name,
      });
    } catch (err: any) {
      console.warn('Bluetooth print error:', err);
      alert(err.message || 'Gagal mencetak ke printer Bluetooth. Pastikan Bluetooth aktif.');
    } finally {
      setIsPrintingBt(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function getReceiptPlainText(): string {
    if (!sale) return '';
    const dateFormatted = formatDateTime(sale.created_at);
    let text = `================================\n`;
    text += `       ${sale.store_name || 'TUMSET SMART KIOS'}       \n`;
    text += `       Solusi Kasir Kios Cerdas         \n`;
    text += `================================\n`;
    text += `No. Faktur : ${sale.invoice_number}\n`;
    text += `Waktu      : ${dateFormatted}\n`;
    text += `Kasir      : ${sale.cashier_name}\n`;
    if (sale.customer_name) {
      text += `Pelanggan  : ${sale.customer_name}\n`;
    }
    text += `--------------------------------\n`;

    for (const item of sale.items) {
      text += `${item.product_name}\n`;
      text += `  ${item.quantity} x ${formatCurrency(item.unit_price)} = ${formatCurrency(item.subtotal)}\n`;
    }

    text += `--------------------------------\n`;
    text += `Subtotal   : ${formatCurrency(sale.subtotal)}\n`;
    if (sale.discount_total > 0) {
      text += `Diskon     : -${formatCurrency(sale.discount_total)}\n`;
    }
    text += `TOTAL      : ${formatCurrency(sale.total)}\n`;
    text += `Metode     : ${sale.payment_method.toUpperCase()}\n`;
    if (sale.payment_method === 'cash') {
      text += `Bayar      : ${formatCurrency(sale.cash_amount || sale.total)}\n`;
      text += `Kembali    : ${formatCurrency(sale.change_amount || 0)}\n`;
    }
    text += `================================\n`;
    text += `  Terima kasih telah berbelanja! \n`;
    text += `   Barang yang sudah dibeli tidak\n`;
    text += `     dapat ditukar/dikembalikan   \n`;
    text += `================================\n`;

    return text;
  }

  function handleCopyText() {
    const text = getReceiptPlainText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSendWhatsApp() {
    const text = getReceiptPlainText();
    const encoded = encodeURIComponent(text);
    let cleanedPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanedPhone.startsWith('0')) {
      cleanedPhone = '62' + cleanedPhone.slice(1);
    }
    const url = cleanedPhone
      ? `https://wa.me/${cleanedPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  }

  const barcodeSvg = generateBarcodeSvg(sale.invoice_number, {
    width: 200,
    height: 50,
    showText: false,
  });

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-background">
        <DialogHeader className="p-4 pb-2 border-b">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-5 w-5" />
            <DialogTitle className="text-base font-semibold">
              Transaksi Berhasil Disimpan
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Scrollable Receipt Area */}
        <div className="p-4 max-h-[60vh] overflow-y-auto bg-muted/30">
          <div
            ref={receiptRef}
            id="thermal-receipt"
            className="w-full max-w-[340px] mx-auto bg-white text-black p-5 shadow-sm rounded-sm font-mono text-xs border border-gray-200"
          >
            {/* Store Header */}
            <div className="text-center space-y-1 mb-4 pb-3 border-b border-dashed border-gray-400">
              <h2 className="text-base font-bold tracking-wider uppercase">
                {sale.store_name || 'TUMSET SMART KIOS'}
              </h2>
              <p className="text-[10px] text-gray-600">
                Kios Sembako & Kebutuhan Harian
              </p>
              <p className="text-[10px] text-gray-500">
                Jl. Poros Utama No. 88 | Telp: 0812-3456-7890
              </p>
            </div>

            {/* Meta Info */}
            <div className="space-y-1 pb-3 mb-3 border-b border-dashed border-gray-400 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-500">No. Faktur:</span>
                <span className="font-semibold">{sale.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Waktu:</span>
                <span>{formatDateTime(sale.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kasir:</span>
                <span>{sale.cashier_name}</span>
              </div>
              {sale.customer_name && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Pelanggan:</span>
                  <span>{sale.customer_name}</span>
                </div>
              )}
            </div>

            {/* Item List */}
            <div className="space-y-2 pb-3 mb-3 border-b border-dashed border-gray-400">
              {sale.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-medium text-gray-900 leading-tight">
                    {item.product_name}
                  </div>
                  <div className="flex justify-between text-gray-600 text-[11px]">
                    <span>
                      {item.quantity} {item.unit} x {formatCurrency(item.unit_price)}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1.5 pb-3 mb-3 border-b border-dashed border-gray-400 text-[11px]">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              {sale.discount_total > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Diskon:</span>
                  <span>-{formatCurrency(sale.discount_total)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-300">
                <span>TOTAL:</span>
                <span>{formatCurrency(sale.total)}</span>
              </div>
              <div className="flex justify-between text-gray-600 pt-1">
                <span>Metode:</span>
                <span className="font-semibold uppercase">{sale.payment_method}</span>
              </div>
              {sale.payment_method === 'cash' && (
                <>
                  <div className="flex justify-between text-gray-600">
                    <span>Tunai:</span>
                    <span>{formatCurrency(sale.cash_amount || sale.total)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>Kembali:</span>
                    <span>{formatCurrency(sale.change_amount || 0)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Barcode & Footer Greeting */}
            <div className="text-center space-y-2 pt-1">
              <div
                className="w-48 mx-auto text-black flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: barcodeSvg }}
              />
              <p className="text-[10px] text-gray-500 italic">
                Terima kasih atas kunjungan Anda!
              </p>
              <p className="text-[9px] text-gray-400">
                Struk ini merupakan bukti pembayaran yang sah.
              </p>
            </div>
          </div>
        </div>

        {/* WhatsApp Phone Input Toggle */}
        {showPhoneInput && (
          <div className="px-4 py-2 bg-emerald-500/10 border-t border-emerald-500/20 flex items-center gap-2">
            <input
              type="tel"
              placeholder="Nomor WA (contoh: 08123456789)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
              onClick={handleSendWhatsApp}
            >
              Kirim
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <DialogFooter className="p-4 bg-background border-t gap-2 sm:gap-0">
          <div className="flex flex-wrap items-center justify-between w-full gap-2">
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-1.5 text-xs"
              >
                <Printer className="h-3.5 w-3.5" />
                Cetak
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBluetoothPrint}
                disabled={isPrintingBt}
                className="gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                <Bluetooth className="h-3.5 w-3.5" />
                {isPrintingBt ? 'Mencetak...' : 'Bluetooth'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPhoneInput(!showPhoneInput)}
                className="gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
              >
                <Share2 className="h-3.5 w-3.5" />
                WhatsApp
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyText}
                className="gap-1.5 text-xs"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Tersalin' : 'Salin'}
              </Button>
            </div>

            <Button
              size="sm"
              className="gap-1.5 bg-primary text-primary-foreground font-semibold"
              onClick={() => {
                onClose();
                onNewTransaction();
              }}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Transaksi Baru
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
