'use client';

import { useState, useMemo } from 'react';
import { useSubscriptionStore } from '@/lib/store/subscription-store';
import { PaymentOrder } from '@/types/subscription';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  Check,
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  Filter,
  ImageIcon,
  Loader2,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';

function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  paid: {
    label: 'Lunas',
    color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
  },
  pending: {
    label: 'Menunggu',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  },
  pending_verification: {
    label: 'Perlu Verifikasi',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  },
  failed: {
    label: 'Gagal',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  },
  expired: {
    label: 'Expired',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300',
  },
  refunded: {
    label: 'Refund',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  },
};

export default function AdminBillingPage() {
  const { orders, adminApproveTransfer, adminRejectTransfer } =
    useSubscriptionStore();

  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState<PaymentOrder | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  // Filter orders by tab
  const filteredOrders = useMemo(() => {
    switch (activeTab) {
      case 'pending':
        return orders.filter(
          (o) => o.status === 'pending' || o.status === 'pending_verification'
        );
      case 'approved':
        return orders.filter((o) => o.status === 'paid');
      case 'rejected':
        return orders.filter((o) => o.status === 'failed' || o.status === 'expired');
      default:
        return orders;
    }
  }, [orders, activeTab]);

  const pendingCount = useMemo(
    () =>
      orders.filter(
        (o) => o.status === 'pending' || o.status === 'pending_verification'
      ).length,
    [orders]
  );

  function handleApprove(order: PaymentOrder) {
    setProcessing(order.id);
    setTimeout(() => {
      adminApproveTransfer(order.id);
      setProcessing(null);
      setSelectedOrder(null);
    }, 1000);
  }

  function handleReject() {
    if (!selectedOrder) return;
    setProcessing(selectedOrder.id);
    setTimeout(() => {
      adminRejectTransfer(selectedOrder.id, rejectReason || 'Bukti transfer tidak valid');
      setProcessing(null);
      setSelectedOrder(null);
      setShowRejectDialog(false);
      setRejectReason('');
    }, 1000);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8 lg:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Verifikasi Pembayaran
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Panel admin untuk mengelola dan memverifikasi pembayaran langganan
          </p>
        </div>

        {pendingCount > 0 && (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-0 text-xs font-bold px-3 py-1">
            <Clock className="h-3 w-3 mr-1" />
            {pendingCount} Menunggu
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-lg font-black text-foreground">
                  {orders.filter((o) => o.status === 'pending_verification').length}
                </p>
                <p className="text-[10px] text-muted-foreground">Perlu Verifikasi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-black text-foreground">
                  {orders.filter((o) => o.status === 'pending').length}
                </p>
                <p className="text-[10px] text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-teal-500" />
              </div>
              <div>
                <p className="text-lg font-black text-foreground">
                  {orders.filter((o) => o.status === 'paid').length}
                </p>
                <p className="text-[10px] text-muted-foreground">Disetujui</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-lg font-black text-foreground">
                  {orders.filter((o) => o.status === 'failed').length}
                </p>
                <p className="text-[10px] text-muted-foreground">Ditolak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="pending" className="text-xs gap-1.5">
            <Clock className="h-3 w-3" />
            Menunggu
            {pendingCount > 0 && (
              <Badge className="ml-1 h-4 w-4 p-0 text-[8px] bg-amber-500 text-white border-0 flex items-center justify-center rounded-full">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="text-xs gap-1.5">
            <Check className="h-3 w-3" />
            Disetujui
          </TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs gap-1.5">
            <X className="h-3 w-3" />
            Ditolak
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs gap-1.5">
            <Filter className="h-3 w-3" />
            Semua
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredOrders.length === 0 ? (
            <Card className="border-border/40">
              <CardContent className="py-12 text-center">
                <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground">Tidak ada data</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Belum ada order dalam kategori ini
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredOrders.map((order) => {
                const pStatus = paymentStatusConfig[order.status];
                const isVerification = order.status === 'pending_verification';

                return (
                  <Card
                    key={order.id}
                    className={`border-border/40 transition-all duration-200 hover:shadow-md ${
                      isVerification ? 'border-l-2 border-l-amber-500' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div
                          className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isVerification
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isVerification ? (
                            <AlertTriangle className="h-5 w-5" />
                          ) : (
                            <CreditCard className="h-5 w-5" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-bold text-foreground">
                              {order.order_number}
                            </p>
                            <Badge
                              className={`text-[9px] px-1.5 py-0 border-0 ${pStatus?.color || ''}`}
                            >
                              {pStatus?.label || order.status}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                            <span>Paket: <strong>{order.plan_name}</strong></span>
                            <span>Metode: <strong className="capitalize">{order.payment_method.replace('_', ' ')}</strong></span>
                            <span>User: <strong>{order.user_id}</strong></span>
                          </div>

                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            <span>{formatDateTime(order.created_at)}</span>
                            <span className="font-bold text-foreground text-xs">
                              {formatRupiah(order.amount_idr)}
                            </span>
                          </div>

                          {/* Rejection reason */}
                          {order.rejection_reason && (
                            <div className="flex items-center gap-1.5 text-[10px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md px-2 py-1 mt-1">
                              <XCircle className="h-3 w-3 shrink-0" />
                              <span>Alasan: {order.rejection_reason}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {order.proof_image_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setSelectedOrder(order)}
                              title="Lihat Bukti Transfer"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          )}

                          {(order.status === 'pending_verification' ||
                            order.status === 'pending') && (
                            <>
                              <Button
                                size="sm"
                                className="h-8 text-[10px] font-bold gap-1 bg-teal-600 hover:bg-teal-700 text-white"
                                onClick={() => handleApprove(order)}
                                disabled={processing === order.id}
                              >
                                {processing === order.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                                Setujui
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-[10px] font-bold gap-1 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowRejectDialog(true);
                                }}
                                disabled={processing === order.id}
                              >
                                <X className="h-3 w-3" />
                                Tolak
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Proof Image Dialog */}
      {selectedOrder && !showRejectDialog && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Bukti Transfer
              </DialogTitle>
              <DialogDescription className="text-xs">
                Order: {selectedOrder.order_number} •{' '}
                {formatRupiah(selectedOrder.amount_idr)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {selectedOrder.proof_image_url ? (
                <div className="rounded-xl overflow-hidden border border-border bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedOrder.proof_image_url}
                    alt="Bukti Transfer"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Belum ada bukti transfer yang diunggah
                  </p>
                </div>
              )}

              <div className="bg-muted/30 rounded-lg p-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Paket</span>
                  <span className="font-semibold">{selectedOrder.plan_name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Jumlah</span>
                  <span className="font-bold">{formatRupiah(selectedOrder.amount_idr)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Metode</span>
                  <span className="font-semibold capitalize">
                    {selectedOrder.payment_method.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">User ID</span>
                  <span className="font-mono text-[10px]">{selectedOrder.user_id}</span>
                </div>
              </div>
            </div>

            {(selectedOrder.status === 'pending_verification' ||
              selectedOrder.status === 'pending') && (
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setShowRejectDialog(true)}
                >
                  <X className="h-3 w-3 mr-1" />
                  Tolak
                </Button>
                <Button
                  size="sm"
                  className="text-xs bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={() => handleApprove(selectedOrder)}
                  disabled={processing === selectedOrder.id}
                >
                  {processing === selectedOrder.id ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  Setujui & Aktifkan
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2 text-red-600">
              <XCircle className="h-4 w-4" />
              Tolak Pembayaran
            </DialogTitle>
            <DialogDescription className="text-xs">
              Berikan alasan penolakan untuk dikirimkan ke pengguna
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Alasan Penolakan</Label>
              <Input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Bukti transfer tidak valid / nominal tidak sesuai"
                className="text-xs h-10"
              />
            </div>

            <div className="flex gap-2 text-[10px] text-muted-foreground bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Penolakan bersifat final. Pengguna akan diberitahu dan perlu melakukan
                pembayaran ulang.
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason('');
              }}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleReject}
              disabled={processing === selectedOrder?.id}
              className="text-xs"
            >
              {processing === selectedOrder?.id ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              Tolak Pembayaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
