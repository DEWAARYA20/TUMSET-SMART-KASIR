'use client';

import { useState } from 'react';
import { Clock, Play, Trash2, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useSalesStore, HeldOrder } from '@/lib/store/sales-store';
import { formatCurrency, formatDateTime } from '@/lib/format';

interface HeldOrdersModalProps {
  open: boolean;
  onClose: () => void;
  onResumeOrder: (order: HeldOrder) => void;
}

export function HeldOrdersModal({
  open,
  onClose,
  onResumeOrder,
}: HeldOrdersModalProps) {
  const { heldOrders, removeHeldOrder } = useSalesStore();

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <DialogTitle>Daftar Pesanan Tersimpan (Parkir)</DialogTitle>
          </div>
          <DialogDescription>
            Pilih transaksi yang sebelumnya diparkir untuk dilanjutkan ke kasir.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto py-2">
          {heldOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Tidak ada transaksi yang sedang diparkir.</p>
            </div>
          ) : (
            heldOrders.map((order) => {
              const totalItems = order.items.reduce((acc, i) => acc + i.quantity, 0);
              const totalPrice = order.items.reduce(
                (acc, i) => acc + (i.price - i.discount) * i.quantity,
                0
              ) - order.discount_total;

              return (
                <div
                  key={order.id}
                  className="p-3.5 rounded-xl border border-border bg-card/60 hover:border-primary/40 transition-all flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">
                        {order.order_name}
                      </span>
                      {order.customer_name && (
                        <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0 font-normal">
                          <User className="h-2.5 w-2.5" />
                          {order.customer_name}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{totalItems} item</span>
                      <span>•</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(totalPrice)}
                      </span>
                      <span>•</span>
                      <span>{formatDateTime(order.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="default"
                      className="gap-1.5 text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                      onClick={() => {
                        onResumeOrder(order);
                        onClose();
                      }}
                    >
                      <Play className="h-3.5 w-3.5" />
                      Lanjutkan
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => removeHeldOrder(order.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
