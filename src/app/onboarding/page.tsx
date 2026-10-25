'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createStoreAction } from '@/lib/auth/actions';
import { AlertCircle, ArrowRight, Building2, CheckCircle2, Clock, Loader2, MapPin, Phone, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await createStoreAction(formData);
      if (!result.success) {
        setError(result.error || 'Gagal menyiapkan toko. Silakan coba lagi.');
        setLoading(false);
      } else {
        router.push(result.redirectTo || '/dashboard');
      }
    } catch {
      setError('Terjadi kendala jaringan. Silakan coba lagi.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-background via-muted/30 to-background p-4 sm:p-6">
      <header className="flex items-center justify-between max-w-4xl mx-auto w-full mb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">
            T
          </div>
          <span className="font-bold tracking-tight">TUMSET SMART KIOS</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-xl">
          <Card className="border-border/60 shadow-xl backdrop-blur-sm bg-card/95">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
                <Building2 className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Setup Toko / Kios Anda</CardTitle>
              <CardDescription className="text-sm">
                Langkah terakhir: isi informasi toko Anda agar struk kasir dan laporan keuangan langsung siap digunakan
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="py-2.5">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    Nama Kios / Toko
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Contoh: Kios Berkah Mandiri"
                    required
                    disabled={loading}
                    className="h-10 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      Nomor Telepon / WhatsApp
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="081234567890"
                      disabled={loading}
                      className="h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="timezone" className="text-xs font-semibold flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      Zona Waktu
                    </Label>
                    <select
                      id="timezone"
                      name="timezone"
                      defaultValue="Asia/Makassar"
                      disabled={loading}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Asia/Makassar">WITA (Makassar, Bali, NTB, NTT) - UTC+8</option>
                      <option value="Asia/Jakarta">WIB (Jakarta, Jawa, Sumatera) - UTC+7</option>
                      <option value="Asia/Jayapura">WIT (Jayapura, Papua, Maluku) - UTC+9</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-semibold flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    Alamat Lengkap
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Jl. Toddopuli Raya No. 45, Makassar"
                    disabled={loading}
                    className="h-10 text-sm"
                  />
                </div>

                {/* Benefits Pill */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    Yang sudah otomatis disiapkan untuk toko Anda:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                      <span>Kategori produk dasar</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                      <span>Format mata uang Rupiah</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                      <span>Sistem barcode siap scan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                      <span>Struk kasir 58mm / 80mm</span>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 font-semibold gap-2 mt-2" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyiapkan Kios Anda...
                    </>
                  ) : (
                    <>
                      Buka Kios & Masuk Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>
      </main>

      <footer className="text-center text-xs text-muted-foreground mt-6">
        © 2026 TUMSET Smart Kios — POS & Business Intelligence.
      </footer>
    </div>
  );
}
