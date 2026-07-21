import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClientInstance } from "@/lib/prismaDB";
import MyAccountClient from "./MyAccountClient";

export const metadata: Metadata = {
  title: "My Account | ROXY TECH",
};

export default async function MyAccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <main className="min-h-[80vh] py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h1 className="text-3xl font-semibold text-slate-900">Not signed in</h1>
          <p className="mt-4 text-base text-slate-600">
            You must sign in to view your account.
          </p>
        </div>
      </main>
    );
  }

  const orders = await prismaClientInstance.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
  });

  const transformedOrders = orders.map((order) => ({
    ...order,
    totalPrice: Number(order.totalPrice),
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
    })),
  }));

  return (
    <main className="min-h-[80vh] bg-slate-50 py-14 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">My Account</h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Welcome back, {session.user.name || session.user.email}!
          </p>
        </div>

        {/* User Info Card */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="font-medium text-slate-500">Name:</span>
              <span className="ml-2 text-slate-900">{session.user.name || "—"}</span>
            </div>
            <div>
              <span className="font-medium text-slate-500">Email:</span>
              <span className="ml-2 text-slate-900">{session.user.email}</span>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">My Orders</h2>
          <MyAccountClient orders={JSON.parse(JSON.stringify(transformedOrders))} />
        </div>
      </div>
    </main>
  );
}