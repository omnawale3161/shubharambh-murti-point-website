import "server-only";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { formatOrderAddress, paymentMethodLabel } from "@/lib/orders";
import type { PersistedOrder } from "@/lib/payments";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]!);
}

function itemsHtml(order: PersistedOrder) {
  return (order.order_items || []).map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #ead9dc">${escapeHtml(item.productName)}</td>
      <td style="padding:12px 0;border-bottom:1px solid #ead9dc;text-align:center">${item.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #ead9dc;text-align:right">₹${((item.unitPricePaise * item.quantity) / 100).toLocaleString("en-IN")}</td>
    </tr>`).join("");
}

function brandedEmail(order: PersistedOrder, admin = false) {
  const address = order.delivery_address;
  const title = admin ? "A new order has arrived" : "Your order is confirmed";
  const greetingName = admin ? `${siteConfig.name} team` : address?.fullName || "Customer";
  return `<!doctype html><html><body style="margin:0;background:#fff7f7;font-family:Arial,sans-serif;color:#2c2022">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:28px 12px">
      <table role="presentation" width="100%" style="max-width:640px;background:white;border:1px solid #ead9dc;border-radius:12px;overflow:hidden">
        <tr><td style="background:#780b22;color:white;padding:24px;text-align:center">
          <img src="${absoluteUrl(siteConfig.logo)}" alt="${siteConfig.name}" width="64" height="64" style="border-radius:50%;background:white">
          <h1 style="margin:12px 0 0;font-size:26px">${title}</h1>
        </td></tr>
        <tr><td style="padding:28px">
          <p style="font-size:17px">Namaste ${escapeHtml(greetingName)},</p>
          <p>${admin ? "Please prepare this order for fulfilment." : "Thank you for choosing Shubharambh Murti Point. We have received your order."}</p>
          <p><strong>Order ID:</strong> ${order.id}<br><strong>Payment:</strong> ${escapeHtml(paymentMethodLabel(order.payment_method))}<br><strong>Status:</strong> ${escapeHtml(order.status)}<br><strong>Estimated delivery:</strong> ${order.estimated_delivery_date || "To be confirmed"}</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><thead><tr><th align="left">Product</th><th>Qty</th><th align="right">Amount</th></tr></thead><tbody>${itemsHtml(order)}</tbody></table>
          <p><strong>Shipping:</strong> ₹0 (Free Delivery)</p>
          <p style="font-size:20px"><strong>Total: ₹${(order.amount_paise / 100).toLocaleString("en-IN")}</strong></p>
          <p><strong>Delivery address</strong><br>${escapeHtml(formatOrderAddress(address))}</p>
          ${admin ? `<p><strong>Customer:</strong> ${escapeHtml(address?.fullName || "")}<br><strong>Email:</strong> ${escapeHtml(order.customer_email || "")}<br><strong>Phone:</strong> ${escapeHtml(order.customer_phone || "")}</p>` : ""}
          <p style="margin-top:28px;color:#6f5d61">WhatsApp: +91 7796675304 · ${siteConfig.name}</p>
        </td></tr>
      </table>
    </td></tr></table></body></html>`;
}

async function sendResendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from || !to) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html }),
    cache: "no-store"
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Resend email request failed", {
      status: response.status,
      body: errorBody
    });
    throw new Error(`Resend email failed with status ${response.status}`);
  }

  return true;
}

export async function sendOrderNotifications(order: PersistedOrder) {
  const ownerEmail = process.env.STORE_OWNER_EMAIL?.trim();
  const results = await Promise.allSettled([
    order.customer_email ? sendResendEmail(order.customer_email, `Order confirmed · ${order.id}`, brandedEmail(order)) : Promise.resolve(false),
    ownerEmail ? sendResendEmail(ownerEmail, `New order · ${order.id}`, brandedEmail(order, true)) : Promise.resolve(false)
  ]);
  results.forEach((result) => {
    if (result.status === "rejected") console.error("Order notification email failed", result.reason);
  });
  return results.some((result) => result.status === "fulfilled" && result.value);
}
