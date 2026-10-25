/**
 * TUMSET SMART KIOS - Direct ESC/POS Bluetooth Thermal Printer Driver
 * Supports 58mm & 80mm Bluetooth Thermal Printers (Goojprt, Panda, Eppos, Iware, VSC, etc.)
 */

import { SaleTransaction } from '@/lib/store/sales-store';
import { formatCurrency, formatDateTime } from '@/lib/format';

class BluetoothPrinterService {
  private device: any = null;
  private characteristic: any = null;
  private isConnecting: boolean = false;

  /**
   * Check if Web Bluetooth API is supported on the current device
   */
  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  /**
   * Connect to Bluetooth printer
   */
  async connect(): Promise<string> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth tidak didukung pada browser ini. Gunakan Google Chrome di Android atau Desktop.');
    }

    try {
      this.isConnecting = true;
      // Request device with printer service UUIDs or accept all devices
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb',
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
          '49535343-fe7d-4ae5-8fa9-9fafd205e455',
        ],
      });

      this.device = device;
      const server = await device.gatt.connect();

      // Find writable characteristic
      const services = await server.getPrimaryServices();
      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            this.characteristic = char;
            break;
          }
        }
        if (this.characteristic) break;
      }

      if (!this.characteristic) {
        throw new Error('Karakteristik penulisan printer Bluetooth tidak ditemukan.');
      }

      this.isConnecting = false;
      return device.name || 'Printer Bluetooth';
    } catch (err: any) {
      this.isConnecting = false;
      throw err;
    }
  }

  /**
   * Disconnect printer
   */
  disconnect() {
    if (this.device && this.device.gatt && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.characteristic = null;
  }

  isConnected(): boolean {
    return !!(this.device && this.device.gatt && this.device.gatt.connected && this.characteristic);
  }

  getDeviceName(): string {
    return this.device?.name || 'Printer Bluetooth';
  }

  /**
   * Send raw byte buffer to printer in chunks (max 512 bytes per chunk for BLE)
   */
  private async writeChunks(data: Uint8Array): Promise<void> {
    if (!this.characteristic) {
      throw new Error('Printer Bluetooth belum terhubung.');
    }

    const CHUNK_SIZE = 100;
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      if (this.characteristic.properties.writeWithoutResponse) {
        await this.characteristic.writeValueWithoutResponse(chunk);
      } else {
        await this.characteristic.writeValue(chunk);
      }
      // Small delay between Bluetooth chunks to prevent buffer overflow
      await new Promise((res) => setTimeout(res, 20));
    }
  }

  /**
   * Format sale transaction into ESC/POS thermal command stream and print
   */
  async printReceipt(sale: SaleTransaction, storeInfo?: { name?: string; address?: string; phone?: string }): Promise<void> {
    const encoder = new TextEncoder();
    const buffer: number[] = [];

    // ESC/POS Commands
    const ESC = 0x1b;
    const GS = 0x1d;

    // 1. Initialize printer
    buffer.push(ESC, 0x40);

    // 2. Center alignment
    buffer.push(ESC, 0x61, 0x01);

    // Store Name (Double height & width)
    buffer.push(ESC, 0x21, 0x20); // Double height
    buffer.push(ESC, 0x45, 0x01); // Bold ON
    const storeName = storeInfo?.name || sale.store_name || 'TUMSET SMART KIOS';
    buffer.push(...encoder.encode(storeName + '\n'));
    buffer.push(ESC, 0x21, 0x00); // Normal text
    buffer.push(ESC, 0x45, 0x00); // Bold OFF

    const address = storeInfo?.address || 'Kios Sembako & Kebutuhan Harian';
    buffer.push(...encoder.encode(address + '\n'));
    if (storeInfo?.phone) {
      buffer.push(...encoder.encode(`Telp: ${storeInfo.phone}\n`));
    }

    // Separator line (32 chars for 58mm)
    buffer.push(...encoder.encode('--------------------------------\n'));

    // 3. Left alignment for meta
    buffer.push(ESC, 0x61, 0x00);
    buffer.push(...encoder.encode(`No. Faktur : ${sale.invoice_number}\n`));
    buffer.push(...encoder.encode(`Waktu      : ${formatDateTime(sale.created_at)}\n`));
    buffer.push(...encoder.encode(`Kasir      : ${sale.cashier_name}\n`));
    if (sale.customer_name) {
      buffer.push(...encoder.encode(`Pelanggan  : ${sale.customer_name}\n`));
    }
    buffer.push(...encoder.encode('--------------------------------\n'));

    // 4. Items List
    for (const item of sale.items) {
      buffer.push(...encoder.encode(`${item.product_name}\n`));
      const qtyPrice = `  ${item.quantity} x ${formatCurrency(item.unit_price)}`;
      const subtotal = formatCurrency(item.subtotal);
      const spaceCount = Math.max(1, 32 - qtyPrice.length - subtotal.length);
      const spaces = ' '.repeat(spaceCount);
      buffer.push(...encoder.encode(`${qtyPrice}${spaces}${subtotal}\n`));
    }

    buffer.push(...encoder.encode('--------------------------------\n'));

    // 5. Totals
    const subtotalText = formatCurrency(sale.subtotal);
    const subtotalSpaces = ' '.repeat(Math.max(1, 32 - 'Subtotal:'.length - subtotalText.length));
    buffer.push(...encoder.encode(`Subtotal:${subtotalSpaces}${subtotalText}\n`));

    if (sale.discount_total > 0) {
      const discText = `-${formatCurrency(sale.discount_total)}`;
      const discSpaces = ' '.repeat(Math.max(1, 32 - 'Diskon:'.length - discText.length));
      buffer.push(...encoder.encode(`Diskon:${discSpaces}${discText}\n`));
    }

    // TOTAL (Bold)
    buffer.push(ESC, 0x45, 0x01); // Bold ON
    const totalText = formatCurrency(sale.total);
    const totalSpaces = ' '.repeat(Math.max(1, 32 - 'TOTAL:'.length - totalText.length));
    buffer.push(...encoder.encode(`TOTAL:${totalSpaces}${totalText}\n`));
    buffer.push(ESC, 0x45, 0x00); // Bold OFF

    // Payment details
    const methodText = sale.payment_method.toUpperCase();
    const methodSpaces = ' '.repeat(Math.max(1, 32 - 'Metode Bayar:'.length - methodText.length));
    buffer.push(...encoder.encode(`Metode Bayar:${methodSpaces}${methodText}\n`));

    if (sale.payment_method === 'cash') {
      const cashText = formatCurrency(sale.cash_amount || sale.total);
      const cashSpaces = ' '.repeat(Math.max(1, 32 - 'Tunai:'.length - cashText.length));
      buffer.push(...encoder.encode(`Tunai:${cashSpaces}${cashText}\n`));

      const changeText = formatCurrency(sale.change_amount || 0);
      const changeSpaces = ' '.repeat(Math.max(1, 32 - 'Kembalian:'.length - changeText.length));
      buffer.push(...encoder.encode(`Kembalian:${changeSpaces}${changeText}\n`));
    }

    // 6. Footer
    buffer.push(...encoder.encode('================================\n'));
    buffer.push(ESC, 0x61, 0x01); // Center
    buffer.push(...encoder.encode('Terima kasih atas belanja Anda!\n'));
    buffer.push(...encoder.encode('Barang yang sudah dibeli tidak\n'));
    buffer.push(...encoder.encode('dapat ditukar/dikembalikan.\n'));

    // Feed lines & Cut paper
    buffer.push(0x0a, 0x0a, 0x0a);
    buffer.push(GS, 0x56, 0x41, 0x10); // Partial cut

    await this.writeChunks(new Uint8Array(buffer));
  }
}

export const bluetoothPrinter = new BluetoothPrinterService();
