"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as api from "@/lib/api";
import type { Product } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { notify } from "@/lib/toast";

/** One line in the cart: the product plus how many of it. */
export interface CartLine {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  items: CartLine[];
  /** Total number of units across all lines (for the header badge). */
  count: number;
  /** Sum of price * quantity across all lines. */
  total: number;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
  /** Place the cart as an order (POST /orders) for the logged-in user. */
  checkout: () => Promise<number>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

/**
 * localStorage key, scoped per account (Option B). Each user gets their own
 * cart in this browser; logging out does not destroy it, and logging back in
 * restores it. Logged-out visitors use a shared "guest" key.
 */
function storageKey(userId: number | null): string {
  return userId === null ? "revonest.cart.guest" : `revonest.cart.${userId}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [items, setItems] = useState<CartLine[]>([]);
  // Guards against writing an empty cart over stored data before we've loaded.
  const hydratedFor = useRef<string | null>(null);

  // Load the correct cart whenever the logged-in user changes.
  useEffect(() => {
    const key = storageKey(userId);
    try {
      const stored = localStorage.getItem(key);
      setItems(stored ? (JSON.parse(stored) as CartLine[]) : []);
    } catch {
      setItems([]);
    }
    hydratedFor.current = key;
  }, [userId]);

  // Persist on every change, but only after we've hydrated this user's cart.
  useEffect(() => {
    const key = storageKey(userId);
    if (hydratedFor.current !== key) return;
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      // storage unavailable — cart stays in memory for this session
    }
  }, [items, userId]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    notify.success(`Added "${product.name}" to cart.`);
    setItems((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        // Don't exceed available stock.
        const next = Math.min(
          existing.quantity + quantity,
          product.stock_quantity
        );
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, quantity: next } : l
        );
      }
      return [
        ...prev,
        { product, quantity: Math.min(quantity, product.stock_quantity) },
      ];
    });
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setItems((prev) =>
      prev
        .map((l) =>
          l.product.id === productId
            ? {
                ...l,
                quantity: Math.max(
                  1,
                  Math.min(quantity, l.product.stock_quantity)
                ),
              }
            : l
        )
        .filter((l) => l.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((l) => l.product.id !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const checkout = useCallback(async (): Promise<number> => {
    if (!user) throw new Error("You must be logged in to checkout.");
    if (items.length === 0) throw new Error("Your cart is empty.");

    const order = await api.createOrder({
      user_id: user.id,
      items: items.map((l) => ({
        product_id: l.product.id,
        quantity: l.quantity,
      })),
    });
    clear();
    notify.success(`Order #${order.id} placed.`);
    return order.id;
  }, [user, items, clear]);

  const count = useMemo(
    () => items.reduce((sum, l) => sum + l.quantity, 0),
    [items]
  );
  const total = useMemo(
    () => items.reduce((sum, l) => sum + l.product.price * l.quantity, 0),
    [items]
  );

  const value: CartContextValue = {
    items,
    count,
    total,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    checkout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Hook to read cart state. Throws if used outside <CartProvider>. */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
