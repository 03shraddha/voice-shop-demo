import { defineVoiceTool } from "realtime-voice-component";
import type { UseGhostCursorReturn } from "realtime-voice-component";
import { z } from "zod";
import type { NavigateFunction } from "react-router-dom";
import type { MutableRefObject } from "react";
import { findProduct } from "../data/products";
import type { CartContextValue, ShippingFields } from "../context/CartContext";

const PRODUCT_NAMES = [
  "Classic Hoodie",
  "Runner Sneakers",
  "Canvas Backpack",
  "Slim Sweatpants",
] as const;

const SHIPPING_FIELDS = [
  "name",
  "email",
  "phone",
  "address",
  "city",
  "state",
  "zip",
  "country",
] as const;

// Schemas defined separately so z.infer can type the execute callbacks
const addToCartSchema = z.object({
  product: z.enum(PRODUCT_NAMES),
  quantity: z.number().int().min(1).default(1),
  size: z.string().optional(),
  color: z.string().optional(),
});

const removeFromCartSchema = z.object({
  product: z.enum(PRODUCT_NAMES),
});

const updateQuantitySchema = z.object({
  product: z.enum(PRODUCT_NAMES),
  quantity: z.number().int().min(0),
});

const applyPromoSchema = z.object({
  code: z.string(),
});

const navigateSchema = z.object({
  page: z.enum(["products", "checkout"]),
});

const fillShippingSchema = z.object({
  field: z.enum(SHIPPING_FIELDS),
  value: z.string(),
});

const getCartSchema = z.object({});

// ghostRunRef holds the `run` function from useGhostCursor so tools can animate the cursor
type GhostRun = UseGhostCursorReturn["run"];

export function createCheckoutTools(
  cartCtx: CartContextValue,
  navigate: NavigateFunction,
  ghostRunRef: MutableRefObject<GhostRun | null>
) {
  const { cartRef, addToCart, removeFromCart, updateQuantity, applyPromoCode, updateShippingField } =
    cartCtx;

  async function withCursor(elementId: string, operation: () => void) {
    const el = document.getElementById(elementId);
    if (el && ghostRunRef.current) {
      await ghostRunRef.current({ element: el }, operation);
    } else {
      operation();
      // CSS fallback highlight
      if (el) {
        el.classList.add("voice-highlight");
        setTimeout(() => el.classList.remove("voice-highlight"), 1200);
      }
    }
  }

  const addToCartTool = defineVoiceTool({
    name: "add_to_cart",
    description: "Add a product to the shopping cart. Use the closest matching product name.",
    parameters: addToCartSchema,
    execute: async ({ product: productName, quantity, size, color }: z.infer<typeof addToCartSchema>) => {
      const product = findProduct(productName);
      if (!product) return { ok: false, error: `Product "${productName}" not found` };

      const resolvedSize = size ?? product.sizes[0];
      const resolvedColor = color ?? product.colors[0];

      await withCursor(`product-${product.id}`, () =>
        addToCart(product, quantity, resolvedSize, resolvedColor)
      );

      return {
        ok: true,
        message: `Added ${quantity}x ${resolvedColor} ${product.name} (size ${resolvedSize}) to cart`,
      };
    },
  });

  const removeFromCartTool = defineVoiceTool({
    name: "remove_from_cart",
    description: "Remove a product from the shopping cart.",
    parameters: removeFromCartSchema,
    execute: ({ product: productName }: z.infer<typeof removeFromCartSchema>) => {
      const product = findProduct(productName);
      if (!product) return { ok: false, error: `Product "${productName}" not found` };

      const inCart = cartRef.current.items.find((i) => i.product.id === product.id);
      if (!inCart) return { ok: false, error: `${product.name} is not in the cart` };

      removeFromCart(product.id);
      return { ok: true, message: `Removed ${product.name} from cart` };
    },
  });

  const updateQuantityTool = defineVoiceTool({
    name: "update_quantity",
    description: "Change the quantity of a product in the cart. Set quantity to 0 to remove.",
    parameters: updateQuantitySchema,
    execute: ({ product: productName, quantity }: z.infer<typeof updateQuantitySchema>) => {
      const product = findProduct(productName);
      if (!product) return { ok: false, error: `Product "${productName}" not found` };

      updateQuantity(product.id, quantity);
      return {
        ok: true,
        message:
          quantity === 0
            ? `Removed ${product.name}`
            : `Updated ${product.name} quantity to ${quantity}`,
      };
    },
  });

  const applyPromoCodeTool = defineVoiceTool({
    name: "apply_promo_code",
    description: "Apply a promo code to get a discount on the order.",
    parameters: applyPromoSchema,
    execute: async ({ code }: z.infer<typeof applyPromoSchema>) => {
      await withCursor("promo-input", () => {});
      const result = applyPromoCode(code);
      if (result.ok) {
        const discount = cartRef.current.discount * 100;
        return { ok: true, message: `Applied ${code.toUpperCase()} — ${discount}% off!` };
      }
      return { ok: false, error: result.error };
    },
  });

  const navigateToPageTool = defineVoiceTool({
    name: "navigate_to_page",
    description: 'Navigate to a different page. "checkout" goes to checkout, "products" goes to the product listing.',
    parameters: navigateSchema,
    execute: ({ page }: z.infer<typeof navigateSchema>) => {
      navigate(page === "checkout" ? "/checkout" : "/");
      return { ok: true, message: `Navigated to ${page}` };
    },
  });

  const fillShippingFieldTool = defineVoiceTool({
    name: "fill_shipping_field",
    description: "Fill one field in the shipping form on the checkout page.",
    parameters: fillShippingSchema,
    execute: async ({ field, value }: z.infer<typeof fillShippingSchema>) => {
      await withCursor(`shipping-${field}`, () =>
        updateShippingField(field as keyof ShippingFields, value)
      );
      return { ok: true, message: `Set ${field} to "${value}"` };
    },
  });

  const getCartTool = defineVoiceTool({
    name: "get_cart",
    description: "Return the current cart contents and totals.",
    parameters: getCartSchema,
    execute: (_args: z.infer<typeof getCartSchema>) => {
      const { items, promoCode, discount } = cartRef.current;
      const subtotal = items.reduce(
        (s: number, i: { product: { price: number }; quantity: number }) =>
          s + i.product.price * i.quantity,
        0
      );
      return {
        items: items.map(
          (i: { product: { name: string; price: number }; color: string; size: string; quantity: number }) => ({
            name: i.product.name,
            color: i.color,
            size: i.size,
            quantity: i.quantity,
            lineTotal: i.product.price * i.quantity,
          })
        ),
        subtotal: subtotal.toFixed(2),
        promoCode,
        discount: `${(discount * 100).toFixed(0)}%`,
        total: (subtotal * (1 - discount)).toFixed(2),
      };
    },
  });

  return [
    addToCartTool,
    removeFromCartTool,
    updateQuantityTool,
    applyPromoCodeTool,
    navigateToPageTool,
    fillShippingFieldTool,
    getCartTool,
  ];
}
