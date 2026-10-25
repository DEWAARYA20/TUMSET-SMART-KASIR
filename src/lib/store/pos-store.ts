'use client';

import { create } from 'zustand';
import { ProductItem } from './product-store';
import { CartItem } from './sales-store';

interface PosStoreState {
  cart: CartItem[];
  customerName: string;
  orderNotes: string;
  selectedCategory: string | null;
  searchQuery: string;
  discountTotal: number;

  // Actions
  addToCart: (product: ProductItem, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemPrice: (productId: string, newPrice: number) => void;
  updateItemDiscount: (productId: string, discount: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setCustomerName: (name: string) => void;
  setOrderNotes: (notes: string) => void;
  setSelectedCategory: (catId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setDiscountTotal: (discount: number) => void;
  loadHeldOrder: (items: CartItem[], discountTotal?: number, customerName?: string) => void;

  // Computed helper
  getCartTotals: () => {
    itemCount: number;
    subtotal: number;
    discountTotal: number;
    total: number;
  };
}

export const usePosStore = create<PosStoreState>((set, get) => ({
  cart: [],
  customerName: '',
  orderNotes: '',
  selectedCategory: null,
  searchQuery: '',
  discountTotal: 0,

  addToCart: (product, quantity = 1) => {
    const { cart } = get();
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        quantity: updatedCart[existingIndex].quantity + quantity,
      };
      set({ cart: updatedCart });
    } else {
      const newItem: CartItem = {
        product,
        quantity,
        price: product.selling_price,
        discount: 0,
      };
      set({ cart: [newItem, ...cart] });
    }
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }

    set((state) => ({
      cart: state.cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    }));
  },

  updateItemPrice: (productId, newPrice) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item.product.id === productId ? { ...item, price: Math.max(0, newPrice) } : item
      ),
    }));
  },

  updateItemDiscount: (productId, discount) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item.product.id === productId ? { ...item, discount: Math.max(0, discount) } : item
      ),
    }));
  },

  removeFromCart: (productId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    }));
  },

  clearCart: () => {
    set({
      cart: [],
      customerName: '',
      orderNotes: '',
      discountTotal: 0,
    });
  },

  setCustomerName: (name) => set({ customerName: name }),
  setOrderNotes: (notes) => set({ orderNotes: notes }),
  setSelectedCategory: (catId) => set({ selectedCategory: catId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setDiscountTotal: (discount) => set({ discountTotal: Math.max(0, discount) }),

  loadHeldOrder: (items, discountTotal = 0, customerName = '') => {
    set({
      cart: items,
      discountTotal,
      customerName,
    });
  },

  getCartTotals: () => {
    const { cart, discountTotal } = get();
    let itemCount = 0;
    let subtotal = 0;

    for (const item of cart) {
      itemCount += item.quantity;
      const itemSubtotal = (item.price - item.discount) * item.quantity;
      subtotal += Math.max(0, itemSubtotal);
    }

    const total = Math.max(0, subtotal - discountTotal);

    return {
      itemCount,
      subtotal,
      discountTotal,
      total,
    };
  },
}));
