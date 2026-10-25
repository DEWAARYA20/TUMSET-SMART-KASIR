import Link from 'next/link';
import { ArrowLeft, Database, EyeOff, Lock, ShieldCheck, Store, UserCheck } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata = {
  title: 'Kebijakan Privasi — TUMSET Smart Kios',
  description: 'Kebijakan privasi dan perlindungan data pengguna aplikasi TUMSET Smart Kios.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Store className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight text-base sm:text-lg">TUMSET Smart Kios</span>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link
            href="/login"
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Kembali
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-600 dark:text-teal-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            Perlindungan Data Sesuai Regulasi
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Kebijakan Privasi
          </h1>
          <p className="text-sm text-muted-foreground">
            Terakhir diperbarui: 25 Oktober 2026 • Komitmen kami dalam menjaga kerahasiaan data toko & transaksi Anda
          </p>
        </div>

        <Card className="border-border/60 shadow-lg">
          <CardContent className="p-6 sm:p-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
                Data yang Kami Kumpulkan
              </h2>
              <p>
                Untuk menjalankan operasional kasir dan manajemen kios secara optimal, kami mengumpulkan kategori data berikut:
              </p>
              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 space-y-1">
                  <div className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-primary" />
                    Informasi Profil & Toko
                  </div>
                  <p className="text-xs text-muted-foreground">Nama pemilik, nama warung/kios, email, nomor WhatsApp, alamat toko, dan zona waktu (WITA).</p>
                </div>
                <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 space-y-1">
                  <div className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-teal-500" />
                    Data Katalog & Transaksi
                  </div>
                  <p className="text-xs text-muted-foreground">Daftar produk, barcode EAN-13, riwayat transaksi penjualan kasir, mutasi stok, kas bon, dan beban operasional kios.</p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
                Isolasi Data Toko (Row Level Security)
              </h2>
              <p>
                Setiap toko memiliki data yang terisolasi secara ketat menggunakan teknologi <strong className="text-foreground">PostgreSQL Row Level Security (RLS)</strong>. Pengguna atau kasir dari toko lain tidak dapat membaca, mencari, atau mengakses data inventaris dan keuangan toko Anda dalam kondisi apa pun.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
                Autentikasi Sosial & OAuth
              </h2>
              <p>
                Jika Anda masuk menggunakan akun Google, Facebook, atau X (Twitter):
              </p>
              <ul className="space-y-1.5 list-disc pl-5">
                <li>Kami hanya meminta izin dasar (*email* dan *profil publik*) untuk memverifikasi identitas Anda.</li>
                <li>Kami tidak pernah meminta atau menyimpan kata sandi pihak ketiga akun media sosial Anda.</li>
                <li>Kami tidak akan pernah memposting atau menerbitkan konten apa pun ke media sosial Anda.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">4</span>
                Kerahasiaan Pembayaran Digital
              </h2>
              <p>
                Seluruh transaksi berlangganan diproses melalui gerbang pembayaran berlisensi (seperti Midtrans/Xendit/QRIS). Data kartu kredit atau informasi sensitif perbankan Anda tidak pernah disimpan di server kami, melainkan dienkripsi langsung oleh institusi pembayaran terkait.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">5</span>
                Kios AI & Kerahasiaan Rekomendasi
              </h2>
              <p>
                Fitur asisten kecerdasan buatan (Kios AI) menganalisis perputaran inventaris dan margin keuntungan semata-mata untuk memberi rekomendasi bisnis kepada Anda. Data penjualan kios Anda tidak akan diperjualbelikan kepada kompetitor atau pihak ketiga mana pun.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">6</span>
                Hak Pengguna & Ekspor Data
              </h2>
              <p>
                Sebagai pemilik data, Anda berhak mengekspor data transaksi ke format CSV kapan saja melalui menu Laporan, atau membuat backup data lokal dalam format JSON melalui menu Pengaturan.
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Bottom Card */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border/70 shadow-sm">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Data Anda Aman & Terenkripsi</div>
              <p className="text-xs text-muted-foreground">Dukungan TLS 1.3 dan penyimpanan PostgreSQL berstandar enterprise.</p>
            </div>
          </div>
          <Link
            href="/terms"
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Lihat Syarat & Ketentuan
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <p>© 2026 TUMSET Smart Kios — POS & Business Intelligence. Seluruh Hak Cipta Dilindungi.</p>
      </footer>
    </div>
  );
}
