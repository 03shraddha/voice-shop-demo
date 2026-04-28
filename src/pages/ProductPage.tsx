import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  VoiceControlWidget,
  GhostCursorOverlay,
  useGhostCursor,
  createVoiceControlController,
} from "realtime-voice-component";
import type { UseGhostCursorReturn, VoiceControlError } from "realtime-voice-component";
import "realtime-voice-component/styles.css";
import { PRODUCTS } from "../data/products";
import { useCart } from "../context/CartContext";
import { ProductCard } from "../components/ProductCard";
import { MiniCart } from "../components/MiniCart";
import { createCheckoutTools } from "../voice/tools";
import { CHECKOUT_INSTRUCTIONS } from "../voice/instructions";

function voiceErrorHint(code: string, message?: string): string {
  if (message?.toLowerCase().includes("quota") || message?.toLowerCase().includes("billing")) {
    return "Your OpenAI account is out of credits. Add billing at platform.openai.com/settings/billing.";
  }
  switch (code) {
    case "permission_denied":
      return "Click the mic icon in your browser address bar and allow microphone access.";
    case "device_unavailable":
      return "No microphone detected. Plug one in and retry.";
    case "network_error":
      return "Session server unreachable. In a terminal run: node session-server.mjs";
    case "insecure_context":
      return "Voice requires HTTPS or localhost. Make sure you're on http://localhost:5173";
    default:
      return "Open browser DevTools (F12) and check the Console tab for details.";
  }
}

const FILTER_CATEGORIES = ["Men's", "Women's", "Oversized", "Zipped", "Fleece"];
const FILTER_BRANDS = ["Nike", "adidas", "Puma", "Levi's", "The Souled Store", "Tommy Hilfiger", "Van Heusen"];

function FilterSidebar() {
  return (
    <aside className="w-52 shrink-0 text-xs text-[#0F1111]">
      <div className="border-b border-gray-200 pb-3 mb-3">
        <p className="font-bold text-sm mb-2">Popular Shopping Ideas</p>
        <ul className="space-y-0.5">
          {FILTER_CATEGORIES.map((c) => (
            <li key={c}>
              <span className="text-amazon-blue hover:underline cursor-pointer">{c}</span>
            </li>
          ))}
        </ul>
        <span className="text-amazon-blue hover:underline cursor-pointer mt-1 block">&#9662; See more</span>
      </div>

      <div className="border-b border-gray-200 pb-3 mb-3">
        <p className="font-bold text-sm mb-2">Delivery</p>
        <label className="flex items-center gap-1.5 cursor-default">
          <input type="checkbox" readOnly className="accent-amazon-orange" />
          All Prime
        </label>
      </div>

      <div className="border-b border-gray-200 pb-3 mb-3">
        <p className="font-bold text-sm mb-2">Prime Delivery</p>
        <label className="flex items-center gap-1.5 cursor-default">
          <input type="checkbox" readOnly className="accent-amazon-orange" />
          Tomorrow by 11AM
        </label>
      </div>

      <div className="border-b border-gray-200 pb-3 mb-3">
        <p className="font-bold text-sm mb-2">Delivery Day</p>
        <label className="flex items-center gap-1.5 mb-0.5 cursor-default">
          <input type="checkbox" readOnly className="accent-amazon-orange" />
          Get it by Tomorrow
        </label>
        <label className="flex items-center gap-1.5 cursor-default">
          <input type="checkbox" readOnly className="accent-amazon-orange" />
          Get it in 2 Days
        </label>
      </div>

      <div className="border-b border-gray-200 pb-3 mb-3">
        <p className="font-bold text-sm mb-2">Gender</p>
        {["Men", "Women", "Boys", "Girls", "Babies", "Unisex"].map((g) => (
          <label key={g} className="flex items-center gap-1.5 mb-0.5 cursor-default">
            <input type="checkbox" readOnly className="accent-amazon-orange" />
            {g}
          </label>
        ))}
      </div>

      <div className="border-b border-gray-200 pb-3 mb-3">
        <p className="font-bold text-sm mb-2">Brands</p>
        {FILTER_BRANDS.map((b) => (
          <label key={b} className="flex items-center gap-1.5 mb-0.5 cursor-default">
            <input type="checkbox" readOnly className="accent-amazon-orange" />
            {b}
          </label>
        ))}
        <span className="text-amazon-blue hover:underline cursor-pointer mt-1 block">&#9662; See more</span>
      </div>

      <div className="pb-3">
        <p className="font-bold text-sm mb-2">Price</p>
        <p className="text-gray-500 mb-1">$20 - $200+</p>
        <input
          type="range"
          min={20}
          max={200}
          defaultValue={200}
          readOnly
          className="w-full accent-amazon-orange"
        />
        <div className="flex justify-between text-gray-500 mt-0.5">
          <span>$20</span>
          <span>$200+</span>
        </div>
      </div>
    </aside>
  );
}

export function ProductPage() {
  const navigate = useNavigate();
  const cartCtx = useCart();
  const { cursorState, run } = useGhostCursor();
  const [voiceError, setVoiceError] = useState<VoiceControlError | null>(null);

  const ghostRunRef = useRef<UseGhostCursorReturn["run"] | null>(null);
  ghostRunRef.current = run;

  const tools = useMemo(
    () => createCheckoutTools(cartCtx, navigate, ghostRunRef),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const controller = useMemo(
    () =>
      createVoiceControlController({
        activationMode: "vad",
        auth: { sessionEndpoint: "/session" },
        instructions: CHECKOUT_INSTRUCTIONS,
        outputMode: "tool-only",
        tools,
        model: "gpt-realtime-1.5",
        debug: import.meta.env.DEV,
        audio: {
          input: {
            turnDetection: {
              type: "server_vad" as const,
              createResponse: true,
              interruptResponse: false,
              prefixPaddingMs: 300,
              silenceDurationMs: 600,
              threshold: 0.65,
            },
          },
        },
        onError: (err) => {
          // "active response in progress" is a transient VAD race — ignore it
          if (err.message?.includes("active response in progress")) return;
          setVoiceError(err);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => () => controller.destroy(), [controller]);

  return (
    <div className="min-h-screen bg-white">
      <GhostCursorOverlay state={cursorState} />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-4 py-2">
        <div className="max-w-[1500px] mx-auto">
          <p className="text-xs text-gray-500">
            Amazon <span className="mx-1">&#8250;</span> Clothing <span className="mx-1">&#8250;</span> Apparel
          </p>
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="max-w-[1500px] mx-auto px-4 py-3 flex gap-5">
        <FilterSidebar />

        {/* Products column */}
        <div className="flex-1 min-w-0">
          {/* Results header */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">
              1-4 of over <span className="text-[#0F1111]">30,000</span> results for{" "}
              <span className="text-[#CC0C39] font-medium">"apparel"</span>
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Sort by:</span>
              <button className="border border-gray-300 rounded px-2 py-1 text-xs bg-white hover:bg-gray-50 flex items-center gap-1">
                Featured <span>&#9662;</span>
              </button>
            </div>
          </div>

          {/* Sponsored brand banner */}
          <div className="mb-4 border border-gray-200 rounded-sm p-3 bg-white flex items-center gap-4">
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Sponsored</div>
            <div className="flex gap-3 flex-1">
              {PRODUCTS.slice(0, 3).map((p) => (
                <div key={p.id} className="flex items-center gap-2 border-r border-gray-100 last:border-0 pr-3 last:pr-0">
                  <span className="text-3xl">{p.emoji}</span>
                  <div>
                    <p className="text-[11px] font-medium text-[#0F1111] leading-tight">{p.name}</p>
                    <p className="text-[11px] text-amazon-blue">${p.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Results label */}
          <p className="font-bold text-lg text-[#0F1111] mb-3">Results</p>
          <p className="text-xs text-gray-500 mb-4">
            Check each product page for other buying options. Price and other details may vary based on product size and colour.
          </p>

          {/* Product grid */}
          <div className="grid grid-cols-2 gap-4">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Demo script panel */}
          <div className="mt-6 bg-[#EAF4FB] border border-[#B8D8EC] rounded-sm p-4 text-sm">
            <p className="font-semibold text-[#0F1111] mb-2">&#127897;&#65039; Voice demo script</p>
            <ol className="list-decimal list-inside space-y-1 text-xs text-[#565959]">
              <li>"Add two blue hoodies in size medium"</li>
              <li>"Also add the white sneakers in size 10"</li>
              <li>"Actually, remove the sneakers"</li>
              <li>"Go to checkout" or click Proceed to checkout</li>
            </ol>
          </div>
        </div>

        {/* Cart sidebar */}
        <MiniCart />
      </div>

      {/* Voice error banner */}
      {voiceError && (
        <div className="fixed bottom-24 right-4 z-50 bg-white border border-red-300 rounded shadow-lg px-4 py-3 text-xs max-w-sm">
          <p className="font-semibold text-red-700 mb-1">
            Voice connection failed ({voiceError.code})
          </p>
          <p className="text-gray-600 mb-1">{voiceErrorHint(voiceError.code ?? "unknown", voiceError.message)}</p>
          {voiceError.message && (
            <p className="text-gray-400 font-mono break-all border-t border-gray-100 pt-1 mt-1">
              {voiceError.message}
            </p>
          )}
          <button
            onClick={() => setVoiceError(null)}
            className="mt-2 text-amazon-blue hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <VoiceControlWidget controller={controller} />
    </div>
  );
}
