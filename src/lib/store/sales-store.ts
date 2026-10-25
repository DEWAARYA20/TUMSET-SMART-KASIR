'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductItem } from './product-store';

export interface CartItem {
  product: ProductItem;
  quantity: number;
  price: number; // selling price at time of sale
  discount: number; // discount per item or percentage
  notes?: string;
}

export interface SaleTransaction {
  id: string;
  invoice_number: string;
  store_name: string;
  cashier_name: string;
  customer_name?: string;
  items: {
    product_id: string;
    product_name: string;
    sku: string;
    barcode: string;
    unit: string;
    quantity: number;
    unit_price: number;
    purchase_price: number;
    discount: number;
    subtotal: number;
  }[];
  subtotal: number;
  discount_total: number;
  tax: number;
  total: number;
  payment_method: 'cash' | 'qris' | 'transfer' | 'debt';
  cash_amount?: number;
  change_amount?: number;
  reference_number?: string;
  notes?: string;
  status: 'completed' | 'cancelled' | 'refunded';
  created_at: string;
}

export interface HeldOrder {
  id: string;
  order_name: string;
  customer_name?: string;
  items: CartItem[];
  discount_total: number;
  notes?: string;
  created_at: string;
}

interface SalesStoreState {
  sales: SaleTransaction[];
  heldOrders: HeldOrder[];

  // Actions
  addSale: (sale: Omit<SaleTransaction, 'id' | 'invoice_number' | 'created_at'>) => SaleTransaction;
  holdOrder: (name: string, items: CartItem[], discountTotal?: number, customerName?: string) => void;
  resumeOrder: (id: string) => HeldOrder | undefined;
  removeHeldOrder: (id: string) => void;
  getSaleById: (id: string) => SaleTransaction | undefined;
  getRecentSales: (limit?: number) => SaleTransaction[];
  getTodaySalesSummary: () => {
    totalRevenue: number;
    totalProfit: number;
    transactionCount: number;
    itemsSoldCount: number;
  };
}

export const useSalesStore = create<SalesStoreState>()(
  persist(
    (set, get) => ({
      sales: [],
      heldOrders: [],

      addSale: (saleData) => {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const invoice_number = `TRX-${dateStr}-${randomNum}`;
        const id = `trx-${Date.now()}`;

        const newSale: SaleTransaction = {
          ...saleData,
          id,
          invoice_number,
          created_at: now.toISOString(),
        };

        set((state) => ({
          sales: [newSale, ...state.sales],
        }));

        return newSale;
      },

      holdOrder: (name, items, discountTotal = 0, customerName = '') => {
        const newOrder: HeldOrder = {
          id: `held-${Date.now()}`,
          order_name: name || `Pesanan #${get().heldOrders.length + 1}`,
          customer_name: customerName,
          items,
          discount_total: discountTotal,
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          heldOrders: [newOrder, ...state.heldOrders],
        }));
      },

      resumeOrder: (id) => {
        const order = get().heldOrders.find((o) => o.id === id);
        if (order) {
          get().removeHeldOrder(id);
        }
        return order;
      },

      removeHeldOrder: (id) => {
        set((state) => ({
          heldOrders: state.heldOrders.filter((o) => o.id !== id),
        }));
      },

      getSaleById: (id) => {
        return get().sales.find((s) => s.id === id || s.invoice_number === id);
      },

      getRecentSales: (limit = 10) => {
        return get().sales.slice(0, limit);
      },

      getTodaySalesSummary: () => {
        const todayStr = new Date().toISOString().slice(0, 10);
        const todaySales = get().sales.filter(
          (s) => s.created_at.slice(0, 10) === todayStr && s.status === 'completed'
        );

        let totalRevenue = 0;
        let totalCost = 0;
        let itemsSoldCount = 0;

        for (const sale of todaySales) {
          totalRevenue += sale.total;
          for (const item of sale.items) {
            itemsSoldCount += item.quantity;
            totalCost += item.purchase_price * item.quantity;
          }
        }

        return {
          totalRevenue,
          totalProfit: totalRevenue - totalCost,
          transactionCount: todaySales.length,
          itemsSoldCount,
        };
      },
    }),
    {
      name: 'tumset-sales-storage',
    }
  )
);
