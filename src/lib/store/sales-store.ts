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
      sales: [
        {
          id: 'trx-mock-01',
          invoice_number: 'TRX-20261024-0001',
          store_name: 'Kios Berkah Barokah',
          cashier_name: 'Arya (Kasir)',
          customer_name: 'Pelanggan Umum',
          items: [
            {
              product_id: 'prod-1',
              product_name: 'Beras Ramos 5kg',
              sku: 'BRS-001',
              barcode: '8999999100011',
              unit: 'sak',
              quantity: 1,
              unit_price: 75000,
              purchase_price: 68000,
              discount: 0,
              subtotal: 75000,
            },
            {
              product_id: 'prod-2',
              product_name: 'Minyak Goreng Bimoli 1L',
              sku: 'MYK-001',
              barcode: '8999999100028',
              unit: 'pouch',
              quantity: 2,
              unit_price: 21000,
              purchase_price: 18500,
              discount: 0,
              subtotal: 42000,
            },
          ],
          subtotal: 117000,
          discount_total: 0,
          tax: 0,
          total: 117000,
          payment_method: 'cash',
          cash_amount: 120000,
          change_amount: 3000,
          status: 'completed',
          created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
        {
          id: 'trx-mock-02',
          invoice_number: 'TRX-20261024-0002',
          store_name: 'Kios Berkah Barokah',
          cashier_name: 'Arya (Kasir)',
          customer_name: 'Ibu Fatimah',
          items: [
            {
              product_id: 'prod-5',
              product_name: 'Indomie Goreng Spesial',
              sku: 'IDM-001',
              barcode: '089686010115',
              unit: 'bks',
              quantity: 10,
              unit_price: 3500,
              purchase_price: 2900,
              discount: 0,
              subtotal: 35000,
            },
            {
              product_id: 'prod-8',
              product_name: 'Aqua Botol 600ml',
              sku: 'MNM-001',
              barcode: '8886008101053',
              unit: 'btl',
              quantity: 3,
              unit_price: 4500,
              purchase_price: 3200,
              discount: 0,
              subtotal: 13500,
            },
          ],
          subtotal: 48500,
          discount_total: 0,
          tax: 0,
          total: 48500,
          payment_method: 'qris',
          reference_number: 'QRIS-89912039401',
          status: 'completed',
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ],
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
