export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  name: string;
  variant_name: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string;
  quantity: number;
  slug: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  totalItems: () => number;
  subtotal: () => number;
}
