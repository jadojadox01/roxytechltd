"use client";

import Link from "next/link";
import Image from "next/image";
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
    clearCart,
  } = useCart();

  const items = Object.values(cartDetails ?? {});

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Your cart is empty</h2>
        <p className="mt-3 text-sm text-slate-600">
          Add a few products to see them appear here.
        </p>
        <Link
          href="/shop-without-sidebar"
          className="mt-6 inline-flex rounded-lg bg-[#02AAA4] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#028f86]"
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
                className="text-lg font-semibold text-slate-900 hover:text-[#02AAA4]"
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
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-lg text-slate-700 transition hover:border-[#02AAA4] hover:text-[#02AAA4]"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="min-w-8 text-center text-sm font-semibold text-slate-900">
                  {item.quantity}
                </span>
                <button
                  onClick={() => incrementItem(item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-lg text-slate-700 transition hover:border-[#02AAA4] hover:text-[#02AAA4]"
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
          className="text-sm font-semibold text-slate-600 transition hover:text-[#02AAA4]"
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
          <div className="flex items-center justify-between text-base font-semibold text-slate-900">
            <span>Subtotal</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>

        <Link
          href="/checkout"
          className="mt-6 flex w-full justify-center rounded-lg bg-[#02AAA4] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#028f86]"
        >
          Proceed to checkout
        </Link>
        <Link
          href="/shop-without-sidebar"
          className="mt-3 flex w-full justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#02AAA4] hover:text-[#02AAA4]"
        >
          Continue shopping
        </Link>
      </aside>
    </div>
  );
};

export default CartPageContent;
