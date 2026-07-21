import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClientInstance } from "@/lib/prismaDB";
import CategoryForm from "@/components/Admin/CategoryForm";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import CategoryList from "@/components/Admin/CategoryList";

export default async function AdminCategoriesPage() {
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

  const categories = await prismaClientInstance.category.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <main className="min-h-[80vh] py-14 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          <div>
            <div className="hidden lg:block">
              <AdminSidebar />
            </div>
            <div className="lg:hidden">
              <AdminSidebar />
            </div>
          </div>

          <section>
            <div className="bg-white border rounded p-6 shadow-sm">
              <h1 className="text-3xl font-semibold text-slate-900">Categories</h1>
              <p className="mt-2 text-sm text-slate-600">Create, edit and delete categories.</p>

              <div className="mt-6">
                  <h2 className="text-xl font-medium">Create Category</h2>
                  <div className="mt-3">
                    <CategoryForm />
                  </div>
                </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-medium">Existing Categories</h2>
                <div className="mt-4">
                  <CategoryList categories={categories} />
                </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
