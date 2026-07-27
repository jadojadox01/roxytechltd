import { createPageMetadata } from "@/lib/metadata";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import UserAccountLayout from "@/components/User/UserAccountLayout";
import AccountSettingsForm from "@/components/Account/AccountSettingsForm";
import Link from "next/link";

export async function generateMetadata() {
  return createPageMetadata("Account Settings");
}

export default async function UserAccountSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center px-4 py-14">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Sign in required</h1>
          <p className="mt-2 text-slate-600">Please sign in to manage your account.</p>
          <Link
            href="/signin"
            className="mt-6 inline-flex rounded-xl bg-blue px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-dark"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <UserAccountLayout
      title="Account settings"
      description="Change your name, email address, and password."
    >
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <AccountSettingsForm theme="user" />
      </div>
    </UserAccountLayout>
  );
}
