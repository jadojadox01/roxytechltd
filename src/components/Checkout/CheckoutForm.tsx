"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/formatePrice";
import { useRouter } from "next/navigation";

type PaymentMethod = "momo" | "cards" | "cod";

export type PaymentSettings = {
  momoPhone: string | null;
  momoAccountName: string | null;
  momoEnabled: boolean;
  bankCardsEnabled: boolean;
  bankCardsMessage: string | null;
  codEnabled: boolean;
};

type User = {
  id?: string;
  name?: string | null;
  email?: string | null;
};

type Props = {
  user?: User;
  paymentSettings: PaymentSettings;
};

const CheckoutForm = ({ user, paymentSettings }: Props) => {
  const { cartDetails, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
  });

  const availableMethods: PaymentMethod[] = [];
  if (paymentSettings.momoEnabled) availableMethods.push("momo");
  if (paymentSettings.bankCardsEnabled) availableMethods.push("cards");
  if (paymentSettings.codEnabled) availableMethods.push("cod");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    availableMethods[0] ?? "cod"
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("checkout_coupon");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.code) setCouponCode(String(parsed.code));
      }
    } catch {
      // ignore
    }
  }, []);

  const items = Object.values(cartDetails ?? {});
  const bankCardsMessage = paymentSettings.bankCardsMessage?.trim() || "Coming soon";

  const paymentLabels: Record<PaymentMethod, string> = {
    momo: "MTN Mobile Money",
    cards: "Bank Cards",
    cod: "Cash on Delivery",
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (items.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    if (paymentMethod === "cards" && !paymentSettings.bankCardsEnabled) {
      setMessage(bankCardsMessage);
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
          couponCode: couponCode || undefined,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to place order.");
      }

      clearCart();
      try {
        sessionStorage.removeItem("checkout_coupon");
      } catch {
        // ignore
      }
      setMessage("Order placed successfully. Thank you!");
      router.push("/cart");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900">Payment method</h2>
          <div className="mt-4 space-y-3">
            {paymentSettings.momoEnabled && (
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                  paymentMethod === "momo"
                    ? "border-[#02AAA4] bg-[#02AAA4]/5"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="momo"
                  checked={paymentMethod === "momo"}
                  onChange={() => setPaymentMethod("momo")}
                  className="mt-1 h-4 w-4 accent-[#02AAA4]"
                />
                <div className="flex flex-1 items-start gap-3">
                  <Image
                    src="/images/payment/momo.png"
                    alt="MTN Mobile Money"
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-md object-contain"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">MTN Mobile Money</p>
                    <p className="text-xs text-slate-500">
                      Pay to{" "}
                      <span className="font-medium text-slate-700">
                        {paymentSettings.momoAccountName || "Account holder"}
                      </span>
                      {paymentSettings.momoPhone ? (
                        <>
                          {" "}
                          on <span className="font-medium text-slate-700">{paymentSettings.momoPhone}</span>
                        </>
                      ) : null}
                    </p>
                  </div>
                </div>
              </label>
            )}

            <div
              className={`flex items-start gap-3 rounded-lg border p-4 ${
                paymentSettings.bankCardsEnabled
                  ? paymentMethod === "cards"
                    ? "border-[#02AAA4] bg-[#02AAA4]/5"
                    : "border-slate-200"
                  : "border-slate-200 bg-slate-50 opacity-80"
              }`}
            >
              {paymentSettings.bankCardsEnabled ? (
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cards"
                  checked={paymentMethod === "cards"}
                  onChange={() => setPaymentMethod("cards")}
                  className="mt-1 h-4 w-4 accent-[#02AAA4]"
                />
              ) : (
                <span className="mt-1 inline-flex h-4 w-4 rounded-full border border-slate-300 bg-slate-100" />
              )}
              <div className="flex flex-1 items-start gap-3">
                <Image
                  src="/images/payment/bank-cards.png"
                  alt="Bank cards"
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-md object-contain"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">Bank Cards</p>
                  <p className="text-xs text-amber-700">{bankCardsMessage}</p>
                </div>
              </div>
            </div>

            {paymentSettings.codEnabled && (
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                  paymentMethod === "cod"
                    ? "border-[#02AAA4] bg-[#02AAA4]/5"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mt-1 h-4 w-4 accent-[#02AAA4]"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">Cash on Delivery</p>
                  <p className="text-xs text-slate-500">Pay when you receive your order</p>
                </div>
              </label>
            )}
          </div>

          {paymentMethod === "momo" && (paymentSettings.momoPhone || paymentSettings.momoAccountName) && (
            <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">MoMo payment instructions</p>
              <p className="mt-2">
                Send your payment to{" "}
                <span className="font-semibold">{paymentSettings.momoAccountName || "the account holder"}</span>
                {paymentSettings.momoPhone ? (
                  <>
                    {" "}
                    at <span className="font-semibold">{paymentSettings.momoPhone}</span>
                  </>
                ) : null}
                . Use your order total as the reference and keep your transaction ID.
              </p>
            </div>
          )}
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
          {loading ? "Placing order..." : "Place order"}
        </button>
      </form>

      <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Your order</h2>
        <div className="mt-5 space-y-3 text-sm text-slate-600">
          {items.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3">
                <span>
                  {item.name} × {item.quantity}
                </span>
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
          <p className="font-medium text-slate-700">Payment: {paymentLabels[paymentMethod]}</p>
        </div>

        <Link href="/cart" className="mt-4 inline-flex text-sm font-semibold text-[#02AAA4] hover:text-[#028f86]">
          Back to cart
        </Link>
      </aside>
    </div>
  );
};

export default CheckoutForm;
