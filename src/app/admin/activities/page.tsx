import { createPageMetadata } from "@/lib/metadata";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminActivitiesClient from "@/components/Admin/AdminActivitiesClient";

export async function generateMetadata() {
  return createPageMetadata("Activity Log");
}

export default async function AdminActivitiesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <main className="min-h-[80vh] py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h1 className="text-3xl font-semibold text-slate-900">Access denied</h1>
        </div>
      </main>
    );
  }

  return (
    <AdminLayout
      title="Activity Log"
      description="Complete audit trail of all system actions. Filter by user, action type, module, or date range."
    >
      <AdminActivitiesClient />
    </AdminLayout>
  );
}
