import { createPageMetadata } from "@/lib/metadata";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClientInstance } from "@/lib/prismaDB";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminHeroClient from "@/components/Admin/AdminHeroClient";

export async function generateMetadata() {
  return createPageMetadata("Homepage Hero");
}

export default async function AdminHeroPage() {
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

  const products = await prismaClientInstance.product.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true },
  });

  return (
    <AdminLayout
      title="Homepage Hero Slideshow"
      description="Create moving hero slides with images, headlines, descriptions, discount badges, and shop buttons."
    >
      <AdminHeroClient products={products} />
    </AdminLayout>
  );
}
