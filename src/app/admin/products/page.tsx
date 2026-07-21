import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import ProductList from "@/components/Admin/ProductList";

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return <div className="p-10 text-slate-700">Access denied</div>;
  }

  return (
    <main className="min-h-[80vh] bg-slate-50 px-4 py-6 sm:px-6 sm:py-10 lg:py-14">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div>
          <div className="hidden lg:block">
            <AdminSidebar />
          </div>
          <div className="lg:hidden">
            <AdminSidebar />
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
              <p className="mt-1 text-sm text-slate-600">Create, view, update, and delete products from one place.</p>
            </div>
            <a
              href="/admin/products/new"
              className="inline-flex items-center justify-center rounded-lg bg-[#0071CE] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#005fb0] whitespace-nowrap"
            >
              + Create Product
            </a>
          </div>

          <div className="mt-6">
            <ProductList />
          </div>
        </section>
      </div>
    </main>
  );
}
