import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Product } from "../data/products";

export type CartItem = {
  product: Product;
  quantity: number;
  size: string;
  color: string;
};

export type ShippingFields = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

type CartState = {
  items: CartItem[];
  promoCode: string | null;
  discount: number; // 0–1 multiplier, e.g. 0.2 = 20% off
};

export type CartContextValue = {
  cart: CartState;
  shipping: ShippingFields;
  // Refs for voice tools (always current without stale closures)
  cartRef: React.MutableRefObject<CartState>;
  shippingRef: React.MutableRefObject<ShippingFields>;
  // Mutators
  addToCart: (product: Product, quantity: number, size: string, color: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  applyPromoCode: (code: string) => { ok: boolean; error?: string };
  updateShippingField: (field: keyof ShippingFields, value: string) => void;
  // Computed
  subtotal: number;
  discountAmount: number;
  total: number;
  itemCount: number;
};

const VALID_PROMO_CODES: Record<string, number> = {
  SAVE20: 0.2,
  SAVE10: 0.1,
};

const EMPTY_SHIPPING: ShippingFields = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>({
    items: [],
    promoCode: null,
    discount: 0,
  });
  const [shipping, setShipping] = useState<ShippingFields>(EMPTY_SHIPPING);

  // Refs stay in sync with state — voice tools read from these
  const cartRef = useRef(cart);
  const shippingRef = useRef(shipping);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);
  useEffect(() => {
    shippingRef.current = shipping;
  }, [shipping]);

  const addToCart = useCallback(
    (product: Product, quantity: number, size: string, color: string) => {
      setCart((prev) => {
        const existing = prev.items.find(
          (i) => i.product.id === product.id && i.size === size && i.color === color
        );
        if (existing) {
          return {
            ...prev,
            items: prev.items.map((i) =>
              i === existing ? { ...i, quantity: i.quantity + quantity } : i
            ),
          };
        }
        return {
          ...prev,
          items: [...prev.items, { product, quantity, size, color }],
        };
      });
    },
    []
  );

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.product.id !== productId),
    }));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return { ...prev, items: prev.items.filter((i) => i.product.id !== productId) };
      }
      return {
        ...prev,
        items: prev.items.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        ),
      };
    });
  }, []);

  const applyPromoCode = useCallback((code: string): { ok: boolean; error?: string } => {
    const upper = code.toUpperCase().trim();
    const discount = VALID_PROMO_CODES[upper];
    if (discount !== undefined) {
      setCart((prev) => ({ ...prev, promoCode: upper, discount }));
      return { ok: true };
    }
    return { ok: false, error: `"${code}" is not a valid promo code` };
  }, []);

  const updateShippingField = useCallback(
    (field: keyof ShippingFields, value: string) => {
      setShipping((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const subtotal = cart.items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );
  const discountAmount = subtotal * cart.discount;
  const total = subtotal - discountAmount;
  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        shipping,
        cartRef,
        shippingRef,
        addToCart,
        removeFromCart,
        updateQuantity,
        applyPromoCode,
        updateShippingField,
        subtotal,
        discountAmount,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
