export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export type AppRole = "customer" | "admin";
export type ContactStatus = "new" | "in_progress" | "resolved" | "spam";

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        { id: string; display_name: string; role: AppRole; created_at: string; updated_at: string },
        { id: string; display_name?: string; role?: AppRole; created_at?: string; updated_at?: string },
        { display_name?: string; role?: AppRole; updated_at?: string }
      >;
      categories: Table<
        { id: string; name: string; slug: string; description: string; image_url: string | null; is_active: boolean; sort_order: number; created_at: string; updated_at: string },
        { id?: string; name: string; slug: string; description?: string; image_url?: string | null; is_active?: boolean; sort_order?: number; created_at?: string; updated_at?: string },
        { name?: string; slug?: string; description?: string; image_url?: string | null; is_active?: boolean; sort_order?: number; updated_at?: string }
      >;
      products: Table<
        { id: string; category_id: string | null; name: string; slug: string; description: string; price_paise: number; compare_at_price_paise: number | null; stock_count: number; stock: number; reserved_stock: number; low_stock_threshold: number; sku: string | null; image_url: string | null; image_path: string | null; material: string; size: string; badge: string | null; is_active: boolean; is_featured: boolean; created_at: string; updated_at: string },
        { id?: string; category_id?: string | null; name: string; slug: string; description?: string; price_paise: number; compare_at_price_paise?: number | null; stock_count?: number; stock?: number; reserved_stock?: number; low_stock_threshold?: number; sku?: string | null; image_url?: string | null; image_path?: string | null; material?: string; size?: string; badge?: string | null; is_active?: boolean; is_featured?: boolean; created_at?: string; updated_at?: string },
        { category_id?: string | null; name?: string; slug?: string; description?: string; price_paise?: number; compare_at_price_paise?: number | null; stock_count?: number; stock?: number; reserved_stock?: number; low_stock_threshold?: number; sku?: string | null; image_url?: string | null; image_path?: string | null; material?: string; size?: string; badge?: string | null; is_active?: boolean; is_featured?: boolean; updated_at?: string }
      >;
      stock_movements: Table<
        { id: string; product_id: string; order_id: string | null; movement_type: "manual_adjustment" | "reservation" | "reservation_release" | "sale" | "sale_restore"; quantity: number; stock_after: number; reserved_after: number; note: string; created_by: string | null; created_at: string },
        { id?: string; product_id: string; order_id?: string | null; movement_type: "manual_adjustment" | "reservation" | "reservation_release" | "sale" | "sale_restore"; quantity: number; stock_after: number; reserved_after: number; note?: string; created_by?: string | null; created_at?: string },
        never
      >;
      contact_submissions: Table<
        { id: string; name: string; email: string | null; phone: string; message: string; status: ContactStatus; created_at: string; updated_at: string },
        { id?: string; name: string; email?: string | null; phone: string; message: string; status?: ContactStatus; created_at?: string; updated_at?: string },
        { status?: ContactStatus; updated_at?: string }
      >;
      product_reviews: Table<
        { id: string; product_id: string; name: string; city: string; rating: number; quote: string; is_approved: boolean; created_at: string },
        { id?: string; product_id: string; name: string; city: string; rating: number; quote: string; is_approved?: boolean; created_at?: string },
        { name?: string; city?: string; rating?: number; quote?: string; is_approved?: boolean }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      admin_adjust_stock: { Args: { target_product_id: string; new_stock: number; adjustment_note?: string }; Returns: undefined };
    };
    Enums: { app_role: AppRole; contact_status: ContactStatus };
    CompositeTypes: Record<string, never>;
  };
};

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type ProductRecord = Database["public"]["Tables"]["products"]["Row"];
export type ContactSubmission = Database["public"]["Tables"]["contact_submissions"]["Row"];
export type StockMovement = Database["public"]["Tables"]["stock_movements"]["Row"];
export type ProductReviewRecord = Database["public"]["Tables"]["product_reviews"]["Row"];
