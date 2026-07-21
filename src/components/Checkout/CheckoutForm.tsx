"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/formatePrice";
import { useRouter } from "next/navigation";

type PaymentMethod = "mtn" | "momo" | "cod";

type User = {
  id?: string;
  name?: string | null;
  email?: string | null;
};

type Props = {
  user?: User;
};

const PAYMENT_METHODS: { value: PaymentMethod; label: string; description: string }[] = [
  {
    value: "mtn",
    label: "MTN Mobile Money",
    description: "Pay securely with MTN Mobile Money",
  },
  {
    value: "momo",
    label: "MoMo Pay",
    description: "Pay quickly with MoMo Pay (MTN)",
  },
  {
    value: "cod",
    label: "Cash on Delivery",
    description: "Pay when you receive your order",
  },
];

const CheckoutForm = ({ user }: Props) => {
  const { cartDetails, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const items = Object.values(cartDetails ?? {});

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (items.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            userId: user?.id,
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
          },
          items,
          totalPrice,
          paymentMethod,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to place order.");
      }

      clearCart();
      setMessage("Order placed successfully. Thank you!");
      router.push("/cart");
    } catch (error: any) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Shipping Details */}
        <h2 className="text-xl font-semibold text-slate-900">Shipping details</h2>
        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
            <input
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#02AAA4]"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#02AAA4]"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
            <input
              required
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#02AAA4]"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Address</label>
            <textarea
              required
              rows={4}
              value={form.address}
              onChange={(event) => setForm({ ...form, address: event.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#02AAA4]"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900">Payment method</h2>
          <div className="mt-4 space-y-3">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                  paymentMethod === method.value
                    ? "border-[#02AAA4] bg-[#02AAA4]/5"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={paymentMethod === method.value}
                  onChange={() => setPaymentMethod(method.value)}
                  className="mt-0.5 h-4 w-4 accent-[#02AAA4]"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">{method.label}</p>
                  <p className="text-xs text-slate-500">{method.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {message ? (
          <p className={`mt-4 text-sm ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[#02AAA4] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#028f86] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Placing order...
            </span>
          ) : (
            "Place order"
          )}
        </button>
      </form>

      <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Your order</h2>
        <div className="mt-5 space-y-3 text-sm text-slate-600">
          {items.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between gap-3">
                <span>{item.name} × {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
            <span>Shipping</span>
            <span className="text-green-600">Free</span>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-200 pt-4 text-base font-semibold text-slate-900">
          <div className="flex items-center justify-between">
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-slate-100 p-3 text-xs text-slate-500">
          <p className="font-medium text-slate-700">Payment: {PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label}</p>
        </div>

        <Link href="/cart" className="mt-4 inline-flex text-sm font-semibold text-[#02AAA4] hover:text-[#028f86]">
          Back to cart
        </Link>
      </aside>
    </div>
  );
};

export default CheckoutForm;