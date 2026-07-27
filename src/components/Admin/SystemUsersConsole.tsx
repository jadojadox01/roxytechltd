"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { signOut } from "next-auth/react";
import Link from "next/link";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN" | "STORE_KEEPER";
  status: "ACTIVE" | "FROZEN";
  createdAt: string;
  updatedAt: string;
  _count: { orders: number };
};

export default function SystemUsersConsole() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load users");
      }
      setUsers(data.users);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q)
    );
  }, [users, query]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create user");
      }
      toast.success("User created");
      setShowForm(false);
      setForm({ name: "", email: "", password: "", role: "USER" });
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "FROZEN" : "ACTIVE";
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status: newStatus }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(`User ${newStatus === "FROZEN" ? "disabled" : "enabled"}`);
      fetchUsers();
    } else {
      toast.error(data.message || "Failed to update user");
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Role updated");
      fetchUsers();
    } else {
      toast.error(data.message || "Failed to update role");
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to reset password");
      }
      toast.success("Password updated");
      setResetUserId(null);
      setNewPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (
      !window.confirm(
        `Delete ${user.email}? This cannot be undone.`
      )
    ) {
      return;
    }
    const res = await fetch(`/api/admin/users?userId=${user.id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) {
      toast.success("User deleted");
      fetchUsers();
    } else {
      toast.error(data.message || "Failed to delete user");
    }
  };

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-violet-500/20 text-violet-200",
      STORE_KEEPER: "bg-sky-500/20 text-sky-200",
      USER: "bg-white/10 text-slate-300",
    };
    return (
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[role] || colors.USER}`}>
        {role.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400">
              System Console
            </p>
            <h1 className="text-xl font-bold text-white">User Directory</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/dashboard"
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
            >
              Admin dashboard
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="rounded-lg bg-red-600/90 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Passwords are stored encrypted (bcrypt). They cannot be viewed — use{" "}
          <strong>Set password</strong> to assign a new one for any user.
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full max-w-md rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500"
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500"
          >
            {showForm ? "Cancel" : "+ Add user"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mb-6 rounded-xl border border-white/10 bg-slate-900 p-5 space-y-4"
          >
            <h2 className="font-semibold text-white">Create user</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm"
              />
              <input
                type="password"
                placeholder="Password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm"
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm"
              >
                <option value="USER">Customer</option>
                <option value="STORE_KEEPER">Store Keeper</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create user"}
            </button>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900 shadow-xl">
            <table className="w-full min-w-[960px] text-sm">
              <thead className="border-b border-white/10 bg-slate-900/80">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Password</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Orders</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Joined</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-white">
                      {user.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{user.email}</td>
                    <td className="px-4 py-3">
                      {resetUserId === user.id ? (
                        <div className="flex min-w-[220px] items-center gap-2">
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New password"
                            minLength={6}
                            className="w-full rounded border border-white/10 bg-slate-950 px-2 py-1 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleResetPassword(user.id)}
                            disabled={saving}
                            className="shrink-0 text-xs font-medium text-teal-400 hover:text-teal-300"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setResetUserId(null);
                              setNewPassword("");
                            }}
                            className="shrink-0 text-xs text-slate-500 hover:text-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-500">••••••••</span>
                          <button
                            type="button"
                            onClick={() => {
                              setResetUserId(user.id);
                              setNewPassword("");
                            }}
                            className="text-xs font-medium text-teal-400 hover:text-teal-300"
                          >
                            Set password
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.role === "ADMIN" ? (
                        roleBadge(user.role)
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="rounded border border-white/10 bg-slate-950 px-2 py-1 text-xs text-slate-200"
                        >
                          <option value="USER">Customer</option>
                          <option value="STORE_KEEPER">Store Keeper</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          user.status === "ACTIVE"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{user._count.orders}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {dayjs(user.createdAt).format("MMM D, YYYY")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {user.role !== "ADMIN" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(user.id, user.status)}
                              className="text-xs font-medium text-amber-400 hover:text-amber-300"
                            >
                              {user.status === "ACTIVE" ? "Disable" : "Enable"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(user)}
                              className="text-xs font-medium text-red-400 hover:text-red-300"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-slate-500">
                No users match your search.
              </p>
            )}
          </div>
        )}

        <p className="mt-4 text-center text-xs text-slate-600">
          {filteredUsers.length} of {users.length} users shown
        </p>
      </main>
    </div>
  );
}
