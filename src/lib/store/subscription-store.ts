'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  SubscriptionPlan,
  UserSubscription,
  PaymentOrder,
  SubscriptionStatus,
  PaymentMethod,
  OFFICIAL_PLANS,
  SubscriptionHistoryItem,
} from '@/types/subscription';

interface SubscriptionStoreState {
  plans: SubscriptionPlan[];
  subscription: UserSubscription | null;
  orders: PaymentOrder[];
  history: SubscriptionHistoryItem[];

  // User Actions
  createPaymentOrder: (
    planCode: string,
    paymentMethod: PaymentMethod,
    userId?: string,
    storeId?: string
  ) => PaymentOrder;
  submitManualTransferProof: (orderId: string, proofImageUrl: string) => void;
  activateSubscriptionFromOrder: (orderId: string) => UserSubscription;
  checkSubscriptionStatus: () => {
    isSubscribed: boolean;
    status: SubscriptionStatus;
    daysRemaining: number;
    expiresAt: string | null;
    isExpiringSoon: boolean; // <= 7 days
  };

  // Admin Actions
  adminApproveTransfer: (orderId: string) => void;
  adminRejectTransfer: (orderId: string, reason: string) => void;
  adminTogglePlan: (planCode: string) => void;
  getAllOrders: () => PaymentOrder[];
  resetToDefaults: () => void;
}

export const useSubscriptionStore = create<SubscriptionStoreState>()(
  persist(
    (set, get) => ({
      plans: OFFICIAL_PLANS,
      subscription: null,
      orders: [],
      history: [],

      createPaymentOrder: (planCode, paymentMethod, userId = 'user-demo-01', storeId = 'store-demo-01') => {
        const plan = get().plans.find((p) => p.code === planCode) || OFFICIAL_PLANS[0];
        
        // Strict server validation: price MUST match official price
        const verifiedPrice = plan.price_idr;
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const order_number = `INV-SUB-${dateStr}-${randomSuffix}`;
        const orderId = `ord-${Date.now()}`;
        const expires_at = new Date(Date.now() + 86400000).toISOString(); // 24 hours expiry

        let va_number: string | undefined;
        let qr_string: string | undefined;

        if (paymentMethod === 'va_bca') va_number = `88001${Date.now().toString().slice(-8)}`;
        if (paymentMethod === 'va_bri') va_number = `12800${Date.now().toString().slice(-8)}`;
        if (paymentMethod === 'va_bsi') va_number = `99001${Date.now().toString().slice(-8)}`;
        if (paymentMethod === 'qris') qr_string = `00020101021226680016ID.CO.QRIS.WWW0118936009990000000001520454115303360540${verifiedPrice}5802ID5917TUMSET SMART KIOS6008MAKASSAR6304`;

        const newOrder: PaymentOrder = {
          id: orderId,
          order_number,
          user_id: userId,
          store_id: storeId,
          plan_id: plan.id,
          plan_name: plan.name,
          amount_idr: verifiedPrice,
          currency: 'IDR',
          payment_method: paymentMethod,
          provider: paymentMethod === 'manual_transfer' ? 'manual' : 'payment_gateway',
          provider_order_id: `PG-${Date.now()}`,
          va_number,
          qr_string,
          status: 'pending',
          expires_at,
          created_at: now.toISOString(),
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        return newOrder;
      },

      submitManualTransferProof: (orderId, proofImageUrl) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  proof_image_url: proofImageUrl,
                  status: 'pending_verification' as const,
                }
              : o
          ),
        }));
      },

      activateSubscriptionFromOrder: (orderId) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) throw new Error('Order not found');

        const plan = get().plans.find((p) => p.id === order.plan_id) || OFFICIAL_PLANS[0];
        const currentSub = get().subscription;
        const now = new Date();

        let starts_at: string;
        let expires_at_date: Date;
        let action: 'activated' | 'renewed';
        const prevStatus = currentSub?.status || 'none';

        if (currentSub && currentSub.status === 'active' && new Date(currentSub.expires_at) > now) {
          // Extension
          starts_at = currentSub.starts_at;
          const currentExpiry = new Date(currentSub.expires_at);
          currentExpiry.setMonth(currentExpiry.getMonth() + plan.duration_months);
          expires_at_date = currentExpiry;
          action = 'renewed';
        } else {
          // New activation
          starts_at = now.toISOString();
          expires_at_date = new Date(now);
          expires_at_date.setMonth(expires_at_date.getMonth() + plan.duration_months);
          action = 'activated';
        }

        const expires_at = expires_at_date.toISOString();

        const updatedSub: UserSubscription = {
          id: currentSub?.id || `sub-${Date.now()}`,
          user_id: order.user_id,
          store_id: order.store_id,
          plan_id: plan.id,
          plan,
          status: 'active',
          starts_at,
          expires_at,
          auto_renew: false,
          created_at: currentSub?.created_at || now.toISOString(),
          updated_at: now.toISOString(),
        };

        const updatedOrders = get().orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: 'paid' as const,
                paid_at: now.toISOString(),
              }
            : o
        );

        const newHistoryItem: SubscriptionHistoryItem = {
          id: `hist-${Date.now()}`,
          subscription_id: updatedSub.id,
          payment_order_id: order.id,
          action,
          previous_status: prevStatus,
          new_status: 'active',
          starts_at,
          expires_at,
          notes: `Langganan ${plan.name} (${order.payment_method})`,
          created_at: now.toISOString(),
        };

        set({
          subscription: updatedSub,
          orders: updatedOrders,
          history: [newHistoryItem, ...get().history],
        });

        return updatedSub;
      },

      checkSubscriptionStatus: () => {
        const sub = get().subscription;
        if (!sub) {
          return {
            isSubscribed: false,
            status: 'inactive' as SubscriptionStatus,
            daysRemaining: 0,
            expiresAt: null,
            isExpiringSoon: false,
          };
        }
        if (sub.status !== 'active') {
          return {
            isSubscribed: false,
            status: (sub.status as SubscriptionStatus) || 'inactive',
            daysRemaining: 0,
            expiresAt: sub.expires_at || null,
            isExpiringSoon: false,
          };
        }

        const now = new Date().getTime();
        const expiry = new Date(sub.expires_at).getTime();
        const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
          // Automatically mark expired
          set((state) => ({
            subscription: state.subscription ? { ...state.subscription, status: 'expired' } : null,
          }));
          return {
            isSubscribed: false,
            status: 'expired',
            daysRemaining: 0,
            expiresAt: sub.expires_at,
            isExpiringSoon: false,
          };
        }

        return {
          isSubscribed: true,
          status: 'active',
          daysRemaining: diffDays,
          expiresAt: sub.expires_at,
          isExpiringSoon: diffDays <= 7,
        };
      },

      adminApproveTransfer: (orderId) => {
        get().activateSubscriptionFromOrder(orderId);
      },

      adminRejectTransfer: (orderId, reason) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: 'failed' as const,
                  rejection_reason: reason,
                }
              : o
          ),
        }));
      },

      adminTogglePlan: (planCode) => {
        set((state) => ({
          plans: state.plans.map((p) =>
            p.code === planCode ? { ...p, is_active: !p.is_active } : p
          ),
        }));
      },

      getAllOrders: () => get().orders,

      resetToDefaults: () => {
        set({
          plans: OFFICIAL_PLANS,
          subscription: null,
          orders: [],
          history: [],
        });
      },
    }),
    {
      name: 'tumset-subscription-storage',
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Partial<SubscriptionStoreState>;
        if (version < 2 || state?.subscription?.id === 'sub-active-demo') {
          return {
            plans: OFFICIAL_PLANS,
            subscription: null,
            orders: [],
            history: [],
          };
        }
        return state;
      },
    }
  )
);
