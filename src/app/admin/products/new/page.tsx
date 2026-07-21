import AdminSidebar from '@/components/Admin/AdminSidebar';
import ProductForm from '@/components/Admin/ProductForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClientInstance } from '@/lib/prismaDB';

export default async function NewProductPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return <div className="p-10 text-slate-700">Access denied</div>;
  }

  const categories = await prismaClientInstance.category.findMany({ orderBy: { title: 'asc' } });

  return (
    <main className="min-h-[80vh] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold text-slate-900">Create Product</h1>
          <p className="mt-2 text-sm text-slate-600">Create a new product for your store.</p>

          <div className="mt-6">
            <ProductForm categories={categories} />
          </div>
        </section>
      </div>
    </main>
  );
}
