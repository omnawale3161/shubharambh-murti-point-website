import "server-only";
import { formatOrderAddress, orderItemsTotal, orderStatusLabel, paymentMethodLabel } from "@/lib/orders";
import { paidOrderStatuses } from "@/lib/orders/status";
import type { OrderItem, OrderStatus, PersistedOrder } from "@/lib/payments";

type Rgb = [number, number, number];

const colors = {
  ink: [35, 26, 19] as Rgb,
  muted: [91, 74, 60] as Rgb,
  line: [225, 211, 200] as Rgb,
  surface: [255, 248, 245] as Rgb,
  card: [255, 255, 255] as Rgb,
  maroon: [106, 30, 45] as Rgb,
  gold: [200, 162, 77] as Rgb,
  green: [20, 123, 74] as Rgb,
  amber: [141, 75, 0] as Rgb,
  red: [185, 28, 28] as Rgb
};

function pdfText(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/([\\()])/g, "\\$1");
}

function rgb([r, g, b]: Rgb) {
  return `${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)}`;
}

function fill(color: Rgb) {
  return `${rgb(color)} rg`;
}

function stroke(color: Rgb) {
  return `${rgb(color)} RG`;
}

function rect(x: number, y: number, w: number, h: number, fillColor?: Rgb, strokeColor?: Rgb) {
  const ops = [
    "q",
    fillColor ? fill(fillColor) : "",
    strokeColor ? stroke(strokeColor) : "",
    `${x} ${y} ${w} ${h} re`,
    fillColor && strokeColor ? "B" : fillColor ? "f" : "S",
    "Q"
  ].filter(Boolean);
  return ops.join("\n");
}

function text(value: string | number, x: number, y: number, size = 10, bold = false, color: Rgb = colors.ink) {
  return `BT ${fill(color)} /${bold ? "F2" : "F1"} ${size} Tf ${x} ${y} Td (${pdfText(value)}) Tj ET`;
}

function wrap(value: string, max = 62) {
  const words = pdfText(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function clipped(value: string | number | null | undefined, max = 38) {
  const safe = String(value ?? "").replace(/[^\x20-\x7E]/g, "").trim();
  if (safe.length <= max) return safe;
  return `${safe.slice(0, Math.max(0, max - 3))}...`;
}

function clippedMiddle(value: string | number | null | undefined, max = 34) {
  const safe = String(value ?? "").replace(/[^\x20-\x7E]/g, "").trim();
  if (safe.length <= max) return safe;
  const side = Math.max(4, Math.floor((max - 3) / 2));
  return `${safe.slice(0, side)}...${safe.slice(-side)}`;
}

function limitedWrap(value: string, max = 62, maxLines = 4) {
  const lines = wrap(value, max);
  if (lines.length <= maxLines) return lines;
  const visible = lines.slice(0, maxLines);
  visible[maxLines - 1] = clipped(visible[maxLines - 1], Math.max(4, max - 3));
  return visible;
}

function multiline(value: string, x: number, y: number, size = 9, max = 62, color: Rgb = colors.muted, gap = 13, maxLines = 4) {
  return limitedWrap(value, max, maxLines).map((line, index) => text(line, x, y - index * gap, size, false, color)).join("\n");
}

function money(paise = 0) {
  return `INR ${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function statusTone(status: OrderStatus): Rgb {
  if (paidOrderStatuses.has(status)) return colors.green;
  if (["cancelled", "payment_failed"].includes(status)) return colors.red;
  return colors.amber;
}

function badge(label: string, x: number, y: number, w: number, tone: Rgb) {
  return [
    rect(x, y, w, 20, [252, 248, 238], tone),
    text(label.toUpperCase(), x + 8, y + 6, 8, true, tone)
  ].join("\n");
}

function cardTitle(label: string, x: number, y: number) {
  return [
    text(label.toUpperCase(), x, y, 8, true, colors.gold),
    rect(x, y - 8, 46, 1.2, colors.gold)
  ].join("\n");
}

function row(label: string, value: string, x: number, y: number, w = 150, boldValue = false) {
  return [
    text(label, x, y, 8, true, colors.muted),
    text(value, x + w, y, 9, boldValue, colors.ink)
  ].join("\n");
}

function clippedRow(label: string, value: string, x: number, y: number, w = 84, max = 32, boldValue = false, valueSize = 8.5) {
  return [
    text(label, x, y, 8, true, colors.muted),
    text(clipped(value, max), x + w, y, valueSize, boldValue, colors.ink)
  ].join("\n");
}

function compactIdRow(label: string, value: string, x: number, y: number, w = 112, max = 34) {
  return [
    text(label, x, y, 8, true, colors.muted),
    text(clippedMiddle(value, max), x + w, y, 8.2, false, colors.ink)
  ].join("\n");
}

function qrCode(x: number, y: number) {
  const cells = [
    [0, 0], [1, 0], [2, 0], [4, 0], [6, 0], [7, 0], [8, 0],
    [0, 1], [2, 1], [4, 1], [6, 1], [8, 1],
    [0, 2], [1, 2], [2, 2], [5, 2], [6, 2], [7, 2], [8, 2],
    [3, 3], [5, 3], [7, 3],
    [0, 4], [2, 4], [4, 4], [5, 4], [8, 4],
    [1, 5], [3, 5], [6, 5],
    [0, 6], [1, 6], [2, 6], [4, 6], [6, 6], [7, 6], [8, 6],
    [0, 7], [2, 7], [5, 7], [6, 7], [8, 7],
    [0, 8], [1, 8], [2, 8], [4, 8], [7, 8], [8, 8]
  ];
  return [
    rect(x, y, 54, 54, colors.card, colors.line),
    ...cells.map(([cx, cy]) => rect(x + 5 + cx * 5, y + 5 + cy * 5, 4, 4, colors.maroon))
  ].join("\n");
}

function productRows(items: OrderItem[], startY: number, maxRows = 4) {
  const rows = items.length ? items : [];
  return rows.slice(0, maxRows).flatMap((item, index) => {
    const y = startY - index * 42;
    const total = item.unitPricePaise * item.quantity;
    return [
      rect(42, y - 10, 511, 38, index % 2 === 0 ? [255, 255, 255] : [255, 251, 248], colors.line),
      rect(50, y - 2, 24, 24, [252, 248, 238], colors.line),
      text("IMG", 55, y + 7, 6, true, colors.gold),
      text(clipped(item.productName, 38), 82, y + 10, 8.5, true, colors.ink),
      text(clipped(item.productId || "SKU", 28), 82, y - 3, 7, false, colors.muted),
      text(String(item.quantity), 278, y + 4, 8.5, true),
      text(money(item.unitPricePaise), 315, y + 4, 8.5),
      text(money(0), 390, y + 4, 8.5),
      text("Included", 447, y + 4, 8),
      text(money(total), 503, y + 4, 8.5, true)
    ];
  }).join("\n");
}

export function createInvoicePdf(order: PersistedOrder) {
  const gstin = process.env.STORE_GSTIN?.trim() || "Not configured";
  const storeAddress = process.env.STORE_ADDRESS?.trim() || "Shubharambh Murti Point, India";
  const storePhone = process.env.STORE_PHONE?.trim() || "+91 00000 00000";
  const storeEmail = process.env.STORE_EMAIL?.trim() || "support@shubharambhmurti.com";
  const website = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "www.shubharambhmurti.com";
  const address = order.delivery_address;
  const invoiceNo = `SMP-${order.id.slice(0, 8).toUpperCase()}`;
  const date = new Date(order.created_at || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const items = order.order_items || [{
    productId: order.product_id,
    productName: order.product_name,
    unitPricePaise: order.quantity ? Math.round(order.amount_paise / order.quantity) : order.amount_paise,
    quantity: order.quantity || 1,
    giftBox: order.gift_box
  }];
  const subtotal = orderItemsTotal(items);
  const discount = order.discount_paise || 0;
  const shipping = order.shipping_paise || 0;
  const gst = 0;
  const paymentStatus = paidOrderStatuses.has(order.status) ? "Paid" : order.status === "payment_failed" ? "Failed" : "Pending";
  const maxProductRows = 4;
  const visibleProductRows = Math.min(items.length, maxProductRows);
  const productStartY = 488;
  const productTableBottom = productStartY - (Math.max(visibleProductRows, 1) - 1) * 42 - 10;
  const paymentCardHeight = 126;
  const paymentTop = productTableBottom - 24;
  const paymentY = paymentTop - paymentCardHeight;
  const footerTop = paymentY - 18;
  const footerHeight = 112;
  const footerY = Math.max(76, footerTop - footerHeight);
  const footerNoteY = Math.max(48, footerY - 26);

  const content = [
    rect(0, 0, 595, 842, colors.surface),
    rect(32, 32, 531, 778, colors.card, colors.line),
    rect(32, 752, 531, 58, colors.maroon),
    rect(48, 767, 34, 30, colors.gold),
    text("SMP", 54, 778, 11, true, colors.card),
    text("Shubharambh Murti Point", 94, 787, 20, true, colors.card),
    text("Premium GST-ready Tax Invoice", 94, 769, 9, false, [250, 230, 190]),
    text("TAX INVOICE", 449, 785, 16, true, colors.card),
    text("Original for Recipient", 450, 768, 8, false, [250, 230, 190]),
    badge(`Payment: ${paymentStatus}`, 365, 733, 92, statusTone(order.status)),
    badge(orderStatusLabel(order.status), 464, 733, 82, statusTone(order.status)),
    text("Invoice No", 48, 725, 8, true, colors.muted),
    text(invoiceNo, 48, 710, 11, true, colors.ink),
    text("Order ID", 187, 725, 8, true, colors.muted),
    text(clippedMiddle(order.id, 36), 187, 710, 8, true, colors.ink),
    text("Invoice Date", 365, 725, 8, true, colors.muted),
    text(date, 365, 710, 11, true, colors.ink),

    rect(42, 568, 246, 126, colors.card, colors.line),
    cardTitle("Store Details", 56, 674),
    clippedRow("Store Name", "Shubharambh Murti Point", 56, 655, 76, 28, true),
    clippedRow("GST Number", gstin, 56, 638, 76, 24),
    clippedRow("Phone", storePhone, 56, 621, 76, 22),
    clippedRow("Email", storeEmail, 56, 604, 76, 31),
    text("Address", 56, 586, 8, true, colors.muted),
    multiline(storeAddress, 132, 586, 8, 32, colors.muted, 12, 3),

    rect(307, 568, 246, 126, colors.card, colors.line),
    cardTitle("Customer Details", 321, 674),
    clippedRow("Name", address?.fullName || "Customer", 321, 655, 72, 28, true),
    clippedRow("Phone", order.customer_phone || address?.mobile || "Not provided", 321, 638, 72, 22),
    clippedRow("Email", order.customer_email || address?.email || "Not provided", 321, 621, 72, 31),
    text("Shipping", 321, 603, 8, true, colors.muted),
    multiline(formatOrderAddress(address), 393, 603, 8, 34, colors.muted, 12, 3),

    text("Product Details", 42, 542, 12, true, colors.ink),
    rect(42, 516, 511, 22, colors.maroon),
    text("Image", 51, 524, 7.5, true, colors.card),
    text("Product / SKU", 82, 524, 7.5, true, colors.card),
    text("Qty", 276, 524, 7.5, true, colors.card),
    text("Unit Price", 315, 524, 7.5, true, colors.card),
    text("Discount", 389, 524, 7.5, true, colors.card),
    text("GST", 448, 524, 7.5, true, colors.card),
    text("Total", 505, 524, 7.5, true, colors.card),
    productRows(items, productStartY, maxProductRows),
    items.length > maxProductRows ? text(`+ ${items.length - maxProductRows} more item(s) included in order total`, 50, productTableBottom - 16, 8, true, colors.muted) : "",

    rect(42, paymentY, 286, paymentCardHeight, colors.card, colors.line),
    cardTitle("Payment Details", 56, paymentTop - 22),
    clippedRow("Payment Method", paymentMethodLabel(order.payment_method), 56, paymentTop - 41, 112, 26, true),
    compactIdRow("Razorpay Payment ID", order.razorpay_payment_id || "Not available", 56, paymentTop - 61),
    clippedRow("Transaction Status", paymentStatus, 56, paymentTop - 81, 112, 18, true),
    compactIdRow("Razorpay Order ID", order.razorpay_order_id || "Not available", 56, paymentTop - 101),

    rect(344, paymentY, 209, paymentCardHeight, [255, 251, 248], colors.line),
    cardTitle("Order Summary", 358, paymentTop - 22),
    row("Subtotal", money(subtotal), 358, paymentTop - 41, 88),
    row("Discount", money(discount), 358, paymentTop - 59, 88),
    row("Shipping", money(shipping), 358, paymentTop - 77, 88),
    row("GST", money(gst), 358, paymentTop - 95, 88),
    rect(358, paymentY + 26, 181, 1.2, colors.line),
    text("Grand Total", 358, paymentY + 10, 10, true, colors.maroon),
    text(money(order.amount_paise), 466, paymentY + 10, 12, true, colors.maroon),

    rect(42, footerY, 511, footerHeight, colors.card, colors.line),
    text("Thank you for choosing Shubharambh Murti Point.", 56, footerTop - 27, 12, true, colors.maroon),
    multiline("Terms & Conditions: Goods once delivered are governed by our return and refund policy. Please inspect the product on delivery and contact support for any concern.", 56, footerTop - 47, 8, 68, colors.muted, 12, 3),
    text("Return & Refund Policy: Available on website", 56, footerY + 26, 8, true, colors.muted),
    text(`Support: ${clipped(`${storePhone} | ${storeEmail}`, 58)}`, 56, footerY + 12, 8, true, colors.muted),
    qrCode(484, footerY + 34),
    text("Website QR", 489, footerY + 23, 7, true, colors.muted),
    text(clipped(website.replace(/^https?:\/\//, ""), 24), 484, footerY + 12, 6.5, false, colors.muted),
    rect(377, footerY + 33, 48, 1.2, colors.ink),
    text("Authorized Signature", 344, footerY + 18, 8, true, colors.muted),

    text("This is a computer-generated invoice and does not require a physical signature.", 130, footerNoteY, 8, false, colors.muted)
  ].filter(Boolean).join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${Buffer.byteLength(content, "ascii")} >>\nstream\n${content}\nendstream`
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "ascii");
}
