import { prismaClientInstance } from "@/lib/prismaDB";
import { isMailConfigured, sendMail } from "@/lib/mail";
import { buildOrderReceiptPdf, type ReceiptOrder } from "@/lib/order-receipt-pdf";

type OrderEmailPayload = ReceiptOrder & {
  shortId: string;
};

function money(value: number) {
  return `${Number(value || 0).toLocaleString("en-RW")} RWF`;
}

function storeName() {
  return process.env.SITE_NAME?.trim() || "NAALVA STORE";
}

function formatItems(order: ReceiptOrder) {
  return order.items
    .map((item) => `• ${item.productTitle} × ${item.quantity} — ${money(item.price)}`)
    .join("\n");
}

function htmlShell(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><title>${title}</title></head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:#02AAA4;color:#ffffff;padding:18px 24px;font-size:18px;font-weight:bold;">
                ${storeName()}
              </td>
            </tr>
            <tr>
              <td style="padding:24px;font-size:14px;line-height:1.6;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;background:#f8fafc;color:#64748b;font-size:12px;">
                This message was sent by ${storeName()}. Please do not reply with payment details in chat apps.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function toPayload(order: ReceiptOrder): OrderEmailPayload {
  return {
    ...order,
    shortId: order.id.slice(0, 8).toUpperCase(),
    totalPrice: Number(order.totalPrice),
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
    })),
  };
}

export async function getAdminEmails() {
  const admins = await prismaClientInstance.user.findMany({
    where: { role: "ADMIN", status: "ACTIVE" },
    select: { email: true },
  });
  return admins.map((a) => a.email).filter(Boolean);
}

export async function notifyOrderPlaced(orderInput: ReceiptOrder) {
  if (!isMailConfigured()) {
    console.warn("[order-email] SMTP not configured — order placed emails skipped");
    return;
  }

  const order = toPayload(orderInput);
  const adminEmails = await getAdminEmails();
  const itemsText = formatItems(order);

  const customerText = [
    `Hi ${order.shippingName},`,
    "",
    `Thank you for your order at ${storeName()}.`,
    `Order reference: #${order.shortId}`,
    `Status: Pending confirmation`,
    `Payment method: ${order.paymentMethod}`,
    `Total: ${money(order.totalPrice)}`,
    "",
    "Items:",
    itemsText,
    "",
    `Shipping address: ${order.shippingAddress}`,
    "",
    "We will notify you when your order is confirmed.",
    "",
    `— ${storeName()}`,
  ].join("\n");

  const customerHtml = htmlShell(
    `Order received #${order.shortId}`,
    `
      <p>Hi <strong>${order.shippingName}</strong>,</p>
      <p>Thank you for your order. We have received it and will confirm shortly.</p>
      <p>
        <strong>Order:</strong> #${order.shortId}<br/>
        <strong>Payment:</strong> ${order.paymentMethod}<br/>
        <strong>Total:</strong> ${money(order.totalPrice)}
      </p>
      <p><strong>Items</strong></p>
      <pre style="white-space:pre-wrap;font-family:Arial,sans-serif;">${itemsText}</pre>
      <p><strong>Ship to:</strong> ${order.shippingAddress}</p>
    `
  );

  await sendMail({
    to: order.shippingEmail,
    subject: `${storeName()} order received #${order.shortId}`,
    text: customerText,
    html: customerHtml,
  });

  if (adminEmails.length) {
    const adminText = [
      `New order placed on ${storeName()}.`,
      `Order: #${order.shortId}`,
      `Customer: ${order.shippingName} <${order.shippingEmail}>`,
      `Phone: ${order.shippingPhone}`,
      `Payment: ${order.paymentMethod}`,
      `Total: ${money(order.totalPrice)}`,
      "",
      "Items:",
      itemsText,
      "",
      `Address: ${order.shippingAddress}`,
    ].join("\n");

    const adminHtml = htmlShell(
      `New order #${order.shortId}`,
      `
        <p>A new order was placed.</p>
        <p>
          <strong>Order:</strong> #${order.shortId}<br/>
          <strong>Customer:</strong> ${order.shippingName} (${order.shippingEmail})<br/>
          <strong>Phone:</strong> ${order.shippingPhone}<br/>
          <strong>Payment:</strong> ${order.paymentMethod}<br/>
          <strong>Total:</strong> ${money(order.totalPrice)}
        </p>
        <p><strong>Items</strong></p>
        <pre style="white-space:pre-wrap;font-family:Arial,sans-serif;">${itemsText}</pre>
        <p><strong>Address:</strong> ${order.shippingAddress}</p>
      `
    );

    await sendMail({
      to: adminEmails,
      subject: `${storeName()} new order #${order.shortId}`,
      text: adminText,
      html: adminHtml,
    });
  }
}

export async function notifyOrderConfirmed(orderInput: ReceiptOrder) {
  if (!isMailConfigured()) {
    console.warn("[order-email] SMTP not configured — confirmation emails skipped");
    return;
  }

  const order = toPayload(orderInput);
  const pdf = await buildOrderReceiptPdf(order, storeName());
  const itemsText = formatItems(order);

  const text = [
    `Hi ${order.shippingName},`,
    "",
    `Your order #${order.shortId} has been confirmed.`,
    `Total: ${money(order.totalPrice)}`,
    "",
    "Items:",
    itemsText,
    "",
    "Your PDF receipt is attached. You can also download it from your account.",
    "",
    `— ${storeName()}`,
  ].join("\n");

  const html = htmlShell(
    `Order confirmed #${order.shortId}`,
    `
      <p>Hi <strong>${order.shippingName}</strong>,</p>
      <p>Your order <strong>#${order.shortId}</strong> has been confirmed.</p>
      <p><strong>Total:</strong> ${money(order.totalPrice)}</p>
      <p>Your PDF receipt is attached to this email. You can also download it anytime from your account orders page.</p>
    `
  );

  await sendMail({
    to: order.shippingEmail,
    subject: `${storeName()} order confirmed #${order.shortId}`,
    text,
    html,
    attachments: [
      {
        filename: `receipt-${order.shortId}.pdf`,
        content: pdf,
        contentType: "application/pdf",
      },
    ],
  });
}
