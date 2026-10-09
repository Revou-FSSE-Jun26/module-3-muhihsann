/* =====================================================================
   Shared domain + UI types for the RevOnest web app.
   Product mirrors the Module 2 Flask API / RevoShop DB schema.
   ===================================================================== */

// ---- Domain models (shape returned by the Flask API) ----

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category_id: number;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  user_id: number;
  status: string;
  total_amount?: number;
  order_date?: string;
  items?: OrderItem[];
}

// ---- Component prop types ----

export interface ProductCardProps {
  product: Product;
  // optional props with sensible defaults (destructuring defaults in the card)
  showActions?: boolean;
  initialQuantity?: number;
  onAddToCart?: (product: Product, quantity: number) => void;
}

// ---- Form types (login / add product) ----

export interface LoginFormState {
  email: string;
  password: string;
  remember: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

// Add-product form (values are strings because they come from inputs).
export interface ProductFormState {
  name: string;
  price: string;
  stock_quantity: string;
  description: string;
}

export interface ProductFormErrors {
  name?: string;
  price?: string;
  stock_quantity?: string;
}
