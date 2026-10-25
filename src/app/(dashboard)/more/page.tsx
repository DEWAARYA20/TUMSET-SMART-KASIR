'use client';

import Link from 'next/link';
import {
  FolderTree,
  Boxes,
  RotateCcw,
  TrendingDown,
  Truck,
  BarChart3,
  Bot,
  Settings,
  ChevronRight,
  Store,
  Receipt,
  ScanBarcode,
  BookOpen,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

const moreMenuGroups = [
  {
    title: 'Manajemen Inventaris & Barang',
    items: [
      {
        title: 'Kategori Produk',
        desc: 'Kelola kategori, warna label & struktur barang',
        href: '/categories',
        icon: FolderTree,
        color: 'text-emerald-500 bg-emerald-500/10',
      },
      {
        title: 'Manajemen Stok & Opname',
        desc: 'Penyesuaian stok, riwayat mutasi & stock opname',
        href: '/inventory',
        icon: Boxes,
        color: 'text-blue-500 bg-blue-500/10',
      },
      {
        title: 'Barcode Scanner Hub',
        desc: 'Scan barcode barang via kamera HP atau scanner fisik',
        href: '/scan',
        icon: ScanBarcode,
        color: 'text-purple-500 bg-purple-500/10',
      },
      {
        title: 'Retur Barang',
        desc: 'Pengembalian barang rusak atau kedaluwarsa',
        href: '/returns',
        icon: RotateCcw,
        color: 'text-rose-500 bg-rose-500/10',
      },
    ],
  },
  {
    title: 'Keuangan & Operasional',
    items: [
      {
        title: 'Buku Kas Bon (Piutang)',
        desc: 'Catat utang pelanggan, cicilan & pengingat WA',
        href: '/debts',
        icon: BookOpen,
        color: 'text-amber-600 bg-amber-500/10',
      },
      {
        title: 'Biaya Pengeluaran Kios',
        desc: 'Catat listrik, kresek, sewa, dan beban harian',
        href: '/expenses',
        icon: TrendingDown,
        color: 'text-amber-500 bg-amber-500/10',
      },
      {
        title: 'Riwayat Transaksi Penjualan',
        desc: 'Daftar transaksi kasir & cetak ulang struk',
        href: '/transactions',
        icon: Receipt,
        color: 'text-indigo-500 bg-indigo-500/10',
      },
      {
        title: 'Laporan Laba Rugi',
        desc: 'Analisis laba bersih, HPP, dan performa omset',
        href: '/reports',
        icon: BarChart3,
        color: 'text-emerald-600 bg-emerald-600/10',
      },
      {
        title: 'Pemasok & Distributor',
        desc: 'Buku kontak agen grosir & pemesanan barang',
        href: '/suppliers',
        icon: Truck,
        color: 'text-cyan-500 bg-cyan-500/10',
      },
    ],
  },
  {
    title: 'Kecerdasan & Sistem',
    items: [
      {
        title: 'Kios AI Assistant',
        desc: 'Prediksi restock, analisis margin & konsultasi warung',
        href: '/ai',
        icon: Bot,
        color: 'text-primary bg-primary/10',
      },
      {
        title: 'Pengaturan Kios & Printer',
        desc: 'Format struk thermal, nama kios & backup data',
        href: '/settings',
        icon: Settings,
        color: 'text-slate-500 bg-slate-500/10',
      },
    ],
  },
];

export default function MorePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto pb-24">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Menu Selengkapnya</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Pusat akses cepat seluruh modul TUMSET Smart Kios.
        </p>
      </div>

      <div className="space-y-6">
        {moreMenuGroups.map((group, idx) => (
          <div key={idx} className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              {group.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {group.items.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card className="p-3.5 flex items-center justify-between hover:border-primary/50 transition-all hover:shadow-xs group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
