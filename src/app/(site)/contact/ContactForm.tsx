"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const SUBJECTS = [
  "Order inquiry",
  "Product question",
  "Return / refund",
  "Technical support",
  "Partnership",
  "Other",
];

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to send");
      setSuccess(true);
      toast.success("Message sent successfully!");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send message. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-[#eadbcf] bg-[#fcf7f2] px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#ff7a1a] focus:ring-2 focus:ring-[#ff7a1a]/20 placeholder:text-slate-400";
  const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-[#d4edd8] bg-white p-10 text-center shadow-sm">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f8ee]">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900">Message sent!</h3>
        <p className="mt-2 text-sm text-slate-600">
          Thank you for reaching out. We&apos;ll get back to you as soon as possible.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-6 rounded-lg bg-[#ff7a1a] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e7680d]"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border border-[#e8ecff] bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff7a1a]">
          Contact form
        </p>
        <h2 className="mt-2 text-2xl font-black text-slate-900">Send us a message</h2>
        <p className="mt-2 text-sm text-slate-500">We usually respond within one business day.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            value={form.name}
            onChange={set("name")}
            placeholder="Jane Doe"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="jane@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Phone number</label>
          <input
            type="tel"
            value={form.phone}
            onChange={set("phone")}
            placeholder="+250 700 000 000"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Subject</label>
          <select value={form.subject} onChange={set("subject")} className={inputClass}>
            <option value="">Select a topic...</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={set("message")}
            placeholder="Tell us how we can help you..."
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-slate-400">
          <span className="text-red-500">*</span> Required fields
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-[#ff7a1a] px-7 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e7680d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Sending...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send Message
            </>
          )}
        </button>
      </div>
    </form>
  );
}
