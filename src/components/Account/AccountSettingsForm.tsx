"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

type Theme = "admin" | "storekeeper" | "user";

type Profile = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const themes: Record<
  Theme,
  {
    input: string;
    label: string;
    section: string;
    button: string;
    badge: string;
    card: string;
  }
> = {
  admin: {
    input:
      "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20",
    label: "mb-1.5 block text-sm font-medium text-slate-700",
    section: "border-b border-slate-100 pb-8",
    button:
      "inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60",
    badge: "bg-teal-100 text-teal-800",
    card: "rounded-xl bg-slate-50 px-4 py-3",
  },
  storekeeper: {
    input:
      "w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20",
    label: "mb-1.5 block text-sm font-medium text-slate-700",
    section: "border-b border-amber-100 pb-8",
    button:
      "inline-flex items-center justify-center rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60",
    badge: "bg-amber-100 text-amber-900",
    card: "rounded-xl bg-amber-50/80 px-4 py-3",
  },
  user: {
    input:
      "w-full rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/20",
    label: "mb-1.5 block text-sm font-medium text-slate-700",
    section: "border-b border-blue-50 pb-8",
    button:
      "inline-flex items-center justify-center rounded-xl bg-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-dark disabled:opacity-60",
    badge: "bg-blue/10 text-blue",
    card: "rounded-xl bg-blue-50/50 px-4 py-3",
  },
};

export default function AccountSettingsForm({ theme }: { theme: Theme }) {
  const { update } = useSession();
  const t = themes[theme];

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/account/profile");
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to load profile");
      setProfile(data.user);
      setName(data.user.name || "");
      setEmail(data.user.email || "");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const emailChanged = email.trim() !== profile.email;
    if (emailChanged && !currentPassword) {
      toast.error("Enter your current password to change email");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || null,
          email: email.trim(),
          ...(emailChanged ? { currentPassword } : {}),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Update failed");

      setProfile(data.user);
      await update({ name: data.user.name, email: data.user.email });
      if (emailChanged) setCurrentPassword("");
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!currentPassword) {
      toast.error("Enter your current password");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Password update failed");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Password update failed");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">Could not load your account details.</p>
    );
  }

  const roleLabel = profile.role.replace(/_/g, " ");

  return (
    <div className="space-y-8">
      <div className={`grid gap-4 sm:grid-cols-3 ${t.card}`}>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Role</p>
          <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${t.badge}`}>
            {roleLabel}
          </span>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
          <p className="mt-1 text-sm font-semibold capitalize text-slate-900">{profile.status.toLowerCase()}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Member since</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {new Date(profile.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <form onSubmit={handleProfileSave} className={t.section}>
        <h2 className="text-lg font-semibold text-slate-900">Profile information</h2>
        <p className="mt-1 text-sm text-slate-500">Update your display name and sign-in email.</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="account-name" className={t.label}>
              Full name
            </label>
            <input
              id="account-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={t.input}
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="account-email" className={t.label}>
              Email address
            </label>
            <input
              id="account-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={t.input}
              placeholder="you@example.com"
            />
          </div>
        </div>

        {email.trim() !== profile.email && (
          <div className="mt-4 max-w-md">
            <label htmlFor="profile-current-password" className={t.label}>
              Current password <span className="text-red-500">*</span>
            </label>
            <input
              id="profile-current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={t.input}
              placeholder="Required to change email"
              autoComplete="current-password"
            />
          </div>
        )}

        <button type="submit" disabled={savingProfile} className={`mt-5 ${t.button}`}>
          {savingProfile ? "Saving…" : "Save profile"}
        </button>
      </form>

      <form onSubmit={handlePasswordSave}>
        <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
        <p className="mt-1 text-sm text-slate-500">Use a strong password you do not use elsewhere.</p>

        <div className="mt-5 grid max-w-xl gap-4">
          <div>
            <label htmlFor="password-current" className={t.label}>
              Current password
            </label>
            <input
              id="password-current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={t.input}
              autoComplete="current-password"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="password-new" className={t.label}>
                New password
              </label>
              <input
                id="password-new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={t.input}
                autoComplete="new-password"
                minLength={6}
              />
            </div>
            <div>
              <label htmlFor="password-confirm" className={t.label}>
                Confirm new password
              </label>
              <input
                id="password-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={t.input}
                autoComplete="new-password"
                minLength={6}
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={savingPassword} className={`mt-5 ${t.button}`}>
          {savingPassword ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
