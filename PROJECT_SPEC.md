<USER_REQUEST>
# PROJECT: TUMSET SMART KIOS — AI-POWERED CASHIER SYSTEM

Bertindaklah sebagai Senior Full-Stack Developer, Software Architect, UI/UX Designer, Database Engineer, dan AI Engineer.

Bangun aplikasi kasir kios modern bernama **TUMSET SMART KIOS**, yaitu aplikasi Point of Sale (POS) yang profesional, responsif, cepat, aman, mudah digunakan, dan dilengkapi fitur AI untuk membantu pemilik kios mengelola penjualan, persediaan barang, keuntungan, pengeluaran, dan laporan bisnis.

Jangan hanya membuat prototype atau UI statis. Buat aplikasi yang benar-benar berfungsi dengan database, autentikasi, CRUD, perhitungan transaksi, pemindaian barcode, pencetakan struk, dan laporan yang menggunakan data aktual.

## 1. PLATFORM DAN TEKNOLOGI

Gunakan teknologi berikut atau pilihan setara yang stabil dan sesuai:

- Frontend: Next.js dengan TypeScript.
- Styling: Tailwind CSS dan shadcn/ui.
- Icons: Lucide.
- Grafik: Recharts.
- Database: Supabase PostgreSQL.
- Authentication: Supabase Auth.
- Backend: Next.js server actions/API routes atau arsitektur backend yang sesuai.
- PWA: dapat di-install di Android, iOS yang mendukung, dan Windows.
- AI: integrasikan LLM melalui API yang aman untuk analisis penjualan dan rekomendasi bisnis.
- Barcode scanner: dukung scanner USB/Bluetooth HID dan kamera perangkat menggunakan library seperti ZXing atau BarcodeDetector dengan fallback yang sesuai.
- Foto produk: Supabase Storage.
- Currency: Indonesian Rupiah (IDR/Rp).
- Locale: Bahasa Indonesia.
- Timezone: Asia/Makassar.

Gunakan versi library yang kompatibel dan stabil. Simpan seluruh API key di environment variables, jangan pernah mengekspos secret key di frontend.

Jika repository sudah berisi proyek, periksa struktur dan teknologi yang tersedia terlebih dahulu. Pertahankan kode yang masih relevan dan jangan menghapus konfigurasi penting tanpa alasan.

## 2. DESAIN UI/UX

Buat antarmuka seperti aplikasi POS profesional modern dengan inspirasi desain Apple, Stripe Dashboard, dan aplikasi retail premium.

Karakteristik desain:
- Clean, minimalis, modern, premium, dan mudah dipahami.
- Mendukung light mode dan dark mode.
- Warna utama charcoal/navy, putih, dan aksen emerald atau teal untuk indikator positif.
- Gunakan warna merah untuk kerugian, stok habis, dan peringatan.
- Card dengan sudut membulat, tipografi jelas, serta grafik yang mudah dibaca.
- Animasi ringan dan transisi yang halus.
- Loading skeleton, empty states, toast notifications, dan error states.
- Gunakan format Rupiah yang konsisten.
- Jangan membuat tampilan terlalu ramai atau memenuhi layar dengan card yang tidak diperlukan.

Responsiveness wajib:
- iOS: tampilan nyaman untuk layar kecil, mendukung safe areas dan navigasi sentuh.
- Android: navigasi responsif, kamera untuk scan barcode, dan PWA.
- Windows/Desktop: sidebar, tabel yang lengkap, dashboard multi-kolom, dan dukungan scanner USB.
- Tablet: layout kasir dan dashboard yang menyesuaikan ukuran layar.

Buat navigasi yang sesuai perangkat. Jangan sekadar mengecilkan layout desktop ke layar HP.

## 3. DASHBOARD UTAMA

Buat dashboard analitik dengan filter periode:
- Hari ini.
- Kemarin.
- 7 hari terakhir.
- 30 hari terakhir.
- Bulan ini.
- Bulan lalu.
- Rentang tanggal khusus.

Tampilkan metrik berikut:
1. Omzet kotor.
2. Diskon penjualan.
3. Retur penjualan.
4. Omzet bersih.
5. Total harga pokok barang terjual (HPP).
6. Laba kotor.
7. Total pengeluaran operasional.
8. Laba bersih.
9. Total transaksi.
10. Rata-rata nilai transaksi.
11. Total produk aktif.
12. Total unit stok yang tersedia.
13. Nilai persediaan berdasarkan harga modal.
14. Produk hampir habis dan produk habis.
15. Produk terlaris dan produk dengan penjualan terendah.

Buat grafik:
- Tren omzet berdasarkan hari, minggu, atau bulan.
- Grafik laba kotor dan laba bersih.
- Perbandingan pemasukan dan pengeluaran.
- Produk terlaris berdasarkan jumlah terjual.
- Distribusi kategori produk.
- Pergerakan stok.

Semua statistik harus berasal dari database dan mengikuti filter periode yang dipilih. Jangan gunakan angka dummy setelah aplikasi terhubung ke database.

## 4. MANAJEMEN PRODUK DAN INVENTARIS

Pemilik kios harus dapat menambahkan barang secara manual dengan form berikut:

- Nama produk.
- SKU atau kode internal.
- Barcode.
- Merek.
- Kategori.
- Varian, ukuran, atau rasa.
- Foto produk.
- Harga modal per unit.
- Harga jual.
- Stok awal.
- Stok minimum.
- Satuan barang, misalnya pcs, bungkus, botol, dus, atau kilogram.
- Pemasok.
- Tanggal kedaluwarsa jika relevan.
- Status aktif/nonaktif.
- Deskripsi opsional.

Fitur inventaris:
- Tambah, edit, hapus dengan validasi, dan pencarian produk.
- Pencarian berdasarkan nama, SKU, merek, atau barcode.
- Filter kategori dan status stok.
- Import dan export CSV.
- Penyesuaian stok dengan alasan dan riwayat.
- Penerimaan barang dari pembelian.
- Riwayat stok masuk dan stok keluar.
- Peringatan stok minimum.
- Peringatan produk kedaluwarsa.
- Riwayat perubahan harga.
- Stock opname.
- Dukungan satuan dan konversi kemasan, contohnya 1 dus = 40 bungkus.
- Cegah stok negatif kecuali pemilik secara eksplisit mengaktifkan kebijakan tersebut.

Jangan menghitung nilai stok hanya dari jumlah produk yang berbeda. Tampilkan jumlah SKU, jumlah unit fisik, dan nilai persediaan sebagai metrik yang berbeda.

## 5. FITUR SCAN BARCODE PRODUK

Ini merupakan fitur utama aplikasi.

Sediakan halaman scan khusus dan tombol scan pada halaman kasir serta inventaris.

Metode scan:
1. Kamera belakang HP melalui browser yang mendukung.
2. Kamera laptop atau perangkat desktop.
3. Barcode scanner USB.
4. Barcode scanner Bluetooth HID.

Format yang perlu didukung meliputi EAN-13, EAN-8, UPC-A, UPC-E, dan Code 128 sesuai dukungan library yang dipilih.

Alur penggunaan:

Contoh:
Pemilik kios sudah memasukkan produk:
- Nama: Indomie Kari Ayam.
- Merek: Indomie.
- Foto: foto produk Indomie Kari Ayam.
- Barcode: kode barcode asli pada kemasan.
- Harga modal: Rp2.500.
- Harga jual: Rp3.000.
- Stok: 50 bungkus.

Ketika barcode produk dipindai:
1. Sistem membaca nilai barcode.
2. Cari barcode tersebut pada database produk milik kios.
3. Jika ditemukan, tampilkan nama, merek, foto, harga jual, dan stok produk yang sudah terdaftar.
4. Pada halaman kasir, produk langsung ditambahkan ke keranjang.
5. Jika produk sudah ada di keranjang, tambah kuantitas sesuai aturan yang ditentukan.
6. Jika dipindai dari halaman inventaris, tampilkan detail produk yang sesuai.

PENTING:
Barcode scanner hanya membaca kode identitas produk. Jangan mengasumsikan scanner otomatis mengetahui nama, merek, foto, atau harga dari semua produk.

Buat dua mode:
- **Mode barcode terdaftar:** langsung cocokkan kode dengan produk milik pengguna.
- **Mode produk baru:** jika barcode tidak ditemukan, tampilkan opsi untuk mendaftarkan produk baru.

Untuk produk baru, sediakan fitur pencarian metadata produk melalui sumber katalog barcode atau API eksternal yang sah jika tersedia. Isi otomatis nama, merek, dan foto hanya jika datanya benar-benar ditemukan dan cocok. Jika tidak ditemukan, izinkan pengguna mengisi manual.

Jangan pernah membuat nama, merek, foto, harga, atau barcode palsu seolah-olah data resmi.

Barcode yang sama harus memiliki aturan unik dalam lingkup toko. Sediakan mekanisme untuk mengedit barcode jika terjadi kesalahan.

Buat opsi untuk menghasilkan dan mencetak barcode internal untuk produk tanpa barcode.

## 6. HALAMAN KASIR / POINT OF SALE

Buat antarmuka kasir yang cepat dan cocok untuk transaksi harian.

Fitur:
- Cari produk secara langsung.
- Scan barcode.
- Grid produk dengan foto, nama, harga, dan indikator stok.
- Keranjang belanja.
- Tambah atau kurangi kuantitas.
- Hapus item dari keranjang.
- Diskon per item atau keseluruhan transaksi dengan izin yang sesuai.
- Pajak opsional dan dapat dikonfigurasi.
- Catatan transaksi.
- Pilih metode pembayaran.
- Input jumlah uang yang diterima.
- Hitung kembalian otomatis.
- Tampilkan subtotal dan total pembayaran secara jelas.
- Konfirmasi pembayaran.
- Cetak atau bagikan struk.
- Riwayat transaksi.
- Pembatalan transaksi dengan alasan dan izin.
- Retur barang dan pengembalian dana dengan audit log.
- Dukungan pembayaran tunai, transfer bank, QRIS, dan metode lainnya.

Untuk QRIS, jangan mengklaim pembayaran otomatis terverifikasi tanpa integrasi payment gateway yang benar.

Setelah transaksi berhasil:
1. Simpan transaksi ke database.
2. Simpan detail setiap item transaksi.
3. Simpan harga jual dan HPP saat transaksi terjadi.
4. Kurangi stok secara atomik.
5. Simpan metode pembayaran.
6. Perbarui metrik dashboard.
7. Buat nomor transaksi unik.
8. Tampilkan halaman transaksi berhasil.
9. Berikan pilihan cetak struk atau transaksi baru.

Gunakan database transaction atau mekanisme konsistensi yang tepat agar stok tidak berkurang dua kali ketika permintaan diulang atau terjadi gangguan jaringan.

## 7. SISTEM STRUK DIGITAL DAN CETAK

Buat sistem struk profesional dengan dua jenis layout:
- Thermal printer 58 mm.
- Thermal printer 80 mm.
- Struk digital yang dapat diunduh sebagai PDF.

Informasi struk:
- Logo dan nama kios.
- Alamat dan nomor telepon opsional.
- Nomor transaksi.
- Tanggal dan waktu.
- Nama kasir.
- Daftar barang.
- Kuantitas.
- Harga satuan.
- Diskon.
- Subtotal.
- Total pembayaran.
- Metode pembayaran.
- Uang diterima dan kembalian untuk transaksi tunai.
- Pesan terima kasih.
- Informasi retur opsional.

Fitur tambahan:
- Preview struk sebelum dicetak.
- Cetak ulang struk dari riwayat.
- Unduh PDF.
- Bagikan struk digital melalui fitur berbagi perangkat.
- Pengaturan header, footer, logo, dan pesan struk.
- Dukungan browser print dan kompatibilitas printer yang sesuai.

Jangan menganggap seluruh printer thermal dapat mencetak langsung dari browser. Sediakan panduan integrasi dan opsi koneksi yang kompatibel, seperti print dialog, Bluetooth atau USB melalui aplikasi/perangkat pendukung jika dibutuhkan.

## 8. MANAJEMEN PENGELUARAN

Buat halaman pencatatan pengeluaran dengan:
- Nama pengeluaran.
- Kategori.
- Nominal.
- Tanggal.
- Metode pembayaran.
- Catatan.
- Lampiran bukti pembayaran opsional.
- Nama pengguna yang mencatat.

Kategori contoh:
- Listrik.
- Internet.
- Sewa kios.
- Transportasi.
- Gaji.
- Peralatan.
- Biaya operasional lainnya.

Sediakan grafik pengeluaran berdasarkan kategori dan periode.

Bedakan pengeluaran operasional dari pembelian persediaan agar pembelian stok tidak dihitung dua kali dalam laba bersih. Catat pembelian stok sebagai aktivitas persediaan dan gunakan HPP saat barang terjual untuk perhitungan laba.

## 9. LAPORAN KEUANGAN

Sediakan laporan yang dapat difilter berdasarkan periode dan diekspor ke CSV atau PDF.

Laporan:
- Penjualan harian.
- Penjualan mingguan dan bulanan.
- Laba rugi.
- Omzet kotor dan bersih.
- HPP.
- Laba kotor.
- Pengeluaran operasional.
- Laba bersih.
- Metode pembayaran.
- Produk terlaris.
- Stok dan valuasi inventaris.
- Retur dan pembatalan.
- Riwayat transaksi.

Gunakan rumus konsisten:

Omzet kotor = total nilai penjualan barang sebelum diskon dan retur.

Omzet bersih = omzet kotor - diskon penjualan - retur penjualan.

Laba kotor = omzet bersih - HPP bersih barang yang terjual.

Laba bersih operasional = laba kotor - pengeluaran operasional + pendapatan nonpenjualan yang tercatat jika ada.

Jangan samakan omzet, saldo kas, uang masuk, dan laba.

Simpan snapshot harga jual dan HPP pada detail transaksi agar perubahan harga produk pada masa depan tidak mengubah laporan transaksi lama.

Tangani retur berdasarkan nilai transaksi dan biaya barang yang dikembalikan secara benar. Pisahkan transaksi yang dibatalkan dari penjualan yang sah.

## 10. AI BUSINESS ASSISTANT

Tambahkan asisten AI bernama **Kios AI** yang membantu pemilik kios memahami data bisnis.

Fitur:
- Ringkasan penjualan hari ini.
- Analisis kenaikan atau penurunan omzet.
- Analisis keuntungan dan kerugian.
- Identifikasi produk paling laris.
- Rekomendasi restock berdasarkan kecepatan penjualan dan stok tersedia.
- Prediksi kebutuhan stok berdasarkan data historis jika data mencukupi.
- Deteksi produk yang lama tidak terjual.
- Analisis margin keuntungan per produk.
- Rekomendasi harga berdasarkan biaya dan margin yang ditetapkan pengguna.
- Analisis pengeluaran yang meningkat.
- Ringkasan laporan dalam bahasa Indonesia.
- Tanya jawab menggunakan data bisnis pengguna.

Contoh pertanyaan:
- "Berapa laba bersih saya hari ini?"
- "Produk apa yang paling laris bulan ini?"
- "Kenapa keuntungan minggu ini turun?"
- "Barang apa yang harus saya restock besok?"
- "Berapa total pengeluaran bulan ini?"
- "Berapa harga jual yang cocok jika saya ingin margin 20%?"

AI harus membaca data aktual dari backend yang terotorisasi. Jangan mengarang angka atau menyatakan prediksi sebagai fakta. Jika data tidak cukup, jelaskan keterbatasannya.

Buat insight yang menyertakan periode, metrik yang relevan, serta dasar rekomendasi. Semua keputusan harga, pembelian, dan penyesuaian stok tetap memerlukan persetujuan pengguna.

Gunakan API AI melalui backend. Jangan mengekspos API key. Batasi akses AI berdasarkan pengguna dan toko, validasi input, serta hindari mengirim data sensitif yang tidak diperlukan.

## 11. MANAJEMEN PEMASOK DAN PEMBELIAN

Tambahkan fitur pemasok:
- Nama pemasok.
- Kontak.
- Alamat opsional.
- Catatan.

Fitur pembelian stok:
- Buat pesanan pembelian.
- Pilih pemasok.
- Tambah item dan kuantitas.
- Catat harga modal aktual.
- Simpan faktur pembelian opsional.
- Tandai status pesanan.
- Saat barang benar-benar diterima, tambah stok secara konsisten.
- Simpan riwayat pembelian dan perubahan harga modal.

Jangan menambah stok sebelum penerimaan barang dikonfirmasi.

## 12. AKUN, ROLE, DAN KEAMANAN

Sediakan autentikasi dan manajemen pengguna:
- Pemilik/admin.
- Kasir.
- Supervisor opsional.

Aturan:
- Pemilik dapat mengelola produk, pengguna, laporan, harga, dan konfigurasi.
- Kasir dapat melakukan penjualan sesuai izin.
- Diskon besar, pembatalan, retur, dan penyesuaian stok dapat memerlukan izin supervisor atau pemilik.
- Setiap pengguna hanya dapat mengakses toko yang diizinkan.
- Catat aktivitas penting dalam audit log.
- Gunakan Row Level Security (RLS) pada Supabase.
- Validasi input di server.
- Gunakan prinsip least privilege.
- Jangan menyimpan password secara manual.
- Jangan mengekspos service role key ke client.
- Lindungi endpoint, data, dan file upload.

## 13. DATABASE DAN STRUKTUR DATA

Buat skema database yang terstruktur dan relasional, minimal mencakup:

- stores
- profiles
- store_members
- categories
- products
- product_barcodes
- suppliers
- purchases
- purchase_items
- inventory_movements
- sales
- sale_items
- sale_payments
- expenses
- expense_categories
- returns
- return_items
- receipts
- audit_logs
- ai_insights atau tabel terkait jika dibutuhkan.

Tambahkan:
- Primary key dan foreign key.
- Index pada barcode, nama produk, tanggal transaksi, dan relasi penting.
- Unique constraint yang tepat.
- Timestamps.
- Store ID pada data yang terisolasi per toko.
- Migration SQL.
- Kebijakan RLS.
- Fungsi database untuk operasi transaksi yang harus atomik.

Hindari duplikasi data yang tidak diperlukan. Simpan harga transaksi sebagai snapshot. Gunakan tipe numeric/decimal untuk uang, bukan floating-point biasa.

## 14. MODE OFFLINE DAN SINKRONISASI

Aplikasi harus dirancang agar tetap berguna saat internet terputus.

Prioritas:
- Cache aset aplikasi dan data katalog yang diperlukan.
- Tampilkan status online/offline.
- Pertimbangkan antrean transaksi lokal yang persisten.
- Sinkronisasi saat koneksi kembali.
- Gunakan UUID dan idempotency key untuk mencegah transaksi ganda.
- Tampilkan transaksi yang belum tersinkronisasi.
- Tangani konflik stok dengan aman.
- Lindungi data transaksi yang tersimpan di perangkat.

Jangan menjanjikan transaksi offline yang aman dan konsisten tanpa implementasi serta pengujian. Jelaskan fitur offline yang benar-benar didukung.

## 15. PENGATURAN TOKO

Sediakan pengaturan:
- Nama dan logo kios.
- Alamat dan nomor telepon.
- Format struk.
- Nomor awal atau prefix transaksi.
- Format mata uang.
- Pajak opsional.
- Pengaturan diskon.
- Stok minimum.
- Satuan barang.
- Printer.
- Tema.
- Manajemen pengguna dan role.
- Backup dan export data.

## 16. STRUKTUR HALAMAN

Buat halaman:
1. Login dan registrasi.
2. Onboarding toko.
3. Dashboard.
4. Kasir/POS.
5. Scan barcode.
6. Daftar produk.
7. Tambah/edit produk.
8. Inventaris dan stock opname.
9. Pembelian stok.
10. Pemasok.
11. Riwayat transaksi.
12. Detail transaksi dan struk.
13. Retur dan pembatalan.
14. Pengeluaran.
15. Laporan keuangan.
16. Kios AI.
17. Notifikasi.
18. Manajemen pengguna.
19. Pengaturan toko.

Desktop menggunakan sidebar yang dapat diciutkan. Mobile menggunakan bottom navigation atau navigasi yang sesuai. Halaman kasir harus meminimalkan jumlah klik untuk transaksi berulang.

## 17. TESTING DAN KRITERIA KEBERHASILAN

Buat unit test dan integration test untuk alur penting.

Wajib diuji:
- Registrasi dan login.
- Isolasi data antar toko.
- CRUD produk.
- Barcode cocok dengan produk yang benar.
- Barcode tidak dikenal diarahkan ke pendaftaran produk.
- Produk masuk keranjang dengan benar.
- Perhitungan subtotal, diskon, pajak, dan kembalian.
- Transaksi mengurangi stok tepat satu kali.
- Retur memperbarui stok dan laporan dengan benar.
- HPP tetap sesuai snapshot transaksi.
- Laporan omzet dan laba sesuai rumus.
- Pembelian stok tidak dihitung sebagai biaya operasional sekaligus HPP.
- Struk sesuai total transaksi.
- Pengeluaran memengaruhi laporan sesuai kategori.
- Dashboard berubah setelah transaksi baru.
- Hak akses role.
- Kondisi jaringan putus dan sinkronisasi jika mode offline diterapkan.

Jangan menyatakan fitur selesai jika masih berupa tombol dummy atau data hardcoded.

## 18. URUTAN PENGERJAAN

Kerjakan proyek secara bertahap:

Tahap 1: Audit repository, susun arsitektur, tentukan dependencies, dan buat desain UI dasar.

Tahap 2: Buat database schema, migrations, autentikasi, RLS, dan onboarding toko.

Tahap 3: Implementasikan produk, kategori, foto, barcode, dan inventaris.

Tahap 4: Implementasikan kasir, keranjang, pembayaran, dan transaksi atomik.

Tahap 5: Implementasikan stok masuk, pemasok, pengeluaran, retur, dan pembatalan.

Tahap 6: Implementasikan dashboard, grafik, laporan, dan export.

Tahap 7: Implementasikan struk thermal, PDF, dan konfigurasi printer.

Tahap 8: Implementasikan Kios AI dan analitik berdasarkan data aktual.

Tahap 9: Implementasikan PWA, responsivitas, serta fitur offline yang realistis.

Tahap 10: Jalankan testing, perbaiki error, validasi security, dan siapkan dokumentasi deployment.

Pada akhir setiap tahap:
- Jelaskan file yang dibuat atau diubah.
- Jalankan lint dan type checking.
- Jalankan test yang relevan.
- Perbaiki error sebelum melanjutkan.
- Jangan hanya melaporkan keberhasilan tanpa memverifikasi hasil.

## 19. OUTPUT AKHIR

Hasilkan:
- Aplikasi yang dapat dijalankan.
- Source code yang rapi dan modular.
- Database migrations SQL.
- File .env.example tanpa secret.
- Panduan instalasi dan konfigurasi.
- Panduan setup Supabase.
- Panduan setup API AI.
- Panduan scan barcode dan konfigurasi printer.
- Akun/demo seed data hanya untuk lingkungan pengembangan.
- Dokumentasi testing.
- Panduan build, deployment, dan backup.

Mulailah dengan memeriksa repository dan lingkungan proyek. Kemudian buat implementation plan yang konkret dan langsung kerjakan tahap pertama. Setelah tahap pertama berhasil, lanjutkan secara bertahap sampai fitur inti bekerja.

Jangan berhenti setelah membuat mockup. Prioritaskan sistem yang benar-benar berfungsi, keamanan data, akurasi laporan keuangan, dan pengalaman pengguna yang baik.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-24T04:03:24+08:00.
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from Gemini 3.8 Flash (High) to Claude Opus 4.6 (Thinking). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>