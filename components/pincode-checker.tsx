"use client";

import { useEffect, useId, useState } from "react";
import { LoaderCircle, MapPin, XCircle } from "lucide-react";
import type { DeliveryAvailability } from "@/lib/delivery/pincode";
import { indianPincodePattern } from "@/lib/delivery/pincode";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "result"; delivery: DeliveryAvailability };

export function PincodeChecker({ compact = false }: { compact?: boolean }) {
  const id = useId();
  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    if (!indianPincodePattern.test(pincode)) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setStatus({ kind: "loading" });
      try {
        const response = await fetch(`/api/delivery/pincode/${pincode}`, { signal: controller.signal });
        const body = await response.json() as DeliveryAvailability & { error?: string };
        if (!response.ok) throw new Error(body.error || "Could not check delivery availability.");
        setStatus({ kind: "result", delivery: body });
      } catch (error) {
        if (controller.signal.aborted) return;
        setStatus({ kind: "error", message: error instanceof Error ? error.message : "Could not check delivery availability." });
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [pincode]);

  const resultId = `${id}-result`;
  function updatePincode(value: string) {
    const nextPincode = value.replace(/\D/g, "").slice(0, 6);
    setPincode(nextPincode);
    setStatus(
      !nextPincode
        ? { kind: "idle" }
        : indianPincodePattern.test(nextPincode)
          ? { kind: "loading" }
          : { kind: "error", message: "Enter a valid Indian 6-digit PIN code." }
    );
  }

  return (
    <div className={compact ? "grid gap-3" : "rounded-2xl border border-gold/20 bg-white/80 p-5"}>
      <label htmlFor={id} className="grid gap-2 text-sm font-black text-ink/70">
        Check delivery by PIN code
        <div className="relative">
          <MapPin aria-hidden="true" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-maroon" />
          <input
            id={id}
            name="delivery-pincode"
            autoComplete="postal-code"
            aria-describedby={resultId}
            value={pincode}
            onChange={(event) => updatePincode(event.target.value)}
            inputMode="numeric"
            pattern="[1-9][0-9]{5}"
            maxLength={6}
            placeholder="Enter 6-digit PIN code"
            className="min-h-12 w-full rounded-full border border-gold/25 bg-ivory py-3 pl-11 pr-5 text-base font-semibold outline-hidden transition focus:border-maroon"
          />
        </div>
      </label>

      <div id={resultId} aria-live="polite" className="min-h-6 text-sm font-semibold leading-6">
        {status.kind === "idle" ? <p className="text-ink/68">Enter your PIN code to check delivery availability.</p> : null}
        {status.kind === "loading" ? <p className="flex items-center gap-2 text-ink/68"><LoaderCircle aria-hidden="true" size={17} className="animate-spin" />Checking delivery availability...</p> : null}
        {status.kind === "error" ? <p className="flex items-start gap-2 text-error"><XCircle aria-hidden="true" size={17} className="mt-1 shrink-0" />{status.message}</p> : null}
        {status.kind === "result" && status.delivery.available ? (
          <div className="text-green-700">
            <p className="font-black">Delivery available across India</p>
            <p className="mt-1 text-ink/68">District: {status.delivery.district} · Post Office: {status.delivery.postOffice}</p>
          </div>
        ) : null}
        {status.kind === "result" && !status.delivery.available ? (
          <div className="text-error">
            <p className="font-black">Delivery details need confirmation</p>
            <p className="mt-1 text-ink/68">Detected location: {status.delivery.district}, {status.delivery.state} · {status.delivery.postOffice}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
