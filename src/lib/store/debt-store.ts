'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DebtPayment {
  id: string;
  amount: number;
  payment_method: 'cash' | 'transfer';
  date: string;
  notes?: string;
}

export interface CustomerDebt {
  id: string;
  customer_name: string;
  customer_phone?: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  due_date?: string;
  invoice_number?: string;
  items_summary?: string;
  status: 'unpaid' | 'partial' | 'paid';
  payments: DebtPayment[];
  created_at: string;
}

interface DebtStoreState {
  debts: CustomerDebt[];

  addDebt: (debt: Omit<CustomerDebt, 'id' | 'paid_amount' | 'remaining_amount' | 'status' | 'payments' | 'created_at'>) => void;
  recordPayment: (debtId: string, payment: { amount: number; payment_method: 'cash' | 'transfer'; notes?: string }) => void;
  deleteDebt: (id: string) => void;
  getTotalOutstandingDebt: () => number;
}

export const useDebtStore = create<DebtStoreState>()(
  persist(
    (set, get) => ({
      debts: [
        {
          id: 'debt-1',
          customer_name: 'Ibu Ratna (Tetangga Depan)',
          customer_phone: '081298765432',
          total_amount: 145000,
          paid_amount: 50000,
          remaining_amount: 95000,
          due_date: '2026-10-30',
          items_summary: 'Beras Ramos 5kg, Telur Ayam 1 Rak',
          status: 'partial',
          payments: [
            {
              id: 'pay-1',
              amount: 50000,
              payment_method: 'cash',
              date: new Date(Date.now() - 86400000).toISOString(),
              notes: 'Cicilan pertama',
            },
          ],
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
          id: 'debt-2',
          customer_name: 'Pak RT Bambang',
          customer_phone: '085211223344',
          total_amount: 85000,
          paid_amount: 0,
          remaining_amount: 85000,
          due_date: '2026-11-01',
          items_summary: 'Minyak Goreng Bimoli 2L, Gula Pasir 2kg',
          status: 'unpaid',
          payments: [],
          created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        },
      ],

      addDebt: (data) => {
        const newDebt: CustomerDebt = {
          ...data,
          id: `debt-${Date.now()}`,
          paid_amount: 0,
          remaining_amount: data.total_amount,
          status: 'unpaid',
          payments: [],
          created_at: new Date().toISOString(),
        };

        set((state) => ({ debts: [newDebt, ...state.debts] }));
      },

      recordPayment: (debtId, paymentData) => {
        set((state) => {
          const updatedDebts = state.debts.map((d) => {
            if (d.id !== debtId) return d;

            const newPaid = d.paid_amount + paymentData.amount;
            const newRemaining = Math.max(0, d.total_amount - newPaid);
            const newStatus: CustomerDebt['status'] =
              newRemaining <= 0 ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';

            const newPaymentRecord: DebtPayment = {
              id: `pay-${Date.now()}`,
              amount: paymentData.amount,
              payment_method: paymentData.payment_method,
              date: new Date().toISOString(),
              notes: paymentData.notes,
            };

            return {
              ...d,
              paid_amount: newPaid,
              remaining_amount: newRemaining,
              status: newStatus,
              payments: [newPaymentRecord, ...d.payments],
            };
          });

          return { debts: updatedDebts };
        });
      },

      deleteDebt: (id) => {
        set((state) => ({ debts: state.debts.filter((d) => d.id !== id) }));
      },

      getTotalOutstandingDebt: () => {
        return get()
          .debts.filter((d) => d.status !== 'paid')
          .reduce((sum, d) => sum + d.remaining_amount, 0);
      },
    }),
    {
      name: 'tumset-debt-storage',
    }
  )
);
