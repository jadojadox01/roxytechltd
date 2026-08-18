"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutOnThisSite } from "@/lib/sign-out";

const navItems = [
  { href: "/user/my-account", label: "Overview", exact: true, icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/track-order", label: "Track Order", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { href: "/user/my-account/settings", label: "Account settings", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { href: "/wishlist", label: "Wishlist", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  { href: "/cart", label: "Cart", icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" },
  { href: "/shop-without-sidebar", label: "Continue shopping", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
];

export default function UserAccountSidebar({
  siteName,
  userName,
}: {
  siteName: string;
  userName: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm lg:sticky lg:top-28">
      <div className="mb-6 rounded-xl bg-gradient-to-br from-blue to-teal p-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">{siteName}</p>
        <p className="mt-1 text-base font-bold">My Account</p>
        <p className="mt-2 truncate text-sm text-blue-50">{userName}</p>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-blue/10 font-semibold text-blue"
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue"
              }`}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => void signOutOnThisSite("/")}
        className="mt-6 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
      >
        Sign out
      </button>
    </aside>
  );
}
