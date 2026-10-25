'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import { registerAction } from '@/lib/auth/actions';
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await registerAction(formData);
      if (!result.success) {
        setError(result.error || 'Pendaftaran gagal. Periksa kembali data Anda.');
        setLoading(false);
      } else {
        // Show success notification before redirect
        setSuccess('✅ Akun berhasil dibuat! Mengalihkan...');
        setTimeout(() => {
          router.push(result.redirectTo || '/onboarding');
        }, 1500);
      }
    } catch {
      setError('Terjadi kendala jaringan. Silakan coba lagi.');
      setLoading(false);
    }
  }

  return (
    <Card className="border-border/60 shadow-xl shadow-primary/5 backdrop-blur-sm bg-card/95">
      <CardHeader className="space-y-1 text-center pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight">Daftar Akun Baru</CardTitle>
        <CardDescription className="text-sm">
          Mulai operasikan kios Anda dengan sistem kasir cerdas & otomatis
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-3.5">
          {error && (
            <Alert variant="destructive" className="py-2.5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="py-2.5 border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="text-xs font-semibold">{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs font-semibold">Nama Lengkap</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Contoh: Budi Santoso"
              required
              disabled={loading}
              className="h-10 text-sm"
              autoComplete="name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">Alamat Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@kiosanda.com"
              required
              disabled={loading}
              className="h-10 text-sm"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 6 karakter"
                required
                disabled={loading}
                className="h-10 text-sm pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold">Konfirmasi Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Ulangi password"
              required
              disabled={loading}
              className="h-10 text-sm"
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" className="w-full h-10 font-semibold gap-2 mt-2" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mendaftarkan...
              </>
            ) : (
              <>
                Lanjut ke Setup Toko
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2 text-center text-xs text-muted-foreground">
          <p>
            Sudah memiliki akun?{' '}
            <Link href="/login" className="font-semibold text-primary underline underline-offset-4 hover:opacity-80">
              Masuk di sini
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
