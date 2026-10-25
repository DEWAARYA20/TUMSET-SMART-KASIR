'use client';

import { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OFFICIAL_PLANS, PaymentMethod, SubscriptionPlan } from '@/types/subscription';
import { useSubscriptionStore } from '@/lib/store/subscription-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  CreditCard,
  ImagePlus,
  Loader2,
  QrCode,
  ShieldCheck,
  Smartphone,
  Upload,
  Wallet,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'ewallet' | 'va' | 'qris' | 'manual';
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'qris',
    name: 'QRIS',
    description: 'Scan QR — Semua aplikasi e-wallet',
    icon: <QrCode className="h-5 w-5" />,
    category: 'qris',
  },
  {
    id: 'gopay',
    name: 'GoPay',
    description: 'Bayar via saldo GoPay',
    icon: <Wallet className="h-5 w-5" />,
    category: 'ewallet',
  },
  {
    id: 'dana',
    name: 'DANA',
    description: 'Bayar via saldo DANA',
    icon: <Smartphone className="h-5 w-5" />,
    category: 'ewallet',
  },
  {
    id: 'va_bca',
    name: 'Virtual Account BCA',
    description: 'Transfer via VA BCA',
    icon: <CreditCard className="h-5 w-5" />,
    category: 'va',
  },
  {
    id: 'va_bri',
    name: 'Virtual Account BRI',
    description: 'Transfer via VA BRI',
    icon: <CreditCard className="h-5 w-5" />,
    category: 'va',
  },
  {
    id: 'va_bsi',
    name: 'Virtual Account BSI',
    description: 'Transfer via VA BSI',
    icon: <CreditCard className="h-5 w-5" />,
    category: 'va',
  },
  {
    id: 'manual_transfer',
    name: 'Transfer Manual',
    description: 'Transfer bank + kirim bukti',
    icon: <Upload className="h-5 w-5" />,
    category: 'manual',
  },
];

type CheckoutStep = 'method' | 'confirm' | 'paying' | 'success';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planCode = searchParams.get('plan');

  const { createPaymentOrder, activateSubscriptionFromOrder, submitManualTransferProof } =
    useSubscriptionStore();

  const [step, setStep] = useState<CheckoutStep>('method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [vaNumber, setVaNumber] = useState<string | null>(null);
  const [qrString, setQrString] = useState<string | null>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofUploading, setProofUploading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Find the selected plan - always from OFFICIAL_PLANS (server-validated)
  const plan: SubscriptionPlan | null = useMemo(
    () => OFFICIAL_PLANS.find((p) => p.code === planCode) || null,
    [planCode]
  );

  // Countdown timer for simulated payment
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-activate after simulated payment countdown
  useEffect(() => {
    if (countdown === 0 && step === 'paying' && orderId && selectedMethod !== 'manual_transfer') {
      // Simulate successful payment
      try {
        activateSubscriptionFromOrder(orderId);
        setStep('success');
      } catch {
        setError('Gagal mengaktifkan langganan.');
      }
    }
  }, [countdown, step, orderId, selectedMethod, activateSubscriptionFromOrder]);

  const handleCreateOrder = useCallback(() => {
    if (!plan || !selectedMethod) return;
    setError(null);
    setLoading(true);

    try {
      const order = createPaymentOrder(plan.code, selectedMethod);
      setOrderId(order.id);
      setOrderNumber(order.order_number);
      setVaNumber(order.va_number || null);
      setQrString(order.qr_string || null);

      if (selectedMethod === 'manual_transfer') {
        setStep('confirm');
      } else {
        setStep('paying');
        // Simulate payment processing time (5 seconds)
        setCountdown(5);
      }
    } catch {
      setError('Gagal membuat order. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [plan, selectedMethod, createPaymentOrder]);

  const handleSubmitProof = useCallback(() => {
    if (!orderId || !proofImage) return;
    setProofUploading(true);

    setTimeout(() => {
      submitManualTransferProof(orderId, proofImage);
      setStep('success');
      setProofUploading(false);
    }, 1500);
  }, [orderId, proofImage, submitManualTransferProof]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // In production, upload to storage and get URL
    // For demo, create a local object URL
    const url = URL.createObjectURL(file);
    setProofImage(url);
  }, []);

  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 pb-6 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <p className="text-sm font-semibold text-foreground">Paket tidak ditemukan</p>
            <p className="text-xs text-muted-foreground">
              Silakan pilih paket langganan dari halaman harga terlebih dahulu.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/billing/pricing')}
              className="mt-2 text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Kembali ke Harga
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 lg:px-8 lg:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (step === 'method') router.push('/billing/pricing');
            else setStep('method');
          }}
          className="text-xs gap-1.5"
          disabled={step === 'paying' || step === 'success'}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali
        </Button>
        <div>
          <h1 className="text-xl font-black tracking-tight text-foreground">Checkout</h1>
          <p className="text-xs text-muted-foreground">Selesaikan pembayaran langganan Anda</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Payment Method or Payment Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* STEP 1: Select Payment Method */}
          {step === 'method' && (
            <Card className="border-border/60 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  Pilih Metode Pembayaran
                </CardTitle>
                <CardDescription className="text-xs">
                  Pilih cara bayar yang paling nyaman untuk Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedMethod || ''}
                  onValueChange={(val) => setSelectedMethod(val as PaymentMethod)}
                  className="space-y-2"
                >
                  {/* QRIS Section */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                      Scan QR
                    </p>
                    {PAYMENT_METHODS.filter((m) => m.category === 'qris').map((method) => (
                      <label
                        key={method.id}
                        className={`
                          flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200
                          ${
                            selectedMethod === method.id
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border/50 hover:border-border hover:bg-muted/30'
                          }
                        `}
                      >
                        <RadioGroupItem value={method.id} className="shrink-0" />
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`
                              h-9 w-9 rounded-lg flex items-center justify-center shrink-0
                              ${
                                selectedMethod === method.id
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-muted text-muted-foreground'
                              }
                            `}
                          >
                            {method.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground">{method.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {method.description}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* E-Wallet Section */}
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                      E-Wallet
                    </p>
                    {PAYMENT_METHODS.filter((m) => m.category === 'ewallet').map((method) => (
                      <label
                        key={method.id}
                        className={`
                          flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200
                          ${
                            selectedMethod === method.id
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border/50 hover:border-border hover:bg-muted/30'
                          }
                        `}
                      >
                        <RadioGroupItem value={method.id} className="shrink-0" />
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`
                              h-9 w-9 rounded-lg flex items-center justify-center shrink-0
                              ${
                                selectedMethod === method.id
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-muted text-muted-foreground'
                              }
                            `}
                          >
                            {method.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground">{method.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {method.description}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Virtual Account Section */}
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                      Virtual Account
                    </p>
                    {PAYMENT_METHODS.filter((m) => m.category === 'va').map((method) => (
                      <label
                        key={method.id}
                        className={`
                          flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200
                          ${
                            selectedMethod === method.id
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border/50 hover:border-border hover:bg-muted/30'
                          }
                        `}
                      >
                        <RadioGroupItem value={method.id} className="shrink-0" />
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`
                              h-9 w-9 rounded-lg flex items-center justify-center shrink-0
                              ${
                                selectedMethod === method.id
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-muted text-muted-foreground'
                              }
                            `}
                          >
                            {method.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground">{method.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {method.description}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Manual Transfer Section */}
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                      Transfer Manual
                    </p>
                    {PAYMENT_METHODS.filter((m) => m.category === 'manual').map((method) => (
                      <label
                        key={method.id}
                        className={`
                          flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200
                          ${
                            selectedMethod === method.id
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border/50 hover:border-border hover:bg-muted/30'
                          }
                        `}
                      >
                        <RadioGroupItem value={method.id} className="shrink-0" />
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`
                              h-9 w-9 rounded-lg flex items-center justify-center shrink-0
                              ${
                                selectedMethod === method.id
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-muted text-muted-foreground'
                              }
                            `}
                          >
                            {method.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground">{method.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {method.description}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>

                <Button
                  onClick={handleCreateOrder}
                  disabled={!selectedMethod || loading}
                  className="w-full h-11 mt-5 text-xs font-bold gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Membuat Order...
                    </>
                  ) : (
                    <>
                      Lanjutkan Pembayaran
                      <CreditCard className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* STEP 2: Payment Processing (for digital methods) */}
          {step === 'paying' && (
            <Card className="border-border/60 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
                  Menunggu Pembayaran
                </CardTitle>
                <CardDescription className="text-xs">
                  No. Order: <span className="font-mono font-semibold">{orderNumber}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Payment Info based on method */}
                <div className="text-center space-y-4 py-4">
                  {/* QRIS */}
                  {selectedMethod === 'qris' && (
                    <div className="space-y-3">
                      <div className="mx-auto w-48 h-48 bg-muted/50 rounded-2xl flex items-center justify-center border-2 border-dashed border-border">
                        <div className="text-center">
                          <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                          <p className="text-[10px] text-muted-foreground">
                            Simulasi QRIS
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Scan kode QR di atas dengan aplikasi e-wallet Anda
                      </p>
                    </div>
                  )}

                  {/* Virtual Account */}
                  {vaNumber && (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">Nomor Virtual Account:</p>
                      <div className="bg-muted/50 rounded-xl px-6 py-4 inline-block">
                        <p className="text-2xl font-mono font-black text-foreground tracking-wider">
                          {vaNumber}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Transfer tepat{' '}
                        <span className="font-bold text-foreground">
                          {formatRupiah(plan.price_idr)}
                        </span>{' '}
                        ke nomor VA di atas
                      </p>
                    </div>
                  )}

                  {/* E-Wallet */}
                  {(selectedMethod === 'gopay' || selectedMethod === 'dana') && (
                    <div className="space-y-3">
                      <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                        <Smartphone className="h-10 w-10 text-primary animate-bounce" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Menunggu konfirmasi dari {selectedMethod === 'gopay' ? 'GoPay' : 'DANA'}...
                      </p>
                    </div>
                  )}

                  {/* Countdown */}
                  <div className="pt-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span className="text-xs font-semibold">
                        Memproses pembayaran... ({countdown}s)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/30 rounded-lg p-3">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-teal-500" />
                  <span>
                    Pembayaran diproses secara otomatis. Langganan akan langsung aktif setelah
                    pembayaran berhasil.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 2b: Manual Transfer - Upload Proof */}
          {step === 'confirm' && selectedMethod === 'manual_transfer' && (
            <Card className="border-border/60 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  Upload Bukti Transfer
                </CardTitle>
                <CardDescription className="text-xs">
                  No. Order: <span className="font-mono font-semibold">{orderNumber}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Bank Details */}
                <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Rekening Tujuan
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Bank</span>
                      <span className="text-xs font-bold">BCA</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">No. Rekening</span>
                      <span className="text-xs font-mono font-bold">6390-4890-82</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Atas Nama</span>
                      <span className="text-xs font-bold">PT TUMSET DIGITAL</span>
                    </div>
                    <Separator className="my-1.5" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Jumlah Transfer</span>
                      <span className="text-sm font-black text-foreground">
                        {formatRupiah(plan.price_idr)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Upload Area */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Bukti Transfer</Label>
                  <div
                    className={`
                      relative border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer
                      ${proofImage ? 'border-teal-500/50 bg-teal-500/5' : 'border-border hover:border-primary/30'}
                    `}
                  >
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {proofImage ? (
                      <div className="space-y-2">
                        <Check className="h-8 w-8 text-teal-500 mx-auto" />
                        <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                          Bukti transfer berhasil dipilih
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Klik untuk mengganti gambar
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ImagePlus className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-xs font-semibold text-foreground">
                          Upload screenshot bukti transfer
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Format: JPG, PNG, atau WEBP (maks 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleSubmitProof}
                  disabled={!proofImage || proofUploading}
                  className="w-full h-11 text-xs font-bold gap-2"
                >
                  {proofUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mengirim Bukti...
                    </>
                  ) : (
                    <>
                      Kirim Bukti Transfer
                      <Upload className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>

                <p className="text-[10px] text-muted-foreground text-center">
                  Verifikasi manual membutuhkan waktu 1×24 jam kerja.
                  Langganan akan aktif setelah bukti transfer diverifikasi admin.
                </p>
              </CardContent>
            </Card>
          )}

          {/* STEP 3: Success */}
          {step === 'success' && (
            <Card className="border-teal-200/60 dark:border-teal-800/40 shadow-lg shadow-teal-500/10">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-teal-500/10 flex items-center justify-center">
                  <Check className="h-8 w-8 text-teal-500" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg font-black text-foreground">
                    {selectedMethod === 'manual_transfer'
                      ? 'Bukti Transfer Terkirim!'
                      : 'Pembayaran Berhasil!'}
                  </h2>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    {selectedMethod === 'manual_transfer'
                      ? 'Bukti transfer Anda sedang diverifikasi oleh tim admin. Langganan akan aktif setelah verifikasi selesai.'
                      : `Selamat! Langganan ${plan.name} Anda sudah aktif. Nikmati semua fitur kasir pintar tanpa batas.`}
                  </p>
                </div>

                <div className="bg-muted/30 rounded-xl p-4 text-left space-y-1.5 max-w-xs mx-auto">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">No. Order</span>
                    <span className="font-mono font-semibold">{orderNumber}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Paket</span>
                    <span className="font-semibold">{plan.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold">{formatRupiah(plan.price_idr)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Status</span>
                    <Badge
                      className={`text-[10px] px-2 py-0 ${
                        selectedMethod === 'manual_transfer'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                          : 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                      }`}
                    >
                      {selectedMethod === 'manual_transfer' ? 'Menunggu Verifikasi' : 'Aktif'}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2 max-w-xs mx-auto">
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="flex-1 h-10 text-xs font-bold"
                  >
                    Ke Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/billing/pricing')}
                    className="flex-1 h-10 text-xs"
                  >
                    Lihat Paket Lain
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <Card className="border-border/60 shadow-md sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Plan info */}
              <div className="bg-gradient-to-br from-teal-500/5 to-primary/5 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  {plan.badge_label && (
                    <Badge className="text-[9px] px-1.5 py-0 bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 border-0">
                      {plan.badge_label}
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-bold text-foreground">{plan.name}</p>
                <p className="text-xs text-muted-foreground">
                  {plan.duration_months} bulan akses penuh
                </p>
              </div>

              <Separator />

              {/* Price breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Harga paket</span>
                  <span className="font-semibold">{formatRupiah(plan.price_idr)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Harga per bulan</span>
                  <span className="text-muted-foreground">
                    ≈ {formatRupiah(plan.effective_price_monthly)}
                  </span>
                </div>
                {plan.code !== 'monthly' && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Hemat</span>
                    <span className="text-teal-600 dark:text-teal-400 font-semibold">
                      {formatRupiah(45000 * plan.duration_months - plan.price_idr)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-foreground">Total Bayar</span>
                  <span className="text-lg font-black text-foreground">
                    {formatRupiah(plan.price_idr)}
                  </span>
                </div>
              </div>

              {/* Security badges */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                  <span>Transaksi terenkripsi & aman</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                  <span>Aktivasi instan setelah bayar</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                  <span>Batas bayar 24 jam</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

