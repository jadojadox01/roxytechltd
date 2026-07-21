import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Error | ROXY TECH",
};

export default function ErrorPage() {
  return (
    <main className="min-h-[80vh] py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="text-3xl font-semibold text-slate-900">Error</h1>
        <p className="mt-4 text-base text-slate-600">
          This is a generic error page. You can replace this with a custom error layout.
        </p>
      </div>
    </main>
  );
}
