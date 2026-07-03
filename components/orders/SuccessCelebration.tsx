"use client";

import { Check } from "lucide-react";

export function SuccessCelebration() {
  return (
    <div className="relative mx-auto grid h-28 w-28 place-items-center" aria-hidden="true">
      <div className="absolute inset-2 animate-ping rounded-full bg-green-200 opacity-60" />
      <div className="relative grid h-24 w-24 place-items-center rounded-full bg-green-600 text-white shadow-hover">
        <Check size={50} strokeWidth={3} />
      </div>
      {Array.from({ length: 16 }, (_, index) => (
        <span
          key={index}
          className="absolute h-2 w-1 animate-bounce rounded-sm"
          style={{
            backgroundColor: ["#780b22", "#d4a017", "#16a34a", "#2563eb"][index % 4],
            left: `${8 + (index * 31) % 88}%`,
            top: `${(index * 47) % 100}%`,
            animationDelay: `${(index % 8) * 90}ms`,
            animationDuration: `${700 + (index % 5) * 120}ms`
          }}
        />
      ))}
    </div>
  );
}

