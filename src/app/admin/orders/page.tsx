import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminOrdersPage() {
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

  return (
    <main className="min-h-[80vh] bg-gray-50 py-6 sm:py-10 lg:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          {/* Sidebar renders mobile hamburger internally */}
          <div>
            <div className="hidden lg:block">
              <AdminSidebar />
            </div>
            <div className="lg:hidden">
              <AdminSidebar />
            </div>
          </div>

          <section>
            <div className="bg-white border rounded-lg p-4 sm:p-6 shadow-sm">
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Orders</h1>
              <p className="mt-2 text-sm text-slate-600">
                View orders placed by clients. Approve or reject orders here.
              </p>

              <div className="mt-6">
                <AdminOrdersClient />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}