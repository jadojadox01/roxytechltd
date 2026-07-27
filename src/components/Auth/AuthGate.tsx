"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type GateMode = "auth" | "staff";

type AuthGateContextValue = {
  requireCustomer: (action: () => void) => boolean;
  isStaff: boolean;
  isAuthenticated: boolean;
};

const AuthGateContext = createContext<AuthGateContextValue | null>(null);

function isStaffRole(role?: string | null) {
  return role === "ADMIN" || role === "STORE_KEEPER";
}

export function AuthGateProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<GateMode>("auth");

  const isAuthenticated = Boolean(session?.user);
  const isStaff = isStaffRole(session?.user?.role);

  const requireCustomer = useCallback(
    (action: () => void) => {
      if (status === "loading") return false;

      if (!session?.user) {
        setMode("auth");
        setOpen(true);
        return false;
      }

      if (isStaffRole(session.user.role)) {
        setMode("staff");
        setOpen(true);
        return false;
      }

      action();
      return true;
    },
    [session, status]
  );

  const value = useMemo(
    () => ({ requireCustomer, isStaff, isAuthenticated }),
    [requireCustomer, isStaff, isAuthenticated]
  );

  return (
    <AuthGateContext.Provider value={value}>
      {children}
      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {mode === "auth" ? (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#02AAA4]/10">
                  <svg className="h-7 w-7 text-[#02AAA4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="mt-4 text-center text-xl font-semibold text-slate-900">
                  Account required
                </h2>
                <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">
                  You need an account to buy this product. Sign in or create an account to continue to checkout.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/signin?callbackUrl=/checkout"
                    onClick={() => setOpen(false)}
                    className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#02AAA4] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#028f86]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Create account
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                  <svg className="h-7 w-7 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                <h2 className="mt-4 text-center text-xl font-semibold text-slate-900">
                  Staff accounts cannot order
                </h2>
                <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">
                  Admin and store keeper accounts are for managing the store only. Please use a customer account to place an order.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#02AAA4] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#028f86]"
                  >
                    Got it
                  </button>
                  <Link
                    href={session?.user?.role === "STORE_KEEPER" ? "/storekeeper/dashboard" : "/admin/dashboard"}
                    onClick={() => setOpen(false)}
                    className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Go to dashboard
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </AuthGateContext.Provider>
  );
}

export function useAuthGate() {
  const ctx = useContext(AuthGateContext);
  if (!ctx) {
    return {
      requireCustomer: (action: () => void) => {
        action();
        return true;
      },
      isStaff: false,
      isAuthenticated: false,
    };
  }
  return ctx;
}
