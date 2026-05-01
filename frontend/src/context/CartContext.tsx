import { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product } from '../types';

interface CartResult {
  ok: boolean;
  message?: string;
}

interface CartCtx {
  items: CartItem[];
  addItem: (product: Product, qty: number) => CartResult;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => CartResult;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, qty: number): CartResult => {
    const existing = items.find((i) => i.product.id === product.id);
    const currentQty = existing ? existing.quantity : 0;
    const newQty = currentQty + qty;

    if (newQty > product.quantity) {
      return {
        ok: false,
        message: `Solo hay ${product.quantity} ${product.unit} disponibles de "${product.name}". Ya tienes ${currentQty} en el carrito.`,
      };
    }

    setItems((prev) => {
      const current = prev.find((i) => i.product.id === product.id);
      if (current) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { product, quantity: qty }];
    });

    return { ok: true };
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQty = (productId: string, qty: number): CartResult => {
    const item = items.find((i) => i.product.id === productId);
    if (!item) return { ok: false, message: 'Producto no encontrado en el carrito.' };

    if (qty > item.product.quantity) {
      return {
        ok: false,
        message: `Solo hay ${item.product.quantity} ${item.product.unit} disponibles de "${item.product.name}".`,
      };
    }

    if (qty <= 0) {
      removeItem(productId);
      return { ok: true };
    }

    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i))
    );

    return { ok: true };
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
