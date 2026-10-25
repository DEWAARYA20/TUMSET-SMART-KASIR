import Link from 'next/link';
import { ArrowLeft, BookOpen, CheckCircle, FileText, Shield, Store, Zap } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata = {
  title: 'Syarat & Ketentuan Layanan — TUMSET Smart Kios',
  description: 'Ketentuan penggunaan dan berlangganan sistem kasir pintar TUMSET Smart Kios.',
};

export default function TermsPage() {
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <FileText className="w-3.5 h-3.5" />
            Dokumen Legal Resmi
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Syarat & Ketentuan Layanan
          </h1>
          <p className="text-sm text-muted-foreground">
            Terakhir diperbarui: 25 Oktober 2026 • Berlaku efektif untuk seluruh pengguna aplikasi TUMSET Smart Kios
          </p>
        </div>

        <Card className="border-border/60 shadow-lg">
          <CardContent className="p-6 sm:p-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
                Penerimaan Ketentuan
              </h2>
              <p>
                Dengan mengakses, mendaftar, atau menggunakan aplikasi <strong className="text-foreground">TUMSET Smart Kios</strong> (&ldquo;Layanan&rdquo;), Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat dengan seluruh syarat dan ketentuan berikut. Jika Anda tidak menyetujui salah satu pasal, Anda tidak diperkenankan menggunakan Layanan ini.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
                Akun Toko & Keamanan Kredensial
              </h2>
              <ul className="space-y-2 list-none pl-0">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>Anda wajib memberikan data toko dan identitas yang valid, akurat, dan dapat dipertanggungjawabkan saat pendaftaran.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>Anda bertanggung jawab penuh untuk menjaga kerahasiaan kata sandi dan akses akun Google, Facebook, atau X yang ditautkan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>Setiap aktivitas yang dilakukan melalui akun Anda dianggap sebagai tindakan sah oleh pemilik toko atau kasir yang diberi wewenang.</span>
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
                Paket Langganan, Harga & Pembayaran
              </h2>
              <p>
                TUMSET Smart Kios menyediakan paket berlangganan berjenjang (Bulanan, 3 Bulan, 6 Bulan, 9 Bulan, dan Tahunan) dengan ketentuan sebagai berikut:
              </p>
              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 space-y-1">
                  <div className="font-semibold text-foreground text-xs">Penetapan Harga Server-Side</div>
                  <p className="text-xs text-muted-foreground">Harga paket terikat resmi di server aplikasi dan tidak dapat dimanipulasi melalui client browser.</p>
                </div>
                <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 space-y-1">
                  <div className="font-semibold text-foreground text-xs">Aktivasi Otomatis & Manual</div>
                  <p className="text-xs text-muted-foreground">Pembayaran QRIS, E-Wallet, dan VA aktif seketika setelah pembayaran terkonfirmasi. Transfer manual diverifikasi maksimal 1x24 jam kerja.</p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">4</span>
                Kedaluwarsa & Pembatasan Akses (Subscription Guard)
              </h2>
              <p>
                Apabila masa aktif langganan toko telah berakhir (status <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">expired</code> atau <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">suspended</code>):
              </p>
              <ul className="space-y-1.5 list-disc pl-5">
                <li>Fitur kasir POS, tambah produk, barcode scanner, mutasi stok, laporan keuangan, dan asisten AI akan dikunci sementara.</li>
                <li>Pengguna tetap dapat masuk (login), membuka halaman tagihan, melihat riwayat faktur, dan memperpanjang langganan kapan saja.</li>
                <li>Data barang dan riwayat penjualan tidak akan dihapus dan akan kembali dapat diakses penuh setelah langganan diaktifkan kembali.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">5</span>
                Kebijakan Pengembalian Dana (Refund)
              </h2>
              <p>
                Biaya langganan yang telah dibayarkan dan paket yang telah aktif tidak dapat dikembalikan atau diuangkan kembali (non-refundable), kecuali terjadi kegagalan sistem teknis ganda pada gerbang pembayaran yang menyebabkan pembayaran ganda terdebet.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">6</span>
                Batasan Tanggung Jawab
              </h2>
              <p>
                TUMSET Smart Kios berupaya memberikan ketersediaan layanan dengan tingkat uptime tertinggi. Namun demikian, kami tidak bertanggung jawab atas kerugian operasional yang diakibatkan oleh pemadaman jaringan telekomunikasi pihak ketiga, kerusakan perangkat keras kasir pengguna, atau kelalaian pemilik toko dalam menjaga keamanan akun.
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Bottom CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border/70 shadow-sm">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Pertanyaan seputar Syarat & Ketentuan?</div>
              <p className="text-xs text-muted-foreground">Hubungi pusat bantuan atau tim operasional kami.</p>
            </div>
          </div>
          <Link
            href="/billing/pricing"
            className={buttonVariants({ size: 'sm' })}
          >
            Lihat Paket Langganan
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
