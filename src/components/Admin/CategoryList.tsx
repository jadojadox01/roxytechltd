"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  title: string;
  slug: string;
  image?: string | null;
};

export default function CategoryList({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  function openEditor(category: Category) {
    setEditingId(category.id);
    setEditTitle(category.title);
    setEditSlug(category.slug);
    setEditDescription("");
    setEditImageFile(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Failed to delete");
    }
  }

  async function handleUpdate(id: string) {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", editTitle);
      formData.append("slug", editSlug);
      formData.append("description", editDescription);
      if (editImageFile) formData.append("image", editImageFile);

      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        body: formData,
      });
      if (!res.ok) throw new Error("Update failed");
      setEditingId(null);
      router.refresh();
    } catch {
      alert("Failed to update category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      {categories.map((c) => (
        <div key={c.id} className="rounded border border-slate-200 bg-white p-3">
          {editingId === c.id ? (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Title</label>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Slug</label>
                  <input value={editSlug} onChange={(e) => setEditSlug(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Replace image</label>
                <input type="file" accept="image/*" onChange={(e) => setEditImageFile(e.target.files?.[0] ?? null)} className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleUpdate(c.id)} disabled={saving} className="rounded bg-[#02AAA4] px-3 py-1.5 text-sm font-semibold text-white">
                  {saving ? "Saving..." : "Save"}
                </button>
                <button onClick={() => setEditingId(null)} className="rounded border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {c.image ? (
                  <img src={c.image} alt={c.title} className="h-14 w-14 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500">
                    No image
                  </div>
                )}
                <div>
                  <div className="font-semibold">{c.title}</div>
                  <div className="text-sm text-slate-500">{c.slug}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => openEditor(c)} className="rounded border border-[#02AAA4] px-3 py-1 text-sm font-semibold text-[#02AAA4]">
                  Edit
                </button>
                <button onClick={() => handleDelete(c.id)} className="rounded bg-red-500 px-3 py-1 text-sm font-semibold text-white">
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
