import { createPageMetadata } from "@/lib/metadata";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StoreKeeperLayout from "@/components/StoreKeeper/StoreKeeperLayout";
import AccountSettingsForm from "@/components/Account/AccountSettingsForm";

export async function generateMetadata() {
  return createPageMetadata("Store Keeper Account");
}

export default async function StoreKeeperAccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "STORE_KEEPER") {
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
      title="My Account"
      description="Update your name, email, and password for warehouse operations."
    >
      <AccountSettingsForm theme="storekeeper" />
    </StoreKeeperLayout>
  );
}
