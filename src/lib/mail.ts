import nodemailer from "nodemailer";

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
  const from = process.env.EMAIL_FROM?.trim();
  const user = process.env.EMAIL_USER?.trim();
  const siteName = process.env.SITE_NAME?.trim() || "NAALVA STORE";

  if (from) return from;
  if (user) return `"${siteName}" <${user}>`;
  return `"${siteName}" <noreply@naalvastore.vercel.app>`;
}

export function isMailConfigured() {
  return Boolean(
    process.env.EMAIL_HOST &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASSWORD
  );
}

function createTransport() {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  const port = Number(process.env.EMAIL_PORT || 465);
  const secure =
    process.env.EMAIL_SECURE === "false" ? false : port === 465;

  if (!host || !user || !pass) {
    throw new Error("Email is not configured. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function sendMail(input: SendMailInput) {
  if (!isMailConfigured()) {
    console.warn("[mail] Skipped send — SMTP env vars missing");
    return { skipped: true as const };
  }

  const transporter = createTransport();
  const to = Array.isArray(input.to) ? input.to.join(", ") : input.to;

  await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    replyTo: input.replyTo || process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER,
    attachments: input.attachments?.map((file) => ({
      filename: file.filename,
      content: file.content,
      contentType: file.contentType || "application/pdf",
    })),
    headers: {
      "X-Entity-Ref-ID": `${Date.now()}`,
      "X-Auto-Response-Suppress": "OOF, AutoReply",
    },
  });

  return { skipped: false as const };
}
