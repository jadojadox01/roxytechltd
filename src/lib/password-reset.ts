import { createHash, randomBytes } from "crypto";
import { hash } from "bcrypt";
import { prismaClientInstance } from "@/lib/prismaDB";
import { isMailConfigured, sendMail } from "@/lib/mail";

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createRawResetToken() {
  return randomBytes(32).toString("hex");
}

export function getAppBaseUrl() {
  const fromEnv = (
    process.env.NEXTAUTH_URL ||
    process.env.AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    ""
  ).replace(/\/$/, "");
  if (fromEnv && !fromEnv.includes("roxytechltd.com")) {
    return fromEnv;
  }
  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || "";
  if (vercelHost) {
    return `https://${vercelHost.replace(/^https?:\/\//, "")}`;
  }
  return "https://www.roxin.rw";
}

function storeName() {
  return process.env.SITE_NAME?.trim() || "Roxin.rw";
}

export async function createPasswordResetForEmail(emailRaw: string) {
  const email = emailRaw.trim().toLowerCase();
  if (!email) {
    return { ok: false as const, reason: "invalid_email" as const };
  }

  const user = await prismaClientInstance.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, status: true },
  });

  // Always look successful to the client (don't leak whether email exists)
  if (!user || user.status === "FROZEN") {
    return { ok: true as const, sent: false as const };
  }

  const rawToken = createRawResetToken();
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);

  await prismaClientInstance.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  });

  await prismaClientInstance.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  if (!isMailConfigured()) {
    console.warn("[password-reset] Resend is not configured — reset email skipped");
    return { ok: true as const, sent: false as const, missingMail: true as const };
  }

  const resetUrl = `${getAppBaseUrl()}/reset-password?token=${rawToken}`;
  const name = user.name || "there";

  const text = [
    `Hi ${name},`,
    "",
    `We received a request to reset your ${storeName()} password.`,
    "Click the link below to choose a new password (valid for 1 hour):",
    resetUrl,
    "",
    "If you did not request this, you can ignore this email.",
    "",
    `— ${storeName()}`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html><body style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;background:#f8fafc;padding:24px;">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;">
    <tr><td style="background:#1c2ea3;color:#fff;padding:18px 24px;font-size:18px;font-weight:bold;">${storeName()}</td></tr>
    <tr><td style="padding:24px;font-size:14px;line-height:1.6;">
      <p>Hi <strong>${name}</strong>,</p>
      <p>We received a request to reset your password.</p>
      <p style="margin:24px 0;">
        <a href="${resetUrl}" style="display:inline-block;background:#ff7a1a;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold;">
          Reset password
        </a>
      </p>
      <p style="color:#64748b;font-size:12px;">This link expires in 1 hour. If you did not request a reset, ignore this email.</p>
      <p style="color:#64748b;font-size:12px;word-break:break-all;">Or copy this link:<br/>${resetUrl}</p>
    </td></tr>
  </table>
</body></html>`;

  await sendMail({
    to: user.email,
    subject: `${storeName()} password reset`,
    text,
    html,
  });

  return { ok: true as const, sent: true as const };
}

export async function resetPasswordWithToken(rawToken: string, newPassword: string) {
  if (!rawToken || newPassword.length < 6) {
    return { ok: false as const, message: "Invalid token or password too short." };
  }

  const tokenHash = hashResetToken(rawToken);
  const record = await prismaClientInstance.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, status: true } } },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return { ok: false as const, message: "This reset link is invalid or has expired." };
  }

  if (record.user.status === "FROZEN") {
    return { ok: false as const, message: "This account is disabled. Contact support." };
  }

  const passwordHash = await hash(newPassword, 10);

  await prismaClientInstance.$transaction([
    prismaClientInstance.user.update({
      where: { id: record.userId },
      data: { password: passwordHash },
    }),
    prismaClientInstance.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prismaClientInstance.passwordResetToken.deleteMany({
      where: {
        userId: record.userId,
        usedAt: null,
        id: { not: record.id },
      },
    }),
  ]);

  return { ok: true as const };
}
