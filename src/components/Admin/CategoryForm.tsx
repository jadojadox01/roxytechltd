"use client";

import { useState } from "react";

export default function CategoryForm() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("description", description);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/admin/categories", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Create failed");
      location.reload();
    } catch {
      alert("Failed to create category");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 max-w-md space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div>
        <label className="block text-sm font-medium text-slate-700">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#02AAA4]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Slug</label>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#02AAA4]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Upload image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#02AAA4] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#02AAA4]" />
      </div>
      <div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-w-[140px] items-center justify-center rounded-lg bg-[#02AAA4] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#02AAA4]/20 transition hover:bg-[#028f86] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creating..." : "Create category"}
        </button>
      </div>
    </form>
  );
}
