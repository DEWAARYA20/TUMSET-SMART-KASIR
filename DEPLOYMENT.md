# 🚀 Panduan Deployment & Operasional: TUMSET SMART KIOS

Dokumen ini berisi panduan komprehensif untuk meluncurkan sistem kasir pintar **TUMSET SMART KIOS** ke server produksi (cloud atau server mandiri), menghubungkan database Supabase, konfigurasi login sosial OAuth, dan panduan hardware printer thermal kasir.

---

## 📋 Daftar Isi
1. [Arsitektur & Spesifikasi Teknologi](#1-arsitektur--spesifikasi-teknologi)
2. [Prasyarat Lingkungan](#2-prasyarat-lingkungan)
3. [Konfigurasi Variabel Lingkungan (.env)](#3-konfigurasi-variabel-lingkungan-env)
4. [Setup Database Supabase & Migrasi SQL](#4-setup-database-supabase--migrasi-sql)
5. [Konfigurasi Social Login OAuth](#5-konfigurasi-social-login-oauth)
6. [Langkah Deployment ke Cloud (Vercel / VPS)](#6-langkah-deployment-ke-cloud)
7. [Panduan Operasional Perangkat Kios & Kasir](#7-panduan-operasional-perangkat-kios--kasir)
8. [Verifikasi Sistem & Perintah Uji](#8-verifikasi-sistem--perintah-uji)

---

## 1. Arsitektur & Spesifikasi Teknologi

| Komponen | Spesifikasi Produksi |
|---|---|
| **Frontend & Backend** | Next.js 16 (App Router + Turbopack + TypeScript) |
| **Styling & UI** | Tailwind CSS + shadcn/ui + Lucide Icons |
| **State Management** | Zustand dengan persistensi `localStorage` (Offline-First) |
| **Database** | Supabase PostgreSQL dengan Row Level Security (RLS) terisolasi per toko |
| **Printer Thermal** | Web Bluetooth ESC/POS engine native (kertas 58mm & 80mm) |
| **Barcode Scanner** | ZXing Video Stream (kamera) + Global Keyboard HID listener (USB/Bluetooth) |
| **Metode Pembayaran** | QRIS Dinamis, GoPay, DANA, Virtual Account BCA/BRI/BSI, Transfer Manual |
| **Mata Uang & Timezone** | Rupiah (IDR), Zona Waktu Asia/Makassar (WITA, UTC+8) |

---

## 2. Prasyarat Lingkungan

- **Node.js**: Versi `20.x` atau `24.x` (LTS direkomendasikan).
- **Package Manager**: `npm` versi 10+.
- **Akun Supabase**: [https://supabase.com](https://supabase.com) (Tersedia Free Tier & Pro).
- **Domain HTTPS**: Wajib menggunakan protokol HTTPS pada server produksi agar fitur **Web Bluetooth**, **PWA Service Worker**, dan **Kamera Barcode** diizinkan oleh browser.

---

## 3. Konfigurasi Variabel Lingkungan (.env)

Salin file contoh ke `.env.local` pada direktori root project:

```bash
cp .env.example .env.local
```

Isi variabel berikut sesuai kredensial Anda:

```env
# URL dan Kunci Publik Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Kunci Rahasia Server Supabase (Hanya untuk Server / API Routes)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# URL Domain Aplikasi
NEXT_PUBLIC_APP_URL=https://pos.kiosanda.com

# Payment Gateway (Midtrans / Xendit Sandbox atau Production)
PAYMENT_GATEWAY_PROVIDER=midtrans
PAYMENT_GATEWAY_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxx
PAYMENT_GATEWAY_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxx
PAYMENT_WEBHOOK_SECRET=your-secure-webhook-secret-token

# Google Gemini AI API Key (Untuk Kios AI Assistant)
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 4. Setup Database Supabase & Migrasi SQL

Jalankan skrip migrasi database secara berurutan melalui menu **SQL Editor** pada Supabase Dashboard:

### Langkah 1: Migrasi Skema Utama Kios
Buka dan jalankan seluruh isi file:
[`supabase/migrations/20261025000000_init_schema.sql`](file:///Users/aryayudhistirasyafrul/Documents/PROJEK/KASIR%20KIOS/tumset-smart-kios/supabase/migrations/20261025000000_init_schema.sql)
> Skema ini mencakup 20+ tabel relasional, RLS multi-store isolation, fungsi checkout atomik `process_pos_checkout`, dan trigger profil toko.

### Langkah 2: Migrasi Modul Langganan & Billing
Buka dan jalankan seluruh isi file:
[`supabase/migrations/20261025000001_subscriptions_billing.sql`](file:///Users/aryayudhistirasyafrul/Documents/PROJEK/KASIR%20KIOS/tumset-smart-kios/supabase/migrations/20261025000001_subscriptions_billing.sql)
> Skema ini membuat tabel paket `subscription_plans`, pesanan `payment_orders`, dan fungsi aktivasi langganan `activate_subscription`.

### Langkah 3: Seed Data Awal Toko Indonesia (Opsional)
Buka dan jalankan file:
[`supabase/seed.sql`](file:///Users/aryayudhistirasyafrul/Documents/PROJEK/KASIR%20KIOS/tumset-smart-kios/supabase/seed.sql)
> Mengisi 5 kategori utama sembako dan produk standar (Beras, Minyak, Indomie, Aqua, Telur) dengan barcode EAN-13 aktual.

### Langkah 4: Buat Storage Bucket Gambar Produk
1. Buka menu **Storage** di Supabase Dashboard.
2. Buat bucket baru bernama `product-images`.
3. Aktifkan opsi **Public Bucket** agar gambar produk dapat ditampilkan di kasir POS.

---

## 5. Konfigurasi Social Login OAuth

Di Supabase Dashboard, masuk ke menu **Authentication** > **Providers**:

### Google OAuth
1. Buat project di [Google Cloud Console](https://console.cloud.google.com).
2. Buat **OAuth 2.0 Client IDs** (Web Application).
3. Masukkan **Authorized redirect URIs**:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. Masukkan Client ID & Secret ke Supabase Auth Provider Google.

### Facebook Login
1. Buat aplikasi di [Meta for Developers](https://developers.facebook.com).
2. Aktifkan Facebook Login dan daftarkan redirect URI Supabase.
3. Masukkan App ID & App Secret ke Supabase.

### X (Twitter) OAuth 2.0
1. Buat aplikasi di [Twitter Developer Portal](https://developer.twitter.com).
2. Aktifkan OAuth 2.0 dengan izin `tweet.read` dan `users.read`.
3. Masukkan Client ID & Client Secret ke Supabase.

---

## 6. Langkah Deployment ke Cloud

### Opsi A: Deploy ke Vercel (Paling Direkomendasikan)
1. Push kode ke repository GitHub/GitLab.
2. Buka [Vercel Dashboard](https://vercel.com) dan pilih **Import Project**.
3. Tetapkan root directory ke folder project Next.js.
4. Masukkan seluruh environment variables dari bagian (3).
5. Klik **Deploy**. Vercel akan otomatis mengompilasi dan menyediakan HTTPS global CDN.

### Opsi B: Deploy ke VPS Ubuntu (Nginx + PM2)
1. Siapkan server VPS dengan Node.js 20+:
```bash
sudo apt update && sudo apt install -y nodejs npm nginx
sudo npm install -g pm2
```
2. Clone project dan pasang dependency:
```bash
git clone <url-repo-anda> /var/www/tumset-pos
cd /var/www/tumset-pos
npm ci
```
3. Build project untuk produksi:
```bash
npm run build
```
4. Jalankan aplikasi dengan PM2:
```bash
pm2 start npm --name "tumset-pos" -- start
pm2 save
pm2 startup
```
5. Konfigurasi Nginx Reverse Proxy dengan SSL Let's Encrypt (`certbot`).

---

## 7. Panduan Operasional Perangkat Kios & Kasir

### A. Cetak Struk ke Printer Thermal Mini Bluetooth (ESC/POS)
1. Nyalakan printer thermal Bluetooth (Panda, VSC, Iware, Eppos, Goojprt, dll).
2. Buka menu **Pengaturan** ([`/settings`](http://localhost:3000/settings)) pada aplikasi.
3. Pada kartu **Printer Thermal Bluetooth (ESC/POS)**, klik tombol **Sambungkan Printer**.
4. Browser akan memunculkan dialog Web Bluetooth. Pilih nama printer thermal Anda dan klik **Pair**.
5. Klik tombol **Cetak Tes Struk** untuk memastikan koneksi berhasil.
6. Saat kasir menyelesaikan transaksi di menu POS, struk dapat langsung dicetak tanpa dialog pop-up browser!

### B. Scanner Barcode Hardware USB / Bluetooth HID
- Hubungkan barcode scanner gun USB ke komputer/laptop, atau hubungkan scanner Bluetooth ke tablet.
- Scanner akan otomatis dikenali sebagai keyboard HID standar.
- Arahkan scanner ke barcode produk di halaman POS; barang akan langsung otomatis masuk ke keranjang kasir.

### C. Mode Install PWA di Tablet Kasir (Android / iPad / Windows)
1. Buka aplikasi menggunakan browser Chrome (Android) atau Safari (iPad).
2. Tekan menu browser lalu pilih **"Tambahkan ke Layar Utama" (Add to Home Screen)**.
3. Aplikasi akan terinstal seperti aplikasi kasir native fullscreen tanpa address bar.
4. Jika koneksi internet warung terputus, banner **"Mode Offline Aktif"** akan muncul dan kasir tetap dapat memproses transaksi lokal.

---

## 8. Verifikasi Sistem & Perintah Uji

Jalankan perintah berikut sebelum merilis update ke kasir:

```bash
# 1. Jalankan Unit Test kalkulasi kasir, diskon, kembalian & billing:
npm test

# 2. Uji Kompilasi Produksi (seluruh 32 rute):
npm run build

# 3. Jalankan server lokal produksi untuk verifikasi akhir:
npm run start
```
