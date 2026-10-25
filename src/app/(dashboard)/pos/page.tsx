'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Barcode,
  Camera,
  Trash2,
  Plus,
  Minus,
  Pause,
  Play,
  RotateCcw,
  CheckCircle,
  Tag,
  ShoppingBag,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useProductStore, ProductItem } from '@/lib/store/product-store';
import { usePosStore } from '@/lib/store/pos-store';
import { useSalesStore, SaleTransaction, HeldOrder } from '@/lib/store/sales-store';
import { formatCurrency } from '@/lib/format';
import { sounds } from '@/lib/audio';
import { BarcodeCamera } from '@/components/scanner/barcode-camera';
import { CheckoutModal } from '@/components/pos/checkout-modal';
import { ReceiptModal } from '@/components/pos/receipt-modal';
import { HeldOrdersModal } from '@/components/pos/held-orders-modal';

export default function PosPage() {
  const { products, categories, adjustStock } = useProductStore();
  const {
    cart,
    customerName,
    discountTotal,
    selectedCategory,
    searchQuery,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    setCustomerName,
    setSelectedCategory,
    setSearchQuery,
    setDiscountTotal,
    loadHeldOrder,
    getCartTotals,
  } = usePosStore();

  const { addSale, holdOrder, heldOrders } = useSalesStore();

  // Modals state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [heldOrdersOpen, setHeldOrdersOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<SaleTransaction | null>(null);

  // Discount modal state
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [tempDiscount, setTempDiscount] = useState<string>('0');

  // Scanner hardware input buffer ref
  const searchInputRef = useRef<HTMLInputElement>(null);
  const barcodeBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  // Filter products by category and search
  const filteredProducts = products.filter((prod) => {
    if (!prod.is_active) return false;

    const matchesCategory =
      !selectedCategory || prod.category_id === selectedCategory;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      prod.name.toLowerCase().includes(q) ||
      prod.sku.toLowerCase().includes(q) ||
      prod.barcode.toLowerCase().includes(q) ||
      (prod.brand && prod.brand.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  // Calculate cart totals
  const totals = getCartTotals();

  // Handle hardware USB/Bluetooth barcode scanner input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept if target is a normal form input other than barcode search
      const target = e.target as HTMLElement;
      if (
        (target.tagName === 'INPUT' && target !== searchInputRef.current) ||
        target.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const now = Date.now();
      const diff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        if (barcodeBufferRef.current.length >= 3) {
          const scannedCode = barcodeBufferRef.current.trim();
          handleScannedBarcode(scannedCode);
          barcodeBufferRef.current = '';
        }
      } else if (e.key.length === 1) {
        // Hardware scanners type very fast (< 50ms per key)
        if (diff > 100) {
          barcodeBufferRef.current = e.key;
        } else {
          barcodeBufferRef.current += e.key;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products]);

  // Handle barcode scanned from camera or hardware
  function handleScannedBarcode(barcode: string) {
    const found = products.find(
      (p) =>
        p.barcode.toLowerCase() === barcode.toLowerCase() ||
        p.sku.toLowerCase() === barcode.toLowerCase()
    );

    if (found) {
      addToCart(found, 1);
      sounds.playBeep();
      setSearchQuery('');
      setCameraOpen(false);
    } else {
      sounds.playError();
      alert(`Produk dengan barcode "${barcode}" tidak ditemukan di inventaris.`);
    }
  }

  // Handle manual Enter key in search input
  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const exactMatch = products.find(
        (p) =>
          p.barcode.toLowerCase() === searchQuery.trim().toLowerCase() ||
          p.sku.toLowerCase() === searchQuery.trim().toLowerCase()
      );
      if (exactMatch) {
        addToCart(exactMatch, 1);
        sounds.playBeep();
        setSearchQuery('');
      }
    }
  }

  // Handle hold order (parkir pesanan)
  function handleHoldCurrentOrder() {
    if (cart.length === 0) return;
    const defaultName = customerName.trim()
      ? `Pesanan ${customerName.trim()}`
      : `Pesanan #${heldOrders.length + 1}`;
    holdOrder(defaultName, cart, discountTotal, customerName);
    clearCart();
    sounds.playBeep();
  }

  // Handle resume parked order
  function handleResumeOrder(order: HeldOrder) {
    loadHeldOrder(order.items, order.discount_total, order.customer_name);
    sounds.playBeep();
  }

  // Handle finalize sale
  function handleConfirmCheckout(details: {
    method: 'cash' | 'qris' | 'transfer' | 'debt';
    cashAmount?: number;
    changeAmount?: number;
    customerName?: string;
    referenceNumber?: string;
    notes?: string;
  }) {
    // 1. Record sale transaction in sales-store
    const saleItems = cart.map((item) => ({
      product_id: item.product.id,
      product_name: item.product.name,
      sku: item.product.sku,
      barcode: item.product.barcode,
      unit: item.product.unit,
      quantity: item.quantity,
      unit_price: item.price,
      purchase_price: item.product.purchase_price,
      discount: item.discount,
      subtotal: (item.price - item.discount) * item.quantity,
    }));

    const newSale = addSale({
      store_name: 'TUMSET SMART KIOS',
      cashier_name: 'Arya (Kasir)',
      customer_name: details.customerName || 'Pelanggan Umum',
      items: saleItems,
      subtotal: totals.subtotal,
      discount_total: totals.discountTotal,
      tax: 0,
      total: totals.total,
      payment_method: details.method,
      cash_amount: details.cashAmount,
      change_amount: details.changeAmount,
      reference_number: details.referenceNumber,
      notes: details.notes,
      status: 'completed',
    });

    // 2. Reduce stock for each product in product-store atomically
    for (const item of cart) {
      const currentStock = item.product.current_stock;
      const newStock = Math.max(0, currentStock - item.quantity);
      adjustStock(
        item.product.id,
        newStock,
        `Penjualan Kasir (${newSale.invoice_number})`
      );
    }

    // 3. Clear cart & open receipt
    clearCart();
    setCheckoutOpen(false);
    setCompletedSale(newSale);
    setReceiptOpen(true);
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] lg:h-screen overflow-hidden bg-background">
      {/* LEFT SECTION: PRODUCT CATALOG & SCANNER */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-border overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-border bg-card/40 backdrop-blur-sm space-y-3">
          <div className="flex items-center gap-2">
            {/* Search / Barcode Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Cari nama barang / ketik barcode [Enter]..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-9 pr-12 h-11 text-sm bg-background/80"
              />
              <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
            </div>

            {/* Camera Barcode Scanner Button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-xl border-dashed border-primary/50 text-primary hover:bg-primary/10"
              onClick={() => setCameraOpen(true)}
              title="Scan Barcode Kamera"
            >
              <Camera className="h-5 w-5" />
            </Button>

            {/* Parked Orders Button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-xl relative"
              onClick={() => setHeldOrdersOpen(true)}
              title="Transaksi Diparkir"
            >
              <Clock className="h-5 w-5 text-amber-500" />
              {heldOrders.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {heldOrders.length}
                </span>
              )}
            </Button>
          </div>

          {/* Category Pills Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            <Button
              type="button"
              size="sm"
              variant={selectedCategory === null ? 'default' : 'secondary'}
              className="rounded-full text-xs h-7 px-3 shrink-0"
              onClick={() => setSelectedCategory(null)}
            >
              Semua ({products.length})
            </Button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.category_id === cat.id).length;
              return (
                <Button
                  key={cat.id}
                  type="button"
                  size="sm"
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  className="rounded-full text-xs h-7 px-3 shrink-0 gap-1.5"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name} ({count})
                </Button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 opacity-30 mb-3" />
              <p className="text-base font-semibold">Produk tidak ditemukan</p>
              <p className="text-xs">
                Coba sesuaikan kata kunci pencarian atau ganti kategori.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map((prod) => {
                const inCartItem = cart.find((i) => i.product.id === prod.id);
                const isOutOfStock = prod.current_stock <= 0;
                const isLowStock =
                  prod.current_stock > 0 && prod.current_stock <= prod.min_stock;

                return (
                  <Card
                    key={prod.id}
                    onClick={() => {
                      if (!isOutOfStock) {
                        addToCart(prod, 1);
                        sounds.playBeep();
                      }
                    }}
                    className={`relative flex flex-col justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none group hover:shadow-md ${
                      inCartItem
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                        : 'border-border/70 hover:border-primary/50 bg-card'
                    } ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    {/* Top status */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[10px] text-muted-foreground truncate uppercase font-mono">
                        {prod.sku}
                      </span>
                      {inCartItem && (
                        <Badge className="bg-primary text-primary-foreground text-[10px] h-4 px-1.5 font-bold">
                          {inCartItem.quantity} di keranjang
                        </Badge>
                      )}
                    </div>

                    {/* Product Name */}
                    <div className="space-y-1 mb-3">
                      <h3 className="font-semibold text-xs leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                        {prod.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {prod.unit}
                      </p>
                    </div>

                    {/* Bottom Info: Price & Stock */}
                    <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">
                        {formatCurrency(prod.selling_price)}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          isOutOfStock
                            ? 'bg-destructive/10 text-destructive'
                            : isLowStock
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                            : 'text-muted-foreground'
                        }`}
                      >
                        Stok: {prod.current_stock}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: CART / REGISTER */}
      <div className="w-full lg:w-[380px] xl:w-[420px] flex flex-col bg-card/60 backdrop-blur-md border-t lg:border-t-0 shrink-0 h-auto lg:h-full">
        {/* Cart Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-card/80">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-base">Keranjang Kasir</h2>
            {totals.itemCount > 0 && (
              <Badge variant="secondary" className="text-xs font-semibold">
                {totals.itemCount} item
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            {cart.length > 0 && (
              <>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
                  onClick={handleHoldCurrentOrder}
                  title="Parkir Transaksi"
                >
                  <Pause className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={clearCart}
                  title="Kosongkan Keranjang"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Customer Name quick input */}
        <div className="px-4 py-2 border-b border-border/50 bg-muted/20">
          <Input
            placeholder="Nama Pelanggan (opsional)..."
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="h-8 text-xs bg-background/60"
          />
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin max-h-[35vh] lg:max-h-none">
          {cart.length === 0 ? (
            <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center text-muted-foreground p-6">
              <ShoppingBag className="h-10 w-10 opacity-30 mb-2" />
              <p className="text-sm font-medium">Keranjang masih kosong</p>
              <p className="text-xs">
                Klik produk di sebelah kiri atau scan barcode barang untuk menambahkan.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-3 rounded-xl border border-border/60 bg-background/80 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs leading-tight truncate">
                    {item.product.name}
                  </h4>
                  <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <span>{formatCurrency(item.price)}</span>
                    <span>×</span>
                    <span className="font-bold text-foreground">
                      {item.quantity} {item.product.unit}
                    </span>
                  </div>
                </div>

                {/* Quantity Stepper & Subtotal */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center border border-border rounded-lg overflow-hidden bg-muted/40">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 rounded-none hover:bg-muted"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-xs font-bold">
                      {item.quantity}
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 rounded-none hover:bg-muted"
                      onClick={() => {
                        if (item.quantity < item.product.current_stock) {
                          updateQuantity(item.product.id, item.quantity + 1);
                        } else {
                          sounds.playError();
                        }
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <span className="text-xs font-bold w-16 text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </span>

                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFromCart(item.product.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Totals & Checkout Panel */}
        <div className="p-4 border-t border-border bg-card/90 space-y-3">
          {/* Subtotal, Diskon, Total */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(totals.subtotal)}
              </span>
            </div>

            <div className="flex justify-between items-center text-muted-foreground">
              <button
                type="button"
                onClick={() => {
                  setTempDiscount(totals.discountTotal.toString());
                  setDiscountModalOpen(true);
                }}
                className="text-primary hover:underline flex items-center gap-1 font-medium text-xs"
              >
                <Tag className="h-3 w-3" />
                {totals.discountTotal > 0 ? 'Ubah Diskon' : '+ Tambah Diskon'}
              </button>
              {totals.discountTotal > 0 && (
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  -{formatCurrency(totals.discountTotal)}
                </span>
              )}
            </div>

            <Separator className="my-1.5" />

            <div className="flex justify-between items-baseline">
              <span className="text-sm font-bold">Total Pembayaran</span>
              <span className="text-2xl font-black text-primary tracking-tight">
                {formatCurrency(totals.total)}
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <Button
            type="button"
            size="lg"
            disabled={cart.length === 0}
            onClick={() => setCheckoutOpen(true)}
            className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center gap-2 rounded-xl"
          >
            <span>BAYAR</span>
            <span className="text-primary-foreground/70 font-normal">|</span>
            <span>{formatCurrency(totals.total)}</span>
          </Button>
        </div>
      </div>

      {/* CAMERA BARCODE SCANNER DIALOG */}
      <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Camera className="h-5 w-5 text-primary" />
              Scan Barcode Produk
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <BarcodeCamera
              active={cameraOpen}
              onScan={(code) => handleScannedBarcode(code)}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Arahkan kamera ke barcode EAN-13, EAN-8, atau Code 128 produk kemasan.
          </p>
        </DialogContent>
      </Dialog>

      {/* DISCOUNT INPUT MODAL */}
      <Dialog open={discountModalOpen} onOpenChange={setDiscountModalOpen}>
        <DialogContent className="max-w-xs p-5">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-primary" />
              Diskon Total Transaksi (Rp)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              type="number"
              min={0}
              step={500}
              value={tempDiscount}
              onChange={(e) => setTempDiscount(e.target.value)}
              className="text-lg font-bold text-right"
              autoFocus
            />
            <div className="grid grid-cols-3 gap-1.5">
              {[1000, 2000, 5000].map((amt) => (
                <Button
                  key={amt}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTempDiscount(amt.toString())}
                  className="text-xs"
                >
                  +{formatCurrency(amt)}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDiscountTotal(0);
                setDiscountModalOpen(false);
              }}
            >
              Hapus
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setDiscountTotal(Number(tempDiscount) || 0);
                setDiscountModalOpen(false);
              }}
            >
              Terapkan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* HELD ORDERS MODAL */}
      <HeldOrdersModal
        open={heldOrdersOpen}
        onClose={() => setHeldOrdersOpen(false)}
        onResumeOrder={handleResumeOrder}
      />

      {/* CHECKOUT PAYMENT MODAL */}
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        subtotal={totals.subtotal}
        discountTotal={totals.discountTotal}
        total={totals.total}
        initialCustomerName={customerName}
        onConfirmCheckout={handleConfirmCheckout}
      />

      {/* THERMAL RECEIPT MODAL */}
      <ReceiptModal
        open={receiptOpen}
        sale={completedSale}
        onClose={() => setReceiptOpen(false)}
        onNewTransaction={() => {
          setCompletedSale(null);
          setReceiptOpen(false);
        }}
      />
    </div>
  );
}
