import { createPageMetadata } from "@/lib/metadata";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClientInstance } from "@/lib/prismaDB";
import Link from "next/link";
import TrackOrderClient from "./TrackOrderClient";

export async function generateMetadata() {
  return createPageMetadata("Track Order");
}

export default async function TrackOrderPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4 py-14">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Track your order</h1>
          <p className="mt-2 text-slate-600">
            Sign in to view the status of your orders.
          </p>
          <Link
            href="/signin?callbackUrl=/track-order"
            className="mt-6 inline-flex rounded-xl bg-[#1c2ea3] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#16257e]"
          >
            Sign in to track
          </Link>
        </div>
      </main>
    );
  }

  if (session.user.role === "ADMIN" || session.user.role === "STORE_KEEPER") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4 py-14">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Customer tracking only</h1>
          <p className="mt-2 text-slate-600">
            Staff accounts manage orders from the dashboard.
          </p>
          <Link
            href={session.user.role === "ADMIN" ? "/admin" : "/storekeeper"}
            className="mt-6 inline-flex rounded-xl bg-[#1c2ea3] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#16257e]"
          >
            Go to dashboard
          </Link>
        </div>
      </main>
    );
  }

  try {
    await prismaClientInstance.$executeRawUnsafe(
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentEvidence" TEXT`
    );
  } catch {
    // ignore
  }

  const orders = await prismaClientInstance.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const transformedOrders = orders.map((order) => ({
    id: order.id,
    status: order.status,
    totalPrice: Number(order.totalPrice),
    paymentMethod: order.paymentMethod,
    paymentEvidence: (order as { paymentEvidence?: string | null }).paymentEvidence ?? null,
    shippingName: order.shippingName,
    shippingAddress: order.shippingAddress,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      productTitle: item.productTitle,
      quantity: item.quantity,
      price: Number(item.price),
    })),
  }));

  return (
    <main className="min-h-[70vh] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Track Order</h1>
          <p className="mt-2 text-sm text-slate-600">
            Follow the status of every order placed with your account.
          </p>
        </div>
        <TrackOrderClient orders={transformedOrders} />
      </div>
    </main>
  );
}
