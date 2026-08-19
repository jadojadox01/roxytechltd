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

function getFromAddress() {
  const from = process.env.EMAIL_FROM?.trim() || process.env.RESEND_FROM?.trim();
  const siteName = process.env.SITE_NAME?.trim() || "Roxin.rw";
  if (from) return from;
  return `${siteName} <beth.t@example.com>`;
}

export function isMailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendMail(input: SendMailInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[mail] Skipped send — RESEND_API_KEY is missing");
    return { skipped: true as const };
  }

  const resend = new Resend(apiKey);
  const to = Array.isArray(input.to) ? input.to : [input.to];
  const replyTo = input.replyTo || process.env.EMAIL_REPLY_TO || undefined;

  const { data, error } = await resend.emails.send({
    from: getFromAddress(),
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
