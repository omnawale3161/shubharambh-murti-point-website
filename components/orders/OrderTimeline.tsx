import { Check, MapPinned, PackageCheck, PackageOpen, Truck } from "lucide-react";
import { orderTimeline } from "@/lib/orders";
import type { OrderStatus } from "@/lib/payments";

const icons = [Check, PackageOpen, Truck, MapPinned, PackageCheck];

function formatDate(value?: string | null) {
  if (!value) return "";
  return new Date(value.includes("T") ? value : `${value}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function OrderTimeline({
  status,
  createdAt,
  shippedAt,
  deliveredAt,
  estimatedDeliveryDate
}: {
  status: OrderStatus;
  createdAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  estimatedDeliveryDate?: string | null;
}) {
  const steps = orderTimeline(status);
  const stopped = status === "cancelled" || status === "payment_failed";
  const dates = [
    formatDate(createdAt),
    "",
    formatDate(shippedAt),
    estimatedDeliveryDate ? `Expected ${formatDate(estimatedDeliveryDate)}` : "",
    formatDate(deliveredAt)
  ];
  return (
    <div>
      {stopped ? <p className="mb-5 rounded-lg bg-red-50 p-4 font-bold text-red-800">This order is {status === "cancelled" ? "cancelled" : "awaiting a successful payment"}.</p> : null}
      <ol className="grid gap-0 md:grid-cols-5">
        {steps.map((step, index) => {
          const Icon = icons[index];
          return <li key={step.key} className="relative flex gap-4 pb-7 md:grid md:justify-items-center md:gap-3 md:pb-0 md:text-center">
            {index < steps.length - 1 ? <span className={`absolute left-5 top-10 h-[calc(100%-24px)] w-0.5 md:left-[calc(50%+20px)] md:top-5 md:h-0.5 md:w-[calc(100%-40px)] ${step.complete && steps[index + 1].complete ? "bg-green-600" : "bg-outline-variant"}`} /> : null}
            <span className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full ${step.complete ? "bg-green-600 text-white" : "bg-surface-container text-on-surface-variant"} ${step.current ? "ring-4 ring-green-100" : ""}`}><Icon size={18} /></span>
            <div><p className="font-bold">{step.label} {step.complete ? "✓" : ""}</p>{dates[index] ? <p className="text-xs text-on-surface-variant">{dates[index]}</p> : null}{step.current ? <p className="text-xs text-green-700">Current status</p> : null}</div>
          </li>;
        })}
      </ol>
    </div>
  );
}
