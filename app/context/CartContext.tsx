import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { LOGOUT_EVENT } from "./AuthContext";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// Проверка что объект соответствует типу CartItem
function isValidCartItem(item: unknown): item is CartItem {
  if (typeof item !== "object" || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.price === "number" &&
    typeof obj.quantity === "number" &&
    typeof obj.image === "string"
  );
}

// Проверка массива CartItem
function isValidCartItems(arr: unknown): arr is CartItem[] {
  return Array.isArray(arr) && arr.every(isValidCartItem);
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "sibgiu_canteen_cart";
const CART_DATE_KEY = "sibgiu_canteen_cart_date";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Загрузка корзины из localStorage при монтировании
  useEffect(() => {
    try {
      const today = new Date().toDateString();
      const savedCartDate = localStorage.getItem(CART_DATE_KEY);
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);

      // Очищаем корзину если это другой день
      if (savedCartDate !== today) {
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.removeItem(CART_DATE_KEY);
        setItems([]);
      } else if (savedCart) {
        const parsed = JSON.parse(savedCart);
        // Проверяем что данные соответствуют ожидаемому типу
        if (isValidCartItems(parsed)) {
          setItems(parsed);
        } else {
          // Данные повреждены - очищаем
          console.warn("Cart data corrupted, clearing...");
          localStorage.removeItem(CART_STORAGE_KEY);
          localStorage.removeItem(CART_DATE_KEY);
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(CART_DATE_KEY);
    }
    setIsLoaded(true);

    // ❌ Убрано очищение корзины при выходе из аккаунта - теперь корзина сохраняется
  }, []);

  // Сохранение корзины в localStorage при изменении
  useEffect(() => {
    if (isLoaded) {
      try {
        if (items.length > 0) {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
          localStorage.setItem(CART_DATE_KEY, new Date().toDateString());
        } else {
          localStorage.removeItem(CART_STORAGE_KEY);
          localStorage.removeItem(CART_DATE_KEY);
        }
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [items, isLoaded]);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
