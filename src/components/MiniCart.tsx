import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export function MiniCart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, subtotal, total, discountAmount, itemCount } =
    useCart();

  return (
    <aside className="w-72 shrink-0">
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm sticky top-[88px]">
        <div className="px-4 py-3">
          <h2 className="text-lg font-medium text-[#0F1111]">
            Shopping Cart{" "}
            {itemCount > 0 && (
              <span className="text-sm font-normal text-gray-500">({itemCount})</span>
            )}
          </h2>
        </div>

        {cart.items.length > 0 && (
          <div className="px-4 py-3 bg-[#F7F8F8] border-y border-gray-200">
            <div className="text-sm">
              <span className="font-medium text-[#0F1111]">
                Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"}):{" "}
              </span>
              <span className="font-bold text-[#0F1111] text-base">${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="text-xs text-amazon-green font-medium mt-0.5">
                Promo savings: -${discountAmount.toFixed(2)}
              </div>
            )}
            <label className="flex items-center gap-2 mt-2 text-xs text-gray-600 cursor-default">
              <input type="checkbox" checked readOnly className="accent-amazon-orange" />
              This order contains a gift
            </label>
          </div>
        )}

        <div className="max-h-72 overflow-y-auto">
          {cart.items.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-gray-600 text-sm font-medium">Your Amazon Cart is empty.</p>
              <p className="text-xs text-amazon-blue mt-1">Try saying "Add a blue hoodie"</p>
            </div>
          ) : (
            <ul>
              {cart.items.map((item) => (
                <li
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  className="px-3 py-3 flex gap-2 items-start border-b border-gray-100 last:border-0"
                >
                  <div
                    className="w-14 h-14 rounded-sm flex items-center justify-center text-3xl shrink-0 bg-white border border-gray-100"
                    style={{
                      backgroundColor: (item.product.colorHex[item.color] ?? "#ccc") + "20",
                    }}
                  >
                    {item.product.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#0F1111] line-clamp-2">
                      {item.product.name}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {item.color} · {item.size}
                    </p>
                    <p className="text-[11px] text-[#067D62] font-medium">In Stock</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-1.5 py-0.5 text-xs text-gray-600 hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="px-1.5 text-xs border-x border-gray-300">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-1.5 py-0.5 text-xs text-gray-600 hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-[11px] text-amazon-blue hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="text-sm font-bold text-[#0F1111] shrink-0">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-4 py-3">
          {cart.items.length > 0 && discountAmount > 0 && (
            <div className="flex justify-between text-sm font-bold text-[#0F1111] mb-2">
              <span>Order Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          )}
          <button
            onClick={() => navigate("/checkout")}
            disabled={cart.items.length === 0}
            className="w-full bg-amazon-orange hover:bg-amazon-orange-dark disabled:opacity-40 disabled:cursor-not-allowed text-[#0F1111] font-medium py-2 rounded-full text-sm transition-colors"
          >
            Proceed to checkout
            {itemCount > 0 ? ` (${itemCount} ${itemCount === 1 ? "item" : "items"})` : ""}
          </button>
        </div>
      </div>
    </aside>
  );
}
