"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const storageKey = "shubharambh-announcement-dismissed";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- Dismissed state is browser-only and must load after hydration. */
  useEffect(() => {
    setVisible(window.localStorage.getItem(storageKey) !== "true");
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!visible) return null;

  return (
    <div className="relative z-[60] bg-primary-container px-10 py-2 text-center text-xs font-bold text-on-primary sm:px-12">
      <p className="truncate">🚚 Free Delivery Across India • Secure Packaging • Razorpay Secured Payments</p>
      <button
        type="button"
        aria-label="Dismiss announcement"
        onClick={() => {
          window.localStorage.setItem(storageKey, "true");
          setVisible(false);
        }}
        className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full hover:bg-white/10 sm:right-4"
      >
        <X size={14} />
      </button>
    </div>
  );
}
