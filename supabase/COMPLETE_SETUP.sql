-- ============================================================================
-- TUMSET SMART KIOS - POSTGRESQL SCHEMA MIGRATION
-- Multi-store POS with Role-Based Access Control, Real-Time Inventory, and RLS
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. STORES & PROFILES & MEMBERSHIP
-- ============================================================================

-- Stores table
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    logo_url TEXT,
    currency VARCHAR(10) DEFAULT 'IDR',
    currency_symbol VARCHAR(10) DEFAULT 'Rp',
    timezone VARCHAR(50) DEFAULT 'Asia/Makassar',
    receipt_header TEXT,
    receipt_footer TEXT DEFAULT 'Terima kasih atas kunjungan Anda!',
    tax_percentage NUMERIC(5, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store Members (junction table for Multi-store and RBAC)
-- Roles: 'owner', 'supervisor', 'cashier'
CREATE TABLE IF NOT EXISTS public.store_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'supervisor', 'cashier')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, user_id)
);

-- ============================================================================
-- 2. CATEGORIES & PRODUCTS & BARCODES
-- ============================================================================

-- Product Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120),
    description TEXT,
    color VARCHAR(30) DEFAULT '#3b82f6',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, name)
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    brand VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'pcs',
    purchase_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    current_stock NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    min_stock NUMERIC(12, 2) NOT NULL DEFAULT 5.00,
    image_url TEXT,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Secondary / alternative barcodes for products (e.g. bundle packs, carton vs unit)
CREATE TABLE IF NOT EXISTS public.product_barcodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    barcode VARCHAR(100) NOT NULL,
    barcode_type VARCHAR(50) DEFAULT 'EAN-13',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, barcode)
);

-- ============================================================================
-- 3. SUPPLIERS & PURCHASES & INVENTORY MOVEMENTS
-- ============================================================================

-- Suppliers
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchases (Stok Masuk / Pembelian)
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100) NOT NULL,
    purchase_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(50) DEFAULT 'paid' CHECK (payment_status IN ('paid', 'unpaid', 'partial')),
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase Items
CREATE TABLE IF NOT EXISTS public.purchase_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Movements (Ledger of all stock changes)
-- Types: 'sale', 'purchase', 'adjustment', 'return', 'initial'
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('sale', 'purchase', 'adjustment', 'return', 'initial')),
    quantity_change NUMERIC(12, 2) NOT NULL,
    previous_stock NUMERIC(12, 2) NOT NULL,
    new_stock NUMERIC(12, 2) NOT NULL,
    reference_id UUID,
    reference_type VARCHAR(50),
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. SALES, ITEMS, PAYMENTS & RECEIPTS
-- ============================================================================

-- Sales Transactions
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL,
    cashier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) DEFAULT 'Pelanggan Umum',
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00, -- snapshot HPP for gross profit calculation
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'transfer', 'qris', 'split')),
    cash_received NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    change_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled', 'refunded')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, invoice_number)
);

-- Sale Items (Snapshot of products sold)
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    cost_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sale Payments (Supports split payment)
CREATE TABLE IF NOT EXISTS public.sale_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'transfer', 'qris')),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    reference_code VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receipts table (Digital and Printed Receipts history)
CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    receipt_number VARCHAR(100) NOT NULL,
    receipt_data JSONB NOT NULL,
    printed_at TIMESTAMPTZ DEFAULT NOW(),
    reprint_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. EXPENSES & EXPENSE CATEGORIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, name)
);

CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    receipt_url TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. RETURNS & REFUNDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    return_number VARCHAR(100) NOT NULL,
    return_date TIMESTAMPTZ DEFAULT NOW(),
    refund_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
    processed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, return_number)
);

CREATE TABLE IF NOT EXISTS public.return_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id UUID NOT NULL REFERENCES public.returns(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    restock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. AUDIT LOGS & AI INSIGHTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    insight_type VARCHAR(50) DEFAULT 'general' CHECK (insight_type IN ('general', 'forecast', 'restock_advice', 'financial_summary')),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. INDEXES FOR HIGH-SPEED LOOKUPS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_product_barcodes_lookup ON public.product_barcodes(store_id, barcode);

CREATE INDEX IF NOT EXISTS idx_sales_store_date ON public.sales(store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_invoice ON public.sales(invoice_number);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON public.sale_items(product_id);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_store_prod ON public.inventory_movements(store_id, product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_store_date ON public.expenses(store_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_store ON public.audit_logs(store_id, created_at DESC);

-- ============================================================================
-- 9. ATOMIC DATABASE FUNCTIONS
-- ============================================================================

-- Function 1: Atomic Checkout Transaction
-- Validates stock, calculates totals, inserts sale + items + payments, updates inventory and writes movements
CREATE OR REPLACE FUNCTION public.process_pos_checkout(
    p_store_id UUID,
    p_cashier_id UUID,
    p_customer_name VARCHAR(255),
    p_invoice_number VARCHAR(100),
    p_subtotal NUMERIC(15, 2),
    p_discount_amount NUMERIC(15, 2),
    p_tax_amount NUMERIC(15, 2),
    p_total_amount NUMERIC(15, 2),
    p_payment_method VARCHAR(50),
    p_cash_received NUMERIC(15, 2),
    p_change_amount NUMERIC(15, 2),
    p_items JSONB, -- Array of [{product_id, quantity, unit_price, cost_price, subtotal, discount, total}]
    p_payments JSONB DEFAULT '[]'::JSONB -- Array of [{payment_method, amount, reference_code}]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sale_id UUID;
    v_item JSONB;
    v_prod_id UUID;
    v_qty NUMERIC(12, 2);
    v_unit_price NUMERIC(15, 2);
    v_cost_price NUMERIC(15, 2);
    v_prod_name VARCHAR(255);
    v_prod_sku VARCHAR(100);
    v_prod_barcode VARCHAR(100);
    v_cur_stock NUMERIC(12, 2);
    v_new_stock NUMERIC(12, 2);
    v_total_cost NUMERIC(15, 2) := 0.00;
    v_payment JSONB;
BEGIN
    -- 1. Create Sale Header
    INSERT INTO public.sales (
        store_id,
        invoice_number,
        cashier_id,
        customer_name,
        subtotal,
        discount_amount,
        tax_amount,
        total_amount,
        total_cost,
        payment_method,
        cash_received,
        change_amount,
        status
    ) VALUES (
        p_store_id,
        p_invoice_number,
        p_cashier_id,
        COALESCE(p_customer_name, 'Pelanggan Umum'),
        p_subtotal,
        p_discount_amount,
        p_tax_amount,
        p_total_amount,
        0.00, -- will update after items iteration
        p_payment_method,
        p_cash_received,
        p_change_amount,
        'completed'
    ) RETURNING id INTO v_sale_id;

    -- 2. Process Items and update inventory
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_prod_id := (v_item->>'product_id')::UUID;
        v_qty := (v_item->>'quantity')::NUMERIC;
        v_unit_price := (v_item->>'unit_price')::NUMERIC;

        -- Lock product row for atomic update
        SELECT name, sku, barcode, purchase_price, current_stock
        INTO v_prod_name, v_prod_sku, v_prod_barcode, v_cost_price, v_cur_stock
        FROM public.products
        WHERE id = v_prod_id AND store_id = p_store_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Produk dengan ID % tidak ditemukan pada toko ini.', v_prod_id;
        END IF;

        -- Deduct stock
        v_new_stock := v_cur_stock - v_qty;
        UPDATE public.products
        SET current_stock = v_new_stock,
            updated_at = NOW()
        WHERE id = v_prod_id;

        -- Calculate total cost
        v_total_cost := v_total_cost + (v_cost_price * v_qty);

        -- Insert Sale Item
        INSERT INTO public.sale_items (
            sale_id,
            product_id,
            product_name,
            sku,
            barcode,
            quantity,
            unit_price,
            cost_price,
            subtotal,
            discount_amount,
            total_amount
        ) VALUES (
            v_sale_id,
            v_prod_id,
            v_prod_name,
            v_prod_sku,
            v_prod_barcode,
            v_qty,
            v_unit_price,
            v_cost_price,
            COALESCE((v_item->>'subtotal')::NUMERIC, v_unit_price * v_qty),
            COALESCE((v_item->>'discount')::NUMERIC, 0.00),
            COALESCE((v_item->>'total')::NUMERIC, v_unit_price * v_qty)
        );

        -- Record inventory movement
        INSERT INTO public.inventory_movements (
            store_id,
            product_id,
            movement_type,
            quantity_change,
            previous_stock,
            new_stock,
            reference_id,
            reference_type,
            notes,
            created_by
        ) VALUES (
            p_store_id,
            v_prod_id,
            'sale',
            -v_qty,
            v_cur_stock,
            v_new_stock,
            v_sale_id,
            'sales',
            'Penjualan Kasir ' || p_invoice_number,
            p_cashier_id
        );
    END LOOP;

    -- Update total cost on sale
    UPDATE public.sales
    SET total_cost = v_total_cost
    WHERE id = v_sale_id;

    -- 3. Record Payments
    IF jsonb_array_length(p_payments) > 0 THEN
        FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments)
        LOOP
            INSERT INTO public.sale_payments (
                sale_id,
                payment_method,
                amount,
                reference_code
            ) VALUES (
                v_sale_id,
                v_payment->>'payment_method',
                (v_payment->>'amount')::NUMERIC,
                v_payment->>'reference_code'
            );
        END LOOP;
    ELSE
        INSERT INTO public.sale_payments (
            sale_id,
            payment_method,
            amount
        ) VALUES (
            v_sale_id,
            p_payment_method,
            p_total_amount
        );
    END IF;

    -- 4. Audit Log
    INSERT INTO public.audit_logs (
        store_id,
        user_id,
        action,
        entity_type,
        entity_id,
        details
    ) VALUES (
        p_store_id,
        p_cashier_id,
        'create_sale',
        'sales',
        v_sale_id::TEXT,
        jsonb_build_object(
            'invoice_number', p_invoice_number,
            'total_amount', p_total_amount,
            'items_count', jsonb_array_length(p_items)
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'sale_id', v_sale_id,
        'invoice_number', p_invoice_number
    );
END;
$$;

-- Function 2: Stock Adjustment with Audit
CREATE OR REPLACE FUNCTION public.adjust_product_stock(
    p_store_id UUID,
    p_product_id UUID,
    p_new_stock NUMERIC(12, 2),
    p_reason TEXT,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_stock NUMERIC(12, 2);
    v_diff NUMERIC(12, 2);
BEGIN
    SELECT current_stock INTO v_old_stock
    FROM public.products
    WHERE id = p_product_id AND store_id = p_store_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Produk tidak ditemukan.';
    END IF;

    v_diff := p_new_stock - v_old_stock;

    UPDATE public.products
    SET current_stock = p_new_stock,
        updated_at = NOW()
    WHERE id = p_product_id;

    INSERT INTO public.inventory_movements (
        store_id,
        product_id,
        movement_type,
        quantity_change,
        previous_stock,
        new_stock,
        notes,
        created_by
    ) VALUES (
        p_store_id,
        p_product_id,
        'adjustment',
        v_diff,
        v_old_stock,
        p_new_stock,
        p_reason,
        p_user_id
    );

    RETURN jsonb_build_object(
        'success', true,
        'product_id', p_product_id,
        'previous_stock', v_old_stock,
        'new_stock', p_new_stock
    );
END;
$$;

-- Function 3: New User Auto-Profile Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_barcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current auth user is member of a store
CREATE OR REPLACE FUNCTION public.is_member_of(p_store_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.store_members
        WHERE store_id = p_store_id
          AND user_id = auth.uid()
          AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Anyone can view their own profile, update their own
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Stores: Members can view their store
CREATE POLICY "Store members can view store" ON public.stores
    FOR SELECT USING (public.is_member_of(id));

CREATE POLICY "Store owners can update store" ON public.stores
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.store_members
            WHERE store_id = public.stores.id
              AND user_id = auth.uid()
              AND role = 'owner'
        )
    );

-- Store Members
CREATE POLICY "Store members can view co-members" ON public.store_members
    FOR SELECT USING (public.is_member_of(store_id));

-- Products, Categories, Barcodes: Store members can access
CREATE POLICY "Store members can view categories" ON public.categories
    FOR ALL USING (public.is_member_of(store_id));

CREATE POLICY "Store members can view products" ON public.products
    FOR ALL USING (public.is_member_of(store_id));

CREATE POLICY "Store members can view barcodes" ON public.product_barcodes
    FOR ALL USING (public.is_member_of(store_id));

-- Sales, Sale Items, Payments
CREATE POLICY "Store members can access sales" ON public.sales
    FOR ALL USING (public.is_member_of(store_id));

CREATE POLICY "Store members can access sale items" ON public.sale_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.sales
            WHERE sales.id = sale_items.sale_id
              AND public.is_member_of(sales.store_id)
        )
    );

CREATE POLICY "Store members can access payments" ON public.sale_payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.sales
            WHERE sales.id = sale_payments.sale_id
              AND public.is_member_of(sales.store_id)
        )
    );

-- Purchases, Suppliers, Inventory Movements, Expenses, Returns, Receipts, Logs
CREATE POLICY "Store members can access suppliers" ON public.suppliers
    FOR ALL USING (public.is_member_of(store_id));

CREATE POLICY "Store members can access purchases" ON public.purchases
    FOR ALL USING (public.is_member_of(store_id));

CREATE POLICY "Store members can access purchase items" ON public.purchase_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.purchases
            WHERE purchases.id = purchase_items.purchase_id
              AND public.is_member_of(purchases.store_id)
        )
    );

CREATE POLICY "Store members can access inventory movements" ON public.inventory_movements
    FOR ALL USING (public.is_member_of(store_id));

CREATE POLICY "Store members can access expenses" ON public.expenses
    FOR ALL USING (public.is_member_of(store_id));

CREATE POLICY "Store members can access expense categories" ON public.expense_categories
    FOR ALL USING (public.is_member_of(store_id));

CREATE POLICY "Store members can access returns" ON public.returns
    FOR ALL USING (public.is_member_of(store_id));

CREATE POLICY "Store members can access receipts" ON public.receipts
    FOR ALL USING (public.is_member_of(store_id));

CREATE POLICY "Store members can access audit logs" ON public.audit_logs
    FOR ALL USING (public.is_member_of(store_id));

CREATE POLICY "Store members can access AI insights" ON public.ai_insights
    FOR ALL USING (public.is_member_of(store_id));
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
-- ============================================================================
-- TUMSET SMART KIOS - SEED DATA
-- Default sample store, categories, products, and initial configuration
-- ============================================================================

-- Store Demo
INSERT INTO public.stores (
    id,
    name,
    address,
    phone,
    currency,
    currency_symbol,
    timezone,
    receipt_header,
    receipt_footer,
    tax_percentage
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Kios Tumset Berkah',
    'Jl. Toddopuli Raya No. 45, Makassar',
    '081234567890',
    'IDR',
    'Rp',
    'Asia/Makassar',
    'KIOS TUMSET BERKAH\nJl. Toddopuli Raya No. 45\nTelp: 081234567890',
    'Barang yang sudah dibeli tidak dapat ditukar/dikembalikan kecuali ada perjanjian.',
    0.00
) ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO public.categories (id, store_id, name, slug, color) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Sembako & Bahan Pokok', 'sembako', '#10b981'),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Makanan Instan & Snack', 'makanan-instan', '#f59e0b'),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Minuman Dingin & Hangat', 'minuman', '#3b82f6'),
('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Perlengkapan Mandi & Cuci', 'kebersihan', '#8b5cf6'),
('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Rokok & Tembakau', 'rokok', '#ef4444')
ON CONFLICT (id) DO NOTHING;

-- Suppliers
INSERT INTO public.suppliers (id, store_id, name, contact_person, phone, address) VALUES
('s0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Grosir Berkah Jaya', 'Haji Mahmud', '08111222333', 'Komp. Pasar Terong, Makassar'),
('s0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Distributor Indofood Makassar', 'Pak Surya', '08122334455', 'Kawasan Industri KIMA, Makassar')
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO public.products (
    id, store_id, category_id, name, sku, barcode, brand, unit, purchase_price, selling_price, current_stock, min_stock
) VALUES
('p0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Beras Ramos 5kg', 'BRS-001', '8999999100011', 'Ramos', 'sak', 68000, 75000, 24, 5),
('p0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Minyak Goreng Bimoli 1L', 'MYK-001', '8999999100028', 'Bimoli', 'pouch', 18500, 21000, 48, 10),
('p0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Gula Pasir Gulaku 1kg', 'GLA-001', '8999999100035', 'Gulaku', 'bks', 15000, 17500, 30, 8),
('p0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Telur Ayam Ras 1 Rak (30 btr)', 'TLR-001', '8999999100042', 'Lokal', 'rak', 48000, 55000, 15, 3),

('p0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Indomie Goreng Spesial', 'IDM-001', '089686010115', 'Indofood', 'bks', 2900, 3500, 120, 20),
('p0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Indomie Ayam Bawang', 'IDM-002', '089686010122', 'Indofood', 'bks', 2900, 3500, 85, 20),
('p0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Chitato Sapi Panggang 68g', 'SNK-001', '8992775111018', 'Indofood', 'bks', 9500, 12000, 25, 5),

('p0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Aqua Botol 600ml', 'MNM-001', '8886008101053', 'Danone Aqua', 'btl', 3200, 4500, 72, 12),
('p0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Teh Pucuk Harum 350ml', 'MNM-002', '8997022890013', 'Mayora', 'btl', 3300, 4500, 48, 10),
('p0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Kopi Kapal Api Spesial Mix 1 Renceng', 'MNM-003', '8991001100012', 'Kapal Api', 'rcg', 12500, 15000, 18, 5)
ON CONFLICT (id) DO NOTHING;

-- Expense Categories
INSERT INTO public.expense_categories (id, store_id, name, description) VALUES
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Listrik & Air (PLN & PDAM)', 'Biaya operasional utilitas'),
('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Kantong Plastik & Kertas Struk', 'Perlengkapan bungkus dan struk'),
('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Gaji Karyawan', 'Upah kasir atau penjaga toko'),
('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Lain-lain', 'Pengeluaran tak terduga')
ON CONFLICT (id) DO NOTHING;
