-- ==============================================================================
-- TUMSET SMART KIOS — Subscription Billing & Payment Gateway Migration
-- Migration: 20261025000001_subscriptions_billing.sql
-- ==============================================================================

-- 1. SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    duration_months INT NOT NULL CHECK (duration_months > 0),
    price_idr BIGINT NOT NULL CHECK (price_idr >= 0),
    effective_price_monthly BIGINT NOT NULL,
    badge_label VARCHAR(50),
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed Official Subscription Plans
INSERT INTO public.subscription_plans (code, name, duration_months, price_idr, effective_price_monthly, badge_label, features)
VALUES 
    ('monthly', 'Bulanan', 1, 45000, 45000, NULL, '["Akses Penuh Kasir POS", "Scan Barcode Kamera & USB", "Manajemen Stok & Opname", "Buku Kas Bon Warga", "Laporan Laba Rugi Dasar", "Offline PWA Support"]'::jsonb),
    ('3_months', '3 Bulan', 3, 120000, 40000, 'Hemat 11%', '["Semua Fitur Paket Bulanan", "Prioritas Dukungan Teknis", "Ekspor Laporan ke CSV", "Multi-Perangkat Kasir"]'::jsonb),
    ('6_months', '6 Bulan', 6, 250000, 41667, 'Populer', '["Semua Fitur Paket 3 Bulan", "Fitur Kios AI Assistant Cerdas", "Cetak Struk Bluetooth ESC/POS", "Backup Data Otomatis"]'::jsonb),
    ('9_months', '9 Bulan', 9, 385000, 42778, NULL, '["Semua Fitur Paket 6 Bulan", "Analisis Margin Profit Tingkat Lanjut", "Manajemen Multi-Kasir"]'::jsonb),
    ('yearly', 'Tahunan (12 Bulan)', 12, 500000, 41667, 'Paling Hemat', '["Semua Fitur Premium Kios", "Dukungan Prioritas 24/7", "Bebas Biaya Pembaruan Sistem", "Konsultasi Bisnis Kios AI Tak Terbatas"]'::jsonb)
ON CONFLICT (code) DO UPDATE SET
    price_idr = EXCLUDED.price_idr,
    effective_price_monthly = EXCLUDED.effective_price_monthly,
    badge_label = EXCLUDED.badge_label;

-- 2. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    status VARCHAR(30) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'active', 'expired', 'canceled', 'past_due', 'suspended')),
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    auto_renew BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON public.subscriptions(expires_at);

-- 3. PAYMENT ORDERS
CREATE TABLE IF NOT EXISTS public.payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    amount_idr BIGINT NOT NULL CHECK (amount_idr > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
    payment_method VARCHAR(50) NOT NULL 
        CHECK (payment_method IN ('qris', 'gopay', 'dana', 'va_bca', 'va_bri', 'va_bsi', 'manual_transfer')),
    provider VARCHAR(50) NOT NULL DEFAULT 'mock_gateway',
    provider_order_id VARCHAR(150),
    payment_url TEXT,
    qr_string TEXT,
    va_number VARCHAR(100),
    proof_image_url TEXT,
    rejection_reason TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'pending_verification', 'refunded')),
    paid_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON public.payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_number ON public.payment_orders(order_number);

-- 4. PAYMENT WEBHOOK EVENTS (Audit & Replay Prevention)
CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_order_id UUID REFERENCES public.payment_orders(id) ON DELETE SET NULL,
    provider_event_id VARCHAR(150) UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'verified',
    processed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payment_events_order ON public.payment_events(payment_order_id);

-- 5. SUBSCRIPTION HISTORY AUDIT
CREATE TABLE IF NOT EXISTS public.subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    payment_order_id UUID REFERENCES public.payment_orders(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'activated', 'renewed', 'expired', 'canceled', 'suspended'
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_subscription_history_sub ON public.subscription_history(subscription_id);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

-- Plans: Read-only for all authenticated & public
CREATE POLICY "Anyone can view active subscription plans"
    ON public.subscription_plans FOR SELECT
    USING (is_active = true);

-- Subscriptions: User can view their own subscription
CREATE POLICY "Users can view their own subscription"
    ON public.subscriptions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Payment Orders: User can view their own orders
CREATE POLICY "Users can view their own payment orders"
    ON public.payment_orders FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Payment Orders: User can create their own order
CREATE POLICY "Users can insert their own payment orders"
    ON public.payment_orders FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Subscription History: User can view their own history
CREATE POLICY "Users can view their own subscription history"
    ON public.subscription_history FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.subscriptions s
            WHERE s.id = subscription_id AND s.user_id = auth.uid()
        )
    );

-- 7. FUNCTION: ACTIVATE OR RENEW SUBSCRIPTION (ATOMIC SERVER-SIDE LOGIC)
CREATE OR REPLACE FUNCTION public.activate_subscription(
    p_payment_order_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order public.payment_orders%ROWTYPE;
    v_plan public.subscription_plans%ROWTYPE;
    v_sub public.subscriptions%ROWTYPE;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
    v_new_starts_at TIMESTAMPTZ;
    v_new_expires_at TIMESTAMPTZ;
    v_action VARCHAR(50);
    v_prev_status VARCHAR(30);
BEGIN
    -- Fetch order
    SELECT * INTO v_order FROM public.payment_orders WHERE id = p_payment_order_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Order not found');
    END IF;

    -- Fetch plan
    SELECT * INTO v_plan FROM public.subscription_plans WHERE id = v_order.plan_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Plan not found');
    END IF;

    -- Check if user already has a subscription
    SELECT * INTO v_sub FROM public.subscriptions WHERE user_id = v_order.user_id FOR UPDATE;

    IF FOUND THEN
        v_prev_status := v_sub.status;
        -- If still active and not expired, extend expiration date
        IF v_sub.status = 'active' AND v_sub.expires_at > v_now THEN
            v_new_starts_at := v_sub.starts_at;
            v_new_expires_at := v_sub.expires_at + (v_plan.duration_months || ' months')::interval;
            v_action := 'renewed';
        ELSE
            -- Expired or new activation
            v_new_starts_at := v_now;
            v_new_expires_at := v_now + (v_plan.duration_months || ' months')::interval;
            v_action := 'activated';
        END IF;

        -- Update existing subscription
        UPDATE public.subscriptions
        SET plan_id = v_plan.id,
            status = 'active',
            starts_at = v_new_starts_at,
            expires_at = v_new_expires_at,
            updated_at = v_now
        WHERE id = v_sub.id;
    ELSE
        -- Create first subscription
        v_prev_status := 'none';
        v_new_starts_at := v_now;
        v_new_expires_at := v_now + (v_plan.duration_months || ' months')::interval;
        v_action := 'activated';

        INSERT INTO public.subscriptions (
            user_id, store_id, plan_id, status, starts_at, expires_at
        ) VALUES (
            v_order.user_id, v_order.store_id, v_plan.id, 'active', v_new_starts_at, v_new_expires_at
        ) RETURNING * INTO v_sub;
    END IF;

    -- Update order to paid
    UPDATE public.payment_orders
    SET status = 'paid',
        paid_at = v_now,
        updated_at = v_now
    WHERE id = v_order.id;

    -- Record subscription history audit
    INSERT INTO public.subscription_history (
        subscription_id, payment_order_id, action, previous_status, new_status, starts_at, expires_at
    ) VALUES (
        v_sub.id, v_order.id, v_action, v_prev_status, 'active', v_new_starts_at, v_new_expires_at
    );

    RETURN jsonb_build_object(
        'success', true,
        'subscription_id', v_sub.id,
        'status', 'active',
        'starts_at', v_new_starts_at,
        'expires_at', v_new_expires_at
    );
END;
$$;
