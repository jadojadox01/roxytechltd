import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="min-h-[70vh] bg-slate-50 flex items-center justify-center py-16">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Product not found</h1>
        <p className="mt-3 text-base text-slate-600">
          The product you're looking for doesn't exist or may have been removed.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/shop-without-sidebar"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0071CE] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#005fb0]"
          >
            Browse all products
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
