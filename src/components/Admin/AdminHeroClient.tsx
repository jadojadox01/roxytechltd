"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

type ProductOption = { id: string; title: string };

type HeroSlideRow = {
  id: number;
  sliderName: string;
  sliderImage: string;
  discountRate: number;
  headline: string | null;
  description: string | null;
  ctaLabel: string | null;
  sortOrder: number;
  product: { title: string; slug: string } | null;
};

type HeroBannerRow = {
  id: number;
  bannerName: string | null;
  bannerImage: string;
  subtitle: string | null;
  ctaLabel: string | null;
  sortOrder: number;
  product: { title: string; slug: string } | null;
};

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20";
const labelClass = "block text-sm font-medium text-slate-700";

async function readJsonResponse(res: Response) {
  const text = await res.text();
  if (!text.trim()) {
    throw new Error(`Server returned empty response (${res.status}). Restart dev server and run: npx prisma generate`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text.slice(0, 200) || `Invalid server response (${res.status})`);
  }
}

export default function AdminHeroClient({ products }: { products: ProductOption[] }) {
  const [tab, setTab] = useState<"slides" | "banners">("slides");
  const [slides, setSlides] = useState<HeroSlideRow[]>([]);
  const [banners, setBanners] = useState<HeroBannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [sliderName, setSliderName] = useState("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [ctaLabel, setCtaLabel] = useState("Shop Now");
  const [discountRate, setDiscountRate] = useState("0");
  const [sortOrder, setSortOrder] = useState("0");
  const [slideProductId, setSlideProductId] = useState("");
  const [slideImage, setSlideImage] = useState<File | null>(null);

  const [bannerName, setBannerName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [bannerCta, setBannerCta] = useState("View Deal");
  const [bannerSortOrder, setBannerSortOrder] = useState("0");
  const [bannerProductId, setBannerProductId] = useState("");
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [savingCopy, setSavingCopy] = useState(false);
  const [heroCopy, setHeroCopy] = useState({
    heroEyebrow: "New collection",
    heroTitle: "Elevate Your Shopping Journey",
    heroSubtitle:
      "Premium stationery, school & office materials — everything you need, all in one shop. Fast delivery across Rwanda.",
  });

  async function loadAll() {
    setLoading(true);
    try {
      const [slidesRes, bannersRes, settingsRes] = await Promise.all([
        fetch("/api/admin/hero/sliders", { cache: "no-store" }),
        fetch("/api/admin/hero/banners", { cache: "no-store" }),
        fetch("/api/admin/site-settings", { cache: "no-store" }),
      ]);
      const slidesData = await readJsonResponse(slidesRes);
      const bannersData = await readJsonResponse(bannersRes);
      const settingsData = await readJsonResponse(settingsRes);
      if (!slidesRes.ok) throw new Error(slidesData.message || "Failed to load slides");
      if (!bannersRes.ok) throw new Error(bannersData.message || "Failed to load banners");
      setSlides(slidesData.success ? slidesData.sliders : []);
      setBanners(bannersData.success ? bannersData.banners : []);
      if (settingsRes.ok && settingsData.settings) {
        setHeroCopy({
          heroEyebrow: settingsData.settings.heroEyebrow || "New collection",
          heroTitle: settingsData.settings.heroTitle || "Elevate Your Shopping Journey",
          heroSubtitle:
            settingsData.settings.heroSubtitle ||
            "Premium stationery, school & office materials — everything you need, all in one shop. Fast delivery across Rwanda.",
        });
      }
    } catch (err) {
      setSlides([]);
      setBanners([]);
      toast.error(err instanceof Error ? err.message : "Failed to load hero data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleCreateSlide(e: React.FormEvent) {
    e.preventDefault();
    if (!sliderName.trim() || !slideImage) {
      toast.error("Slide label and image are required.");
      return;
    }
    if (slideImage.size > 4.5 * 1024 * 1024) {
      toast.error("Image is too large. Please use an image under 4MB.");
      return;
    }
    if (slideImage.type && !slideImage.type.startsWith("image/")) {
      toast.error("Please choose a valid image file.");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("sliderName", sliderName);
      formData.append("headline", headline);
      formData.append("description", description);
      formData.append("ctaLabel", ctaLabel);
      formData.append("discountRate", discountRate);
      formData.append("sortOrder", sortOrder);
      if (slideProductId) formData.append("productId", slideProductId);
      formData.append("image", slideImage);

      const res = await fetch("/api/admin/hero/sliders", { method: "POST", body: formData });
      const data = await readJsonResponse(res);
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to create slide");

      toast.success("Hero slide added — check your homepage!");
      setSliderName("");
      setHeadline("");
      setDescription("");
      setCtaLabel("Shop Now");
      setDiscountRate("0");
      setSortOrder("0");
      setSlideProductId("");
      setSlideImage(null);
      loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create slide");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveHeroCopy(e: React.FormEvent) {
    e.preventDefault();
    if (!heroCopy.heroTitle.trim() || !heroCopy.heroSubtitle.trim()) {
      toast.error("Hero title and subtitle are required.");
      return;
    }
    setSavingCopy(true);
    try {
      const currentRes = await fetch("/api/admin/site-settings", { cache: "no-store" });
      const currentData = await readJsonResponse(currentRes);
      if (!currentRes.ok || !currentData.settings) {
        throw new Error(currentData.message || "Failed to load settings");
      }
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentData.settings,
          heroEyebrow: heroCopy.heroEyebrow.trim(),
          heroTitle: heroCopy.heroTitle.trim(),
          heroSubtitle: heroCopy.heroSubtitle.trim(),
        }),
      });
      const data = await readJsonResponse(res);
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to save hero text");
      toast.success("Homepage hero text updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save hero text");
    } finally {
      setSavingCopy(false);
    }
  }

  async function handleCreateBanner(e: React.FormEvent) {
    e.preventDefault();
    if (!bannerName.trim() || !bannerProductId || !bannerImage) {
      toast.error("Title, product, and image are required.");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("bannerName", bannerName);
      formData.append("subtitle", subtitle);
      formData.append("ctaLabel", bannerCta);
      formData.append("sortOrder", bannerSortOrder);
      formData.append("productId", bannerProductId);
      formData.append("image", bannerImage);

      const res = await fetch("/api/admin/hero/banners", { method: "POST", body: formData });
      const data = await readJsonResponse(res);
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to create banner");

      toast.success("Promo banner added!");
      setBannerName("");
      setSubtitle("");
      setBannerCta("View Deal");
      setBannerSortOrder("0");
      setBannerProductId("");
      setBannerImage(null);
      loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create banner");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSlide(id: number) {
    if (!window.confirm("Delete this slideshow slide?")) return;
    const res = await fetch(`/api/admin/hero/sliders/${id}`, { method: "DELETE" });
    const data = await readJsonResponse(res);
    if (!data.success) return toast.error(data.message || "Delete failed");
    toast.success("Slide deleted");
    loadAll();
  }

  async function deleteBanner(id: number) {
    if (!window.confirm("Delete this banner?")) return;
    const res = await fetch(`/api/admin/hero/banners/${id}`, { method: "DELETE" });
    const data = await readJsonResponse(res);
    if (!data.success) return toast.error(data.message || "Delete failed");
    toast.success("Banner deleted");
    loadAll();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSaveHeroCopy}
        className="space-y-4 rounded-2xl border border-[#d4ddff] bg-[#eef2ff]/60 p-5"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Homepage hero text</h2>
          <p className="mt-1 text-sm text-slate-600">
            Controls the left-side title and subtitle on the home page.
          </p>
        </div>
        <div>
          <label className={labelClass}>Eyebrow</label>
          <input
            value={heroCopy.heroEyebrow}
            onChange={(e) => setHeroCopy({ ...heroCopy, heroEyebrow: e.target.value })}
            className={inputClass}
            placeholder="New collection"
          />
        </div>
        <div>
          <label className={labelClass}>Title *</label>
          <input
            value={heroCopy.heroTitle}
            onChange={(e) => setHeroCopy({ ...heroCopy, heroTitle: e.target.value })}
            className={inputClass}
            placeholder="Elevate Your Shopping Journey"
          />
        </div>
        <div>
          <label className={labelClass}>Subtitle *</label>
          <textarea
            value={heroCopy.heroSubtitle}
            onChange={(e) => setHeroCopy({ ...heroCopy, heroSubtitle: e.target.value })}
            rows={3}
            className={inputClass}
            placeholder="Premium stationery, school & office materials..."
          />
        </div>
        <button
          type="submit"
          disabled={savingCopy}
          className="rounded-xl bg-[#1c2ea3] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#16257e] disabled:opacity-60"
        >
          {savingCopy ? "Saving…" : "Save hero text"}
        </button>
      </form>

      <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">How the homepage hero works</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li><strong>Hero text</strong> — editable above (title + subtitle on the left).</li>
          <li><strong>Slideshow slides</strong> — moving images on the right side of the hero.</li>
          <li><strong>Promo banners</strong> — optional cards used elsewhere on marketing surfaces.</li>
          <li>Lower <strong>sort order</strong> shows first. Add at least one slide for the right panel.</li>
        </ul>
      </div>

      <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setTab("slides")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            tab === "slides" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
          }`}
        >
          Slideshow slides
        </button>
        <button
          type="button"
          onClick={() => setTab("banners")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            tab === "banners" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
          }`}
        >
          Promo banners
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-teal-500" />
        </div>
      ) : tab === "slides" ? (
        <div className="grid gap-8 xl:grid-cols-2">
          <form onSubmit={handleCreateSlide} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Add slideshow slide</h2>

            <div>
              <label className={labelClass}>Slide image *</label>
              <input type="file" accept="image/*" onChange={(e) => setSlideImage(e.target.files?.[0] || null)} className={inputClass} />
              <p className="mt-1 text-xs text-slate-500">Used as background + product visual. Recommended 1200×800px or larger.</p>
            </div>

            <div>
              <label className={labelClass}>Eyebrow label *</label>
              <input value={sliderName} onChange={(e) => setSliderName(e.target.value)} placeholder="e.g. New Arrival" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Headline</label>
              <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Leave empty to use product title" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Leave empty to use product description" className={inputClass} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Button text</label>
                <input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Discount %</label>
                <input type="number" min={0} max={100} value={discountRate} onChange={(e) => setDiscountRate(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Linked product (optional)</label>
                <select value={slideProductId} onChange={(e) => setSlideProductId(e.target.value)} className={inputClass}>
                  <option value="">No product link</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Sort order</label>
                <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={inputClass} />
              </div>
            </div>

            <button type="submit" disabled={saving} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
              {saving ? "Saving…" : "Add to slideshow"}
            </button>
          </form>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Current slides ({slides.length})</h2>
            {slides.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">No slides yet — add one to enable the homepage hero.</p>
            ) : (
              slides.map((slide) => (
                <div key={slide.id} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <Image src={slide.sliderImage} alt={slide.sliderName} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{slide.headline || slide.product?.title || slide.sliderName}</p>
                    <p className="text-xs text-teal-600">{slide.sliderName}</p>
                    <p className="mt-1 truncate text-sm text-slate-500">{slide.description || "Uses product description"}</p>
                    <p className="mt-1 text-xs text-slate-400">Order: {slide.sortOrder} · {slide.discountRate}% off · Button: {slide.ctaLabel || "Shop Now"}</p>
                  </div>
                  <button type="button" onClick={() => deleteSlide(slide.id)} className="shrink-0 text-sm font-medium text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-8 xl:grid-cols-2">
          <form onSubmit={handleCreateBanner} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Add promo banner</h2>

            <div>
              <label className={labelClass}>Banner image *</label>
              <input type="file" accept="image/*" onChange={(e) => setBannerImage(e.target.files?.[0] || null)} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Title *</label>
              <input value={bannerName} onChange={(e) => setBannerName(e.target.value)} placeholder="e.g. Summer Sale" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Subtitle / eyebrow</label>
              <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. Limited time offer" className={inputClass} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Button text</label>
                <input value={bannerCta} onChange={(e) => setBannerCta(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Sort order</label>
                <input type="number" value={bannerSortOrder} onChange={(e) => setBannerSortOrder(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Linked product *</label>
              <select value={bannerProductId} onChange={(e) => setBannerProductId(e.target.value)} className={inputClass}>
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={saving} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
              {saving ? "Saving…" : "Add banner"}
            </button>
          </form>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Current banners ({banners.length})</h2>
            {banners.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">No promo banners yet.</p>
            ) : (
              banners.map((banner) => (
                <div key={banner.id} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <Image src={banner.bannerImage} alt={banner.bannerName || "Banner"} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{banner.bannerName}</p>
                    <p className="text-xs text-teal-600">{banner.subtitle || "No subtitle"}</p>
                    <p className="mt-1 text-xs text-slate-400">Order: {banner.sortOrder} · {banner.product?.title}</p>
                  </div>
                  <button type="button" onClick={() => deleteBanner(banner.id)} className="shrink-0 text-sm font-medium text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
