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
('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Grosir Berkah Jaya', 'Haji Mahmud', '08111222333', 'Komp. Pasar Terong, Makassar'),
('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Distributor Indofood Makassar', 'Pak Surya', '08122334455', 'Kawasan Industri KIMA, Makassar')
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO public.products (
    id, store_id, category_id, name, sku, barcode, brand, unit, purchase_price, selling_price, current_stock, min_stock
) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Beras Ramos 5kg', 'BRS-001', '8999999100011', 'Ramos', 'sak', 68000, 75000, 24, 5),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Minyak Goreng Bimoli 1L', 'MYK-001', '8999999100028', 'Bimoli', 'pouch', 18500, 21000, 48, 10),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Gula Pasir Gulaku 1kg', 'GLA-001', '8999999100035', 'Gulaku', 'bks', 15000, 17500, 30, 8),
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Telur Ayam Ras 1 Rak (30 btr)', 'TLR-001', '8999999100042', 'Lokal', 'rak', 48000, 55000, 15, 3),

('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Indomie Goreng Spesial', 'IDM-001', '089686010115', 'Indofood', 'bks', 2900, 3500, 120, 20),
('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Indomie Ayam Bawang', 'IDM-002', '089686010122', 'Indofood', 'bks', 2900, 3500, 85, 20),
('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Chitato Sapi Panggang 68g', 'SNK-001', '8992775111018', 'Indofood', 'bks', 9500, 12000, 25, 5),

('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Aqua Botol 600ml', 'MNM-001', '8886008101053', 'Danone Aqua', 'btl', 3200, 4500, 72, 12),
('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Teh Pucuk Harum 350ml', 'MNM-002', '8997022890013', 'Mayora', 'btl', 3300, 4500, 48, 10),
('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Kopi Kapal Api Spesial Mix 1 Renceng', 'MNM-003', '8991001100012', 'Kapal Api', 'rcg', 12500, 15000, 18, 5)
ON CONFLICT (id) DO NOTHING;

-- Expense Categories
INSERT INTO public.expense_categories (id, store_id, name, description) VALUES
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Listrik & Air (PLN & PDAM)', 'Biaya operasional utilitas'),
('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Kantong Plastik & Kertas Struk', 'Perlengkapan bungkus dan struk'),
('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Gaji Karyawan', 'Upah kasir atau penjaga toko'),
('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Lain-lain', 'Pengeluaran tak terduga')
ON CONFLICT (id) DO NOTHING;
