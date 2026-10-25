export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type StoreRole = 'owner' | 'supervisor' | 'cashier';
export type PaymentMethod = 'cash' | 'transfer' | 'qris' | 'split';
export type SaleStatus = 'completed' | 'cancelled' | 'refunded';
export type MovementType = 'sale' | 'purchase' | 'adjustment' | 'return' | 'initial';

export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          phone: string | null;
          email: string | null;
          logo_url: string | null;
          currency: string;
          currency_symbol: string;
          timezone: string;
          receipt_header: string | null;
          receipt_footer: string | null;
          tax_percentage: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          logo_url?: string | null;
          currency?: string;
          currency_symbol?: string;
          timezone?: string;
          receipt_header?: string | null;
          receipt_footer?: string | null;
          tax_percentage?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['stores']['Insert']>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      store_members: {
        Row: {
          id: string;
          store_id: string;
          user_id: string;
          role: StoreRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          user_id: string;
          role: StoreRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['store_members']['Insert']>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          slug: string | null;
          description: string | null;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          slug?: string | null;
          description?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          store_id: string;
          category_id: string | null;
          name: string;
          sku: string | null;
          barcode: string | null;
          brand: string | null;
          unit: string;
          purchase_price: number;
          selling_price: number;
          current_stock: number;
          min_stock: number;
          image_url: string | null;
          expiry_date: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          category_id?: string | null;
          name: string;
          sku?: string | null;
          barcode?: string | null;
          brand?: string | null;
          unit?: string;
          purchase_price: number;
          selling_price: number;
          current_stock?: number;
          min_stock?: number;
          image_url?: string | null;
          expiry_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
        Relationships: [];
      };
      product_barcodes: {
        Row: {
          id: string;
          store_id: string;
          product_id: string;
          barcode: string;
          barcode_type: string;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          product_id: string;
          barcode: string;
          barcode_type?: string;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['product_barcodes']['Insert']>;
        Relationships: [];
      };
      suppliers: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          contact_person: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['suppliers']['Insert']>;
        Relationships: [];
      };
      purchases: {
        Row: {
          id: string;
          store_id: string;
          supplier_id: string | null;
          invoice_number: string;
          purchase_date: string;
          total_amount: number;
          payment_status: 'paid' | 'unpaid' | 'partial';
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          supplier_id?: string | null;
          invoice_number: string;
          purchase_date?: string;
          total_amount: number;
          payment_status?: 'paid' | 'unpaid' | 'partial';
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['purchases']['Insert']>;
        Relationships: [];
      };
      purchase_items: {
        Row: {
          id: string;
          purchase_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
          expiry_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          purchase_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
          expiry_date?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['purchase_items']['Insert']>;
        Relationships: [];
      };
      inventory_movements: {
        Row: {
          id: string;
          store_id: string;
          product_id: string;
          movement_type: MovementType;
          quantity_change: number;
          previous_stock: number;
          new_stock: number;
          reference_id: string | null;
          reference_type: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          product_id: string;
          movement_type: MovementType;
          quantity_change: number;
          previous_stock: number;
          new_stock: number;
          reference_id?: string | null;
          reference_type?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['inventory_movements']['Insert']>;
        Relationships: [];
      };
      sales: {
        Row: {
          id: string;
          store_id: string;
          invoice_number: string;
          cashier_id: string | null;
          customer_name: string;
          subtotal: number;
          discount_amount: number;
          tax_amount: number;
          total_amount: number;
          total_cost: number;
          payment_method: PaymentMethod;
          cash_received: number;
          change_amount: number;
          status: SaleStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          invoice_number: string;
          cashier_id?: string | null;
          customer_name?: string;
          subtotal: number;
          discount_amount?: number;
          tax_amount?: number;
          total_amount: number;
          total_cost?: number;
          payment_method?: PaymentMethod;
          cash_received?: number;
          change_amount?: number;
          status?: SaleStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sales']['Insert']>;
        Relationships: [];
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          product_id: string;
          product_name: string;
          sku: string | null;
          barcode: string | null;
          quantity: number;
          unit_price: number;
          cost_price: number;
          subtotal: number;
          discount_amount: number;
          total_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          product_id: string;
          product_name: string;
          sku?: string | null;
          barcode?: string | null;
          quantity: number;
          unit_price: number;
          cost_price?: number;
          subtotal: number;
          discount_amount?: number;
          total_amount: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sale_items']['Insert']>;
        Relationships: [];
      };
      sale_payments: {
        Row: {
          id: string;
          sale_id: string;
          payment_method: string;
          amount: number;
          reference_code: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          payment_method: string;
          amount: number;
          reference_code?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sale_payments']['Insert']>;
        Relationships: [];
      };
      receipts: {
        Row: {
          id: string;
          store_id: string;
          sale_id: string;
          receipt_number: string;
          receipt_data: Json;
          printed_at: string;
          reprint_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          sale_id: string;
          receipt_number: string;
          receipt_data: Json;
          printed_at?: string;
          reprint_count?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['receipts']['Insert']>;
        Relationships: [];
      };
      expense_categories: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['expense_categories']['Insert']>;
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          store_id: string;
          category_id: string | null;
          amount: number;
          expense_date: string;
          description: string;
          receipt_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          category_id?: string | null;
          amount: number;
          expense_date?: string;
          description: string;
          receipt_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>;
        Relationships: [];
      };
      returns: {
        Row: {
          id: string;
          store_id: string;
          sale_id: string;
          return_number: string;
          return_date: string;
          refund_amount: number;
          reason: string;
          status: string;
          processed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          sale_id: string;
          return_number: string;
          return_date?: string;
          refund_amount: number;
          reason: string;
          status?: string;
          processed_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['returns']['Insert']>;
        Relationships: [];
      };
      return_items: {
        Row: {
          id: string;
          return_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
          restock: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          return_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
          restock?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['return_items']['Insert']>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          store_id: string | null;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id?: string | null;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          details?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
        Relationships: [];
      };
      ai_insights: {
        Row: {
          id: string;
          store_id: string;
          prompt: string;
          response: string;
          insight_type: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          prompt: string;
          response: string;
          insight_type?: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['ai_insights']['Insert']>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      process_pos_checkout: {
        Args: {
          p_store_id: string;
          p_cashier_id: string | null;
          p_customer_name: string;
          p_invoice_number: string;
          p_subtotal: number;
          p_discount_amount: number;
          p_tax_amount: number;
          p_total_amount: number;
          p_payment_method: string;
          p_cash_received: number;
          p_change_amount: number;
          p_items: Json;
          p_payments?: Json;
        };
        Returns: Json;
      };
      adjust_product_stock: {
        Args: {
          p_store_id: string;
          p_product_id: string;
          p_new_stock: number;
          p_reason: string;
          p_user_id: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
