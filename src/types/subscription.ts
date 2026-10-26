/**
 * TUMSET SMART KIOS - Subscription & Billing Type Definitions
 */

export type SubscriptionStatus =
  | 'inactive'
  | 'pending'
  | 'active'
  | 'expired'
  | 'canceled'
  | 'past_due'
  | 'suspended';

export type PaymentMethod =
  | 'qris'
  | 'gopay'
  | 'dana'
  | 'va_bca'
  | 'va_bri'
  | 'va_bsi'
  | 'manual_transfer';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'pending_verification'
  | 'refunded';

export interface SubscriptionPlan {
  id: string;
  code: 'monthly' | '3_months' | '6_months' | '9_months' | 'yearly';
  name: string;
  duration_months: number;
  price_idr: number;
  effective_price_monthly: number;
  badge_label?: string;
  features: string[];
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  store_id?: string;
  plan_id: string;
  plan?: SubscriptionPlan;
  status: SubscriptionStatus;
  starts_at: string;
  expires_at: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentOrder {
  id: string;
  order_number: string;
  user_id: string;
  store_id?: string;
  plan_id: string;
  plan_name: string;
  amount_idr: number;
  currency: string;
  payment_method: PaymentMethod;
  provider: string;
  provider_order_id?: string;
  payment_url?: string;
  qr_string?: string;
  va_number?: string;
  proof_image_url?: string;
  rejection_reason?: string;
  status: PaymentStatus;
  paid_at?: string;
  expires_at: string;
  created_at: string;
}

export interface PaymentEvent {
  id: string;
  payment_order_id: string;
  provider_event_id?: string;
  event_type: string;
  payload: Record<string, unknown>;
  verification_status: string;
  processed_at: string;
  created_at: string;
}

export interface SubscriptionHistoryItem {
  id: string;
  subscription_id: string;
  payment_order_id?: string;
  action: 'activated' | 'renewed' | 'expired' | 'canceled' | 'suspended';
  previous_status: string;
  new_status: SubscriptionStatus;
  starts_at?: string;
  expires_at?: string;
  notes?: string;
  created_at: string;
}

export const OFFICIAL_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-monthly',
    code: 'monthly',
    name: 'Paket Bulanan',
    duration_months: 1,
    price_idr: 45000,
    effective_price_monthly: 45000,
    features: [
      'Akses Penuh Kasir POS',
      'Scan Barcode Kamera & USB',
      'Manajemen Stok & Opname',
      'Buku Kas Bon Warga',
      'Laporan Laba Rugi Dasar',
      'Offline PWA Caching Support',
    ],
    is_active: true,
  },
  {
    id: 'plan-3months',
    code: '3_months',
    name: 'Paket 3 Bulan',
    duration_months: 3,
    price_idr: 120000,
    effective_price_monthly: 40000,
    badge_label: 'Hemat 11%',
    features: [
      'Semua Fitur Paket Bulanan',
      'Prioritas Dukungan Teknis',
      'Ekspor Laporan Penjualan ke CSV',
      'Dukungan Multi-Perangkat Kasir',
    ],
    is_active: true,
  },
  {
    id: 'plan-6months',
    code: '6_months',
    name: 'Paket 6 Bulan',
    duration_months: 6,
    price_idr: 250000,
    effective_price_monthly: 41667,
    badge_label: 'Populer',
    features: [
      'Semua Fitur Paket 3 Bulan',
      'Kios AI Assistant Cerdas',
      'Cetak Struk Bluetooth Langsung (ESC/POS)',
      'Backup Data Toko Otomatis',
    ],
    is_active: true,
  },
  {
    id: 'plan-9months',
    code: '9_months',
    name: 'Paket 9 Bulan',
    duration_months: 9,
    price_idr: 385000,
    effective_price_monthly: 42778,
    features: [
      'Semua Fitur Paket 6 Bulan',
      'Analisis Margin Profit Tingkat Lanjut',
      'Peringatan Stok & Kedaluwarsa Otomatis',
    ],
    is_active: true,
  },
  {
    id: 'plan-yearly',
    code: 'yearly',
    name: 'Paket Tahunan (12 Bulan)',
    duration_months: 12,
    price_idr: 500000,
    effective_price_monthly: 41667,
    badge_label: 'Paling Hemat',
    features: [
      'Semua Fitur Premium Lengkap',
      'Dukungan Prioritas VIP 24/7',
      'Bebas Biaya Pembaruan Sistem Masa Depan',
      'Konsultasi Bisnis Kios AI Tak Terbatas',
    ],
    is_active: true,
  },
];
