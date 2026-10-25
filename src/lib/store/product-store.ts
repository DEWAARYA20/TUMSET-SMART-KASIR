'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CategoryItem {
  id: string;
  store_id?: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
}

export interface ProductItem {
  id: string;
  store_id?: string;
  category_id: string | null;
  name: string;
  sku: string;
  barcode: string;
  brand: string;
  unit: string;
  purchase_price: number;
  selling_price: number;
  current_stock: number;
  min_stock: number;
  image_url?: string;
  expiry_date?: string;
  is_active: boolean;
  created_at?: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  product_name: string;
  movement_type: 'sale' | 'purchase' | 'adjustment' | 'return' | 'initial';
  quantity_change: number;
  previous_stock: number;
  new_stock: number;
  notes: string;
  created_at: string;
}

interface ProductStoreState {
  categories: CategoryItem[];
  products: ProductItem[];
  movements: StockMovement[];
  
  // Categories Actions
  addCategory: (cat: Omit<CategoryItem, 'id' | 'slug'>) => void;
  updateCategory: (id: string, cat: Partial<CategoryItem>) => void;
  deleteCategory: (id: string) => void;

  // Products Actions
  addProduct: (prod: Omit<ProductItem, 'id'>) => ProductItem;
  addBatchProducts: (newProducts: Omit<ProductItem, 'id'>[]) => number;
  updateProduct: (id: string, prod: Partial<ProductItem>) => void;
  deleteProduct: (id: string) => void;
  
  // Stock Actions
  adjustStock: (productId: string, newStock: number, reason: string) => void;
  
  // Lookups
  getProductByBarcode: (barcode: string) => ProductItem | undefined;
  getProductById: (id: string) => ProductItem | undefined;
  
  // Reset to default seed
  resetToDefaults: () => void;
}

export const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', name: 'Sembako & Bahan Pokok', slug: 'sembako', color: '#10b981', description: 'Beras, minyak, gula, telur' },
  { id: 'cat-2', name: 'Makanan Instan & Snack', slug: 'makanan-instan', color: '#f59e0b', description: 'Mie instan, biskuit, keripik' },
  { id: 'cat-3', name: 'Minuman Dingin & Hangat', slug: 'minuman', color: '#3b82f6', description: 'Air mineral, kopi, teh, susu' },
  { id: 'cat-4', name: 'Perlengkapan Rumah & Mandi', slug: 'kebersihan', color: '#8b5cf6', description: 'Sabun, deterjen, sampo' },
  { id: 'cat-5', name: 'Rokok & Tembakau', slug: 'rokok', color: '#ef4444', description: 'Rokok eceran dan bungkusan' },
];

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
    category_id: 'cat-1',
    name: 'Beras Ramos 5kg',
    sku: 'BRS-001',
    barcode: '8999999100011',
    brand: 'Ramos',
    unit: 'sak',
    purchase_price: 68000,
    selling_price: 75000,
    current_stock: 24,
    min_stock: 5,
    is_active: true,
  },
  {
    id: 'prod-2',
    category_id: 'cat-1',
    name: 'Minyak Goreng Bimoli 1L',
    sku: 'MYK-001',
    barcode: '8999999100028',
    brand: 'Bimoli',
    unit: 'pouch',
    purchase_price: 18500,
    selling_price: 21000,
    current_stock: 48,
    min_stock: 10,
    is_active: true,
  },
  {
    id: 'prod-3',
    category_id: 'cat-1',
    name: 'Gula Pasir Gulaku 1kg',
    sku: 'GLA-001',
    barcode: '8999999100035',
    brand: 'Gulaku',
    unit: 'bks',
    purchase_price: 15000,
    selling_price: 17500,
    current_stock: 30,
    min_stock: 8,
    is_active: true,
  },
  {
    id: 'prod-4',
    category_id: 'cat-1',
    name: 'Telur Ayam Ras 1 Rak (30 btr)',
    sku: 'TLR-001',
    barcode: '8999999100042',
    brand: 'Lokal',
    unit: 'rak',
    purchase_price: 48000,
    selling_price: 55000,
    current_stock: 15,
    min_stock: 4,
    is_active: true,
  },
  {
    id: 'prod-5',
    category_id: 'cat-2',
    name: 'Indomie Goreng Spesial',
    sku: 'IDM-001',
    barcode: '089686010115',
    brand: 'Indofood',
    unit: 'bks',
    purchase_price: 2900,
    selling_price: 3500,
    current_stock: 120,
    min_stock: 20,
    is_active: true,
  },
  {
    id: 'prod-6',
    category_id: 'cat-2',
    name: 'Indomie Ayam Bawang',
    sku: 'IDM-002',
    barcode: '089686010122',
    brand: 'Indofood',
    unit: 'bks',
    purchase_price: 2900,
    selling_price: 3500,
    current_stock: 85,
    min_stock: 20,
    is_active: true,
  },
  {
    id: 'prod-7',
    category_id: 'cat-2',
    name: 'Chitato Sapi Panggang 68g',
    sku: 'SNK-001',
    barcode: '8992775111018',
    brand: 'Indofood',
    unit: 'bks',
    purchase_price: 9500,
    selling_price: 12000,
    current_stock: 4, // deliberately low to demo low stock warning!
    min_stock: 6,
    is_active: true,
  },
  {
    id: 'prod-8',
    category_id: 'cat-3',
    name: 'Aqua Botol 600ml',
    sku: 'MNM-001',
    barcode: '8886008101053',
    brand: 'Danone Aqua',
    unit: 'btl',
    purchase_price: 3200,
    selling_price: 4500,
    current_stock: 72,
    min_stock: 12,
    is_active: true,
  },
  {
    id: 'prod-9',
    category_id: 'cat-3',
    name: 'Teh Pucuk Harum 350ml',
    sku: 'MNM-002',
    barcode: '8997022890013',
    brand: 'Mayora',
    unit: 'btl',
    purchase_price: 3300,
    selling_price: 4500,
    current_stock: 48,
    min_stock: 10,
    is_active: true,
  },
  {
    id: 'prod-10',
    category_id: 'cat-3',
    name: 'Kopi Kapal Api Spesial Mix 1 Renceng',
    sku: 'MNM-003',
    barcode: '8991001100012',
    brand: 'Kapal Api',
    unit: 'rcg',
    purchase_price: 12500,
    selling_price: 15000,
    current_stock: 2, // low stock demo
    min_stock: 5,
    is_active: true,
  },
];

export const useProductStore = create<ProductStoreState>()(
  persist(
    (set, get) => ({
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      movements: [
        {
          id: 'mov-1',
          product_id: 'prod-1',
          product_name: 'Beras Ramos 5kg',
          movement_type: 'initial',
          quantity_change: 24,
          previous_stock: 0,
          new_stock: 24,
          notes: 'Saldo stok awal toko',
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
      ],

      addCategory: (cat) => {
        const id = 'cat-' + Date.now();
        const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        set((state) => ({
          categories: [...state.categories, { ...cat, id, slug }],
        }));
      },

      updateCategory: (id, cat) => {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...cat } : c)),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          // Set unassigned for products in this category
          products: state.products.map((p) => (p.category_id === id ? { ...p, category_id: null } : p)),
        }));
      },

      addProduct: (prod) => {
        const id = 'prod-' + Date.now();
        const newProduct: ProductItem = {
          ...prod,
          id,
          created_at: new Date().toISOString(),
        };

        const initialMovement: StockMovement = {
          id: 'mov-' + Date.now(),
          product_id: id,
          product_name: prod.name,
          movement_type: 'initial',
          quantity_change: prod.current_stock,
          previous_stock: 0,
          new_stock: prod.current_stock,
          notes: 'Pendaftaran produk baru',
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          products: [newProduct, ...state.products],
          movements: [initialMovement, ...state.movements],
        }));

        return newProduct;
      },

      addBatchProducts: (newProducts) => {
        if (!newProducts || newProducts.length === 0) return 0;
        const now = new Date().toISOString();
        const createdProducts: ProductItem[] = [];
        const createdMovements: StockMovement[] = [];

        newProducts.forEach((prod, idx) => {
          const id = 'prod-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substring(2, 6);
          const fullProduct: ProductItem = {
            ...prod,
            id,
            created_at: prod.created_at || now,
          };
          createdProducts.push(fullProduct);

          if (prod.current_stock > 0) {
            createdMovements.push({
              id: 'mov-' + Date.now() + '-' + idx,
              product_id: id,
              product_name: prod.name,
              movement_type: 'initial',
              quantity_change: prod.current_stock,
              previous_stock: 0,
              new_stock: prod.current_stock,
              notes: 'Impor produk massal via CSV',
              created_at: now,
            });
          }
        });

        set((state) => ({
          products: [...createdProducts, ...state.products],
          movements: [...createdMovements, ...state.movements],
        }));

        return createdProducts.length;
      },

      updateProduct: (id, prod) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...prod } : p)),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      adjustStock: (productId, newStock, reason) => {
        const product = get().products.find((p) => p.id === productId);
        if (!product) return;

        const prev = product.current_stock;
        const diff = newStock - prev;

        const movement: StockMovement = {
          id: 'mov-' + Date.now(),
          product_id: productId,
          product_name: product.name,
          movement_type: 'adjustment',
          quantity_change: diff,
          previous_stock: prev,
          new_stock: newStock,
          notes: reason,
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, current_stock: newStock } : p
          ),
          movements: [movement, ...state.movements],
        }));
      },

      getProductByBarcode: (barcode) => {
        const clean = barcode.trim();
        return get().products.find((p) => p.barcode === clean && p.is_active);
      },

      getProductById: (id) => {
        return get().products.find((p) => p.id === id);
      },

      resetToDefaults: () => {
        set({
          categories: INITIAL_CATEGORIES,
          products: INITIAL_PRODUCTS,
        });
      },
    }),
    {
      name: 'tumset-products-storage',
    }
  )
);
