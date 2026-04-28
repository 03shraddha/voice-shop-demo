import { useState } from "react";
import type { Product } from "../data/products";
import { useCart } from "../context/CartContext";

type Props = {
  product: Product;
};

function StarRating({ rating, count }: { rating: number; count: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} style={{ color: i <= rounded ? "#FFA41C" : "#D5D9D9" }} className="text-sm">
            ★
          </span>
        ))}
      </div>
      <span className="text-[11px] text-amazon-blue">{count.toLocaleString()}</span>
    </div>
  );
}

export function ProductCard({ product }: Props) {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addToCart(product, 1, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const bgColor = product.colorHex[selectedColor] ?? "#E5E7EB";

  return (
    <div
      id={`product-${product.id}`}
      className="bg-white rounded-sm shadow-sm hover:shadow-lg transition-shadow flex flex-col voice-target overflow-hidden"
    >
      <div
        className="h-56 bg-white flex items-center justify-center p-4"
        style={{ backgroundColor: bgColor + "15" }}
      >
        <span className="text-8xl drop-shadow-sm">{product.emoji}</span>
      </div>

      <div className="px-3 pb-4 pt-2 flex flex-col gap-1 flex-1">
        <span className="text-[10px] text-gray-400">Sponsored</span>

        {product.brand && (
          <span className="text-[11px] text-gray-600 font-medium">{product.brand}</span>
        )}

        <h3 className="text-amazon-blue text-sm font-medium leading-snug line-clamp-2">
          {product.name}
        </h3>

        {product.rating != null && (
          <StarRating rating={product.rating} count={product.ratingCount ?? 0} />
        )}

        <div className="mt-0.5">
          <span className="text-lg font-medium text-[#0F1111]">${product.price.toFixed(2)}</span>
        </div>

        {product.originalPrice != null && (
          <div className="text-[11px] text-gray-500">
            List: <span className="line-through">${product.originalPrice.toFixed(2)}</span>{" "}
            <span className="text-[#CC0C39] font-medium">
              (-{Math.round((1 - product.price / product.originalPrice) * 100)}%)
            </span>
          </div>
        )}

        {product.boughtRecently && (
          <span className="text-[11px] text-[#565959]">
            {product.boughtRecently} bought in past month
          </span>
        )}

        {product.prime && (
          <div className="flex items-center gap-1">
            <span className="text-[#00A8E1] font-bold text-[11px] tracking-wide">prime</span>
            <span className="text-[10px] text-gray-500">FREE Delivery</span>
          </div>
        )}

        {product.badge && (
          <span className="self-start bg-[#CC0C39] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
            {product.badge}
          </span>
        )}

        <div className="flex items-center gap-1.5 flex-wrap mt-1">
          {product.colors.map((color) => (
            <button
              key={color}
              title={color}
              onClick={() => setSelectedColor(color)}
              className={`w-4 h-4 rounded-full border-2 transition-transform ${
                selectedColor === color
                  ? "border-amazon-blue scale-110"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              style={{ backgroundColor: product.colorHex[color] ?? "#ccc" }}
            />
          ))}
          <span className="text-[11px] text-gray-500">{selectedColor}</span>
        </div>

        {product.sizes.length > 1 && (
          <div className="flex gap-1 flex-wrap">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-2 py-0.5 text-[11px] rounded-sm border transition-colors ${
                  selectedSize === size
                    ? "bg-amazon-navy text-white border-amazon-navy"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleAddToCart}
          className={`w-full py-1.5 rounded-full text-sm font-medium transition-all mt-auto ${
            added
              ? "bg-[#067D62] text-white"
              : "bg-amazon-orange hover:bg-amazon-orange-dark text-[#0F1111]"
          }`}
        >
          {added ? "Added to Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
