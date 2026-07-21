import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClientInstance } from "@/lib/prismaDB";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import AdminDealsClient from "@/components/Admin/AdminDealsClient";

export const metadata: Metadata = {
  title: "Deals of the Day | ROXY TECH",
};

export default async function AdminDealsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return <div className="p-10 text-slate-700">Access denied</div>;
  }

  const products = await prismaClientInstance.product.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true },
  });

  return (
    <main className="min-h-[80vh] bg-slate-50 px-4 py-6 sm:px-6 sm:py-10 lg:py-14">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div>
          <AdminSidebar />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-900">Deals of the Day</h1>
            <p className="mt-1 text-sm text-slate-600">
              Create and manage the deal shown in the homepage countdown banner. The newest deal is displayed.
            </p>
          </div>
          <AdminDealsClient products={products} />
        </section>
      </div>
    </main>
  );
}
