import { createPageMetadata } from "@/lib/metadata";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StoreKeeperLayout from "@/components/StoreKeeper/StoreKeeperLayout";
import StoreKeeperDashboardClient from "@/components/StoreKeeper/StoreKeeperDashboardClient";

export async function generateMetadata() {
  return createPageMetadata("Operations Dashboard");
}

export default async function StoreKeeperDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user.role !== "STORE_KEEPER" && session.user.role !== "ADMIN")) {
    return (
      <main className="min-h-[80vh] py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h1 className="text-3xl font-semibold text-slate-900">Access denied</h1>
          <p className="mt-4 text-base text-slate-600">Store keeper access required.</p>
        </div>
      </main>
    );
  }

  return (
    <StoreKeeperLayout
      title="Operations Dashboard"
      description={`Welcome, ${session.user.name || session.user.email}. Manage daily store operations.`}
    >
      <StoreKeeperDashboardClient />
    </StoreKeeperLayout>
  );
}
