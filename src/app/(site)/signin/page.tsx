"use client";

import React, { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import PasswordInput from "@/components/Common/PasswordInput";

function getRedirectPath(role?: string | null, callbackUrl?: string | null) {
  if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    return callbackUrl;
  }
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "STORE_KEEPER") return "/storekeeper/dashboard";
  return "/";
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[80vh] bg-slate-50 py-14">
          <div className="mx-auto max-w-md px-4 sm:px-6">
            <h1 className="text-3xl font-black text-slate-900">Sign in to your account</h1>
            <p className="mt-3 text-sm text-slate-600">Loading...</p>
          </div>
        </main>
      }
    >
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const idleLogout = searchParams.get("reason") === "idle";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        remember,
      });

      if (result?.error) {
        const friendly =
          result.error === "CredentialsSignin"
            ? "Invalid email or password."
            : result.error;
        setError(friendly);
        setLoading(false);
        return;
      }

      // Fetch fresh session after login (getSession() can be stale immediately after signIn)
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const redirectPath = getRedirectPath(session?.user?.role, callbackUrl);

      window.location.href = redirectPath;
    } catch {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] bg-slate-50 py-14">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <div className="mb-6 rounded-3xl border border-[#e0e7ff] bg-gradient-to-r from-[#1a255f] to-[#24337f] p-6 text-white shadow-sm">
          <h1 className="text-3xl font-black">Sign in to your account</h1>
          <p className="mt-2 text-sm text-white/85">Enter your credentials below.</p>
        </div>
        {idleLogout && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            You were signed out after 2 minutes of inactivity.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-[#e8ecff] bg-white p-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-[#eadbcf] bg-[#fcf7f2] px-4 py-3 focus:border-[#ff7a1a] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <a href="/forgot-password" className="text-sm text-slate-500 hover:text-slate-700">Forgot?</a>
            </div>
            <div className="mt-2">
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="rounded-lg border border-[#eadbcf] bg-[#fcf7f2] px-4 py-3 focus:border-[#ff7a1a] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="remember"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            />
            <label htmlFor="remember" className="text-sm text-slate-700">Remember me</label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#ff7a1a] px-4 py-3 text-white transition hover:bg-[#e7680d] disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account? <a href="/signup" className="font-semibold text-[#1c2ea3]">Create one</a>
        </div>
      </div>
    </main>
  );
}
