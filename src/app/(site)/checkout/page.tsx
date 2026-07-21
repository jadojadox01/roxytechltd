import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CheckoutForm from "@/components/Checkout/CheckoutForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Checkout | ROXY TECH",
};

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);

  // If not logged in, show sign in / create account prompt
  if (!session?.user) {
    return (
      <main className="min-h-[80vh] bg-slate-50 py-14">
        <div className="mx-auto max-w-lg px-4 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#02AAA4]/10">
              <svg className="h-8 w-8 text-[#02AAA4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Sign in to checkout</h1>
            <p className="mt-3 text-sm text-slate-600">
              You need to be signed in to place an order. Please sign in or create an account to continue.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/signin"
                className="inline-flex items-center justify-center rounded-lg bg-[#02AAA4] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#028f86]"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[80vh] bg-slate-50 py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">Checkout</h1>
          <p className="mt-2 text-base text-slate-600">
            Complete your order by filling in your shipping details below.
          </p>
        </div>
        <CheckoutForm user={session.user} />
      </div>
    </main>
  );
}