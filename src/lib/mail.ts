import { Resend } from "resend";

export type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

export type SendMailInput = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  attachments?: MailAttachment[];
};

function envValue(...names: string[]) {
  for (const name of names) {
    const raw = process.env[name];
    if (!raw) continue;
    const value = raw.trim().replace(/^["']|["']$/g, "").trim();
    if (value) return value;
  }
  return "";
}

const UNVERIFIED_FROM_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
]);

function fromDomain(address: string) {
  const match = address.match(/@([^>\s]+)/i);
  return match?.[1]?.toLowerCase() || "";
}

function getFromAddress() {
  const siteName = envValue("SITE_NAME") || "Roxin.rw";
  const fallback = `${siteName} <beth.t@example.com>`;
  const from = envValue("EMAIL_FROM", "RESEND_FROM");
  if (!from) return fallback;

  const domain = fromDomain(from);
  if (UNVERIFIED_FROM_DOMAINS.has(domain)) {
    console.warn(
      `[mail] EMAIL_FROM uses @${domain}, which Resend cannot send from. Using beth.t@example.com instead. Verify roxin.rw at https://resend.com/domains then set EMAIL_FROM to Roxin.rw <noreply@roxin.rw>.`
    );
    return fallback;
  }

  return from;
}

export function isMailConfigured() {
  return Boolean(envValue("RESEND_API_KEY", "RESEND_KEY"));
}

export async function sendMail(input: SendMailInput) {
  const apiKey = envValue("RESEND_API_KEY", "RESEND_KEY");
  if (!apiKey) {
    console.warn("[mail] RESEND_API_KEY is missing in this deployment");
    throw new Error(
      "RESEND_API_KEY is missing. Add it in Vercel → Settings → Environment Variables for Production, then Redeploy."
    );
  }

  const resend = new Resend(apiKey);
  const to = Array.isArray(input.to) ? input.to : [input.to];
  const replyTo = envValue("EMAIL_REPLY_TO") || undefined;
  const from = getFromAddress();

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    replyTo,
    attachments: input.attachments?.map((file) => ({
      filename: file.filename,
      content: file.content,
      contentType: file.contentType || "application/pdf",
    })),
  });

  if (error) {
    console.error("[mail] Resend failed:", error);
    throw new Error(error.message || "Failed to send email");
  }

  console.info("[mail] Sent via Resend", data?.id || "");
  return { skipped: false as const, id: data?.id };
}
