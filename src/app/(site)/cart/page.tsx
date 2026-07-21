import type { Metadata } from "next";
import CartPageContent from "@/components/Cart/CartPageContent";

export const metadata: Metadata = {
  title: "Cart | ROXY TECH",
};

export default function CartPage() {
  return (
    <main className="min-h-[80vh] bg-slate-50 py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">Cart</h1>
          <p className="mt-2 text-base text-slate-600">
            Review your selected items and continue to checkout when you are ready.
          </p>
        </div>
        <CartPageContent />
      </div>
    </main>
  );
}
