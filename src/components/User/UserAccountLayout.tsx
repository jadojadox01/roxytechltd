import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSiteName } from "@/get-api-data/seo-setting";
import UserAccountSidebar from "@/components/User/UserAccountSidebar";

export default async function UserAccountLayout({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
}) {
  const session = await getServerSession(authOptions);
  const siteName = await getSiteName();
  const userName = session?.user?.name || session?.user?.email || "Customer";

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50/80 to-white pt-28 pb-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="w-full shrink-0 lg:w-64">
            <UserAccountSidebar siteName={siteName} userName={userName} />
          </div>

          <section className="min-w-0 flex-1 space-y-6">
            <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue">
                {siteName} · Customer
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
              {description && (
                <p className="mt-2 text-sm text-slate-600 sm:text-base">{description}</p>
              )}
            </div>
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
