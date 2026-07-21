import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Dashboard | ROXY TECH",
};

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <main className="min-h-[80vh] py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h1 className="text-3xl font-semibold text-slate-900">Access denied</h1>
          <p className="mt-4 text-base text-slate-600">You must be an admin to view this page.</p>
        </div>
      </main>
    );
  }

  const quickActions = [
    { title: "New Category", href: "/admin/categories", desc: "Add a new product category" },
    { title: "New Product", href: "/admin/products/new", desc: "Add a new product to the store" },
    { title: "View Orders", href: "/admin/orders", desc: "Manage customer orders" },
    { title: "Settings", href: "/admin/settings", desc: "Update site settings" },
  ];

  return (
    <main className="min-h-[80vh] bg-gray-50 py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - hidden on mobile by default, shown on lg+ */}
          <div className="hidden lg:block lg:w-[240px] shrink-0">
            <AdminSidebar />
          </div>

          {/* Mobile sidebar toggle - visible on small screens */}
          <details className="lg:hidden">
            <summary className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm">
              ☰ Admin Menu
            </summary>
            <div className="mt-2">
              <AdminSidebar />
            </div>
          </details>

          {/* Main Content */}
          <section className="flex-1 min-w-0">
            <div className="bg-white border rounded-lg p-4 sm:p-6 shadow-sm">
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Admin Dashboard</h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                Welcome back, {session.user.name || session.user.email}. Manage your store from here.
              </p>

              {/* Stats Cards */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                  <h3 className="font-semibold text-slate-900">Quick actions</h3>
                  <p className="text-sm text-slate-500 mt-1">Create categories, products, view orders</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                  <h3 className="font-semibold text-slate-900">Site stats</h3>
                  <p className="text-sm text-slate-500 mt-1">Sales, orders and activity</p>
                </div>
              </div>

              {/* Quick Action Links */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="block rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-[#02AAA4] hover:bg-[#02AAA4]/5"
                  >
                    <h4 className="font-medium text-slate-900">{action.title}</h4>
                    <p className="mt-1 text-sm text-slate-500">{action.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}