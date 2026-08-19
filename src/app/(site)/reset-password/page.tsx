"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PasswordInput from "@/components/Common/PasswordInput";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[80vh] py-14">
          <div className="mx-auto max-w-md px-4 sm:px-6">
            <h1 className="text-3xl font-semibold text-slate-900">Reset password</h1>
            <p className="mt-3 text-sm text-slate-600">Loading...</p>
          </div>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("This reset link is invalid. Request a new one.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Unable to reset password.");
        return;
      }
      setSuccess(data.message || "Password updated.");
      setTimeout(() => router.push("/signin"), 1500);
    } catch {
      setError("Unable to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="min-h-[80vh] py-14">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <h1 className="text-3xl font-semibold text-slate-900">Reset password</h1>
          <p className="mt-3 text-sm text-red-600">
            This reset link is missing or invalid.
          </p>
          <p className="mt-6 text-sm text-slate-600">
            <Link href="/forgot-password" className="font-medium text-slate-900">
              Request a new reset link
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[80vh] py-14">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <h1 className="text-3xl font-semibold text-slate-900">Choose a new password</h1>
        <p className="mt-3 text-sm text-slate-600">
          Enter a new password for your account. The link from your email must still be valid.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">New password</label>
            <div className="mt-2">
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="rounded-lg border border-slate-300 px-4 py-3 focus:border-slate-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Confirm password</label>
            <div className="mt-2">
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="rounded-lg border border-slate-300 px-4 py-3 focus:border-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-700">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#02AAA4] px-4 py-3 text-white hover:bg-[#028f86] disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link href="/signin" className="font-medium text-slate-900">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
