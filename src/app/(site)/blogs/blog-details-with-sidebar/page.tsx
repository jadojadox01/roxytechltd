import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Details with Sidebar | ROXY TECH",
};

export default function BlogDetailsWithSidebarPage() {
  return (
    <main className="min-h-[80vh] py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="text-3xl font-semibold text-slate-900">Blog Details with Sidebar</h1>
        <p className="mt-4 text-base text-slate-600">
          This is the blog details with sidebar page placeholder. Add post details and sidebar widgets here.
        </p>
      </div>
    </main>
  );
}
