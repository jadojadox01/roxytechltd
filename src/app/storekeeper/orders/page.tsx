import { createPageMetadata } from "@/lib/metadata";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StoreKeeperLayout from "@/components/StoreKeeper/StoreKeeperLayout";
import StoreKeeperOrdersClient from "@/components/StoreKeeper/StoreKeeperOrdersClient";

export async function generateMetadata() {
  return createPageMetadata("Orders");
}

export default async function StoreKeeperOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user.role !== "STORE_KEEPER" && session.user.role !== "ADMIN")) {
    return (
      <main className="min-h-[80vh] py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h1 className="text-3xl font-semibold text-slate-900">Access denied</h1>
        </div>
      </main>
    );
  }

  return (
    <StoreKeeperLayout
      title="Order Management"
      description="View, prepare, and update order status through the fulfillment workflow."
    >
      <StoreKeeperOrdersClient />
    </StoreKeeperLayout>
  );
}
