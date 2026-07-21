import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | ROXY TECH",
};

export default function TermsConditionsPage() {
  return (
    <main className="min-h-[80vh] py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="text-3xl font-semibold text-slate-900">Terms & Conditions</h1>
        <p className="mt-4 text-base text-slate-600">
          This is the terms and conditions page placeholder. Add your legal terms here.
        </p>
      </div>
    </main>
  );
}
