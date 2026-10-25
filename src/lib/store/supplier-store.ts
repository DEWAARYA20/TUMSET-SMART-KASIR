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
      suppliers: [
        {
          id: 'sup-1',
          name: 'Grosir Sembako Jaya',
          contact_person: 'Haji Mansur',
          phone: '081234567890',
          address: 'Pasar Induk Blok B No. 12',
          category: 'Beras & Minyak Goreng',
          created_at: new Date().toISOString(),
        },
        {
          id: 'sup-2',
          name: 'Distributor Mayora & Indofood Cabang',
          contact_person: 'Pak Hendra',
          phone: '085298765432',
          address: 'Kawasan Industri Pergudangan',
          category: 'Makanan Ringan & Minuman',
          created_at: new Date().toISOString(),
        },
        {
          id: 'sup-3',
          name: 'Agen Rokok & Tembakau Sentosa',
          contact_person: 'Ko Jimmy',
          phone: '082111223344',
          address: 'Jl. Perdagangan No. 45',
          category: 'Rokok & Korek Api',
          created_at: new Date().toISOString(),
        },
      ],
      purchases: [
        {
          id: 'po-1',
          invoice_number: 'PO-20261020-001',
          supplier_id: 'sup-1',
          supplier_name: 'Grosir Sembako Jaya',
          total_amount: 1450000,
          payment_status: 'paid',
          date: '2026-10-20',
          items: [
            {
              product_name: 'Beras Ramos 5kg',
              quantity: 20,
              purchase_price: 68000,
              subtotal: 1360000,
            },
          ],
          created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
      ],

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
