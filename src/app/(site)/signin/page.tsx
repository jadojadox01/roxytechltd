"use client";

import React, { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        setError(result.error || "Invalid email or password.");
        setLoading(false);
        return;
      }

      // Check session role and redirect accordingly
      const session = await getSession();
      if (session?.user?.role === "ADMIN") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] py-14">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <h1 className="text-3xl font-semibold text-slate-900">Sign in to your account</h1>
        <p className="mt-3 text-sm text-slate-600">Enter your credentials below.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <a href="/forgot-password" className="text-sm text-slate-500 hover:text-slate-700">Forgot?</a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-slate-500 focus:outline-none"
            />
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
            className="w-full rounded-lg bg-[#02AAA4] px-4 py-3 text-white hover:bg-[#028f86] disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Don’t have an account? <a href="/signup" className="text-slate-900 font-medium">Create one</a>
        </div>
      </div>
    </main>
  );
}
