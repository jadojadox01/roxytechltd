"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { isProtectedSuperAdmin } from "@/lib/protected-admin";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN" | "STORE_KEEPER";
  status: "ACTIVE" | "FROZEN";
  createdAt: string;
  _count: { orders: number };
};

export default function AdminUsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STORE_KEEPER" });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (data.success) setUsers(data.users);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("User created");
      setShowForm(false);
      setForm({ name: "", email: "", password: "", role: "STORE_KEEPER" });
      fetchUsers();
    } else {
      toast.error(data.message || "Failed to create user");
    }
    setSaving(false);
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

  const roleBadge = (role: string, email: string) => {
    if (isProtectedSuperAdmin(email)) {
      return (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
          Super Admin
        </span>
      );
    }
    const colors: Record<string, string> = {
      ADMIN: "bg-purple-100 text-purple-700",
      STORE_KEEPER: "bg-blue-100 text-blue-700",
      USER: "bg-slate-100 text-slate-700",
    };
    return (
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[role] || colors.USER}`}>
        {role.replace("_", " ")}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#02AAA4] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{users.length} users total</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-[#02AAA4] px-4 py-2 text-sm font-medium text-white hover:bg-[#028f86]"
        >
          {showForm ? "Cancel" : "+ Create User"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-900">Create New User</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="STORE_KEEPER">Store Keeper</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">Customer</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#02AAA4] px-4 py-2 text-sm font-medium text-white hover:bg-[#028f86] disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create User"}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">User</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Role</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Orders</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Joined</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{user.name || "—"}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  {user.role === "ADMIN" ? (
                    roleBadge(user.role, user.email)
                  ) : (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="rounded border border-slate-200 px-2 py-1 text-xs"
                    >
                      <option value="USER">Customer</option>
                      <option value="STORE_KEEPER">Store Keeper</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    user.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{user._count.orders}</td>
                <td className="px-4 py-3 text-slate-500">{dayjs(user.createdAt).format("MMM D, YYYY")}</td>
                <td className="px-4 py-3">
                  {user.role !== "ADMIN" && (
                    <button
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      className={`text-xs font-medium ${
                        user.status === "ACTIVE" ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"
                      }`}
                    >
                      {user.status === "ACTIVE" ? "Disable" : "Enable"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
