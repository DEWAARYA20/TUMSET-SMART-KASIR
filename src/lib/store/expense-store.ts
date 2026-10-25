'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ExpenseItem {
  id: string;
  category: string;
  amount: number;
  description: string;
  payment_method: 'cash' | 'transfer';
  recipient?: string;
  date: string;
  created_at: string;
}

interface ExpenseStoreState {
  expenses: ExpenseItem[];
  categories: string[];
  addExpense: (expense: Omit<ExpenseItem, 'id' | 'created_at'>) => void;
  deleteExpense: (id: string) => void;
  getTodayExpensesTotal: () => number;
  getThisMonthExpensesTotal: () => number;
}

export const useExpenseStore = create<ExpenseStoreState>()(
  persist(
    (set, get) => ({
      categories: [
        'Listrik & Air (PLN/PDAM)',
        'Sewa Tempat / Kios',
        'Transportasi & Bensin Kulakan',
        'Konsumsi & Makan Karyawan',
        'Kantong Plastik / Kresek & Kemasan',
        'Perawatan & Perbaikan Toko',
        'Lain-lain',
      ],
      expenses: [
        {
          id: 'exp-1',
          category: 'Kantong Plastik / Kresek & Kemasan',
          amount: 35000,
          description: 'Beli kresek hitam dan bening 3 pak',
          payment_method: 'cash',
          date: new Date().toISOString().slice(0, 10),
          created_at: new Date().toISOString(),
        },
        {
          id: 'exp-2',
          category: 'Listrik & Air (PLN/PDAM)',
          amount: 150000,
          description: 'Token listrik kios 1300VA',
          payment_method: 'transfer',
          date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
      ],

      addExpense: (data) => {
        const newExpense: ExpenseItem = {
          ...data,
          id: `exp-${Date.now()}`,
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          expenses: [newExpense, ...state.expenses],
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }));
      },

      getTodayExpensesTotal: () => {
        const today = new Date().toISOString().slice(0, 10);
        return get()
          .expenses.filter((e) => e.date === today)
          .reduce((sum, e) => sum + e.amount, 0);
      },

      getThisMonthExpensesTotal: () => {
        const monthPrefix = new Date().toISOString().slice(0, 7);
        return get()
          .expenses.filter((e) => e.date.startsWith(monthPrefix))
          .reduce((sum, e) => sum + e.amount, 0);
      },
    }),
    {
      name: 'tumset-expense-storage',
    }
  )
);
