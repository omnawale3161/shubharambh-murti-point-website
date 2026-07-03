import "server-only";
import { formatOrderAddress, paymentMethodLabel } from "@/lib/orders";
import type { PersistedOrder } from "@/lib/payments";

function pdfText(value: string) {
  return value.replace(/[^\x20-\x7E]/g, "").replace(/([\\()])/g, "\\$1");
}

function line(text: string, x: number, y: number, size = 10, bold = false) {
  return `BT /${bold ? "F2" : "F1"} ${size} Tf ${x} ${y} Td (${pdfText(text)}) Tj ET`;
}

export function createInvoicePdf(order: PersistedOrder) {
  const gstin = process.env.STORE_GSTIN?.trim() || "Not configured";
  const address = order.delivery_address;
  const content = [
    line("SHUBHARAMBH MURTI POINT", 48, 790, 18, true),
    line("GST-READY TAX INVOICE", 48, 765, 12, true),
    line(`Invoice No: SMP-${order.id.slice(0, 8).toUpperCase()}`, 48, 735),
    line(`Order ID: ${order.id}`, 48, 718),
    line(`Date: ${new Date(order.created_at || Date.now()).toLocaleDateString("en-IN")}`, 48, 701),
    line(`GSTIN: ${gstin}`, 48, 684),
    line("BILL TO", 48, 650, 11, true),
    line(address?.fullName || "Customer", 48, 632),
    line(formatOrderAddress(address), 48, 615, 8),
    line(`Email: ${order.customer_email || address?.email || ""}`, 48, 598, 8),
    line(`Phone: ${order.customer_phone || address?.mobile || ""}`, 48, 581, 8),
    line("ORDER SUMMARY", 48, 545, 11, true),
    line("Product", 48, 525, 9, true),
    line("Qty", 390, 525, 9, true),
    line("Amount", 470, 525, 9, true),
    ...(order.order_items || []).flatMap((item, index) => {
      const y = 502 - index * 24;
      return [line(item.productName, 48, y, 8), line(String(item.quantity), 400, y, 8), line(`INR ${((item.unitPricePaise * item.quantity) / 100).toLocaleString("en-IN")}`, 470, y, 8)];
    }),
    line("Shipping: INR 0 (Free Delivery)", 350, 250, 9),
    line(`Discount: INR ${((order.discount_paise || 0) / 100).toLocaleString("en-IN")}`, 350, 232, 9),
    line(`GRAND TOTAL: INR ${(order.amount_paise / 100).toLocaleString("en-IN")}`, 350, 205, 12, true),
    line(`Payment method: ${paymentMethodLabel(order.payment_method)}`, 48, 170, 9),
    line("Thank you for choosing Shubharambh Murti Point.", 48, 100, 9)
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "ascii");
}
