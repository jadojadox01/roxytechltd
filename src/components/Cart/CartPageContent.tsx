"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/formatePrice";

const CartPageContent = () => {
  const {
    cartCount,
    cartDetails,
    totalPrice,
    removeItem,
    incrementItem,
    decrementItem,
    updateItemQuantity,
    clearCart,
    goToCheckout,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);

  const items = Object.values(cartDetails ?? {});
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const payable = Math.max(0, totalPrice - discountAmount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Enter a coupon code");
      return;
    }
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal: totalPrice }),
      });
      const data = await res.json();
      if (!data.success) {
        setAppliedCoupon(null);
        toast.error(data.message || "Invalid coupon");
        return;
      }
      setAppliedCoupon({
        code: data.coupon.code,
        discountAmount: data.coupon.discountAmount,
      });
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "checkout_coupon",
          JSON.stringify({
            code: data.coupon.code,
            discountAmount: data.coupon.discountAmount,
          })
        );
      }
      toast.success(`Coupon ${data.coupon.code} applied`);
    } catch {
      toast.error("Could not validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Your cart is empty</h2>
        <p className="mt-3 text-sm text-slate-600">
          Add a few products to see them appear here.
        </p>
        <Link
          href="/shop-without-sidebar"
          className="mt-6 inline-flex rounded-lg bg-[#ff7a1a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e7680d]"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_0.9fr]">
      <div className="space-y-4">
        {items.map((item: any) => (
          <div
            key={item.id}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-slate-50">
              <Image
                src={item.image || "/images/products/product-placeholder.svg"}
                alt={item.name}
                width={96}
                height={96}
                className="h-20 w-20 object-contain"
              />
            </div>

            <div className="flex-1">
              <Link
                href={`/products/${item.slug}`}
                className="text-lg font-semibold text-slate-900 hover:text-[#1c2ea3]"
              >
                {item.name}
              </Link>
              <p className="mt-1 text-sm text-slate-600">
                {formatPrice(item.price)} each
              </p>
              {(item.color || item.size) && (
                <p className="mt-1 text-sm text-slate-500">
                  {item.color ? `Color: ${item.color}` : ""}
                  {item.color && item.size ? " • " : ""}
                  {item.size ? `Size: ${item.size}` : ""}
                </p>
              )}

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => decrementItem(item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-lg text-slate-700 transition hover:border-[#1c2ea3] hover:text-[#1c2ea3]"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={item.quantity}
                  onChange={(e) => updateItemQuantity(item.id, Number(e.target.value))}
                  onBlur={(e) => {
                    if (!e.target.value || Number(e.target.value) < 1) {
                      updateItemQuantity(item.id, 1);
                    }
                  }}
                  className="h-8 w-16 rounded-lg border border-slate-300 bg-white text-center text-sm font-semibold text-slate-900 outline-none focus:border-[#1c2ea3]"
                  aria-label="Quantity"
                />
                <button
                  onClick={() => incrementItem(item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-lg text-slate-700 transition hover:border-[#1c2ea3] hover:text-[#1c2ea3]"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-lg font-semibold text-slate-900">
                {formatPrice(item.price * item.quantity)}
              </p>
              <button
                onClick={() => removeItem(item.id)}
                className="mt-3 text-sm font-medium text-red-500 transition hover:text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() => clearCart()}
          className="text-sm font-semibold text-slate-600 transition hover:text-[#1c2ea3]"
        >
          Clear cart
        </button>
      </div>

      <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Order summary</h2>
        <div className="mt-5 space-y-3 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Items</span>
            <span>{cartCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          {appliedCoupon && (
            <div className="flex items-center justify-between text-[#ff7a1a]">
              <span>Discount ({appliedCoupon.code})</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatPrice(payable)}</span>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Promo code"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={applyCoupon}
            disabled={couponLoading}
            className="rounded-lg border border-[#1c2ea3] px-3 py-2 text-sm font-semibold text-[#1c2ea3] hover:bg-[#eef2ff] disabled:opacity-50"
          >
            {couponLoading ? "..." : "Apply"}
          </button>
        </div>

        <button
          type="button"
          onClick={goToCheckout}
          className="mt-6 flex w-full justify-center rounded-lg bg-[#ff7a1a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e7680d]"
        >
          Proceed to checkout
        </button>
        <Link
          href="/shop-without-sidebar"
          className="mt-3 flex w-full justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#1c2ea3] hover:text-[#1c2ea3]"
        >
          Continue shopping
        </Link>
      </aside>
    </div>
  );
};

export default CartPageContent;
