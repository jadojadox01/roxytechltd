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

function getFromAddress() {
  const from = envValue("EMAIL_FROM", "RESEND_FROM");
  const siteName = envValue("SITE_NAME") || "Roxin.rw";
  if (from) return from;
  return `${siteName} <beth.t@example.com>`;
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
