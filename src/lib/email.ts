import { Resend } from "resend";

// Lazy-init to avoid crash during build when RESEND_API_KEY is not yet set
let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key || key.startsWith("re_placeholder")) {
      return null;
    }
    _resend = new Resend(key);
  }
  return _resend;
}

const FROM = "PETLIBRO <onboarding@resend.dev>"; // Change to your domain once verified

interface OrderEmailData {
  orderId: string;
  email: string;
  customerName?: string;
  items: { name: string; variant?: string; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

interface ShippedEmailData {
  orderId: string;
  email: string;
  customerName?: string;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

function baseTemplate(content: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px">
    <!-- Header -->
    <div style="text-align:center;padding:24px 0">
      <h1 style="margin:0;font-size:28px;font-weight:800;color:#1a1a1a;letter-spacing:-0.5px">PETLIBRO</h1>
      <p style="margin:4px 0 0;font-size:12px;color:#8b8680;text-transform:uppercase;letter-spacing:2px">Smart Pet Care</p>
    </div>
    <!-- Content -->
    <div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e8e4de">
      ${content}
    </div>
    <!-- Footer -->
    <div style="text-align:center;padding:24px 0;color:#8b8680;font-size:12px">
      <p style="margin:0">Thank you for choosing PETLIBRO</p>
      <p style="margin:8px 0 0">
        <a href="https://pet-shop-lac-ten.vercel.app" style="color:#2d6a4f;text-decoration:none">Visit our store</a>
        &nbsp;&middot;&nbsp;
        <a href="https://pet-shop-lac-ten.vercel.app/support" style="color:#2d6a4f;text-decoration:none">Get help</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0ece6">
          <strong style="color:#1a1a1a;font-size:14px">${item.name}</strong>
          ${item.variant ? `<br><span style="color:#8b8680;font-size:12px">${item.variant}</span>` : ""}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #f0ece6;text-align:center;color:#1a1a1a;font-size:14px">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0ece6;text-align:right;color:#1a1a1a;font-size:14px">${formatCurrency(item.price * item.quantity)}</td>
      </tr>`
    )
    .join("");

  const addr = data.shippingAddress;
  const addressBlock = addr
    ? `<div style="margin-top:24px;padding:16px;background:#f7f5f0;border-radius:8px">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#1a1a1a">Shipping To</p>
        <p style="margin:0;font-size:13px;color:#5c5753;line-height:1.5">
          ${addr.line1}<br>
          ${addr.line2 ? addr.line2 + "<br>" : ""}
          ${addr.city}, ${addr.state} ${addr.zip}<br>
          ${addr.country}
        </p>
      </div>`
    : "";

  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:24px">
      <div style="width:56px;height:56px;border-radius:50%;background:#d4edda;margin:0 auto 12px;display:flex;align-items:center;justify-content:center">
        <span style="font-size:28px">&#10003;</span>
      </div>
      <h2 style="margin:0;font-size:22px;color:#1a1a1a">Order Confirmed!</h2>
      <p style="margin:8px 0 0;color:#8b8680;font-size:14px">Order #${data.orderId.slice(0, 8).toUpperCase()}</p>
    </div>

    <p style="color:#5c5753;font-size:14px;line-height:1.6">
      Hi${data.customerName ? " " + data.customerName : ""},<br>
      We've received your order and it's being prepared. You'll get another email when it ships.
    </p>

    <table style="width:100%;border-collapse:collapse;margin-top:20px">
      <thead>
        <tr style="border-bottom:2px solid #e8e4de">
          <th style="padding:8px 0;text-align:left;font-size:11px;text-transform:uppercase;color:#8b8680;letter-spacing:1px">Item</th>
          <th style="padding:8px 0;text-align:center;font-size:11px;text-transform:uppercase;color:#8b8680;letter-spacing:1px">Qty</th>
          <th style="padding:8px 0;text-align:right;font-size:11px;text-transform:uppercase;color:#8b8680;letter-spacing:1px">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div style="margin-top:16px;border-top:2px solid #e8e4de;padding-top:12px">
      <table style="width:100%">
        <tr><td style="padding:4px 0;font-size:13px;color:#8b8680">Subtotal</td><td style="text-align:right;font-size:13px;color:#1a1a1a">${formatCurrency(data.subtotal)}</td></tr>
        ${data.discount > 0 ? `<tr><td style="padding:4px 0;font-size:13px;color:#8b8680">Discount</td><td style="text-align:right;font-size:13px;color:#2d6a4f">-${formatCurrency(data.discount)}</td></tr>` : ""}
        <tr><td style="padding:4px 0;font-size:13px;color:#8b8680">Shipping</td><td style="text-align:right;font-size:13px;color:#1a1a1a">${data.shipping === 0 ? "Free" : formatCurrency(data.shipping)}</td></tr>
        <tr><td style="padding:4px 0;font-size:13px;color:#8b8680">Tax</td><td style="text-align:right;font-size:13px;color:#1a1a1a">${formatCurrency(data.tax)}</td></tr>
        <tr><td style="padding:8px 0 0;font-size:16px;font-weight:700;color:#1a1a1a;border-top:1px solid #e8e4de">Total</td><td style="text-align:right;padding:8px 0 0;font-size:16px;font-weight:700;color:#1a1a1a;border-top:1px solid #e8e4de">${formatCurrency(data.total)}</td></tr>
      </table>
    </div>

    ${addressBlock}

    <div style="text-align:center;margin-top:24px">
      <a href="https://pet-shop-lac-ten.vercel.app/account/orders/${data.orderId}" style="display:inline-block;background:#2d6a4f;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">View Order</a>
    </div>
  `);

  const resend = getResend();
  if (!resend) return { data: null, error: { message: "Email not configured", name: "missing_key" } };
  return resend.emails.send({
    from: FROM,
    to: [data.email],
    subject: `Order Confirmed — #${data.orderId.slice(0, 8).toUpperCase()}`,
    html,
  });
}

export async function sendOrderShipped(data: ShippedEmailData) {
  const trackingBlock = data.trackingNumber
    ? `<div style="margin:20px 0;padding:16px;background:#f7f5f0;border-radius:8px;text-align:center">
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;color:#8b8680;letter-spacing:1px">${data.carrier?.toUpperCase() ?? "CARRIER"}</p>
        <p style="margin:0;font-size:18px;font-weight:600;color:#1a1a1a;font-family:monospace;letter-spacing:1px">${data.trackingNumber}</p>
        ${data.trackingUrl ? `<a href="${data.trackingUrl}" style="display:inline-block;margin-top:12px;color:#2d6a4f;font-size:13px;text-decoration:underline">Track your package &rarr;</a>` : ""}
      </div>`
    : "";

  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:24px">
      <div style="width:56px;height:56px;border-radius:50%;background:#cce5ff;margin:0 auto 12px;display:flex;align-items:center;justify-content:center">
        <span style="font-size:28px">&#128230;</span>
      </div>
      <h2 style="margin:0;font-size:22px;color:#1a1a1a">Your Order Has Shipped!</h2>
      <p style="margin:8px 0 0;color:#8b8680;font-size:14px">Order #${data.orderId.slice(0, 8).toUpperCase()}</p>
    </div>

    <p style="color:#5c5753;font-size:14px;line-height:1.6">
      Hi${data.customerName ? " " + data.customerName : ""},<br>
      Great news! Your order is on its way. ${data.trackingNumber ? "You can track it using the details below." : "We'll update you when it's delivered."}
    </p>

    ${trackingBlock}

    <div style="text-align:center;margin-top:24px">
      <a href="https://pet-shop-lac-ten.vercel.app/account/orders/${data.orderId}" style="display:inline-block;background:#2d6a4f;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">View Order</a>
    </div>
  `);

  const resend = getResend();
  if (!resend) return { data: null, error: { message: "Email not configured", name: "missing_key" } };
  return resend.emails.send({
    from: FROM,
    to: [data.email],
    subject: `Your Order Has Shipped — #${data.orderId.slice(0, 8).toUpperCase()}`,
    html,
  });
}

export async function sendContactFormEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;font-size:20px;color:#1a1a1a">New Contact Form Message</h2>
    <table style="width:100%">
      <tr><td style="padding:6px 0;font-size:13px;color:#8b8680;width:80px">From</td><td style="font-size:13px;color:#1a1a1a">${data.name} (${data.email})</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#8b8680">Subject</td><td style="font-size:13px;color:#1a1a1a">${data.subject}</td></tr>
    </table>
    <div style="margin-top:16px;padding:16px;background:#f7f5f0;border-radius:8px">
      <p style="margin:0;font-size:14px;color:#5c5753;line-height:1.6;white-space:pre-wrap">${data.message}</p>
    </div>
  `);

  // Send to store owner
  const resend = getResend();
  if (!resend) return { data: null, error: { message: "Email not configured", name: "missing_key" } };
  return resend.emails.send({
    from: FROM,
    to: [process.env.ADMIN_EMAIL ?? "lawrence.ma000@gmail.com"],
    replyTo: data.email,
    subject: `Contact: ${data.subject}`,
    html,
  });
}
