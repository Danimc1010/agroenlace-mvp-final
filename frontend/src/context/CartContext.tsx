import { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product } from '../types';

interface CartCtx {
  items: CartItem[];
  addItem: (product: Product, qty: number, selectedUnit?: string, unitFactor?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, qty: number, selectedUnit?: string, unitFactor: number = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      const baseQty = parseFloat((qty * unitFactor).toFixed(4));
      const displayUnit = selectedUnit || product.unit;
      const displayPrice = parseFloat((product.price * unitFactor).toFixed(0));

      if (existing) {
        const newBase = parseFloat((existing.quantity + baseQty).toFixed(4));
        if (newBase > product.quantity) {
          alert(`⚠️ Stock insuficiente. Solo hay ${product.quantity} ${product.unit} disponibles de "${product.name}"`);
          return prev;
        }
        return prev.map(i => i.product.id === product.id
          ? { ...i, quantity: newBase }
          : i
        );
      }

      if (baseQty > product.quantity) {
        alert(`⚠️ Stock insuficiente. Solo hay ${product.quantity} ${product.unit} disponibles de "${product.name}"`);
        return prev;
      }

      return [...prev, {
        product: { ...product, unit: displayUnit },
        quantity: qty,
        baseQuantity: baseQty,
        unitFactor,
        displayUnit,
        displayPrice,
      }];
    });
  };

  const removeItem = (productId: string) =>
    setItems(prev => prev.filter(i => i.product.id !== productId));

  const updateQty = (productId: string, qty: number) =>
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));

  const clearCart = () => setItems([]);

  const total = items.reduce((s, i) => {
    const price = (i as any).displayPrice || i.product.price;
    return s + price * i.quantity;
  }, 0);

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
