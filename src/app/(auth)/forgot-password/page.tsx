'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { forgotPasswordAction } from '@/lib/auth/actions';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await forgotPasswordAction(email);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(res.error || 'Gagal mengirim instruksi pemulihan kata sandi.');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan koneksi. Silakan coba beberapa saat lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-xl backdrop-blur-sm bg-card/90 animate-in fade-in zoom-in-95 duration-300">
      <CardHeader className="space-y-1.5 text-center pb-4">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2 shadow-inner border border-primary/20">
          <KeyRound className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Lupa Kata Sandi?
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Masukkan alamat email akun Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isSuccess ? (
          <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-teal-600 dark:text-teal-400 mx-auto" />
            <h4 className="font-semibold text-foreground text-sm">
              Email Pemulihan Terkirim!
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Instruksi pengaturan ulang kata sandi telah dikirim ke <span className="font-semibold text-foreground">{email}</span>. Silakan periksa kotak masuk atau folder spam Anda.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSuccess(false)}
              className="mt-2 text-xs"
            >
              Kirim ulang ke email lain
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">
                Alamat Email Akun
              </Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@kiosanda.com"
                  className="pl-9 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full font-medium"
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengirim Tautan...
                </>
              ) : (
                'Kirim Tautan Pemulihan'
              )}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-2 text-center text-xs text-muted-foreground border-t border-border/40">
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-1.5 font-medium text-foreground hover:text-primary transition-colors py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Halaman Masuk
        </Link>
      </CardFooter>
    </Card>
  );
}
