import { createPageMetadata } from "@/lib/metadata";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import AdminLayout from "@/components/Admin/AdminLayout";

import AdminSettingsClient from "./AdminSettingsClient";



export async function generateMetadata() {

  return createPageMetadata("Site Settings");

}



export default async function AdminSettingsPage() {

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

    <AdminLayout

      title="Site Settings"

      description="Manage your store name, logo, contact details, currency, and social links."

    >

      <AdminSettingsClient />

    </AdminLayout>

  );

}

