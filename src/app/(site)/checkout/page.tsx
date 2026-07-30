import { createPageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CheckoutForm from "@/components/Checkout/CheckoutForm";
import { getSiteSettings } from "@/get-api-data/site-settings";
import Link from "next/link";

export async function generateMetadata() {
  return createPageMetadata("Checkout");
}

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  const siteSettings = await getSiteSettings();

  const paymentSettings = {
    momoPhone: siteSettings?.momoPhone ?? null,
    momoAccountName: siteSettings?.momoAccountName ?? null,
    momoEnabled: siteSettings?.momoEnabled ?? true,
    bankCardsEnabled: siteSettings?.bankCardsEnabled ?? false,
    bankCardsMessage: siteSettings?.bankCardsMessage ?? "Coming soon",
    codEnabled: siteSettings?.codEnabled ?? true,
  };

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
                href="/signin?callbackUrl=/checkout"
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

  if (session.user.role === "ADMIN" || session.user.role === "STORE_KEEPER") {
    return (
      <main className="min-h-[80vh] bg-slate-50 py-14">
        <div className="mx-auto max-w-lg px-4 sm:px-6">
          <div className="rounded-2xl border border-amber-200 bg-white p-8 shadow-sm text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-8 w-8 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Staff cannot place orders</h1>
            <p className="mt-3 text-sm text-slate-600">
              Admin and store keeper accounts are for managing the store only. Please sign in with a customer account to buy products.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href={session.user.role === "STORE_KEEPER" ? "/storekeeper/dashboard" : "/admin/dashboard"}
                className="inline-flex items-center justify-center rounded-lg bg-[#02AAA4] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#028f86]"
              >
                Go to dashboard
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to store
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
        <CheckoutForm user={session.user} paymentSettings={paymentSettings} />
      </div>
    </main>
  );
}