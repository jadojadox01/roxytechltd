import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import AdminMessagesClient from "@/components/Admin/AdminMessagesClient";

export default async function AdminMessagesPage() {
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
          <AdminSidebar />

          <section>
            <div className="rounded-lg border bg-white p-4 shadow-sm sm:p-6">
              <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Contact Messages</h1>
              <p className="mt-2 text-sm text-slate-600">
                Read and manage messages sent from the contact page.
              </p>

              <div className="mt-6">
                <AdminMessagesClient />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
