"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

type SiteSettings = {
  id: string;
  about: string | null;
  mission: string | null;
  vision: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  contactAddress: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  currency: string;
};

type HeaderSettings = {
  id: string;
  siteName: string | null;
  headerLogo: string | null;
  headerText: string | null;
};

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0071CE] focus:ring-2 focus:ring-[#0071CE]/20 transition";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";
const sectionClass = "border-b border-slate-100 pb-8 mb-8";

export default function AdminSettingsClient() {
  // ── Site settings ──────────────────────────────────────────────
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [form, setForm] = useState({
    about: "",
    mission: "",
    vision: "",
    contactPhone: "",
    contactEmail: "",
    contactAddress: "",
    facebookUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    currency: "RWF",
  });

  // ── Header / branding settings ──────────────────────────────────
  const [loadingHeader, setLoadingHeader] = useState(true);
  const [savingBranding, setSavingBranding] = useState(false);
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings | null>(null);
  const [brandingForm, setBrandingForm] = useState({
    siteName: "",
    headerText: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch site settings ─────────────────────────────────────────
  const fetchSiteSettings = useCallback(async () => {
    try {
      setLoadingSettings(true);
      const res = await fetch("/api/admin/site-settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setForm({
          about: data.settings.about || "",
          mission: data.settings.mission || "",
          vision: data.settings.vision || "",
          contactPhone: data.settings.contactPhone || "",
          contactEmail: data.settings.contactEmail || "",
          contactAddress: data.settings.contactAddress || "",
          facebookUrl: data.settings.facebookUrl || "",
          twitterUrl: data.settings.twitterUrl || "",
          instagramUrl: data.settings.instagramUrl || "",
          linkedinUrl: data.settings.linkedinUrl || "",
          currency: data.settings.currency || "RWF",
        });
      }
    } catch {
      toast.error("Failed to load site settings");
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  // ── Fetch header/branding settings ─────────────────────────────
  const fetchHeaderSettings = useCallback(async () => {
    try {
      setLoadingHeader(true);
      const res = await fetch("/api/admin/header-settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setHeaderSettings(data.settings);
        setBrandingForm({
          siteName: data.settings.siteName || "",
          headerText: data.settings.headerText || "",
        });
        setLogoPreview(data.settings.headerLogo || null);
      }
    } catch {
      toast.error("Failed to load branding settings");
    } finally {
      setLoadingHeader(false);
    }
  }, []);

  useEffect(() => {
    fetchSiteSettings();
    fetchHeaderSettings();
  }, [fetchSiteSettings, fetchHeaderSettings]);

  // ── Logo file pick ──────────────────────────────────────────────
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2 MB");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setRemoveLogo(false);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Save branding ───────────────────────────────────────────────
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBranding(true);
    try {
      const fd = new FormData();
      fd.append("siteName", brandingForm.siteName);
      fd.append("headerText", brandingForm.headerText);
      if (logoFile) fd.append("headerLogo", logoFile);
      if (removeLogo) fd.append("removeLogo", "true");

      const res = await fetch("/api/admin/header-settings", {
        method: "PUT",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to save");
      setHeaderSettings(data.settings);
      setLogoFile(null);
      setRemoveLogo(false);
      if (data.settings.headerLogo) setLogoPreview(data.settings.headerLogo);
      toast.success("Branding saved — reload to see nav changes");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSavingBranding(false);
    }
  };

  // ── Save site settings ──────────────────────────────────────────
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to save");
      toast.success("Settings saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSavingSettings(false);
    }
  };

  if (loadingSettings || loadingHeader) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0071CE] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* ── Branding Section ── */}
      <form onSubmit={handleSaveBranding} className={sectionClass}>
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Branding</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Upload a logo or set a text name displayed in the navigation bar.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Logo upload */}
          <div>
            <label className={labelClass}>Logo image</label>
            <p className="mb-3 text-xs text-slate-500">
              PNG, SVG, JPEG · max 2 MB · recommended 160 × 40 px
            </p>

            {/* Preview */}
            {logoPreview && !removeLogo ? (
              <div className="mb-3 flex items-center gap-3">
                <div className="relative h-12 w-40 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center p-1">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="text-xs font-medium text-red-600 hover:text-red-700 underline"
                >
                  Remove logo
                </button>
              </div>
            ) : (
              <div className="mb-3 flex h-12 w-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
                No logo set
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={handleLogoChange}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-[#0071CE] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#005fb0]"
            />
          </div>

          {/* Site name */}
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Site name</label>
              <p className="mb-2 text-xs text-slate-500">
                Shown in the nav when no logo is uploaded, and used in browser tabs.
              </p>
              <input
                value={brandingForm.siteName}
                onChange={(e) => setBrandingForm({ ...brandingForm, siteName: e.target.value })}
                placeholder="e.g. ROXY TECH"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Top-bar announcement text</label>
              <input
                value={brandingForm.headerText}
                onChange={(e) => setBrandingForm({ ...brandingForm, headerText: e.target.value })}
                placeholder="e.g. Free delivery on orders over 100,000 RWF"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Live preview strip */}
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-900 px-5 py-3 flex items-center gap-3">
          <span className="text-xs font-medium text-slate-400 shrink-0">Nav preview:</span>
          {logoPreview && !removeLogo ? (
            <img
              src={logoPreview}
              alt="nav preview"
              className="h-7 object-contain"
            />
          ) : (
            <span className="text-base font-bold text-white">
              {brandingForm.siteName || "Your Store Name"}
            </span>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={savingBranding}
            className="rounded-lg bg-[#0071CE] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#005fb0] disabled:opacity-60"
          >
            {savingBranding ? "Saving..." : "Save Branding"}
          </button>
        </div>
      </form>

      {/* ── Site Settings Form ── */}
      <form onSubmit={handleSaveSettings} className="space-y-0">
        {/* About */}
        <div className={sectionClass}>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">About the Store</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>About</label>
              <textarea
                rows={3}
                value={form.about}
                onChange={(e) => setForm({ ...form, about: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Mission</label>
              <textarea
                rows={3}
                value={form.mission}
                onChange={(e) => setForm({ ...form, mission: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Vision</label>
              <textarea
                rows={3}
                value={form.vision}
                onChange={(e) => setForm({ ...form, vision: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className={sectionClass}>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Address</label>
              <textarea
                rows={2}
                value={form.contactAddress}
                onChange={(e) => setForm({ ...form, contactAddress: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Social */}
        <div className={sectionClass}>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Social Media Links</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Facebook URL</label>
              <input
                value={form.facebookUrl}
                onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Twitter / X URL</label>
              <input
                value={form.twitterUrl}
                onChange={(e) => setForm({ ...form, twitterUrl: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Instagram URL</label>
              <input
                value={form.instagramUrl}
                onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>LinkedIn URL</label>
              <input
                value={form.linkedinUrl}
                onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Currency */}
        <div className={sectionClass}>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Regional Settings</h2>
          <div className="max-w-xs">
            <label className={labelClass}>Currency</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className={inputClass}
            >
              <option value="RWF">RWF — Rwandan Franc</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="KES">KES — Kenyan Shilling</option>
              <option value="UGX">UGX — Ugandan Shilling</option>
              <option value="TZS">TZS — Tanzanian Shilling</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingSettings}
            className="rounded-lg bg-[#0071CE] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#005fb0] disabled:opacity-60"
          >
            {savingSettings ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
