'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ReturnItem {
  id: string;
  return_number: string;
  return_type: 'customer' | 'supplier';
  product_name: string;
  quantity: number;
  unit: string;
  refund_amount: number;
  reason: 'damaged' | 'expired' | 'wrong_item' | 'other';
  notes?: string;
  created_at: string;
}

interface ReturnStoreState {
  returns: ReturnItem[];
  addReturn: (item: Omit<ReturnItem, 'id' | 'return_number' | 'created_at'>) => void;
  deleteReturn: (id: string) => void;
}

export const useReturnStore = create<ReturnStoreState>()(
  persist(
    (set, get) => ({
      returns: [],

      addReturn: (data) => {
        const return_number = `RET-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
        const newReturn: ReturnItem = {
          ...data,
          id: `ret-${Date.now()}`,
          return_number,
          created_at: new Date().toISOString(),
        };
        set((state) => ({ returns: [newReturn, ...state.returns] }));
      },

      deleteReturn: (id) => {
        set((state) => ({ returns: state.returns.filter((r) => r.id !== id) }));
      },
    }),
    {
      name: 'tumset-return-storage',
    }
  )
);
