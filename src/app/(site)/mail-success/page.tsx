import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mail Success | ROXY TECH",
};

export default function MailSuccessPage() {
  return (
    <main className="min-h-[80vh] py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="text-3xl font-semibold text-slate-900">Mail Success</h1>
        <p className="mt-4 text-base text-slate-600">
          Your message has been sent successfully. Customize this confirmation message as needed.
        </p>
      </div>
    </main>
  );
}
