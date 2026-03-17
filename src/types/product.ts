export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  parent_id: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  category_id: string;
  base_price: number;
  compare_at_price: number | null;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new: boolean;
  rating_avg: number;
  rating_count: number;
  features: string[];
  specifications: Record<string, string>;
  status: "active" | "draft" | "archived";
  created_at: string;
  updated_at: string;
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  variant_type: "color" | "bundle" | "style" | "size";
  price: number;
  compare_at_price: number | null;
  sku: string;
  stock_quantity: number;
  image_url: string | null;
  is_default: boolean;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  profiles?: {
    full_name: string | null;
  };
}
