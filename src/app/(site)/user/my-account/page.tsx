import { createPageMetadata } from "@/lib/metadata";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClientInstance } from "@/lib/prismaDB";
import UserAccountLayout from "@/components/User/UserAccountLayout";
import MyAccountClient from "./MyAccountClient";
import Link from "next/link";

export async function generateMetadata() {
  return createPageMetadata("My Account");
}

export default async function MyAccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center px-4 py-14">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Sign in required</h1>
          <p className="mt-2 text-slate-600">Please sign in to view your account.</p>
          <a
            href="/signin"
            className="mt-6 inline-flex rounded-xl bg-blue px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-dark"
          >
            Sign in
          </a>
        </div>
      </main>
    );
  }

  const orders = await prismaClientInstance.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const transformedOrders = orders.map((order) => ({
    ...order,
    totalPrice: Number(order.totalPrice),
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
    })),
  }));

  const orderCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  return (
    <UserAccountLayout
      title="Account overview"
      description={`Welcome back, ${session.user.name || session.user.email}. Track orders and manage your profile.`}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue/5 to-teal/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total orders</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{orderCount}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{pendingCount}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
          <Link
            href="/user/my-account/settings"
            className="inline-flex rounded-xl border border-blue/20 bg-blue/5 px-4 py-2 text-sm font-semibold text-blue transition hover:bg-blue/10"
          >
            Edit name & password
          </Link>
        </div>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Name</dt>
            <dd className="mt-1 font-medium text-slate-900">{session.user.name || "—"}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</dt>
            <dd className="mt-1 font-medium text-slate-900">{session.user.email}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Order history</h2>
        <MyAccountClient orders={JSON.parse(JSON.stringify(transformedOrders))} />
      </div>
    </UserAccountLayout>
  );
}
