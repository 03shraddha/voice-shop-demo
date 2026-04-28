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
import { useCart } from "../context/CartContext";
import { createCheckoutTools } from "../voice/tools";
import { CHECKOUT_INSTRUCTIONS } from "../voice/instructions";

const SHIPPING_LABELS: Record<string, string> = {
  name: "Full Name",
  email: "Email Address",
  phone: "Phone Number",
  address: "Street Address",
  city: "City",
  state: "State / Province",
  zip: "ZIP / Postal Code",
  country: "Country",
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const cartCtx = useCart();
  const { cart, shipping, updateShippingField, subtotal, discountAmount, total } = cartCtx;
  const { cursorState, run } = useGhostCursor();
  const [promoInput, setPromoInput] = useState(cart.promoCode ?? "");
  const [promoError, setPromoError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [voiceError, setVoiceError] = useState<VoiceControlError | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(true);

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
          if (err.message?.includes("active response in progress")) return;
          setVoiceError(err);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => () => controller.destroy(), [controller]);

  function handleApplyPromo() {
    setPromoError("");
    const result = cartCtx.applyPromoCode(promoInput);
    if (!result.ok) setPromoError(result.error ?? "Invalid code");
  }

  const hasAddressInfo = !!(shipping.name && shipping.address);

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center">
        <div className="bg-white rounded-sm border border-gray-200 p-10 max-w-lg text-center shadow-sm">
          <div className="flex items-center justify-center w-16 h-16 bg-[#067D62] rounded-full mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-medium text-[#007600] mb-1">Order placed, thank you!</h2>
          <p className="text-gray-600 text-sm mb-1">
            Confirmation will be sent to {shipping.email || "your email"}.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Thank you, {shipping.name || "friend"}! Your order will arrive in 2-5 business days.
          </p>
          <button
            onClick={() => { setOrderPlaced(false); navigate("/"); }}
            className="bg-amazon-orange hover:bg-amazon-orange-dark text-[#0F1111] font-medium px-8 py-2 rounded-full transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <GhostCursorOverlay state={cursorState} />

      {/* Checkout-specific header */}
      <div className="bg-[#131921] border-b border-[#3a4553] px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex flex-col items-start hover:opacity-80">
            <span className="font-bold text-xl text-white tracking-tight">
              amazon<span className="text-amazon-orange text-[9px] align-super ml-0.5">.in</span>
            </span>
            <div className="bg-amazon-orange" style={{ width: "88%", height: "2px", borderRadius: "0 0 40% 40%" }} />
            <span className="text-[#60A8FF] text-[9px] font-bold italic">prime</span>
          </button>

          <div className="flex items-center gap-1 text-white text-lg font-medium">
            Secure checkout
            <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <button onClick={() => navigate("/")} className="flex items-center gap-1 text-white hover:text-gray-300">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
            </svg>
            <span className="text-sm font-medium">Cart</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4 flex gap-4 items-start">
        {/* LEFT column */}
        <div className="flex-1 min-w-0">

          {/* Delivery address section */}
          <div className="bg-white border border-gray-200 rounded-sm mb-3">
            <div className="px-5 py-4 flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {hasAddressInfo && !showAddressForm ? (
                  <>
                    <p className="text-sm text-[#565959]">
                      Delivering to <strong className="text-[#0F1111]">{shipping.name}</strong>
                    </p>
                    <p className="text-sm text-[#0066C0] mt-0.5 truncate">
                      {[shipping.address, shipping.city, shipping.state, shipping.zip, shipping.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <button className="text-[#0066C0] text-sm hover:underline mt-1">
                      Add delivery instructions
                    </button>
                  </>
                ) : (
                  <h2 className="text-base font-medium text-[#0F1111]">Enter delivery address</h2>
                )}
              </div>
              {hasAddressInfo && (
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-[#0066C0] text-sm hover:underline ml-4 shrink-0"
                >
                  {showAddressForm ? "Done" : "Change"}
                </button>
              )}
            </div>

            {showAddressForm && (
              <div className="px-5 pb-5 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {(Object.keys(SHIPPING_LABELS) as Array<keyof typeof SHIPPING_LABELS>).map((field) => (
                    <div key={field} className={field === "address" || field === "name" ? "col-span-2" : ""}>
                      <label
                        htmlFor={`shipping-${field}`}
                        className="block text-xs font-medium text-[#0F1111] mb-1"
                      >
                        {SHIPPING_LABELS[field]}
                      </label>
                      <input
                        id={`shipping-${field}`}
                        type={field === "email" ? "email" : "text"}
                        value={shipping[field as keyof typeof shipping]}
                        onChange={(e) => updateShippingField(field as keyof typeof shipping, e.target.value)}
                        placeholder={SHIPPING_LABELS[field]}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#E77600] focus:border-[#E77600] voice-target"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#565959] mt-3">
                  🎙️ Say <span className="font-medium text-[#0F1111]">"Fill in my shipping details"</span> to autofill by voice
                </p>
              </div>
            )}
          </div>

          {/* Payment method section */}
          <div className="bg-white border border-gray-200 rounded-sm mb-3 px-5 py-4">
            <h2 className="text-base font-medium text-[#0F1111] mb-4">Payment method</h2>

            <div className="border border-gray-300 rounded">
              {/* Available balance + promo */}
              <div className="p-4 border-b border-gray-200">
                <p className="text-sm font-medium text-[#0F1111] mb-3">Your available balance</p>
                <label className="flex items-start gap-2 mb-4">
                  <input type="radio" className="mt-0.5 accent-[#E77600]" readOnly />
                  <div>
                    <p className="text-sm text-[#0F1111]">
                      Use your <strong>Amazon Pay Balance</strong>
                    </p>
                    <p className="text-xs mt-0.5">
                      <span className="text-[#565959]">ⓘ Insufficient balance. </span>
                      <span className="text-[#0066C0] hover:underline cursor-pointer">Add money &amp; get rewarded</span>
                    </p>
                  </div>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-base leading-none">+</span>
                  <input
                    id="promo-input"
                    type="text"
                    value={cart.promoCode ?? promoInput}
                    onChange={(e) => { setPromoInput(e.target.value); setPromoError(""); }}
                    placeholder="Enter Code"
                    readOnly={!!cart.promoCode}
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#E77600] w-44 uppercase"
                  />
                  {!cart.promoCode && (
                    <button
                      onClick={handleApplyPromo}
                      className="border border-gray-400 bg-white hover:bg-gray-50 text-sm px-4 py-1.5 rounded transition-colors"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {cart.promoCode && (
                  <p className="text-amazon-green text-xs mt-1.5 font-medium">
                    ✓ {cart.promoCode} applied — {(cart.discount * 100).toFixed(0)}% off
                  </p>
                )}
                {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
                <p className="text-[10px] text-gray-400 mt-1.5">
                  Try: <span className="font-medium text-gray-600">SAVE20</span>
                </p>
              </div>

              {/* Credit & Debit Cards */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold tracking-wider text-[#0F1111]">CREDIT &amp; DEBIT CARDS</span>
                  <span className="text-xs text-[#565959]">Nickname</span>
                </div>
                <div className="border-t border-gray-100 pt-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" className="accent-[#E77600]" readOnly />
                    <span className="text-sm text-[#0F1111]">HDFC Bank Credit Card ending in 6828</span>
                    <div className="ml-1 w-8 h-5 rounded text-[8px] text-white flex items-center justify-center font-bold bg-gradient-to-r from-red-500 to-yellow-400">
                      MC
                    </div>
                    <span className="ml-auto text-sm text-[#565959]">sk</span>
                  </label>
                </div>
              </div>

              {/* Another payment method */}
              <div className="p-4">
                <p className="text-sm font-medium text-[#0F1111] mb-3">Another payment method</p>
                <div className="space-y-3.5">
                  <label className="flex items-start gap-2">
                    <input type="radio" className="mt-0.5 accent-[#E77600]" readOnly />
                    <div>
                      <p className="text-sm text-[#0F1111]">Credit or debit card</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {["Visa", "MC", "Amex", "Diners", "Maestro", "BHIM", "RuPay"].map((c) => (
                          <span key={c} className="border border-gray-200 rounded px-1.5 py-0.5 text-[9px] text-gray-500 font-medium">{c}</span>
                        ))}
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2">
                    <input type="radio" className="mt-0.5 accent-[#E77600]" readOnly />
                    <div>
                      <p className="text-sm text-[#0F1111]">Net Banking</p>
                      <select className="mt-1 border border-gray-300 rounded text-xs py-1 px-2 text-gray-600 bg-white focus:outline-none">
                        <option>Choose an Option</option>
                      </select>
                    </div>
                  </label>

                  <label className="flex items-start gap-2">
                    <input type="radio" className="mt-0.5 accent-[#E77600]" readOnly />
                    <div>
                      <p className="text-sm text-[#0F1111]">
                        Scan and Pay with <strong>UPI</strong>
                      </p>
                      <p className="text-xs text-[#565959] mt-0.5">
                        ⓘ You will need to Scan the QR code on the payment page to complete the payment.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 opacity-60">
                    <input type="radio" className="accent-[#E77600]" readOnly disabled />
                    <span className="text-sm text-[#0F1111]">
                      EMI Unavailable{" "}
                      <span className="text-[#0066C0]">Why?</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-2">
                    <input type="radio" className="mt-0.5 accent-[#E77600]" readOnly />
                    <div>
                      <p className="text-sm text-[#0F1111]">Cash on Delivery/Pay on Delivery</p>
                      <p className="text-xs text-[#565959] mt-0.5">
                        Cash, UPI and Cards accepted.{" "}
                        <span className="text-[#0066C0] hover:underline cursor-pointer">Know more.</span>
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA (mirrors screenshot) */}
          <div className="bg-white border border-gray-200 rounded-sm p-4">
            <button
              onClick={() => setOrderPlaced(true)}
              disabled={cart.items.length === 0}
              className="bg-[#FFD814] hover:bg-[#F7CA00] disabled:opacity-40 disabled:cursor-not-allowed text-[#0F1111] font-medium px-8 py-2 rounded-sm border border-[#FCD200] transition-colors text-sm"
            >
              Use this payment method
            </button>
          </div>
        </div>

        {/* RIGHT column — order summary */}
        <div className="w-64 shrink-0">
          <div className="bg-white border border-gray-200 rounded-sm p-4">
            <button
              onClick={() => setOrderPlaced(true)}
              disabled={cart.items.length === 0}
              className="w-full bg-[#FFD814] hover:bg-[#F7CA00] disabled:opacity-40 disabled:cursor-not-allowed text-[#0F1111] font-medium py-2.5 rounded-sm border border-[#FCD200] transition-colors text-sm mb-4"
            >
              Use this payment method
            </button>

            <div className="space-y-1.5 text-sm text-[#0F1111]">
              <div className="flex justify-between">
                <span>Items:</span>
                <span>{cart.items.length > 0 ? `$${subtotal.toFixed(2)}` : "--"}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>{cart.items.length > 0 ? "$0.00" : "--"}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#CC0C39]">
                  <span>Promotion applied:</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold">
                <span>Order Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {cart.items.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-3">
                <ul className="space-y-2">
                  {cart.items.map((item) => (
                    <li
                      key={`${item.product.id}-${item.size}-${item.color}`}
                      className="flex justify-between items-start text-xs"
                    >
                      <span className="text-[#0F1111] flex-1 mr-2">
                        {item.product.emoji} {item.product.name}
                        <br />
                        <span className="text-gray-400">
                          {item.color} · {item.size} · qty {item.quantity}
                        </span>
                      </span>
                      <span className="font-medium text-[#0F1111] shrink-0">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {voiceError && (
        <div className="fixed bottom-24 right-4 z-50 bg-white border border-red-300 rounded shadow-lg px-4 py-3 text-xs max-w-xs">
          <p className="font-semibold text-red-700 mb-1">
            Voice connection failed ({voiceError.code})
          </p>
          <p className="text-gray-600">
            {voiceError.code === "permission_denied"
              ? "Allow microphone access in your browser address bar."
              : voiceError.code === "network_error"
              ? "Run the session server: node session-server.mjs"
              : "Open DevTools (F12) and check the Console for details."}
          </p>
          {voiceError.message && (
            <p className="text-gray-400 font-mono break-all border-t border-gray-100 pt-1 mt-1 text-[10px]">
              {voiceError.message}
            </p>
          )}
          <button onClick={() => setVoiceError(null)} className="mt-2 text-[#0066C0] hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <VoiceControlWidget controller={controller} />
    </div>
  );
}
