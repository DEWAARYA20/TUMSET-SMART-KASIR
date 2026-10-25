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
