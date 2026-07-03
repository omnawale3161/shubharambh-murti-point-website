"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Search } from "lucide-react";

const GlobalSearchDialog = dynamic(
  () => import("@/components/GlobalSearchDialog").then((module) => module.GlobalSearchDialog),
  { ssr: false }
);

export function GlobalSearch({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={mobile
          ? "rounded-xl px-3 py-2 text-left hover:bg-beige"
          : "btn-icon btn-icon-circle"}
      >
        {mobile ? "Search" : <Search size={19} />}
      </button>
      {open ? <GlobalSearchDialog onClose={() => setOpen(false)} /> : null}
    </>
  );
}
