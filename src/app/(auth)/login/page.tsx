'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { loginAction, socialLoginAction } from '@/lib/auth/actions';
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Sparkles, Store } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registeredSuccess = searchParams.get('registered') === 'true';
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await loginAction(formData);
      if (!result.success) {
        setError(result.error || 'Email atau password salah.');
        setLoading(false);
      } else {
        router.push(result.redirectTo || '/dashboard');
      }
    } catch {
      setError('Terjadi kendala jaringan. Silakan coba lagi.');
      setLoading(false);
    }
  }

  async function handleSocialLogin(provider: 'google' | 'facebook' | 'twitter') {
    setSocialLoading(provider);
    setError(null);
    try {
      const res = await socialLoginAction(provider);
      if (!res.success) {
        setError(res.error || `Gagal login dengan ${provider}.`);
      } else if (res.redirectTo) {
        if (res.redirectTo.startsWith('http')) {
          window.location.href = res.redirectTo;
        } else {
          document.cookie = `demo_user=owner; path=/; max-age=86400`;
          router.push(res.redirectTo);
        }
      }
    } catch {
      setError('Terjadi kesalahan saat menghubungkan OAuth provider.');
    } finally {
      setSocialLoading(null);
    }
  }

  function handleDemoLogin(role: 'owner' | 'cashier') {
    setLoading(true);
    document.cookie = `demo_user=${role}; path=/; max-age=86400`;
    window.location.href = '/dashboard';
  }

  return (
    <Card className="border-border/60 shadow-xl shadow-primary/5 backdrop-blur-sm bg-card/95 max-w-md w-full mx-auto">
      <CardHeader className="space-y-2 text-center pb-3">
        {/* Logo Kios Smart POS */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/25 mb-1">
          <Store className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-black tracking-tight text-foreground">
          Kelola Kios Lebih Mudah
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Aplikasi kasir pintar serba otomatis untuk warung dan kios modern
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="py-2.5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {registeredSuccess && !error && (
          <Alert className="py-2.5 border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription className="text-xs font-semibold">
              ✅ Akun berhasil dibuat! Silakan login dengan email & password Anda.
            </AlertDescription>
          </Alert>
        )}

        {/* 1. SOCIAL LOGIN BUTTONS */}
        <div className="space-y-2">
          {/* Google */}
          <Button
            type="button"
            variant="outline"
            disabled={loading || !!socialLoading}
            onClick={() => handleSocialLogin('google')}
            className="w-full h-10 text-xs font-semibold gap-3 border-border hover:bg-muted/60 transition-colors"
          >
            {socialLoading === 'google' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Lanjutkan dengan Google</span>
          </Button>

          {/* Facebook */}
          <Button
            type="button"
            variant="outline"
            disabled={loading || !!socialLoading}
            onClick={() => handleSocialLogin('facebook')}
            className="w-full h-10 text-xs font-semibold gap-3 border-border hover:bg-muted/60 transition-colors"
          >
            {socialLoading === 'facebook' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            )}
            <span>Lanjutkan dengan Facebook</span>
          </Button>

          {/* X / Twitter */}
          <Button
            type="button"
            variant="outline"
            disabled={loading || !!socialLoading}
            onClick={() => handleSocialLogin('twitter')}
            className="w-full h-10 text-xs font-semibold gap-3 border-border hover:bg-muted/60 transition-colors"
          >
            {socialLoading === 'twitter' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            )}
            <span>Lanjutkan dengan X</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground font-medium text-[10px] tracking-wider">
              Atau Gunakan Email
            </span>
          </div>
        </div>

        {/* 2. EMAIL & PASSWORD FORM */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">Email Kios</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@kiosanda.com"
              required
              disabled={loading}
              className="h-10 text-xs"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
              >
                Lupa sandi?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                disabled={loading}
                className="h-10 text-xs pr-10"
                autoComplete="current-password"
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

          <Button type="submit" className="w-full h-10 font-bold gap-2 text-xs" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Quick Demo Access */}
        <div className="pt-1">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('owner')}
              disabled={loading}
              className="text-[11px] h-8 border-dashed text-primary font-medium"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Demo Pemilik
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('cashier')}
              disabled={loading}
              className="text-[11px] h-8 border-dashed font-medium"
            >
              Demo Kasir
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-0 text-center text-xs text-muted-foreground">
        <p>
          Belum punya akun kios?{' '}
          <Link href="/register" className="font-semibold text-primary underline underline-offset-4 hover:opacity-80">
            Daftar toko baru
          </Link>
        </p>

        {/* Terms & Privacy Links */}
        <p className="text-[10px] text-muted-foreground/80 pt-1 leading-normal">
          Dengan masuk, Anda menyetujui{' '}
          <Link href="/terms" className="underline hover:text-foreground">
            Syarat Layanan
          </Link>{' '}
          dan{' '}
          <Link href="/privacy" className="underline hover:text-foreground">
            Kebijakan Privasi
          </Link>{' '}
          TUMSET.
        </p>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
