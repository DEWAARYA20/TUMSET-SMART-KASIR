# TUMSET-SMART-KASIR 🛒⚡

**TUMSET Smart Kios POS** — Aplikasi Kasir & Point of Sale (POS) Modern Berbasis Web & PWA untuk Toko Kelontong, Kios, dan UMKM Retail Indonesia.

---

## ✨ Fitur Utama

- 📱 **Point of Sale (POS) Cepat**: Transaksi kasir kilat, barcode scanner kamera real-time, cetak struk thermal Bluetooth & Web Serial ESC/POS.
- 📦 **Katalog Produk & Inventaris**: Manajemen stok fisik lengkap dengan fitur penyesuaian cepat (+1, +5, +10, -1, -5), peringatan stok menipis, dan cetak label barcode EAN-13/Code 128.
- 🔐 **Autentikasi Sosial & Multi-Provider**: Dukungan login Supabase Auth via Google, Facebook, X (Twitter), dan Email/Password.
- 💳 **Billing Langganan & Payment Gateway**: 5 paket langganan berjenjang (Free, Starter, Pro, Business, Enterprise) terintegrasi Midtrans (QRIS, VA BCA/Mandiri/BRI/BNI, GoPay, ShopeePay).
- 📴 **Offline PWA First**: Dapat beroperasi tanpa jaringan internet; data transaksi tersinkronisasi otomatis saat kembali online.
- 📊 **Laporan & Analitik**: Rekap laba/rugi, arus kas, kasbon piutang pelanggan, dan pencatatan retur barang.

---

## 🚀 Memulai (Quick Start)

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Jalankan Mode Pengembangan
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

### 3. Build Produksi & Pengujian
```bash
npm test
npm run build
npm start
```

---

## 🛠️ Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack) & React 19
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS & Lucide Icons
- **State Management:** Zustand dengan offline local storage persistence
- **Autentikasi & Database:** Supabase
- **Hardware Integration:** Web Bluetooth & Web Serial API (ESC/POS 58mm & 80mm)
