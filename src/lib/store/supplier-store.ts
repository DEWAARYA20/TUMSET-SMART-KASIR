'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SupplierItem {
  id: string;
  name: string;
  contact_person?: string;
  phone: string;
  address?: string;
  category: string;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  invoice_number: string;
  supplier_id: string;
  supplier_name: string;
  total_amount: number;
  payment_status: 'paid' | 'pending';
  date: string;
  items: {
    product_name: string;
    quantity: number;
    purchase_price: number;
    subtotal: number;
  }[];
  created_at: string;
}

interface SupplierStoreState {
  suppliers: SupplierItem[];
  purchases: PurchaseOrder[];

  addSupplier: (supplier: Omit<SupplierItem, 'id' | 'created_at'>) => void;
  updateSupplier: (id: string, supplier: Partial<SupplierItem>) => void;
  deleteSupplier: (id: string) => void;

  addPurchase: (purchase: Omit<PurchaseOrder, 'id' | 'invoice_number' | 'created_at'>) => void;
}

export const useSupplierStore = create<SupplierStoreState>()(
  persist(
    (set, get) => ({
      suppliers: [],
      purchases: [],

      addSupplier: (data) => {
        const newSupplier: SupplierItem = {
          ...data,
          id: `sup-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        set((state) => ({ suppliers: [newSupplier, ...state.suppliers] }));
      },

      updateSupplier: (id, data) => {
        set((state) => ({
          suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...data } : s)),
        }));
      },

      deleteSupplier: (id) => {
        set((state) => ({
          suppliers: state.suppliers.filter((s) => s.id !== id),
        }));
      },

      addPurchase: (data) => {
        const invoice_number = `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
        const newPo: PurchaseOrder = {
          ...data,
          id: `po-${Date.now()}`,
          invoice_number,
          created_at: new Date().toISOString(),
        };
        set((state) => ({ purchases: [newPo, ...state.purchases] }));
      },
    }),
    {
      name: 'tumset-supplier-storage',
    }
  )
);
