import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { ArrowRight, Inbox } from "lucide-react";

type Icon = ComponentType<{ size?: number; className?: string }>;

export function AdminPageHeader({
  kicker,
  title,
  description,
  action
}: {
  kicker: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{kicker}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function AdminCard({
  children,
  className = "",
  padded = true
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] ${padded ? "p-5" : ""} ${className}`}>
      {children}
    </section>
  );
}

export function AdminStatCard({
  label,
  value,
  meta,
  href,
  icon: IconComponent,
  tone = "amber"
}: {
  label: string;
  value: ReactNode;
  meta?: string;
  href?: string;
  icon: Icon;
  tone?: "amber" | "blue" | "green" | "rose" | "slate";
}) {
  const tones = {
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    slate: "bg-slate-100 text-slate-700 ring-slate-200"
  };
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className={`grid size-11 place-items-center rounded-xl ring-1 ${tones[tone]}`}>
          <IconComponent size={20} />
        </span>
        {href ? <ArrowRight size={16} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-amber-600" /> : null}
      </div>
      <p className="mt-5 text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</p>
      {meta ? <p className="mt-2 text-xs font-semibold text-slate-500">{meta}</p> : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]">
        {content}
      </Link>
    );
  }

  return <AdminCard>{content}</AdminCard>;
}

export function AdminStatusBadge({
  children,
  tone = "slate"
}: {
  children: ReactNode;
  tone?: "slate" | "green" | "amber" | "red" | "blue" | "purple";
}) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-800 ring-amber-200",
    red: "bg-red-50 text-red-700 ring-red-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    purple: "bg-violet-50 text-violet-700 ring-violet-200"
  };

  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-black ring-1 ${tones[tone]}`}>{children}</span>;
}

export function AdminEmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm">
        <Inbox size={22} />
      </div>
      <h2 className="mt-4 text-lg font-black text-slate-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function AdminTableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
